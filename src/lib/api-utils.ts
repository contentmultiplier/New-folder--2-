// ContentMux API Utility Functions
// Handles all three API integrations: Claude Content, Claude Hashtags, LemonFox Transcription

import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';

// Initialize Anthropic clients
const anthropicContent = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY_CONTENT,
});

const anthropicHashtags = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY_HASHTAGS,
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
}

// 1. CLAUDE CONTENT REPURPOSING
export async function repurposeContent(originalContent: string): Promise<ContentRepurposeResult> {
  try {
    const message = await anthropicContent.messages.create({
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
    
    console.log('Claude response:', response); // Debug log
    
    const parsed = JSON.parse(response);
    return parsed;
  } catch (error) {
    console.error('Content repurposing error:', error);
    console.error('Raw response:', message?.content?.[0]);
    throw new Error('Failed to repurpose content');
  }
}

// 2. CLAUDE HASHTAG RESEARCH
export async function generateHashtags(content: string, platforms: string[]): Promise<HashtagResult> {
  try {
    const message = await anthropicHashtags.messages.create({
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
    
    console.log('Hashtags response:', response); // Debug log
    
    const parsed = JSON.parse(response);
    return parsed;
  } catch (error) {
    console.error('Hashtag generation error:', error);
    console.error('Raw response:', message?.content?.[0]);
    throw new Error('Failed to generate hashtags');
  }
}

// 3. LEMONFOX TRANSCRIPTION
export async function transcribeAudio(audioFile: File): Promise<TranscriptionResult> {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'json');

    const response = await axios.post(
      process.env.LEMONFOX_API_URL || 'https://api.lemonfox.ai/v1/audio/transcriptions',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.LEMONFOX_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes timeout for large files
      }
    );

    return {
      text: response.data.text,
      success: true,
    };
  } catch (error: any) {
    console.error('Transcription error:', error);
    return {
      text: '',
      success: false,
      error: error.response?.data?.error || 'Transcription failed',
    };
  }
}

// 4. COMPLETE WORKFLOW: Audio/Video → Text → Repurposed Content → Hashtags
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

    // Step 1: Get text content (either from input or transcription)
    if (typeof input === 'string') {
      originalText = input;
    } else {
      // File input - transcribe first
      transcription = await transcribeAudio(input);
      if (!transcription.success) {
        throw new Error(transcription.error || 'Transcription failed');
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