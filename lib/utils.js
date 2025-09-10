export const ACCEPTED = [
  "image/jpeg",
  "image/png",
  "image/bmp",
  "image/gif",
  "image/webp",
  "image/tiff", // <-- Add this
  "image/x-eps", // <-- Add this (EPS)
  "application/postscript", // <-- Add this (EPS)
  "image/svg+xml", // <-- Add this (SVG)
];

export const isRaster = (type) =>
  ["image/jpeg", "image/png", "image/gif", "image/bmp", "image/tiff"].includes(
    type
  );

export function parseMetadata(text) {
  const titleMatch = text.match(/Title:(.*)/i);
  const keywordsMatch = text.match(/Keywords:(.*)/i);
  const descMatch = text.match(/Description:(.*)/i);
  const categoryMatch = text.match(/Category:(.*)/i);

  const keywords = keywordsMatch
    ? keywordsMatch[1]
        .split(/,|-|•/)
        .map((k) => k.trim())
        .filter(Boolean)
    : [];
  const categories = categoryMatch
    ? categoryMatch[1]
        .split(/,|-|•/)
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  return {
    title: titleMatch ? titleMatch[1].trim() : "No generated prompt available",
    keywords: keywords.length ? keywords : ["No generated prompt available"],
    description: descMatch
      ? descMatch[1].trim()
      : "No generated prompt available",
    category: categories.length
      ? categories
      : ["No generated prompt available"],
  };
}
