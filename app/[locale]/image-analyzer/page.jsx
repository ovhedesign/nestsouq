'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useUser } from '@clerk/nextjs';

export default function ImageAnalyzer() {
  const t = useTranslations('ImageAnalyzer');
  const { user } = useUser();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('meta');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !user) return;

    setLoading(true);
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

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <form onSubmit={handleSubmit}>
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
        <button
          type="submit"
          disabled={!file || loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400"
        >
          {loading ? t('analyzing') : t('analyzeButton')}
        </button>
      </form>

      {result && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold">{t('resultsTitle')}</h2>
          {mode === 'meta' ? (
            <pre className="mt-2 bg-gray-100 p-4 rounded-md">
              {JSON.stringify(result.metadata, null, 2)}
            </pre>
          ) : (
            <p className="mt-2">{result.prompt}</p>
          )}
        </div>
      )}
    </div>
  );
}
