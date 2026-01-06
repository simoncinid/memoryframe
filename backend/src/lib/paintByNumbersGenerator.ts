/**
 * Paint-by-Numbers Generator
 * Deterministic algorithm that creates professional paint-by-numbers templates
 * Similar to commercial services like PaintYourNumbers, Winnie's Picks, etc.
 */

import sharp from 'sharp';
import { createCanvas, CanvasRenderingContext2D } from 'canvas';

// Configuration
const CONFIG = {
  maxWidth: 1000,           // Max dimension for processing
  numColors: 24,            // Number of colors in palette (more = more detail)
  minRegionSize: 250,       // Minimum pixels for a region (balanced: detail + readability)
  minRegionForNumber: 150,  // Minimum region size to display a number
  outlineWidth: 1,          // Black outline thickness
  fontSize: 9,              // Base font size for numbers
  minFontSize: 6,           // Minimum font size
  legendSwatchSize: 22,     // Size of color swatches in legend
  legendPadding: 16,        // Padding around legend
  legendRowHeight: 30,      // Height of each legend row
};

interface Color {
  r: number;
  g: number;
  b: number;
}

interface Region {
  id: number;
  colorIndex: number;
  pixels: Set<number>; // Set of pixel indices
  centroidX: number;
  centroidY: number;
  area: number;
}

interface PaintByNumbersResult {
  imageBase64: string;      // Template (B/W with numbers)
  coloredBase64: string;    // Colored preview (how it looks when painted)
  mimeType: string;
}

/**
 * Main entry point: generates paint-by-numbers from photo buffer
 */
export async function generatePaintByNumbersTemplate(
  photoBuffer: Buffer
): Promise<PaintByNumbersResult> {
  console.log('[PBN] Starting paint-by-numbers generation...');

  // Step 1: Load and resize image
  const { data: pixels, width, height } = await loadAndResizeImage(photoBuffer);
  console.log(`[PBN] Image loaded: ${width}x${height}`);

  // Step 2: Extract colors and quantize to palette
  const palette = quantizeColors(pixels, width, height, CONFIG.numColors);
  console.log(`[PBN] Palette extracted: ${palette.length} colors`);

  // Step 3: Map each pixel to nearest palette color
  const colorMap = mapPixelsTopalette(pixels, width, height, palette);
  console.log('[PBN] Pixels mapped to palette');

  // Step 4: Find connected regions using flood-fill
  const regions = findConnectedRegions(colorMap, width, height);
  console.log(`[PBN] Found ${regions.length} regions`);

  // Step 5: Merge small regions into neighbors
  const mergedRegions = mergeSmallRegions(regions, colorMap, width, height, CONFIG.minRegionSize);
  console.log(`[PBN] After merging: ${mergedRegions.length} regions`);

  // Step 6: Calculate centroids for number placement
  calculateCentroids(mergedRegions, width);

  // Step 7: Render the template (B/W with numbers and legend)
  const templateImage = renderPaintByNumbers(
    colorMap,
    width,
    height,
    palette,
    mergedRegions
  );
  console.log('[PBN] Template rendered');

  // Step 8: Render the colored preview (how it looks when painted)
  const coloredImage = renderColoredPreview(
    colorMap,
    width,
    height,
    palette
  );
  console.log('[PBN] Colored preview rendered');

  // Convert to PNG buffers then base64
  const templateBuffer = templateImage.toBuffer('image/png');
  const coloredBuffer = coloredImage.toBuffer('image/png');

  return {
    imageBase64: templateBuffer.toString('base64'),
    coloredBase64: coloredBuffer.toString('base64'),
    mimeType: 'image/png',
  };
}

/**
 * Load image and resize to manageable dimensions
 */
