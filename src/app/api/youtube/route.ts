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
    
    if (data.audios && data.audios.items && data.audios.items.length > 0) {
      // Find the best quality audio - prefer MP4 format for better compatibility
      const mp4Audio = data.audios.items.find((audio: any) => 
        audio.mimeType && audio.mimeType.includes('audio/mp4') && audio.url
      );
      
      const bestAudio = mp4Audio || data.audios.items[0];
      
      if (bestAudio && bestAudio.url) {
        return {
          audioUrl: bestAudio.url,
          mimeType: bestAudio.mimeType || 'audio/mp4',
          extension: bestAudio.extension || 'm4a',
          size: bestAudio.size,
          sizeText: bestAudio.sizeText,
          duration: bestAudio.lengthMs
        };
      }
    }
    
    throw new Error('No audio tracks found in video response');
    
  } catch (error: any) {
    console.error('Audio extraction error:', error);
    throw new Error(`Failed to extract audio: ${error?.message || 'Unknown error'}`);
  }
}

// Download audio from YouTube URL with proper headers and send to LemonFox for transcription
async function transcribeYouTubeAudio(audioUrl: string, lemonfoxApiKey: string): Promise<any> {
  try {
    console.log('Attempting to download audio from Google CDN...');
    
    // Create a more comprehensive set of headers that mimic a real browser request
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'audio',
      'Sec-Fetch-Mode': 'no-cors',
      'Sec-Fetch-Site': 'cross-site',
      'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Referer': 'https://www.youtube.com/',
      'Origin': 'https://www.youtube.com'
    };
    
    // Try to download the audio file
    const audioResponse = await fetch(audioUrl, {
      method: 'GET',
      headers: headers,
      redirect: 'follow'
    });
    
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio: ${audioResponse.status} ${audioResponse.statusText}`);
    }
    
    console.log('Audio downloaded successfully from Google CDN');
    
    const audioBuffer = await audioResponse.arrayBuffer();
    
    if (audioBuffer.byteLength === 0) {
      throw new Error('Downloaded audio file is empty');
    }
    
    console.log('Audio buffer size:', audioBuffer.byteLength, 'bytes');
    
    // Prepare form data for LemonFox API
    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer], { type: 'audio/mp4' }), 'audio.mp4');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'json');
    
    console.log('Sending audio to LemonFox for transcription...');
    
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
    
    const transcriptionResult = await transcriptionResponse.json();
    console.log('Transcription completed successfully');
    
    return transcriptionResult;
    
  } catch (error: any) {
    console.error('Audio transcription error:', error);
    throw new Error(`Failed to transcribe audio: ${error?.message || 'Unknown error'}`);
  }
} 

// Try to get captions first, then fall back to audio transcription
async function transcribeYouTubeVideo(youtubeUrl: string, videoId: string): Promise<any> {
  try {
    console.log('Starting transcription for video:', videoId);
    
    // Step 1: Try to get captions from YouTube Data API
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (apiKey) {
      try {
        console.log('Checking for available captions...');
        const captionsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${apiKey}`
        );
        
        if (captionsResponse.ok) {
          const captionsData = await captionsResponse.json();
          
          if (captionsData.items && captionsData.items.length > 0) {
            // Find English captions
            const englishCaption = captionsData.items.find((item: any) => 
              item.snippet.language === 'en' || item.snippet.language === 'en-US'
            );
            
            if (englishCaption) {
              console.log('Found English captions, downloading...');
              
              // Download the caption file
              const captionDownloadResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/captions/${englishCaption.id}?key=${apiKey}`,
                {
                  headers: {
                    'Accept': 'text/vtt, text/plain, application/x-subrip'
                  }
                }
              );
              
              if (captionDownloadResponse.ok) {
                const captionText = await captionDownloadResponse.text();
                
                // Clean up caption text (remove timestamps and formatting)
                const cleanText = captionText
                  .replace(/\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}/g, '')
                  .replace(/^\d+$/gm, '')
                  .replace(/WEBVTT/g, '')
                  .replace(/\n\s*\n/g, '\n')
                  .trim();
                
                if (cleanText && cleanText.length > 50) {
                  console.log('Successfully extracted captions');
                  return {
                    text: cleanText,
                    source: 'youtube_captions',
                    audioInfo: {
                      mimeType: 'text/caption',
                      size: 'N/A',
                      duration: 'N/A'
                    }
                  };
                }
              }
            }
          }
        }
      } catch (captionError) {
        console.log('Caption extraction failed, falling back to audio transcription');
      }
    }
    
    // Step 2: Fall back to audio transcription using a different approach
    console.log('No captions available, trying audio transcription...');
    
    const lemonfoxApiKey = process.env.LEMONFOX_API_KEY;
    if (!lemonfoxApiKey) {
      throw new Error('LemonFox API key not configured');
    }
    
    // Try using the video+audio stream instead of audio-only
    const audioData = await extractYouTubeAudio(videoId);
    
    if (audioData.audioUrl) {
      console.log('Audio URL extracted, attempting transcription...');
      
      // Use a more robust approach - try to transcribe directly via URL
      try {
        // Try to send the URL directly to LemonFox (some APIs accept URLs)
        const transcriptionResult = await transcribeFromUrl(audioData.audioUrl, lemonfoxApiKey);
        
        return {
          text: transcriptionResult.text,
          source: 'youtube_audio_transcription',
          audioInfo: {
            mimeType: audioData.mimeType,
            size: audioData.sizeText,
            duration: audioData.duration
          }
        };
      } catch (urlError) {
        console.log('URL transcription failed, trying download method...');
        
        // Last resort: try to download and transcribe
        const downloadResult = await transcribeYouTubeAudio(audioData.audioUrl, lemonfoxApiKey);
        
        return {
          text: downloadResult.text,
          source: 'youtube_audio_download_transcription',
          audioInfo: {
            mimeType: audioData.mimeType,
            size: audioData.sizeText,
            duration: audioData.duration
          }
        };
      }
    }
    
    throw new Error('Could not extract audio URL from YouTube video');
    
  } catch (error: any) {
    throw new Error(`YouTube transcription failed: ${error?.message || 'Unknown error'}`);
  }
}

// Try to transcribe from URL directly (some APIs support this)
async function transcribeFromUrl(audioUrl: string, lemonfoxApiKey: string): Promise<any> {
  try {
    console.log('Attempting URL-based transcription...');
    
    const formData = new FormData();
    formData.append('url', audioUrl);
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'json');
    
    const response = await fetch('https://api.lemonfox.ai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lemonfoxApiKey}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LemonFox URL transcription failed: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('URL-based transcription completed successfully');
    
    return result;
    
  } catch (error: any) {
    console.error('URL transcription error:', error);
    throw error;
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
        const transcriptionResult = await transcribeYouTubeVideo(youtubeUrl, videoId);
        
        return NextResponse.json({
          success: true,
          videoInfo,
          transcription: transcriptionResult.text,
          transcriptionSource: transcriptionResult.source,
          audioInfo: transcriptionResult.audioInfo,
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