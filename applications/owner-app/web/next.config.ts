import type { NextConfig } from 'next'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createNextConfig } = require('@society/shared-nextjs-config')

/**
 * Owner App — Next.js configuration.
 *
 * Delegates to the shared factory which wires up:
 *   - transpilePackages for all @society/* workspace deps
 *   - Security headers (X-Frame-Options, CSP-related, …)
 *   - Image optimisation (CloudFront, avif/webp)
 *   - webpack plugin: copies @society/shared-ui-assets → public/
 *     so favicons, apple-touch-icons, and the PWA manifest are served
 *     at the root URL without any manual copy step.
 *
 * Pass __dirname so the webpack plugin knows where this app's public/
 * directory lives in the monorepo.
 */
const config: NextConfig = createNextConfig(__dirname, {
  // ── Owner-app-specific overrides ──────────────────────────────────────────
  // Owner Dashboard runs on port 3000 (Next.js default).
  // Add owner-app-specific Next.js settings below as needed.
})

export default config
