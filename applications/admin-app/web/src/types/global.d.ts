/**
 * Global type declarations for the admin-app Next.js application.
 *
 * Next.js generates `next-env.d.ts` on the first `next dev` / `next build`
 * run. Until then the TypeScript Language Server does not resolve CSS
 * side-effect imports. This file bridges that gap.
 */

/** Allow CSS files to be imported as side-effects. */
declare module '*.css' {}
