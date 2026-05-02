import type { NextConfig } from 'next'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createNextConfig } = require('@society/shared-nextjs-config')

/**
 * Admin App — Next.js configuration.
 *
 * Delegates to the shared factory which wires up:
 *   - transpilePackages for all @society/* workspace deps
 *   - Security headers (X-Frame-Options, CSP-related, …)
 *   - Image optimisation (CloudFront, avif/webp)
 *   - webpack plugin: copies @society/shared-ui-assets → public/
 *
 * Pass __dirname so the webpack plugin resolves this app's public/ directory.
 */
const config: NextConfig = createNextConfig(__dirname, {
  // ── Admin-app-specific overrides ──────────────────────────────────────────
  // Admin Portal runs on port 3001 in dev (next dev -p 3001).
})

export default config
