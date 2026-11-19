import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/prisma";
import { DEFAULT_HOSPITAL_THEME } from "@/lib/hospital-hms";
import { requireSessionUser } from "@/lib/server-auth";
import type { HospitalThemeConfig } from "@/types/hospital-hms";

export const dynamic = "force-dynamic";

const g = globalThis as typeof globalThis & {
  __oxpeckerHospitalThemes?: Record<string, HospitalThemeConfig>;
};

function getThemeMemoryMap(): Record<string, HospitalThemeConfig> {
  if (!g.__oxpeckerHospitalThemes) {
    g.__oxpeckerHospitalThemes = {};
  }
  return g.__oxpeckerHospitalThemes;
}

export async function GET(req: Request) {
  const auth = await requireSessionUser(req, ["hospital", "doctor", "assistant", "admin"]);
  if (auth.error) return auth.error;
  const orgId = auth.user.organizationId || "org-default";

  if (process.env.DATABASE_URL) {
    try {
      const row = await withDbTimeout(
        prisma.hospitalThemeProfile.findUnique({ where: { organizationId: orgId } }),
        1200
      );
      if (row) {
        const theme: HospitalThemeConfig = {
          hospital_name: row.hospitalName,
          hospital_tagline: row.hospitalTagline || DEFAULT_HOSPITAL_THEME.hospital_tagline,
          hospital_address: row.hospitalAddress || DEFAULT_HOSPITAL_THEME.hospital_address,
          hospital_hotline: row.hospitalHotline || DEFAULT_HOSPITAL_THEME.hospital_hotline,
          hospital_phone: row.hospitalPhone || DEFAULT_HOSPITAL_THEME.hospital_phone,
          hospital_email: row.hospitalEmail || DEFAULT_HOSPITAL_THEME.hospital_email,
          license_no: row.licenseNo || DEFAULT_HOSPITAL_THEME.license_no,
          tax_bin: row.taxBin || DEFAULT_HOSPITAL_THEME.tax_bin,
          logo_url: row.logoUrl || undefined,
          theme_style: (row.themeStyle as HospitalThemeConfig["theme_style"]) || "singapore",
          watermark_text: row.watermarkText || DEFAULT_HOSPITAL_THEME.watermark_text,
          watermark_opacity: row.watermarkOpacity ?? 0.08,
          watermark_enabled: row.watermarkEnabled ?? true,
          stamp_text: row.stampText || DEFAULT_HOSPITAL_THEME.stamp_text,
          stamp_color: row.stampColor || "#059669",
          stamp_enabled: row.stampEnabled ?? true,
          signatory_name: row.signatoryName || DEFAULT_HOSPITAL_THEME.signatory_name,
          signatory_designation: row.signatoryDesignation || DEFAULT_HOSPITAL_THEME.signatory_designation,
          signatory_bmdc: row.signatoryBmdc || DEFAULT_HOSPITAL_THEME.signatory_bmdc,
        };
        return NextResponse.json({ success: true, theme, source: "database" });
      }
    } catch {}
  }

  const mem = getThemeMemoryMap()[orgId] || {
    ...DEFAULT_HOSPITAL_THEME,
    hospital_name: auth.user.role === "hospital" ? auth.user.name : DEFAULT_HOSPITAL_THEME.hospital_name,
  };
  return NextResponse.json({ success: true, theme: mem, source: "cache" });
}

async function saveThemeHandler(req: Request) {
  const auth = await requireSessionUser(req, ["hospital", "admin"]);
  if (auth.error) return auth.error;
  const orgId = auth.user.organizationId || "org-default";

  try {
    const body = await req.json();
    const merged: HospitalThemeConfig = {
      ...DEFAULT_HOSPITAL_THEME,
      ...getThemeMemoryMap()[orgId],
      ...body,
    };
    getThemeMemoryMap()[orgId] = merged;

    if (process.env.DATABASE_URL) {
      try {
        await withDbTimeout(
          prisma.hospitalThemeProfile.upsert({
            where: { organizationId: orgId },
            update: {
              hospitalName: merged.hospital_name,
              hospitalTagline: merged.hospital_tagline || null,
              hospitalAddress: merged.hospital_address || null,
              hospitalHotline: merged.hospital_hotline || null,
              hospitalPhone: merged.hospital_phone || null,
              hospitalEmail: merged.hospital_email || null,
              licenseNo: merged.license_no || null,
              taxBin: merged.tax_bin || null,
              logoUrl: merged.logo_url || null,
              themeStyle: merged.theme_style,
              watermarkText: merged.watermark_text || null,
              watermarkOpacity: Number(merged.watermark_opacity ?? 0.08),
              watermarkEnabled: Boolean(merged.watermark_enabled),
              stampText: merged.stamp_text || null,
              stampColor: merged.stamp_color || "#059669",
              stampEnabled: Boolean(merged.stamp_enabled),
              signatoryName: merged.signatory_name || null,
              signatoryDesignation: merged.signatory_designation || null,
              signatoryBmdc: merged.signatory_bmdc || null,
            },
            create: {
              organizationId: orgId,
              hospitalName: merged.hospital_name,
              hospitalTagline: merged.hospital_tagline || null,
              hospitalAddress: merged.hospital_address || null,
              hospitalHotline: merged.hospital_hotline || null,
              hospitalPhone: merged.hospital_phone || null,
              hospitalEmail: merged.hospital_email || null,
              licenseNo: merged.license_no || null,
              taxBin: merged.tax_bin || null,
              logoUrl: merged.logo_url || null,
              themeStyle: merged.theme_style,
              watermarkText: merged.watermark_text || null,
              watermarkOpacity: Number(merged.watermark_opacity ?? 0.08),
              watermarkEnabled: Boolean(merged.watermark_enabled),
              stampText: merged.stamp_text || null,
              stampColor: merged.stamp_color || "#059669",
              stampEnabled: Boolean(merged.stamp_enabled),
              signatoryName: merged.signatory_name || null,
              signatoryDesignation: merged.signatory_designation || null,
              signatoryBmdc: merged.signatory_bmdc || null,
            },
          }),
          1500
        );
      } catch {}
    }

    return NextResponse.json({ success: true, theme: merged });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update theme." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return saveThemeHandler(req);
}

export async function PATCH(req: Request) {
  return saveThemeHandler(req);
}
