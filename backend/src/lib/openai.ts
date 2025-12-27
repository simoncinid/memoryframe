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

const STYLE_INSTRUCTIONS: Record<ImageStyle, string> = {
  classic: 'Timeless studio portrait style with soft, flattering lighting and elegant composition.',
  painterly: 'Artistic painterly style with visible brushstroke textures and rich colors, but maintaining photorealistic facial details.',
  cinematic: 'Cinematic look with dramatic lighting and film-like color grading, keeping faces sharp and detailed.',
  vintage: 'Vintage aesthetic with warm, slightly faded colors and nostalgic mood, but crystal clear facial features.',
  blackwhite: 'Elegant black and white with strong contrast and rich tonal range, preserving all facial details.',
  watercolor: 'Soft watercolor painting style with gentle color bleeds, but photorealistic faces.',
  'pop-art': 'Bold Pop Art style with vibrant colors and graphic elements, keeping faces recognizable and detailed.',
  renaissance: 'Renaissance masters style with classical painting techniques, but highly detailed realistic faces.',
  photorealistic: 'Professional photograph with natural lighting and lifelike details.',
};

function buildEditPrompt(style: string, userPrompt: string): string {
  const styleInstruction = STYLE_INSTRUCTIONS[style as ImageStyle] || STYLE_INSTRUCTIONS.classic;
  
  return `
TASK: Transform this side-by-side photo collage into a single unified portrait where both people appear together naturally in the same scene.

USER REQUEST: ${userPrompt}

STYLE: ${styleInstruction}

CRITICAL REQUIREMENTS:
1. UNIFY the two people into ONE cohesive photograph - they should look like they're in the same physical space
2. Make them appear connected - standing together, embracing, or interacting naturally as specified by the user
3. Create a seamless, realistic background that fits both subjects
4. Match lighting, shadows, and perspective perfectly between both people
5. PRESERVE exact facial features of BOTH people - faces must remain highly detailed and recognizable
6. Skin textures must be natural and photorealistic regardless of artistic style
7. Hands and body proportions must be anatomically correct
8. No visible seams, borders, or signs this was originally two separate photos

ABSOLUTE CONSTRAINTS:
- Faces must be HYPER-REALISTIC and HIGHLY DETAILED even if using artistic styles
- Do NOT alter, distort, or stylize facial features beyond recognition
- Do NOT add extra people
- Do NOT add text or watermarks
- Do NOT create unrealistic proportions or mutations
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

  // Step 1: Create collage of the two people
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
