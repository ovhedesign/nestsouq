import { getDb } from "@/lib/mongodb-admin";
import { NextResponse } from "next/server";
import { admin } from "@/lib/firebase-admin"; // Import Firebase Admin

export async function GET(req) {
  console.log("User Data API hit.");
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    console.log("Received UID:", uid);

    if (!uid) {
      console.log("UID is missing.");
      return NextResponse.json({ error: "UID is required" }, { status: 400 });
    }

    // connect to the right DB
    const db = await getDb("nestsouq");
    const usersCollection = db.collection("user_data"); // correct collection name

    const user = await usersCollection.findOne({ uid: uid });

    if (!user) {
      console.log("User not found in DB. Attempting to create new user.");
      // User not found, create a new one
      let firebaseUser = null;
      try {
        firebaseUser = await admin.auth().getUser(uid);
        console.log("Fetched user from Firebase:", firebaseUser.uid);
      } catch (firebaseError) {
        console.error("Error fetching user from Firebase:", firebaseError);
        return NextResponse.json({ error: "User not found in Firebase" }, { status: 404 });
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
      console.log("New user object to insert:", newUser);
      await usersCollection.insertOne(newUser);
      console.log("New user inserted into DB.");
      return NextResponse.json(newUser);
    }

    console.log("User found in DB:", user.uid);
    return NextResponse.json(user);
  } catch (error) {
    console.error("User Data API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
