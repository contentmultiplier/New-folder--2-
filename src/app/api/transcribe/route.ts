// ContentMux Transcription API Route
// Updated to use AssemblyAI for URL-based and file-based transcription

import { NextRequest, NextResponse } from 'next/server';
import { transcribeFromUrl, transcribeAudioFile } from '@/lib/api-utils';

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

      // Check if it's a supported platform (optional warning)
      if (!isSupportedPlatform(url)) {
        console.warn('URL may not be from a supported platform:', url);
      }

      // Process URL transcription
      const result = await transcribeFromUrl(url);
      
      if (!result.success) {
        return NextResponse.json(
          { 
            error: result.error || 'URL transcription failed',
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
          transcriptionMethod: 'url'
        },
        message: 'URL transcribed successfully'
      });
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