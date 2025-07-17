// ContentMux API Utility Functions
// Updated to use AssemblyAI for URL-based transcription

import Anthropic from '@anthropic-ai/sdk';
import { AssemblyAI } from 'assemblyai';

// Initialize Anthropic clients
const anthropicContent = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY_CONTENT,
});

const anthropicHashtags = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY_HASHTAGS,
});

// Initialize AssemblyAI client
const assemblyAI = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

// Types for our API responses
export interface ContentRepurposeResult {
  twitter: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  youtube: string;
}

export interface HashtagResult {
  twitter: string[];
  linkedin: string[];
  instagram: string[];
  facebook: string[];
  youtube: string[];
}

export interface TranscriptionResult {
  text: string;
  success: boolean;
  error?: string;
  audioUrl?: string;
  confidence?: number | null;
  words?: number;
}

// 1. CLAUDE CONTENT REPURPOSING (unchanged)
export async function repurposeContent(originalContent: string): Promise<ContentRepurposeResult> {
  let message: any = null;
  
  try {
    message = await anthropicContent.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Transform this content into 5 platform-optimized versions. Return ONLY a JSON object with this exact structure:

{
  "twitter": "Twitter version (280 chars max, engaging, hashtag-friendly)",
  "linkedin": "LinkedIn version (professional, industry insights, 1-3 paragraphs)",
  "instagram": "Instagram version (visual storytelling, engaging captions)",
  "facebook": "Facebook version (community-focused, conversational)",
  "youtube": "YouTube version (video description, timestamps, call-to-action)"
}

Original content: ${originalContent}`
      }]
    });

    const firstContent = message.content[0];
    let response = firstContent.type === 'text' ? firstContent.text : '';
    
    // Clean up the response - remove markdown code blocks if present
    response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log('Claude content response:', response);
    
    const parsed = JSON.parse(response);
    return parsed;
  } catch (error) {
    console.error('Content repurposing error:', error);
    if (message?.content?.[0]) {
      console.error('Raw response:', message.content[0]);
    }
    throw new Error('Failed to repurpose content');
  }
}

// 2. CLAUDE HASHTAG RESEARCH (unchanged)
export async function generateHashtags(content: string, platforms: string[]): Promise<HashtagResult> {
  let message: any = null;
  
  try {
    message = await anthropicHashtags.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Generate platform-specific hashtags for this content. Return ONLY a JSON object with this exact structure:

{
  "twitter": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "linkedin": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "instagram": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "facebook": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "youtube": ["#hashtag1", "#hashtag2", "#hashtag3"]
}

Requirements:
- Twitter: 3-5 trending, viral-friendly hashtags
- LinkedIn: 3-5 professional, industry-specific hashtags
- Instagram: 5-10 discovery-optimized hashtags
- Facebook: 2-3 community-focused hashtags
- YouTube: 3-5 searchable, niche-specific hashtags

Content: ${content}`
      }]
    });

    const firstContent = message.content[0];
    let response = firstContent.type === 'text' ? firstContent.text : '';
    
    // Clean up the response - remove markdown code blocks if present
    response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log('Claude hashtags response:', response);
    
    const parsed = JSON.parse(response);
    return parsed;
  } catch (error) {
    console.error('Hashtag generation error:', error);
    if (message?.content?.[0]) {
      console.error('Raw response:', message.content[0]);
    }
    throw new Error('Failed to generate hashtags');
  }
}

// 3. ASSEMBLYAI TRANSCRIPTION (Using Official SDK)
export async function transcribeFromUrl(audioUrl: string): Promise<TranscriptionResult> {
  try {
    console.log('Starting AssemblyAI transcription for URL:', audioUrl);

    const params = {
      audio: audioUrl,
      speech_model: 'universal' as const, // Best quality model
      language_detection: true,
      punctuate: true,
      format_text: true,
      disfluencies: false, // Remove "uh", "um", etc.
    };

    const transcript = await assemblyAI.transcripts.transcribe(params);

    if (transcript.status === 'error') {
      throw new Error(transcript.error || 'Transcription failed');
    }

    if (transcript.text) {
      return {
        text: transcript.text,
        success: true,
        audioUrl: audioUrl,
        confidence: transcript.confidence || null,
        words: transcript.words?.length || 0,
      };
    } else {
      throw new Error('No transcription text received');
    }

  } catch (error: any) {
    console.error('AssemblyAI transcription error:', error);
    
    return {
      text: '',
      success: false,
      error: error.message || 'Transcription failed',
    };
  }
}

// 4. FILE-BASED TRANSCRIPTION (Using Official SDK)
export async function transcribeAudioFile(audioFile: File): Promise<TranscriptionResult> {
  try {
    console.log('Processing file with AssemblyAI:', audioFile.name);

    // Convert File to Buffer for AssemblyAI
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const params = {
      audio: buffer,
      speech_model: 'universal' as const,
      language_detection: true,
      punctuate: true,
      format_text: true,
      disfluencies: false,
    };

    const transcript = await assemblyAI.transcripts.transcribe(params);

    if (transcript.status === 'error') {
      throw new Error(transcript.error || 'File transcription failed');
    }

    if (transcript.text) {
      return {
        text: transcript.text,
        success: true,
        confidence: transcript.confidence || null,
        words: transcript.words?.length || 0,
      };
    } else {
      throw new Error('No transcription text received');
    }

  } catch (error: any) {
    console.error('File transcription error:', error);
    return {
      text: '',
      success: false,
      error: error.message || 'File transcription failed',
    };
  }
}

// 5. COMPLETE WORKFLOW: URL/File → Text → Repurposed Content → Hashtags
export async function processCompleteWorkflow(
  input: string | File,
  generateHashtagsFlag: boolean = true
): Promise<{
  originalText: string;
  repurposedContent: ContentRepurposeResult;
  hashtags?: HashtagResult;
  transcription?: TranscriptionResult;
}> {
  try {
    let originalText: string;
    let transcription: TranscriptionResult | undefined;

    // Step 1: Get text content
    if (typeof input === 'string') {
      // Check if it's a URL or plain text
      if (isValidUrl(input)) {
        // It's a URL - transcribe it
        transcription = await transcribeFromUrl(input);
        if (!transcription.success) {
          throw new Error(transcription.error || 'Transcription failed');
        }
        originalText = transcription.text;
      } else {
        // It's plain text
        originalText = input;
      }
    } else {
      // File input - transcribe via file upload
      transcription = await transcribeAudioFile(input);
      if (!transcription.success) {
        throw new Error(transcription.error || 'File transcription failed');
      }
      originalText = transcription.text;
    }

    // Step 2: Repurpose content
    const repurposedContent = await repurposeContent(originalText);

    // Step 3: Generate hashtags (optional)
    let hashtags: HashtagResult | undefined;
    if (generateHashtagsFlag) {
      hashtags = await generateHashtags(originalText, ['twitter', 'linkedin', 'instagram', 'facebook', 'youtube']);
    }

    return {
      originalText,
      repurposedContent,
      hashtags,
      transcription,
    };
  } catch (error) {
    console.error('Complete workflow error:', error);
    throw error;
  }
}

// Helper function to validate URLs
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}