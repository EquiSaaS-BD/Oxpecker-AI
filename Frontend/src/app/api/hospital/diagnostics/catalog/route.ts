import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/prisma";
import {
  getDiagnosticCatalog,
  saveDiagnosticCatalogItem,
  type DiagnosticDepartment,
  type DiagnosticTestItem,
} from "@/lib/hospital-diagnostics";
import { requireSessionUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireSessionUser(req, ["hospital", "doctor", "assistant", "admin"]);
  if (auth.error) return auth.error;
  const orgWhere = auth.user.role === "admin" ? {} : { organizationId: auth.user.organizationId };

  if (process.env.DATABASE_URL) {
    try {
      const rows = await withDbTimeout(
        prisma.diagnosticTestCatalog.findMany({ where: orgWhere, orderBy: { department: "asc" } }),
        1200
      );
      if (rows.length > 0) {
        const items: DiagnosticTestItem[] = rows.map((r) => ({
          id: r.id,
          code: r.code,
          name: r.name,
          department: (r.department as DiagnosticDepartment) || "Pathology",
          specimen: r.specimen,
          referenceRange: r.referenceRange || "",
          unit: r.unit || "",
          price: r.price,
          tatHours: r.tatHours,
          isPackage: r.isPackage,
          packageItems: Array.isArray(r.packageItems) ? (r.packageItems as string[]) : undefined,
          isActive: r.isActive,
        }));
        return NextResponse.json({ success: true, catalog: items, source: "database" });
      }
    } catch {}
  }

  return NextResponse.json({ success: true, catalog: getDiagnosticCatalog(), source: "resilient_cache" });
}

async function upsertCatalogHandler(req: Request) {
  const auth = await requireSessionUser(req, ["hospital", "admin"]);
  if (auth.error) return auth.error;
  const orgId = auth.user.organizationId || "org-default";

  try {
    const body = await req.json();
    const item: DiagnosticTestItem = {
      id: String(body.id || `cat-${Date.now()}`),
      code: String(body.code || `TST-${Date.now().toString().slice(-4)}`).toUpperCase(),
      name: String(body.name || "").trim(),
      department: (body.department as DiagnosticDepartment) || "Pathology",
      specimen: String(body.specimen || "Venous Serum"),
      referenceRange: String(body.referenceRange || "Lab Reference Specific"),
      unit: String(body.unit || ""),
      price: Number(body.price || 500),
      tatHours: Number(body.tatHours || 6),
      isPackage: Boolean(body.isPackage),
      packageItems: Array.isArray(body.packageItems) ? body.packageItems : undefined,
      isActive: body.isActive !== false,
    };

    if (!item.name) {
      return NextResponse.json({ error: "Test name is required." }, { status: 400 });
    }

    const updatedList = saveDiagnosticCatalogItem(item);

    if (process.env.DATABASE_URL) {
      try {
        await withDbTimeout(
          prisma.diagnosticTestCatalog.upsert({
            where: { id: item.id },
            update: {
              code: item.code,
              name: item.name,
              department: item.department,
              specimen: item.specimen,
              referenceRange: item.referenceRange,
              unit: item.unit,
              price: item.price,
              tatHours: item.tatHours,
              isPackage: Boolean(item.isPackage),
              packageItems: item.packageItems as any,
              isActive: item.isActive,
            },
            create: {
              id: item.id,
              organizationId: orgId,
              code: item.code,
              name: item.name,
              department: item.department,
              specimen: item.specimen,
              referenceRange: item.referenceRange,
              unit: item.unit,
              price: item.price,
              tatHours: item.tatHours,
              isPackage: Boolean(item.isPackage),
              packageItems: item.packageItems as any,
              isActive: item.isActive,
            },
          }),
          1200
        );
      } catch {}
    }

    return NextResponse.json({ success: true, item, catalog: updatedList }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save test catalog item." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return upsertCatalogHandler(req);
}

export async function PATCH(req: Request) {
  return upsertCatalogHandler(req);
}

export async function DELETE(req: Request) {
  const auth = await requireSessionUser(req, ["hospital", "admin"]);
  if (auth.error) return auth.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const catalog = getDiagnosticCatalog();
  const target = catalog.find((t) => t.id === id);
  if (target) {
    saveDiagnosticCatalogItem({ ...target, isActive: false });
  }

  if (process.env.DATABASE_URL) {
    try {
      await withDbTimeout(
        prisma.diagnosticTestCatalog.update({ where: { id }, data: { isActive: false } }),
        1200
      );
    } catch {}
  }

  return NextResponse.json({ success: true });
}
