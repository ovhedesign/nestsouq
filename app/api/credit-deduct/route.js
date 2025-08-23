import admin from "firebase-admin";

// Initialize Firebase Admin if not already
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

// Dummy in-memory store for credits (replace with real DB)
let userCredits = {}; // { uid: number }

export async function POST(req) {
  try {
    const body = await req.json();
    const amount = body.amount;

    if (!amount || typeof amount !== "number") {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        status: 400,
      });
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid token" }),
        { status: 401 }
      );
    }

    const idToken = authHeader.split(" ")[1];

    // Verify token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Deduct credit
    if (!userCredits[uid]) userCredits[uid] = 10; // default 10 credits
    if (userCredits[uid] < amount) {
      return new Response(JSON.stringify({ error: "Insufficient credits" }), {
        status: 403,
      });
    }

    userCredits[uid] -= amount;

    return new Response(
      JSON.stringify({
        message: "Credit deducted successfully",
        credits: userCredits[uid],
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Credit Deduct Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Server error" }),
      { status: 500 }
    );
  }
}
