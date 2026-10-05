# Blossom brand site — v2 "dark cinematic" redesign (standalone)

This folder is a **separate, standalone redesign** of the Blossom brand page. It is NOT a change to the
existing Blossoming site in this repo: nothing outside `brand-v2/` was touched on this branch.

It is what is live at https://blossomapp-ng.vercel.app (its own Vercel project).

Static site: plain HTML, CSS and a small vanilla JavaScript file (about 9 KB, no libraries).
No build step, no npm install.

## What's inside
- site/index.html, site/styles.css, site/script.js
- site/assets/video/hero.mp4 (H.264, 720p, 8 s seamless loop, about 1 MB) and hero.webm (VP9).
  It loads after the page and never plays for visitors with reduced motion or data saver on;
  they see the poster image (assets/img/hero-*.webp).
- site/assets/img/*.webp: the generated Build, Learn, studio and hero images (two sizes each).
- site/assets/*-desktop.webp / *-phone.webp: real VoicePad and Bible Arena screenshots.

## Deploy
Create a Vercel project from this repo and set its Root Directory to `brand-v2/site`
(Framework preset: Other, no build command). Vercel serves it as-is.

## Quick edits
- WhatsApp number: site/script.js, WHATSAPP_NUMBER (digits only, e.g. 2348148034092).
  Also search-replace 2348148034092 in index.html so it works without JavaScript.
- Learn community link: site/script.js, LEARN_COMMUNITY_URL. While it is empty, "Get early access"
  opens a WhatsApp chat saying "Hi Blossom, I want to learn."
- Prices: none on the site yet. Every service has a "Get a quote" button to WhatsApp.
- Daily faith writing channel: links marked data-channel in index.html.

## Check
node --test brand-v2/test/site.test.mjs
