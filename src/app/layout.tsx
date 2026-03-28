import type { Metadata } from 'next'
import { Oswald, Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import { Toaster } from 'react-hot-toast'

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-oswald',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
})

const SITE_URL = 'https://thejerseywala.in'
const SITE_NAME = 'The Jersey Wala'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'The Jersey Wala — Official Sports Jerseys India',
    template: '%s | The Jersey Wala',
  },
  description:
    'Buy official & replica jerseys for IPL 2026, cricket, football and more. Shop Mumbai Indians, CSK, RCB & all IPL teams. All sizes, fast delivery across India.',
  keywords: [
    'IPL jersey', 'IPL 2026 jersey', 'cricket jersey India', 'Mumbai Indians jersey',
    'CSK jersey', 'sports jersey online', 'replica jersey', 'football jersey India',
    'buy jersey online India', 'The Jersey Wala',
  ],
  authors: [{ name: 'The Jersey Wala', url: SITE_URL }],
  creator: 'The Jersey Wala',
  publisher: 'The Jersey Wala',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'The Jersey Wala — Official Sports Jerseys India',
    description:
      'Buy official & replica jerseys for IPL 2026, cricket, football and more. All IPL teams, all sizes — delivered fast across India.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'The Jersey Wala — Official Sports Jerseys India',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@thejerseywala',
    creator: '@thejerseywala',
    title: 'The Jersey Wala — Official Sports Jerseys India',
    description:
      'Buy official & replica jerseys for IPL 2026, cricket, football and more. All teams, all sizes — fast delivery across India.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: SITE_URL,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.ico`,
      },
      sameAs: [
        'https://instagram.com/thejerseywala',
        'https://twitter.com/thejerseywala',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['English', 'Hindi'],
        areaServed: 'IN',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/shop?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'OnlineStore',
      '@id': `${SITE_URL}/#store`,
      name: SITE_NAME,
      url: SITE_URL,
      description: 'Official and replica sports jerseys for IPL, cricket, football — delivered across India.',
      currenciesAccepted: 'INR',
      priceRange: '₹₹',
      areaServed: {
        '@type': 'Country',
        name: 'India',
      },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme — must be inline, runs before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google AdSense — in <head> for site verification by Google crawler */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6641708917809759"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${oswald.variable} ${inter.variable} min-h-screen flex flex-col`}>
        <ConditionalLayout>{children}</ConditionalLayout>
        {/* Google AdSense — loaded after hydration to avoid script tag conflict */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6641708917809759"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#fff',
              border: '1px solid #262626',
              borderRadius: '10px',
              fontSize: '13px',
              fontFamily: 'var(--font-inter)',
            },
          }}
        />
      </body>
    </html>
  )
}
