import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://memoryframe.onrender.com";

interface PaintByNumbersRequest {
  photo: string; // base64 data url or raw base64
}

function base64ToBlob(base64: string, mimeType: string): Blob {
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
    const body: PaintByNumbersRequest = await request.json();

    if (!body.photo) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const formData = new FormData();
    const photoMime = getMimeType(body.photo);
    formData.append("photo", base64ToBlob(body.photo, photoMime), "photo.jpg");
    formData.append("delete_policy", "immediate");

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    let backendResponse: Response;
    try {
      backendResponse = await fetch(`${BACKEND_URL}/api/paint-by-numbers`, {
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

    const responseText = await backendResponse.text();

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(responseText) as Record<string, unknown>;
    } catch {
      console.error("Backend returned non-JSON response:", responseText.substring(0, 500));
      return NextResponse.json({ error: "Backend service error. Please try again." }, { status: 502 });
    }

    if (backendResponse.status === 429) {
      const message = typeof data.message === "string" ? data.message : undefined;
      const retryAfter =
        typeof data.retry_after_seconds === "number" ? data.retry_after_seconds : undefined;
      return NextResponse.json(
        {
          error: message || "System is busy. Try again soon.",
          retry_after_seconds: retryAfter,
        },
        { status: 429 }
      );
    }

    if (!backendResponse.ok) {
      console.error("Backend error:", data);
      const message = typeof data.message === "string" ? data.message : undefined;
      return NextResponse.json(
        { error: message || "Generation failed. Please try again." },
        { status: backendResponse.status }
      );
    }

    const mimeType = typeof data.mime_type === "string" ? data.mime_type : "image/png";
    const imageBase64 = typeof data.image_base64 === "string" ? data.image_base64 : null;
    if (!imageBase64) {
      return NextResponse.json({ error: "Backend service error. Please try again." }, { status: 502 });
    }

    const resultImageUrl = `data:${mimeType};base64,${imageBase64}`;

    return NextResponse.json({
      success: true,
      resultImageUrl,
      generationId: typeof data.request_id === "string" ? data.request_id : undefined,
      createdAt: new Date().toISOString(),
      generation_time_ms: typeof data.generation_time_ms === "number" ? data.generation_time_ms : undefined,
    });
  } catch (error) {
    console.error("Paint-by-numbers generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate paint-by-numbers. Please try again." },
      { status: 500 }
    );
  }
}


