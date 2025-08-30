"use client";

import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Copy,
  Check,
  X,
  Download,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ResultCard({
  mode,
  fileData,
  preview,
  index,
  onRemove,
  platform,
}) {
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

  const handleDownloadCSV = (platform) => {
    let csvContent = "";
    let filename;

    if (mode === "meta" && fileData.meta) {
      const { title, keywords, description, category } = fileData.meta;
      const filenameWithoutExt =
        fileData.file.split(".").slice(0, -1).join(".") || fileData.file;
      let headers = [];
      let row = [];
      filename = `${platform}_${fileData.file}.csv`;

      switch (platform) {
        case "shutterstock":
          headers = [
            "Filename",
            "Description",
            "Keywords",
            "Categories",
            "Releases",
          ];
          row = [
            `"${filenameWithoutExt}"`,
            `"${title || ""}"`,
            `"${(keywords || []).join(",")}"`,
            `"${(category || []).join(", ")}"`,
            `""`,
          ];
          break;
        case "freepik":
          headers = ["Filename", "Title", "Keywords"];
          row = [
            `"${filenameWithoutExt}.jpg"`,
            `"${title || ""}"`,
            `"${(keywords || []).join(",")}"`,
          ];
          break;
        case "vecteezy":
          headers = [
            "Filename",
            "Title",
            "Description",
            "Keywords",
            "Image Type",
          ];
          row = [
            `"${filenameWithoutExt}"`,
            `"${title || ""}"`,
            `"${description || ""}"`,
            `"${(keywords || []).join(",")}"`,
            `"Photo"`,
          ];
          break;
        case "adobestock":
          headers = ["Filename", "Title", "Keywords", "Description"];
          row = [
            `"${filenameWithoutExt}"`,
            `"${title || ""}"`,
            `"${(keywords || []).join(",")}"`,
            `"${description || ""}"`,
          ];
          break;
        default:
          headers = ["Title", "Keywords", "Description", "Category"];
          row = [
            `"${title || ""}"`,
            `"${(keywords || []).join(", ")}"`,
            `"${description || ""}"`,
            `"${(category || []).join(", ")}"`,
          ];
          filename = `${fileData.file}.csv`;
          break;
      }
      csvContent = `${headers.join(",")}\n${row.join(",")}`;
    } else if (mode === "prompt" && fileData.prompt) {
      const headers = ["Prompt"];
      const row = [`"${fileData.prompt}"`];
      csvContent = `${headers.join(",")}\n${row.join(",")}`;
      filename = `prompt_${fileData.file}.csv`;
    }

    if (!csvContent) return;

    // <-- Fix: Add BOM for Arabic/UTF-8 support
    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });
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

  const handleDownloadText = (text, filename) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      link.setAttribute("href", URL.createObjectURL(blob));
      link.setAttribute("download", `${filename}.txt`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isProcessing = fileData.ok === null;
  const isSuccess = fileData.ok === true;

  let statusIcon, statusText, statusColor;

  if (isProcessing) {
    statusIcon = <Loader2 className="w-5 h-5 animate-spin" />;
    statusText = "Processing";
    statusColor = "text-amber-400";
  } else if (isSuccess) {
    statusIcon = <CheckCircle2 className="w-5 h-5" />;
    statusText = "Success";
    statusColor = "text-green-400";
  } else {
    statusIcon = <AlertTriangle className="w-5 h-5" />;
    statusText = "Error";
    statusColor = "text-red-400";
  }

  return (
    <div
      className={`p-5 rounded-2xl shadow-xl border transition-all flex flex-col h-full bg-gray-900 border-gray-700 hover:border-gray-600`}
    >
      {/* File Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-3 flex-grow min-w-0">
          <motion.button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            {expanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </motion.button>

          <div className="flex flex-col flex-grow min-w-0">
            <span className="text-xl font-bold truncate text-gray-100">
              {fileData.file}
            </span>
            <div className="flex items-center gap-2 mt-1 text-sm">
              <span className={`flex items-center gap-1 ${statusColor}`}>
                {statusIcon}
                {statusText}
              </span>
              <span className="text-gray-500">• {fileData.engine} Engine</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {fileData.ok && mode === "meta" && platform && (
            <motion.button
              onClick={() => handleDownloadCSV(platform)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 transition w-full sm:w-auto justify-center"
              title={`Download ${platform} CSV`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-5 h-5" />
              <span className="font-medium capitalize">{platform} CSV</span>
            </motion.button>
          )}
          {fileData.ok && mode === "prompt" && (
            <motion.button
              onClick={() => handleDownloadText(fileData.prompt, fileData.file)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 transition w-full sm:w-auto justify-center"
              title="Download Prompt Text"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-5 h-5" />
              <span className="font-medium">Text</span>
            </motion.button>
          )}
          <motion.button
            onClick={() =>
              copyToClipboard(
                mode === "meta"
                  ? JSON.stringify(fileData.meta, null, 2)
                  : fileData.prompt,
                "full"
              )
            }
            className="p-2 bg-gray-800 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white transition"
            title="Copy full data"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {copiedField === "full" ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Check className="w-5 h-5 text-green-400" />
              </motion.div>
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </motion.button>
          <motion.button
            onClick={() => onRemove(index)}
            className="p-2 bg-red-700/50 text-red-400 rounded-full hover:bg-red-600/50 transition"
            title="Remove"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Expanded Body */}
      <AnimatePresence>
        {expanded && fileData.ok && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              {/* Image Preview */}
              {preview && (
                <div className="md:col-span-1 flex justify-center items-start">
                  <img
                    src={typeof preview === "string" ? preview : preview.url}
                    alt={fileData.file || "preview"}
                    className="max-h-48 w-full object-contain rounded-xl border border-gray-700 shadow-lg"
                    onError={(e) => {
                      e.currentTarget.src = "/fallback.png";
                    }}
                  />
                </div>
              )}

              {/* Metadata/Prompt Section */}
              <div
                className={`space-y-5 text-gray-300 ${
                  preview ? "md:col-span-2" : "md:col-span-3"
                }`}
              >
                {mode === "meta" && (
                  <div className="space-y-5">
                    <FieldCard
                      label="Title"
                      value={fileData.meta.title}
                      field="title"
                      copiedField={copiedField}
                      copyToClipboard={copyToClipboard}
                      className="bg-blue-900/10 border-blue-600/50"
                    />

                    {mode === "meta" && (
                      <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-blue-400">
                            Keywords ({fileData.meta.keywords?.length || 0})
                          </h4>
                          <CopyButton
                            field="keywords"
                            value={(fileData.meta.keywords || []).join(", ")}
                            copiedField={copiedField}
                            copyToClipboard={copyToClipboard}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {fileData.meta.keywords?.length ? (
                            fileData.meta.keywords.map((k, i) => (
                              <span
                                key={i}
                                className="bg-blue-900/50 text-blue-200 px-3 py-1 rounded-full text-sm"
                              >
                                {k}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-400">No keywords</p>
                          )}
                        </div>
                      </div>
                    )}

                    <FieldCard
                      label="Description"
                      value={fileData.meta.description}
                      field="desc"
                      copiedField={copiedField}
                      copyToClipboard={copyToClipboard}
                      className="bg-gray-800/50 border-gray-700"
                    />

                    {fileData.meta.category && (
                      <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-purple-400 mb-2">
                          Category
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {fileData.meta.category.map((cat, i) => (
                            <span
                              key={i}
                              className="bg-purple-900/50 text-purple-200 px-3 py-1 rounded-full text-sm"
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
                  <div className="space-y-4">
                    <FieldCard
                      label="Generated Prompt"
                      value={fileData.prompt || "No generated prompt available"} // fallback
                      field="prompt"
                      copiedField={copiedField}
                      copyToClipboard={copyToClipboard}
                      className="bg-amber-900/10 border-amber-600/50"
                      isPrompt
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Reusable component for fields
const CopyButton = ({ field, value, copiedField, copyToClipboard }) => (
  <motion.button
    onClick={() => copyToClipboard(value, field)}
    className="p-1 rounded-full text-gray-400 hover:text-white transition"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
  >
    {copiedField === field ? (
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
        <Check className="w-4 h-4 text-green-400" />
      </motion.div>
    ) : (
      <Copy className="w-4 h-4" />
    )}
  </motion.button>
);

// Reusable component for Field Cards
const FieldCard = ({
  label,
  value,
  field,
  copiedField,
  copyToClipboard,
  className,
  isPrompt,
}) => (
  <div className={`p-4 rounded-lg border ${className}`}>
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-sm font-semibold text-blue-400">{label}</h4>
      <CopyButton
        field={field}
        value={value}
        copiedField={copiedField}
        copyToClipboard={copyToClipboard}
      />
    </div>
    <p
      className={`${
        isPrompt ? "font-mono whitespace-pre-wrap" : "text-lg"
      } break-words text-gray-100`}
    >
      {value || `No ${label.toLowerCase()} available`}
    </p>
  </div>
);
