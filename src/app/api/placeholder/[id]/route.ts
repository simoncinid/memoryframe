import { NextRequest, NextResponse } from "next/server";

// This is a mock endpoint that returns a placeholder image
// In production, this would be replaced by actual generated images stored in S3/R2

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Create a simple SVG placeholder that looks like a portrait
  const svg = `
    <svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#78716c;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#44403c;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="overlay" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" style="stop-color:#000;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#000;stop-opacity:0" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <rect width="100%" height="100%" fill="url(#overlay)"/>
      <text x="50%" y="45%" font-family="system-ui, sans-serif" font-size="32" fill="white" text-anchor="middle" opacity="0.8">Generated Portrait</text>
      <text x="50%" y="55%" font-family="system-ui, sans-serif" font-size="18" fill="white" text-anchor="middle" opacity="0.6">ID: ${id}</text>
      <text x="50%" y="65%" font-family="system-ui, sans-serif" font-size="14" fill="white" text-anchor="middle" opacity="0.4">Replace with actual AI generation</text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000",
    },
  });
}

