/**
 * Official Brand Assets, Manufacturer Logos, Dosage Icons & Live MedEx Resolver
 * Directorate General of Drug Administration (DGDA) & MedEx Verified Metadata
 */

export interface ManufacturerAsset {
  name: string;
  shortName: string;
  logoUrl?: string;
  badgeColor: string;
  textColor: string;
  established?: number;
  origin?: string;
}

export interface LiveMedexBrandData {
  packagingImages: string[];
  dosageIcon: string | null;
  chemicalStructure: string | null;
  monographEn: Record<string, string>;
  monographBn: Record<string, string>;
}

export const TOP_MANUFACTURERS: Record<string, ManufacturerAsset> = {
  "beximco": {
    name: "Beximco Pharmaceuticals Ltd.",
    shortName: "Beximco",
    logoUrl: "https://medex.com.bd/storage/images/company_logos/u9SEyBHO8Wo45VJaNBaTH2RC6izRy7.png",
    badgeColor: "bg-[#002D62]/10 border-[#002D62]/30",
    textColor: "text-[#002D62]",
    established: 1976,
    origin: "Dhaka, Bangladesh"
  },
  "square": {
    name: "Square Pharmaceuticals PLC",
    shortName: "Square",
    logoUrl: "https://medex.com.bd/storage/images/company_logos/Y8zd1lJszraDVx1lyPH6eifSgNXkaN.png",
    badgeColor: "bg-[#ED1C24]/10 border-[#ED1C24]/30",
    textColor: "text-[#C1121F]",
    established: 1958,
    origin: "Pabna / Dhaka, Bangladesh"
  },
  "incepta": {
    name: "Incepta Pharmaceuticals Ltd.",
    shortName: "Incepta",
    logoUrl: "https://medex.com.bd/storage/images/company_logos/he56uP8ysDXqsuuG03SjStweqrtSL9.png",
    badgeColor: "bg-[#0284c7]/10 border-[#0284c7]/30",
    textColor: "text-[#0369a1]",
    established: 1999,
    origin: "Dhaka, Bangladesh"
  },
  "edruc": {
    name: "Edruc Limited",
    shortName: "Edruc",
    logoUrl: "/images/manufacturers/edruc.svg",
    badgeColor: "bg-[#065f46]/10 border-[#065f46]/30",
    textColor: "text-[#065f46]",
    established: 1948,
    origin: "Pabna, Bangladesh"
  },
  "renata": {
    name: "Renata PLC",
    shortName: "Renata",
    logoUrl: "https://medex.com.bd/storage/images/company_logos/V88M7fOERbfbJkC0Ehm32jXGDxo8vD.png",
    badgeColor: "bg-[#1e40af]/10 border-[#1e40af]/30",
    textColor: "text-[#1e40af]",
    established: 1972,
    origin: "Dhaka, Bangladesh"
  },
  "eskayef": {
    name: "Eskayef Pharmaceuticals Ltd.",
    shortName: "SK+F",
    logoUrl: "https://medex.com.bd/storage/images/company_logos/9AudX22YoAsfKjFQQkxPTrxkKpfUnv.png",
    badgeColor: "bg-[#047857]/10 border-[#047857]/30",
    textColor: "text-[#047857]",
    established: 1990,
    origin: "Dhaka, Bangladesh"
  },
  "general": {
    name: "General Pharmaceuticals Ltd.",
    shortName: "GPL",
    logoUrl: "https://medex.com.bd/storage/images/company_logos/EVsw18U4JCjHf9KGqpuIyWzDZHYie3.jpg",
    badgeColor: "bg-[#4338ca]/10 border-[#4338ca]/30",
    textColor: "text-[#4338ca]",
    established: 1984,
    origin: "Dhaka, Bangladesh"
  },
  "popular": {
    name: "Popular Pharmaceuticals PLC",
    shortName: "Popular",
    logoUrl: "https://medex.com.bd/storage/images/company_logos/ao8kaBjkqg9bpHuRT7UdFAZkEVz34w.png",
    badgeColor: "bg-[#0f766e]/10 border-[#0f766e]/30",
    textColor: "text-[#0f766e]",
    established: 2002,
    origin: "Dhaka, Bangladesh"
  },
  "drug international": {
    name: "Drug International Ltd.",
    shortName: "Drug Int.",
    logoUrl: "https://medex.com.bd/storage/images/company_logos/rPXEx1GsYjyvULKegNC5uiQihcdB2E.png",
    badgeColor: "bg-[#b91c1c]/10 border-[#b91c1c]/30",
    textColor: "text-[#b91c1c]",
    established: 1980,
    origin: "Dhaka, Bangladesh"
  },
  "aristopharma": {
    name: "Aristopharma Ltd.",
    shortName: "Aristopharma",
    logoUrl: "https://medex.com.bd/storage/images/company_logos/Se0laSDXU2PlTjr5Y9kSeW3PPeptno.png",
    badgeColor: "bg-[#7e22ce]/10 border-[#7e22ce]/30",
    textColor: "text-[#7e22ce]",
    established: 1986,
    origin: "Dhaka, Bangladesh"
  },
  "acme": {
    name: "ACME Laboratories Ltd.",
    shortName: "ACME",
    logoUrl: "https://medex.com.bd/storage/images/company_logos/nrFePdEnOORlkBjbp2eGWqk2G8wWNO.png",
    badgeColor: "bg-[#15803d]/10 border-[#15803d]/30",
    textColor: "text-[#15803d]",
    established: 1954,
    origin: "Dhaka, Bangladesh"
  },
  "aci": {
    name: "Advanced Chemical Industries (ACI)",
    shortName: "ACI",
    logoUrl: "https://medex.com.bd/storage/images/company_logos/SSukJqe0TKV4AEAgYF1QeDcXuo5DlL.png",
    badgeColor: "bg-[#c2410c]/10 border-[#c2410c]/30",
    textColor: "text-[#c2410c]",
    established: 1968,
    origin: "Dhaka, Bangladesh"
  },
  "advanced chemical": {
    name: "Advanced Chemical Industries (ACI)",
    shortName: "ACI",
    logoUrl: "https://medex.com.bd/storage/images/company_logos/SSukJqe0TKV4AEAgYF1QeDcXuo5DlL.png",
    badgeColor: "bg-[#c2410c]/10 border-[#c2410c]/30",
    textColor: "text-[#c2410c]",
    established: 1968,
    origin: "Dhaka, Bangladesh"
  },
  "opsonin": {
    name: "Opsonin Pharma Ltd.",
    shortName: "Opsonin",
    logoUrl: "https://medex.com.bd/storage/images/company_logos/2S73wdZb94grsmT847MVvDeL9dAaea.png",
    badgeColor: "bg-[#0369a1]/10 border-[#0369a1]/30",
    textColor: "text-[#0369a1]",
    established: 1956,
    origin: "Barisal / Dhaka, Bangladesh"
  },
  "hallmark": {
    name: "Hallmark Pharmaceuticals Ltd.",
    shortName: "Hallmark",
    badgeColor: "bg-[#0d9488]/10 border-[#0d9488]/30",
    textColor: "text-[#0d9488]",
    origin: "Dhaka, Bangladesh"
  },
  "medimet": {
    name: "Medimet Pharmaceuticals Ltd.",
    shortName: "Medimet",
    badgeColor: "bg-[#4f46e5]/10 border-[#4f46e5]/30",
    textColor: "text-[#4f46e5]",
    origin: "Dhaka, Bangladesh"
  },
  "delta": {
    name: "Delta Pharma Ltd.",
    shortName: "Delta",
    badgeColor: "bg-[#ea580c]/10 border-[#ea580c]/30",
    textColor: "text-[#ea580c]",
    origin: "Dhaka, Bangladesh"
  }
};

