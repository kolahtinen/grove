// The web core: a server bound to 127.0.0.1, a small router, a JSON body reader that stops at
// 100 KB, strict schemas and plain errors (FR-001, FR-022, constitution 2.2, 2.4, 2.5).
import { createServer } from 'node:http';
import { setSecurityHeaders } from './headers.mjs';

export const MAX_BODY = 100 * 1024;
const MAX_DISCARD = 10 * 1024 * 1024;

export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function createRouter() {
  const routes = [];
  return {
    routes,
    add(route) {
      if (!['public', 'signed_in', 'agreed', 'owner'].includes(route.access)) {
        throw new Error(`route ${route.method} ${route.path} has no access rule`);
      }
      routes.push(route);
    },
    match(method, path) {
      const verb = method === 'HEAD' ? 'GET' : method;
      for (const route of routes) {
        if (route.method !== verb) continue;
        if (route.path.endsWith('*') ? path.startsWith(route.path.slice(0, -1)) : route.path === path) return route;
      }
      return null;
    },
    // method, path, access of every route, for the authorisation tests (FR-018).
    table() {
      return routes.map(({ method, path, access }) => ({ method, path, access }));
    },
  };
}

// Checks a parsed JSON body against a route's schema; unknown fields are refused.
export function checkSchema(body, schema) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'bad_request', 'The request was not understood.');
  for (const key of Object.keys(body)) {
    if (!Object.hasOwn(schema, key)) throw new HttpError(400, 'bad_request', 'The request was not understood.');
  }
  const out = {};
  for (const [key, rule] of Object.entries(schema)) {
    const value = body[key];
    if (value === undefined) {
      if (rule.optional) continue;
      throw new HttpError(400, rule.missingCode || 'bad_request', rule.missingMessage || 'The request was not understood.');
    }
    if (rule.type === 'string') {
      if (typeof value !== 'string' || value.length < (rule.min ?? 0) || value.length > rule.max) {
        throw new HttpError(400, 'bad_request', 'The request was not understood.');
      }
    } else if (rule.type === 'integer') {
      if (!Number.isSafeInteger(value) || value < (rule.min ?? 0) || value > (rule.max ?? Number.MAX_SAFE_INTEGER)) {
        throw new HttpError(400, 'bad_request', 'The request was not understood.');
      }
    } else if (rule.type === 'enum') {
      if (!rule.values.includes(value)) throw new HttpError(400, 'bad_request', 'The request was not understood.');
    } else if (rule.type === 'boolean') {
      if (typeof value !== 'boolean') throw new HttpError(400, 'bad_request', 'The request was not understood.');
    } else {
      throw new Error(`unknown schema type ${rule.type}`);
    }
    out[key] = value;
  }
  return out;
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_DISCARD) {
      req.destroy();
      break;
    }
    if (size <= MAX_BODY) chunks.push(chunk);
  }
  if (size > MAX_BODY) throw new HttpError(413, 'too_large', 'That is too large. The most grove accepts at once is 100 KB.');
  return Buffer.concat(chunks).toString('utf8');
}

export function clientIp(req) {
  const header = req.headers['cf-connecting-ip'];
  if (typeof header === 'string' && /^[0-9a-fA-F:.]{2,64}$/.test(header)) return header;
  return req.socket.remoteAddress || null;
}

export function parseCookies(header) {
  const out = {};
  for (const part of String(header || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

export function sendJson(res, status, body, headers = {}) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(body));
}

// Builds the request handler: security headers, body reading, guard, route, plain errors.
export function createHandler({ router, guard, csrf, log }) {
  return async function handle(req, res) {
    const started = Date.now();
    const url = new URL(req.url, 'http://grove.local');
    const path = url.pathname;
    const isApi = path.startsWith('/api/');
    setSecurityHeaders(res, { isApi });
    try {
      const route = router.match(req.method, path);
      if (!route) throw new HttpError(404, 'not_found', 'There is nothing here.');
      const ctx = { req, res, url, path, isApi, ip: clientIp(req), cookies: parseCookies(req.headers.cookie), body: null };
      await guard.attach(ctx);
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        const raw = await readBody(req);
        csrf(ctx);
        if (route.schema) {
          let parsed;
          try { parsed = JSON.parse(raw || 'null'); } catch { throw new HttpError(400, 'bad_request', 'The request was not understood.'); }
          ctx.body = checkSchema(parsed, route.schema);
        }
      }
      const blocked = guard.check(route.access, ctx);
      if (blocked) return blocked();
      await route.handler(ctx);
    } catch (error) {
      if (res.headersSent) { res.end(); return; }
      if (error instanceof HttpError) {
        sendJson(res, error.status, { error: error.code, message: error.message }, error.status === 413 ? { connection: 'close' } : {});
      } else {
        log?.('error', 'unhandled error', { method: req.method, path, code: error?.code || error?.name || 'Error' });
        sendJson(res, 500, { error: 'server_error', message: 'Something went wrong. Please try again.' });
      }
    } finally {
      log?.('info', 'request', { method: req.method, path, status: res.statusCode, ms: Date.now() - started });
    }
  };
}

export function listen(handler, port) {
  const server = createServer(handler);
  server.requestTimeout = 30000;
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}
