import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://oxpecker.equisaas-bd.com';
  const currentDate = new Date();

  const primaryRoutes: { url: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }[] = [
    { url: '', priority: 1.0, changeFrequency: 'daily' },
    { url: '/chat', priority: 0.95, changeFrequency: 'daily' },
    { url: '/doctors', priority: 0.9, changeFrequency: 'daily' },
    { url: '/hospitals', priority: 0.9, changeFrequency: 'daily' },
    { url: '/medicines', priority: 0.85, changeFrequency: 'weekly' },
    { url: '/about', priority: 0.8, changeFrequency: 'monthly' },
    { url: '/contact', priority: 0.75, changeFrequency: 'monthly' },
    { url: '/privacy', priority: 0.5, changeFrequency: 'monthly' },
    { url: '/terms', priority: 0.5, changeFrequency: 'monthly' },
    { url: '/disclaimer', priority: 0.5, changeFrequency: 'monthly' },
    { url: '/refund', priority: 0.5, changeFrequency: 'monthly' },
    { url: '/careers', priority: 0.6, changeFrequency: 'monthly' },
    { url: '/press', priority: 0.6, changeFrequency: 'monthly' },
    { url: '/login', priority: 0.6, changeFrequency: 'monthly' },
    { url: '/register', priority: 0.7, changeFrequency: 'monthly' },
  ];

  return primaryRoutes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

