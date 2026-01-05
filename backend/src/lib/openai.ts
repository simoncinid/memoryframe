import { config } from './config.js';
import { UpstreamError } from './errors.js';
import type { ImageStyle } from '../types.js';

const WAVESPEED_API_BASE = 'https://api.wavespeed.ai/api/v3';

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
TASK: Create a SINGLE unified photograph where ALL people from BOTH input images appear together naturally.

USER REQUEST: ${userPrompt}

VISUAL STYLE TO APPLY: ${styleInstruction}

CRITICAL - DOCUMENT/ID CARD DETECTION:
- If ANY input image contains an ID card, passport, driver's license, or any official document with a photo:
  * EXTRACT ONLY THE PERSON'S FACE from the document photo
  * COMPLETELY IGNORE the document itself (card, borders, text, etc.)
  * Recreate the person's FULL BODY based on their face
  * DO NOT include the physical card/document in the final image
- Treat the person from the document as if you received a normal portrait photo of them

MERGING RULES:
1. PRESERVE ALL PEOPLE from the FIRST image - do not remove anyone
2. ADD the person(s) from the SECOND image into the scene with the others
3. Everyone must appear together in ONE cohesive photo, as if they were all present in the same moment
4. Arrange people naturally - standing close together, arms around shoulders, embracing, or in a warm family pose
5. People should appear PHYSICALLY CONNECTED (touching, hugging, holding hands) not just standing apart

BACKGROUND RULES:
- If the user specified a background/scene in their request, use that
- If NOT specified: USE the background from the group/family photo, not from individual portraits or documents
- If one image has a plain/white background and the other has a real scene, USE the real scene
- The final background must look natural and fit all subjects

FACE REQUIREMENTS (CRITICAL):
- PRESERVE exact facial features of EVERY person - all faces must remain highly detailed and 100% recognizable
- Faces must be HYPER-REALISTIC regardless of artistic style applied
- Do NOT alter, blur, distort, or stylize any face
- Natural skin textures on all faces

BODY GENERATION:
- If only a face is available (e.g., from an ID card), generate an appropriate full body that:
  * Matches the age and apparent characteristics of the face
  * Wears clothing appropriate to the scene/setting
  * Has natural posture integrated with the group

TECHNICAL REQUIREMENTS:
- Match lighting and shadows consistently across all people
- Correct perspective so everyone appears at natural scale
- Anatomically correct hands and body proportions
- No visible seams, borders, or artifacts

ABSOLUTE CONSTRAINTS:
- Do NOT include any ID cards, documents, or cards in the final image
- Do NOT remove or ignore any person from either image
- Do NOT add people who are not in the original images
- Do NOT add text, watermarks, or logos
- Do NOT create mutations or unrealistic body parts
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

interface WaveSpeedSubmitResponse {
  data: {
    id: string;
  };
}

interface WaveSpeedResultResponse {
  data: {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    outputs?: string[];
    error?: string;
  };
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Submit task to WaveSpeed SeedDream v4 API
 */
async function submitSeedreamTask(images: string[], prompt: string): Promise<string> {
  const url = `${WAVESPEED_API_BASE}/bytedance/seedream-v4/edit`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.seedreamApiKey}`,
    },
    body: JSON.stringify({
      enable_base64_output: false,
      enable_sync_mode: false,
      images: images,
      prompt: prompt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[SeedDream] Submit error:', response.status, errorText);
    throw new UpstreamError(`SeedDream API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json() as WaveSpeedSubmitResponse;
  return result.data.id;
}

/**
 * Poll for task result
 */
async function pollForResult(requestId: string, timeoutMs: number = 120000): Promise<string> {
  const url = `${WAVESPEED_API_BASE}/predictions/${requestId}/result`;
  const startTime = Date.now();
  const pollInterval = 500; // 500ms between polls
  
  while (Date.now() - startTime < timeoutMs) {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${config.seedreamApiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[SeedDream] Poll error:', response.status, errorText);
      throw new UpstreamError(`SeedDream poll error: ${response.status}`);
    }

    const result = await response.json() as WaveSpeedResultResponse;
    const status = result.data.status;

    if (status === 'completed') {
      if (!result.data.outputs || result.data.outputs.length === 0) {
        throw new UpstreamError('SeedDream returned no output images');
      }
      console.log(`[SeedDream] Task completed in ${Date.now() - startTime}ms`);
      return result.data.outputs[0];
    } else if (status === 'failed') {
      throw new UpstreamError(`SeedDream task failed: ${result.data.error || 'Unknown error'}`);
    }

    // Still processing, wait and poll again
    console.log(`[SeedDream] Status: ${status}, waiting...`);
    await sleep(pollInterval);
  }

  throw new UpstreamError('SeedDream task timed out');
}

/**
 * Download image from URL and convert to base64
 */
async function downloadImageAsBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new UpstreamError(`Failed to download generated image: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
}

export async function generateImage(options: GenerateImageOptions): Promise<GenerateImageResult> {
  const {
    personABase64,
    personBBase64,
    style,
    scene,
  } = options;

  // Mock mode for development without API key
  if (config.isMockMode) {
    return generateMockImage();
  }

  console.log('[SeedDream] Starting image generation...');

  // SeedDream v4 accepts multiple images directly - no need for collage!
  // Convert base64 to data URLs for the API
  const imageA = `data:image/png;base64,${personABase64}`;
  const imageB = `data:image/png;base64,${personBBase64}`;

  // Build the prompt
  const prompt = buildEditPrompt(style, scene);
  console.log('[SeedDream] Prompt:', prompt.substring(0, 200) + '...');

  // Submit the task
  console.log('[SeedDream] Submitting task...');
  const requestId = await submitSeedreamTask([imageA, imageB], prompt);
  console.log(`[SeedDream] Task submitted, request ID: ${requestId}`);

  // Poll for result
  console.log('[SeedDream] Polling for result...');
  const outputUrl = await pollForResult(requestId);
  console.log(`[SeedDream] Output URL: ${outputUrl}`);

  // Download the result image
  console.log('[SeedDream] Downloading result image...');
  const imageBase64 = await downloadImageAsBase64(outputUrl);

  return {
    imageBase64,
    mimeType: 'image/png',
  };
}

/**
 * Generate a mock image for development/testing without API key.
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
    'ISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEh' +
    'ISEhISEhIaEPg8AByvE6V9MAAAAASUVORK5CYII=';

  return {
    imageBase64: mockBase64,
    mimeType: 'image/png',
  };
}
