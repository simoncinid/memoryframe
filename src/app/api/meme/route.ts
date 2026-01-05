import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const BACKEND_URL = process.env.BACKEND_URL || "https://memoryframe.onrender.com";

interface MemeRequest {
  photo: string; // base64
  memeType: "kirk" | "maduro";
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  // Remove data URL prefix if present
  const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

function getMimeType(base64: string): string {
  if (base64.startsWith("data:")) {
    const match = base64.match(/data:([^;]+);/);
    return match ? match[1] : "image/jpeg";
  }
  return "image/jpeg";
}

async function getMemeImageBase64(memeType: string): Promise<string> {
  const imageName = memeType === "kirk" ? "kirk.png" : "maduro.png";
  const imagePath = path.join(process.cwd(), "public", imageName);
  
  try {
    const imageBuffer = await readFile(imagePath);
    return `data:image/png;base64,${imageBuffer.toString("base64")}`;
  } catch (error) {
    console.error(`Failed to read meme image: ${imageName}`, error);
    throw new Error(`Meme image not found: ${imageName}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: MemeRequest = await request.json();

    // Validate required fields
    if (!body.photo || !body.memeType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate meme type
    if (!["kirk", "maduro"].includes(body.memeType)) {
      return NextResponse.json(
        { error: "Invalid meme type" },
        { status: 400 }
      );
    }

    // Get the meme image as base64
    const memeImageBase64 = await getMemeImageBase64(body.memeType);

    // Build multipart form data for backend
    const formData = new FormData();
    
    // Convert base64 images to blobs and append
    const photoMime = getMimeType(body.photo);
    const memeMime = "image/png";
    
    // User's photo as personA
    formData.append("personA", base64ToBlob(body.photo, photoMime), "userPhoto.jpg");
    // Meme target face as personB
    formData.append("personB", base64ToBlob(memeImageBase64, memeMime), "memeTarget.png");
    formData.append("style", "photorealistic");
    formData.append("meme_type", body.memeType); // Special flag for face swap mode
    
    // Build the scene/prompt for face swap
    const memePrompts: Record<string, string> = {
      kirk: "FACE SWAP ONLY: Replace the face in the first image with the facial features of Charlie Kirk from the second image. Keep the EXACT same body, clothing, pose, and background from the first image. Only blend the facial features (eyes, nose, mouth proportions) from the second image onto the face position in the first image. The result should look like the person in photo 1 but with facial characteristics of person in photo 2.",
      maduro: "FACE SWAP ONLY: Replace the face in the first image with the facial features of Nicolás Maduro from the second image. Keep the EXACT same body, clothing, pose, and background from the first image. Only blend the facial features (eyes, nose, mouth, mustache) from the second image onto the face position in the first image. The result should look like the person in photo 1 but with facial characteristics of person in photo 2.",
    };
    
    formData.append("scene", memePrompts[body.memeType]);
    formData.append("delete_policy", "immediate");

    // Forward client IP for rate limiting
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || 
                     request.headers.get("x-real-ip") || 
                     "unknown";

    // Call backend with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min timeout

    let backendResponse: Response;
    try {
      backendResponse = await fetch(`${BACKEND_URL}/api/generate`, {
        method: "POST",
        body: formData,
        headers: {
          "X-Forwarded-For": clientIp,
        },
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Backend fetch error:", fetchError);
      return NextResponse.json(
        { error: "Backend service unavailable. Please try again in a moment." },
        { status: 503 }
      );
    }
    clearTimeout(timeoutId);

    // Get response text first to handle non-JSON responses
    const responseText = await backendResponse.text();
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("Backend returned non-JSON response:", responseText.substring(0, 500));
      return NextResponse.json(
        { error: "Backend service error. Please try again." },
        { status: 502 }
      );
    }

    // Handle rate limit errors
    if (backendResponse.status === 429) {
      return NextResponse.json(
        { 
          error: data.message || "System is busy. Try again soon.",
          retry_after_seconds: data.retry_after_seconds,
        },
        { status: 429 }
      );
    }

    // Handle other errors
    if (!backendResponse.ok) {
      console.error("Backend error:", data);
      return NextResponse.json(
        { error: data.message || "Generation failed. Please try again." },
        { status: backendResponse.status }
      );
    }

    // Success - convert base64 to data URL for frontend display
    const resultImageUrl = `data:${data.mime_type};base64,${data.image_base64}`;

    return NextResponse.json({
      success: true,
      resultImageUrl,
      generationId: data.request_id,
      memeType: body.memeType,
      createdAt: new Date().toISOString(),
      generation_time_ms: data.generation_time_ms,
    });

  } catch (error) {
    console.error("Meme generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate meme. Please try again." },
      { status: 500 }
    );
  }
}

