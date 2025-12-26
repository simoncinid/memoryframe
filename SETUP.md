# MemoryFrame Setup Guide

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## What to Customize First

### 1. Domain and Brand

Update the domain and brand name in these locations:

- **Environment variables**: Create `.env.local` from `.env.example`:
  ```
  NEXT_PUBLIC_PRODUCT_NAME=YourBrandName
  NEXT_PUBLIC_SITE_URL=https://yourdomain.com
  ```

- **Copy file**: `/src/content/copy.ts`
  - Update `brand.name` and `brand.domain`
  - Modify all marketing copy as needed

### 2. Tip/Checkout Integration

Set up your payment link:

```
NEXT_PUBLIC_TIP_CHECKOUT_URL=https://your-payment-provider.com/checkout
```

Popular options:
- Stripe Payment Links
- Buy Me a Coffee
- Ko-fi
- PayPal.me

The checkout URL receives `?amount=X` parameter with the selected tip amount.

### 3. Connect Real AI Generation

The mock generation is in `/src/app/api/generate/route.ts`.

Look for `// TODO:` comments showing where to integrate:

```typescript
// TODO: Replace mock with actual image generation provider
// Example providers:
// - Replicate (replicate.com) - Easy API for various models
// - OpenAI DALL-E
// - Stability AI
// - Midjourney (via API)
```

Basic Replicate integration example:

```typescript
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const output = await replicate.run("model-owner/model-name", {
  input: {
    prompt: body.prompt,
    image: body.personA,
    // ... other params
  },
});
```

### 4. Persistent Storage

Currently images are served as SVG placeholders. For production:

1. Choose a storage provider:
   - AWS S3
   - Cloudflare R2
   - Vercel Blob
   - Supabase Storage

2. Update `/src/app/api/generate/route.ts` to:
   - Upload generated images to storage
   - Return permanent URLs

### 5. Rate Limiting for Production

Current rate limiting is in-memory (works for single server).

For production, replace with Redis:

```typescript
// /src/lib/rate-limit.ts
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});
```

### 6. Analytics

Connect your analytics provider in `/src/lib/analytics.ts`:

```typescript
// PostHog example
import posthog from "posthog-js";

export function trackEvent(event: string, properties?: object) {
  posthog.capture(event, properties);
}
```

Events tracked:
- `generate_started`
- `generate_success`
- `generate_error`
- `tip_modal_open`
- `tip_checkout_click`
- `download_click`
- `style_selected`
- `prompt_copied`
- `page_view`

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_PRODUCT_NAME` | Brand name displayed in UI | No (default: MemoryFrame) |
| `NEXT_PUBLIC_SITE_URL` | Production URL for SEO | Yes for production |
| `NEXT_PUBLIC_TIP_CHECKOUT_URL` | Payment/tip checkout link | Yes |
| `STORAGE_DELETE_HOURS_DEFAULT` | Hours before auto-delete | No (default: 24) |

## File Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── generate/      # Main generation endpoint
│   │   └── placeholder/   # Mock image generator
│   ├── create/            # Tool page
│   ├── styles/            # Styles listing page
│   ├── prompts/           # Prompts listing page
│   ├── ai-family-portrait/    # SEO page
│   ├── combine-two-photos/    # SEO page
│   ├── add-person-to-photo/   # SEO page
│   ├── family-portrait.../    # SEO page
│   ├── photo-background.../   # SEO page
│   ├── privacy/           # Legal page
│   ├── terms/             # Legal page
│   ├── contact/           # Contact page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── sitemap.ts         # Dynamic sitemap
│   └── robots.ts          # Robots.txt
├── components/            # Reusable UI components
│   ├── FAQ.tsx
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   ├── PromptChips.tsx
│   ├── Stepper.tsx
│   ├── StyleCard.tsx
│   ├── TipModal.tsx
│   ├── Toast.tsx
│   └── UploadDropzone.tsx
├── content/
│   └── copy.ts            # All text content (edit here!)
└── lib/
    ├── analytics.ts       # Analytics utility
    ├── rate-limit.ts      # Rate limiting
    └── utils.ts           # Shared utilities
```

## Production Checklist

- [ ] Update all environment variables
- [ ] Connect real image generation API
- [ ] Set up persistent storage
- [ ] Configure Redis for rate limiting
- [ ] Add analytics provider
- [ ] Create OG image (`/public/og-image.png`)
- [ ] Test all pages on mobile
- [ ] Test tip checkout flow
- [ ] Verify sitemap.xml accessibility
- [ ] Check robots.txt
- [ ] Set up error monitoring (Sentry, etc.)

## Support

For questions about customization, check the code comments marked with `// TODO:` throughout the codebase.

