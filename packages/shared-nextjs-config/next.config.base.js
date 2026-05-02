// =============================================================================
// @society/shared-nextjs-config — Base Next.js configuration factory
//
// Extended by every web application in the monorepo:
//   applications/owner-app/web/next.config.ts
//   applications/admin-app/web/next.config.ts
//   applications/super-admin-app/web/next.config.ts
//
// Usage in a consuming app (next.config.ts):
//   import { createNextConfig } from '@society/shared-nextjs-config'
//   export default createNextConfig(__dirname, { /* app-specific overrides */ })
//
// The factory:
//   1. Merges shared settings (transpilePackages, headers, images, …)
//   2. Adds a webpack plugin that copies @society/shared-ui-assets/assets →
//      <appDir>/public/ so favicons, manifests, and icons are served at the
//      root URL without any build step in individual apps.
// =============================================================================

const path = require('path')
const { cpSync, mkdirSync } = require('fs')

/**
 * Webpack plugin that copies shared-ui-assets into the app's public/ directory.
 * Uses Node.js built-in `fs.cpSync` — no external copy-webpack-plugin needed.
 * Runs once per non-server compilation (client bundle) to avoid duplication.
 */
class SharedUiAssetsCopyPlugin {
  constructor(appDir) {
    this.appDir = appDir
    this.copied = false
  }

  apply(compiler) {
    compiler.hooks.beforeRun.tap('SharedUiAssetsCopyPlugin', () => {
      if (this.copied) return
      try {
        const { assetsPath } = require('@society/shared-ui-assets')
        const publicDir = path.join(this.appDir, 'public')
        mkdirSync(publicDir, { recursive: true })
        cpSync(assetsPath, publicDir, { recursive: true, force: true })
        console.log('[shared-nextjs-config] ✅ Shared UI assets copied → public/')
        this.copied = true
      } catch (err) {
        console.warn('[shared-nextjs-config] ⚠️  Could not copy shared-ui-assets:', err.message)
      }
    })

    // Also hook into watchRun so assets stay fresh during `next dev`
    compiler.hooks.watchRun.tap('SharedUiAssetsCopyPlugin', () => {
      if (this.copied) return
      try {
        const { assetsPath } = require('@society/shared-ui-assets')
        const publicDir = path.join(this.appDir, 'public')
        mkdirSync(publicDir, { recursive: true })
        cpSync(assetsPath, publicDir, { recursive: true, force: true })
        console.log('[shared-nextjs-config] ✅ Shared UI assets copied → public/ (watch)')
        this.copied = true
      } catch (err) {
        console.warn('[shared-nextjs-config] ⚠️  Could not copy shared-ui-assets:', err.message)
      }
    })
  }
}

/**
 * copySharedAssets(appDir)
 *
 * Synchronously copies @society/shared-ui-assets/assets → <appDir>/public/.
 * Called at config-evaluation time so assets are in place before the first
 * page render — works for both webpack and Turbopack bundlers.
 *
 * @param {string} appDir - Absolute path to the consuming app root directory.
 */
function copySharedAssets(appDir) {
  try {
    const { assetsPath } = require('@society/shared-ui-assets')
    const publicDir = path.join(appDir, 'public')
    mkdirSync(publicDir, { recursive: true })
    cpSync(assetsPath, publicDir, { recursive: true, force: true })
    console.log('[shared-nextjs-config] ✅ Shared UI assets copied → public/')
  } catch (err) {
    console.warn('[shared-nextjs-config] ⚠️  Could not copy shared-ui-assets:', err.message)
  }
}

/**
 * createNextConfig(appDir, overrides?)
 *
 * @param {string} appDir   - Absolute path to the consuming app directory.
 *                            Pass `__dirname` from the app's next.config.ts.
 * @param {object} overrides - App-specific Next.js config keys to merge in.
 * @returns {import('next').NextConfig}
 */
function createNextConfig(appDir, overrides = {}) {
  // Copy shared assets eagerly — runs when next.config.ts is evaluated,
  // before any compilation starts. This guarantees assets are in public/
  // regardless of whether the bundler is webpack or Turbopack.
  copySharedAssets(appDir)

  return {
    // ── Workspace package transpilation ─────────────────────────────────────
    // All @society/* packages ship TypeScript source and are consumed via npm
    // workspace symlinks. Next.js SWC must transpile them before bundling.
    transpilePackages: [
      '@society/shared-types',
      '@society/shared-validators',
      '@society/shared-ui-tokens',
      '@society/shared-ui-components',
      '@society/shared-i18n',
      '@society/shared-ui-assets',
      '@society/shared-nextjs-config',
      // Merge any app-specific transpilePackages
      ...(overrides.transpilePackages ?? []),
    ],

    // ── Hardening ───────────────────────────────────────────────────────────
    poweredByHeader: false, // Remove 'X-Powered-By: Next.js' response header

    // ── Image optimisation ──────────────────────────────────────────────────
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**.cloudfront.net', // AWS CloudFront CDN for media-service
        },
      ],
      formats: ['image/avif', 'image/webp'],
      ...(overrides.images ?? {}),
    },

    // ── Security headers (applied to every route) ───────────────────────────
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Frame-Options',       value: 'DENY' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
            { key: 'X-XSS-Protection',       value: '1; mode=block' },
            { key: 'Permissions-Policy',     value: 'camera=(), microphone=(), geolocation=()' },
          ],
        },
      ]
    },

    // ── Webpack — copy @society/shared-ui-assets → public/ ──────────────────
    webpack(config, options) {
      // Only attach the plugin on the client-side bundle to run exactly once
      if (!options.isServer) {
        config.plugins.push(new SharedUiAssetsCopyPlugin(appDir))
      }

      // Allow app overrides to further customise webpack
      if (typeof overrides.webpack === 'function') {
        return overrides.webpack(config, options)
      }

      return config
    },

    // ── Spread remaining app-specific overrides (excluding merged keys) ──────
    ...Object.fromEntries(
      Object.entries(overrides).filter(
        ([k]) => !['transpilePackages', 'images', 'webpack'].includes(k),
      ),
    ),
  }
}

module.exports = { createNextConfig }
