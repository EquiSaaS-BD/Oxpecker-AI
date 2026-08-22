import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0284c7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://oxpecker.equisaas-bd.com"),
  title: {
    default: "Oxpecker AI - International AI Healthcare & Diagnostic Platform",
    template: "%s | Oxpecker AI",
  },
  description:
    "Oxpecker is a world-class AI-powered medical platform providing instant Bengali & English symptom analysis, prescription scanning, lab report insights, and verified doctor discovery.",
  keywords: [
    "AI Healthcare",
    "Health Assistant",
    "Doctor Discovery",
    "Medicine Intelligence",
    "Oxpecker AI",
    "Symptom Checker",
    "Prescription Scanner",
    "Lab Report Analyzer",
    "ICU Bed Tracker",
    "Bangladesh AI Health"
  ],
  authors: [{ name: "EquiSaaS BD / Oxpecker Team" }],
  creator: "Oxpecker AI",
  publisher: "EquiSaaS BD",
  alternates: {
    canonical: "/",
    languages: {
      "bn-BD": "/",
      "en-US": "/en",
    },
  },
  openGraph: {
    title: "Oxpecker AI - International AI Healthcare & Diagnostic Platform",
    description: "Instant AI-powered health guidance, symptom analysis, prescription scanning, and specialist doctor discovery.",
    url: "https://oxpecker.equisaas-bd.com",
    siteName: "Oxpecker AI",
    images: [
      {
        url: "https://oxpecker.equisaas-bd.com/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Oxpecker AI International Platform",
      },
      {
        url: "https://oxpecker.equisaas-bd.com/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Oxpecker AI",
      },
    ],
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oxpecker AI - International AI Healthcare & Diagnostic Platform",
    description: "Instant AI-powered health guidance, symptom analysis, prescription scanning, and specialist doctor discovery.",
    images: ["https://oxpecker.equisaas-bd.com/opengraph-image.png"],
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": "https://oxpecker.equisaas-bd.com/#webpage",
        "url": "https://oxpecker.equisaas-bd.com",
        "name": "Oxpecker AI Healthcare Platform",
        "description": "AI-driven medical diagnostic assistance, prescription scanning, and healthcare provider directory.",
        "isAccessibleForFree": true,
        "inLanguage": ["bn", "en"],
        "medicalSpecialty": [
          "PrimaryCare",
          "PublicHealth",
          "EmergencyMedicine",
          "InternalMedicine"
        ]
      },
      {
        "@type": "MedicalOrganization",
        "@id": "https://oxpecker.equisaas-bd.com/#organization",
        "name": "Oxpecker AI",
        "url": "https://oxpecker.equisaas-bd.com",
        "logo": "https://oxpecker.equisaas-bd.com/images/Oxpecker_icon.png",
        "description": "Next-generation AI medical assistant & health intelligence network.",
        "sameAs": [
          "https://facebook.com/oxpecker",
          "https://linkedin.com/company/oxpecker"
        ]
      }
    ]
  };

  return (
    <html lang="bn" translate="no" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <meta name="geo.region" content="BD" />
        <meta name="geo.position" content="23.8103;90.4125" />
        <meta name="ICBM" content="23.8103, 90.4125" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <Script
          id="oxpecker-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Auto-recover ChunkLoadError on new Vercel deployments */}
        <Script id="chunk-error-recovery" strategy="beforeInteractive">
          {`
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
