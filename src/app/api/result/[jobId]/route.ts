import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "https://memoryframe.onrender.com";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    if (!jobId) {
      return NextResponse.json({ error: "jobId required" }, { status: 400 });
    }

    const res = await fetch(`${BACKEND_URL}/v1/generate/result/${encodeURIComponent(jobId)}`);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Image not available" },
        { status: res.status }
      );
    }

    return NextResponse.json({
      image_base64: data.image_base64,
      mime_type: data.mime_type || "image/png",
    });
  } catch (e) {
    console.error("Result fetch error:", e);
    return NextResponse.json({ error: "Service error" }, { status: 500 });
  }
}
