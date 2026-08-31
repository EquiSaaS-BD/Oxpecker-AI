import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://oxpecker.equisaas-bd.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/doctor/dashboard/',
          '/doctor/settings/',
          '/hospital/dashboard/',
          '/patient/',
        ],
      },
      {
        userAgent: ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Applebot'],
        allow: ['/', '/llms.txt', '/llms-full.txt', '/doctors', '/hospitals', '/medicines', '/about', '/contact'],
        disallow: ['/api/', '/admin/', '/doctor/dashboard/', '/hospital/dashboard/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

