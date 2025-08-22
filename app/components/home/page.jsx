'use client';
import React, { useState, useEffect, useRef, useReducer } from 'react';
import { motion } from 'framer-motion';
import logo from './logo.svg';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import { googleSignOut } from '@/lib/auth';
import {
  Upload,
  CheckCircle2,
  Loader2,
  FileImage,
  Trash2,
  Download,
  LogOut,
  Coins,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { SliderRow } from '@/components/ui/Slider';
import { ResultCard } from '@/components/ui/ResultCard';
import { ACCEPTED } from '@/lib/utils';

// --- Reducer ---
const initialState = {
  mode: 'meta', // meta or prompt
  minTitle: 6,
  maxTitle: 18,
  minKw: 43,
  maxKw: 48,
  minDesc: 12,
  maxDesc: 30,
  files: [], // array of File
  previews: [], // [{ name, url }]
  fileResults: [], // results for UI
  loading: false,
  errorMsg: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_SLIDER':
      return { ...state, [action.payload.key]: action.payload.value };
    case 'SET_FILES':
      return { ...state, files: action.payload };
    case 'SET_PREVIEWS':
      return { ...state, previews: action.payload };
    case 'SET_FILE_RESULTS':
      return { ...state, fileResults: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR_MSG':
      return { ...state, errorMsg: action.payload };
    case 'RESET_SLIDERS':
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

// --- User Display Component ---
function UserDisplay({ user, userData }) {
  if (!user || !userData) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-amber-400">
        <Coins className="w-5 h-5" />
        <span className="font-bold text-lg">{userData.credits}</span>
      </div>
      <div className="flex items-center gap-3">
        <img
          src={user.photoURL}
          alt={user.displayName}
          className="w-10 h-10 rounded-full border-2 border-gray-700"
        />
        <div>
          <p className="font-semibold text-white">{user.displayName}</p>
          <p className="text-xs text-gray-400">{user.email}</p>
        </div>
        <button
          onClick={googleSignOut}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// --- Dashboard Component ---
export default function DashboardPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const inputRef = useRef(null);

  

  const handleSelected = (list) => {
    const arr = Array.from(list || []);
    if (arr.length === 0) return;

    const accepted = arr.filter((f) => ACCEPTED.includes(f.type));
    const rejected = arr.filter((f) => !ACCEPTED.includes(f.type));

    if (rejected.length) {
      dispatch({
        type: 'SET_ERROR_MSG',
        payload: `Rejected ${rejected.length} file(s) — unsupported type.`,
      });
      setTimeout(
        () => dispatch({ type: 'SET_ERROR_MSG', payload: '' }),
        3000
      );
    }

    if (accepted.length === 0) return;

    dispatch({ type: 'SET_FILES', payload: [...state.files, ...accepted] });
    const newPreviews = accepted.map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
    }));
    dispatch({
      type: 'SET_PREVIEWS',
      payload: [...state.previews, ...newPreviews],
    });
  };

  useEffect(() => {
    return () => {
      state.previews.forEach((p) => {
        try {
          URL.revokeObjectURL(p.url);
        } catch (e) {}
      });
    };
  }, [state.previews]);

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dt = e.dataTransfer;
    if (!dt) return;
    handleSelected(dt.files);
  };

  const callGemini = async (file) => {
    try {
      const fd = new FormData();
      fd.append('file', file, file.name);
      fd.append('mode', state.mode);
      fd.append('minTitle', String(state.minTitle));
      fd.append('maxTitle', String(state.maxTitle));
      fd.append('minKeywords', String(state.minKw));
      fd.append('maxKeywords', String(state.maxKw));
      fd.append('minDesc', String(state.minDesc));
      fd.append('maxDesc', String(state.maxDesc));

      const res = await fetch('/api/gemini', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          meta: data?.error || 'API Error',
          raw: JSON.stringify(data),
          engine: 'gemini',
        };
      }

      const meta = data?.metadata || {};
      const prompt = data?.prompt || '';
      const raw = data?.rawResponse || '';

      return {
        ok: true,
        file: meta.filename || file.name,
        meta: {
          title: meta.title || 'No title available',
          keywords: meta.keywords || ['No keywords available'],
          description: meta.description || 'No description available',
          category: meta.category || ['Uncategorized'],
        },
        prompt,
        raw,
        engine: 'gemini',
      };
    } catch (err) {
      console.error('callGemini error', err);
      return {
        ok: false,
        meta: err.message || 'Network error',
        raw: '',
        engine: 'gemini',
      };
    }
  };

  const processFiles = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (state.files.length === 0) {
      dispatch({ type: 'SET_ERROR_MSG', payload: 'No files to process' });
      setTimeout(
        () => dispatch({ type: 'SET_ERROR_MSG', payload: '' }),
        2500
      );
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_FILE_RESULTS', payload: [] });
    const results = [];

    for (const f of state.files) {
      dispatch({
        type: 'SET_FILE_RESULTS',
        payload: [
          ...results,
          { file: f.name, ok: null, meta: 'Processing...', engine: 'gemini' },
        ],
      });

      const res = await callGemini(f);

      if (res.ok) {
        try {
          const token = await user.getIdToken();
          await fetch("/api/deduct-credit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ amount: 1 }),
          }).then(() => {
            console.log("Credit deducted successfully");
          });
        } catch (error) {
          console.error("Credit deduction failed", error);
          // Optionally handle UI feedback for failed deduction
        }
      }

      results.push(res);

      dispatch({
        type: 'SET_FILE_RESULTS',
        payload: results.map((r, i) =>
          i === results.length - 1 ? { ...res, file: res.file || f.name } : r
        ),
      });
    }

    dispatch({ type: 'SET_LOADING', payload: false });
    return results;
  };

  const downloadCsv = () => {
    if (state.fileResults.length === 0) return;

    const rows = [
      [
        'filename',
        'title',
        'keywords',
        'description',
        'category',
        'engine',
        'ok',
      ],
      ...state.fileResults.map((r) => [
        r.file,
        r.meta?.title || '',
        Array.isArray(r.meta?.keywords)
          ? r.meta.keywords.join('|')
          : r.meta?.keywords || '',
        r.meta?.description || '',
        Array.isArray(r.meta?.category)
          ? r.meta.category.join('|')
          : r.meta?.category || '',
        r.engine || '',
        r.ok ? 'ok' : 'error',
      ]),
    ];

    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'results.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const removeFile = (idx) => {
    dispatch({
      type: 'SET_FILES',
      payload: state.files.filter((_, i) => i !== idx),
    });
    dispatch({
      type: 'SET_PREVIEWS',
      payload: state.previews.filter((_, i) => i !== idx),
    });
  };

  const removeResult = (idx) => {
    dispatch({
      type: 'SET_FILE_RESULTS',
      payload: state.fileResults.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div>
            <Image alt="Nestsouq Logo" width={120} height={120} src={logo} />
          </div>
        </motion.div>
        {authLoading ? (
          <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
        ) : user && userData ? (
          <UserDisplay user={user} userData={userData} />
        ) : (
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/login')}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Login
            </Button>
            <Button
              onClick={() => router.push('/pricing')} // Assuming a pricing page exists or will be created
              className="bg-gray-700 hover:bg-gray-600"
            >
              Pricing
            </Button>
          </div>
        )}
      </header>
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        {/* LEFT */}
        <aside className="lg:col-span-3 space-y-6">
          {/* Mode Selection */}
          <Card>
            <CardContent>
              <h2 className="text-lg font-semibold mb-3">Mode Selection</h2>
              <div className="flex gap-3">
                <Button
                  onClick={() => dispatch({ type: 'SET_MODE', payload: 'meta' })}
                  className={`flex-1 border border-gray-700 ${state.mode === 'meta' ? 'bg-blue-500 text-white' : 'hover:bg-gray-800'}`}
                >
                  Metadata
                </Button>
                <Button
                  onClick={() =>
                    dispatch({ type: 'SET_MODE', payload: 'prompt' })
                  }
                  className={`flex-1 border border-gray-700 ${state.mode === 'prompt' ? 'bg-amber-500 text-black' : 'hover:bg-gray-800'}`}
                >
                  Prompt
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Sliders */}
          <Card>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-semibold">Customization</h2>
                <Button
                  onClick={() => dispatch({ type: 'RESET_SLIDERS' })}
                  className="text-xs px-3 py-1 border border-gray-700 hover:bg-gray-800"
                >
                  Reset
                </Button>
              </div>
              <SliderRow
                label="Title Words"
                hint="min & max"
                min={1}
                max={60}
                valueMin={state.minTitle}
                valueMax={state.maxTitle}
                setValueMin={(value) =>
                  dispatch({
                    type: 'SET_SLIDER',
                    payload: { key: 'minTitle', value },
                  })
                }
                setValueMax={(value) =>
                  dispatch({
                    type: 'SET_SLIDER',
                    payload: { key: 'maxTitle', value },
                  })
                }
                suffix="words"
              />
              <SliderRow
                label="Keywords Count"
                hint="min & max"
                min={1}
                max={100}
                valueMin={state.minKw}
                valueMax={state.maxKw}
                setValueMin={(value) =>
                  dispatch({
                    type: 'SET_SLIDER',
                    payload: { key: 'minKw', value },
                  })
                }
                setValueMax={(value) =>
                  dispatch({
                    type: 'SET_SLIDER',
                    payload: { key: 'maxKw', value },
                  })
                }
              />
              <SliderRow
                label="Description Words"
                hint="min & max"
                min={1}
                max={100}
                valueMin={state.minDesc}
                valueMax={state.maxDesc}
                setValueMin={(value) =>
                  dispatch({
                    type: 'SET_SLIDER',
                    payload: { key: 'minDesc', value },
                  })
                }
                setValueMax={(value) =>
                  dispatch({
                    type: 'SET_SLIDER',
                    payload: { key: 'maxDesc', value },
                  })
                }
                suffix="words"
              />
            </CardContent>
          </Card>
          {/* Actions */}
          <Card>
            <CardContent className="flex flex-col gap-3">
              <Button
                onClick={processFiles}
                disabled={state.loading || state.files.length === 0}
                className="bg-amber-500 hover:bg-amber-600 flex items-center justify-center gap-2"
              >
                {state.loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {state.loading ? 'Processing...' : 'Process Files'}
              </Button>
              <Button
                onClick={downloadCsv}
                disabled={state.fileResults.length === 0}
                className="bg-green-500 hover:bg-green-600 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download CSV
              </Button>
              {state.errorMsg && (
                <p className="text-red-500 text-sm mt-2">{state.errorMsg}</p>
              )}
            </CardContent>
          </Card>
        </aside>
        {/* RIGHT */}
        <section className="lg:col-span-9 space-y-6">
          {/* File Selection */}
          <Card>
            <CardContent>
              <h2 className="text-lg font-semibold mb-2">Selected Files</h2>
              <input
                type="file"
                ref={inputRef}
                multiple
                accept={ACCEPTED.join(',')}
                onChange={(e) => {
                  handleSelected(e.target.files);
                  e.target.value = '';
                }}
                className="hidden"
              />
              <Button
                onClick={() => inputRef.current?.click()}
                className="bg-blue-500 hover:bg-blue-600 flex items-center justify-center gap-2 mb-3"
              >
                <Upload className="w-4 h-4" /> Select Files
              </Button>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="min-h-[120px] border-2 border-dashed border-gray-700 rounded-xl p-4 flex flex-wrap gap-3 items-center justify-start"
              >
                {state.previews.length === 0 && (
                  <p className="text-xs text-gray-500">
                    Drag & drop or select files
                  </p>
                )}
                {state.previews.map((p, idx) => (
                  <div
                    key={idx}
                    className="w-20 h-20 relative border border-gray-700 rounded-lg overflow-hidden group"
                  >
                    {p.url ? (
                      <img
                        src={p.url}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileImage className="w-full h-full text-gray-500 p-3" />
                    )}
                    <button
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-xs p-1 truncate">
                      {p.name}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Results */}
          <Card>
            <CardContent className="h-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {state.mode === 'meta'
                    ? 'Metadata Results'
                    : 'Prompt Results'}
                </h2>
                {state.fileResults.length > 0 && (
                  <span className="text-sm text-gray-400">
                    {state.fileResults.length} result
                    {state.fileResults.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {state.fileResults.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <FileImage className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>
                    No files processed yet. Select files and click Process.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-auto pr-2">
                  {state.fileResults.map((f, idx) => {
                    const resultPreview = state.previews.find(
                      (p) => p.name === f.file
                    );
                    return (
                      <ResultCard
                        key={idx}
                        mode={state.mode}
                        fileData={f}
                        preview={resultPreview}
                        index={idx}
                        onRemove={removeResult}
                      />
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}