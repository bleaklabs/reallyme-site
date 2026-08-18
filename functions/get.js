// functions/get.js — the /get invite redirect (Cloudflare Pages Function).
//
// A Pages Function rather than a _redirects line because /get must be COUNTED.
// A static _redirects rule short-circuits before any page loads, so no analytics
// beacon ever fires and the tap is invisible. This runs at the edge, logs, then
// redirects.

// ── CONFIG ───────────────────────────────────────────────────────────────────
// The destination flips twice: this site → TestFlight → App Store. Each flip is
// this ONE line. Never inline a destination below.
const DESTINATION = '/';

// 302 while DESTINATION still changes. Browsers and messaging-app link caches
// hold a 301 indefinitely, which would strand recipients on a stale target
// across the TestFlight and App Store flips. Becomes 301 only once the App Store
// destination is final.
const STATUS = 302;
// ─────────────────────────────────────────────────────────────────────────────

export function onRequest(context) {
  const { request } = context;

  // Tap counter, not analytics: timestamp plus the two headers the request
  // already carries. No cookies, no fingerprinting, no per-person identifier —
  // nothing beyond what a standard server access log records.
  console.log(JSON.stringify({
    event: 'invite_link_hit',
    path: '/get',
    at: new Date().toISOString(),
    referrer: request.headers.get('referer') || null,
    userAgent: request.headers.get('user-agent') || null,
  }));

  // Resolving against the origin lets DESTINATION be either a site-relative path
  // ('/') or an absolute external URL (TestFlight, App Store) with no code edit.
  const target = new URL(DESTINATION, new URL(request.url).origin).toString();
  return Response.redirect(target, STATUS);
}
