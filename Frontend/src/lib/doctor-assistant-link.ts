export interface AssistantPermissions {
  apt: boolean;
  queue: boolean;
  walkin: boolean;
  pay: boolean;
  notif?: boolean;
  cal?: boolean;
  sched?: boolean;
  checkin?: boolean;
  report?: boolean;
  analytics?: boolean;
  presc: boolean;
  medrec: boolean;
}

export interface DoctorAssistantInvite {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  doctorConnectCode: string;
  assistantId: string;
  assistantEmail: string;
  assistantName?: string;
  role: string;
  permissions: AssistantPermissions;
  status: "pending" | "accepted" | "declined" | "revoked";
  createdAt: string;
  updatedAt: string;
}

export interface ConnectedAssistantSummary {
  id: string;
  inviteId: string;
  name: string;
  email: string;
  role: string;
  status: string;
  color: string;
  bg: string;
  isPending: boolean;
  permissions: AssistantPermissions;
  doctorId: string;
  doctorName: string;
}

export interface PairingNotification {
  id: string;
  targetId: string;
  targetEmail?: string;
  title: string;
  message: string;
  type: "doctor_invite" | "message";
  read: boolean;
  createdAt: string;
}

export interface PairedQueueItem {
  token: string;
  name: string;
  info: string;
  status: "Waiting" | "In Consultation" | "Completed" | "Skipped";
  payment?: string;
  paymentMethod?: string;
  time?: string;
}

interface PairingMemoryStore {
  invites: DoctorAssistantInvite[];
  notifications: PairingNotification[];
  doctorQueues: Record<string, PairedQueueItem[]>;
}

const g = globalThis as typeof globalThis & {
  __oxpeckerDoctorAssistantStore?: PairingMemoryStore;
};

function getPairingStore(): PairingMemoryStore {
  if (!g.__oxpeckerDoctorAssistantStore) {
    g.__oxpeckerDoctorAssistantStore = {
      invites: [],
      notifications: [],
      doctorQueues: {},
    };
  }
  return g.__oxpeckerDoctorAssistantStore;
}

/** Merge persistent database rows into the active in-memory pairing store. */
export function hydratePairingStore(
  invites: DoctorAssistantInvite[],
  queues?: Record<string, PairedQueueItem[]>
) {
  const store = getPairingStore();
  for (const inv of invites) {
    const idx = store.invites.findIndex((existing) => existing.id === inv.id);
    if (idx >= 0) {
      // Keep newer timestamp if memory was updated more recently
      if (inv.updatedAt >= store.invites[idx].updatedAt) {
        store.invites[idx] = inv;
      }
    } else {
      store.invites.push(inv);
    }
  }
  if (queues) {
    for (const [docId, q] of Object.entries(queues)) {
      if (Array.isArray(q) && q.length > 0 && !store.doctorQueues[docId]) {
        store.doctorQueues[docId] = q;
      }
    }
  }
}

const DEFAULT_QUEUE: PairedQueueItem[] = [
  { token: "S-01", name: "Rahim Uddin", info: "First Visit • Fever, Cough", status: "Waiting", payment: "Paid", paymentMethod: "Online (bKash)", time: "10:30 AM" },
  { token: "S-02", name: "Fatema Begum", info: "Follow Up • Headache", status: "Waiting", payment: "Pending", paymentMethod: "Cash", time: "10:45 AM" },
  { token: "S-03", name: "Karim Ali", info: "Report Showing", status: "Waiting", payment: "Paid", paymentMethod: "Online (Card)", time: "11:00 AM" },
  { token: "S-04", name: "Nasima Akter", info: "First Visit", status: "Waiting", payment: "Paid", paymentMethod: "Online (Nagad)", time: "11:15 AM" },
];

export const DEFAULT_PERMISSIONS: AssistantPermissions = {
  apt: true,
  queue: true,
  walkin: true,
  pay: true,
  notif: true,
  cal: true,
  sched: true,
  checkin: true,
  report: true,
  analytics: true,
  presc: false,
  medrec: false,
};

