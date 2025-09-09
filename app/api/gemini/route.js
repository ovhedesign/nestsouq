import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDb } from "@/lib/mongodb-admin";
import fs from "fs";
import { exec } from "child_process";
import tmp from "tmp";
import { promisify } from "util";
const execAsync = promisify(exec);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const translations = {
  en: {
    fileConversionFailed: "Image processing failed for the uploaded file.",
    unsupportedFileType: "Unsupported file type.",
  },
  ar: {
    fileConversionFailed: "فشل معالجة الصورة المرفوعة.",
    unsupportedFileType: "نوع الملف غير مدعوم.",
  },
};

const t = (key, loc) => {
  const lang = translations[loc] ? loc : "en";
  return translations[lang][key];
};

// ----------- Helper: Metadata Parser -----------
function parseMetadata(text, maxKeywords) {
  const titleMatch = text.match(/Title:\s*(.+)/i);
  const keywordsMatch = text.match(
    /Keywords:\s*([\s\S]+?)\n(?:Description:|Category:)/i
  );
  const descMatch = text.match(
    /Description:\s*([\s\S]+?)(?:\nCategory:|\n?$)/i
  );
  const categoryMatch = text.match(/Category:\s*([\s\S]+)/i);

  let keywords = keywordsMatch
    ? keywordsMatch[1]
        .split(/,|\n|\t/)
        .map((k) => k.trim())
        .filter(Boolean)
    : [];

  if (keywords.length > 0) {
    keywords = keywords.slice(0, maxKeywords);
  }

  const categories = categoryMatch
    ? categoryMatch[1]
        .split(/,|\n|\t/)
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

// ----------- File Conversion -----------
async function convertFile(buffer, file, locale) {
  const fileExtension = file.name?.split(".").pop()?.toLowerCase();
  const mimeType = file.type;

  if (mimeType === "image/jpeg" || ["jpg", "jpeg"].includes(fileExtension)) {
    return { buffer, mimeType: "image/jpeg" };
  }

  const tmpInput = tmp.fileSync({ postfix: `.${fileExtension}` });
  const tmpOutput = tmp.fileSync({ postfix: ".jpg" });
  await fs.promises.writeFile(tmpInput.name, buffer);

  let cmd;
  try {
    if (fileExtension === "eps") {
      cmd = `gs -dSAFER -dBATCH -dNOPAUSE -sDEVICE=jpeg -r300 -sOutputFile="${tmpOutput.name}" "${tmpInput.name}"`;
    } else if (
      ["png", "bmp", "tif", "tiff", "svg", "webp", "gif"].includes(
        fileExtension
      )
    ) {
      cmd = `magick "${tmpInput.name}" "JPEG:${tmpOutput.name}"`;
    } else {
      throw new Error(t("unsupportedFileType", locale));
    }

    await execAsync(cmd);
    const outputBuffer = await fs.promises.readFile(tmpOutput.name);
    return { buffer: outputBuffer, mimeType: "image/jpeg" };
  } catch (err) {
    console.error("Conversion failed for file:", file.name, "Error:", err);
    throw new Error(t("fileConversionFailed", locale));
  } finally {
    tmpInput.removeCallback();
    tmpOutput.removeCallback();
  }
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
    const locale = formData.get("locale") || "en";
    const mode = formData.get("mode") || "meta";

    // min/max settings for metadata
    const minTitle = Number(formData.get("minTitle")) || 6;
    const maxTitle = Number(formData.get("maxTitle")) || 18;
    const minKeywords = Number(formData.get("minKeywords")) || 10;
    const maxKeywords = Number(formData.get("maxKeywords")) || 20;
    const minDesc = Number(formData.get("minDesc")) || 12;
    const maxDesc = Number(formData.get("maxDesc")) || 30;

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        { error: "No valid file uploaded" },
        { status: 400 }
      );
    }
    if (!uid)
      return NextResponse.json({ error: "UID is required" }, { status: 403 });

    // ---- Convert uploaded file ----
    const initialBuffer = Buffer.from(await file.arrayBuffer());
    const { buffer: convertedBuffer, mimeType: finalMimeType } =
      await convertFile(initialBuffer, file, locale);

    const base64Image = convertedBuffer.toString("base64");

    // ---- Initialize Gemini ----
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const languageInstruction = locale === "ar" ? "in Arabic" : "in English";

    // ---- Prompt ----
    const prompt =
      mode === "meta"
        ? `Analyze this ${finalMimeType} image and generate accurate metadata ${languageInstruction}.

Respond EXACTLY in this format:
Title: <title>
Keywords: <comma-separated keywords>
Description: <description>
Category: <comma-separated categories>

Strictly follow these requirements:
- Title: MUST be between ${minTitle} and ${maxTitle} words.
- Keywords: MUST be between ${minKeywords} and ${maxKeywords} items.
- Description: MUST be between ${minDesc} and ${maxDesc} words.
- Category: MUST be between 1 and 3 relevant categories.
- Be factual, concise, and descriptive.`
        : "Analyze this image in detail. Describe objects, style, mood, and key attributes in few lines only that contains all relevant information about the image.";

    const result = await model.generateContent([
      { inlineData: { data: base64Image, mimeType: finalMimeType } },
      { text: prompt },
    ]);

    const responseText = result.response.text();
    const meta = mode === "meta" ? parseMetadata(responseText, maxKeywords) : {};

    // ---- Deduct Credits ----
    const db = await getDb("nestsouq");
    const usersCollection = db.collection("user_data");
    const user = await usersCollection.findOne({ uid });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.credits < 1)
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 403 }
      );

    await usersCollection.updateOne(
      { uid },
      { $set: { credits: user.credits - 1 } }
    );

    // ---- Response ----
    return NextResponse.json({
      metadata:
        mode === "meta"
          ? {
              filename: file.name || "uploaded_file",
              finalMimeType,
              ...meta,
            }
          : {},
      prompt:
        mode === "meta"
          ? `${meta.description}.`
          : responseText || "No generated prompt available",
      rawResponse: responseText,
      credits: user.credits - 1,
    });
  } catch (error) {
    console.error("Error processing files:", error);
    return NextResponse.json(
      { error: t("fileConversionFailed", "en"), details: error.message },
      { status: 500 }
    );
  }
}
