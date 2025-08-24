import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

if (!mongoose.connection.readyState) {
  mongoose.connect(MONGODB_URI);
}

// Define Plan schema (adjust to match your DB)
const planSchema = new mongoose.Schema({
  name: String,
  price: Number,
  features: [String],
});

const Plan = mongoose.models.Plan || mongoose.model("Plan", planSchema);

export async function GET(req, { params }) {
  const { planId } = params;

  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return NextResponse.json(
        { success: false, message: "Invalid Plan ID" },
        { status: 400 }
      );
    }

    const plan = await Plan.findById(planId);

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: plan });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