/**
 * High-Resolution Packaging Images for Verified Pharmaceuticals (Fallback Map)
 */
export const VERIFIED_PACKAGING_IMAGES: Record<string, string> = {
  "10452": "https://medex.com.bd/storage/images/packaging/napa-500-mg-tablet-95324450053-i1-jtmMTho0xPmKADM1kMTq.jpg",
  "10454": "https://medex.com.bd/storage/images/packaging/napa-extend-665-mg-xr-tablet-11628713397-9VpBTBDsf0.webp",
  "10592": "https://medex.com.bd/storage/images/packaging/napa-extra-500-mg-tablet-46174620412-i1-S6ON0Cv84Db8DclIKRNt.webp",
  "10461": "https://medex.com.bd/storage/images/packaging/napa-10-mg-injection-38629477289-i1-Juy8dxZo6zBkSIUwEmjB.png",
  "7483": "https://medex.com.bd/storage/images/packaging/bioxim-100-mg-suspension-12690574612-i1-KTb7UhMU0IQq4k8e0eXR.webp",
  "11540": "https://medex.com.bd/storage/images/packaging/dinovo-375-mg-tablet-25525146940-i1-m9u76H9wRL1MdRAFXW0U.jpg",
};

/**
 * Chemical Molecular Structure SVGs from DGDA / MedEx Pharmacopeia
 */
