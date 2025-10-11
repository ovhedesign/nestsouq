"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronUp,
  ChevronDown,
  Copy,
  Check,
  X,
  Download,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton"; // Add this import if you have a Skeleton component

export function ResultCard({
  mode,
  fileData,
  preview,
  index,
  onRemove,
  platform,
  totalFiles, // pass total files count from parent
  processedFiles, // pass processed count from parent
}) {
  const [expanded, setExpanded] = useState(true);
  const [copiedField, setCopiedField] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const cardRef = useRef(null);

  const isEps = fileData.file?.toLowerCase().endsWith(".eps");

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
    const key = (platform || "default").toLowerCase();

    const PLATFORM_HEADERS = {
      alamy: ["Filename", "Title", "Description", "Keywords"],
      dreamstime: ["Filename", "Title", "Description", "Keywords"],
      depositphotos: ["Filename", "Title", "Description", "Keywords"],
      vecteezy: ["Filename", "Title", "Description", "Keywords", "License"],
      freepik: ["File name", "Title", "Keywords"],
      "123rf": [
        "oldfilename",
        "123rf_filename",
        "description",
        "keywords",
        "country",
      ],
      shutterstock: [
        "Filename",
        "Description",
        "Keywords",
        "Categories",
        "Editorial",
        "Mature content",
        "illustration",
      ],
      adobestock: ["Filename", "Title", "Keywords"],
      default: ["Filename", "Title", "Keywords", "Description"],
    };

    const getExtFromName = (name) => {
      if (!name) return "jpg";
      const parts = name.split(".");
      if (parts.length > 1) {
        const ext = parts.pop().toLowerCase();
        if (ext.length >= 2 && ext.length <= 5) return ext;
      }
      return "jpg";
    };

    if (mode === "prompt" && fileData.prompt) {
      const headers = ["Prompt"];
      const row = [`"${(fileData.prompt || "").replace(/"/g, '""')}"`];
      csvContent = `${headers.join(",")}\n${row.join(",")}`;
    } else if (mode === "meta" && fileData.meta) {
      const headers = PLATFORM_HEADERS[key] || PLATFORM_HEADERS["default"];
      const rawName = fileData.file || "";
      const filenameWithoutExt =
        (rawName && rawName.split(".").slice(0, -1).join(".")) || rawName || "";
      const ext = getExtFromName(rawName);

      const row = headers.map((h) => {
        const key = (h || "").toLowerCase();
        switch (key) {
          case "filename":
            return `"${
              filenameWithoutExt || rawName
                ? `${filenameWithoutExt || rawName}.${ext}`
                : ""
            }"`;
          case "file name":
            return `"${
              filenameWithoutExt || rawName
                ? `${filenameWithoutExt || rawName}.${ext}`
                : ""
            }"`;
          case "title":
            return `"${(fileData.meta.title || "").replace(/"/g, '""')}"`;
          case "description":
            return `"${(fileData.meta.description || "").replace(/"/g, '""')}"`;
          case "keywords":
            return `"${(fileData.meta.keywords || [])
              .join(",")
              .replace(/"/g, '""')}"`;
          case "categories":
            const categories =
              platform?.toLowerCase() === "shutterstock"
                ? (fileData.meta.category || []).slice(0, 1)
                : fileData.meta.category || [];
            return `"${categories.join(",").replace(/"/g, '""')}"`;

          case "editorial":
          case "mature content":
          case "illustration":
          case "base-model":
            return '""';
          case "prompt":
            return `"${(fileData.prompt || "").replace(/"/g, '""')}"`;
          case "oldfilename":
            // oldfilename should preserve whatever raw filename was (including extension if present)
            return `"${rawName.replace(/"/g, '""')}"`;
          case "123rf_filename":
            return `"${
              filenameWithoutExt || rawName
                ? `${filenameWithoutExt || rawName}.${ext}`
                : ""
            }"`;
          case "country":
            return '""';
          case "license":
            return '"pro"';
          default:
            return '""';
        }
      });

      csvContent = `${headers.join(",")}\n${row.join(",")}`;
    }

    if (!csvContent) return;

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const filename = `${platform}.csv`;
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

  // 🔥 Auto-scroll down when processed
  useEffect(() => {
    if (fileData.ok !== null && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [fileData.ok]);

  // 🔥 Show modal when all files done
  useEffect(() => {
    if (processedFiles === totalFiles && totalFiles > 0) {
      setShowModal(true);
    }
  }, [processedFiles, totalFiles]);

  return (
    <>
      <div
        ref={cardRef}
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
                <span className="text-gray-500">
                  • {fileData.engine} Engine
                </span>
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
                onClick={() =>
                  handleDownloadText(fileData.prompt, fileData.file)
                }
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
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {isProcessing ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <div className="md:col-span-1 flex justify-center items-start">
                    <Skeleton className="h-48 w-full rounded-xl" />
                  </div>
                  <div className="md:col-span-2 space-y-5">
                    <Skeleton className="h-8 w-2/3 rounded" />
                    <Skeleton className="h-6 w-1/2 rounded" />
                    <Skeleton className="h-20 w-full rounded" />
                  </div>
                </div>
              ) : (
                fileData.ok && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    {preview && (
                      <div className="md:col-span-1 flex justify-center items-start">
                        {isEps ? (
                          <div className="flex justify-center items-center h-48 w-full object-contain rounded-xl border border-gray-700 shadow-lg bg-gray-800">
                            <p className="text-gray-400 px-4 text-center">
                              No preview available for EPS files
                            </p>
                          </div>
                        ) : (
                          <img
                            src={
                              typeof preview === "string"
                                ? preview
                                : preview.url
                            }
                            alt={fileData.file || "preview"}
                            className="max-h-48 w-full object-contain rounded-xl border border-gray-700 shadow-lg"
                          />
                        )}
                      </div>
                    )}

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
                                  Keywords (
                                  {fileData.meta.keywords?.length || 0})
                                </h4>
                                <CopyButton
                                  field="keywords"
                                  value={(fileData.meta.keywords || []).join(
                                    ", "
                                  )}
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
                                {(platform?.toLowerCase() === "shutterstock"
                                  ? fileData.meta.category.slice(0, 1)
                                  : fileData.meta.category
                                ).map((cat, i) => (
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
                            label="Prompt"
                            value={
                              fileData.prompt || "No generated prompt available"
                            }
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
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🔥 Modal for all processed */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl text-center max-w-sm"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">
                All images processed successfully!
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
              >
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
