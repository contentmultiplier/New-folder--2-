// Cloud Upload API Route
// Handles: Upload URL generation and file processing

import { NextRequest, NextResponse } from 'next/server';
import { 
  generateUploadUrl, 
  processCloudFile, 
  checkFileExists,
  getFileInfo 
} from '@/lib/cloud-api-utils';

// POST: Generate upload URL
export async function POST(request: NextRequest) {
  try {
    const { action, fileName, fileType, fileSizeBytes, fileKey } = await request.json();

    switch (action) {
      case 'get-upload-url':
        // Generate signed upload URL
        if (!fileName || !fileType || !fileSizeBytes) {
          return NextResponse.json(
            { error: 'Missing required fields: fileName, fileType, fileSizeBytes' },
            { status: 400 }
          );
        }

        const uploadData = await generateUploadUrl(fileName, fileType, fileSizeBytes);
        
        return NextResponse.json({
          success: true,
          data: uploadData,
          message: 'Upload URL generated successfully'
        });

      case 'process-file':
        // Process uploaded file
        if (!fileKey) {
          return NextResponse.json(
            { error: 'Missing fileKey for processing' },
            { status: 400 }
          );
        }

        // Check if file exists first
        const fileExists = await checkFileExists(fileKey);
        if (!fileExists) {
          return NextResponse.json(
            { error: 'File not found in cloud storage' },
            { status: 404 }
          );
        }

        // Process the file
        const result = await processCloudFile(fileKey);
        
        if (!result.success) {
          return NextResponse.json(
            { error: result.error, processingTime: result.processingTime },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            transcription: result.transcription,
            repurposedContent: result.repurposedContent,
            processingTime: result.processingTime,
          },
          message: 'File processed successfully'
        });

      case 'check-file':
        // Check file status
        if (!fileKey) {
          return NextResponse.json(
            { error: 'Missing fileKey for checking' },
            { status: 400 }
          );
        }

        const fileInfo = await getFileInfo(fileKey);
        
        return NextResponse.json({
          success: true,
          data: fileInfo,
          message: fileInfo.exists ? 'File exists' : 'File not found'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: get-upload-url, process-file, or check-file' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('Cloud upload API error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
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