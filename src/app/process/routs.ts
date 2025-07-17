// ContentMux Main Processing API Route
// Handles both text input and file upload processing

import { NextRequest, NextResponse } from 'next/server';
import { processCompleteWorkflow } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    
    // Handle file upload (multipart/form-data)
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const generateHashtags = formData.get('generateHashtags') === 'true';
      
      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }

      // Validate file type (audio/video only)
      const allowedTypes = [
        'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a',
        'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Please upload audio or video files only.' },
          { status: 400 }
        );
      }

      // Process file through complete workflow
      const result = await processCompleteWorkflow(file, generateHashtags);
      
      return NextResponse.json({
        success: true,
        data: result,
        message: 'File processed successfully'
      });
    }
    
    // Handle text input (application/json)
    else if (contentType?.includes('application/json')) {
      const body = await request.json();
      const { text, generateHashtags = true } = body;
      
      if (!text || typeof text !== 'string') {
        return NextResponse.json(
          { error: 'Text content is required' },
          { status: 400 }
        );
      }

      // Process text through complete workflow
      const result = await processCompleteWorkflow(text, generateHashtags);
      
      return NextResponse.json({
        success: true,
        data: result,
        message: 'Text processed successfully'
      });
    }
    
    // Invalid content type
    else {
      return NextResponse.json(
        { error: 'Invalid content type. Use multipart/form-data for files or application/json for text.' },
        { status: 400 }
      );
    }
    
  } catch (error: any) {
    console.error('Processing error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        success: false 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
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