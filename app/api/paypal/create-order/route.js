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

export async function POST(req) {
  try {
    const { planId } = await req.json();

    // Fetch plan details from MongoDB
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

    const endpointBase =
      process.env.PAYPAL_ENV === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    // Use OAuth token (Bearer)
    const accessToken = await getPayPalAccessToken(endpointBase);

    // Create PayPal order
    const res = await fetch(`${endpointBase}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: parseFloat(plan.price).toFixed(2),
            },
          },
        ],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("PayPal create order failed:", res.status, data);
      return new Response(JSON.stringify({ success: false, error: data }), {
        status: res.status || 500,
      });
    }

    if (!data?.id) {
      console.error("PayPal create order returned no id:", data);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid PayPal response" }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ orderID: data.id }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500 }
    );
  }
}
