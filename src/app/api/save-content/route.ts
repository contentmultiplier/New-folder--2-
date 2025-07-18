import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Use service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      originalContent, 
      contentType, 
      selectedPlatforms, 
      platformContent, 
      hashtags,
      fileName,
      fileType
    } = body;

    // Save main content record
    const { data: contentData, error: contentError } = await supabase
      .from('content')
      .insert({
        user_id: user.id,
        original_content: originalContent,
        content_type: contentType,
        title: fileName || `${contentType} - ${new Date().toLocaleDateString()}`,
        platforms_generated: selectedPlatforms,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (contentError) {
      console.error('Error saving content:', contentError);
      return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
    }

    // Save platform-specific content
    const platformInserts = [];
    for (const platform of selectedPlatforms) {
      if (platformContent[platform]) {
        platformInserts.push({
          content_id: contentData.id,
          platform: platform,
          generated_text: platformContent[platform],
          metadata: {
            hashtags: hashtags[platform] || [],
            generated_at: new Date().toISOString()
          },
          created_at: new Date().toISOString()
        });
      }
    }

    if (platformInserts.length > 0) {
      const { error: platformError } = await supabase
        .from('platform_content')
        .insert(platformInserts);

      if (platformError) {
        console.error('Error saving platform content:', platformError);
        return NextResponse.json({ error: 'Failed to save platform content' }, { status: 500 });
      }
    }

    // Update usage tracking
    const { error: usageError } = await supabase
      .from('usage_tracking')
      .insert({
        user_id: user.id,
        action_type: 'content_generation',
        credits_used: selectedPlatforms.length, // 1 credit per platform
        created_at: new Date().toISOString()
      });

    if (usageError) {
      console.error('Error updating usage:', usageError);
      // Don't fail the request if usage tracking fails
    }

    return NextResponse.json({ 
      success: true, 
      contentId: contentData.id,
      message: 'Content saved successfully' 
    });

  } catch (error) {
    console.error('Error in save-content API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}