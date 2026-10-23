import fs from "fs";
import path from "path";

type CatalogMedicine = {
  id: number | string;
  brand_name?: string;
  generic_name?: string;
  strength?: string;
  dosage_form?: string;
  manufacturer?: string;
  package_container?: string;
  package_size?: string;
};

let cachedCatalog: { generatedAt: string | null; data: CatalogMedicine[] } | null = null;
let cachedCatalogMtime = 0;

function loadCatalog(): { generatedAt: string | null; data: CatalogMedicine[] } {
  const paths = [
    path.join(process.cwd(), "public/data/medicines.json"),
    path.join(process.cwd(), "../organized_medicine_data/organized/medicines.json"),
  ];
  const file = paths.find((candidate) => fs.existsSync(candidate));
  if (!file) return { generatedAt: null, data: [] };
  const mtime = fs.statSync(file).mtimeMs;
  if (cachedCatalog && cachedCatalogMtime === mtime) return cachedCatalog;
  const contents = JSON.parse(fs.readFileSync(file, "utf8"));
  cachedCatalog = { generatedAt: contents.generated_at || null, data: contents.data || [] };
  cachedCatalogMtime = mtime;
  return cachedCatalog;
}

function normalized(value: unknown): string {
  return String(value || "").normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizePackageSize(value: unknown): string {
  return normalized(value)
    .replace(/\(?\s*৳\s*[\d,]+(?:\.\d{1,2})?\)?/g, "")
    .replace(/[():]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function priceDetails(medicine: CatalogMedicine): { amount: number; basis: "unit" | "package" } | null {
  const packageText = medicine.package_size || "";
  const packageMatch = packageText.match(/৳\s*([\d,]+(?:\.\d{1,2})?)/)
    || (medicine.package_container || "").match(/(?:pack|bottle|box|strip)[^৳]*৳\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (packageMatch) {
    const amount = Number(packageMatch[1].replace(/,/g, ""));
    if (Number.isFinite(amount) && amount > 0) return { amount, basis: "package" };
  }

  const unitMatch = (medicine.package_container || "").match(/Unit\s+Price:\s*৳\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (!unitMatch) return null;
  const amount = Number(unitMatch[1].replace(/,/g, ""));
  return Number.isFinite(amount) && amount > 0 ? { amount, basis: "unit" } : null;
}

export function getMedicineSnapshotMetadata() {
  const catalog = loadCatalog();
  const generatedMs = catalog.generatedAt ? Date.parse(catalog.generatedAt) : Number.NaN;
  const ageDays = Number.isFinite(generatedMs)
    ? Math.max(0, Math.floor((Date.now() - generatedMs) / 86_400_000))
    : null;
  return {
    source: "MedEx Bangladesh catalog snapshot",
    generatedAt: catalog.generatedAt,
    ageDays,
    freshness: ageDays === null ? "unknown" : ageDays > 30 ? "stale" : "recent",
  };
}

export function comparePrescriptionPrices(parsed: unknown) {
  const catalog = loadCatalog();
  const metadata = getMedicineSnapshotMetadata();
  const medicines = (parsed as { medicines?: unknown } | null)?.medicines;
  if (!Array.isArray(medicines)) return { snapshot: metadata, matches: [] };

  const matches = medicines.map((item: any) => {
    const generic = normalized(item?.genericName || item?.generic);
    const strength = normalized(item?.strength);
    const form = normalized(item?.dosageForm);
    const packageSize = normalizePackageSize(item?.packageSize);
    const brand = normalized(item?.brandName || item?.name);
    if (!generic || !strength || !form || !packageSize) {
      return {
        prescribed: item,
        baselinePrice: null,
        comparablePrices: [],
        status: "insufficient-extracted-details",
      };
    }

    const comparable = catalog.data.filter((candidate) =>
      normalized(candidate.generic_name) === generic
      && normalized(candidate.strength) === strength
      && normalized(candidate.dosage_form) === form
      && normalizePackageSize(candidate.package_size) === packageSize
      && priceDetails(candidate) !== null
    );
    const baseline = comparable.find((candidate) => normalized(candidate.brand_name) === brand);
    const baselineDetails = baseline ? priceDetails(baseline) : null;
    const baselinePrice = baselineDetails?.amount ?? null;
    const alternatives = comparable
      .filter((candidate) => normalized(candidate.brand_name) !== brand)
      .map((candidate) => {
        const details = priceDetails(candidate)!;
        return {
          brandName: candidate.brand_name || "Unknown",
          manufacturer: candidate.manufacturer || "Unknown",
          price: details.amount,
          priceBasis: details.basis,
          savings: baselinePrice === null || baselineDetails?.basis !== details.basis
            ? null
            : Number((baselinePrice - details.amount).toFixed(2)),
          generic: candidate.generic_name,
          strength: candidate.strength,
          dosageForm: candidate.dosage_form,
          packageSize: candidate.package_size,
        };
      })
      .filter((candidate) => candidate.savings === null || candidate.savings > 0)
      .sort((a, b) => a.price - b.price);

    return {
      prescribed: item,
      baselinePrice,
      baselinePriceBasis: baselineDetails?.basis ?? null,
      comparablePrices: alternatives,
      status: alternatives.length ? "matched" : "no-exact-package-match",
    };
  });

  return { snapshot: metadata, matches };
}

export function getCatalogMedicines() {
  return loadCatalog();
}
