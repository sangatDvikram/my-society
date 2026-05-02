/**
 * Global type declarations for the owner-app Next.js application.
 *
 * Next.js generates `next-env.d.ts` on the first `next dev` / `next build`
 * run. Until then (e.g. in a fresh clone) the TypeScript Language Server
 * does not know how to resolve CSS side-effect imports.
 *
 * This file bridges that gap and ensures IDE type-checks pass without
 * requiring a build artefact.
 */

/**
 * Allow CSS files to be imported as side-effects:
 *   import '@knadh/oat/oat.min.css'
 *   import './globals.css'
 *
 * Next.js webpack (and Turbopack) handle CSS bundling; TypeScript only
 * needs to know the import is syntactically valid, not what it emits.
 */
declare module '*.css' {}