async function loadAndResizeImage(
  buffer: Buffer
): Promise<{ data: Buffer; width: number; height: number }> {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  let width = metadata.width || 800;
  let height = metadata.height || 800;

  // Resize if too large
  if (width > CONFIG.maxWidth || height > CONFIG.maxWidth) {
    const scale = CONFIG.maxWidth / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const { data, info } = await image
    .resize(width, height, { fit: 'inside' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return { data, width: info.width, height: info.height };
}

/**
 * Quantize image colors using median-cut algorithm
 */
function quantizeColors(
  pixels: Buffer,
  width: number,
  height: number,
  numColors: number
): Color[] {
  // Collect all unique colors (sampled for performance)
  const colorCounts = new Map<string, { color: Color; count: number }>();
  const sampleStep = Math.max(1, Math.floor((width * height) / 50000)); // Sample ~50k pixels max

  for (let i = 0; i < width * height; i += sampleStep) {
    const idx = i * 3;
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];

    // Reduce precision slightly for better grouping
    const qr = Math.round(r / 4) * 4;
    const qg = Math.round(g / 4) * 4;
    const qb = Math.round(b / 4) * 4;

    const key = `${qr},${qg},${qb}`;
    const existing = colorCounts.get(key);
    if (existing) {
      existing.count++;
    } else {
      colorCounts.set(key, { color: { r: qr, g: qg, b: qb }, count: 1 });
    }
  }

  // Convert to array and sort by count
  const colors = Array.from(colorCounts.values());

  // Use median-cut to reduce to numColors
  const palette = medianCut(colors, numColors);

  return palette;
}

/**
 * Median-cut color quantization
 */
function medianCut(
  colors: { color: Color; count: number }[],
  numColors: number
): Color[] {
  if (colors.length <= numColors) {
    return colors.map((c) => c.color);
  }

  // Start with all colors in one bucket
  const buckets: { color: Color; count: number }[][] = [colors];

  while (buckets.length < numColors) {
    // Find bucket with largest range
    let maxRange = -1;
    let maxBucketIdx = 0;
    let maxChannel: 'r' | 'g' | 'b' = 'r';

    for (let i = 0; i < buckets.length; i++) {
      const bucket = buckets[i];
      if (bucket.length < 2) continue;

      for (const channel of ['r', 'g', 'b'] as const) {
        const values = bucket.map((c) => c.color[channel]);
        const range = Math.max(...values) - Math.min(...values);
        if (range > maxRange) {
          maxRange = range;
          maxBucketIdx = i;
          maxChannel = channel;
        }
      }
    }

    if (maxRange <= 0) break;

    // Split the bucket at median
    const bucket = buckets[maxBucketIdx];
    bucket.sort((a, b) => a.color[maxChannel] - b.color[maxChannel]);
    const mid = Math.floor(bucket.length / 2);

    buckets.splice(maxBucketIdx, 1, bucket.slice(0, mid), bucket.slice(mid));
  }

  // Average each bucket to get final colors
  return buckets.map((bucket) => {
    if (bucket.length === 0) return { r: 128, g: 128, b: 128 };

    let totalWeight = 0;
    let r = 0,
      g = 0,
      b = 0;

    for (const { color, count } of bucket) {
      r += color.r * count;
      g += color.g * count;
      b += color.b * count;
      totalWeight += count;
    }

    return {
      r: Math.round(r / totalWeight),
      g: Math.round(g / totalWeight),
      b: Math.round(b / totalWeight),
    };
  });
}

/**
 * Map each pixel to the nearest palette color
 */
function mapPixelsTopalette(
  pixels: Buffer,
  width: number,
  height: number,
  palette: Color[]
): Uint8Array {
  const colorMap = new Uint8Array(width * height);

  for (let i = 0; i < width * height; i++) {
    const idx = i * 3;
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];

    // Find nearest palette color
    let minDist = Infinity;
    let nearestIdx = 0;

    for (let j = 0; j < palette.length; j++) {
      const pc = palette[j];
      const dist =
        (r - pc.r) ** 2 + (g - pc.g) ** 2 + (b - pc.b) ** 2;
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = j;
      }
    }

    colorMap[i] = nearestIdx;
  }

  return colorMap;
}

/**
 * Find connected regions using flood-fill
 */
function findConnectedRegions(
  colorMap: Uint8Array,
  width: number,
  height: number
): Region[] {
  const visited = new Uint8Array(width * height);
  const regions: Region[] = [];
  let regionId = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (visited[idx]) continue;

      const colorIndex = colorMap[idx];
      const pixels = new Set<number>();

      // Flood-fill to find all connected pixels of same color
      const stack = [idx];
      while (stack.length > 0) {
        const pIdx = stack.pop()!;
        if (visited[pIdx]) continue;
        if (colorMap[pIdx] !== colorIndex) continue;

        visited[pIdx] = 1;
        pixels.add(pIdx);

        const px = pIdx % width;
        const py = Math.floor(pIdx / width);

        // 4-connectivity (up, down, left, right)
        if (px > 0) stack.push(pIdx - 1);
        if (px < width - 1) stack.push(pIdx + 1);
        if (py > 0) stack.push(pIdx - width);
        if (py < height - 1) stack.push(pIdx + width);
      }

      if (pixels.size > 0) {
        regions.push({
          id: regionId++,
          colorIndex,
          pixels,
          centroidX: 0,
          centroidY: 0,
          area: pixels.size,
        });
      }
    }
  }

  return regions;
}

/**
 * Merge small regions into their largest neighbor
 */
