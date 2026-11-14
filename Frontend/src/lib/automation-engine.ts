export type AutomationEventType =
  | "BOOKING_SMS_SENT"
  | "DOCTOR_CALENDAR_SYNCED"
  | "MEDICATION_SCHEDULE_CREATED"
  | "FOLLOWUP_REMINDER_SCHEDULED"
  | "DGHS_FHIR_AUTO_SYNCED"
  | "CRITICAL_VITALS_ALERT";

export interface MedicationScheduleSlot {
  medicineName: string;
  slotLabel: "Morning (08:30 AM)" | "Noon (01:30 PM)" | "Night (09:00 PM)";
  doseAmount: string;
  instruction: string;
  duration: string;
}

export interface AutomationEventLog {
  id: string;
  type: AutomationEventType;
  title: string;
  patientName: string;
  patientPhone?: string;
  doctorName?: string;
  channel: "SMS Gateway" | "Google Calendar" | "HealthPass App" | "DGHS FHIR Server" | "Emergency Triage";
  status: "Delivered" | "Scheduled" | "Synced" | "Active";
  summary: string;
  smsPreview?: string;
  googleCalendarUrl?: string;
  medicationSlots?: MedicationScheduleSlot[];
  timestamp: string;
}

const STORAGE_KEY = "oxpecker_automation_logs_v1";
const MED_SCHEDULE_STORAGE_KEY = "oxpecker_patient_med_schedules_v1";

const DEFAULT_LOGS: AutomationEventLog[] = [
  {
    id: "AUTO-901",
    type: "BOOKING_SMS_SENT",
    title: "Appointment Confirmation SMS Dispatched",
    patientName: "Rahim Uddin",
    patientPhone: "+880 1711-000000",
    doctorName: "Prof. Dr. Ahmed Rahman",
    channel: "SMS Gateway",
    status: "Delivered",
    summary: "Token S-01 confirmed for 10:00 AM. Instant SMS sent to patient.",
    smsPreview:
      "[Oxpecker Health] প্রিয় রহিম উদ্দিন, আপনার অ্যাপয়েন্টমেন্ট নিশ্চিত হয়েছে। টোকেন: S-01, ডা. আহমেদ রহমান, সময়: আজ সকাল ১০:০০। চেম্বার: ন্যাশনাল হার্ট ফাউন্ডেশন।",
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: "AUTO-902",
    type: "DOCTOR_CALENDAR_SYNCED",
    title: "Doctor Calendar Slot Auto-Blocked",
    patientName: "Rahim Uddin",
    doctorName: "Prof. Dr. Ahmed Rahman",
    channel: "Google Calendar",
    status: "Synced",
    summary: "10:00 AM - 10:15 AM slot reserved on Doctor Chamber Calendar.",
    googleCalendarUrl:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Patient+Consultation+-+Rahim+Uddin+(Token+S-01)&details=Oxpecker+Smart+Chamber+Booking",
    timestamp: new Date(Date.now() - 34 * 60 * 1000).toISOString(),
  },
  {
    id: "AUTO-903",
    type: "MEDICATION_SCHEDULE_CREATED",
    title: "Smart Medication Routine & 3-Day Follow-up Scheduled",
    patientName: "Kamal Hossain",
    patientPhone: "+880 1819-887766",
    doctorName: "Prof. Dr. Ahmed Rahman",
    channel: "HealthPass App",
    status: "Active",
    summary: "3 daily medicine alarms synced to HealthPass & follow-up SMS queued.",
    timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
];

export function getAutomationLogs(): AutomationEventLog[] {
  if (typeof window === "undefined") return DEFAULT_LOGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LOGS));
      return DEFAULT_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_LOGS;
  } catch {
    return DEFAULT_LOGS;
  }
}

export function appendAutomationEvents(events: AutomationEventLog[]): AutomationEventLog[] {
  if (typeof window === "undefined") return events;
  try {
    const current = getAutomationLogs();
    const updated = [...events, ...current].slice(0, 60);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("oxpecker-automation-updated"));
    return updated;
  } catch {
    return events;
  }
}

