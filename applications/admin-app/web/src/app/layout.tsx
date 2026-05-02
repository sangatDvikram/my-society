import type { Metadata } from 'next'

/**
 * Single CSS entry-point for the admin app.
 * globals.css uses @import + postcss-import to inline oat.min.css before
 * Tailwind's @layer directives, resolving the PostCSS @layer ordering issue.
 * @see PRD §10.3.1
 */
import './globals.css'

export const metadata: Metadata = {
  title: 'My Society — Admin Portal',
  description:
    'Admin dashboard — manage society members, approve requests, oversee finances & generate reports.',
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
      <head>
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body>{children}</body>
    </html>
  )
}
