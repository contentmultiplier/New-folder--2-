// ContentMux Transcription API Route
// Updated to handle YouTube URLs and direct audio URLs with AssemblyAI

import { NextRequest, NextResponse } from 'next/server';
import { transcribeFromUrl, transcribeAudioFile } from '@/lib/api-utils';

// YouTube helper functions (inline to avoid import issues)
function isYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  return youtubeRegex.test(url);
}

function extractYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

async function extractYouTubeAudioUrl(videoId: string): Promise<string | null> {
  try {
    if (!process.env.RAPIDAPI_KEY) {
      throw new Error('RapidAPI key not configured. Please add RAPIDAPI_KEY to environment variables.');
    }

    const response = await fetch(`https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}`, {
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'youtube-media-downloader.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`RapidAPI request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.audios?.items?.length > 0) {
      const mp4Audio = data.audios.items.find((audio: any) => 
        audio.mimeType?.includes('audio/mp4') && audio.url
      );
      
      const bestAudio = mp4Audio || data.audios.items.find((audio: any) => 
        audio.mimeType?.includes('audio') && audio.url
      ) || data.audios.items[0];
      
      if (bestAudio?.url) {
        console.log('Found audio stream:', {
          mimeType: bestAudio.mimeType,
          size: bestAudio.sizeText,
          extension: bestAudio.extension
        });
        return bestAudio.url;
      }
    }
    
    throw new Error('No audio streams found in video');
    
  } catch (error: any) {
    console.error('Error extracting YouTube audio URL:', error);
    throw error;
  }
}

// New function to download YouTube audio and upload to AssemblyAI
async function transcribeYouTubeAudio(videoId: string): Promise<any> {
  try {
    console.log('Downloading and transcribing YouTube audio for video:', videoId);
    
    // Get the audio URL
    const audioUrl = await extractYouTubeAudioUrl(videoId);
    
    if (!audioUrl) {
      throw new Error('Could not extract audio URL from YouTube video');
    }

    // Download the audio with proper headers
    console.log('Downloading audio from YouTube...');
    const audioResponse = await fetch(audioUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.youtube.com/',
        'Origin': 'https://www.youtube.com'
      }
    });

    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio: ${audioResponse.status}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    console.log('Audio downloaded, size:', audioBuffer.byteLength, 'bytes');

    if (audioBuffer.byteLength === 0) {
      throw new Error('Downloaded audio file is empty');
    }

    // Convert to Buffer and upload to AssemblyAI
    const buffer = Buffer.from(audioBuffer);
    
    console.log('Uploading audio to AssemblyAI...');
    const { AssemblyAI } = await import('assemblyai');
    const assemblyAI = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY!,
    });

    const params = {
      audio: buffer,
      speech_model: 'universal' as const,
      language_detection: true,
      punctuate: true,
      format_text: true,
      disfluencies: false,
    };

    const transcript = await assemblyAI.transcripts.transcribe(params);

    if (transcript.status === 'error') {
      throw new Error(transcript.error || 'Transcription failed');
    }

    if (transcript.text) {
      return {
        text: transcript.text,
        success: true,
        confidence: transcript.confidence || null,
        words: transcript.words?.length || 0,
      };
    } else {
      throw new Error('No transcription text received');
    }

  } catch (error: any) {
    console.error('YouTube audio transcription error:', error);
    throw error;
  }
}

function detectUrlType(url: string): 'youtube' | 'direct_audio' | 'unsupported' {
  if (isYouTubeUrl(url)) {
    return 'youtube';
  }
  
  const audioExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg', '.mp4', '.webm'];
  const lowercaseUrl = url.toLowerCase();
  
  if (audioExtensions.some(ext => lowercaseUrl.includes(ext))) {
    return 'direct_audio';
  }
  
  const directAudioDomains = [
    'soundcloud.com',
    'anchor.fm', 
    'podcasts.apple.com',
    'overcast.fm',
    'buzzsprout.com',
    'libsyn.com'
  ];
  
  if (directAudioDomains.some(domain => url.includes(domain))) {
    return 'direct_audio';
  }
  
  return 'unsupported';
}

