import type { NextConfig } from 'next'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createNextConfig } = require('@society/shared-nextjs-config')

/**
 * Super Admin App — Next.js configuration.
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
  // ── Super-admin-app-specific overrides ────────────────────────────────────
  // Super Admin Portal runs on port 3002 in dev (next dev -p 3002).
})

export default config
