'use client';
import { useState } from 'react';

interface ProcessingStep {
  step: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
  duration?: number;
}

export default function CreateContentPage() {
  // State management
  const [selectedTab, setSelectedTab] = useState<'text' | 'file'>('text');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingStep[]>([]);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState('');
  const [fileKey, setFileKey] = useState('');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // Debug logging
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[DEBUG] ${message}`);
  };

  // Progress management
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
    setResponse(null);
    setError('');
    setFileKey('');
    setDebugLogs([]);
  };
  // File handling
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      resetProgress();
      addDebugLog(`File selected: ${file.name} (${Math.round(file.size / 1024 / 1024)}MB, ${file.type})`);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.currentTarget.classList.remove('dragover');
  };

  const handleFileDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFile(files[0]);
      resetProgress();
      addDebugLog(`File dropped: ${files[0].name} (${Math.round(files[0].size / 1024 / 1024)}MB, ${files[0].type})`);
    }
  };

  // Enhanced upload function
  const uploadWithDetailedLogging = async (uploadUrl: string, file: File) => {
    addDebugLog('=== STARTING UPLOAD ===');
    addDebugLog(`Upload URL: ${uploadUrl.substring(0, 100)}...`);
    addDebugLog(`File: ${file.name} (${file.type}, ${file.size} bytes)`);

    try {
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
        signal: AbortSignal.timeout(120000), // 2 minutes timeout
      });

      addDebugLog(`Upload response status: ${uploadResponse.status}`);
      addDebugLog(`Upload response ok: ${uploadResponse.ok}`);

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
      
      throw error;
    }
  };
  // File upload workflow (System 1) → Text extraction
  const processFileUpload = async (): Promise<string> => {
    if (!selectedFile) throw new Error('No file selected');

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
      const { uploadUrl, fileKey: newFileKey } = uploadUrlData.data;
      setFileKey(newFileKey);
      addDebugLog(`Generated file key: ${newFileKey}`);

      // Step 2: Upload file to cloud
      addProgress('upload', 'processing', `Uploading ${selectedFile.name}...`);
      const uploadStart = Date.now();
      
      await uploadWithDetailedLogging(uploadUrl, selectedFile);

      const uploadDuration = Date.now() - uploadStart;
      addProgress('upload', 'completed', `File uploaded successfully (${Math.round(uploadDuration/1000)}s)`, uploadDuration);
      addDebugLog(`Upload completed in ${uploadDuration}ms`);

      // Step 3: Wait for file availability
      addProgress('prepare', 'processing', 'Preparing file for processing...');
      addDebugLog('Waiting for file to be available in cloud storage...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      addProgress('prepare', 'completed', 'File ready for processing');

      // Step 4: Transcribe file (System 1)
      addProgress('transcribe', 'processing', 'Transcribing content...');
      const transcribeStart = Date.now();
      addDebugLog('Starting file transcription...');
      
      const processResponse = await fetch('/api/cloud-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process-file',
          fileKey: newFileKey,
        }),
      });

      const processData = await processResponse.json();
      addDebugLog(`Transcription API response: ${JSON.stringify(processData, null, 2)}`);
      
      if (!processData.success) {
        throw new Error(processData.error);
      }

      const transcribeDuration = Date.now() - transcribeStart;
      addProgress('transcribe', 'completed', `Transcription completed (${Math.round(transcribeDuration/1000)}s)`, transcribeDuration);
      addDebugLog(`Transcription completed in ${transcribeDuration}ms`);

      // Return the transcribed text for System 2 processing
      return processData.data.transcription.text;

    } catch (error: any) {
      throw new Error(`File processing failed: ${error.message}`);
    }
  };

  // System 2 Content Processing (Advanced Claude APIs)
  const processContentWithSystem2 = async (content: string) => {
    addProgress('process', 'processing', 'Processing with advanced AI intelligence...');
    const processStart = Date.now();
    
    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      const processDuration = Date.now() - processStart;
      
      addProgress('process', 'completed', `AI processing completed (${Math.round(processDuration/1000)}s)`, processDuration);
      
      return data;
    } catch (error: any) {
      throw new Error(`Content processing failed: ${error.message}`);
    }
  };
  // Main processing function
  const handleProcess = async () => {
    if (processing) return;
    
    // Validate input
    if (selectedTab === 'text' && !textContent.trim()) {
      setError('Please enter some text content');
      return;
    }
    
    if (selectedTab === 'file' && !selectedFile) {
      setError('Please select a file');
      return;
    }

    setProcessing(true);
    resetProgress();
    addDebugLog('Starting content processing workflow');

    try {
      let contentToProcess = '';

      if (selectedTab === 'text') {
        // Direct text processing
        contentToProcess = textContent.trim();
        addDebugLog('Using direct text input');
      } else {
        // File upload workflow → transcription → text
        addDebugLog('Starting file upload and transcription workflow');
        contentToProcess = await processFileUpload();
        addDebugLog(`Transcribed text length: ${contentToProcess.length} characters`);
      }

      // Process with System 2 (Advanced Claude processing)
      addDebugLog('Processing with System 2 advanced APIs');
      const result = await processContentWithSystem2(contentToProcess);
      
      setResponse(result);
      addDebugLog('Processing completed successfully');

    } catch (error: any) {
      console.error('Processing error:', error);
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
      setProcessing(false);
    }
  };

  // Sample content function
  const loadSampleContent = () => {
    const sampleText = "Here's a comprehensive guide to building a successful content strategy in 2025. Content marketing has evolved dramatically, with creators now needing to produce 10x more content while maintaining quality. The key is strategic repurposing - taking one piece of high-quality content and transforming it into multiple formats optimized for different platforms. This approach not only saves time but ensures consistent messaging across all channels while maximizing reach and engagement. Studies show that 73% of successful creators use repurposing as their primary content multiplication strategy.";
    setTextContent(sampleText);
    addDebugLog('Sample content loaded');
  };

  // Clear functions
  const clearResults = () => {
    setResponse(null);
    setError('');
    resetProgress();
  };

  const clearDebugLogs = () => {
    setDebugLogs([]);
  };

  const removeFile = () => {
    setSelectedFile(null);
    resetProgress();
  };

  // UI Helper functions
  const getStepIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed': return '✅';
      case 'processing': return '⏳';
      case 'error': return '❌';
      default: return '⭕';
    }
  };

  const isFormValid = () => {
    if (selectedTab === 'text') return textContent.trim().length > 0;
    if (selectedTab === 'file') return selectedFile !== null;
    return false;
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">ContentMux AI Content Creator</h1>
          <p className="text-gray-300">Transform your content into 5 platform-optimized posts with AI-powered strategic insights</p>
        </div>

        {/* Main Content Card */}
        <div className="premium-card mb-8">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {setSelectedTab('text'); resetProgress();}}
              className={`tab-button ${selectedTab === 'text' ? 'active' : ''}`}
            >
              <i className="fas fa-file-text mr-2"></i>
              Text Content
            </button>
            <button
              onClick={() => {setSelectedTab('file'); resetProgress();}}
              className={`tab-button ${selectedTab === 'file' ? 'active' : ''}`}
            >
              <i className="fas fa-upload mr-2"></i>
              File Upload
            </button>
          </div>

          {/* Text Content Tab */}
          {selectedTab === 'text' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={loadSampleContent}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <i className="fas fa-sparkles mr-2"></i>
                  Use Sample Content
                </button>
                <span className="text-gray-400 text-sm">or paste your content below</span>
              </div>

              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste your content here..."
                className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none resize-vertical"
                rows={8}
              />
              
              <div className="flex justify-between items-center text-sm text-gray-400">
                <div className="flex gap-4">
                  <span>{textContent.length} characters</span>
                  <span>~{textContent.trim() ? textContent.trim().split(/\s+/).length : 0} words</span>
                </div>
                {textContent.length > 0 && (
                  <span className="bg-green-900 text-green-100 px-2 py-1 rounded text-xs">Ready to process</span>
                )}
              </div>
            </div>
          )}

          {/* File Upload Tab */}
          {selectedTab === 'file' && (
            <div className="space-y-4">
              {!selectedFile ? (
                <div
                  className="upload-zone border-2 border-dashed border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-purple-400 transition-colors"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleFileDrop}
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <i className="fas fa-cloud-upload-alt text-4xl text-purple-400 mb-4"></i>
                  <h3 className="text-white text-lg font-medium mb-2">Click to select files or drag and drop</h3>
                  <p className="text-gray-400 text-sm mb-4">Videos, Audio, Documents (Max 500MB)</p>
                  <div className="text-xs text-gray-500">
                    Supported: MP4, MOV, MP3, WAV, M4A, AAC, etc.
                  </div>
                  <input
                    id="fileInput"
                    type="file"
                    onChange={handleFileSelect}
                    accept="video/*,audio/*,.txt,.md,.doc,.docx,.pdf"
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <i className="fas fa-file text-white"></i>
                      </div>
                      <div>
                        <p className="text-white font-medium">{selectedFile.name}</p>
                        <p className="text-gray-400 text-sm">{Math.round(selectedFile.size / 1024 / 1024)}MB</p>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Process Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleProcess}
              disabled={!isFormValid() || processing}
              className="premium-button disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
            >
              {processing ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-magic mr-2"></i>
                  Transform Content with AI Intelligence
                </>
              )}
            </button>
            
            {!isFormValid() && !processing && (
              <p className="text-gray-400 text-sm mt-2">
                {selectedTab === 'text' ? 'Add content above to get started' : 'Select a file to get started'}
              </p>
            )}
          </div>
        </div>
        {/* Processing Progress */}
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

        {/* Debug Logs */}
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

        {/* Error Display */}
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

        {/* Results Display */}
        {response && (
          <div className="premium-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-white">✅ Results</h2>
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Clear Results
              </button>
            </div>

            {/* Repurposed Content */}
            {response.data?.repurposedContent && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">🚀 Platform-Optimized Content</h3>
                <div className="space-y-4">
                  {Object.entries(response.data.repurposedContent).map(([platform, content]) => (
                    <div key={platform} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                      <h4 className="text-purple-400 font-medium mb-2 capitalize flex items-center">
                        <i className={`fab fa-${platform === 'youtube' ? 'youtube' : platform === 'linkedin' ? 'linkedin' : platform === 'instagram' ? 'instagram' : platform === 'facebook' ? 'facebook' : 'twitter'} mr-2`}></i>
                        {platform}
                      </h4>
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">{content as string}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hashtags */}
            {response.data?.hashtags && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">#️⃣ Platform-Specific Hashtags</h3>
                <div className="space-y-4">
                  {Object.entries(response.data.hashtags).map(([platform, hashtags]) => (
                    <div key={platform} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                      <h4 className="text-blue-400 font-medium mb-2 capitalize flex items-center">
                        <i className={`fab fa-${platform === 'youtube' ? 'youtube' : platform === 'linkedin' ? 'linkedin' : platform === 'instagram' ? 'instagram' : platform === 'facebook' ? 'facebook' : 'twitter'} mr-2`}></i>
                        {platform}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(hashtags as string[]).map((hashtag, index) => (
                          <span key={index} className="bg-blue-900 text-blue-100 px-2 py-1 rounded text-xs">
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw JSON for debugging */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h4 className="text-gray-400 font-medium mb-2">Raw Response (Debug)</h4>
              <pre className="text-green-300 text-xs overflow-auto max-h-64">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .premium-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .tab-button {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px 24px;
          color: #a0a0a0;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          font-weight: 500;
        }

        .tab-button.active {
          background: rgba(139, 92, 246, 0.2);
          border-color: #8b5cf6;
          color: white;
        }

        .tab-button:hover:not(.active) {
          border-color: #8b5cf6;
          color: white;
        }

        .premium-button {
          background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
          border: none;
          border-radius: 12px;
          padding: 16px 32px;
          color: white;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .premium-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
        }

        .premium-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .upload-zone.dragover {
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.1);
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}