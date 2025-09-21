import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("nestsouq");
    const plans = await db.collection("plans").find({}).toArray();

    const plansWithCredits = plans.map((plan) => {
      let credits = 0;
      if (plan.price === 5) {
        credits = 1000;
      } else if (plan.price === 9) {
        credits = 2500;
      } else if (plan.price === 15) {
        credits = 5000;
      }
      return { ...plan, credits };
    });

    return new Response(
      JSON.stringify({ success: true, data: plansWithCredits }),
      {
        status: 200,
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        status: 500,
      }
    );
  }
}
