# Blossom site v2 (live at https://blossomapp-ng.vercel.app since Oct 16 2026)

This folder is the exact source of the live Blossom brand site (premium redesign, v2).
It is a static site: index.html + styles.css + main.js, assets/ (fonts, app icons, in-app screenshots, short videos),
api/reviews.js (Vercel serverless function for the reviews section) and admin/reviews.html.

Deploy on Vercel: set the project's Root Directory to `site`.
Environment variables used by api/reviews.js (values are NOT in this repo): SUPABASE_URL, SUPABASE_SECRET_KEY, REVIEWS_ADMIN_KEY, REVIEWS_SALT.

The React/Vite app at the repo root (main branch) is untouched.
