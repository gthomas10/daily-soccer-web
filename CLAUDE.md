# daily-soccer-web - AI Agent Context

## Overview

Track B of DailySoccerReport: Next.js product website for an AI-generated daily soccer podcast. Deployed to Vercel. Serves free episode playback, show notes, and subscriber content.

## Tech Stack

- **Next.js 16** with App Router
- **TypeScript**
- **Tailwind CSS**
- **Vercel** — deployment with ISR (Incremental Static Regeneration)
- **Cloudflare R2** — audio and metadata storage (read-only from website)
- **Turso** — episode database (libSQL via `@libsql/client`)

## Data Contract

The pipeline (Track A) produces episodes as:
- Audio MP3 on R2: `episodes/{date}/audio.mp3`
- Metadata JSON on R2: `episodes/{date}/metadata.json`
- Episode row in Turso `episodes` table

Metadata JSON conforms to the schema at `../daily-soccer-pipeline/schemas/episode-metadata.json`. Key fields: `episode_id`, `title`, `description`, `audio_url`, `duration_seconds`, `chapters[]`, `presenters`, `leagues_covered`, `fpl_segment`, `show_notes_html`.

## Planned Features (Epic 5)

- Homepage with immediate episode playback (no sign-up required)
- Custom HTML5 audio player with chapter navigation (no third-party player dependency)
- Show notes with chapter timestamps
- Presenter profiles page
- Social sharing metadata and SEO (Open Graph tags, structured data, sitemap)
- Responsive layouts: Player-Dominant on mobile (<1024px), Split Sidebar on desktop (>=1024px)

## Code Conventions

- App Router: server components by default, client components only when needed (audio player)
- ISR for content updates — revalidation triggered by pipeline webhook (`POST /api/revalidate`)
- Episode data fetched from R2 and validated against JSON schema
- WCAG 2.1 Level A accessibility: semantic HTML, alt text, keyboard navigation, ARIA labels
- Supported browsers: latest 2 versions of Chrome, Safari, Firefox, Edge (desktop + mobile)
- Responsive: 320px to 2560px viewports

## UX Design Tokens

- Player Surface: `#1A1A2E`
- Primary Accent: `#10B981`
- Typeface: Inter

## Scripts

- `pnpm dev` — local development
- `pnpm build` — production build
- `pnpm lint` — eslint
- `pnpm test` — vitest

## Current Status (as of 2026-03-05)

Project initialized and deployed to Vercel. No features implemented yet — Epic 5 is next.
