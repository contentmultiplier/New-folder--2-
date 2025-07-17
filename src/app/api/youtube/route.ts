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

// Get YouTube captions/transcript
async function getYouTubeTranscript(videoId: string): Promise<string | null> {
  try {
    // Method 1: Try the unofficial timedtext endpoint (works for many videos)
    const endpoints = [
      `https://video.google.com/timedtext?lang=en&v=${videoId}`,
      `https://video.google.com/timedtext?lang=en&v=${videoId}&fmt=srv3`,
      `https://video.google.com/timedtext?lang=en&v=${videoId}&fmt=srv1`,
      `https://video.google.com/timedtext?lang=en&v=${videoId}&fmt=srv2`,
      `https://video.google.com/timedtext?lang=en&v=${videoId}&fmt=ttml`,
      `https://video.google.com/timedtext?lang=en&v=${videoId}&fmt=vtt`,
      `https://video.google.com/timedtext?lang=en&v=${videoId}&tlang=en`,
      `https://video.google.com/timedtext?lang=en-US&v=${videoId}`,
      `https://video.google.com/timedtext?lang=en-GB&v=${videoId}`,
      `https://video.google.com/timedtext?lang=a.en&v=${videoId}`,
      `https://video.google.com/timedtext?lang=asr&v=${videoId}`,
      `https://video.google.com/timedtext?v=${videoId}&lang=en&name=`,
      `https://video.google.com/timedtext?v=${videoId}&lang=en&fmt=srv3&name=`,
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log('Trying endpoint:', endpoint);
        const response = await fetch(endpoint);
        
        if (response.ok) {
          const textContent = await response.text();
          console.log('Response length:', textContent.length);
          console.log('First 200 chars:', textContent.substring(0, 200));
          
          if (textContent && textContent.length > 50 && !textContent.includes('Video unavailable')) {
            // Parse the XML/text to extract readable content
            let cleanText = textContent;
            
            // If it's XML, extract text content
            if (textContent.includes('<text') || textContent.includes('<transcript>')) {
              cleanText = textContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            }
            
            // If it's JSON format, try to parse it
            if (textContent.startsWith('{') || textContent.startsWith('[')) {
              try {
                const jsonData = JSON.parse(textContent);
                if (jsonData.events) {
                  cleanText = jsonData.events.map((event: any) => event.segs?.map((seg: any) => seg.utf8).join(' ')).join(' ');
                }
              } catch (e) {
                // Not valid JSON, continue with text processing
              }
            }
            
            if (cleanText && cleanText.length > 50) {
              console.log('Found captions with method:', endpoint);
              return cleanText;
            }
          }
        }
      } catch (err) {
        console.log('Failed endpoint:', endpoint, err);
        continue;
      }
    }
    
    return null;
  } catch (error: any) {
    console.error('Error fetching YouTube transcript:', error);
    return null;
  }
}

// Transcribe audio using either captions or audio extraction + LemonFox
async function transcribeYouTubeAudio(youtubeUrl: string, videoId: string): Promise<any> {
  try {
    // First, try to get captions/transcript directly from YouTube
    console.log('Attempting to get YouTube captions for:', videoId);
    const transcript = await getYouTubeTranscript(videoId);
    
    if (transcript) {
      console.log('Successfully retrieved YouTube captions');
      return {
        text: transcript,
        source: 'youtube_captions'
      };
    }
    
    // If no captions available, use audio extraction + transcription
    console.log('No captions available, using audio transcription');
    
    const lemonfoxApiKey = process.env.LEMONFOX_API_KEY;
    if (!lemonfoxApiKey) {
      throw new Error('LemonFox API key not configured');
    }
    
    // Use RapidAPI YouTube Audio Extractor + LemonFox transcription
    const audioExtractionResult = await extractYouTubeAudio(videoId);
    
    if (audioExtractionResult.audioUrl) {
      console.log('Audio extracted successfully, starting transcription...');
      const transcriptionResult = await transcribeAudioUrl(audioExtractionResult.audioUrl, lemonfoxApiKey);
      return {
        text: transcriptionResult.text,
        source: 'audio_transcription',
        audioInfo: {
          quality: audioExtractionResult.quality,
          size: audioExtractionResult.size,
          duration: audioExtractionResult.duration
        }
      };
    }
    
    throw new Error('Could not extract audio from YouTube video');
    
  } catch (error: any) {
    throw new Error(`Transcription failed: ${error?.message || 'Unknown error'}`);
  }
}

