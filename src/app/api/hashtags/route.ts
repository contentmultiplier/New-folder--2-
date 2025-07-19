// ContentMux Hashtag Generation API Route
// Generates platform-specific hashtags for content discovery

import { NextRequest, NextResponse } from 'next/server';
import { generateHashtags } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, platforms } = body;
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      );
    }

    if (text.length < 10) {
      return NextResponse.json(
        { error: 'Text content must be at least 10 characters long' },
        { status: 400 }
      );
    }

    // Validate platforms (optional parameter)
    const validPlatforms = ['twitter', 'linkedin', 'instagram', 'facebook', 'youtube', 'tiktok'];
    const targetPlatforms = platforms && Array.isArray(platforms) 
      ? platforms.filter(p => validPlatforms.includes(p))
      : validPlatforms;

    if (targetPlatforms.length === 0) {
      return NextResponse.json(
        { error: 'At least one valid platform is required' },
        { status: 400 }
      );
    }

    // Process hashtag generation
    const result = await generateHashtags(text, targetPlatforms);
    
    return NextResponse.json({
      success: true,
      data: result,
      platforms: targetPlatforms,
      message: 'Hashtags generated successfully'
    });
    
  } catch (error: any) {
    console.error('Hashtag generation error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate hashtags',
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