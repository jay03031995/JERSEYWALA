import type { MetadataRoute } from 'next'

const SITE_URL = 'https://thejerseywala.in'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/checkout',
          '/checkout/',
          '/orders',
          '/orders/',
          '/account/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