// Extract audio URL from YouTube video using RapidAPI
async function extractYouTubeAudio(videoId: string): Promise<any> {
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  
  if (!rapidApiKey) {
    throw new Error('RapidAPI key not configured');
  }

  try {
    const response = await fetch(`https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}&urlAccess=normal&videos=auto&audios=auto`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'youtube-media-downloader.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`RapidAPI request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Debug: Log the full response to see what we're getting
    console.log('RapidAPI Response:', JSON.stringify(data, null, 2));
    
    // Check different possible response structures
    if (data.audios && data.audios.length > 0) {
      const audioTrack = data.audios.find((audio: any) => audio.url) || data.audios[0];
      return {
        audioUrl: audioTrack.url,
        quality: audioTrack.quality,
        size: audioTrack.size,
        duration: audioTrack.duration
      };
    }
    
    // Try alternative response structure
    if (data.formats && data.formats.length > 0) {
      const audioFormat = data.formats.find((format: any) => format.audio_only || format.acodec !== 'none');
      if (audioFormat) {
        return {
          audioUrl: audioFormat.url,
          quality: audioFormat.quality,
          size: audioFormat.filesize,
          duration: audioFormat.duration
        };
      }
    }
    
    // Try another possible structure
    if (data.links && data.links.length > 0) {
      const audioLink = data.links.find((link: any) => link.type === 'audio' || link.format_note?.includes('audio'));
      if (audioLink) {
        return {
          audioUrl: audioLink.url,
          quality: audioLink.quality,
          size: audioLink.size,
          duration: audioLink.duration
        };
      }
    }
    
    throw new Error(`No audio tracks found. Response structure: ${JSON.stringify(Object.keys(data))}`);
    
  } catch (error: any) {
    console.error('Audio extraction error:', error);
    throw new Error(`Failed to extract audio: ${error?.message || 'Unknown error'}`);
  }
}

// Transcribe audio from URL using LemonFox
async function transcribeAudioUrl(audioUrl: string, lemonfoxApiKey: string): Promise<any> {
  try {
    // Download the audio file
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio: ${audioResponse.status}`);
    }
    
    const audioBuffer = await audioResponse.arrayBuffer();
    
    // Prepare form data for LemonFox
    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer]), 'audio.mp3');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'json');
    
    // Send to LemonFox for transcription
    const transcriptionResponse = await fetch('https://api.lemonfox.ai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lemonfoxApiKey}`,
      },
      body: formData,
    });
    
    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      throw new Error(`LemonFox transcription failed: ${transcriptionResponse.status} - ${errorText}`);
    }
    
    return await transcriptionResponse.json();
    
  } catch (error: any) {
    console.error('Audio transcription error:', error);
    throw new Error(`Failed to transcribe audio: ${error?.message || 'Unknown error'}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { youtubeUrl, transcribe = false } = await request.json();

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

    // Prepare video info
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

    // If transcription is requested, process the audio
    if (transcribe) {
      try {
        console.log('Starting transcription for:', videoInfo.title);
        const transcriptionResult = await transcribeYouTubeAudio(youtubeUrl, videoId);
        
        return NextResponse.json({
          success: true,
          videoInfo,
          transcription: transcriptionResult.text || transcriptionResult,
          transcriptionSource: transcriptionResult.source || 'unknown',
          message: 'Video processed and transcribed successfully'
        });
      } catch (transcriptionError: any) {
        console.error('Transcription error:', transcriptionError);
        return NextResponse.json(
          { error: `Transcription failed: ${transcriptionError?.message || 'Unknown error'}` },
          { status: 500 }
        );
      }
    }

    // Return video info only if transcription not requested
    return NextResponse.json({
      success: true,
      videoInfo,
      message: 'Video validated successfully. Ready for transcription processing.'
    });

  } catch (error: any) {
    console.error('YouTube processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error during YouTube processing' },
      { status: 500 }
    );
  }
}