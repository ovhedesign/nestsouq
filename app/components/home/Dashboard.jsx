"use client";
import { XCircle } from "lucide-react";

import React, {
  useState,
  useEffect,
  useRef,
  useReducer,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "./logo.png";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/hooks";
import { googleSignOut } from "@/lib/auth";
import imageCompression from "browser-image-compression";
import {
  Upload,
  CheckCircle2,
  Loader2,
  FileImage,
  Trash2,
  Download,
  LogOut,
  Coins,
  ChevronDown,
  Settings,
  FileText,
  Sparkles,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import { Card, CardContent } from "@/components/ui/Card";
import { SliderRow } from "@/components/ui/Slider";
import { ResultCard } from "@/components/ui/ResultCard";
import { ACCEPTED } from "@/lib/utils";
import Link from "next/link";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const cardVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// --- Reducer ---
const initialState = {
  mode: "meta", // meta or prompt
  platform: "default",
  minTitle: 14,
  maxTitle: 20,
  minKw: 45,
  maxKw: 48,
  minDesc: 15,
  maxDesc: 25,
  processedFiles: [], // [{ originalFile: File, previewUrl: string, result: object }]
  loading: false,
  errorMsg: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.payload };
    case "SET_PLATFORM":
      return { ...state, platform: action.payload };
    case "SET_SLIDER":
      return { ...state, [action.payload.key]: action.payload.value };
    case "ADD_FILES":
      return {
        ...state,
        processedFiles: [...state.processedFiles, ...action.payload],
      };
    case "UPDATE_FILE_RESULT":
      return {
        ...state,
        processedFiles: state.processedFiles.map((file, i) =>
          i === action.payload.index
            ? { ...file, result: action.payload.result }
            : file
        ),
      };
    case "REMOVE_FILE":
      return {
        ...state,
        processedFiles: state.processedFiles.filter(
          (_, i) => i !== action.payload
        ),
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR_MSG":
      return { ...state, errorMsg: action.payload };
    case "RESET_SLIDERS":
      return {
        ...state,
        minTitle: initialState.minTitle,
        maxTitle: initialState.maxTitle,
        minKw: initialState.minKw,
        maxKw: initialState.maxKw,
        minDesc: initialState.minDesc,
        maxDesc: initialState.maxDesc,
      };
    default:
      throw new Error();
  }
}

// --- User Dropdown Component ---
function UserDropdown({ user, userData }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations("HomePage");

  if (!user || !userData) return null;

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-gray-800 hover:bg-gray-700 p-1 transition-colors"
        whileTap={{ scale: 0.95 }}
      >
        <Image
          src={user.photoURL}
          alt={user.displayName}
          width={36}
          height={36}
          className="rounded-full"
        />
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 origin-top-right bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl z-10"
          >
            <div className="p-4 text-center border-b border-gray-700/50">
              <Image
                src={user.photoURL}
                alt={user.displayName}
                width={64}
                height={64}
                className="rounded-full mx-auto mb-3 ring-2 ring-amber-400/50"
              />
              <p className="font-bold text-lg text-white truncate">
                {user.displayName}
              </p>
              <p className="text-sm text-gray-400 truncate">{user.email}</p>
            </div>
            <div className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Coins className="w-6 h-6 text-amber-400" />
                    <div>
                      <p className="text-gray-300 text-sm">{t("credits")}</p>
                      <p className="font-bold text-white text-xl">
                        {userData.credits}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push("/pricing")}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-4 rounded-lg text-sm"
                  >
                    {t("getMore")}
                  </Button>
                </div>
                {userData.isPremium && (
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-gray-300 text-sm">{t("currentPlan")}</p>
                    <p className="font-bold text-white text-lg">
                      {userData.paymentInfo?.planId || "N/A"}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {t("expires")}{" "}
                      {new Date(userData.expireDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-2">
              <button
                onClick={googleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-md transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>{t("signOut")}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Dashboard Component ---
export default function DashboardPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user, userData, loading: authLoading, updateUserData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1];
  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);
  const t = useTranslations("HomePage");

  const createPreview = async (file) => {
    const fileExtension = file.name?.split(".").pop()?.toLowerCase();
    if (fileExtension === "eps") {
      return "unsupported";
    }

    let previewFile = file;

    // For browser-supported conversion: BMP, TIFF, GIF
    if (["image/bmp", "image/tiff", "image/gif"].includes(file.type)) {
      try {
        previewFile = await imageCompression(file, {
          maxSizeMB: 0.06, // ~60KB
          maxWidthOrHeight: 200,
          useWebWorker: true,
          initialQuality: 0.7,
          fileType: "image/png", // convert to png for preview
        });
      } catch (err) {
        console.error("Compression failed:", err);
        return "unsupported"; // return unsupported if conversion fails
      }
    }

    return URL.createObjectURL(previewFile);
  };

  const handleSelected = async (list) => {
    const arr = Array.from(list || []);
    if (arr.length === 0) return;

    const accepted = arr.filter((f) => ACCEPTED.includes(f.type));
    const rejected = arr.filter((f) => !ACCEPTED.includes(f.type));

    if (rejected.length) {
      dispatch({
        type: "SET_ERROR_MSG",
        payload: t("unsupportedFileType", { count: rejected.length }),
      });
      setTimeout(() => dispatch({ type: "SET_ERROR_MSG", payload: "" }), 3000);
    }

    if (accepted.length === 0) return;

    const newProcessedFiles = await Promise.all(
      accepted.map(async (f) => ({
        originalFile: f,
        previewUrl: await createPreview(f), // <- convert/compress for preview
        result: null,
      }))
    );

    dispatch({ type: "ADD_FILES", payload: newProcessedFiles });
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dt = e.dataTransfer;
    if (!dt) return;
    handleSelected(dt.files);
  };

  const callGemini = async (file, previewUrl) => {
    try {
      // Image compression options
      const options = {
        maxSizeMB: 0.07, // Target 50-70KB
        maxWidthOrHeight: 700,
        useWebWorker: true,
        initialQuality: 0.5,
      };

      let compressedFile = file;
      if (
        file.type.startsWith("image/") &&
        file.type !== "application/postscript"
      ) {
        compressedFile = await imageCompression(file, options);
      }

      const fd = new FormData();
      fd.append("file", compressedFile, compressedFile.name);
      fd.append("mode", state.mode);
      fd.append("minTitle", String(state.minTitle));
      fd.append("maxTitle", String(state.maxTitle));
      fd.append("minKeywords", String(state.minKw));
      fd.append("maxKeywords", String(state.maxKw));
      fd.append("minDesc", String(state.minDesc));
      fd.append("maxDesc", String(state.maxDesc));
      fd.append("uid", user.uid);
      fd.append("locale", currentLocale);

      const idToken = await user.getIdToken(); // Get the ID token

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`, // Add Authorization header
        },
        body: fd, // Added this line
      }); // Added this closing
      const data = await res.json(); // Parse the JSON response
      if (!res.ok) {
        return {
          ok: false,
          meta: data?.error || "API Error",
          raw: JSON.stringify(data),
          engine: "gemini",
          previewUrl,
        };
      }

      updateUserData({ credits: data.credits });

      const meta = data?.metadata || {};
      const prompt = data?.prompt || "";
      const raw = data?.rawResponse || "";

      return {
        ok: true,
        file: meta.filename || file.name,
        meta: {
          title: meta.title || "No title available",
          keywords: meta.keywords || ["No keywords available"],
          description: meta.description || "No description available",
          category: meta.category || ["Uncategorized"],
        },
        prompt,
        raw,
        engine: "gemini",
        previewUrl,
      };
    } catch (err) {
      return {
        ok: false,
        meta: err.message || "Network error",
        raw: "",
        engine: "gemini",
        previewUrl,
      };
    }
  };

  const processFiles = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    const filesToProcess = state.processedFiles.filter((f) => !f.result);

    if (filesToProcess.length === 0) {
      dispatch({
        type: "SET_ERROR_MSG",
        payload: t("noFilesToProcess"),
      });
      setTimeout(() => {
        dispatch({ type: "SET_ERROR_MSG", payload: "" });
      }, 3000);
      return;
    }

    if (userData.credits < filesToProcess.length) {
      dispatch({
        type: "SET_ERROR_MSG",
        payload: t("notEnoughCredits"),
      });
      setTimeout(() => {
        dispatch({ type: "SET_ERROR_MSG", payload: "" });
        router.push("/pricing");
      }, 3000);
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    // Set initial processing state for all files to be processed
    for (const file of filesToProcess) {
      const index = state.processedFiles.indexOf(file);
      dispatch({
        type: "UPDATE_FILE_RESULT",
        payload: {
          index,
          result: {
            file: file.originalFile.name,
            ok: null,
            meta: "Processing...",
            engine: "gemini",
            previewUrl: file.previewUrl,
          },
        },
      });
    }

    for (const file of filesToProcess) {
      const index = state.processedFiles.indexOf(file);
      const result = await callGemini(file.originalFile, file.previewUrl);
      dispatch({
        type: "UPDATE_FILE_RESULT",
        payload: { index, result },
      });
    }
    dispatch({ type: "SET_LOADING", payload: false });
  };
  const downloadCsv = () => {
    const results = state.processedFiles.filter((f) => f.result);
    if (results.length === 0) return;

    const { platform } = state;
    let headers = [];
    let rows = [];

    if (state.mode === "prompt") {
      headers = ["Prompt"];
      rows = results.map((file) => [`"${file.result.prompt}"`]);
    } else {
      if (platform === "shutterstock") {
        headers = [
          "Filename",
          "Description",
          "Keywords",
          "Categories",
          "Releases",
        ];
        rows = results.map((file) => {
          const filenameWithoutExt =
            file.result.file.split(".").slice(0, -1).join(".") ||
            file.result.file;
          return [
            `"${filenameWithoutExt}"`,
            `"${file.result.meta?.title || ""}"`,
            `"${(file.result.meta?.keywords || []).join(",")}"`,
            `"${(file.result.meta?.category || []).join(", ")}"`,
            '""',
          ];
        });
      } else if (platform === "freepik") {
        headers = ["Filename", "Title", "Keywords"];
        rows = results.map((file) => {
          const r = file.result;
          const filenameWithoutExt =
            r.file.split(".").slice(0, -1).join(".") || r.file;
          return [
            `"${filenameWithoutExt}.jpg"`,
            `"${r.meta?.title || ""}"`,
            `"${(r.meta?.keywords || []).join(",")}"`,
          ];
        });
      } else if (platform === "vecteezy") {
        headers = [
          "Filename",
          "Title",
          "Description",
          "Keywords",
          "Image Type",
        ];
        rows = results.map((file) => {
          const r = file.result;
          const filenameWithoutExt =
            r.file.split(".").slice(0, -1).join(".") || r.file;
          return [
            `"${filenameWithoutExt}"`,
            `"${r.meta?.title || ""}"`,
            `"${r.meta?.description || ""}"`,
            `"${(r.meta?.keywords || []).join(",")}"`,
            '"Photo"',
          ];
        });
      } else if (platform === "adobestock") {
        headers = ["Filename", "Title", "Keywords", "Description"];
        rows = results.map((file) => {
          const r = file.result;
          const filenameWithoutExt =
            r.file.split(".").slice(0, -1).join(".") || r.file;
          return [
            `"${filenameWithoutExt}"`,
            `"${r.meta?.title || ""}"`,
            `"${(r.meta?.keywords || []).join(",")}"`,
            `"${r.meta?.description || ""}"`,
          ];
        });
      } else {
        // Default generic export
        headers = [
          "filename",
          "title",
          "keywords",
          "description",
          "category",
          "engine",
          "ok",
        ];
        rows = results.map((file) => {
          const r = file.result;
          return [
            `"${r.file}"`,
            `"${r.meta?.title || ""}"`,
            `"${
              Array.isArray(r.meta?.keywords)
                ? r.meta.keywords.join("|")
                : r.meta?.keywords || ""
            }"`,
            `"${r.meta?.description || ""}"`,
            `"${
              Array.isArray(r.meta?.category)
                ? r.meta.category.join("|")
                : r.meta?.category || ""
            }"`,
            `"${r.engine || ""}"`,
            `"${r.ok ? "ok" : "error"}"`,
          ];
        });
      }
    }

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${platform}_results.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const removeFile = (idx) => {
    const fileToRemove = state.processedFiles[idx];
    if (fileToRemove?.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
    dispatch({
      type: "REMOVE_FILE",
      payload: idx,
    });
  };

  const results = state.processedFiles.filter((f) => f.result);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans relative z-0 shadow-inner-lg">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-gray-950/50 backdrop-blur-sm sticky top-0 z-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center gap-4" // Added flex container for logo and language switcher
        >
          <Link href="/">
            <Image
              alt="Netsouq Logo"
              width={100}
              height={40}
              src={logo}
              className="h-auto w-auto hover:opacity-80 transition-opacity"
            />
          </Link>
        </motion.div>

        {authLoading ? (
          <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
        ) : user && userData ? (
          <UserDropdown user={user} userData={userData} />
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center gap-4"
          >
            <Button
              onClick={() => router.push("/login")}
              className="bg-transparent border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black transition-all duration-300"
            >
              {t("login")}
            </Button>
            <Button
              onClick={() => router.push("/pricing")}
              className="bg-amber-500 text-black hover:bg-amber-600 transition-all duration-300"
            >
              {t("pricing")}
            </Button>
          </motion.div>
        )}
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
        {/* LEFT - CONTROLS */}
        <motion.aside
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-3 space-y-6"
        >
          {/* Language Selection */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gray-900/50 border-gray-800 shadow-lg">
              <CardContent>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  🌐 {t("language")}
                </h2>
                <LanguageSwitcher />
              </CardContent>
            </Card>
          </motion.div>
          {/* Mode Selection */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gray-900/50 border-gray-800 shadow-lg">
              <CardContent>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />{" "}
                  {t("modeSelection")}
                </h2>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      dispatch({ type: "SET_MODE", payload: "meta" })
                    }
                    disabled={results.length > 0}
                    className={`flex-1 border-2 transition-all duration-300 ${
                      state.mode === "meta"
                        ? "bg-blue-500 border-blue-400 text-white shadow-md"
                        : "bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-gray-600"
                    }`}
                  >
                    {t("metadata")}
                  </Button>
                  <Button
                    onClick={() =>
                      dispatch({ type: "SET_MODE", payload: "prompt" })
                    }
                    disabled={results.length > 0}
                    className={`flex-1 border-2 transition-all duration-300 ${
                      state.mode === "prompt"
                        ? "bg-amber-500 border-amber-400 text-black shadow-md"
                        : "bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-gray-600"
                    }`}
                  >
                    {t("prompt")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Platform Selection */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gray-900/50 border-gray-800 shadow-lg">
              <CardContent>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5 text-amber-400" />{" "}
                  {t("platformSelect")}
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "default", name: t("Default") },
                    { id: "shutterstock", name: t("Shutterstock") },
                    { id: "freepik", name: t("Freepik") },
                    { id: "vecteezy", name: t("Vecteezy") },
                    { id: "adobestock", name: t("adobeStock") }, // Added AdobeStock
                  ].map((p) => (
                    <Button
                      key={p.id}
                      onClick={() =>
                        dispatch({ type: "SET_PLATFORM", payload: p.id })
                      }
                      className={`border-2 transition-all duration-300 ${
                        state.platform === p.id
                          ? "bg-green-500 border-green-400 text-white shadow-md"
                          : "bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-gray-600"
                      }`}
                    >
                      {p.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sliders */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gray-900/50 border-gray-800 shadow-lg">
              <CardContent className="space-y-5 pt-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Settings className="w-5 h-5 text-amber-400" />{" "}
                    {t("customization")}
                  </h2>
                  <Button
                    onClick={() => dispatch({ type: "RESET_SLIDERS" })}
                    className="text-xs px-3 py-1 border border-gray-700 hover:bg-gray-600 transition-colors"
                  >
                    {t("reset")}
                  </Button>
                </div>
                <SliderRow
                  label={t("titleWords")}
                  hint="min & max"
                  min={1}
                  max={50}
                  valueMin={state.minTitle}
                  valueMax={state.maxTitle}
                  setValueMin={(value) =>
                    dispatch({
                      type: "SET_SLIDER",
                      payload: { key: "minTitle", value },
                    })
                  }
                  setValueMax={(value) =>
                    dispatch({
                      type: "SET_SLIDER",
                      payload: { key: "maxTitle", value },
                    })
                  }
                  suffix="words"
                />
                <SliderRow
                  label={t("keywordsCount")}
                  hint="min & max"
                  min={1}
                  max={50}
                  valueMin={state.minKw}
                  valueMax={state.maxKw}
                  setValueMin={(value) =>
                    dispatch({
                      type: "SET_SLIDER",
                      payload: { key: "minKw", value },
                    })
                  }
                  setValueMax={(value) =>
                    dispatch({
                      type: "SET_SLIDER",
                      payload: { key: "maxKw", value },
                    })
                  }
                />
                <SliderRow
                  label={t("descriptionWords")}
                  hint="min & max"
                  min={1}
                  max={50}
                  valueMin={state.minDesc}
                  valueMax={state.maxDesc}
                  setValueMin={(value) =>
                    dispatch({
                      type: "SET_SLIDER",
                      payload: { key: "minDesc", value },
                    })
                  }
                  setValueMax={(value) =>
                    dispatch({
                      type: "SET_SLIDER",
                      payload: { key: "maxDesc", value },
                    })
                  }
                  suffix="words"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions */}
        </motion.aside>

        {/* CENTER - UPLOAD & RESULTS */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-6 space-y-6"
        >
          {/* File Selection */}
          <motion.div variants={cardVariants}>
            <Card className="bg-gray-900/50 border-gray-800 shadow-lg">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Upload className="w-6 h-6 text-amber-400" />{" "}
                  {t("uploadYourFiles")}
                </h2>
                <input
                  type="file"
                  ref={inputRef}
                  multiple
                  accept={ACCEPTED.join(",")}
                  onChange={(e) => {
                    handleSelected(e.target.files);
                    e.target.value = "";
                  }}
                  className="hidden"
                />
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add(
                      "border-amber-500",
                      "bg-gray-800"
                    );
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove(
                      "border-amber-500",
                      "bg-gray-800"
                    );
                  }}
                  onDrop={(e) => {
                    onDrop(e);
                    e.currentTarget.classList.remove(
                      "border-amber-500",
                      "bg-gray-800"
                    );
                  }}
                  onClick={() => inputRef.current?.click()}
                  className="min-h-[150px] border-2 border-dashed border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:border-amber-400 hover:bg-gray-800/50"
                >
                  <Upload className="w-10 h-10 text-gray-500 mb-3 transition-transform duration-300 group-hover:scale-110" />
                  <p className="text-lg font-semibold text-gray-300">
                    {t("dragAndDrop")}
                  </p>
                  <p className="text-gray-500">{t("orClickToSelect")}</p>
                  <p className="text-xs text-gray-600 mt-2">
                    {t("supportedFormats")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="bg-gray-900/50 border-gray-800 shadow-lg">
              <CardContent className="flex flex-col gap-3 pt-6">
                <div className="flex gap-3">
                  <Button
                    onClick={processFiles}
                    disabled={
                      state.loading || state.processedFiles.length === 0
                    }
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  >
                    {state.loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                    {state.loading ? t("processing") : t("processFiles")}
                  </Button>
                  <Button
                    onClick={downloadCsv}
                    disabled={results.length === 0}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  >
                    <Download className="w-5 h-5" /> {t("downloadCSV")}
                  </Button>
                </div>
                <AnimatePresence>
                  {state.errorMsg && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg"
                    >
                      {state.errorMsg}
                    </motion.p>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          <motion.div variants={cardVariants}>
            <Card className="bg-gray-900/50 border-gray-800 shadow-lg min-h-[400px]">
              <CardContent className="pt-6 h-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="w-6 h-6 text-amber-400" />
                    {state.mode === "meta"
                      ? t("metadataResults")
                      : t("promptResults")}
                  </h2>
                  {results.length > 0 && (
                    <span className="text-sm bg-gray-800 px-3 py-1 rounded-full">
                      {results.length}
                      {t("result", { count: results.length })}
                    </span>
                  )}
                </div>
                {results.length === 0 ? (
                  <div className="text-center py-16 text-gray-500 flex flex-col items-center justify-center h-full">
                    <FileImage className="w-20 h-20 mx-auto mb-6 opacity-30" />
                    <p className="text-lg font-semibold">
                      {t("noFilesProcessed")}
                    </p>
                    <p className="text-sm">{t("uploadFilesPrompt")}</p>
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 -mr-2"
                  >
                    {state.processedFiles.map((f, idx) =>
                      f.result ? (
                        <motion.div
                          key={f.originalFile.name + idx}
                          variants={itemVariants}
                        >
                          <ResultCard
                            mode={state.mode}
                            fileData={f.result}
                            preview={{ url: f.previewUrl }}
                            index={idx}
                            onRemove={removeFile}
                            platform={state.platform}
                          />
                        </motion.div>
                      ) : null
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>

        {/* RIGHT SIDEBAR (Previews) */}
        <motion.aside className="lg:col-span-3 space-y-6">
          <Card className="bg-gray-900/50 border-gray-800 shadow-lg h-full">
            <CardContent className="p-4 space-y-4 overflow-y-auto max-h-[80vh]">
              <h2 className="text-lg font-semibold mb-2">
                {t("selectedImages")}
              </h2>
              {state.processedFiles.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-gray-500 text-sm border border-dashed border-gray-700 rounded-lg">
                  {t("noImagesSelected")}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-4">
                  {state.processedFiles.map((p, idx) => {
                    const fileStatus = p.result;
                    const isProcessing = fileStatus && fileStatus.ok === null;
                    const isProcessed = fileStatus && fileStatus.ok === true;
                    const hasFailed = fileStatus && fileStatus.ok === false;

                    return (
                      <motion.div
                        key={p.originalFile.name + idx}
                        variants={itemVariants}
                        className="relative group border border-gray-700 rounded-lg overflow-hidden shadow-md"
                      >
                        <div className="flex items-center justify-center bg-gray-800 h-32 relative">
                          {/* Image */}
                          {p.previewUrl === "unsupported" ? (
                            <div className="w-full h-32 flex items-center justify-center bg-gray-800">
                              <FileImage className="w-12 h-12 text-gray-500" />
                            </div>
                          ) : (
                            <Image
                              src={p.previewUrl}
                              alt={p.originalFile.name}
                              width={120}
                              height={120}
                              className={`object-contain max-h-28 transition-all duration-300 ${
                                isProcessing || isProcessed ? "opacity-50" : ""
                              }`}
                            />
                          )}

                          {/* Status Overlay */}
                          {isProcessing && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                            </div>
                          )}

                          {isProcessed && (
                            <div className="absolute inset-0 bg-green-900/50 flex items-center justify-center">
                              <CheckCircle2 className="w-8 h-8 text-green-400" />
                            </div>
                          )}

                          {hasFailed && (
                            <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center">
                              <XCircle className="w-8 h-8 text-red-400" />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(idx);
                          }}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 shadow-md hover:scale-110 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-center truncate p-1 bg-gray-800">
                          {p.originalFile.name}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.aside>
      </main>
    </div>
  );
}
