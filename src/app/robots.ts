import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: 'http://indoquran.web.id/sitemap.xml',
    host: 'http://indoquran.web.id',
  }
}
