import OpenAI, { toFile } from 'openai';
import sharp from 'sharp';
import { config } from './config.js';
import { UpstreamError } from './errors.js';
import type { ImageStyle } from '../types.js';

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: config.openaiApiKey,
      timeout: 120000, // 2 min timeout for edit operations
      maxRetries: 0, // We handle retries ourselves
    });
  }
  return openaiClient;
}

// Style instructions - ONLY about visual style, NOT about background or composition
const STYLE_INSTRUCTIONS: Record<ImageStyle, string> = {
  classic: 'Apply a timeless, elegant aesthetic with soft lighting and balanced colors.',
  painterly: 'Apply an artistic painterly look with subtle brushstroke textures and rich colors, while keeping faces photorealistic.',
  cinematic: 'Apply cinematic color grading with dramatic lighting contrast, keeping all details sharp.',
  vintage: 'Apply a vintage film aesthetic with warm, slightly faded colors and subtle grain.',
  blackwhite: 'Convert to elegant black and white with strong contrast and rich tonal range.',
  watercolor: 'Apply a soft watercolor effect to the environment while keeping faces sharp and realistic.',
  'pop-art': 'Apply bold Pop Art colors and graphic contrast while preserving facial recognition.',
  renaissance: 'Apply Renaissance painting tones and lighting while keeping faces highly detailed and realistic.',
  photorealistic: 'Enhance with professional photography quality - natural lighting and crisp details.',
};

