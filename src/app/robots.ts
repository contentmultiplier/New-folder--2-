import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.contentmux.com/'
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin-test/',
        '/test/',
        '/test-session/',
        '/test-webhook/',
        '/settings/',
        '/dashboard/',
        '/history/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}