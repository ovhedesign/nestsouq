import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { orderID, uid, planId } = await req.json();

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

    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const endpointBase =
      process.env.PAYPAL_ENV === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    const res = await fetch(
      `${endpointBase}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
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

    // PayPal returns status 'COMPLETED' for captured orders
    if (data.status === "COMPLETED" || data.status === "COMPLETED") {
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + planDurationDays);

      await db.collection("user_data").updateOne(
        { uid },
        {
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
          $inc: { credits: plan.imageCredits || 0 },
        },
        { upsert: true }
      );

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
