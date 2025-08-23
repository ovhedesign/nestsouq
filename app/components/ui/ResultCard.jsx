'use client';

import { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Copy,
  CheckCheck,
  X,
} from 'lucide-react';

export function ResultCard({ mode, fileData, preview, index, onRemove }) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      // console.error('Copy failed', err);
    }
  };

  return (
    <div
      className={`p-5 rounded-2xl shadow-lg border ${
        mode === 'meta'
          ? 'border-blue-500 bg-gray-800'
          : 'border-amber-500 bg-gray-900'
      }`}
    >
      {/* File Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
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
          <span className="text-lg font-semibold truncate max-w-xs">
            {fileData.file}
          </span>
          <span
            className={`font-bold text-sm ${
              fileData.ok === true ? 'text-green-400' : fileData.ok === false ? 'text-red-400' : 'text-amber-400'
            }`}
          >
            {fileData.ok === true ? '✅ OK' : fileData.ok === false ? '❌ Error' : 'Processing...'}
          </span>
          <span className="text-xs text-gray-400">{fileData.engine}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              copyToClipboard(
                mode === 'meta'
                  ? JSON.stringify(fileData.meta, null, 2)
                  : fileData.prompt
              )
            }
            className="p-1 text-gray-400 hover:text-white"
            title="Copy to clipboard"
          >
            {copied ? (
              <CheckCheck className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => onRemove(index)}
            className="p-1 text-gray-400 hover:text-red-400"
            title="Remove result"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      {expanded && (
        <>
          {fileData.ok && mode === 'meta' && (
            <div className="space-y-4 text-gray-200">
              <div>
                <h4 className="text-sm font-semibold text-blue-400 mb-1">
                  Title
                </h4>
                <p className="text-lg bg-gray-700 p-3 rounded-lg">
                  {fileData.meta.title || 'No title available'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-400 mb-1">
                  Keywords ({fileData.meta.keywords?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {fileData.meta.keywords &&
                  fileData.meta.keywords.length > 0 ? (
                    fileData.meta.keywords.map((keyword, i) => (
                      <span
                        key={i}
                        className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400">No keywords available</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-400 mb-1">
                  Description
                </h4>
                <p className="bg-gray-700 p-3 rounded-lg">
                  {fileData.meta.description || 'No description available'}
                </p>
              </div>
              {fileData.meta.category && (
                <div>
                  <h4 className="text-sm font-semibold text-blue-400 mb-1">
                    Category
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {fileData.meta.category.map((cat, i) => (
                      <span
                        key={i}
                        className="bg-purple-900 text-purple-200 px-3 py-1 rounded-full text-sm"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {fileData.ok && mode === 'prompt' && (
            <div className="text-gray-300">
              <h4 className="text-sm font-semibold text-amber-400 mb-2">
                Generated Prompt
              </h4>
              <div className="bg-gray-700 p-4 rounded-lg font-mono whitespace-pre-wrap break-words">
                {fileData.prompt}
              </div>
            </div>
          )}
          {/* Image Preview */}
          {preview?.url && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">
                Preview
              </h4>
              <img
                src={preview.url}
                alt={fileData.file}
                className="max-h-64 w-auto rounded-xl border border-gray-700 object-contain mx-auto"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
