/**
 * Centralized SEO, AEO & GEO Configuration for Oxpecker AI
 * Developed by EquiSaaS Agency (https://equisaas.tech | https://equisaas-bd.com)
 * Lead Architect: Kholipha Ahmmad Al-Amin (https://kholipha-ahmmad-al-amin.me)
 */

export const SEO_CONFIG = {
  brandName: "Oxpecker AI",
  legalName: "Oxpecker Healthcare AI",
  primaryDomain: "https://oxpecker.equisaas-bd.com",
  tagline: "National Centralized Hospital & Emergency Healthcare Network of Bangladesh",
  defaultDescription:
    "Oxpecker AI is Bangladesh's centralized digital health platform connecting hospitals, doctors, and emergency rooms. Features instant Universal Health ID (UHID) patient history, live ICU bed telemetry, DGDA medicine verification, and native Bengali AI triage.",
  targetRegion: "BD",
  geoCoordinates: {
    latitude: 23.8103,
    longitude: 90.4125,
    city: "Dhaka",
    country: "Bangladesh",
  },
  socialLinks: [
    "https://facebook.com/oxpecker",
    "https://linkedin.com/company/oxpecker",
    "https://twitter.com/oxpecker_ai",
  ],
  agency: {
    name: "EquiSaaS Agency",
    url: "https://equisaas.tech",
    bdUrl: "https://equisaas-bd.com",
    leadArchitect: "Kholipha Ahmmad Al-Amin",
    architectPortfolio: "https://kholipha-ahmmad-al-amin.me",
  },
  keywords: [
    "National Centralized Hospital Server Bangladesh",
    "Universal Health ID UHID Bangladesh",
    "Emergency Health Records Triage",
    "Live ICU Bed Tracker Bangladesh",
    "BMDC Verified Doctors Directory",
    "DGDA Medicine Database",
    "Bengali Medical AI Assistant",
    "Prescription Scanner AI",
    "Hospital Bed Availability Dhaka",
    "Emergency 999 Medical Response",
    "Digital Health Interoperability",
    "Telemedicine AI Assistant Bangladesh",
  ],
};

export function generateRootJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${SEO_CONFIG.primaryDomain}/#webpage`,
        "url": SEO_CONFIG.primaryDomain,
        "name": `${SEO_CONFIG.brandName} - ${SEO_CONFIG.tagline}`,
        "description": SEO_CONFIG.defaultDescription,
        "isAccessibleForFree": true,
        "inLanguage": ["bn-BD", "en-US"],
        "medicalSpecialty": [
          "PrimaryCare",
          "PublicHealth",
          "EmergencyMedicine",
          "InternalMedicine",
          "DiagnosticServices"
        ],
        "about": {
          "@type": "MedicalCondition",
          "name": "General Healthcare and Symptom Triage"
        },
        "publisher": {
          "@id": `${SEO_CONFIG.primaryDomain}/#organization`
        }
      },
      {
        "@type": "MedicalOrganization",
        "@id": `${SEO_CONFIG.primaryDomain}/#organization`,
        "name": SEO_CONFIG.brandName,
        "legalName": SEO_CONFIG.legalName,
        "url": SEO_CONFIG.primaryDomain,
        "logo": `${SEO_CONFIG.primaryDomain}/images/Oxpecker_icon.png`,
        "image": `${SEO_CONFIG.primaryDomain}/opengraph-image.png`,
        "description": SEO_CONFIG.defaultDescription,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": SEO_CONFIG.geoCoordinates.city,
          "addressCountry": SEO_CONFIG.geoCoordinates.country
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": SEO_CONFIG.geoCoordinates.latitude,
          "longitude": SEO_CONFIG.geoCoordinates.longitude
        },
        "sameAs": SEO_CONFIG.socialLinks,
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+8801700000000",
          "contactType": "customer service",
          "areaServed": "BD",
          "availableLanguage": ["Bengali", "English"]
        },
        "creator": {
          "@type": "Organization",
          "name": SEO_CONFIG.agency.name,
          "url": SEO_CONFIG.agency.url,
          "sameAs": [
            SEO_CONFIG.agency.bdUrl,
            SEO_CONFIG.agency.architectPortfolio
          ]
        }
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SEO_CONFIG.primaryDomain}/#software`,
        "name": SEO_CONFIG.brandName,
        "applicationCategory": "HealthApplication",
        "operatingSystem": "All modern web browsers, Android, iOS",
        "url": SEO_CONFIG.primaryDomain,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "BDT"
        },
        "author": {
          "@type": "Person",
          "name": SEO_CONFIG.agency.leadArchitect,
          "url": SEO_CONFIG.agency.architectPortfolio
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "1250",
          "bestRating": "5",
          "worstRating": "1"
        }
      }
    ]
  };
}

export function generateFaqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith("http") ? item.url : `${SEO_CONFIG.primaryDomain}${item.url}`
    }))
  };
}
