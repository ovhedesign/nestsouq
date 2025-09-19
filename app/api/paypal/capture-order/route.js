import fetch from "node-fetch";
import clientPromise from "@/lib/mongodb";

async function getPayPalAccessToken(endpointBase) {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");
  const tokenRes = await fetch(`${endpointBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData?.access_token) {
    console.error(
      "Failed to get PayPal access token:",
      tokenRes.status,
      tokenData
    );
    throw new Error("Failed to get PayPal access token");
  }
  return tokenData.access_token;
}

function isCaptureCompleted(data) {
  // Top-level status may be COMPLETED
  if (data?.status === "COMPLETED") return true;
  // Or check nested captures
  if (Array.isArray(data?.purchase_units)) {
    for (const pu of data.purchase_units) {
      const captures = pu?.payments?.captures;
      if (Array.isArray(captures)) {
        for (const c of captures) {
          if (c.status === "COMPLETED") return true;
        }
      }
    }
  }
  return false;
}

export async function POST(req) {
  try {
    const { orderID, uid, email, planId } = await req.json();

    const client = await clientPromise;
    const db = client.db("nestsouq");
    const plan = await db
      .collection("plans")
      .findOne({ planId: { $regex: new RegExp(planId, "i") } });

    if (!plan) {
      return new Response(
        JSON.stringify({ success: false, error: "Plan not found" }),
        {
          status: 404,
        }
      );
    }

    const planPrice = plan.price;
    const planDurationDays = plan.durationDays || 30;

    // Determine credits to add: check multiple possible field names, fall back to sensible default
    let creditsToAdd =
      Number(
        plan.imageCredits ??
          plan.credits ??
          plan.imageCredit ??
          plan.credit ??
          plan.totalCredits ??
          0
      ) || 0;

    // If still zero, fallback: use price as a proxy (1 credit per currency unit) to avoid giving 0 credits
    if (!creditsToAdd || creditsToAdd <= 0) {
      const priceNum = Number(planPrice) || 0;
      creditsToAdd = priceNum > 0 ? Math.max(1, Math.floor(priceNum)) : 1;
      console.warn(
        `Plan ${plan.planId} had no explicit credits field. Falling back to creditsToAdd=${creditsToAdd}`
      );
    }

    console.log("Credits to add for plan:", plan.planId, creditsToAdd);

    const endpointBase =
      process.env.PAYPAL_ENV === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    // Get OAuth token and capture with Bearer
    const accessToken = await getPayPalAccessToken(endpointBase);

    const res = await fetch(
      `${endpointBase}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("PayPal capture failed:", res.status, data);
      return new Response(JSON.stringify({ success: false, error: data }), {
        status: res.status || 400,
      });
    }

    if (isCaptureCompleted(data)) {
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + planDurationDays);

      // Build a filter that tries to find the real user doc.
      let filter = null;
      if (uid) {
        filter = { uid }; // matches your existing uid field
      } else if (email) {
        filter = { email }; // fall back to email if that's what's stored
      } else {
        // No identifier provided
        return new Response(
          JSON.stringify({
            success: false,
            error: "No user identifier provided",
          }),
          { status: 400 }
        );
      }

      const updateDoc = {
        $set: {
          isPremium: true,
          expireDate,
          paymentInfo: {
            orderID,
            planId,
            amount: planPrice,
            capturedAt: new Date(),
          },
        },
        $inc: { credits: Number(creditsToAdd) },
      };

      // Do not upsert blindly if that can create incorrect docs; keep upsert true only if desired
      const updateRes = await db
        .collection("user_data")
        .updateOne(filter, updateDoc, { upsert: false });

      console.log("PayPal capture - update result:", {
        matchedCount: updateRes.matchedCount,
        modifiedCount: updateRes.modifiedCount,
        creditsAdded: creditsToAdd,
        filter,
      });

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ success: false, data }), {
      status: 400,
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      {
        status: 500,
      }
    );
  }
}
