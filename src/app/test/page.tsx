'use client';

import { useState } from 'react';

export default function TestPage() {
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('complete');

  // Test complete workflow
  const testCompleteWorkflow = async () => {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      let response;

      if (file) {
        // Test with file upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('generateHashtags', 'true');

        response = await fetch('/api/process', {
          method: 'POST',
          body: formData,
        });
      } else if (textInput.trim()) {
        // Test with text input
        response = await fetch('/api/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: textInput,
            generateHashtags: true,
          }),
        });
      } else {
        setError('Please provide either text input or upload a file');
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setResults(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Test individual repurpose API
  const testRepurpose = async () => {
    if (!textInput.trim()) {
      setError('Please enter some text');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('/api/repurpose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textInput }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setResults(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Test hashtag generation API
  const testHashtags = async () => {
    if (!textInput.trim()) {
      setError('Please enter some text');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('/api/hashtags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: textInput,
          platforms: ['twitter', 'linkedin', 'instagram', 'facebook', 'youtube']
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setResults(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Test transcription API
  const testTranscription = async () => {
    if (!file) {
      setError('Please select an audio or video file');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setResults(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            ContentMux API Test Interface
          </h1>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6">
            {[
              { id: 'complete', label: 'Complete Workflow' },
              { id: 'repurpose', label: 'Repurpose Only' },
              { id: 'hashtags', label: 'Hashtags Only' },
              { id: 'transcribe', label: 'Transcribe Only' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md font-medium ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Input Section */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Input
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter your content here..."
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Upload (Audio/Video)
              </label>
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {file && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-6">
            {activeTab === 'complete' && (
              <button
                onClick={testCompleteWorkflow}
                disabled={loading || (!textInput.trim() && !file)}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Test Complete Workflow'}
              </button>
            )}

            {activeTab === 'repurpose' && (
              <button
                onClick={testRepurpose}
                disabled={loading || !textInput.trim()}
                className="w-full bg-green-500 text-white py-3 px-6 rounded-md font-medium hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Test Content Repurposing'}
              </button>
            )}

            {activeTab === 'hashtags' && (
              <button
                onClick={testHashtags}
                disabled={loading || !textInput.trim()}
                className="w-full bg-purple-500 text-white py-3 px-6 rounded-md font-medium hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Test Hashtag Generation'}
              </button>
            )}

            {activeTab === 'transcribe' && (
              <button
                onClick={testTranscription}
                disabled={loading || !file}
                className="w-full bg-orange-500 text-white py-3 px-6 rounded-md font-medium hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Test Transcription'}
              </button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="text-red-800">
                  <h3 className="text-sm font-medium">Error</h3>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-lg font-medium text-green-800 mb-3">Results</h3>
              <pre className="text-sm text-green-700 overflow-auto bg-white p-3 rounded border">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}