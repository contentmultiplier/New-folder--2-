// ContentMux Content Repurposing API Route
// Transforms text content into 5 platform-optimized versions

import { NextRequest, NextResponse } from 'next/server';
import { repurposeContent } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;
    
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

    // Process content repurposing
    const result = await repurposeContent(text);
    
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Content repurposed successfully'
    });
    
  } catch (error: any) {
    console.error('Repurpose error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to repurpose content',
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