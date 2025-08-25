import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
// import sharp from "sharp"; // Removed
import { getDb } from "@/lib/mongodb-admin";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ----------- Helper: Metadata Parser ----------- 
function parseMetadata(text) {
  const titleMatch = text.match(/Title:\s*(.+)/i);
  const keywordsMatch = text.match(
    /Keywords:\s*([\s\S]+?)\n(?:Description:|Category:)/i
  );
  const descMatch = text.match(
    /Description:\s*([\s\S]+?)(?:\nCategory:|\n?$)/i
  );
  const categoryMatch = text.match(/Category:\s*([\s\S]+)/i);

  const keywords = keywordsMatch
    ? keywordsMatch[1]
        .split(/,|\n|•|-/)
        .map((k) => k.trim())
        .filter(Boolean)
    : [];

  const categories = categoryMatch
    ? categoryMatch[1]
        .split(/,|\n|•|-/)
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  return {
    title: titleMatch ? titleMatch[1].trim() : "No title available",
    keywords: keywords.length ? keywords : ["No keywords available"],
    description: descMatch ? descMatch[1].trim() : "No description available",
    category: categories.length ? categories : ["Uncategorized"],
  };
}

// ----------- API Route ----------- 
export async function POST(req) {
  try {
    if (!req.headers.get("content-type")?.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content-Type must be multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const uid = formData.get("uid");

    // Convert formData fields safely
    const mode = formData.get("mode") || "meta";
    const minTitle = Number(formData.get("minTitle")) || 6;
    const maxTitle = Number(formData.get("maxTitle")) || 18;
    const minKeywords = Number(formData.get("minKeywords")) || 43;
    const maxKeywords = Number(formData.get("maxKeywords")) || 48;
    const minDesc = Number(formData.get("minDesc")) || 12;
    const maxDesc = Number(formData.get("maxDesc")) || 30;

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        { error: "No valid file uploaded" },
        { status: 400 }
      );
    }

    if (!uid) {
      return NextResponse.json({ error: "UID is required" }, { status: 400 });
    }

    // ---- Convert uploaded file ----
    const arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);
    let mimeType = file.type || "image/jpeg";

    // Explicitly disallow SVG/EPS if sharp is removed
    if (
      mimeType === "image/svg+xml" ||
      file.name?.toLowerCase().endsWith(".svg") ||
      mimeType === "application/postscript" || // Assuming this is for EPS
      file.name?.toLowerCase().endsWith(".eps")
    ) {
      return NextResponse.json(
        { error: "SVG/EPS image processing is not supported." },
        { status: 400 }
      );
    }

    const base64Image = buffer.toString("base64");

    // ---- Initialize Gemini ----
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const contents = [
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      },
      {
        text: `Analyze this ${mimeType} image and generate comprehensive metadata for ${mode} mode.\n        \nRespond EXACTLY in this format:\nTitle: <title>\nKeywords: <comma-separated keywords>\nDescription: <description>\nCategory: <comma-separated categories>\n\nRequirements:\n- Title: ${minTitle}-${maxTitle} words\n- Keywords: ${minKeywords}-${maxKeywords} items\n- Description: ${minDesc}-${maxDesc} words\n- Be accurate and descriptive`,
      },
    ];

    // ---- Call Gemini ----
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-latest",
      contents: contents,
    });

    const resultText = response.text || "No response text";
    const meta = parseMetadata(resultText);

    // ---- Deduct Credit ----
    const db = await getDb("nestsouq");
    const usersCollection = db.collection("user_data");
    const user = await usersCollection.findOne({ uid: uid });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.credits < 1) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 403 }
      );
    }

    const newCredits = user.credits - 1;
    await usersCollection.updateOne(
      { uid: uid },
      { $set: { credits: newCredits } }
    );

    return NextResponse.json({
      metadata: {
        filename: file.name || "uploaded_file",
        mimeType: mimeType,
        ...meta,
      },
      prompt: `Image about "${meta.title}" with keywords: ${meta.keywords
        .slice(0, 3)
        .join(", ")}.`,
      rawResponse: resultText,
      credits: newCredits,
    });
  } catch (error) {
    console.error("Error processing files:", error);
    return NextResponse.json(
      { error: "Failed to process file", details: error.message },
      { status: 500 }
    );
  }
}

