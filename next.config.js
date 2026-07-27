/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// next-pwa was removed (see task notes / commit message for details). Its v5
// API expects withPWA({...pwaOptions})(nextConfig) with options at the top
// level, but this file was calling it with the v2 signature (options nested
// under a `pwa:` key, no second call, i.e. `withPWA({ pageExtensions, pwa: {...} })`
// used directly as the config). A production build with the original code
// confirmed it emitted no public/sw.js and logged no `[PWA]` compile output —
// it was already inert. "Add to Home Screen" still works via the
// manifest.json + icons in app/layout.tsx; only offline caching is lost, and
// it wasn't functioning anyway.
//
// That same broken call also passed `pageExtensions: ['tsx']` — because the
// whole options object was swallowed as (unused) PWA options, this was
// ALSO never actually applied to the real Next config; Next silently kept
// using its default pageExtensions list the entire time. Restoring
// `pageExtensions: ['tsx']` for real (once the wrapper bug is fixed) breaks
// the production build on Next 13.4.19 (webpack loader errors:
// "pageExtensions.map is not a function" on several app/ routes), so it is
// intentionally left out here rather than "fixed" — that preserves the
// default extensions that were actually in effect all along and keeps the
// build green.
const nextConfig = withBundleAnalyzer({});

module.exports = nextConfig;
