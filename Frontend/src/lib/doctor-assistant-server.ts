import { prisma, withDbTimeout } from "@/lib/prisma";
import {
  DEFAULT_PERMISSIONS,
  hydratePairingStore,
  type AssistantPermissions,
  type DoctorAssistantInvite,
  type PairedQueueItem,
} from "@/lib/doctor-assistant-link";

/**
 * Hydrate in-memory pairing cache from PostgreSQL DoctorAssistantLink records.
 * Safely falls back to in-memory cache if DATABASE_URL is absent or unreachable.
 */
export async function hydratePairingStoreFromDb(): Promise<void> {
  if (!process.env.DATABASE_URL) return;

  try {
    const rows = await withDbTimeout(
      prisma.doctorAssistantLink.findMany({
        orderBy: { updatedAt: "desc" },
        take: 250,
      }),
      1200
    );

    if (!Array.isArray(rows) || rows.length === 0) return;

    const invites: DoctorAssistantInvite[] = rows.map((row) => ({
      id: row.id,
      doctorId: row.doctorId,
      doctorName: row.doctorName,
      doctorEmail: row.doctorEmail,
      doctorConnectCode: row.doctorConnectCode,
      assistantId: row.assistantId,
      assistantEmail: row.assistantEmail,
      assistantName: row.assistantName || undefined,
      role: row.role,
      permissions: {
        ...DEFAULT_PERMISSIONS,
        ...((row.permissions as Partial<AssistantPermissions>) || {}),
      },
      status: (row.status as DoctorAssistantInvite["status"]) || "pending",
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));

    const queues: Record<string, PairedQueueItem[]> = {};
    for (const row of rows) {
      if (Array.isArray(row.queueSnapshot) && row.queueSnapshot.length > 0 && !queues[row.doctorId]) {
        queues[row.doctorId] = row.queueSnapshot as unknown as PairedQueueItem[];
      }
    }

    hydratePairingStore(invites, queues);
  } catch {
    // Graceful fallback to active in-memory pairing store
  }
}

/**
 * Persist a Doctor <-> Assistant invite or accepted pairing link to PostgreSQL.
 */
export async function persistInviteToDb(
  invite: DoctorAssistantInvite,
  organizationId = "org-default"
): Promise<void> {
  if (!process.env.DATABASE_URL) return;

  try {
    await withDbTimeout(
      prisma.doctorAssistantLink.upsert({
        where: { id: invite.id },
        update: {
          doctorName: invite.doctorName,
          doctorEmail: invite.doctorEmail,
          doctorConnectCode: invite.doctorConnectCode,
          assistantId: invite.assistantId,
          assistantEmail: invite.assistantEmail,
          assistantName: invite.assistantName || null,
          role: invite.role,
          permissions: invite.permissions as any,
          status: invite.status,
        },
        create: {
          id: invite.id,
          organizationId,
          doctorId: invite.doctorId,
          doctorName: invite.doctorName,
          doctorEmail: invite.doctorEmail,
          doctorConnectCode: invite.doctorConnectCode,
          assistantId: invite.assistantId,
          assistantEmail: invite.assistantEmail,
          assistantName: invite.assistantName || null,
          role: invite.role,
          permissions: invite.permissions as any,
          status: invite.status,
        },
      }),
      1200
    );
  } catch {
    // Graceful fallback
  }
}

/**
 * Persist updated patient queue snapshot on all active links for a doctor.
 */
export async function persistDoctorQueueToDb(
  doctorId: string,
  queue: PairedQueueItem[]
): Promise<void> {
  if (!process.env.DATABASE_URL) return;

  try {
    await withDbTimeout(
      prisma.doctorAssistantLink.updateMany({
        where: { doctorId, status: { not: "revoked" } },
        data: { queueSnapshot: queue as any },
      }),
      1200
    );
  } catch {
    // Graceful fallback
  }
}

/**
 * Mark matching Doctor <-> Assistant links as revoked in PostgreSQL.
 */
export async function persistRevokeToDb(
  assistantId: string,
  doctorId?: string
): Promise<void> {
  if (!process.env.DATABASE_URL) return;

  try {
    await withDbTimeout(
      prisma.doctorAssistantLink.updateMany({
        where: {
          status: { not: "revoked" },
          ...(doctorId ? { doctorId } : {}),
          OR: [{ assistantId }, { id: assistantId }],
        },
        data: { status: "revoked" },
      }),
      1200
    );
  } catch {
    // Graceful fallback
  }
}
