'use client';
import { useState, useRef, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useUser } from '@clerk/nextjs';

const BATCH_SIZE = 5;

export default function ImageAnalyzer() {
  const t = useTranslations('ImageAnalyzer');
  const { user } = useUser();
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('meta');
  const [currentPage, setCurrentPage] = useState(0);
  const resultsRef = useRef(null);

  const paginatedFiles = useMemo(() => {
    const start = currentPage * BATCH_SIZE;
    const end = start + BATCH_SIZE;
    return files.slice(start, end);
  }, [files, currentPage]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setResults([]);
    setCurrentPage(0);
  };

  const processFile = async (file) => {
    if (!user) return null;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('uid', user.id);
    formData.append('locale', 'en');
    formData.append('mode', mode);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error analyzing image:', file.name, error);
      return { error: `Failed to process ${file.name}` };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0 || !user) return;

    setLoading(true);
    setResults([]);

    const newResults = [];
    for (const file of paginatedFiles) {
      const result = await processFile(file);
      newResults.push(result);
      setResults([...newResults]); // Update results one by one
    }

    setLoading(false);

    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if ((currentPage + 1) * BATCH_SIZE < files.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setCurrentPage(0); // Reset to first page on new submission
          handleSubmit(e);
        }}
      >
        <div className="mb-4">
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-700"
          >
            {t('uploadLabel')}
          </label>
          <input
            type="file"
            id="file"
            multiple
            accept=".bmp, .tiff, .eps, .jpeg, .png, .svg, .gif, .webp, image/bmp, image/tiff, image/x-eps, image/jpeg, image/png, image/svg+xml, image/gif, image/webp"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
          />
        </div>
        <div className="mb-4">
          <span className="block text-sm font-medium text-gray-700">Mode</span>
          <div className="mt-2 flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="mode"
                value="meta"
                checked={mode === 'meta'}
                onChange={() => setMode('meta')}
              />
              <span className="ml-2">Metadata</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="mode"
                value="prompt"
                checked={mode === 'prompt'}
                onChange={() => setMode('prompt')}
              />
              <span className="ml-2">Prompts</span>
            </label>
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={files.length === 0 || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400"
          >
            {loading ? t('analyzing') : t('analyzeButton')}
          </button>
          {files.length > BATCH_SIZE && (
            <button
              type="button"
              onClick={handleNextPage}
              disabled={loading || (currentPage + 1) * BATCH_SIZE >= files.length}
              className="px-4 py-2 bg-green-500 text-white rounded-md disabled:bg-gray-400"
            >
              Next 5
            </button>
          )}
        </div>
      </form>

      {results.length > 0 && (
        <div className="mt-8" ref={resultsRef}>
          <h2 className="text-xl font-semibold">{t('resultsTitle')}</h2>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded-md">
                {result.error ? (
                  <p className="text-red-500">{result.error}</p>
                ) : (
                  <>
                    {mode === 'meta' ? (
                      <pre>
                        {JSON.stringify(result.metadata, null, 2)}
                      </pre>
                    ) : (
                      <p>{result.prompt}</p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
