// ContentMux Main Processing API Route
// Handles both text input and file upload processing with platform selection

import { NextRequest, NextResponse } from 'next/server';
import { processCompleteWorkflow, repurposeContent, generateHashtags } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    
    // Handle file upload (multipart/form-data)
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const generateHashtagsFlag = formData.get('generateHashtags') === 'true';
      const platforms = formData.get('platforms') ? JSON.parse(formData.get('platforms') as string) : ['linkedin', 'twitter'];
      
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
      const result = await processCompleteWorkflow(file, generateHashtagsFlag);
      
      // Filter content and hashtags to only selected platforms
      const filteredContent = filterContentByPlatforms(result.repurposedContent, platforms);
      const filteredHashtags = generateHashtagsFlag ? filterHashtagsByPlatforms(result.hashtags, platforms) : undefined;
      
      return NextResponse.json({
        success: true,
        data: {
          originalText: result.originalText,
          repurposedContent: filteredContent,
          hashtags: filteredHashtags,
          transcription: result.transcription
        },
        message: 'File processed successfully'
      });
    }
    
    // Handle text input (application/json)
    else if (contentType?.includes('application/json')) {
      const body = await request.json();
      
      // Accept both 'text' and 'content' for backward compatibility
      const text = body.text || body.content;
      const generateHashtagsFlag = body.generateHashtags !== false; // Default to true
      const platforms = body.platforms || ['linkedin', 'twitter']; // Default platforms
      const selectedContentType = body.contentType || 'blog_post';
      
      if (!text || typeof text !== 'string') {
        return NextResponse.json(
          { error: 'Text content is required (send as "text" or "content" parameter)' },
          { status: 400 }
        );
      }

      if (text.length < 10) {
        return NextResponse.json(
          { error: 'Text content must be at least 10 characters long' },
          { status: 400 }
        );
      }

      // Validate platforms
      const validPlatforms = ['twitter', 'linkedin', 'facebook', 'instagram', 'youtube', 'tiktok'];
      const selectedPlatforms = platforms.filter((p: string) => validPlatforms.includes(p));
      
      if (selectedPlatforms.length === 0) {
        return NextResponse.json(
          { error: 'At least one valid platform must be selected' },
          { status: 400 }
        );
      }

      try {
        // Generate content for selected platforms only
        const repurposedContent = await repurposeContent(text);
        
        // Filter content to only selected platforms
        const filteredContent = filterContentByPlatforms(repurposedContent, selectedPlatforms);
        
        // Generate hashtags for selected platforms only
        let hashtags = undefined;
        if (generateHashtagsFlag) {
          const allHashtags = await generateHashtags(text, selectedPlatforms);
          hashtags = filterHashtagsByPlatforms(allHashtags, selectedPlatforms);
        }
        
        return NextResponse.json({
          success: true,
          data: {
            originalText: text,
            repurposedContent: filteredContent,
            hashtags: hashtags,
            contentType: selectedContentType,
            platforms: selectedPlatforms
          },
          message: 'Text processed successfully'
        });
        
      } catch (error: any) {
        console.error('Content processing error:', error);
        return NextResponse.json(
          { error: error.message || 'Failed to process content' },
          { status: 500 }
        );
      }
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

// Helper function to filter content by selected platforms
function filterContentByPlatforms(content: any, platforms: string[]) {
  const filtered: any = {};
  platforms.forEach(platform => {
    if (content[platform]) {
      filtered[platform] = content[platform];
    }
  });
  return filtered;
}

// Helper function to filter hashtags by selected platforms
function filterHashtagsByPlatforms(hashtags: any, platforms: string[]) {
  if (!hashtags) return undefined;
  
  const filtered: any = {};
  platforms.forEach(platform => {
    if (hashtags[platform]) {
      filtered[platform] = hashtags[platform];
    }
  });
  return filtered;
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