function deterministicDigits(seed: string, length: number): string {
  const input = (seed || "oxpecker-default-seed").trim().toLowerCase();
  let h1 = 2166136261;
  let h2 = 3735928559;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 16777619);
    h2 = Math.imul(h2 ^ (ch + i), 2246822519);
  }
  const combined =
    `${Math.abs(h1 >>> 0).toString().padStart(10, "0")}${Math.abs(h2 >>> 0).toString().padStart(10, "0")}`;
  return combined.slice(0, length);
}

/** Deterministic 12-digit numeric pairing ID for any assistant account. */
export function derive12DigitAssistantCode(seed: string): string {
  const digits = deterministicDigits(seed, 10);
  return `88${digits}`;
}

export function deriveDoctorConnectCode(seed: string): string {
  return `DOC-${deterministicDigits(`doc:${seed}`, 6)}`;
}

export function isValid12DigitCode(code?: string | null): boolean {
  return typeof code === "string" && /^\d{12}$/.test(code.trim());
}

export function createAssistantInvite(input: {
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  assistantId?: string;
  assistantEmail?: string;
  role?: string;
  permissions?: Partial<AssistantPermissions>;
}): { success: boolean; status: number; error?: string; invite?: DoctorAssistantInvite } {
  const rawCode = (input.assistantId || "").replace(/\D/g, "");
  const cleanEmail = (input.assistantEmail || "").trim().toLowerCase();

  if (rawCode && !isValid12DigitCode(rawCode)) {
    return {
      success: false,
      status: 400,
      error: "Assistant pairing code must be exactly 12 digits.",
    };
  }
  if (!rawCode && !cleanEmail) {
    return {
      success: false,
      status: 400,
      error: "Provide a 12-digit Assistant Code or Assistant Email.",
    };
  }

  const targetCode = rawCode || derive12DigitAssistantCode(cleanEmail);
  const store = getPairingStore();
  const doctorConnectCode = deriveDoctorConnectCode(input.doctorId || input.doctorEmail);
  const now = new Date().toISOString();

  // Reuse existing active/pending invite between the same doctor & assistant to avoid duplicate rows
  const existingIdx = store.invites.findIndex(
    (inv) =>
      inv.doctorId === input.doctorId &&
      inv.status !== "revoked" &&
      inv.status !== "declined" &&
      (inv.assistantId === targetCode || (cleanEmail && inv.assistantEmail === cleanEmail))
  );

  const invite: DoctorAssistantInvite = {
    id: existingIdx >= 0 ? store.invites[existingIdx].id : `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    doctorId: input.doctorId,
    doctorName: input.doctorName || "Attending Doctor",
    doctorEmail: (input.doctorEmail || "").toLowerCase(),
    doctorConnectCode,
    assistantId: targetCode,
    assistantEmail: cleanEmail || `assistant-${targetCode}@oxpecker.ai`,
    assistantName: existingIdx >= 0 ? store.invites[existingIdx].assistantName : undefined,
    role: input.role || "Front Desk / Receptionist",
    permissions: { ...DEFAULT_PERMISSIONS, ...(input.permissions || {}) },
    status: existingIdx >= 0 ? store.invites[existingIdx].status : "pending",
    createdAt: existingIdx >= 0 ? store.invites[existingIdx].createdAt : now,
    updatedAt: now,
  };

  if (existingIdx >= 0) {
    store.invites[existingIdx] = invite;
  } else {
    store.invites.unshift(invite);
  }

  if (!store.doctorQueues[input.doctorId]) {
    store.doctorQueues[input.doctorId] = [...DEFAULT_QUEUE];
  }

  return { success: true, status: 201, invite };
}

export function respondToAssistantInvite(input: {
  inviteId: string;
  assistantId?: string;
  assistantEmail?: string;
  assistantName?: string;
  status: "accepted" | "declined";
}): { success: boolean; status: number; error?: string; invite?: DoctorAssistantInvite } {
  const store = getPairingStore();
  const cleanEmail = (input.assistantEmail || "").trim().toLowerCase();
  const cleanCode = (input.assistantId || "").trim();

  const idx = store.invites.findIndex((i) => i.id === input.inviteId);
  if (idx < 0) {
    return { success: false, status: 404, error: "Invite not found." };
  }

  const invite = store.invites[idx];
  const matchesTarget =
    (cleanCode && invite.assistantId === cleanCode) ||
    (cleanEmail && invite.assistantEmail === cleanEmail) ||
    !cleanCode;

  if (!matchesTarget && !cleanEmail) {
    return { success: false, status: 403, error: "Invite does not belong to this assistant." };
  }

  invite.status = input.status;
  if (input.assistantName?.trim()) invite.assistantName = input.assistantName.trim();
  if (cleanCode && isValid12DigitCode(cleanCode)) invite.assistantId = cleanCode;
  if (cleanEmail) invite.assistantEmail = cleanEmail;
  invite.updatedAt = new Date().toISOString();

  return { success: true, status: 200, invite };
}

export function connectAssistantByDoctorCode(input: {
  assistantId?: string;
  assistantName: string;
  assistantEmail: string;
  doctorCodeOrEmail: string;
}): { success: boolean; status: number; error?: string; invite?: DoctorAssistantInvite } {
  const query = input.doctorCodeOrEmail.trim().toLowerCase();
  if (!query) {
    return { success: false, status: 400, error: "Doctor code or email is required." };
  }

  const store = getPairingStore();
  const cleanAssistantCode =
    input.assistantId && isValid12DigitCode(input.assistantId)
      ? input.assistantId
      : derive12DigitAssistantCode(input.assistantEmail || input.assistantName);

  // Match an existing doctor from invites, or derive canonical doctor record for seamless pairing
  const matchedInv = store.invites.find(
    (i) =>
      i.doctorConnectCode.toLowerCase() === query ||
      i.doctorEmail.toLowerCase() === query ||
      i.doctorId.toLowerCase() === query
  );

  const doctorId = matchedInv?.doctorId || (query.includes("@") ? `doc-${deterministicDigits(query, 6)}` : query.toUpperCase());
  const doctorName =
    matchedInv?.doctorName ||
    (query.includes("@") ? `Dr. ${query.split("@")[0].replace(/[^a-zA-Z]/g, " ")}` : `Doctor (${query.toUpperCase()})`);
  const doctorEmail = matchedInv?.doctorEmail || (query.includes("@") ? query : "doctor@oxpecker.ai");

  const now = new Date().toISOString();
  const invite: DoctorAssistantInvite = {
    id: `pair-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    doctorId,
    doctorName,
    doctorEmail,
    doctorConnectCode: matchedInv?.doctorConnectCode || (query.startsWith("doc-") ? query.toUpperCase() : deriveDoctorConnectCode(doctorId)),
    assistantId: cleanAssistantCode,
    assistantEmail: input.assistantEmail.toLowerCase(),
    assistantName: input.assistantName,
    role: "Front Desk / Receptionist",
    permissions: { ...DEFAULT_PERMISSIONS },
    status: "accepted",
    createdAt: now,
    updatedAt: now,
  };

  store.invites.unshift(invite);
  if (!store.doctorQueues[doctorId]) {
    store.doctorQueues[doctorId] = [...DEFAULT_QUEUE];
  }

  return { success: true, status: 201, invite };
}

