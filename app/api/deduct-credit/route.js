import { admin } from "@/lib/firebase-admin"; // Firebase admin instance
import { getDb } from "@/lib/mongodb-admin";
import { NextResponse } from "next/server";

export async function POST(req) {
  let session;

  try {
    // --- Auth header check ---
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // --- Request body check ---
    const { amount } = await req.json();
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid deduction amount" },
        { status: 400 }
      );
    }

    // --- DB and session ---
    const db = await getDb("nestsouq");
    const usersCollection = db.collection("user_data");

    session = db.client.startSession();
    session.startTransaction();

    const user = await usersCollection.findOne({ uid }, { session });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.credits < amount) {
      throw new Error("Insufficient credits");
    }

    await usersCollection.updateOne(
      { uid },
      { $inc: { credits: -amount } },
      { session }
    );

    await session.commitTransaction();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Credit deduction error:", error);

    let errorMessage = "An internal server error occurred.";
    let statusCode = 500;

    if (
      error.code === "auth/id-token-expired" ||
      error.code === "auth/argument-error"
    ) {
      errorMessage = "Invalid or expired authentication token.";
      statusCode = 401;
    } else if (
      error.message === "User not found" ||
      error.message === "Insufficient credits"
    ) {
      errorMessage = error.message;
      statusCode = 400;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  } finally {
    if (session) {
      session.endSession();
    }
  }
}
