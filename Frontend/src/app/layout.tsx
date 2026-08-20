import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://oxpecker.equisaas-bd.com"),
  title: "Oxpecker AI - Your Personal AI Health Assistant",
  description:
    "Oxpecker is an advanced AI-powered healthcare platform providing instant symptom analysis, prescription scanning, and expert doctor connections. Completely free and secure.",
  keywords: [
    "AI Healthcare",
    "Health Assistant",
    "Doctor Discovery",
    "Medicine Intelligence",
    "Oxpecker",
    "Symptom Checker",
    "Prescription Scanner"
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Oxpecker AI - Your Personal AI Health Assistant",
    description: "Instant AI-powered health guidance, symptom analysis, and prescription insights.",
    url: "https://oxpecker.equisaas-bd.com",
    siteName: "Oxpecker AI",
    images: [
      {
        url: "https://oxpecker.equisaas-bd.com/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Oxpecker AI",
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
    title: "Oxpecker AI - Your Personal AI Health Assistant",
    description: "Instant AI-powered health guidance, symptom analysis, and prescription insights.",
    images: ["https://oxpecker.equisaas-bd.com/opengraph-image.png"],
  },
  icons: {
    icon: "/images/Oxpecker_icon.png",
  },
};

import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    "name": "Oxpecker AI",
    "url": "https://oxpecker.equisaas-bd.com",
    "logo": "https://oxpecker.equisaas-bd.com/images/Oxpecker_icon.png",
    "description": "AI-powered healthcare platform for symptom analysis, doctor discovery, and medical intelligence.",
    "isAccessibleForFree": true,
    "sameAs": [
      "https://facebook.com/oxpecker",
      "https://linkedin.com/company/oxpecker"
    ],
    "medicalSpecialty": [
      "PublicHealth",
      "PrimaryCare"
    ]
  };

  return (
    <html lang="bn" translate="no" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <Script
          id="oxpecker-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
