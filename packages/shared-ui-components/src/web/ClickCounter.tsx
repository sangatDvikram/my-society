'use client'

/**
 * ClickCounter — shared web component
 *
 * Demonstrates Oat UI integration across all web apps:
 *
 *  • <article>  — Oat UI card container (styled automatically by oat.min.css)
 *  • <button>   — Oat UI button (styled automatically; no class names needed)
 *  • <mark>     — Oat UI badge (inline highlight; styled by oat.min.css)
 *  • <progress> — Oat UI progress bar
 *
 * Tailwind utility classes add spacing and layout on top of Oat UI's base
 * styles — no class conflicts arise because Oat UI styles semantic HTML
 * elements directly, not via class names.
 *
 * @see PRD §10.3.1 — "Oat UI components available for web"
 * @see https://oat.ink
 */

import { useState } from 'react'

const MAX_CLICKS = 10

export function ClickCounter() {
  const [count, setCount] = useState(0)

  const increment = () => setCount((c) => Math.min(c + 1, MAX_CLICKS))
  const decrement = () => setCount((c) => Math.max(c - 1, 0))
  const reset     = () => setCount(0)

  const progress = Math.round((count / MAX_CLICKS) * 100)
  const isFull   = count === MAX_CLICKS
  const isEmpty  = count === 0

  return (
    <article className="mx-auto max-w-sm p-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Click Counter</h2>
        <mark className="ml-2 tabular-nums">
          {count} / {MAX_CLICKS}
        </mark>
      </header>

      {/* ── Description ─────────────────────────────────────────────────── */}
      <p className="mb-5 text-sm text-slate-600">
        A minimal Oat UI demo — every element below is styled automatically by{' '}
        <code>oat.min.css</code> with zero class annotations.
      </p>

      {/* ── Progress bar ────────────────────────────────────────────────── */}
      <progress
        value={progress}
        max={100}
        aria-label={`${progress}% of max clicks reached`}
        className="mb-5 w-full"
      />

      {/* ── Action buttons ───────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={decrement}
          disabled={isEmpty}
          aria-label="Decrement counter"
          className="flex-1"
        >
          − Less
        </button>

        <button
          type="button"
          onClick={increment}
          disabled={isFull}
          aria-label="Increment counter"
          className="flex-1"
        >
          + More
        </button>
      </div>

      {/* ── Reset ───────────────────────────────────────────────────────── */}
      {count > 0 && (
        <button
          type="button"
          onClick={reset}
          aria-label="Reset counter to zero"
          className="mt-3 w-full"
        >
          Reset
        </button>
      )}

      {/* ── Status message ──────────────────────────────────────────────── */}
      {isFull && (
        <div role="alert" className="mt-4">
          🎉 Maximum clicks reached! Hit <strong>Reset</strong> to start over.
        </div>
      )}
    </article>
  )
}
