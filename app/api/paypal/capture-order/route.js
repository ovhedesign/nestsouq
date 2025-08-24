import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { orderID, uid, planId, planPrice, planDurationDays } =
      await req.json();

    // PayPal auth
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    // Capture the order
    const res = await fetch(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (data.status === "COMPLETED") {
      const client = await clientPromise;
      const db = client.db("yourDBName"); // replace with your DB name

      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + planDurationDays); // e.g., 30 days

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
          $inc: { credits: planPrice }, // optional
        }
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
