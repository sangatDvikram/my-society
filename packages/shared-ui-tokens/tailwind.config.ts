import type { Config } from 'tailwindcss'

// =============================================================================
// @society/shared-ui-tokens — Canonical Tailwind CSS preset
//
// Every web application extends this config:
//   tailwind.config.ts → presets: [require('@society/shared-ui-tokens/tailwind.config')]
//
// Design decisions
//   • colours are paired with CSS custom properties so Oat UI's theming layer
//     can override them at runtime via `.prettierrc`-style overrides.
//   • spacing / typography scales follow the 4-pt grid (1 unit = 4 px).
//   • All tokens are prefixed with `society-*` to avoid collisions with apps
//     that extend the default Tailwind palette alongside this preset.
// =============================================================================

const societyPreset = {
  theme: {
    extend: {
      colors: {
        // ── Brand palette ─────────────────────────────────────────────────────
        primary: {
          50:  'var(--color-primary-50,  #eff6ff)',
          100: 'var(--color-primary-100, #dbeafe)',
          200: 'var(--color-primary-200, #bfdbfe)',
          300: 'var(--color-primary-300, #93c5fd)',
          400: 'var(--color-primary-400, #60a5fa)',
          500: 'var(--color-primary-500, #3b82f6)', // default brand blue
          600: 'var(--color-primary-600, #2563eb)',
          700: 'var(--color-primary-700, #1d4ed8)',
          800: 'var(--color-primary-800, #1e40af)',
          900: 'var(--color-primary-900, #1e3a8a)',
          950: 'var(--color-primary-950, #172554)',
        },
        // ── Semantic surfaces ─────────────────────────────────────────────────
        surface: {
          DEFAULT: 'var(--color-surface, #ffffff)',
          raised:  'var(--color-surface-raised, #f8fafc)',
          overlay: 'var(--color-surface-overlay, #f1f5f9)',
          sunken:  'var(--color-surface-sunken, #e2e8f0)',
        },
        // ── Status colours ────────────────────────────────────────────────────
        success: 'var(--color-success, #22c55e)',
        warning: 'var(--color-warning, #f59e0b)',
        danger:  'var(--color-danger,  #ef4444)',
        info:    'var(--color-info,    #06b6d4)',
      },

      // ── Typography ──────────────────────────────────────────────────────────
      fontFamily: {
        sans:  ['var(--font-sans,  Inter)', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-mono,  "JetBrains Mono")', 'monospace'],
        devanagari: ['var(--font-devanagari, Noto Sans Devanagari)', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],   // 10 px
        xs:    ['0.75rem',  { lineHeight: '1rem' }],   // 12 px
        sm:    ['0.875rem', { lineHeight: '1.25rem' }],// 14 px
        base:  ['1rem',     { lineHeight: '1.5rem' }], // 16 px
        lg:    ['1.125rem', { lineHeight: '1.75rem' }],// 18 px
        xl:    ['1.25rem',  { lineHeight: '1.75rem' }],// 20 px
        '2xl': ['1.5rem',   { lineHeight: '2rem' }],   // 24 px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],// 30 px
        '4xl': ['2.25rem',  { lineHeight: '2.5rem' }], // 36 px
      },

      // ── Spacing (4-pt grid) ─────────────────────────────────────────────────
      spacing: {
        '0.5': '0.125rem', //  2 px
        '1':   '0.25rem',  //  4 px
        '1.5': '0.375rem', //  6 px
        '2':   '0.5rem',   //  8 px
        '2.5': '0.625rem', // 10 px
        '3':   '0.75rem',  // 12 px
        '4':   '1rem',     // 16 px
        '5':   '1.25rem',  // 20 px
        '6':   '1.5rem',   // 24 px
        '8':   '2rem',     // 32 px
        '10':  '2.5rem',   // 40 px
        '12':  '3rem',     // 48 px
        '16':  '4rem',     // 64 px
        '20':  '5rem',     // 80 px
        '24':  '6rem',     // 96 px
      },

      // ── Border radius ────────────────────────────────────────────────────────
      borderRadius: {
        sm:   'var(--radius-sm,   0.25rem)',
        md:   'var(--radius-md,   0.375rem)',
        lg:   'var(--radius-lg,   0.5rem)',
        xl:   'var(--radius-xl,   0.75rem)',
        '2xl':'var(--radius-2xl,  1rem)',
        full: '9999px',
      },

      // ── Box shadow ────────────────────────────────────────────────────────────
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.10), 0 1px 2px -1px rgb(0 0 0 / 0.10)',
        modal:'0 20px 25px -5px rgb(0 0 0 / 0.10), 0 8px 10px -6px rgb(0 0 0 / 0.10)',
      },
    },
  },
  plugins: [],
} satisfies Partial<Config>

export default societyPreset
