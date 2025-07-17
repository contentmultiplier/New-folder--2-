// Cloud Upload API Utils for ContentMux
// Handles: Cloud Storage → AssemblyAI → Claude Pipeline

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AssemblyAI } from 'assemblyai';
import Anthropic from '@anthropic-ai/sdk';

// Initialize clients
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT, // e.g., https://abc123.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
  },
});

const assemblyAI = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY_CONTENT!,
});

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!;

// Types
export interface CloudUploadUrl {
  uploadUrl: string;
  fileKey: string;
  fileUrl: string;
  expiresIn: number;
}

export interface CloudProcessingResult {
  success: boolean;
  transcription?: {
    text: string;
    confidence?: number;
    wordCount?: number;
  };
  repurposedContent?: {
    twitter: string;
    linkedin: string;
    instagram: string;
    facebook: string;
    youtube: string;
  };
  error?: string;
  processingTime?: {
    transcription: number;
    repurposing: number;
    total: number;
  };
}

// 1. Generate signed upload URL for direct upload to cloud
export async function generateUploadUrl(
  fileName: string,
  fileType: string,
  fileSizeBytes: number
): Promise<CloudUploadUrl> {
  try {
    // Validate file type
    const allowedTypes = [
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
      'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/aac'
    ];
    
    if (!allowedTypes.includes(fileType)) {
      throw new Error('Unsupported file type. Please upload video or audio files.');
    }

    // Validate file size (max 500MB for testing)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (fileSizeBytes > maxSize) {
      throw new Error('File too large. Maximum size is 500MB.');
    }

    // Generate unique file key
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileExtension = fileName.split('.').pop() || 'mp4';
    const fileKey = `uploads/${timestamp}-${randomSuffix}.${fileExtension}`;

    // Create presigned URL for upload
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
      ContentLength: fileSizeBytes,
    });

    const uploadUrl = await getSignedUrl(s3Client, putCommand, { 
      expiresIn: 3600 // 1 hour
    });

    // Generate public access URL
    const fileUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileKey}`;

    return {
      uploadUrl,
      fileKey,
      fileUrl,
      expiresIn: 3600,
    };

  } catch (error: any) {
    console.error('Error generating upload URL:', error);
    throw new Error(`Failed to generate upload URL: ${error.message}`);
  }
}

// 2. Process uploaded file: Cloud → AssemblyAI → Claude
export async function processCloudFile(fileKey: string): Promise<CloudProcessingResult> {
  const startTime = Date.now();
  let transcriptionTime = 0;
  let repurposingTime = 0;

  try {
    console.log('Starting cloud file processing for:', fileKey);

    // Step 1: Generate public URL for AssemblyAI
    const fileUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileKey}`;
    console.log('File URL for transcription:', fileUrl);

    // Step 2: Transcribe with AssemblyAI
    const transcriptionStart = Date.now();
    console.log('Starting AssemblyAI transcription...');

    const transcript = await assemblyAI.transcripts.transcribe({
      audio: fileUrl,
      speech_model: 'universal',
      language_detection: true,
      punctuate: true,
      format_text: true,
      disfluencies: false,
    });

    if (transcript.status === 'error') {
      throw new Error(`Transcription failed: ${transcript.error}`);
    }

    if (!transcript.text) {
      throw new Error('No transcription text received');
    }

    transcriptionTime = Date.now() - transcriptionStart;
    console.log(`Transcription completed in ${transcriptionTime}ms`);

    // Step 3: Repurpose content with Claude
    const repurposingStart = Date.now();
    console.log('Starting content repurposing...');

    const message = await anthropic.messages.create({
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

Original content: ${transcript.text}`
      }]
    });

    const firstContent = message.content[0];
    let response = firstContent.type === 'text' ? firstContent.text : '';
    
    // Clean up the response
    response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const repurposedContent = JSON.parse(response);
    repurposingTime = Date.now() - repurposingStart;
    
    console.log(`Content repurposing completed in ${repurposingTime}ms`);

    const totalTime = Date.now() - startTime;

    return {
      success: true,
      transcription: {
        text: transcript.text,
        confidence: transcript.confidence || undefined,
        wordCount: transcript.words?.length || 0,
      },
      repurposedContent,
      processingTime: {
        transcription: transcriptionTime,
        repurposing: repurposingTime,
        total: totalTime,
      },
    };

  } catch (error: any) {
    console.error('Cloud file processing error:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to process file',
      processingTime: {
        transcription: transcriptionTime,
        repurposing: repurposingTime,
        total: Date.now() - startTime,
      },
    };
  }
}

// 3. Check if file exists in cloud storage
export async function checkFileExists(fileKey: string): Promise<boolean> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}

// 4. Get file info from cloud storage
export async function getFileInfo(fileKey: string): Promise<{
  exists: boolean;
  size?: number;
  lastModified?: Date;
  contentType?: string;
}> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });
    
    const response = await s3Client.send(command);
    
    return {
      exists: true,
      size: response.ContentLength,
      lastModified: response.LastModified,
      contentType: response.ContentType,
    };
  } catch (error) {
    return { exists: false };
  }
}