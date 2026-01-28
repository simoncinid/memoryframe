export interface GenerateRequest {
  personA: Buffer;
  personB: Buffer;
  background: Buffer;
  style: string;
  scene: string;
  size?: string;
  quality?: string;
  output_format?: string;
  output_compression?: number;
  delete_policy?: 'immediate' | '24h';
  client_request_id?: string;
}

export interface GenerateResponse {
  request_id: string;
  job_id: string;
  image_base64: string;
  mime_type: string;
  generation_time_ms: number;
  used_free_quota: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
  retry_after_seconds?: number;
}

export interface HealthResponse {
  status: 'ok';
  uptime: number;
  timestamp: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining?: number;
  limit: number;
  retry_after_seconds?: number;
}

export interface FileInfo {
  buffer: Buffer;
  filename: string;
  mimetype: string;
}

export type ImageStyle = 
  | 'classic'
  | 'painterly' 
  | 'cinematic' 
  | 'vintage'
  | 'blackwhite'
  | 'watercolor'
  | 'pop-art'
  | 'renaissance'
  | 'photorealistic';

export const VALID_STYLES: ImageStyle[] = [
  'classic',
  'painterly',
  'cinematic',
  'vintage',
  'blackwhite',
  'watercolor',
  'pop-art',
  'renaissance',
  'photorealistic',
];

export const VALID_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const VALID_SIZES = ['1024x1024', '1536x1024', '1024x1536', 'auto'];

export const VALID_QUALITIES = ['low', 'medium', 'high'];

export const VALID_OUTPUT_FORMATS = ['png', 'jpeg', 'webp'];

