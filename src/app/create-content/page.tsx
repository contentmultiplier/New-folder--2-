'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

interface ProcessingStep {
  step: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
  duration?: number;
}

interface UserTier {
  tier: string;
  jobsUsed: number;
  jobsLimit: number;
  platformAccess: string[];
}

const PLATFORM_ICONS = {
  twitter: '🐦',
  linkedin: '💼',
  facebook: '📘',
  instagram: '📸',
  youtube: '📺',
  tiktok: '🎵',
};

const PLATFORM_NAMES = {
  twitter: 'Twitter/X',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
};

const TIER_LIMITS = {
  trial: { jobs: 3, platforms: ['linkedin', 'twitter'] },
  basic: { jobs: 20, platforms: ['linkedin', 'twitter', 'facebook', 'instagram'] },
  pro: { jobs: 100, platforms: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'] },
  business: { jobs: 500, platforms: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'tiktok'] },
  enterprise: { jobs: 999999, platforms: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'tiktok'] },
};

export default function CreateContentPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // State management
  const [selectedTab, setSelectedTab] = useState<'text' | 'file'>('text');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin', 'twitter']);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingStep[]>([]);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState('');
  const [contentType, setContentType] = useState('blog_post');
  const [userTier, setUserTier] = useState<UserTier>({
    tier: 'trial',
    jobsUsed: 0,
    jobsLimit: 3,
    platformAccess: ['linkedin', 'twitter']
  });
  const [copyFeedback, setCopyFeedback] = useState<{[key: string]: boolean}>({});

  // Check authentication
  useEffect(() => {
    if (!user) {
      router.push('/auth');
    } else {
      fetchUserTier();
    }
  }, [user, router]);

  // Fetch user tier and usage
const fetchUserTier = async () => {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const response = await fetch(`/api/user-subscription?userId=${user.id}`);
    const data = await response.json();
    
    if (response.ok) {
      // Map the subscription data to our userTier format
      const tierLimits = {
        trial: { jobs: 3, platforms: ['linkedin', 'twitter'] },
        basic: { jobs: 20, platforms: ['linkedin', 'twitter', 'facebook', 'instagram'] },
        pro: { jobs: 100, platforms: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'] },
        business: { jobs: 500, platforms: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'tiktok'] },
        enterprise: { jobs: 999999, platforms: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'tiktok'] },
      };

      const userTier = data.tier || 'trial';
      const limits = tierLimits[userTier as keyof typeof tierLimits] || tierLimits.trial;
      
      setUserTier({
        tier: userTier,
        jobsUsed: data.jobs_used_this_month || 0,
        jobsLimit: limits.jobs,
        platformAccess: limits.platforms
      });
      
      // Set default platforms
      const availablePlatforms = limits.platforms;
      setSelectedPlatforms(availablePlatforms.slice(0, Math.min(2, availablePlatforms.length)));
    }
  } catch (error) {
    console.error('Error fetching user tier:', error);
  }
};

  // Helper function to get max platforms for tier
  const getMaxPlatformsForTier = (tier: string) => {
    switch (tier) {
      case 'trial': return 2;        // LinkedIn + Twitter
      case 'basic': return 4;        // LinkedIn, Twitter, Facebook, Instagram  
      case 'pro': return 5;          // + YouTube
      case 'business': return 6;     // + TikTok
      case 'enterprise': return 6;   // All 6 platforms
      default: return 2;
    }
  };

  // Check if user can create content
  const canCreateContent = () => {
    return userTier.jobsUsed < userTier.jobsLimit;
  };

  // Check if platform is available for user's tier
  const isPlatformAvailable = (platform: string) => {
    return userTier.platformAccess.includes(platform);
  };

  // Toggle platform selection
  const togglePlatform = (platform: string) => {
    if (!isPlatformAvailable(platform)) return;
    
    setSelectedPlatforms(prev => {
      if (prev.includes(platform)) {
        // Always allow deselecting
        return prev.filter(p => p !== platform);
      } else {
        // Check if we can add more platforms based on tier
        const maxPlatforms = getMaxPlatformsForTier(userTier.tier);
        
        if (prev.length >= maxPlatforms) {
          // Don't add more if at limit, but don't prevent interaction
          return prev;
        }
        return [...prev, platform];
      }
    });
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
    setCopyFeedback({});
  };

  // File handling
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      resetProgress();
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
    }
  };

  // File upload workflow
  const handleFileUpload = async (): Promise<string> => {
    if (!selectedFile) throw new Error('No file selected');

    try {
      addProgress('upload', 'processing', 'Preparing file...');
      
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

      const { uploadUrl, fileKey } = uploadUrlData.data;

      addProgress('upload', 'processing', 'Uploading file...');
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: { 'Content-Type': selectedFile.type },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed. Please try again.');
      }

      addProgress('upload', 'completed', 'File uploaded successfully');

      addProgress('transcribe', 'processing', 'Processing content...');
      
      const processResponse = await fetch('/api/cloud-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process-file',
          fileKey: fileKey,
        }),
      });

      const processData = await processResponse.json();
      
      if (!processData.success) {
        throw new Error(processData.error);
      }

      addProgress('transcribe', 'completed', 'Content processed successfully');
      return processData.data.transcription.text;

    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Content processing
