/**
 * Isomorphic (Edge + Node) admin session token using an HMAC-SHA256 signature.
 * Works in both Next.js middleware (Edge runtime) and route handlers (Node runtime)
 * because it relies only on the Web Crypto API (globalThis.crypto.subtle).
 *
 * Token format:  base64url(payload) + "." + base64url(HMAC(payload))
 * payload:       "admin.<expiryEpochMs>"
 */

const SECRET =
  process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || 'dev-secret-change-me'

const enc = new TextEncoder()

function toB64url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromB64url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  return atob(b64)
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  return toB64url(new Uint8Array(sig))
}

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function createAdminToken(ttlMs: number = DEFAULT_TTL_MS): Promise<string> {
  const payload = `admin.${Date.now() + ttlMs}`
  const sig = await sign(payload)
  return `${toB64url(enc.encode(payload))}.${sig}`
}

export async function verifyAdminToken(token?: string | null): Promise<boolean> {
  if (!token) return false
  const [b64Payload, sig] = token.split('.')
  if (!b64Payload || !sig) return false

  let payload: string
  try {
    payload = fromB64url(b64Payload)
  } catch {
    return false
  }

  const expected = await sign(payload)
  if (sig !== expected) return false

  const [prefix, expStr] = payload.split('.')
  if (prefix !== 'admin') return false
  const exp = Number(expStr)
  return Number.isFinite(exp) && Date.now() < exp
}