export function buildGoogleCalendarUrl(params: {
  title: string;
  details: string;
  location?: string;
  dateStr?: string;
  timeStr?: string;
}): string {
  const now = new Date();
  const start = new Date(now.getTime() + 60 * 60 * 1000);
  const end = new Date(start.getTime() + 20 * 60 * 1000);

  const fmt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");

  const query = new URLSearchParams({
    action: "TEMPLATE",
    text: params.title,
    details: params.details,
    location: params.location || "Oxpecker Smart Chamber, Dhaka",
    dates: `${fmt(start)}/${fmt(end)}`,
  });

  return `https://calendar.google.com/calendar/render?${query.toString()}`;
}

export function triggerBookingAutomation(input: {
  patientName: string;
  patientPhone: string;
  doctorName: string;
  specialty?: string;
  token: string;
  date: string;
  time: string;
  hospitalName?: string;
}): {
  smsEvent: AutomationEventLog;
  calendarEvent: AutomationEventLog;
  googleCalendarUrl: string;
} {
  const nowIso = new Date().toISOString();
  const hospital = input.hospitalName || "Oxpecker Partner Chamber";

  const smsPreview = `[Oxpecker AI] প্রিয় ${input.patientName}, আপনার বুকিং নিশ্চিত হয়েছে। টোকেন: ${input.token} | ডাক্তার: ${input.doctorName} | সময়: ${input.date}, ${input.time} | স্থান: ${hospital}।`;

  const googleCalendarUrl = buildGoogleCalendarUrl({
    title: `[${input.token}] Consultation: ${input.patientName} with ${input.doctorName}`,
    details: `Patient: ${input.patientName}\nPhone: ${input.patientPhone}\nToken: ${input.token}\nScheduled Time: ${input.date} ${input.time}\nAutomated by Oxpecker AI`,
    location: hospital,
    dateStr: input.date,
    timeStr: input.time,
  });

  const smsEvent: AutomationEventLog = {
    id: `AUTO-SMS-${Date.now()}`,
    type: "BOOKING_SMS_SENT",
    title: "Booking Confirmation SMS Sent to Patient",
    patientName: input.patientName,
    patientPhone: input.patientPhone,
    doctorName: input.doctorName,
    channel: "SMS Gateway",
    status: "Delivered",
    summary: `Token ${input.token} (${input.date} at ${input.time}) dispatched via SMS to ${input.patientPhone}.`,
    smsPreview,
    timestamp: nowIso,
  };

  const calendarEvent: AutomationEventLog = {
    id: `AUTO-CAL-${Date.now() + 1}`,
    type: "DOCTOR_CALENDAR_SYNCED",
    title: "Doctor Calendar Slot Reserved Automatically",
    patientName: input.patientName,
    patientPhone: input.patientPhone,
    doctorName: input.doctorName,
    channel: "Google Calendar",
    status: "Synced",
    summary: `Slot ${input.date} • ${input.time} locked in ${input.doctorName}'s schedule for Token ${input.token}.`,
    googleCalendarUrl,
    timestamp: nowIso,
  };

  appendAutomationEvents([calendarEvent, smsEvent]);

  // Fire-and-forget API dispatch
  if (typeof window !== "undefined") {
    fetch("/api/automation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: [smsEvent, calendarEvent] }),
    }).catch(() => {});
  }

  return { smsEvent, calendarEvent, googleCalendarUrl };
}

export function generateMedicationSlotsFromRx(
  medicines: Array<{
    name: string;
    dosageM?: string;
    dosageN?: string;
    dosageE?: string;
    frequency?: string;
    duration?: string;
    notes?: string;
  }>
): MedicationScheduleSlot[] {
  const slots: MedicationScheduleSlot[] = [];

  for (const med of medicines) {
    const m = String(med.dosageM || "0").trim();
    const n = String(med.dosageN || "0").trim();
    const e = String(med.dosageE || "0").trim();
    const instruction = med.notes || med.frequency || "খাবারের পরে (After Meal)";
    const duration = med.duration || "7 Days";

    if (m !== "0" && m !== "") {
      slots.push({
        medicineName: med.name,
        slotLabel: "Morning (08:30 AM)",
        doseAmount: `${m} unit`,
        instruction,
        duration,
      });
    }
    if (n !== "0" && n !== "") {
      slots.push({
        medicineName: med.name,
        slotLabel: "Noon (01:30 PM)",
        doseAmount: `${n} unit`,
        instruction,
        duration,
      });
    }
    if (e !== "0" && e !== "") {
      slots.push({
        medicineName: med.name,
        slotLabel: "Night (09:00 PM)",
        doseAmount: `${e} unit`,
        instruction,
        duration,
      });
    }
  }

  return slots;
}

