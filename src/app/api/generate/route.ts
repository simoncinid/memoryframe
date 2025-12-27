import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://memoryframe-backend.onrender.com";

interface GenerateRequest {
  personA: string; // base64
  personB: string; // base64
  background: string; // base64
  style: string;
  prompt: string;
  deleteImmediately?: boolean;
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

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();

    // Validate required fields
    if (!body.personA || !body.personB || !body.background || !body.style || !body.prompt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Build multipart form data for backend
    const formData = new FormData();
    
    // Convert base64 images to blobs and append
    const personAMime = getMimeType(body.personA);
    const personBMime = getMimeType(body.personB);
    const backgroundMime = getMimeType(body.background);
    
    formData.append("personA", base64ToBlob(body.personA, personAMime), "personA.jpg");
    formData.append("personB", base64ToBlob(body.personB, personBMime), "personB.jpg");
    formData.append("background", base64ToBlob(body.background, backgroundMime), "background.jpg");
    formData.append("style", body.style);
    formData.append("scene", body.prompt);
    formData.append("delete_policy", body.deleteImmediately ? "immediate" : "24h");

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
      console.error("Backend error:", backendResponse.status, data);
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
      style: body.style,
      prompt: body.prompt,
      createdAt: new Date().toISOString(),
      deletedSources: body.deleteImmediately || false,
      generation_time_ms: data.generation_time_ms,
    });

  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate portrait. Please try again." },
      { status: 500 }
    );
  }
}

