import type { Metadata } from 'next'

/**
 * Single CSS entry-point for the owner app.
 *
 * globals.css uses postcss-import to inline @knadh/oat/oat.min.css BEFORE
 * Tailwind's @layer directives, solving the PostCSS @layer ordering issue.
 * Import order inside globals.css:
 *   @import '@knadh/oat/oat.min.css'   ← inlined by postcss-import
 *   @tailwind base / components / utilities
 *   @layer base { :root society token overrides }
 *
 * @see PRD §10.3.1 — Web Applications: Tailwind CSS + Oat UI
 */
import './globals.css'

export const metadata: Metadata = {
  title: 'My Society — Owner Portal',
  description:
    'Owner-facing dashboard — manage visitors, maintenance, payments, rentals, facilities & events.',
  /**
   * Icons are served from /public/ which is populated at build time by the
   * webpack SharedUiAssetsCopyPlugin in @society/shared-nextjs-config.
   * Source: packages/shared-ui-assets/assets/
   */
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.ico',       sizes: 'any' },
    ],
    apple: [
      { url: '/apple-icon-57x57.png',   sizes: '57x57' },
      { url: '/apple-icon-60x60.png',   sizes: '60x60' },
      { url: '/apple-icon-72x72.png',   sizes: '72x72' },
      { url: '/apple-icon-76x76.png',   sizes: '76x76' },
      { url: '/apple-icon-114x114.png', sizes: '114x114' },
      { url: '/apple-icon-120x120.png', sizes: '120x120' },
      { url: '/apple-icon-144x144.png', sizes: '144x144' },
      { url: '/apple-icon-152x152.png', sizes: '152x152' },
      { url: '/apple-icon-180x180.png', sizes: '180x180' },
    ],
    other: [
      { rel: 'apple-touch-icon-precomposed', url: '/apple-icon-precomposed.png' },
    ],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/*
        browserconfig.xml (for Windows tiles) and manifest.json are served from
        public/ — both copied from @society/shared-ui-assets by the webpack plugin.
      */}
      <head>
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body>{children}</body>
    </html>
  )
}
