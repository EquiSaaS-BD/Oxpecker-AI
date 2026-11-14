"use client";

import { useState, useId } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  HeartPulse,
  Hospital,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserCheck,
  ExternalLink,
} from "lucide-react";

const CLINIC_DOCTORS: Record<string, Array<{ name: string; specialty: string }>> = {
  Cardiology: [
    { name: "Prof. Dr. Ahmed Rahman", specialty: "Cardiology" },
    { name: "Dr. Nusrat Jahan", specialty: "Interventional Cardiology" },
  ],
  "General Medicine": [
    { name: "Dr. Mahbubul Alam", specialty: "Internal Medicine" },
    { name: "Dr. Farhana Yasmin", specialty: "Family Medicine" },
  ],
  "Pediatrics & Child Care": [
    { name: "Dr. Tasnim Tabassum", specialty: "Pediatrics" },
  ],
  "Orthopedics & Trauma": [
    { name: "Dr. Kamrul Hasan", specialty: "Orthopedic Surgery" },
  ],
  "Gynecology & Obstetrics": [
    { name: "Dr. Sabina Yasmin", specialty: "OB/GYN" },
  ],
};

const TIME_SLOTS = [
  "09:30 AM",
  "10:30 AM",
  "11:30 AM",
  "04:00 PM",
  "05:30 PM",
  "07:00 PM",
];

