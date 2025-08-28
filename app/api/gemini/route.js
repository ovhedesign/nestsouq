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

async function convertFile(buffer, file, locale) {
  const fileExtension = file.name?.split(".").pop()?.toLowerCase();
  const mimeType = file.type;

  // Already JPG → skip
  if (mimeType === "image/jpeg" || ["jpg", "jpeg"].includes(fileExtension)) {
    return { buffer, mimeType: "image/jpeg" };
  }

  // Temp input file
  const tmpInput = tmp.fileSync({ postfix: `.${fileExtension}` });
  await fs.promises.writeFile(tmpInput.name, buffer);

  // Temp output always JPG
  const tmpOutput = tmp.fileSync({ postfix: ".jpg" });
  let cmd;

  const isWin = process.platform === "win32";

  try {
    if (
      fileExtension === "svg" ||
      ["png", "bmp", "tif", "tiff"].includes(fileExtension)
    ) {
      cmd = isWin
        ? `magick convert "${tmpInput.name}" "${tmpOutput.name}"`
        : `magick "${tmpInput.name}" "${tmpOutput.name}"`;
    } else if (fileExtension === "eps") {
      cmd = isWin
        ? `gswin64c -dSAFER -dBATCH -dNOPAUSE -sDEVICE=jpeg -r300 -sOutputFile="${tmpOutput.name}" "${tmpInput.name}"`
        : `gs -dSAFER -dBATCH -dNOPAUSE -sDEVICE=jpeg -r300 -sOutputFile="${tmpOutput.name}" "${tmpInput.name}"`;
    } else {
      throw new Error(t("unsupportedFileType", locale));
    }

    await execAsync(cmd);

    const outputBuffer = await fs.promises.readFile(tmpOutput.name);
    return { buffer: outputBuffer, mimeType: "image/jpeg" };
  } catch (err) {
    console.error("Conversion failed:", err);
    throw new Error(t("fileConversionFailed", locale));
  } finally {
    tmpInput.removeCallback();
    tmpOutput.removeCallback();
  }
}

function parseMetadata(text) {
  const titleMatch = text.match(/Title:\s*(.+)/i);
  const keywordsMatch = text.match(
    /Keywords:\s*([\s\S]+?)\n(?:Description:|Category:)/
  );
  const descMatch = text.match(/Description:\s*([\s\S]+?)(?:\nCategory:|\n?$)/);
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

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        { error: "No valid file uploaded" },
        { status: 400 }
      );
    }
    if (!uid) {
      return NextResponse.json({ error: "UID is required" }, { status: 403 });
    }

    const initialBuffer = Buffer.from(await file.arrayBuffer());
    const { buffer: convertedBuffer, mimeType: finalMimeType } =
      await convertFile(initialBuffer, file, locale);

    const base64Image = convertedBuffer.toString("base64");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const languageInstruction = locale === "ar" ? "in Arabic" : "in English";
    const prompt = `Analyze this ${finalMimeType} image and generate comprehensive metadata for ${mode} mode ${languageInstruction}.

Respond EXACTLY in this format:
Title: <title>
Keywords: <comma-separated keywords>
Description: <description>
Category: <comma-separated categories>
`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType: finalMimeType } },
    ]);

    const responseText = result.response.text();
    const meta = parseMetadata(responseText);

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

    const newCredits = user.credits - 1;
    await usersCollection.updateOne({ uid }, { $set: { credits: newCredits } });

    return NextResponse.json({
      metadata: {
        filename: file.name || "uploaded_file",
        finalMimeType,
        ...meta,
      },
      rawResponse: responseText,
      credits: newCredits,
    });
  } catch (error) {
    console.error("Error processing files:", error);
    return NextResponse.json(
      { error: t("fileConversionFailed", "en"), details: error.message },
      { status: 500 }
    );
  }
}
