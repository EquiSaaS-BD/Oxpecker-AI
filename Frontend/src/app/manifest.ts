import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Oxpecker AI - National Digital Health Network',
    short_name: 'Oxpecker AI',
    description: 'Bangladesh Centralized Hospital and Emergency Health Network',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#00C2A8',
    icons: [
      {
        src: '/dr-pekr.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/dr-pekr.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  };
}
