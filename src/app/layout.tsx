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

export const metadata: Metadata = {
  title: 'The Jersey Wala — Official Sports Jerseys India',
  description:
    'Official and replica jerseys for cricket, football, IPL and more. All sizes, every team — delivered fast across India.',
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
