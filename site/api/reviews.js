// Blossom public reviews. Storage: private Supabase Storage bucket (no table/DDL needed).
// Env: SUPABASE_URL, SUPABASE_SECRET_KEY, REVIEWS_ADMIN_KEY, REVIEWS_SALT
const crypto = require('crypto');
const SB = process.env.SUPABASE_URL, KEY = process.env.SUPABASE_SECRET_KEY;
const ADMIN = process.env.REVIEWS_ADMIN_KEY || '', SALT = process.env.REVIEWS_SALT || 'blossom';
const BUCKET = 'blossom-reviews', OBJ = 'index.json';
const APPS = ['blossom', 'ranti', 'voicepad', 'biblearena'];
const H = { apikey: KEY, Authorization: 'Bearer ' + KEY };
const BAD = /\b(fuck\w*|shit\w*|bitch\w*|cunt\w*|nigg\w*|dick(head)?s?|pussy|asshole|bastard|whore|slut|motherfucker|ashawo|olodo|mumu)\b/i;
const LINK = /(https?:\/\/|www\.)\S+/i;

async function load() {
  const r = await fetch(`${SB}/storage/v1/object/authenticated/${BUCKET}/${OBJ}?t=${Date.now()}`, { headers: { ...H, 'Cache-Control': 'no-cache' }, cache: 'no-store' });
  if (r.ok) return await r.json();
  const t = await r.text();
  if (r.status === 404 || /not.?found/i.test(t)) return [];
  throw new Error('load ' + r.status + ' ' + t.slice(0, 120));
}
async function save(list) {
  const r = await fetch(`${SB}/storage/v1/object/${BUCKET}/${OBJ}`, { method: 'POST', headers: { ...H, 'Content-Type': 'application/json', 'x-upsert': 'true', 'cache-control': 'no-cache' }, body: JSON.stringify(list) });
  if (!r.ok) throw new Error('save ' + r.status + ' ' + (await r.text()).slice(0, 120));
}
const clean = (s, max) => String(s == null ? '' : s).normalize('NFC').replace(/<[^>]*>/g, '').replace(/[<>]/g, '').replace(/[\u0000-\u0009\u000B-\u001F\u007F\u200B-\u200F\u202A-\u202E]/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, max);
const pub = r => ({ id: r.id, name: r.name, stars: r.stars, comment: r.comment, app: r.app, at: r.at });
function stats(list) {
  const s = { all: { count: 0, sum: 0 } }; APPS.forEach(a => (s[a] = { count: 0, sum: 0 }));
  list.forEach(r => { s.all.count++; s.all.sum += r.stars; if (s[r.app]) { s[r.app].count++; s[r.app].sum += r.stars; } });
  Object.values(s).forEach(v => { v.avg = v.count ? Math.round((v.sum / v.count) * 10) / 10 : 0; delete v.sum; });
  return s;
}
const isAdmin = k => { if (!ADMIN || !k) return false; const a = Buffer.from(String(k)), b = Buffer.from(ADMIN); return a.length === b.length && crypto.timingSafeEqual(a, b); };
const ipOf = req => String(req.headers['x-real-ip'] || (req.headers['x-forwarded-for'] || '').split(',')[0] || (req.socket && req.socket.remoteAddress) || '').trim();

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  if (!SB || !KEY) return res.status(503).json({ error: 'Reviews are not configured yet.' });
  try {
    const q = req.query || {};
    if (req.method === 'GET') {
      const list = await load();
      if (q.admin && isAdmin(req.headers['x-admin-key'] || q.key)) {
        return res.status(200).json({ reviews: list.slice().sort((a, b) => b.at - a.at).map(r => ({ ...pub(r), hidden: !!r.hidden })), stats: stats(list.filter(r => !r.hidden)) });
      }
      const vis = list.filter(r => !r.hidden).sort((a, b) => b.at - a.at);
      return res.status(200).json({ reviews: vis.slice(0, 300).map(pub), stats: stats(vis) });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    let b = req.body; if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } } b = b || {};
    if (b.action) {
      if (!isAdmin(req.headers['x-admin-key'] || b.key)) return res.status(403).json({ error: 'Wrong admin key' });
      const list = await load(); const i = list.findIndex(r => r.id === b.id);
      if (i < 0) return res.status(404).json({ error: 'Review not found' });
      if (b.action === 'hide') list[i].hidden = true; else if (b.action === 'show') list[i].hidden = false; else if (b.action === 'delete') list.splice(i, 1); else return res.status(400).json({ error: 'Unknown action' });
      await save(list); return res.status(200).json({ ok: true });
    }
    if (b.website) return res.status(200).json({ ok: true }); // honeypot: pretend success, store nothing
    const name = clean(b.name, 40), comment = clean(b.comment, 500), stars = parseInt(b.stars, 10), app = APPS.includes(b.app) ? b.app : 'blossom';
    if (!name) return res.status(400).json({ error: 'Please add your name.' });
    if (!(stars >= 1 && stars <= 5)) return res.status(400).json({ error: 'Choose a rating from 1 to 5 stars.' });
    if (comment.length < 2) return res.status(400).json({ error: 'Please write a short review.' });
    if (String(b.comment || '').length > 600 || String(b.name || '').length > 60) return res.status(400).json({ error: 'That review is too long.' });
    if (BAD.test(name) || BAD.test(comment)) return res.status(400).json({ error: 'Please keep it kind and family-friendly.' });
    if (LINK.test(comment) || LINK.test(name)) return res.status(400).json({ error: 'Links are not allowed in reviews.' });
    const ipHash = crypto.createHash('sha256').update(SALT + '|' + ipOf(req)).digest('hex').slice(0, 20);
    const list = await load(); const now = Date.now(), hour = now - 3600e3;
    if (list.filter(r => r.ip === ipHash && r.at > hour).length >= 3) return res.status(429).json({ error: 'You have posted 3 reviews this hour. Please try again later.' });
    if (list.filter(r => r.at > hour).length >= 60) return res.status(429).json({ error: 'Lots of reviews right now. Please try again in a little while.' });
    if (list.some(r => r.ip === ipHash && r.comment === comment)) return res.status(409).json({ error: 'You already posted this review.' });
    const rev = { id: crypto.randomBytes(6).toString('hex'), name, stars, comment, app, at: now, ip: ipHash, hidden: false };
    list.push(rev); if (list.length > 5000) list.splice(0, list.length - 5000);
    await save(list);
    const vis = list.filter(r => !r.hidden);
    return res.status(201).json({ ok: true, review: pub(rev), stats: stats(vis) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};
