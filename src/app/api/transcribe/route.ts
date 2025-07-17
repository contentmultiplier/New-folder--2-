// ContentMux Transcription API Route
// Converts audio/video files to text using LemonFox AI

import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type (audio/video only)
    const allowedTypes = [
      'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/webm',
      'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm',
      'audio/x-m4a', 'audio/aac', 'audio/flac', 'audio/ogg'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'Invalid file type. Supported formats: MP3, WAV, M4A, MP4, WebM, QuickTime, AAC, FLAC, OGG',
          allowedTypes 
        },
        { status: 400 }
      );
    }

    // Check file size (max 25MB for LemonFox)
    const maxSize = 25 * 1024 * 1024; // 25MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          error: 'File size too large. Maximum file size is 25MB.',
          maxSize: '25MB',
          currentSize: `${Math.round(file.size / 1024 / 1024)}MB`
        },
        { status: 400 }
      );
    }

    // Process transcription
    const result = await transcribeAudio(file);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || 'Transcription failed',
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
        duration: null // LemonFox doesn't provide duration in basic response
      },
      message: 'File transcribed successfully'
    });
    
  } catch (error: any) {
    console.error('Transcription error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to transcribe audio',
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