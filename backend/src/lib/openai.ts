import OpenAI from 'openai';
import { config } from './config.js';
import { UpstreamError } from './errors.js';
import type { ImageStyle } from '../types.js';

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: config.openaiApiKey,
      timeout: 60000, // 60s timeout
      maxRetries: 0, // We handle retries ourselves
    });
  }
  return openaiClient;
}

const STYLE_INSTRUCTIONS: Record<ImageStyle, string> = {
  photorealistic: 'Create a photorealistic image with natural lighting, accurate skin tones, and lifelike details. The result should look like a professional photograph.',
  vintage: 'Apply a vintage aesthetic with warm, slightly faded colors, soft film grain, and nostalgic mood reminiscent of 1970s-1980s photography.',
  cinematic: 'Create a cinematic look with dramatic lighting, film-like color grading, shallow depth of field, and a movie-poster quality composition.',
  painterly: 'Render in an artistic, painterly style with visible brushstroke textures, rich colors, and an impressionistic or classical painting aesthetic.',
};

function buildPrompt(style: string, scene: string): string {
  const styleInstruction = STYLE_INSTRUCTIONS[style as ImageStyle] || STYLE_INSTRUCTIONS.photorealistic;
  
  return `
COMPOSITING TASK: Create a single cohesive image combining two people with a new background.

SCENE DESCRIPTION: ${scene}

STYLE: ${styleInstruction}

COMPOSITING REQUIREMENTS:
- Place both subjects naturally in the scene with coherent spatial relationship
- Match lighting direction and intensity between subjects and background
- Ensure consistent perspective and scale
- Blend subjects seamlessly into the environment

QUALITY REQUIREMENTS:
- Sharp, high-quality rendering throughout
- Natural skin textures without artificial smoothing
- Anatomically correct hands with proper finger count and proportions
- Natural, symmetrical facial features
- No visible artifacts, halos, or blending seams

STRICT CONSTRAINTS:
- PRESERVE exact facial identity of both subjects - no modifications to face structure
- NO unnatural aging or de-aging effects
- NO additional people beyond the two subjects
- NO text, watermarks, or logos in the image
- NO distortions or mutations of body parts
`.trim();
}

interface GenerateImageOptions {
  personABase64: string;
  personBBase64: string;
  backgroundBase64: string;
  style: string;
  scene: string;
  size?: string;
  quality?: string;
  outputFormat?: string;
  outputCompression?: number;
}

interface GenerateImageResult {
  imageBase64: string;
  mimeType: string;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateImage(options: GenerateImageOptions): Promise<GenerateImageResult> {
  const {
    personABase64: _personABase64,
    personBBase64: _personBBase64,
    backgroundBase64: _backgroundBase64,
    style,
    scene,
    size = config.defaultSize,
    quality = config.defaultQuality,
    outputFormat = config.defaultOutputFormat,
  } = options;

  // Mock mode for development without API key
  if (config.isMockMode) {
    return generateMockImage();
  }

  const openai = getOpenAI();
  const prompt = buildPrompt(style, scene);

  // Note: Image inputs would be used with gpt-image-1 edit API
  // Currently using generate API which only takes prompt

  const maxRetries = 2;
  const backoffMs = [1000, 2000];
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.images.generate({
        model: config.openaiModel,
        prompt,
        n: 1,
        size: size as '1024x1024' | '1536x1024' | '1024x1536' | 'auto',
        quality: quality as 'low' | 'medium' | 'high',
        moderation: 'auto',
      });

      // Check for b64_json response
      const imageData = response.data?.[0];
      
      if (!imageData) {
        throw new Error('No image data in response');
      }
      
      if (imageData.b64_json) {
        return {
          imageBase64: imageData.b64_json,
          mimeType: `image/${outputFormat}`,
        };
      } else if (imageData.url) {
        // If URL returned, fetch and convert to base64
        const imageResponse = await fetch(imageData.url);
        const arrayBuffer = await imageResponse.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        return {
          imageBase64: base64,
          mimeType: `image/${outputFormat}`,
        };
      }

      throw new Error('No image data in response');
    } catch (error) {
      lastError = error as Error;
      
      // Check if error is retryable
      const isRetryable = isRetryableError(error);
      const is400Error = is400LevelError(error);

      // Don't retry on 400-level errors
      if (is400Error) {
        console.error('[OpenAI] Non-retryable error:', (error as Error).message);
        break;
      }

      // Retry on 429 and 5xx errors
      if (isRetryable && attempt < maxRetries) {
        console.warn(`[OpenAI] Retrying after error (attempt ${attempt + 1}/${maxRetries}):`, (error as Error).message);
        await sleep(backoffMs[attempt]);
        continue;
      }

      break;
    }
  }

  throw new UpstreamError(`OpenAI generation failed: ${lastError?.message ?? 'Unknown error'}`);
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof OpenAI.APIError) {
    return error.status === 429 || (error.status >= 500 && error.status < 600);
  }
  // Network errors are retryable
  if (error instanceof Error && error.message.includes('fetch')) {
    return true;
  }
  return false;
}

function is400LevelError(error: unknown): boolean {
  if (error instanceof OpenAI.APIError) {
    return error.status >= 400 && error.status < 500 && error.status !== 429;
  }
  return false;
}

/**
 * Generate a mock image for development/testing without OpenAI key.
 */
function generateMockImage(): GenerateImageResult {
  // Create a simple 100x100 placeholder PNG
  // This is a minimal valid PNG with solid color
  const mockBase64 = 
    'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABHNCSVQICAgIfAhkiAAAAAlwSFlz' +
    'AAALEwAACxMBAJqcGAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEUSURB' +
    'VHic7dAxAQAACAMgtX/0FRw8BEJhZ2ZeGee+A/g3ISEhISEhISEhISEhISEhISEhISEhISEhISEh' +
    'ISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEh' +
    'ISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEh' +
    'ISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEh' +
    'ISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhIaEPg8AByvE6V9MAAAAASUVORK5CYII=';

  return {
    imageBase64: mockBase64,
    mimeType: 'image/png',
  };
}

