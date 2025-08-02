import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

// Specify Edge Runtime for Cloudflare compatibility
export const runtime = 'edge'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Gymnasia Birthday Party Menu',
    template: '%s | Gymnasia Birthday Party',
  },
  description:
    'Order your perfect birthday party menu at Gymnasia. Choose from our curated selection of birthday treats, cafe items, and special dishes for kids and adults.',
  keywords: [
    'birthday party',
    'party menu',
    'Gymnasia',
    'birthday catering',
    'kids party',
    'party food',
    'birthday celebration',
  ],
  authors: [{ name: 'Gymnasia' }],
  creator: 'Gymnasia',
  publisher: 'Gymnasia',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ka_GE',
    title: 'Gymnasia Birthday Party Menu',
    description:
      'Order your perfect birthday party menu at Gymnasia. Choose from our curated selection of birthday treats and cafe items.',
    siteName: 'Gymnasia Birthday Party Menu',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gymnasia Birthday Party Menu',
    description:
      'Order your perfect birthday party menu at Gymnasia. Choose from our curated selection of birthday treats and cafe items.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  manifest: '/manifest.json',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="color-scheme" content="light dark" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta
          name="format-detection"
          content="telephone=no, date=no, email=no, address=no"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
