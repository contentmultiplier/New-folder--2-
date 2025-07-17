'use client';
import { useState } from 'react';

export default function TestPage() {
  const [input, setInput] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
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

  const testRepurpose = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
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

  // NEW: Test URL transcription with AssemblyAI
  const testUrlTranscription = async () => {
    if (!audioUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: audioUrl.trim() }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError('Error testing URL transcription');
    }
    setLoading(false);
  };

  // NEW: Test complete workflow from URL
  const testCompleteWorkflow = async () => {
    if (!audioUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // First transcribe the URL
      const transcribeRes = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: audioUrl.trim() }),
      });
      const transcribeData = await transcribeRes.json();
      
      if (!transcribeRes.ok) {
        throw new Error(transcribeData.error || 'Transcription failed');
      }

      // Then process the transcribed text
      const processRes = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: transcribeData.data.text }),
      });
      const processData = await processRes.json();
      
      // Combine both results
      setResponse({
        transcription: transcribeData,
        processing: processData,
        workflow: 'URL → Transcript → Repurposed Content + Hashtags'
      });
    } catch (err: any) {
      setError(err.message || 'Error testing complete workflow');
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
          <p className="text-gray-300">Test all API endpoints with URL transcription (AssemblyAI)</p>
        </div>

        {/* URL Transcription Section */}
        <div className="premium-card mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">🎵 Audio/Video URL Transcription</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Audio/Video URL (YouTube, SoundCloud, direct audio links, etc.)
              </label>
              <input
                type="url"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://soundcloud.com/... or direct audio URL"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={testUrlTranscription}
                disabled={loading || !audioUrl}
                className="premium-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Transcribing...' : 'Test URL Transcription'}
              </button>
              <button
                onClick={testCompleteWorkflow}
                disabled={loading || !audioUrl}
                className="premium-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing Full Workflow...' : 'Test Complete Workflow (URL → Content)'}
              </button>
            </div>
            <div className="bg-blue-900 border border-blue-700 text-blue-100 px-4 py-3 rounded-lg">
              <p className="text-sm">
                <strong>Supported:</strong> YouTube, SoundCloud, Podcast URLs, Direct audio/video links (.mp3, .mp4, .wav, etc.)
              </p>
            </div>
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