export function revokeAssistantConnection(input: {
  doctorId?: string;
  doctorName?: string;
  assistantId: string;
}): { revokedCount: number } {
  const store = getPairingStore();
  const actorDoctorName = (input.doctorName || "Attending Doctor").trim();
  let revokedCount = 0;

  for (const inv of store.invites) {
    if (
      inv.status !== "revoked" &&
      (inv.assistantId === input.assistantId || inv.id === input.assistantId) &&
      (!input.doctorId || inv.doctorId === input.doctorId)
    ) {
      inv.status = "revoked";
      inv.updatedAt = new Date().toISOString();
      revokedCount++;

      store.notifications.unshift({
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        targetId: inv.assistantId,
        targetEmail: inv.assistantEmail,
        title: "Connection Updated",
        message: `You have been removed by ${actorDoctorName}.`,
        type: "message",
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return { revokedCount };
}

export function getDoctorAssistantsState(input: { doctorId: string; doctorEmail?: string }) {
  const store = getPairingStore();
  const cleanEmail = (input.doctorEmail || "").toLowerCase();
  const activeInvites = store.invites.filter(
    (inv) =>
      inv.status !== "revoked" &&
      inv.status !== "declined" &&
      (inv.doctorId === input.doctorId || (cleanEmail && inv.doctorEmail === cleanEmail))
  );

  const connectedAssistants: ConnectedAssistantSummary[] = activeInvites.map((inv) => ({
    id: inv.assistantId,
    inviteId: inv.id,
    name: inv.assistantName || (inv.status === "accepted" ? inv.assistantEmail.split("@")[0] : "Pending Assistant"),
    email: inv.assistantEmail,
    role: inv.role,
    status: inv.status === "accepted" ? "Connected • Online" : "Pending Invite",
    color: inv.status === "accepted" ? "text-[#22C55E]" : "text-[#F59E0B]",
    bg: inv.status === "accepted" ? "bg-[#22C55E]" : "bg-[#F59E0B]",
    isPending: inv.status !== "accepted",
    permissions: inv.permissions,
    doctorId: inv.doctorId,
    doctorName: inv.doctorName,
  }));

  const queue = store.doctorQueues[input.doctorId] || DEFAULT_QUEUE;
  return {
    doctorConnectCode: deriveDoctorConnectCode(input.doctorId || cleanEmail),
    connectedAssistants,
    queue,
  };
}

export function getAssistantPairingState(input: {
  assistantId?: string;
  assistantEmail?: string;
  userId?: string;
}) {
  const store = getPairingStore();
  const assistantCode12 =
    input.assistantId && isValid12DigitCode(input.assistantId)
      ? input.assistantId
      : derive12DigitAssistantCode(input.assistantEmail || input.userId || "assistant");
  const cleanEmail = (input.assistantEmail || "").toLowerCase();

  const matchesMe = (inv: DoctorAssistantInvite) =>
    inv.assistantId === assistantCode12 ||
    (cleanEmail && inv.assistantEmail === cleanEmail);

  const acceptedLink = store.invites.find((i) => i.status === "accepted" && matchesMe(i)) || null;
  const pendingInvites = store.invites.filter((i) => i.status === "pending" && matchesMe(i));

  const notifications = store.notifications.filter(
    (n) =>
      n.targetId === assistantCode12 ||
      (cleanEmail && n.targetEmail === cleanEmail)
  );

  const queue = acceptedLink ? store.doctorQueues[acceptedLink.doctorId] || DEFAULT_QUEUE : DEFAULT_QUEUE;

  return {
    assistantCode12,
    connectedDoctor: acceptedLink
      ? {
          doctorId: acceptedLink.doctorId,
          doctorName: acceptedLink.doctorName,
          doctorEmail: acceptedLink.doctorEmail,
          doctorConnectCode: acceptedLink.doctorConnectCode,
          permissions: acceptedLink.permissions,
        }
      : null,
    pendingInvites,
    notifications,
    queue,
  };
}

export function syncDoctorQueue(doctorId: string, queue: PairedQueueItem[]) {
  const store = getPairingStore();
  store.doctorQueues[doctorId] = queue;
  return queue;
}
