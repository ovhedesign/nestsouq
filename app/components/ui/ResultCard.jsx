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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const statusColor = fileData.ok ? "text-green-400" : "text-red-400";
  const statusIcon = fileData.ok ? (
    <CheckCircle2 className="w-5 h-5" />
  ) : (
    <AlertTriangle className="w-5 h-5" />
  );

  return (
    <div
      className={`p-5 rounded-2xl shadow-xl border transition-all flex flex-col h-full bg-gray-900 border-gray-700 hover:border-gray-600`}
    >
      {/* File Header */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-800">
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
                {fileData.ok ? "Success" : "Error"}
              </span>
              <span className="text-gray-500">• {fileData.engine} Engine</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {fileData.ok && (
            <motion.button
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 transition w-full sm:w-auto justify-center"
              title="Download CSV"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-5 h-5" />
              <span className="font-medium">CSV</span>
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
            <div className="mt-4 space-y-6 text-gray-300">
              {/* Image Preview (Now inside expanded section) */}
              {preview?.url && (
                <div className="flex justify-center mb-4">
                  <img
                    src={preview.url}
                    alt={fileData.file}
                    className="max-h-40 rounded-xl border border-gray-700 object-contain shadow-lg"
                  />
                </div>
              )}

              {mode === "meta" && (
                <div className="space-y-5">
                  {/* Title */}
                  <FieldCard
                    label="Title"
                    value={fileData.meta.title}
                    field="title"
                    copiedField={copiedField}
                    copyToClipboard={copyToClipboard}
                    className="bg-blue-900/10 border-blue-600/50"
                  />

                  {/* Keywords */}
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

                  {/* Description */}
                  <FieldCard
                    label="Description"
                    value={fileData.meta.description}
                    field="desc"
                    copiedField={copiedField}
                    copyToClipboard={copyToClipboard}
                    className="bg-gray-800/50 border-gray-700"
                  />

                  {/* Category */}
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
                    value={fileData.prompt}
                    field="prompt"
                    copiedField={copiedField}
                    copyToClipboard={copyToClipboard}
                    className="bg-amber-900/10 border-amber-600/50"
                    isPrompt
                  />
                </div>
              )}
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
