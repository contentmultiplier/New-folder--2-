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
  const [contentType, setContentType] = useState('blog_post');
  const [priority, setPriority] = useState('normal');

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
  const handleFileUpload = async (): Promise<string> => {
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
      // Use the same API call format as the working test page
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        addDebugLog(`API Error Response: ${errorText}`);
        throw new Error(`API error ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      const processDuration = Date.now() - processStart;
      
      addProgress('process', 'completed', `AI processing completed (${Math.round(processDuration/1000)}s)`, processDuration);
      addDebugLog(`System 2 processing successful: ${JSON.stringify(data, null, 2)}`);
      
      return data;
    } catch (error: any) {
      addDebugLog(`System 2 processing error: ${error.message}`);
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
        contentToProcess = await handleFileUpload();
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

  // Content type options
  const contentTypeOptions = [
    { 
      value: 'blog_post', 
      label: 'Blog Post', 
      icon: '📖',
      description: 'Transform articles into social content',
    },
    { 
      value: 'video_script', 
      label: 'Video Script', 
      icon: '🎬',
      description: 'Convert videos to written content',
    },
    { 
      value: 'podcast', 
      label: 'Podcast', 
      icon: '🎙️',
      description: 'Extract insights from audio content',
    },
    { 
      value: 'visual_story', 
      label: 'Visual Story', 
      icon: '📸',
      description: 'Create captions from images',
    }
  ];

  // Priority options
  const priorityOptions = [
    { value: 'high', label: '⚡ Premium Speed', description: 'Fastest processing' },
    { value: 'normal', label: '🚀 Balanced', description: 'Optimal balance' },
    { value: 'low', label: '💎 Max Intelligence', description: 'Enhanced insights' },
    { value: 'batch', label: '⏱️ Comprehensive', description: 'Deep analysis' }
  ];
  return (
    <div className="min-h-screen page-container">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="gradient-text mb-4">
            ✨ AI Content Creator
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Transform your content into 5 platform-optimized posts with AI-powered strategic insights and hashtag intelligence
          </p>
        </div>

        {/* Main Content Card */}
        <div className="premium-card p-8 mb-8">
          {/* Content Type Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              What type of content are you working with?
            </h2>
            <p className="text-slate-300 mb-6">Choose your content type for optimized AI intelligence and platform-specific strategies.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {contentTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setContentType(option.value)}
                  className={`premium-card p-6 text-center transition-all duration-300 hover:scale-105 ${
                    contentType === option.value 
                      ? 'ring-2 ring-blue-400 bg-blue-500/10' 
                      : 'hover:bg-slate-700/30'
                  }`}
                >
                  <div className="text-3xl mb-3">{option.icon}</div>
                  <h3 className="text-white font-semibold mb-2">{option.label}</h3>
                  <p className="text-slate-400 text-sm">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Processing Priority */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Processing Priority</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPriority(option.value)}
                  className={`premium-card p-4 text-center transition-all duration-300 ${
                    priority === option.value 
                      ? 'ring-2 ring-purple-400 bg-purple-500/10' 
                      : 'hover:bg-slate-700/30'
                  }`}
                >
                  <div className="text-lg mb-1">{option.label.split(' ')[0]}</div>
                  <div className="text-white font-medium text-sm">{option.label.substring(2)}</div>
                  <div className="text-slate-400 text-xs mt-1">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {setSelectedTab('text'); resetProgress();}}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                selectedTab === 'text' 
                  ? 'bg-blue-500/20 text-blue-300 ring-2 ring-blue-400' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
              }`}
            >
              <span className="text-xl">📝</span>
              Text Content
            </button>
            <button
              onClick={() => {setSelectedTab('file'); resetProgress();}}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                selectedTab === 'file' 
                  ? 'bg-purple-500/20 text-purple-300 ring-2 ring-purple-400' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
              }`}
            >
              <span className="text-xl">📁</span>
              File Upload
            </button>
          </div>

          {/* Text Content Tab */}
          {selectedTab === 'text' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={loadSampleContent}
                  className="premium-button-secondary"
                >
                  <span className="mr-2">✨</span>
                  Use Sample Content
                </button>
                <span className="text-slate-400 text-sm">or paste your content below</span>
              </div>

              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste your content here..."
                className="premium-input h-48 resize-vertical"
                rows={8}
              />
              
              <div className="flex justify-between items-center text-sm text-slate-400">
                <div className="flex gap-4">
                  <span>{textContent.length} characters</span>
                  <span>~{textContent.trim() ? textContent.trim().split(/\s+/).length : 0} words</span>
                </div>
                {textContent.length > 0 && (
                  <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-medium">
                    Ready to process
                  </span>
                )}
              </div>
            </div>
          )}

          {/* File Upload Tab */}
          {selectedTab === 'file' && (
            <div className="space-y-4">
              {!selectedFile ? (
                <div
                  className="premium-card border-2 border-dashed border-slate-600 rounded-xl p-12 text-center cursor-pointer transition-all duration-300 hover:border-purple-400 hover:bg-purple-500/5"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleFileDrop}
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <div className="text-6xl mb-4">☁️</div>
                  <h3 className="text-white text-xl font-medium mb-2">Click to select files or drag and drop</h3>
                  <p className="text-slate-400 mb-4">Videos, Audio, Documents (Max 500MB)</p>
                  <div className="text-xs text-slate-500">
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
                <div className="premium-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-2xl">
                        📄
                      </div>
                      <div>
                        <p className="text-white font-medium">{selectedFile.name}</p>
                        <p className="text-slate-400 text-sm">{Math.round(selectedFile.size / 1024 / 1024)}MB</p>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="text-slate-400 hover:text-red-400 transition-colors text-xl"
                    >
                      ✖️
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
              className={`premium-button w-full md:w-auto text-lg px-8 py-4 ${
                (!isFormValid() || processing) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {processing ? (
                <>
                  <span className="loading-spinner inline-block mr-3"></span>
                  Processing...
                </>
              ) : (
                <>
                  <span className="mr-3">🚀</span>
                  Transform Content with AI Intelligence
                </>
              )}
            </button>
            
            {!isFormValid() && !processing && (
              <p className="text-slate-400 text-sm mt-3">
                {selectedTab === 'text' ? 'Add content above to get started' : 'Select a file to get started'}
              </p>
            )}

            {/* Platform Preview */}
            {isFormValid() && !processing && (
              <div className="flex justify-center items-center gap-2 mt-4 pt-4 border-t border-slate-700">
                <span className="text-slate-400 text-sm mr-2">Will optimize for:</span>
                {['Twitter', 'LinkedIn', 'Instagram', 'Facebook', 'YouTube'].map(platform => (
                  <span key={platform} className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded text-xs">
                    {platform}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Processing Progress */}
        {progress.length > 0 && (
          <div className="premium-card p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="text-2xl">📊</span>
              Processing Progress
            </h2>
            <div className="space-y-3">
              {progress.map((step, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-slate-800/50 rounded-xl">
                  <span className="text-2xl">{getStepIcon(step.status)}</span>
                  <div className="flex-1">
                    <p className="text-white font-medium capitalize">{step.step.replace('-', ' ')}</p>
                    {step.message && (
                      <p className="text-slate-300 text-sm">{step.message}</p>
                    )}
                    {step.duration && (
                      <p className="text-slate-400 text-xs">Duration: {Math.round(step.duration/1000)}s</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Logs */}
        {debugLogs.length > 0 && (
          <div className="premium-card p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                <span className="text-2xl">🐛</span>
                Debug Logs
              </h2>
              <button
                onClick={clearDebugLogs}
                className="premium-button-secondary"
              >
                Clear Logs
              </button>
            </div>
            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 max-h-64 overflow-y-auto">
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
          <div className="error-message mb-8">
            <h3 className="font-bold text-lg mb-2">❌ Error</h3>
            <p>{error}</p>
            <p className="text-sm mt-2 opacity-80">
              💡 Check the Debug Logs above for more technical details
            </p>
          </div>
        )}

        {/* Results Display */}
        {response && (
          <div className="premium-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                <span className="text-2xl">✅</span>
                Results
              </h2>
              <button
                onClick={clearResults}
                className="premium-button-secondary"
              >
                Clear Results
              </button>
            </div>

            {/* Repurposed Content */}
            {response.data?.repurposedContent && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <span className="text-xl">🚀</span>
                  Platform-Optimized Content
                </h3>
                <div className="space-y-4">
                  {Object.entries(response.data.repurposedContent).map(([platform, content]) => (
                    <div key={platform} className="premium-card p-4">
                      <h4 className="text-blue-300 font-medium mb-3 capitalize flex items-center gap-2">
                        <span className="text-lg">
                          {platform === 'twitter' && '🐦'}
                          {platform === 'linkedin' && '💼'}
                          {platform === 'instagram' && '📸'}
                          {platform === 'facebook' && '📘'}
                          {platform === 'youtube' && '📺'}
                        </span>
                        {platform}
                      </h4>
                      <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{content as string}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hashtags */}
            {response.data?.hashtags && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <span className="text-xl">#️⃣</span>
                  Platform-Specific Hashtags
                </h3>
                <div className="space-y-4">
                  {Object.entries(response.data.hashtags).map(([platform, hashtags]) => (
                    <div key={platform} className="premium-card p-4">
                      <h4 className="text-purple-300 font-medium mb-3 capitalize flex items-center gap-2">
                        <span className="text-lg">
                          {platform === 'twitter' && '🐦'}
                          {platform === 'linkedin' && '💼'}
                          {platform === 'instagram' && '📸'}
                          {platform === 'facebook' && '📘'}
                          {platform === 'youtube' && '📺'}
                        </span>
                        {platform}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(hashtags as string[]).map((hashtag, index) => (
                          <span key={index} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
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
            <div className="premium-card p-4 bg-slate-900/50">
              <h4 className="text-slate-400 font-medium mb-3 flex items-center gap-2">
                <span className="text-lg">🔍</span>
                Raw Response (Debug)
              </h4>
              <pre className="text-green-300 text-xs overflow-auto max-h-64 bg-slate-900/80 p-4 rounded-xl border border-slate-700">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
     {/* Custom Styles */}
      <style jsx>{`
        .dragover {
          border-color: rgb(168 85 247) !important;
          background-color: rgba(168, 85, 247, 0.1) !important;
          transform: scale(1.02);
        }

        .premium-card:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
        }

        .premium-button:hover {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          transform: translateY(-1px);
        }

        .premium-button-secondary:hover {
          background: rgba(30, 41, 59, 0.9);
          border-color: rgba(71, 85, 105, 0.8);
        }

        .premium-input:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.2);
        }

        /* Animation for processing */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Gradient text animation */
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .gradient-text {
          background: linear-gradient(135deg, #60a5fa 0%, #a855f7 50%, #ec4899 100%);
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.8);
          border-radius: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 1);
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .premium-card {
            margin: 1rem;
            padding: 1.5rem;
          }
          
          .grid-cols-4 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          
          .text-6xl {
            font-size: 3rem;
          }
          
          h1 {
            font-size: 2rem;
          }
          
          .text-xl {
            font-size: 1.125rem;
          }
        }

        @media (max-width: 640px) {
          .grid-cols-4,
          .grid-cols-2 {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }
          
          .flex.gap-4 {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .premium-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
} 