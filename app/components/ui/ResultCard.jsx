"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Copy, Check, X, Download } from "lucide-react";

export function ResultCard({ mode, fileData, preview, index, onRemove }) {
  const [expanded, setExpanded] = useState(true);
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text || "");
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleDownloadCSV = () => {
    let csvContent = "";
    let filename = `${fileData.file}.csv`;

    if (mode === "meta" && fileData.meta) {
      const { title, keywords, description, category } = fileData.meta;
      const headers = ["Title", "Keywords", "Description", "Category"];
      const row = [
        `"${title || ""}"`,
        `"${(keywords || []).join(", ")}"`,
        `"${description || ""}"`,
        `"${(category || []).join(", ")}"`,
      ];
      csvContent = `${headers.join(",")}\n${row.join(",")}`;
    } else if (mode === "prompt" && fileData.prompt) {
      const headers = ["Prompt"];
      const row = [`"${fileData.prompt}"`];
      csvContent = `${headers.join(",")}\n${row.join(",")}`;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      link.setAttribute("href", URL.createObjectURL(blob));
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div
      className={`p-5 rounded-2xl shadow-xl border transition-all flex flex-col h-full ${
        mode === "meta"
          ? "border-blue-500 bg-gradient-to-br from-gray-800 to-gray-900"
          : "border-amber-500 bg-gradient-to-br from-gray-900 to-gray-950"
      }`}
    >
      {/* File Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <div className="flex items-center gap-3 flex-grow">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-white"
          >
            {expanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {/* Image Preview */}
          {preview?.url && (
            <div className="relative flex-shrink-0">
              <img
                src={preview.url}
                alt={fileData.file}
                className="max-h-20 max-w-[90px] rounded-xl border border-gray-700 object-contain"
              />
              {fileData.ok && (
                <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1 shadow-md">
                  <Check className="w-3 h-3 text-white" title="Processed" />
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col flex-grow min-w-0">
            <span className="text-lg font-semibold truncate">
              {fileData.file}
            </span>
            <span className="text-xs text-gray-400">{fileData.engine}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {fileData.ok && (
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              title="Download CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          )}
          <button
            onClick={() =>
              copyToClipboard(
                mode === "meta"
                  ? JSON.stringify(fileData.meta, null, 2)
                  : fileData.prompt,
                "full"
              )
            }
            className="p-1 text-gray-400 hover:text-white transition"
            title="Copy full data"
          >
            {copiedField === "full" ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => onRemove(index)}
            className="p-1 text-gray-400 hover:text-red-400 transition"
            title="Remove"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Body */}
      {expanded && fileData.ok && (
        <>
          {mode === "meta" && (
            <div className="space-y-5 text-gray-200">
              {/* Title */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-blue-400">Title</h4>
                  <button
                    onClick={() =>
                      copyToClipboard(fileData.meta.title, "title")
                    }
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    {copiedField === "title" ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="bg-gray-700 p-3 rounded-lg text-lg break-words">
                  {fileData.meta.title || "No title available"}
                </p>
              </div>

              {/* Keywords */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-blue-400">
                    Keywords ({fileData.meta.keywords?.length || 0})
                  </h4>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        (fileData.meta.keywords || []).join(", "),
                        "keywords"
                      )
                    }
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    {copiedField === "keywords" ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {fileData.meta.keywords?.length ? (
                    fileData.meta.keywords.map((k, i) => (
                      <span
                        key={i}
                        className="bg-blue-900/70 text-blue-200 px-3 py-1 rounded-full text-sm"
                      >
                        {k}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400">No keywords</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-blue-400">
                    Description
                  </h4>
                  <button
                    onClick={() =>
                      copyToClipboard(fileData.meta.description, "desc")
                    }
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    {copiedField === "desc" ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="bg-gray-700 p-3 rounded-lg break-words">
                  {fileData.meta.description || "No description available"}
                </p>
              </div>

              {/* Category */}
              {fileData.meta.category && (
                <div>
                  <h4 className="text-sm font-semibold text-blue-400 mb-1">
                    Category
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {fileData.meta.category.map((cat, i) => (
                      <span
                        key={i}
                        className="bg-purple-900/70 text-purple-200 px-3 py-1 rounded-full text-sm"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === "prompt" && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-semibold text-amber-400">
                  Generated Prompt
                </h4>
                <button
                  onClick={() => copyToClipboard(fileData.prompt, "prompt")}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  {copiedField === "prompt" ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg font-mono whitespace-pre-wrap break-words text-gray-100">
                {fileData.prompt}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
