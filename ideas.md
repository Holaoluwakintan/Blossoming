# BLOSSOMING fresh site direction

## Theme Name
Signal & Story

## Intro
A dark, polished personal studio for Olaoluwa Michael: editorial enough for books, precise enough for technology products, and warm enough for personal work.

## Direction
- **Movement:** restrained fade/slide reveals and soft transitions; no cursor-follow or shake effects.
- **Principles:** clarity, proof over hype, strong hierarchy, generous spacing, honest product statuses.
- **Color philosophy:** near-black ink, warm ivory, electric gold as the signature accent, muted blue for product depth.
- **Layout paradigm:** full-bleed hero, compact sticky nav, editorial sections, product shelf, and focused detail panels.
- **Signature elements:** uppercase mono labels, oversized serif headlines, gold rules, numbered cards, rounded media frames.
- **Interaction:** direct navigation, visible CTAs, keyboard-friendly controls, reduced-motion fallback.
- **Animation:** CSS-only reveal transitions with IntersectionObserver; no runtime animation dependency required for the first build.
- **Typography:** Inter/system sans for utility and body, Georgia/serif for expressive display moments, monospace for metadata.
- **Brand essence:** one personal studio, many things made carefully.
- **Brand voice:** calm, confident, specific and honest.
- **Wordmark:** BLOSSOMING with a simple gold four-petal mark rendered as an inline SVG.
- **Signature color:** #E8C868.

## Architecture
- Plain React 18 + Vite.
- Static client-side routes using the History API and a route-aware app shell.
- No Astro, Supabase, server routes or imported product application runtimes.
- Product cards link to the separate VoicePad, Bible Arena and Blossom Books repositories until public product URLs are available.
- Vercel serves the Vite `dist` directory using the root `vercel.json` configuration.
