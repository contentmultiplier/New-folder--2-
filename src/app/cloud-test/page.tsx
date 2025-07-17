'use client';
import { useState } from 'react';

interface ProcessingStep {
  step: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
  duration?: number;
}

export default function CloudTestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingStep[]>([]);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [fileKey, setFileKey] = useState('');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[DEBUG] ${message}`);
  };

  const addProgress = (step: string, status: ProcessingStep['status'], message?: string, duration?: number) => {
    setProgress(prev => {
      const newProgress = [...prev];
      const existingIndex = newProgress.findIndex(p => p.step === step);
      
      if (existingIndex >= 0) {
        newProgress[existingIndex] = { step, status, message, duration };
      } else {
        newProgress.push({ step, status, message, duration });
      }
      
      return newProgress;
    });
  };

  const resetProgress = () => {
    setProgress([]);
    setResult(null);
    setError('');
    setFileKey('');
    setDebugLogs([]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      resetProgress();
      addDebugLog(`File selected: ${file.name} (${Math.round(file.size / 1024 / 1024)}MB, ${file.type})`);
    }
  };

  // Enhanced upload function with detailed error handling
  const uploadWithDetailedLogging = async (uploadUrl: string, file: File) => {
    addDebugLog('=== STARTING UPLOAD ===');
    addDebugLog(`Upload URL: ${uploadUrl.substring(0, 100)}...`);
    addDebugLog(`File: ${file.name} (${file.type}, ${file.size} bytes)`);

    try {
      // Test if the URL is accessible first
      addDebugLog('Testing upload URL accessibility...');
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
        // Add timeout handling
        signal: AbortSignal.timeout(120000), // 2 minutes timeout
      });

      addDebugLog(`Upload response status: ${uploadResponse.status}`);
      addDebugLog(`Upload response ok: ${uploadResponse.ok}`);
      
      // Log response headers
      const headers: Record<string, string> = {};
      uploadResponse.headers.forEach((value, key) => {
        headers[key] = value;
      });
      addDebugLog(`Response headers: ${JSON.stringify(headers, null, 2)}`);

      if (!uploadResponse.ok) {
        let errorText = '';
        try {
          errorText = await uploadResponse.text();
          addDebugLog(`Error response body: ${errorText}`);
        } catch (e) {
          addDebugLog('Could not read error response body');
        }
        
        throw new Error(`Upload failed with status ${uploadResponse.status}: ${errorText || uploadResponse.statusText}`);
      }

      addDebugLog('Upload completed successfully');
      return uploadResponse;

    } catch (error: any) {
      addDebugLog(`Upload error: ${error.name} - ${error.message}`);
      
      if (error.name === 'AbortError') {
        throw new Error('Upload timeout: File upload took too long (>2 minutes). Try a smaller file.');
      }
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Cannot connect to upload server. This could be a CORS issue or network problem.');
      }
      
      if (error.message.includes('CORS')) {
        throw new Error('CORS error: Upload blocked by browser security policy. Check cloud storage CORS settings.');
      }
      
      throw error;
    }
  };

  const uploadAndProcess = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setProcessing(true);
    resetProgress();
    addDebugLog('Starting upload and process workflow');

    try {
      // Step 1: Get upload URL
      addProgress('get-upload-url', 'processing', 'Getting upload URL...');
      addDebugLog('Requesting upload URL from API...');
      
      const uploadUrlResponse = await fetch('/api/cloud-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get-upload-url',
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSizeBytes: selectedFile.size,
        }),
      });

      const uploadUrlData = await uploadUrlResponse.json();
      addDebugLog(`Upload URL API response: ${JSON.stringify(uploadUrlData, null, 2)}`);
      
      if (!uploadUrlData.success) {
        throw new Error(uploadUrlData.error);
      }

      addProgress('get-upload-url', 'completed', 'Upload URL generated');
      const { uploadUrl, fileKey: newFileKey, fileUrl } = uploadUrlData.data;
      setFileKey(newFileKey);
      addDebugLog(`Generated file key: ${newFileKey}`);

      // Step 2: Upload file to cloud with enhanced error handling
      addProgress('upload', 'processing', `Uploading ${selectedFile.name}...`);
      const uploadStart = Date.now();
      
      await uploadWithDetailedLogging(uploadUrl, selectedFile);

      const uploadDuration = Date.now() - uploadStart;
      addProgress('upload', 'completed', `File uploaded successfully (${Math.round(uploadDuration/1000)}s)`, uploadDuration);
      setUploading(false);
      addDebugLog(`Upload completed in ${uploadDuration}ms`);

      // Step 3: Wait a moment for file to be available
      addProgress('prepare', 'processing', 'Preparing file for processing...');
      addDebugLog('Waiting for file to be available in cloud storage...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Increased wait time
      addProgress('prepare', 'completed', 'File ready for processing');

      // Step 4: Process file (transcribe + repurpose)
      addProgress('process', 'processing', 'Processing file (transcription + content repurposing)...');
      const processStart = Date.now();
      addDebugLog('Starting file processing...');
      
      const processResponse = await fetch('/api/cloud-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process-file',
          fileKey: newFileKey,
        }),
      });

      const processData = await processResponse.json();
      addDebugLog(`Process API response: ${JSON.stringify(processData, null, 2)}`);
      
      if (!processData.success) {
        throw new Error(processData.error);
      }

      const processDuration = Date.now() - processStart;
      addProgress('process', 'completed', `Processing completed (${Math.round(processDuration/1000)}s)`, processDuration);
      addDebugLog(`Processing completed in ${processDuration}ms`);

      // Show results
      setResult(processData.data);

    } catch (error: any) {
      console.error('Upload/process error:', error);
      addDebugLog(`ERROR: ${error.message}`);
      setError(error.message);
      
      // Mark current step as error
      setProgress(prev => {
        const newProgress = [...prev];
        const lastStep = newProgress[newProgress.length - 1];
        if (lastStep && lastStep.status === 'processing') {
          lastStep.status = 'error';
          lastStep.message = error.message;
        }
        return newProgress;
      });
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const getStepIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed': return '✅';
      case 'processing': return '⏳';
      case 'error': return '❌';
      default: return '⭕';
    }
  };

  const clearDebugLogs = () => {
    setDebugLogs([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Cloud Upload Test (Enhanced Debug)</h1>
          <p className="text-gray-300">Test: File Upload → Cloud Storage → AssemblyAI → Claude</p>
        </div>

        {/* File Upload Section */}
        <div className="premium-card mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">📁 File Upload</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Video/Audio File (Max 500MB)
              </label>
              <input
                type="file"
                onChange={handleFileSelect}
                accept="video/*,audio/*"
                disabled={processing}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none disabled:opacity-50"
              />
            </div>
            
            {selectedFile && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <p className="text-gray-300">
                  <strong>Selected:</strong> {selectedFile.name} ({Math.round(selectedFile.size / 1024 / 1024)}MB, {selectedFile.type})
                </p>
              </div>
            )}

            <button
              onClick={uploadAndProcess}
              disabled={!selectedFile || processing}
              className="premium-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing...' : 'Upload & Process File'}
            </button>
          </div>
        </div>

        {/* Debug Logs Section */}
        {debugLogs.length > 0 && (
          <div className="premium-card mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-white">🐛 Debug Logs</h2>
              <button
                onClick={clearDebugLogs}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
              >
                Clear Logs
              </button>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
              {debugLogs.map((log, index) => (
                <div key={index} className="text-green-300 text-sm font-mono mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Section */}
        {progress.length > 0 && (
          <div className="premium-card mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">📊 Processing Progress</h2>
            <div className="space-y-3">
              {progress.map((step, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                  <span className="text-2xl">{getStepIcon(step.status)}</span>
                  <div className="flex-1">
                    <p className="text-white font-medium capitalize">{step.step.replace('-', ' ')}</p>
                    {step.message && (
                      <p className="text-gray-300 text-sm">{step.message}</p>
                    )}
                    {step.duration && (
                      <p className="text-gray-400 text-xs">Duration: {Math.round(step.duration/1000)}s</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Section */}
        {error && (
          <div className="premium-card mb-8">
            <h2 className="text-2xl font-semibold text-red-400 mb-4">❌ Error</h2>
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg">
              <p className="font-bold">Error Details:</p>
              <p>{error}</p>
              <p className="text-sm mt-2 text-red-200">
                💡 Check the Debug Logs above for more technical details
              </p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="premium-card">
            <h2 className="text-2xl font-semibold text-white mb-4">✅ Results</h2>
            
            {/* Processing Time Summary */}
            {result.processingTime && (
              <div className="mb-6 p-4 bg-blue-900 border border-blue-700 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-100 mb-2">⏱️ Processing Time</h3>
                <div className="grid grid-cols-3 gap-4 text-blue-100">
                  <div>
                    <p className="text-sm">Transcription</p>
                    <p className="font-bold">{Math.round(result.processingTime.transcription/1000)}s</p>
                  </div>
                  <div>
                    <p className="text-sm">Content Repurposing</p>
                    <p className="font-bold">{Math.round(result.processingTime.repurposing/1000)}s</p>
                  </div>
                  <div>
                    <p className="text-sm">Total</p>
                    <p className="font-bold">{Math.round(result.processingTime.total/1000)}s</p>
                  </div>
                </div>
              </div>
            )}

            {/* Transcription Results */}
            {result.transcription && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">📝 Transcription</h3>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <p className="text-gray-300 mb-2">
                    <strong>Words:</strong> {result.transcription.wordCount} | 
                    <strong> Confidence:</strong> {result.transcription.confidence ? (result.transcription.confidence * 100).toFixed(1) + '%' : 'N/A'}
                  </p>
                  <div className="bg-gray-900 p-3 rounded max-h-40 overflow-y-auto">
                    <p className="text-green-300 text-sm">{result.transcription.text}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Repurposed Content */}
            {result.repurposedContent && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">🚀 Repurposed Content</h3>
                <div className="space-y-4">
                  {Object.entries(result.repurposedContent).map(([platform, content]) => (
                    <div key={platform} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                      <h4 className="text-purple-400 font-medium mb-2 capitalize">{platform}</h4>
                      <p className="text-gray-300 text-sm">{content as string}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}