// Helper function to validate URLs
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Helper function to check if URL is a supported video/podcast platform
function isSupportedPlatform(url: string): boolean {
  const supportedDomains = [
    'youtube.com',
    'youtu.be',
    'soundcloud.com',
    'anchor.fm',
    'spotify.com',
    'apple.com/podcasts',
    'podcasts.apple.com',
    'overcast.fm',
    'pocketcasts.com',
    'castbox.fm',
    'buzzsprout.com',
    'libsyn.com',
    'simplecast.com',
    'transistor.fm',
    'rss.com',
    'podcasts.google.com',
    'stitcher.com',
    'tunein.com',
    'iheart.com',
    'vimeo.com',
    'dailymotion.com',
    'twitch.tv',
    'facebook.com',
    'instagram.com',
    'tiktok.com',
    'linkedin.com',
    'twitter.com',
    'x.com'
  ];

  return supportedDomains.some(domain => url.includes(domain));
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    
    // Handle JSON requests (URL-based transcription)
    if (contentType?.includes('application/json')) {
      const body = await request.json();
      const { url } = body;
      
      if (!url || typeof url !== 'string') {
        return NextResponse.json(
          { error: 'URL is required for transcription' },
          { status: 400 }
        );
      }

      // Validate URL format
      if (!isValidUrl(url)) {
        return NextResponse.json(
          { error: 'Invalid URL format provided' },
          { status: 400 }
        );
      }

      // Detect URL type and handle accordingly
      const urlType = detectUrlType(url);
      
      if (urlType === 'youtube') {
        // Handle YouTube URLs specially
        console.log('Processing YouTube URL:', url);
        
        const videoId = extractYouTubeVideoId(url);
        if (!videoId) {
          return NextResponse.json(
            { error: 'Could not extract video ID from YouTube URL' },
            { status: 400 }
          );
        }

        try {
          // Use the new download-and-transcribe method
          const result = await transcribeYouTubeAudio(videoId);
          
          return NextResponse.json({
            success: true,
            data: {
              text: result.text,
              originalUrl: url,
              videoId: videoId,
              confidence: result.confidence,
              wordCount: result.words,
              transcriptionMethod: 'youtube_download_transcription'
            },
            message: 'YouTube video transcribed successfully'
          });

        } catch (youtubeError: any) {
          return NextResponse.json(
            { 
              error: youtubeError.message || 'Failed to transcribe YouTube video',
              success: false 
            },
            { status: 400 }
          );
        }

      } else if (urlType === 'direct_audio') {
        // Handle direct audio URLs
        console.log('Processing direct audio URL:', url);
        
        const result = await transcribeFromUrl(url);
        
        if (!result.success) {
          return NextResponse.json(
            { 
              error: result.error || 'Direct URL transcription failed',
              success: false 
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            text: result.text,
            audioUrl: result.audioUrl,
            confidence: result.confidence,
            wordCount: result.words,
            transcriptionMethod: 'direct_url'
          },
          message: 'Audio URL transcribed successfully'
        });

      } else {
        // Unsupported URL type
        return NextResponse.json(
          { 
            error: 'Unsupported URL type. Please provide a YouTube URL or direct audio file URL.',
            success: false 
          },
          { status: 400 }
        );
      }
    }

    // Handle FormData requests (file-based transcription)
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }

      // Validate file type
      const allowedTypes = [
        'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/webm',
        'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm',
        'audio/x-m4a', 'audio/aac', 'audio/flac', 'audio/ogg', 'audio/x-wav',
        'video/x-msvideo', 'video/avi', 'audio/mp4'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { 
            error: 'Invalid file type. Supported formats: MP3, WAV, M4A, MP4, WebM, QuickTime, AAC, FLAC, OGG, AVI',
            allowedTypes 
          },
          { status: 400 }
        );
      }

      // Check file size (AssemblyAI supports larger files than LemonFox)
      const maxSize = 100 * 1024 * 1024; // 100MB for AssemblyAI
      if (file.size > maxSize) {
        return NextResponse.json(
          { 
            error: 'File size too large. Maximum file size is 100MB.',
            maxSize: '100MB',
            currentSize: `${Math.round(file.size / 1024 / 1024)}MB`
          },
          { status: 400 }
        );
      }

      // Process file transcription
      const result = await transcribeAudioFile(file);
      
      if (!result.success) {
        return NextResponse.json(
          { 
            error: result.error || 'File transcription failed',
            success: false 
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          text: result.text,
          filename: file.name,
          fileSize: file.size,
          confidence: result.confidence,
          wordCount: result.words,
          transcriptionMethod: 'file'
        },
        message: 'File transcribed successfully'
      });
    }

    // Invalid content type
    return NextResponse.json(
      { error: 'Invalid request format. Send JSON for URL transcription or FormData for file upload.' },
      { status: 400 }
    );
    
  } catch (error: any) {
    console.error('Transcription error:', error);
    
    // Handle specific AssemblyAI errors
    if (error.message?.includes('Invalid AssemblyAI API key')) {
      return NextResponse.json(
        { error: 'API configuration error. Please check server settings.' },
        { status: 500 }
      );
    }

    if (error.message?.includes('timed out')) {
      return NextResponse.json(
        { error: 'Transcription took too long. Please try with a shorter audio file.' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to transcribe content',
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}