function formatSlugTitle(slug: string) {
  return decodeURIComponent(slug || "oxpecker-partner-clinic")
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function calcPreviewBmi(heightStr: string, weightStr: string) {
  const h = parseFloat(heightStr);
  const w = parseFloat(weightStr);
  if (!h || !w || h <= 30 || w <= 2) return null;
  const bmi = Number((w / ((h / 100) * (h / 100))).toFixed(1));
  const category =
    bmi < 18.5
      ? "Underweight"
      : bmi < 25
        ? "Normal"
        : bmi < 30
          ? "Overweight"
          : "Obese";
  return { bmi, category };
}

export default function EmbedClinicBookingWidgetPage() {
  const params = useParams<{ clinicSlug: string }>();
  const clinicSlug = params?.clinicSlug || "oxpecker-flagship-hospital";
  const clinicDisplayName = formatSlugTitle(clinicSlug);
  const headingId = useId();

  const [department, setDepartment] = useState("Cardiology");
  const [doctorName, setDoctorName] = useState(CLINIC_DOCTORS["Cardiology"][0].name);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [timeSlot, setTimeSlot] = useState("10:30 AM");

  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [bloodGroup, setBloodGroup] = useState("A+");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<{
    token: string;
    mrn: string;
    syncLogId: string;
    matchedExisting: boolean;
    matchStrategy: string;
  } | null>(null);

  const bmiPreview = calcPreviewBmi(heightCm, weightKg);
  const departmentDoctors = CLINIC_DOCTORS[department] || CLINIC_DOCTORS["General Medicine"];

  const handleDepartmentChange = (nextDept: string) => {
    setDepartment(nextDept);
    const list = CLINIC_DOCTORS[nextDept] || [];
    if (list.length > 0) setDoctorName(list[0].name);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!patientName.trim() || !phone.trim()) {
      setErrorMsg("Please enter the patient's full name and mobile number.");
      return;
    }

    setSubmitting(true);
    try {
      const idempotencyKey = `widget-${clinicSlug}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const res = await fetch("/api/integrations/v1/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          channel: "widget",
          clinicSlug,
          hospitalName: clinicDisplayName,
          patient: {
            name: patientName.trim(),
            phone: phone.trim(),
            age: age ? parseInt(age, 10) || undefined : undefined,
            gender,
            bloodGroup,
            heightCm: heightCm ? parseFloat(heightCm) || undefined : undefined,
            weightKg: weightKg ? parseFloat(weightKg) || undefined : undefined,
          },
          appointment: {
            doctorName,
            specialty: department,
            hospitalName: clinicDisplayName,
            date,
            time: timeSlot,
            type: "in_person",
            source: "widget",
            status: "confirmed",
            notes: chiefComplaint.trim() || `Website widget booking (${department})`,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        setErrorMsg(data?.error || "Unable to complete booking right now. Please try again.");
        return;
      }

      const tokenSuffix = String(data.syncLogId || Date.now()).slice(-6).toUpperCase();
      setBookingResult({
        token: `OXP-${tokenSuffix}`,
        mrn: data.mrn || "HP-2026-UNIFIED",
        syncLogId: data.syncLogId || idempotencyKey,
        matchedExisting: Boolean(data.matchedExisting),
        matchStrategy: data.matchStrategy || "created_new",
      });
    } catch {
      setErrorMsg("Network interruption while syncing with Oxpecker Data Hub.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setBookingResult(null);
    setChiefComplaint("");
    setErrorMsg(null);
  };

  return (
    <main className="min-h-screen bg-slate-50 py-6 px-3 sm:px-6 flex items-start justify-center">
      <section
        aria-labelledby={headingId}
        className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden"
      >
        {/* Header */}
        <header className="bg-slate-900 text-white px-5 py-4 sm:px-6 sm:py-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0">
              <Hospital className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
                1-Click Oxpecker Booking Widget
              </p>
              <h1 id={headingId} className="text-lg sm:text-xl font-black tracking-tight">
                {clinicDisplayName}
              </h1>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Live MPI Sync
          </span>
        </header>

        <div className="p-5 sm:p-6">
          {bookingResult ? (
            <div
              role="status"
              aria-live="polite"
              className="space-y-5 py-2"
            >
              <div className="flex items-start gap-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Appointment Confirmed & Synced to Patient 360°
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Booked with <strong>{doctorName}</strong> ({department}) on{" "}
                    <strong>{date}</strong> at <strong>{timeSlot}</strong>.
                  </p>
                </div>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Booking Token
                  </dt>
                  <dd className="text-lg font-mono font-black text-slate-900 mt-1">
                    {bookingResult.token}
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Unified HealthPass MRN
                  </dt>
                  <dd className="text-sm font-mono font-bold text-teal-700 mt-1.5">
                    {bookingResult.mrn}
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    MPI Resolution
                  </dt>
                  <dd className="text-xs font-bold text-slate-800 mt-1.5 inline-flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-teal-600" />
                    {bookingResult.matchedExisting
                      ? `Merged (${bookingResult.matchStrategy})`
                      : "New Unified Record"}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Book Another Appointment
                </button>
                <Link
                  href={`/patient/profile?mrn=${encodeURIComponent(bookingResult.mrn)}`}
                  target="_top"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-colors"
                >
                  Open Patient 360° Vault
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form
              method="POST"
              onSubmit={handleSubmit}
              aria-labelledby={headingId}
              className="space-y-5"
            >
              {errorMsg && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800"
                >
                  {errorMsg}
                </div>
              )}

              {/* Consultation Selection */}
              <fieldset className="space-y-3.5 border-b border-slate-100 pb-5">
                <legend className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                  1. Department, Doctor & Schedule
                </legend>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label
                      htmlFor="embed-dept"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Department <span aria-hidden="true" className="text-rose-600">*</span>
                    </label>
                    <select
                      id="embed-dept"
                      name="department"
                      required
                      value={department}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {Object.keys(CLINIC_DOCTORS).map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="embed-doctor"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Consultant Physician <span aria-hidden="true" className="text-rose-600">*</span>
                    </label>
                    <select
                      id="embed-doctor"
                      name="doctorName"
                      required
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {departmentDoctors.map((doc) => (
                        <option key={doc.name} value={doc.name}>
                          {doc.name} ({doc.specialty})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label
                      htmlFor="embed-date"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                        Preferred Date <span aria-hidden="true" className="text-rose-600">*</span>
                      </span>
                    </label>
                    <input
                      id="embed-date"
                      name="date"
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="embed-slot"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Time Slot <span aria-hidden="true" className="text-rose-600">*</span>
                      </span>
                    </label>
                    <select
                      id="embed-slot"
                      name="timeSlot"
                      required
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </fieldset>

              {/* Patient Demographics & Biometrics */}
              <fieldset className="space-y-3.5">
                <legend className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
                  <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
                  2. Patient Details & Biometrics (Auto-Linked via MPI)
                </legend>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label
                      htmlFor="embed-name"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Patient Full Name <span aria-hidden="true" className="text-rose-600">*</span>
                    </label>
                    <input
                      id="embed-name"
                      name="patientName"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="e.g., Rahim Uddin"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="embed-phone"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Mobile Number <span aria-hidden="true" className="text-rose-600">*</span>
                    </label>
                    <input
                      id="embed-phone"
                      name="phone"
                      type="tel"
                      required
                      inputMode="tel"
                      autoComplete="tel"
                      aria-describedby="embed-phone-help"
                      placeholder="+880 1711-000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <span id="embed-phone-help" className="text-[11px] text-slate-500 mt-0.5 block">
                      Matches your existing Oxpecker HealthPass automatically.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label htmlFor="embed-age" className="block text-xs font-bold text-slate-700 mb-1">
                      Age (yrs)
                    </label>
                    <input
                      id="embed-age"
                      name="age"
                      type="text"
                      inputMode="numeric"
                      placeholder="38"
                      value={age}
                      onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="embed-gender" className="block text-xs font-bold text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      id="embed-gender"
                      name="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full min-h-[44px] px-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="embed-blood" className="block text-xs font-bold text-slate-700 mb-1">
                      Blood Group
                    </label>
                    <select
                      id="embed-blood"
                      name="bloodGroup"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full min-h-[44px] px-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="embed-height" className="block text-xs font-bold text-slate-700 mb-1">
                      Height (cm)
                    </label>
                    <input
                      id="embed-height"
                      name="heightCm"
                      type="text"
                      inputMode="decimal"
                      placeholder="170"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="embed-weight" className="block text-xs font-bold text-slate-700 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      id="embed-weight"
                      name="weightKg"
                      type="text"
                      inputMode="decimal"
                      placeholder="70"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {bmiPreview && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800">
                    <Sparkles className="w-3.5 h-3.5" />
                    Calculated BMI: {bmiPreview.bmi} kg/m² ({bmiPreview.category})
                  </div>
                )}

                <div>
                  <label
                    htmlFor="embed-complaint"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Chief Complaint / Reason for Visit
                  </label>
                  <textarea
                    id="embed-complaint"
                    name="chiefComplaint"
                    rows={2}
                    placeholder="Optional symptoms, follow-up notes, or preferred investigation..."
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </fieldset>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-[11px] text-slate-500">
                  Powered by <strong>Oxpecker AI Healthcare Data Hub</strong> • HL7 FHIR R4 Ready
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-black shadow-xs transition-colors cursor-pointer"
                >
                  {submitting ? "Confirming & Syncing..." : "Confirm Appointment"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
