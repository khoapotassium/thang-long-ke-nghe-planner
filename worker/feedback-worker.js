/**
 * Cloudflare Worker — Feedback endpoint
 * Thăng Long Kẻ Nghệ Planner
 *
 * Environment variables (set in CF dashboard → Workers → Settings → Variables):
 *   FEEDBACK_KV   : KV namespace binding (name: FEEDBACK_KV)
 *   ADMIN_TOKEN   : Bearer token for GET /feedback (tạo chuỗi ngẫu nhiên ≥32 ký tự)
 *   ALLOWED_ORIGIN: e.g. https://yourname.github.io  (không có dấu / cuối)
 *
 * KV namespace: tạo namespace tên FEEDBACK_KV, bind vào worker với variable name FEEDBACK_KV
 * Góp ý tự xóa lúc 31/12/2026 23:59:59 giờ Việt Nam (Unix 1798736399)
 */

const EXPIRY_UNIX = 1798736399; // 31/12/2026 23:59:59 giờ Việt Nam (UTC+7)
const MAX_BODY    = 4096;        // 4 KB
const RATE_WINDOW = 60;          // giây
const RATE_LIMIT  = 30;          // lượt/phút (toàn trang)

// ── Mask phone / email ───────────────────────────────────────────────────────
function maskText(text) {
  // Giống hàm mask() phía web: che email và số điện thoại Việt Nam
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]')
    .replace(/(\+?84|0)[\s.-]?\d(?:[\s.-]?\d){7,9}/g, '[sđt]');
}

// ── Rate limiter (KV-based, best-effort) ─────────────────────────────────────
async function checkRate(env) {
  const key = 'rate:' + Math.floor(Date.now() / 1000 / RATE_WINDOW);
  let count = 0;
  try {
    const v = await env.FEEDBACK_KV.get(key);
    count = v ? parseInt(v, 10) : 0;
    if (count >= RATE_LIMIT) return false;
    await env.FEEDBACK_KV.put(key, String(count + 1), { expirationTtl: RATE_WINDOW * 2 });
  } catch (_) { /* lỗi KV: cho qua */ }
  return true;
}

// ── CORS headers ─────────────────────────────────────────────────────────────
function corsHeaders(origin, allowedOrigin) {
  const allow = origin === allowedOrigin ? origin : allowedOrigin;
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data, status, extraHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

// ── Main handler ─────────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowedOrigin = (env.ALLOWED_ORIGIN || '').trim();
    const cors = corsHeaders(origin, allowedOrigin);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);

    // ── POST /feedback ────────────────────────────────────────────────────────
    if (request.method === 'POST' && url.pathname === '/feedback') {
      // Kiểm tra origin
      if (allowedOrigin && origin !== allowedOrigin) {
        return json({ error: 'forbidden' }, 403, cors);
      }

      // Rate limit
      const ok = await checkRate(env);
      if (!ok) {
        return json({ error: 'rate_limit', message: 'Quá nhiều yêu cầu, thử lại sau 1 phút.' }, 429, cors);
      }

      // Giới hạn kích thước body
      const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
      if (contentLength > MAX_BODY) {
        return json({ error: 'too_large' }, 413, cors);
      }

      let body;
      try {
        const text = await request.text();
        if (text.length > MAX_BODY) return json({ error: 'too_large' }, 413, cors);
        body = JSON.parse(text);
      } catch (_) {
        return json({ error: 'invalid_json' }, 400, cors);
      }

      // Honeypot: bot điền trường ẩn "website" → giả vờ thành công, không lưu
      if (body.website) return json({ ok: true }, 200, cors);

      // Trường web gửi lên: { kind, eventId, reason, text, lang }
      const kind    = body.kind === 'event' ? 'event' : 'site';
      const eventId = String(body.eventId || '').replace(/[^a-z0-9-]/gi, '').slice(0, 120);
      const reason  = String(body.reason || '').replace(/[^a-zA-Z]/g, '').slice(0, 30);
      const text    = maskText(String(body.text || '').trim().slice(0, 300));
      const lang    = body.lang === 'en' ? 'en' : 'vi';

      if (kind === 'event' && (!eventId || !reason)) return json({ error: 'missing_fields' }, 400, cors);
      if (kind === 'site' && text.length < 3)        return json({ error: 'missing_text' }, 400, cors);

      const ts   = Date.now();
      const rand = Math.random().toString(36).slice(2, 8);
      const key  = `fb:${ts}:${rand}`;
      // KHÔNG lưu IP, User-Agent hay bất kỳ header nào
      const record = { ts, kind, eventId, reason, text, lang };

      try {
        await env.FEEDBACK_KV.put(key, JSON.stringify(record), {
          expiration: EXPIRY_UNIX,
        });
      } catch (e) {
        return json({ error: 'storage_error', detail: e.message }, 500, cors);
      }

      return json({ ok: true }, 200, cors);
    }

    // ── GET /feedback (admin) ─────────────────────────────────────────────────
    if (request.method === 'GET' && url.pathname === '/feedback') {
      const auth = request.headers.get('Authorization') || '';
      const adminToken = (env.ADMIN_TOKEN || '').trim();
      if (!adminToken || auth !== `Bearer ${adminToken}`) {
        return json({ error: 'unauthorized' }, 401, cors);
      }

      // Liệt kê tối đa 1000 mục mới nhất
      const list = await env.FEEDBACK_KV.list({ prefix: 'fb:' });
      const items = [];
      for (const { name } of list.keys) {
        const val = await env.FEEDBACK_KV.get(name);
        if (val) {
          try { items.push({ key: name, ...JSON.parse(val) }); } catch (_) {}
        }
      }
      // Sắp xếp mới nhất trước
      items.sort((a, b) => b.ts - a.ts);

      return json({ count: items.length, items }, 200, cors);
    }

    return json({ error: 'not_found' }, 404, cors);
  },
};
