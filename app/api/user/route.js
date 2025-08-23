import { getDb } from "@/lib/mongodb-admin";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { uid, email, displayName, photoURL } = await req.json();

    const db = await getDb();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ uid: uid });

    if (!user) {
      await usersCollection.insertOne({
        uid: uid,
        email: email,
        displayName: displayName,
        photoURL: photoURL,
        credits: 10,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}