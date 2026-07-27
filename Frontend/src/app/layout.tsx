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
  metadataBase: new URL("https://shushthota.equisaas-bd.com"),
  title: "Shustota AI - Your Personal AI Health Assistant",
  description:
    "Shustota is an advanced AI-powered healthcare platform providing instant symptom analysis, prescription scanning, and expert doctor connections. Completely free and secure.",
  keywords: [
    "AI Healthcare",
    "Health Assistant",
    "Doctor Discovery",
    "Medicine Intelligence",
    "Shustota",
    "স্বাস্থ্যসেবা",
    "Symptom Checker",
    "Prescription Scanner"
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Shustota AI - Your Personal AI Health Assistant",
    description: "Instant AI-powered health guidance, symptom analysis, and prescription insights.",
    url: "https://shushthota.equisaas-bd.com",
    siteName: "Shustota AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Shustota AI Healthcare Dashboard",
      },
    ],
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shustota AI - Your Personal AI Health Assistant",
    description: "Instant AI-powered health guidance, symptom analysis, and prescription insights.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.png",
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
    "name": "Shustota AI",
    "url": "https://shushthota.equisaas-bd.com",
    "logo": "https://shushthota.equisaas-bd.com/images/shustota%20ai%20logo.png",
    "description": "AI-powered healthcare platform for symptom analysis, doctor discovery, and medical intelligence.",
    "isAccessibleForFree": true,
    "sameAs": [
      "https://facebook.com/shustota",
      "https://linkedin.com/company/shustota"
    ],
    "medicalSpecialty": [
      "PublicHealth",
      "PrimaryCare"
    ]
  };

  return (
    <html lang="bn" translate="no" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <Script
          id="shustota-schema"
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
