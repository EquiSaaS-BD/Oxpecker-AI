import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Script from "next/script";
import { SEO_CONFIG, generateRootJsonLd } from "@/config/seo";

export const viewport: Viewport = {
  themeColor: "#0284c7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SEO_CONFIG.primaryDomain),
  title: {
    default: `${SEO_CONFIG.brandName} - ${SEO_CONFIG.tagline}`,
    template: `%s | ${SEO_CONFIG.brandName}`,
  },
  description: SEO_CONFIG.defaultDescription,
  keywords: SEO_CONFIG.keywords,
  authors: [
    { name: SEO_CONFIG.brandName, url: SEO_CONFIG.primaryDomain },
    { name: SEO_CONFIG.agency.name, url: SEO_CONFIG.agency.url },
    { name: SEO_CONFIG.agency.leadArchitect, url: SEO_CONFIG.agency.architectPortfolio }
  ],
  creator: SEO_CONFIG.brandName,
  publisher: SEO_CONFIG.agency.bdUrl,
  alternates: {
    canonical: "/",
    languages: {
      "bn-BD": "/",
      "en-US": "/en",
    },
  },
  openGraph: {
    title: `${SEO_CONFIG.brandName} - ${SEO_CONFIG.tagline}`,
    description: SEO_CONFIG.defaultDescription,
    url: SEO_CONFIG.primaryDomain,
    siteName: SEO_CONFIG.brandName,
    images: [
      {
        url: `${SEO_CONFIG.primaryDomain}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: `${SEO_CONFIG.brandName} Platform`,
      },
      {
        url: `${SEO_CONFIG.primaryDomain}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: SEO_CONFIG.brandName,
      },
    ],
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SEO_CONFIG.brandName} - ${SEO_CONFIG.tagline}`,
    description: SEO_CONFIG.defaultDescription,
    images: [`${SEO_CONFIG.primaryDomain}/opengraph-image.png`],
  },
  icons: {
    icon: "/images/Oxpecker_icon.png",
    shortcut: "/images/Oxpecker_icon.png",
    apple: "/images/Oxpecker_icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = generateRootJsonLd();

  return (
    <html
      lang="bn"
      translate="no"
      suppressHydrationWarning
    >
      <head>
        <meta name="geo.region" content={SEO_CONFIG.targetRegion} />
        <meta name="geo.position" content={`${SEO_CONFIG.geoCoordinates.latitude};${SEO_CONFIG.geoCoordinates.longitude}`} />
        <meta name="ICBM" content={`${SEO_CONFIG.geoCoordinates.latitude}, ${SEO_CONFIG.geoCoordinates.longitude}`} />
        <Script
          id="oxpecker-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Auto-recover ChunkLoadError on new Vercel deployments */}
        <Script id="chunk-error-recovery" strategy="beforeInteractive">
          {`
            if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(function(regs) {
                for (var i = 0; i < regs.length; i++) regs[i].unregister();
              });
            }
            window.addEventListener('error', function(e) {
              if (e.message && (e.message.indexOf('Loading chunk') !== -1 || e.message.indexOf('ChunkLoadError') !== -1)) {
                window.location.reload();
              }
            });
          `}
        </Script>
      </head>
      <body className="antialiased selection:bg-sky-500 selection:text-white" suppressHydrationWarning>
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
