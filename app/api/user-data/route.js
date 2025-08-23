import { getDb } from "@/lib/mongodb-admin";
import { NextResponse } from "next/server";
import { admin } from "@/lib/firebase-admin";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ error: "UID is required" }, { status: 400 });
    }

    const db = await getDb("nestsouq");
    const usersCollection = db.collection("user_data");

    let user = await usersCollection.findOne({ uid: uid });

    if (!user) {
      let firebaseUser;
      try {
        firebaseUser = await admin.auth().getUser(uid);
      } catch (firebaseError) {
        console.error("Error fetching user from Firebase:", firebaseError);
        return NextResponse.json(
          { error: "User not found in Firebase" },
          { status: 404 }
        );
      }

      const newUser = {
        uid: uid,
        name: firebaseUser.displayName || "New User",
        photo: firebaseUser.photoURL || null,
        credits: 10, // Initial credits for new users
        isPremium: false,
        expireDate: null,
        paymentInfo: null,
        createdAt: new Date(),
      };

      await usersCollection.insertOne(newUser);
      user = newUser;
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("User Data API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}