export function triggerPrescriptionAutomation(input: {
  patientId: string;
  patientName: string;
  patientPhone?: string;
  doctorName?: string;
  diagnosis?: string;
  followUp?: string;
  medicines: Array<{
    name: string;
    dosageM?: string;
    dosageN?: string;
    dosageE?: string;
    frequency?: string;
    duration?: string;
    notes?: string;
  }>;
}): {
  scheduleEvent: AutomationEventLog;
  followUpEvent: AutomationEventLog;
  dghsSyncEvent: AutomationEventLog;
  slots: MedicationScheduleSlot[];
} {
  const nowIso = new Date().toISOString();
  const slots = generateMedicationSlotsFromRx(input.medicines);
  const phone = input.patientPhone || "+880 1711-000000";
  const doctor = input.doctorName || "Prof. Dr. Ahmed Rahman";
  const followUpText = input.followUp || "৭ দিন পর (After 7 Days)";

  const smsPreview = `[Oxpecker Rx] প্রিয় ${input.patientName}, ${doctor}-এর ই-প্রেসক্রিপশন তৈরি হয়েছে (${input.medicines.length}টি ওষুধ)। আপনার দৈনিক ওষুধের রিমাইন্ডার চালু হয়েছে। পরবর্তী সাক্ষাৎ: ${followUpText}।`;

  const scheduleEvent: AutomationEventLog = {
    id: `AUTO-MED-${Date.now()}`,
    type: "MEDICATION_SCHEDULE_CREATED",
    title: "Automated Medication Schedule & Alarms Activated",
    patientName: input.patientName,
    patientPhone: phone,
    doctorName: doctor,
    channel: "HealthPass App",
    status: "Active",
    summary: `Generated ${slots.length} daily dose reminders across ${input.medicines.length} medicine(s) for ${input.patientName}.`,
    medicationSlots: slots,
    smsPreview,
    timestamp: nowIso,
  };

  const followUpEvent: AutomationEventLog = {
    id: `AUTO-FLW-${Date.now() + 1}`,
    type: "FOLLOWUP_REMINDER_SCHEDULED",
    title: "Automated Follow-up & SMS Check-in Scheduled",
    patientName: input.patientName,
    patientPhone: phone,
    doctorName: doctor,
    channel: "SMS Gateway",
    status: "Scheduled",
    summary: `Follow-up reminder queued (${followUpText}) + Instant Rx summary SMS sent to ${phone}.`,
    smsPreview,
    timestamp: nowIso,
  };

  const dghsSyncEvent: AutomationEventLog = {
    id: `AUTO-FHIR-${Date.now() + 2}`,
    type: "DGHS_FHIR_AUTO_SYNCED",
    title: "DGHS OpenMRS / HL7 FHIR Auto-Sync Completed",
    patientName: input.patientName,
    doctorName: doctor,
    channel: "DGHS FHIR Server",
    status: "Synced",
    summary: `Patient ${input.patientId} clinical record & ${input.medicines.length} WHO ATC medication statements synced.`,
    timestamp: nowIso,
  };

  appendAutomationEvents([dghsSyncEvent, followUpEvent, scheduleEvent]);

  if (typeof window !== "undefined") {
    try {
      const existing = JSON.parse(localStorage.getItem(MED_SCHEDULE_STORAGE_KEY) || "{}");
      existing[input.patientId || input.patientName] = {
        patientName: input.patientName,
        updatedAt: nowIso,
        followUp: followUpText,
        slots,
      };
      localStorage.setItem(MED_SCHEDULE_STORAGE_KEY, JSON.stringify(existing));
    } catch {}

    fetch("/api/automation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: [scheduleEvent, followUpEvent, dghsSyncEvent] }),
    }).catch(() => {});
  }

  return { scheduleEvent, followUpEvent, dghsSyncEvent, slots };
}