function mergeSmallRegions(
  regions: Region[],
  colorMap: Uint8Array,
  width: number,
  height: number,
  minSize: number
): Region[] {
  // Sort by size (process smallest first)
  const sorted = [...regions].sort((a, b) => a.area - b.area);

  const regionMap = new Map<number, Region>();
  for (const r of regions) {
    regionMap.set(r.id, r);
  }

  // Create pixel-to-region lookup
  const pixelToRegion = new Int32Array(width * height);
  for (const r of regions) {
    for (const pIdx of r.pixels) {
      pixelToRegion[pIdx] = r.id;
    }
  }

  for (const region of sorted) {
    if (region.area >= minSize) continue;
    if (region.pixels.size === 0) continue; // Already merged

    // Find neighboring regions
    const neighborCounts = new Map<number, number>();

    for (const pIdx of region.pixels) {
      const px = pIdx % width;
      const py = Math.floor(pIdx / width);

      const neighbors = [
        px > 0 ? pIdx - 1 : -1,
        px < width - 1 ? pIdx + 1 : -1,
        py > 0 ? pIdx - width : -1,
        py < height - 1 ? pIdx + width : -1,
      ];

      for (const nIdx of neighbors) {
        if (nIdx < 0) continue;
        const nRegionId = pixelToRegion[nIdx];
        if (nRegionId !== region.id) {
          neighborCounts.set(nRegionId, (neighborCounts.get(nRegionId) || 0) + 1);
        }
      }
    }

    // Merge into the neighbor with most shared border
    let maxNeighbor = -1;
    let maxCount = 0;
    for (const [nId, count] of neighborCounts) {
      if (count > maxCount) {
        maxCount = count;
        maxNeighbor = nId;
      }
    }

    if (maxNeighbor >= 0) {
      const targetRegion = regionMap.get(maxNeighbor);
      if (targetRegion) {
        // Merge pixels
        for (const pIdx of region.pixels) {
          targetRegion.pixels.add(pIdx);
          pixelToRegion[pIdx] = targetRegion.id;
          colorMap[pIdx] = targetRegion.colorIndex; // Update color map
        }
        targetRegion.area += region.area;
        region.pixels.clear();
        region.area = 0;
      }
    }
  }

  // Return only non-empty regions
  return regions.filter((r) => r.area > 0);
}

/**
 * Calculate centroid for each region (for number placement)
 */
function calculateCentroids(regions: Region[], width: number): void {
  for (const region of regions) {
    let sumX = 0;
    let sumY = 0;

    for (const pIdx of region.pixels) {
      sumX += pIdx % width;
      sumY += Math.floor(pIdx / width);
    }

    region.centroidX = Math.round(sumX / region.pixels.size);
    region.centroidY = Math.round(sumY / region.pixels.size);
  }
}

/**
 * Render the final paint-by-numbers image
 */
function renderPaintByNumbers(
  colorMap: Uint8Array,
  width: number,
  height: number,
  palette: Color[],
  regions: Region[]
): ReturnType<typeof createCanvas> {
  // Calculate legend dimensions
  const colorsPerRow = Math.min(10, palette.length);
  const legendRows = Math.ceil(palette.length / colorsPerRow);
  const legendHeight = CONFIG.legendPadding * 2 + legendRows * CONFIG.legendRowHeight;

  // Create canvas with space for legend at bottom
  const totalHeight = height + legendHeight;
  const canvas = createCanvas(width, totalHeight);
  const ctx = canvas.getContext('2d');

  // Fill with white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, totalHeight);

  // Draw outlines (edges between different color regions)
  drawOutlines(ctx, colorMap, width, height);

  // Draw numbers in each region
  drawNumbers(ctx, regions, palette, width, height);

  // Draw legend at bottom
  drawLegend(ctx, palette, width, height, legendHeight);

  return canvas;
}

/**
 * Draw black outlines where colors change
 */
function drawOutlines(
  ctx: CanvasRenderingContext2D,
  colorMap: Uint8Array,
  width: number,
  height: number
): void {
  ctx.fillStyle = '#000000';

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const currentColor = colorMap[idx];

      // Check right neighbor
      if (x < width - 1 && colorMap[idx + 1] !== currentColor) {
        ctx.fillRect(x + 1, y, CONFIG.outlineWidth, 1);
      }

      // Check bottom neighbor
      if (y < height - 1 && colorMap[idx + width] !== currentColor) {
        ctx.fillRect(x, y + 1, 1, CONFIG.outlineWidth);
      }
    }
  }
}

/**
 * Draw numbers in each region
 */
