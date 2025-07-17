'use client';
import { useState } from 'react';

export default function TestPage() {
  const [input, setInput] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testProcess = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError('Error testing process endpoint');
    }
    setLoading(false);
  };

  const testYouTube = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError('Error testing YouTube endpoint');
    }
    setLoading(false);
  };

  const testRepurpose = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError('Error testing repurpose endpoint');
    }
    setLoading(false);
  };

  const testHashtags = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError('Error testing hashtags endpoint');
    }
    setLoading(false);
  };

  const testTranscribe = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('audio', file);

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError('Error testing transcribe endpoint');
    }
    setLoading(false);
  };

  const clearResults = () => {
    setResponse(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">ContentMux API Test Center</h1>
          <p className="text-gray-300">Test all API endpoints including new YouTube integration</p>
        </div>

        {/* YouTube URL Testing Section */}
        <div className="premium-card mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">🎥 YouTube URL Processing</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                YouTube URL
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <button
              onClick={testYouTube}
              disabled={loading || !youtubeUrl}
              className="premium-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Test YouTube Processing'}
            </button>
          </div>
        </div>

        {/* Text Content Testing Section */}
        <div className="premium-card mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">📝 Text Content Processing</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content to Process
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your content here..."
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                rows={4}
              />
            </div>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={testProcess}
                disabled={loading || !input}
                className="premium-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Test Full Process'}
              </button>
              <button
                onClick={testRepurpose}
                disabled={loading || !input}
                className="premium-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Test Repurpose Only'}
              </button>
              <button
                onClick={testHashtags}
                disabled={loading || !input}
                className="premium-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Test Hashtags Only'}
              </button>
            </div>
          </div>
        </div>

        {/* File Upload Testing Section */}
        <div className="premium-card mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">🎵 Audio/Video File Transcription</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Audio/Video File (Max 20MB)
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept="audio/*,video/*"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <button
              onClick={testTranscribe}
              disabled={loading || !file}
              className="premium-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Transcribing...' : 'Test Transcription'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {(response || error) && (
          <div className="premium-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-white">Results</h2>
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Clear Results
              </button>
            </div>
            {error && (
              <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-4">
                <strong>Error:</strong> {error}
              </div>
            )}
            {response && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 overflow-auto">
                <pre className="text-green-300 whitespace-pre-wrap">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}