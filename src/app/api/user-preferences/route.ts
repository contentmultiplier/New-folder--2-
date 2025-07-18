import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use your existing Supabase setup pattern
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user preferences from database
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching preferences:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // If no preferences exist, return defaults
    if (!preferences) {
      return NextResponse.json({
        email_notifications: true,
        marketing_emails: false,
        default_content_type: 'blog',
        default_processing_speed: 'balanced'
      });
    }

    // Return user preferences
    return NextResponse.json({
      email_notifications: preferences.email_notifications,
      marketing_emails: preferences.marketing_emails,
      default_content_type: preferences.default_content_type,
      default_processing_speed: preferences.default_processing_speed
    });

  } catch (error) {
    console.error('Error in GET preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get preferences from request body
    const body = await request.json();
    const {
      email_notifications,
      marketing_emails,
      default_content_type,
      default_processing_speed
    } = body;

    // Validate content type
    const validContentTypes = ['blog', 'video', 'podcast', 'visual'];
    if (!validContentTypes.includes(default_content_type)) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    // Validate processing speed
    const validSpeeds = ['fast', 'balanced', 'quality'];
    if (!validSpeeds.includes(default_processing_speed)) {
      return NextResponse.json({ error: 'Invalid processing speed' }, { status: 400 });
    }

    // Save preferences to database (upsert - update if exists, create if doesn't)
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        email_notifications,
        marketing_emails,
        default_content_type,
        default_processing_speed,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving preferences:', error);
      return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Preferences saved successfully',
      preferences: {
        email_notifications: data.email_notifications,
        marketing_emails: data.marketing_emails,
        default_content_type: data.default_content_type,
        default_processing_speed: data.default_processing_speed
      }
    });

  } catch (error) {
    console.error('Error in POST preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}