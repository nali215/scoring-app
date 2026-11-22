// Next.js may expose an internal localhost URL behind its request adapter.
// The HTTP Host header is the browser-facing authority, and cannot be set by cross-site JavaScript.
export function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return true
  try { return new URL(origin).host === (request.headers.get('host') || new URL(request.url).host) }
  catch { return false }
}
