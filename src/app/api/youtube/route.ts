import { NextRequest, NextResponse } from 'next/server';

// YouTube URL validation function
function isValidYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  return youtubeRegex.test(url);
}

// Extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// Get video metadata from YouTube Data API
async function getVideoMetadata(videoId: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.items && data.items.length > 0) {
    return data.items[0];
  }
  return null;
}

// Convert YouTube duration to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}

export async function POST(request: NextRequest) {
  try {
    const { youtubeUrl } = await request.json();

    // Validate YouTube URL
    if (!youtubeUrl || !isValidYouTubeUrl(youtubeUrl)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL provided' },
        { status: 400 }
      );
    }

    // Extract video ID
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Could not extract video ID from URL' },
        { status: 400 }
      );
    }

    // Get video metadata
    const videoData = await getVideoMetadata(videoId);
    if (!videoData) {
      return NextResponse.json(
        { error: 'Video not found or is private/unavailable' },
        { status: 404 }
      );
    }

    // Check video duration (optional limit)
    const durationSeconds = parseDuration(videoData.contentDetails.duration);
    const maxDurationHours = 4; // 4 hour limit
    
    if (durationSeconds > maxDurationHours * 3600) {
      return NextResponse.json(
        { error: `Video is too long. Maximum duration is ${maxDurationHours} hours.` },
        { status: 400 }
      );
    }

    // Prepare video info for transcription
    const videoInfo = {
      id: videoId,
      title: videoData.snippet.title,
      description: videoData.snippet.description,
      duration: durationSeconds,
      url: youtubeUrl,
      thumbnail: videoData.snippet.thumbnails.high?.url || videoData.snippet.thumbnails.default?.url,
      channelTitle: videoData.snippet.channelTitle,
      publishedAt: videoData.snippet.publishedAt
    };

    // For now, we'll return the video info
    // In the next step, we'll add the actual audio extraction and transcription
    return NextResponse.json({
      success: true,
      videoInfo,
      message: 'Video validated successfully. Ready for transcription processing.'
    });

  } catch (error) {
    console.error('YouTube processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error during YouTube processing' },
      { status: 500 }
    );
  }
}