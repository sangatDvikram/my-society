/**
 * Owner App — Root page (Server Component)
 *
 * This page is intentionally a React Server Component (no 'use client').
 * The ClickCounter is a Client Component (it owns the click state) and is
 * imported below — Next.js handles the RSC/Client boundary automatically.
 *
 * Oat UI styling is fully active here:
 *   • layout.tsx imports @knadh/oat/oat.min.css globally before globals.css
 *   • All semantic HTML elements on this page (button, article, mark, …)
 *     are styled automatically — no Oat UI class names are required
 *   • Tailwind utility classes add layout, spacing, and colour overrides
 *
 * @see PRD §10.3.1 — Web Styling: Tailwind CSS + Oat UI
 */

import { ClickCounter } from '@society/shared-ui-components'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-surface p-8">

      {/* ── Brand header ────────────────────────────────────────────────── */}
      <header className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600">
          <span className="text-2xl font-bold text-white">S</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">My Society</h1>
        <p className="text-sm text-slate-500">Owner Portal — powered by Oat UI + Tailwind CSS</p>
      </header>

      {/* ── Oat UI demo: ClickCounter ────────────────────────────────────── */}
      {/*
        ClickCounter uses:
          <article>  — Oat UI card
          <button>   — Oat UI button (styled automatically; no classes needed)
          <mark>     — Oat UI badge
          <progress> — Oat UI progress bar
          <div role="alert"> — Oat UI alert box
        All styled by @knadh/oat/oat.min.css imported in layout.tsx.
      */}
      <ClickCounter />

      {/* ── Tech stack callout ───────────────────────────────────────────── */}
      <details className="w-full max-w-sm">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">
          ℹ️ How Oat UI works here
        </summary>
        <div className="mt-3 space-y-2 text-sm text-slate-600">
          <p>
            <strong>Zero class names needed.</strong> Oat UI styles semantic HTML
            elements globally via a single CSS import in{' '}
            <code>layout.tsx</code>:
          </p>
          <pre className="overflow-x-auto rounded bg-slate-100 p-3 text-xs">
            {`import '@knadh/oat/oat.min.css'`}
          </pre>
          <p>
            Tailwind utility classes (e.g. <code>flex-1</code>,{' '}
            <code>mt-3</code>) override Oat UI defaults via the CSS cascade
            — no conflicts arise because Oat UI uses attribute selectors,
            not classes.
          </p>
        </div>
      </details>

      <footer className="text-center text-xs text-slate-400">
        Society Management and Logging System · Owner App ·{' '}
        <mark>Oat UI v0.5</mark>
      </footer>
    </main>
  )
}
