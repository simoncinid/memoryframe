import sharp from 'sharp';

/**
 * Applica un pattern watermark diagonale su tutta l'immagine.
 * Usato per le foto generate con quota gratuita (non scaricabili fino a pagamento).
 */
export async function applyDiagonalWatermark(imageBase64: string, mimeType: string): Promise<{ base64: string; mimeType: string }> {
  const inputBuffer = Buffer.from(imageBase64, 'base64');
  const img = sharp(inputBuffer);
  const meta = await img.metadata();
  const w = meta.width ?? 1024;
  const h = meta.height ?? 1024;

  // Pattern diagonale: linee semi-trasparenti a -45°
  // SVG 2x della dimensione per coprire anche dopo rotazione
  const size = Math.max(w, h) * 2;
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <pattern id="lines" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="rotate(-45 30 30)">
      <line x1="0" y1="0" x2="0" y2="60" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>
      <line x1="30" y1="0" x2="30" y2="60" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#lines)"/>
</svg>`;

  const overlayBuffer = Buffer.from(svg);
  const outFormat = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpeg';
  const watermarked = await img
    .composite([{ input: overlayBuffer, blend: 'over' }])
    .toFormat(outFormat, { quality: outFormat === 'jpeg' ? 90 : undefined })
    .toBuffer();

  const outMime = outFormat === 'png' ? 'image/png' : outFormat === 'webp' ? 'image/webp' : 'image/jpeg';
  return {
    base64: watermarked.toString('base64'),
    mimeType: outMime,
  };
}
