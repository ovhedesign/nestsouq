import fetch from "node-fetch";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  const { planId } = await req.json();

  // Fetch plan details from MongoDB
  const client = await clientPromise;
  const db = client.db("nestsouq");
  const plan = await db.collection("plans").findOne({ planId: { $regex: new RegExp(planId, "i") } });

  if (!plan) {
    return new Response(JSON.stringify({ success: false, error: "Plan not found" }), {
      status: 404,
    });
  }

  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  // Create PayPal order
  const res = await fetch(
    "https://api-m.sandbox.paypal.com/v2/checkout/orders",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{ amount: { currency_code: "USD", value: parseFloat(plan.price).toFixed(2) } }],
      }),
    }
  );

  const data = await res.json();
  return new Response(JSON.stringify({ orderID: data.id }), { status: 200 });
}
