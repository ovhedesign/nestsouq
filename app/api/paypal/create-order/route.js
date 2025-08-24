import fetch from "node-fetch";

export async function POST(req) {
  const { planId } = await req.json();

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
        purchase_units: [{ amount: { currency_code: "USD", value: "9.99" } }],
      }),
    }
  );

  const data = await res.json();
  return new Response(JSON.stringify({ orderID: data.id }), { status: 200 });
}