export const CHEMICAL_STRUCTURES: Record<string, string> = {
  "cefixime": "https://medex.com.bd/storage/res/g-res-217-cefixime-trihydrate-chemical-structure-3Mg9h2a2PuSZaJk4Uj0Z.svg",
  "cefixime trihydrate": "https://medex.com.bd/storage/res/g-res-217-cefixime-trihydrate-chemical-structure-3Mg9h2a2PuSZaJk4Uj0Z.svg",
  "paracetamol": "https://medex.com.bd/storage/res/g-res-860-paracetamol-chemical-structure-JLKHDuG7hxR2MserFZ27.svg",
};

/**
 * Official MedEx Dosage Form Icons
 */
export function getOfficialDosageIcon(dosageForm?: string): string {
  const f = (dosageForm || "").toLowerCase();
  if (f.includes("capsule")) return "https://medex.com.bd/img/dosage-forms/capsule.png";
  if (f.includes("syrup") || f.includes("suspension") || f.includes("liquid") || f.includes("solution")) {
    return "https://medex.com.bd/img/dosage-forms/syrup-2.png";
  }
  if (f.includes("injection") || f.includes("infusion") || f.includes("iv")) {
    return "https://medex.com.bd/img/dosage-forms/injection.png";
  }
  if (f.includes("drop")) return "https://medex.com.bd/img/dosage-forms/eye-drop.png";
  if (f.includes("cream") || f.includes("gel")) return "https://medex.com.bd/img/dosage-forms/cream.png";
  if (f.includes("ointment")) return "https://medex.com.bd/img/dosage-forms/ointment.png";
  if (f.includes("inhaler") || f.includes("spray")) return "https://medex.com.bd/img/dosage-forms/inhaler.png";
  if (f.includes("suppository")) return "https://medex.com.bd/img/dosage-forms/suppository.png";
  return "https://medex.com.bd/img/dosage-forms/tablet.png";
}

export function getManufacturerAsset(companyName?: string): ManufacturerAsset | null {
  if (!companyName) return null;
  const lower = companyName.toLowerCase();
  for (const [key, asset] of Object.entries(TOP_MANUFACTURERS)) {
    if (lower.includes(key)) {
      return asset;
    }
  }
  return {
    name: companyName,
    shortName: companyName.split(" ")[0] || companyName,
    badgeColor: "bg-sky-50 border-sky-200",
    textColor: "text-sky-800",
    origin: "Bangladesh"
  };
}

export function getMedicinePackaging(medicineId: string | number, brandName?: string): string | null {
  const idStr = String(medicineId);
  if (VERIFIED_PACKAGING_IMAGES[idStr]) {
    return VERIFIED_PACKAGING_IMAGES[idStr];
  }
  return null;
}

