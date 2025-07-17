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
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      resetProgress();
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

    try {
      // Step 1: Get upload URL
      addProgress('get-upload-url', 'processing', 'Getting upload URL...');
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
      
      if (!uploadUrlData.success) {
        throw new Error(uploadUrlData.error);
      }

      addProgress('get-upload-url', 'completed', 'Upload URL generated');
      const { uploadUrl, fileKey: newFileKey, fileUrl } = uploadUrlData.data;
      setFileKey(newFileKey);

      // Step 2: Upload file to cloud
      addProgress('upload', 'processing', `Uploading ${selectedFile.name}...`);
      const uploadStart = Date.now();
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      const uploadDuration = Date.now() - uploadStart;
      addProgress('upload', 'completed', `File uploaded successfully (${Math.round(uploadDuration/1000)}s)`, uploadDuration);
      setUploading(false);

      // Step 3: Wait a moment for file to be available
      addProgress('prepare', 'processing', 'Preparing file for processing...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      addProgress('prepare', 'completed', 'File ready for processing');

      // Step 4: Process file (transcribe + repurpose)
      addProgress('process', 'processing', 'Processing file (transcription + content repurposing)...');
      const processStart = Date.now();
      
      const processResponse = await fetch('/api/cloud-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process-file',
          fileKey: newFileKey,
        }),
      });

      const processData = await processResponse.json();
      
      if (!processData.success) {
        throw new Error(processData.error);
      }

      const processDuration = Date.now() - processStart;
      addProgress('process', 'completed', `Processing completed (${Math.round(processDuration/1000)}s)`, processDuration);

      // Show results
      setResult(processData.data);

    } catch (error: any) {
      console.error('Upload/process error:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Cloud Upload Test</h1>
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
                  <strong>Selected:</strong> {selectedFile.name} ({Math.round(selectedFile.size / 1024 / 1024)}MB)
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
              <p>{error}</p>
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