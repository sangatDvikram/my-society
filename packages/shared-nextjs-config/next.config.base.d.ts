import type { NextConfig } from 'next'

/**
 * createNextConfig(appDir, overrides?)
 *
 * Factory function that returns a fully-configured Next.js config for any
 * Society web application. Pass `__dirname` (the app directory) so the
 * factory can set up the webpack plugin that copies shared-ui-assets
 * (favicons, icons, manifests) into the app's `public/` directory.
 *
 * Includes:
 *  - `transpilePackages` for every `@society/*` workspace package
 *  - Security response headers (X-Frame-Options, X-Content-Type-Options, …)
 *  - Image optimisation settings (CloudFront remote patterns, avif/webp)
 *  - `poweredByHeader: false`
 *  - webpack plugin: copies `@society/shared-ui-assets/assets → public/`
 *
 * Usage:
 * ```ts
 * // applications/owner-app/web/next.config.ts
 * import type { NextConfig } from 'next'
 * const { createNextConfig } = require('@society/shared-nextjs-config')
 *
 * const config: NextConfig = createNextConfig(__dirname, {
 *   // app-specific overrides
 * })
 * export default config
 * ```
 */
export declare function createNextConfig(
  appDir: string,
  overrides?: Partial<NextConfig>,
): NextConfig