export function getChemicalStructure(genericName?: string): string | null {
  if (!genericName) return null;
  const lower = genericName.toLowerCase().trim();
  for (const [key, url] of Object.entries(CHEMICAL_STRUCTURES)) {
    if (lower.includes(key)) {
      return url;
    }
  }
  return null;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&rdquo;/gi, '"')
    .replace(/&ldquo;/gi, '"')
    .replace(/&deg;/gi, "°")
    .replace(/&ordm;/gi, "º")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function cleanAcBodyHtml(rawHtml: string): string {
  const withBreaks = rawHtml
    .replace(/<li[^>]*>/gi, "\n• ")
    .replace(/<\/li>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  return decodeHtmlEntities(withBreaks)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseMedexSections(html: string, isBangla: boolean): Record<string, string> {
  const result: Record<string, string> = {};
  const regex = /<h3[^>]*>([^<]+)<\/h3>\s*<\/div>\s*<div class=["']ac-body["']>([\s\S]*?)<\/div>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const rawTitle = decodeHtmlEntities(match[1]).trim();
    const bodyText = cleanAcBodyHtml(match[2]);
    if (!bodyText) continue;

    if (isBangla) {
      if (rawTitle.includes("নির্দেশনা") && !rawTitle.includes("প্রতিনির্দেশনা")) {
        result.indication_description = bodyText;
      } else if (rawTitle.includes("ফার্মাকোলজি")) {
        result.pharmacology = bodyText;
      } else if (rawTitle.includes("মাত্রা ও সেবনবিধি")) {
        result.dosage = bodyText;
      } else if (rawTitle.includes("সেবনবিধি")) {
        result.administration = bodyText;
      } else if (rawTitle.includes("মিথষ্ক্রিয়া")) {
        result.interaction = bodyText;
      } else if (rawTitle.includes("প্রতিনির্দেশনা")) {
        result.contraindications = bodyText;
      } else if (rawTitle.includes("পার্শ্ব প্রতিক্রিয়া")) {
        result.side_effects = bodyText;
      } else if (rawTitle.includes("গর্ভাবস্থায়")) {
        result.pregnancy_and_lactation = bodyText;
      } else if (rawTitle.includes("সতর্কতা")) {
        result.precautions = bodyText;
      } else if (rawTitle.includes("মাত্রাধিক্যতা")) {
        result.overdose_effects = bodyText;
      } else if (rawTitle.includes("পুনর্গঠন")) {
        result.reconstitution = bodyText;
      } else if (rawTitle.includes("সংরক্ষণ")) {
        result.storage_conditions = bodyText;
      } else if (rawTitle.includes("থেরাপিউটিক ক্লাস")) {
        result.therapeutic_class = bodyText;
      }
    } else {
      const lower = rawTitle.toLowerCase();
      if (lower.includes("indications")) {
        result.indication_description = bodyText;
      } else if (lower.includes("pharmacology")) {
        result.pharmacology = bodyText;
      } else if (lower.includes("dosage & administration") || lower === "dosage") {
        result.dosage = bodyText;
      } else if (lower === "administration") {
        result.administration = bodyText;
      } else if (lower.includes("interaction")) {
        result.interaction = bodyText;
      } else if (lower.includes("contraindications")) {
        result.contraindications = bodyText;
      } else if (lower.includes("side effects")) {
        result.side_effects = bodyText;
      } else if (lower.includes("pregnancy")) {
        result.pregnancy_and_lactation = bodyText;
      } else if (lower.includes("precautions")) {
        result.precautions = bodyText;
      } else if (lower.includes("overdose")) {
        result.overdose_effects = bodyText;
      } else if (lower.includes("reconstitution")) {
        result.reconstitution = bodyText;
      } else if (lower.includes("storage")) {
        result.storage_conditions = bodyText;
      } else if (lower.includes("therapeutic class")) {
        result.therapeutic_class = bodyText;
      }
    }
  }
  return result;
}

const liveBrandCache = new Map<string, LiveMedexBrandData>();

export async function fetchLiveMedexBrandData(medicineId: string | number): Promise<LiveMedexBrandData> {
  const idStr = String(medicineId);
  if (liveBrandCache.has(idStr)) {
    return liveBrandCache.get(idStr)!;
  }

  const fallback: LiveMedexBrandData = {
    packagingImages: VERIFIED_PACKAGING_IMAGES[idStr] ? [VERIFIED_PACKAGING_IMAGES[idStr]] : [],
    dosageIcon: null,
    chemicalStructure: null,
    monographEn: {},
    monographBn: {},
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`https://medex.com.bd/brands/${encodeURIComponent(idStr)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      return fallback;
    }

    const html = await res.text();

    // Extract packaging images
    const packMatches = html.match(/https:\/\/medex\.com\.bd\/storage\/images\/packaging\/[A-Za-z0-9_.\-]+/g) || [];
    const uniquePacks = Array.from(new Set(packMatches));
    if (uniquePacks.length > 0) {
      fallback.packagingImages = uniquePacks;
    }

    // Extract official dosage form icon
    const dosageMatch = html.match(/https:\/\/medex\.com\.bd\/img\/dosage-forms\/[A-Za-z0-9_.\-]+/);
    if (dosageMatch) {
      fallback.dosageIcon = dosageMatch[0];
    }

    // Extract chemical structure SVG
    const chemMatch = html.match(/https:\/\/medex\.com\.bd\/storage\/res\/[A-Za-z0-9_.\-]+/);
    if (chemMatch) {
      fallback.chemicalStructure = chemMatch[0];
    }

    // Parse English monograph sections
    fallback.monographEn = parseMedexSections(html, false);

    // Check for official Bengali monograph link
    const bnLinkMatch = html.match(/https:\/\/medex\.com\.bd\/brands\/\d+\/[A-Za-z0-9_.\-]+\/bn/);
    if (bnLinkMatch) {
      try {
        const bnController = new AbortController();
        const bnTimer = setTimeout(() => bnController.abort(), 3500);
        const bnRes = await fetch(bnLinkMatch[0], {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          signal: bnController.signal,
        });
        clearTimeout(bnTimer);
        if (bnRes.ok) {
          const bnHtml = await bnRes.text();
          fallback.monographBn = parseMedexSections(bnHtml, true);
        }
      } catch {
        // Ignore BN fetch timeout
      }
    }

    liveBrandCache.set(idStr, fallback);
    return fallback;
  } catch {
    return fallback;
  }
}