function buildEditPrompt(style: string, userPrompt: string): string {
  const styleInstruction = STYLE_INSTRUCTIONS[style as ImageStyle] || STYLE_INSTRUCTIONS.classic;
  
  return `
TASK: This is a side-by-side collage of two photos (LEFT and RIGHT). Merge them into ONE unified photo by placing all people together.

USER REQUEST: ${userPrompt}

VISUAL STYLE: ${styleInstruction}

=== CRITICAL: MINIMAL AI GENERATION ===
This is a PHOTO COMPOSITING task, NOT an image generation task.
Your job is to MERGE existing photos with MINIMAL changes - like Photoshop compositing.
DO NOT regenerate or reimagine anything. PRESERVE as much as possible from the originals.

=== BACKGROUND PRESERVATION (VERY IMPORTANT) ===
1. Choose the background from LEFT or RIGHT side - whichever has the real scene (not plain/white)
2. COPY that background EXACTLY as it appears in the original - same colors, same details, same everything
3. Do NOT generate a new background. Do NOT add AI-generated elements to the background
4. The background should look IDENTICAL to the source photo - as if copied pixel by pixel
5. Only extend/blend the background minimally where needed to fit everyone

=== PEOPLE PRESERVATION (VERY IMPORTANT) ===
1. KEEP every person EXACTLY as they appear in their original photo
2. Do NOT modify faces, hair, clothes, poses, or body proportions
3. Do NOT regenerate or redraw any person - just PLACE them in the scene
4. The only acceptable change is adjusting scale/position to fit everyone together
5. Each person should look like they were cut out and pasted - preserving 100% of original details

=== MERGING RULES ===
- Include ALL people from BOTH sides - do not remove anyone
- Position people naturally together (standing, grouped, etc.)
- Match lighting between people and background
- Remove the visible border/seam between the two original photos
- Create smooth transitions where photos meet

=== ABSOLUTE CONSTRAINTS ===
- NEVER regenerate faces - they must be pixel-perfect copies from originals
- NEVER add AI-generated background elements - use only what's in the source photos
- NEVER add people not in the original images
- NEVER add text, watermarks, or logos
- NEVER create mutations or unrealistic body parts

The final result should look like a real photograph where everyone was present, NOT like AI-generated art.
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

/**
 * Create a side-by-side collage of two images using sharp
 */
async function createCollage(imageABase64: string, imageBBase64: string): Promise<Buffer> {
  // Convert base64 to buffers
  const bufferA = Buffer.from(imageABase64, 'base64');
  const bufferB = Buffer.from(imageBBase64, 'base64');

  // Get metadata for both images
  const metaA = await sharp(bufferA).metadata();
  const metaB = await sharp(bufferB).metadata();

  // Target height for both images (use the smaller one to avoid upscaling)
  const targetHeight = Math.min(metaA.height || 1024, metaB.height || 1024, 1024);

  // Resize both images to same height while maintaining aspect ratio
  const resizedA = await sharp(bufferA)
    .resize({ height: targetHeight, fit: 'inside' })
    .png()
    .toBuffer();

  const resizedB = await sharp(bufferB)
    .resize({ height: targetHeight, fit: 'inside' })
    .png()
    .toBuffer();

  // Get new dimensions after resize
  const newMetaA = await sharp(resizedA).metadata();
  const newMetaB = await sharp(resizedB).metadata();

  const widthA = newMetaA.width || 512;
  const widthB = newMetaB.width || 512;
  const totalWidth = widthA + widthB;

  // Create the collage - side by side
  const collage = await sharp({
    create: {
      width: totalWidth,
      height: targetHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([
      { input: resizedA, left: 0, top: 0 },
      { input: resizedB, left: widthA, top: 0 }
    ])
    .png()
    .toBuffer();

  return collage;
}

export async function generateImage(options: GenerateImageOptions): Promise<GenerateImageResult> {
  const {
    personABase64,
    personBBase64,
    style,
    scene,
    size = config.defaultSize,
  } = options;

  // Mock mode for development without API key
  if (config.isMockMode) {
    return generateMockImage();
  }

  const openai = getOpenAI();

  // Step 1: Create collage of the two images
  console.log('[OpenAI] Creating collage of two images...');
  const collageBuffer = await createCollage(personABase64, personBBase64);
  console.log('[OpenAI] Collage created, size:', collageBuffer.length, 'bytes');

  // Step 2: Build the prompt
  const prompt = buildEditPrompt(style, scene);

  // Step 3: Call OpenAI images/edit API
  const maxRetries = 2;
  const backoffMs = [2000, 4000];
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[OpenAI] Calling images.edit API (attempt ${attempt + 1})...`);
      
      // Convert buffer to File object for the SDK
      const imageFile = await toFile(collageBuffer, 'collage.png', { type: 'image/png' });

      const response = await openai.images.edit({
        model: config.openaiModel,
        image: imageFile,
        prompt,
        n: 1,
        size: size as '1024x1024' | '1536x1024' | '1024x1536',
      });

      console.log('[OpenAI] API response received');

      // Check for response data
      const imageData = response.data?.[0];
      
      if (!imageData) {
        throw new Error('No image data in response');
      }
      
      if (imageData.b64_json) {
        return {
          imageBase64: imageData.b64_json,
          mimeType: 'image/png',
        };
      } else if (imageData.url) {
        // If URL returned, fetch and convert to base64
        console.log('[OpenAI] Fetching image from URL...');
        const imageResponse = await fetch(imageData.url);
        const arrayBuffer = await imageResponse.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        return {
          imageBase64: base64,
          mimeType: 'image/png',
        };
      }

      throw new Error('No image data in response');
    } catch (error) {
      lastError = error as Error;
      console.error(`[OpenAI] Error on attempt ${attempt + 1}:`, (error as Error).message);
      
      // Check if error is retryable
      const isRetryable = isRetryableError(error);
      const is400Error = is400LevelError(error);

      // Don't retry on 400-level errors (except 429)
      if (is400Error) {
        console.error('[OpenAI] Non-retryable 4xx error');
        break;
      }

      // Retry on 429 and 5xx errors
      if (isRetryable && attempt < maxRetries) {
        console.warn(`[OpenAI] Retrying in ${backoffMs[attempt]}ms...`);
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
  const mockBase64 = 
    'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABHNCSVQICAgIfAhkiAAAAAlwSFlz' +
    'AAALEwAACxMBAJqcGAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEUSURB' +
    'VHic7dAxAQAACAMgtX/0FRw8BEJhZ2ZeGee+A/g3ISEhISEhISEhISEhISEhISEhISEhISEhISEh' +
    'ISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEh' +
    'ISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEh' +
    'ISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEh' +
    'ISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhIaEPg8AByvE6V9MAAAAASUVORK5CYII=';

  return {
    imageBase64: mockBase64,
    mimeType: 'image/png',
  };
}
