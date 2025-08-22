export const ACCEPTED = ["image/jpeg", "image/png", "image/svg+xml"];
export const isRaster = (type) => ["image/jpeg", "image/png"].includes(type);

export function parseMetadata(text) {
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