function drawNumbers(
  ctx: CanvasRenderingContext2D,
  regions: Region[],
  palette: Color[],
  width: number,
  height: number
): void {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000000';

  // Group regions by color and assign numbers
  const colorToNumber = new Map<number, number>();
  for (let i = 0; i < palette.length; i++) {
    colorToNumber.set(i, i + 1); // Numbers 1-N
  }

  // Sort regions by area (largest first) to prioritize visible numbers
  const sortedRegions = [...regions].sort((a, b) => b.area - a.area);

  // Track used positions to avoid overlapping numbers
  const usedPositions: { x: number; y: number; r: number }[] = [];

  for (const region of sortedRegions) {
    const number = colorToNumber.get(region.colorIndex);
    if (!number) continue;

    // Calculate font size based on region size
    const regionRadius = Math.sqrt(region.area / Math.PI);
    const fontSize = Math.min(CONFIG.fontSize, Math.max(CONFIG.minFontSize, regionRadius / 2));

    // Skip regions too small to display a readable number
    if (region.area < CONFIG.minRegionForNumber) continue;

    // Check if position overlaps with existing numbers
    const minDist = fontSize * 1.5;
    let canPlace = true;
    for (const used of usedPositions) {
      const dist = Math.sqrt(
        (region.centroidX - used.x) ** 2 + (region.centroidY - used.y) ** 2
      );
      if (dist < minDist + used.r) {
        canPlace = false;
        break;
      }
    }

    if (!canPlace) continue;

    // Ensure centroid is within bounds
    const x = Math.max(fontSize, Math.min(width - fontSize, region.centroidX));
    const y = Math.max(fontSize, Math.min(height - fontSize, region.centroidY));

    ctx.font = `bold ${Math.round(fontSize)}px Arial`;
    ctx.fillText(String(number), x, y);

    usedPositions.push({ x, y, r: fontSize / 2 });
  }
}

/**
 * Draw color legend at the bottom
 */
function drawLegend(
  ctx: CanvasRenderingContext2D,
  palette: Color[],
  width: number,
  imageHeight: number,
  legendHeight: number
): void {
  const startY = imageHeight;

  // Draw legend background
  ctx.fillStyle = '#F5F5F5';
  ctx.fillRect(0, startY, width, legendHeight);

  // Draw separator line
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, startY);
  ctx.lineTo(width, startY);
  ctx.stroke();

  // Calculate layout
  const colorsPerRow = Math.min(10, palette.length);
  const itemWidth = (width - CONFIG.legendPadding * 2) / colorsPerRow;
  const swatchSize = CONFIG.legendSwatchSize;

  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < palette.length; i++) {
    const row = Math.floor(i / colorsPerRow);
    const col = i % colorsPerRow;

    const x = CONFIG.legendPadding + col * itemWidth + itemWidth / 2;
    const y = startY + CONFIG.legendPadding + row * CONFIG.legendRowHeight + swatchSize / 2;

    // Draw color swatch
    const color = palette[i];
    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    ctx.fillRect(x - swatchSize / 2, y - swatchSize / 2, swatchSize, swatchSize);

    // Draw swatch border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - swatchSize / 2, y - swatchSize / 2, swatchSize, swatchSize);

    // Draw number below swatch
    ctx.fillStyle = '#000000';
    ctx.fillText(String(i + 1), x, y + swatchSize / 2 + 8);
  }
}

/**
 * Render the colored preview (how it looks when painted)
 */
function renderColoredPreview(
  colorMap: Uint8Array,
  width: number,
  height: number,
  palette: Color[]
): ReturnType<typeof createCanvas> {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create ImageData for direct pixel manipulation
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let i = 0; i < width * height; i++) {
    const colorIndex = colorMap[i];
    const color = palette[colorIndex];
    const pixelIdx = i * 4;

    data[pixelIdx] = color.r;
    data[pixelIdx + 1] = color.g;
    data[pixelIdx + 2] = color.b;
    data[pixelIdx + 3] = 255; // Alpha
  }

  ctx.putImageData(imageData, 0, 0);

  // Draw subtle outlines for definition
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 0.5;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const currentColor = colorMap[idx];

      // Check right neighbor
      if (x < width - 1 && colorMap[idx + 1] !== currentColor) {
        ctx.beginPath();
        ctx.moveTo(x + 1, y);
        ctx.lineTo(x + 1, y + 1);
        ctx.stroke();
      }

      // Check bottom neighbor
      if (y < height - 1 && colorMap[idx + width] !== currentColor) {
        ctx.beginPath();
        ctx.moveTo(x, y + 1);
        ctx.lineTo(x + 1, y + 1);
        ctx.stroke();
      }
    }
  }

  return canvas;
}

