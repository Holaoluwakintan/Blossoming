import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.join(here, '..', 'site');
const html = fs.readFileSync(path.join(site, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(site, 'styles.css'), 'utf8');
const js = fs.readFileSync(path.join(site, 'script.js'), 'utf8');

test('title, viewport and language', () => {
  assert.match(html, /<title>Blossom[^<]+<\/title>/);
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1/);
  assert.match(html, /<html lang="en">/);
});

test('core sections and copy are present', () => {
  for (const id of ['top', 'build', 'work', 'learn', 'about']) assert.ok(html.includes(`id="${id}"`), id);
  for (const s of ['Built to blossom.', 'Build with Blossom.', 'Learn with Blossom.', 'Websites', 'Portfolios', 'Apps', 'VoicePad', 'Bible Arena', 'Get a quote', 'Let’s talk'])
    assert.ok(html.includes(s), s);
});

test('no prices anywhere (not decided yet)', () => {
  assert.ok(!/₦|NGN|naira|data-price/i.test(html), 'a price is still on the page');
});

test('hero video is muted, looping, inline, lazy, with a poster image and both formats', () => {
  const v = html.match(/<video[^>]*>/)[0];
  for (const a of ['muted', 'loop', 'playsinline', 'preload="none"']) assert.ok(v.includes(a), a);
  assert.ok(html.includes('data-src="assets/video/hero.mp4"'));
  assert.ok(html.includes('data-src="assets/video/hero.webm"'));
  assert.ok(html.includes('class="hero-poster"'));
  const mp4 = fs.statSync(path.join(site, 'assets/video/hero.mp4')).size;
  assert.ok(mp4 < 3 * 1024 * 1024, `hero.mp4 is ${mp4} bytes`);
  assert.match(js, /prefers-reduced-motion/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});

test('generated imagery is WebP and under 250 KB each', () => {
  const dir = path.join(site, 'assets/img');
  const files = fs.readdirSync(dir);
  for (const n of ['build', 'learn', 'studio', 'hero']) assert.ok(files.some(f => f.startsWith(n + '-')), n);
  for (const f of files) {
    assert.ok(f.endsWith('.webp'), f);
    assert.ok(fs.statSync(path.join(dir, f)).size < 250 * 1024, f);
  }
  assert.ok((html.match(/srcset=/g) || []).length >= 5, 'responsive images');
});

test('primary links point at the real destinations', () => {
  assert.ok(html.includes('href="https://voicepadapp.vercel.app"'));
  assert.ok(html.includes('href="https://bible-arena.onrender.com"'));
  const wa = [...html.matchAll(/href="https:\/\/wa\.me\/(\d+)/g)].map(m => m[1]);
  assert.ok(wa.length >= 7, 'WhatsApp CTAs');
  assert.equal(new Set(wa).size, 1, 'one WhatsApp number everywhere');
  assert.equal(wa[0], '2348148034092');
});

test('faith channel and learn placeholder are wired as before', () => {
  assert.ok(html.includes('href="https://whatsapp.com/channel/0029VaEtpDnJP21DVpo1Mi2x"'));
  assert.match(html, /data-channel[^>]*>Read the daily devotional/);
  assert.match(html, />Daily faith writing</);
  assert.match(html, /data-learn[^>]*wa\.me\/\d+\?text=Hi%20Blossom%2C%20I%20want%20to%20learn/);
  assert.match(js, /var WHATSAPP_NUMBER = '2348148034092'/);
  assert.match(js, /var LEARN_COMMUNITY_URL = '';/);
});

test('every local asset referenced exists', () => {
  const refs = [...html.matchAll(/(?:src|href|data-src)="([^"]+)"/g)].map(m => m[1]).filter(r => !r.startsWith('#') && !r.includes(':'));
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) refs.push(...m[1].split(',').map(s => s.trim().split(' ')[0]));
  refs.push(...[...css.matchAll(/url\(([^)"']+)\)/g)].map(m => m[1]));
  assert.ok(refs.length > 15);
  for (const r of refs) assert.ok(fs.existsSync(path.join(site, r)), `missing ${r}`);
});

test('no external scripts, template leftovers or emoji; JS stays small', () => {
  assert.ok(!/<script[^>]+src="https?:/.test(html));
  assert.ok(!/__WA__|TODO|lorem ipsum|undefined/i.test(html));
  assert.ok(!/[\u{1F300}-\u{1FAFF}]/u.test(html));
  assert.ok(js.length < 16000, `script.js is ${js.length} bytes`);
});