const processContentWithAI = async (content: string) => {
  addProgress('generate', 'processing', 'Generating optimized content...');
  
  try {
    const res = await fetch('/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: content,
        platforms: selectedPlatforms,
        contentType
      }),
    });
    
    if (!res.ok) {
      throw new Error('Failed to process content. Please try again.');
    }
    
    const data = await res.json();
    addProgress('generate', 'completed', 'Content generated successfully');
    
    // Save content to database
    addProgress('save', 'processing', 'Saving content to your library...');
    
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        const saveRes = await fetch('/api/save-content', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            originalContent: content,
            contentType: contentType,
            selectedPlatforms: selectedPlatforms,
            platformContent: data.data.repurposedContent,
            hashtags: data.data.hashtags || {},
            fileName: selectedFile?.name || null,
            fileType: selectedFile?.type || null
          }),
        });
        
        if (saveRes.ok) {
          addProgress('save', 'completed', 'Content saved to your library');
        } else {
          addProgress('save', 'error', 'Failed to save content');
        }
      }
    } catch (saveError) {
      console.error('Save error:', saveError);
      addProgress('save', 'error', 'Failed to save content');
    }
    
    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

  // Main processing function
  const handleProcess = async () => {
    if (processing) return;
    
    if (!canCreateContent()) {
      setError(`You've reached your ${userTier.tier} plan limit of ${userTier.jobsLimit} jobs this month. Upgrade to continue creating content.`);
      return;
    }
    
    if (selectedTab === 'text' && !textContent.trim()) {
      setError('Please enter some text content');
      return;
    }
    
    if (selectedTab === 'file' && !selectedFile) {
      setError('Please select a file');
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform');
      return;
    }

    setProcessing(true);
    resetProgress();

    try {
      let contentToProcess = '';

      if (selectedTab === 'text') {
        contentToProcess = textContent.trim();
      } else {
        contentToProcess = await handleFileUpload();
      }

      const result = await processContentWithAI(contentToProcess);
      setResponse(result);
      
      // Update user tier usage
      setUserTier(prev => ({
        ...prev,
        jobsUsed: prev.jobsUsed + 1
      }));

    } catch (error: any) {
      setError(error.message);
      
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

  // Copy to clipboard with feedback
  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopyFeedback(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  // Clear functions
  const clearResults = () => {
    setResponse(null);
    setError('');
    resetProgress();
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

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'trial': return 'text-gray-400';
      case 'basic': return 'text-blue-400';
      case 'pro': return 'text-purple-400';
      case 'business': return 'text-emerald-400';
      case 'enterprise': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const contentTypeOptions = [
    { value: 'blog_post', label: 'Blog Post', icon: '📖', description: 'Transform articles into social content' },
    { value: 'video_script', label: 'Video Script', icon: '🎬', description: 'Convert videos to written content' },
    { value: 'podcast', label: 'Podcast', icon: '🎙️', description: 'Extract insights from audio content' },
    { value: 'visual_story', label: 'Visual Story', icon: '📸', description: 'Create captions from images' }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Authentication Required</h1>
          <p className="text-slate-300">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header with Tier Info */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Content Creator
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-6">
            Transform your content into platform-optimized posts with AI-powered intelligence
          </p>

          {/* Tier Status Card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 max-w-md mx-auto mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className={`font-semibold capitalize ${getTierColor(userTier.tier)}`}>
                  {userTier.tier} Plan
                </span>
              </div>
              <button
                onClick={() => router.push('/pricing')}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
              >
                Upgrade →
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-slate-300 mb-2">
                <span>Content Jobs Used</span>
                <span>{userTier.jobsUsed} / {userTier.jobsLimit}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((userTier.jobsUsed / userTier.jobsLimit) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {!canCreateContent() && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-4">
                <p className="text-red-300 text-sm font-medium">
                  ⚠️ You've reached your monthly limit. Upgrade to continue creating content.
                </p>
              </div>
            )}

            <div className="text-xs text-slate-400">
              Platform access: {userTier.platformAccess.map(p => PLATFORM_ICONS[p as keyof typeof PLATFORM_ICONS]).join(' ')}
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 mb-8">
          {/* Platform Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              Select Target Platforms
            </h2>
            <p className="text-slate-300 mb-6">Choose which platforms to optimize your content for. Premium tiers unlock more platforms.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(PLATFORM_ICONS).map(([platform, icon]) => {
                const isAvailable = isPlatformAvailable(platform);
                const isSelected = selectedPlatforms.includes(platform);
                const isLocked = !isAvailable;
                const maxPlatforms = getMaxPlatformsForTier(userTier.tier);
                const canSelect = isSelected || selectedPlatforms.length < maxPlatforms;
                
                return (
                  <button
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    disabled={isLocked || processing || (!canSelect && !isSelected)}
                    className={`relative backdrop-blur-xl border rounded-2xl p-4 text-center transition-all duration-300 ${
                      isLocked 
                        ? 'bg-slate-800/30 border-slate-600/30 opacity-50 cursor-not-allowed' 
                        : isSelected
                          ? 'bg-cyan-500/20 border-cyan-400/50 ring-2 ring-cyan-400 scale-105'
                          : canSelect
                            ? 'bg-white/10 border-white/20 hover:bg-white/20 hover:scale-105'
                            : 'bg-slate-800/30 border-slate-600/30 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {isLocked && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center">
                        <span className="text-xs">🔒</span>
                      </div>
                    )}
                    
                    <div className="text-2xl mb-2">{icon}</div>
                    <div className="text-white text-sm font-medium">
                      {PLATFORM_NAMES[platform as keyof typeof PLATFORM_NAMES]}
                    </div>
                    
                    {platform === 'tiktok' && isLocked && (
                      <div className="text-xs text-slate-400 mt-1">Business+</div>
                    )}
                    
                    {platform === 'instagram' && isLocked && (
                      <div className="text-xs text-slate-400 mt-1">Basic+</div>
                    )}
                    
                    {platform === 'youtube' && isLocked && (
                      <div className="text-xs text-slate-400 mt-1">Pro+</div>
                    )}
                    
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedPlatforms.length > 0 && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <p className="text-green-300 text-sm">
                  ✓ Selected {selectedPlatforms.length} / {getMaxPlatformsForTier(userTier.tier)} platforms: {' '}
                  {selectedPlatforms.map(p => PLATFORM_NAMES[p as keyof typeof PLATFORM_NAMES]).join(', ')}
                </p>
              </div>
            )}

            {selectedPlatforms.length === getMaxPlatformsForTier(userTier.tier) && (
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-blue-300 text-sm flex items-center gap-2">
                  <span>ℹ️</span>
                  You've selected the maximum platforms for your {userTier.tier} plan. 
                  <button
                    onClick={() => router.push('/pricing')}
                    className="text-cyan-400 hover:text-cyan-300 underline ml-1"
                  >
                    Upgrade for more platforms
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Content Type Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="text-2xl">📝</span>
              Content Type
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {contentTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setContentType(option.value)}
                  disabled={processing}
                  className={`backdrop-blur-xl border rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 ${
                    contentType === option.value 
                      ? 'bg-purple-500/20 border-purple-400/50 ring-2 ring-purple-400' 
                      : 'bg-white/10 border-white/20 hover:bg-white/20'
                  }`}
                >
                  <div className="text-3xl mb-3">{option.icon}</div>
                  <h3 className="text-white font-semibold mb-2">{option.label}</h3>
                  <p className="text-slate-400 text-sm">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {setSelectedTab('text'); resetProgress();}}
              disabled={processing}
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
              disabled={processing}
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
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste your content here... (articles, social posts, video scripts, podcast notes, etc.)"
                disabled={processing}
                className="w-full h-48 bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-vertical"
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
                  className="backdrop-blur-xl bg-white/10 border-2 border-dashed border-white/30 rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 hover:border-purple-400 hover:bg-purple-500/5"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleFileDrop}
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <div className="text-6xl mb-4">☁️</div>
                  <h3 className="text-white text-xl font-medium mb-2">Drop files here or click to select</h3>
                  <p className="text-slate-400 mb-4">Videos, Audio, Documents (Max 500MB)</p>
                  <div className="text-xs text-slate-500">
                    Supported: MP4, MOV, MP3, WAV, M4A, AAC, PDF, DOCX, TXT
                  </div>
                  <input
                    id="fileInput"
                    type="file"
                    onChange={handleFileSelect}
                    accept="video/*,audio/*,.txt,.md,.doc,.docx,.pdf"
                    className="hidden"
                    disabled={processing}
                  />
                </div>
              ) : (
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4">
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
                      disabled={processing}
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
              disabled={!isFormValid() || processing || !canCreateContent() || selectedPlatforms.length === 0}
              className={`bg-gradient-to-r from-cyan-400 to-purple-400 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/25 w-full md:w-auto ${
                (!isFormValid() || processing || !canCreateContent() || selectedPlatforms.length === 0) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
            >
              {processing ? (
                <>
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></span>
                  Processing...
                </>
              ) : (
                <>
                  <span className="mr-3">🚀</span>
                  Transform Content with AI ({userTier.jobsLimit - userTier.jobsUsed} left)
                </>
              )}
            </button>
            
            {(!isFormValid() || selectedPlatforms.length === 0) && !processing && canCreateContent() && (
              <p className="text-slate-400 text-sm mt-3">
                {selectedTab === 'text' && !textContent.trim() && 'Add content above to get started'}
                {selectedTab === 'file' && !selectedFile && 'Select a file to get started'}
                {selectedPlatforms.length === 0 && 'Select at least one platform to get started'}
              </p>
            )}

            {/* Platform Preview */}
            {isFormValid() && selectedPlatforms.length > 0 && !processing && canCreateContent() && (
              <div className="flex justify-center items-center gap-2 mt-4 pt-4 border-t border-white/20">
                <span className="text-slate-400 text-sm mr-2">Will optimize for:</span>
                {selectedPlatforms.map(platform => (
                  <span key={platform} className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded text-xs flex items-center gap-1">
                    <span>{PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS]}</span>
                    {PLATFORM_NAMES[platform as keyof typeof PLATFORM_NAMES]}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Processing Progress */}
        {progress.length > 0 && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 mb-8">
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-3xl p-6 mb-8">
            <h3 className="font-bold text-lg mb-2 text-red-300 flex items-center gap-2">
              <span>❌</span>
              Error
            </h3>
            <p className="text-red-200">{error}</p>
            {error.includes('limit') && (
              <div className="mt-4">
                <button
                  onClick={() => router.push('/pricing')}
                  className="bg-gradient-to-r from-cyan-400 to-purple-400 text-white font-semibold px-6 py-2 rounded-xl hover:scale-105 transition-all duration-300"
                >
                  Upgrade Plan →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results Display */}
        {response && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                <span className="text-2xl">✅</span>
                Generated Content
              </h2>
              <button
                onClick={clearResults}
                className="px-6 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                Clear Results
              </button>
            </div>

            {/* Platform Content */}
            {response.data?.repurposedContent && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <span className="text-xl">🎯</span>
                  Platform-Optimized Content
                </h3>
                <div className="grid gap-4">
                  {Object.entries(response.data.repurposedContent).map(([platform, content]) => {
                    const platformIcon = PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS];
                    const platformName = PLATFORM_NAMES[platform as keyof typeof PLATFORM_NAMES];
                    const copyKey = `content-${platform}`;
                    
                    return (
                      <div key={platform} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-white font-semibold flex items-center gap-2">
                            <span className="text-xl">{platformIcon}</span>
                            {platformName}
                          </h4>
                          <button
                            onClick={() => copyToClipboard(content as string, copyKey)}
                            className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                              copyFeedback[copyKey] 
                                ? 'bg-green-500/20 text-green-300' 
                                : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30'
                            }`}
                          >
                            {copyFeedback[copyKey] ? '✅ Copied!' : '📋 Copy'}
                          </button>
                        </div>
                        <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                          {content as string}
                        </p>
                      </div>
                    );
                  })}
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
                <div className="grid gap-4">
                  {Object.entries(response.data.hashtags).map(([platform, hashtags]) => {
                    const platformIcon = PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS];
                    const platformName = PLATFORM_NAMES[platform as keyof typeof PLATFORM_NAMES];
                    const copyKey = `hashtags-${platform}`;
                    
                    return (
                      <div key={platform} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-white font-semibold flex items-center gap-2">
                            <span className="text-xl">{platformIcon}</span>
                            {platformName} Hashtags
                          </h4>
                          <button
                            onClick={() => {
                              const hashtagText = (hashtags as string[]).join(' ');
                              copyToClipboard(hashtagText, copyKey);
                            }}
                            className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                              copyFeedback[copyKey] 
                                ? 'bg-green-500/20 text-green-300' 
                                : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                            }`}
                          >
                            {copyFeedback[copyKey] ? '✅ Copied!' : '📋 Copy All'}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(hashtags as string[]).map((hashtag, index) => (
                            <button
                              key={index}
                              onClick={() => copyToClipboard(hashtag, `hashtag-${platform}-${index}`)}
                              className={`px-3 py-1 rounded-full text-sm transition-all duration-300 cursor-pointer ${
                                copyFeedback[`hashtag-${platform}-${index}`] 
                                  ? 'bg-green-500/20 text-green-300' 
                                  : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                              }`}
                              title="Click to copy"
                            >
                              {hashtag}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Success Message */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-green-300 font-semibold text-lg mb-2">Content Successfully Generated!</h3>
              <p className="text-green-200 text-sm mb-4">
                Your content has been optimized for {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''}. 
                You have {userTier.jobsLimit - userTier.jobsUsed - 1} jobs remaining this month.
              </p>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-purple-400 text-white rounded-xl hover:scale-105 transition-all duration-300"
                >
                  Create More Content
                </button>
                <button
                  onClick={() => router.push('/history')}
                  className="px-6 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors"
                >
                  View History
                </button>
              </div>
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

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .grid-cols-6 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          
          .grid-cols-4 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .grid-cols-6,
          .grid-cols-4,
          .grid-cols-3,
          .grid-cols-2 {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }
          
          .text-6xl {
            font-size: 3rem;
          }
          
          .text-4xl {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}