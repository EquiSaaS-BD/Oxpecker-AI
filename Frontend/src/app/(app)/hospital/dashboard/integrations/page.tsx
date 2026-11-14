"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import {
  Activity,
  Building2,
  CheckCircle2,
  Code2,
  Copy,
  Database,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Globe,
  KeyRound,
  Layers,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";

type HubTab = "import" | "widget" | "logs";

interface OrgConfig {
  organizationId: string;
  slug: string;
  name: string;
  licenseTier: string;
  licenseKey?: string;
  dghsFacilityCode: string;
  webhookUrl?: string;
}

interface TenantKeyRecord {
  id: string;
  label: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  isActive: boolean;
  createdAt: string;
}

interface SyncLogRecord {
  id: string;
  direction: string;
  channel: string;
  entityType: string;
  externalRefId?: string | null;
  idempotencyKey?: string | null;
  status: string;
  recordsProcessed: number;
  createdAt: string;
}

interface ImportSummary {
  importedCount: number;
  mergedExistingCount: number;
  newlyCreatedCount: number;
  prescriptionsCreated: number;
  reportsCreated: number;
  appointmentsCreated: number;
  samplePatients: Array<{
    name: string;
    mrn: string;
    phone?: string;
    heightCm?: number | null;
    weightKg?: number | null;
    matchStrategy?: string;
  }>;
}

const SAMPLE_CLINIC_CSV = `name,phone,nid_number,age,gender,blood_group,height_cm,weight_kg,hospital_name,doctor_name,specialty,visit_date,diagnosis,medicines,lab_test,lab_result,bp,spo2,blood_glucose
Rahim Uddin,+8801711000000,1988269123456,38,Male,A+,170,70,City Care Specialized Clinic,Prof. Dr. Ahmed Rahman,Cardiology,2026-11-10,Essential Hypertension & Prediabetes,Amlodipine 5mg;Metformin 500mg,HbA1c & Lipid Panel,HbA1c 6.4% | LDL 128 mg/dL,132/84 mmHg,98%,118 mg/dL
Nusrat Jahan,+8801812345678,1994269887766,32,Female,B+,161,58,Popular Diagnostic & Consultation Center,Dr. Farhana Yasmin,Gynecology,2026-11-11,Iron Deficiency Anemia,Ferrous Sulfate 200mg;Folic Acid 5mg,CBC & Serum Ferritin,Hb 10.2 g/dL | Ferritin 11 ng/mL,114/74 mmHg,99%,94 mg/dL
Tanvir Hasan Chowdhury,+8801911223344,1982269554433,44,Male,O+,174,82,Square Hospital Dhaka,Dr. Mahbubul Alam,Internal Medicine,2026-11-11,Dyslipidemia & Fatty Liver Grade I,Atorvastatin 10mg;Ursodeoxycholic Acid 300mg,LFT & Ultrasound Abdomen,SGPT 68 U/L | Mild Steatosis,128/82 mmHg,97%,106 mg/dL
Farzana Akter,+8801615998877,1997269332211,29,Female,AB+,158,54,Labaid Specialized Clinic Dhanmondi,Dr. Sabina Yasmin,Endocrinology,2026-11-12,Subclinical Hypothyroidism,Levothyroxine 50mcg,Serum TSH & FT4,TSH 7.4 mIU/L | FT4 Normal,110/70 mmHg,99%,89 mg/dL
Kamrul Islam,+8801511776655,1975269441122,51,Male,A+,168,76,Ibn Sina Diagnostic Uttara,Dr. Kamrul Hasan,Orthopedics,2026-11-12,Lumbar Spondylosis L4-L5,Naproxen 500mg;Esomeprazole 20mg;Pregabalin 75mg,X-Ray Lumbosacral Spine,Mild disc space narrowing L4-L5,134/86 mmHg,98%,112 mg/dL
Meherun Nesa,+8801722665544,1968269990011,58,Female,O-,155,66,Evercare Heart & Care Hub,Prof. Dr. Ahmed Rahman,Cardiology,2026-11-13,Type 2 DM with Mild CAD Risk,Sitagliptin 50mg;Clopidogrel 75mg;Rosuvastatin 10mg,ECG & Fasting Blood Sugar,Normal Sinus Rhythm | FBS 7.8 mmol/L,138/88 mmHg,97%,146 mg/dL
Sajidul Haque,+8801833445566,2001269771122,25,Male,B-,178,68,Dhaka Medical Outreach Clinic,Dr. Tasnim Tabassum,General Medicine,2026-11-13,Acute Viral Pharyngitis,Paracetamol 500mg;Azithromycin 500mg,CBC & CRP Quantitative,CRP 14 mg/L | WBC 9.8K,118/76 mmHg,99%,92 mg/dL
Tahmina Sultana,+8801922887744,1990269665544,36,Female,A-,163,61,United Hospital Mirpur Satellite,Dr. Nusrat Jahan,Pulmonology,2026-11-14,Allergic Bronchial Asthma,Montelukast 10mg;Salmeterol-Fluticasone Inhaler,Spirometry PFT,FEV1 81% predicted | Reversible,120/78 mmHg,98%,96 mg/dL`;

export default function HospitalIntegrationsHubPage() {
  const formHeadingId = useId();
  const keyFormHeadingId = useId();

  const [activeTab, setActiveTab] = useState<HubTab>("import");
  const [loading, setLoading] = useState(true);

  const [orgConfig, setOrgConfig] = useState<OrgConfig>({
    organizationId: "org-default",
    slug: "oxpecker-flagship-hospital",
    name: "Oxpecker Flagship Medical Center",
    licenseTier: "HOSPITAL_PRO",
    dghsFacilityCode: "DGHS-HFR-10004218",
    webhookUrl: "",
  });
  const [dghsCodeDraft, setDghsCodeDraft] = useState("DGHS-HFR-10004218");
  const [clinicNameDraft, setClinicNameDraft] = useState("Oxpecker Flagship Medical Center");
  const [savingConfig, setSavingConfig] = useState(false);

  const [keys, setKeys] = useState<TenantKeyRecord[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLogRecord[]>([]);
  const [snippets, setSnippets] = useState({ widgetEmbedHtml: "", curlSync: "" });

  // Importer state
  const [csvText, setCsvText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);

  // Key generator state
  const [keyLabel, setKeyLabel] = useState("Clinic Website & HMS Connector");
  const [creatingKey, setCreatingKey] = useState(false);
  const [freshRawKey, setFreshRawKey] = useState<string | null>(null);

  const fetchHubState = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/integrations/keys", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.organizationConfig) {
          setOrgConfig(data.organizationConfig);
          setDghsCodeDraft(data.organizationConfig.dghsFacilityCode || "DGHS-HFR-10004218");
          setClinicNameDraft(data.organizationConfig.name || "Oxpecker Flagship Medical Center");
        }
        setKeys(Array.isArray(data.keys) ? data.keys : []);
        setSyncLogs(Array.isArray(data.syncLogs) ? data.syncLogs : []);
        if (data.snippets) {
          setSnippets(data.snippets);
        }
      }
    } catch {
      toast.error("Failed to load Clinic Data Hub state.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHubState();
  }, [fetchHubState]);

  const handleSaveOrgConfig = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await fetch("/api/integrations/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_config",
          name: clinicNameDraft.trim() || orgConfig.name,
          dghsFacilityCode: dghsCodeDraft.trim(),
          licenseTier: orgConfig.licenseTier,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Could not update facility settings.");
        return;
      }
      setOrgConfig(data.organizationConfig);
      toast.success("DGHS HFR facility compliance metadata saved.");
    } catch {
      toast.error("Network error saving configuration.");
    } finally {
      setSavingConfig(false);
    }
  };

  const runBulkImport = async (rawCsvOrJson: string, isSample = false) => {
    const trimmed = rawCsvOrJson.trim();
    if (!trimmed) {
      toast.error("Paste CSV/JSON data or upload a clinic export file first.");
      return;
    }

    setImporting(true);
    try {
      let bodyPayload: Record<string, any>;
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          bodyPayload = {
            format: "json",
            rows: parsed,
            defaultHospitalName: orgConfig.name,
          };
        } else if (parsed.resourceType === "Bundle") {
          bodyPayload = {
            format: "fhir",
            fhirBundle: parsed,
            defaultHospitalName: orgConfig.name,
          };
        } else {
          bodyPayload = {
            format: "json",
            rows: Array.isArray(parsed.rows) ? parsed.rows : [parsed],
            defaultHospitalName: orgConfig.name,
          };
        }
      } else {
        bodyPayload = {
          format: "csv",
          csvText: trimmed,
          defaultHospitalName: orgConfig.name,
        };
      }

      const res = await fetch("/api/integrations/v1/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Bulk import failed.");
        return;
      }

      setImportSummary(data);
      toast.success(
        isSample
          ? `1-Click Sync Complete: ${data.importedCount} clinic records unified via MPI!`
          : `Imported ${data.importedCount} records (${data.mergedExistingCount} merged, ${data.newlyCreatedCount} new).`
      );
      await fetchHubState();
    } catch {
      toast.error("Invalid CSV or JSON syntax. Check formatting and retry.");
    } finally {
      setImporting(false);
    }
  };

  const handleLoadAndSyncSample = async () => {
    setCsvText(SAMPLE_CLINIC_CSV);
    await runBulkImport(SAMPLE_CLINIC_CSV, true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || "");
      setCsvText(content);
      toast.success(`Loaded ${file.name}. Click "Run 1-Click MPI Sync" to import.`);
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleCsv = () => {
    const blob = new Blob([SAMPLE_CLINIC_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "oxpecker-clinic-migration-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateApiKey = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreatingKey(true);
    try {
      const res = await fetch("/api/integrations/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_key",
          label: keyLabel.trim() || "Hospital Website Connector",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to generate API key.");
        return;
      }
      setFreshRawKey(data.rawKey);
      toast.success("New Tenant API Key minted! Copy and store it securely.");
      await fetchHubState();
    } catch {
      toast.error("Network error generating API key.");
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      const res = await fetch(`/api/integrations/keys?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("API Key revoked.");
        await fetchHubState();
      }
    } catch {
      toast.error("Unable to revoke key.");
    }
  };

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard.`);
    } catch {
      toast.error("Clipboard access denied.");
    }
  };

  const tabItems: Array<{ id: HubTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "import", label: "1-Click CSV / JSON / FHIR Importer", icon: FileSpreadsheet },
    { id: "widget", label: "2-Line Website Widget & API Keys", icon: Code2 },
    { id: "logs", label: `Live Sync Audit (${syncLogs.length})`, icon: Activity },
  ];

  const clinicSlug = orgConfig.slug || "oxpecker-flagship-hospital";
  const twoLineIframeCode =
    snippets.widgetEmbedHtml ||
    `<iframe src="https://oxpecker.ai/embed/book/${clinicSlug}" width="100%" height="680" style="border:0;border-radius:16px;" loading="lazy" title="Oxpecker Booking"></iframe>`;

  return (
    <div className="w-full space-y-6 pb-16">
      <Toaster position="top-right" richColors />

      {/* Header + DGHS Compliance Bar */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                HOSPITAL PRO LICENSED ({orgConfig.licenseTier || "HOSPITAL_PRO"})
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Master Patient Index Active
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Globe className="w-6 h-6 text-teal-600 shrink-0" />
              1-Click Clinic Data Hub & Connector
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl">
              Connect legacy clinic spreadsheets, HMS databases, HL7 FHIR bundles, and your clinic&apos;s public website booking widget into Oxpecker AI&apos;s unified Patient 360° Vault with zero manual deduplication.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href={`/embed/book/${clinicSlug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors"
            >
              Preview Booking Widget
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={handleLoadAndSyncSample}
              disabled={importing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-xs font-black shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {importing ? "Syncing Clinic Dataset..." : "1-Click Load & Sync Sample Clinic Dataset"}
            </button>
          </div>
        </div>

        {/* Editable DGHS HFR Code & Facility Name */}
        <form
          method="POST"
          onSubmit={handleSaveOrgConfig}
          aria-labelledby={formHeadingId}
          className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
        >
          <span id={formHeadingId} className="sr-only">
            Facility DGHS Registry Settings
          </span>
          <div className="md:col-span-5">
            <label htmlFor="hub-org-name" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Connected Clinic / Hospital Name
            </label>
            <input
              id="hub-org-name"
              name="organizationName"
              type="text"
              value={clinicNameDraft}
              onChange={(e) => setClinicNameDraft(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="md:col-span-4">
            <label htmlFor="hub-dghs-code" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              DGHS HFR Facility Code
            </label>
            <input
              id="hub-dghs-code"
              name="dghsFacilityCode"
              type="text"
              value={dghsCodeDraft}
              onChange={(e) => setDghsCodeDraft(e.target.value)}
              placeholder="DGHS-HFR-10004218"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={savingConfig}
              className="w-full md:w-auto h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              {savingConfig ? "Saving..." : "Save Facility Registry"}
            </button>
          </div>
        </form>
      </section>

      {/* Single-row scrollable Accessible Tablist */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div
          role="tablist"
          aria-label="Clinic Data Hub Sections"
          className="flex flex-nowrap overflow-x-auto border-b border-slate-200 px-3 sm:px-5 gap-1"
        >
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`hub-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-none inline-flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                  selected
                    ? "border-teal-600 text-teal-800 bg-teal-50/40"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Panel 1: 1-Click CSV / JSON / FHIR Bulk Importer */}
        <div
          role="tabpanel"
          aria-labelledby="hub-tab-import"
          hidden={activeTab !== "import"}
        >
          <div className="p-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-black text-slate-900">
                      Legacy Clinic CSV / JSON / HL7 FHIR Bulk Ingestion
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Flexible column aliases automatically detect Name, Phone (`+880`/local), NID, Blood Group, Height, Weight, Doctor, Hospital, Rx, and Lab Results.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadSampleCsv}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download CSV Template
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-300">
                  <label
                    htmlFor="hub-file-upload"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-100 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-teal-600" />
                    Choose CSV / JSON File
                  </label>
                  <input
                    id="hub-file-upload"
                    name="clinicExportFile"
                    type="file"
                    accept=".csv,.json,text/csv,application/json"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                  <span className="text-xs text-slate-500">
                    or paste raw CSV / JSON rows / FHIR Bundle below:
                  </span>
                </div>

                <div>
                  <label htmlFor="hub-csv-textarea" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Clinic Export Payload (CSV, JSON Array, or HL7 FHIR R4 Bundle)
                  </label>
                  <textarea
                    id="hub-csv-textarea"
                    name="csvText"
                    rows={8}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder={`name,phone,blood_group,height_cm,weight_kg,doctor_name,diagnosis,medicines\nRahim Uddin,+8801711000000,A+,170,70,Prof. Dr. Ahmed Rahman,Hypertension,Amlodipine 5mg`}
                    className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleLoadAndSyncSample}
                    disabled={importing}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5 text-teal-700" />
                    Load 8 Sample BD Clinic Patients & Sync
                  </button>
                  <button
                    type="button"
                    onClick={() => runBulkImport(csvText, false)}
                    disabled={importing}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-xs font-black inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Layers className="w-4 h-4" />
                    {importing ? "Running MPI Deduplication..." : "Run 1-Click MPI Sync"}
                  </button>
                </div>
              </div>

              {/* MPI Summary Panel */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900">
                      Master Patient Index (MPI) Resolution Summary
                    </h3>
                    <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                      NID → Phone → MRN
                    </span>
                  </div>

                  {importSummary ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        <div className="bg-white rounded-xl border border-slate-200 p-3">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Processed</span>
                          <strong className="text-xl font-mono font-black text-slate-900">{importSummary.importedCount}</strong>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-3">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">MPI Merged</span>
                          <strong className="text-xl font-mono font-black text-teal-700">{importSummary.mergedExistingCount}</strong>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-3">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">New Citizens</span>
                          <strong className="text-xl font-mono font-black text-blue-700">{importSummary.newlyCreatedCount}</strong>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-3">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Prescriptions</span>
                          <strong className="text-xl font-mono font-black text-slate-900">{importSummary.prescriptionsCreated}</strong>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-3">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Lab Reports</span>
                          <strong className="text-xl font-mono font-black text-slate-900">{importSummary.reportsCreated}</strong>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-3">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Visits Linked</span>
                          <strong className="text-xl font-mono font-black text-slate-900">{importSummary.appointmentsCreated}</strong>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                          Synced Citizen Sample & Auto-BMI
                        </p>
                        <div className="max-h-56 overflow-y-auto divide-y divide-slate-200 bg-white rounded-xl border border-slate-200">
                          {importSummary.samplePatients.map((sp, i) => (
                            <div key={`${sp.mrn}-${i}`} className="px-3 py-2 flex items-center justify-between gap-2 text-xs">
                              <div>
                                <p className="font-bold text-slate-900">{sp.name}</p>
                                <p className="font-mono text-[11px] text-slate-500">
                                  {sp.mrn} {sp.heightCm && sp.weightKg ? `• ${sp.heightCm}cm / ${sp.weightKg}kg` : ""}
                                </p>
                              </div>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                                {sp.matchStrategy || "synced"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-white p-5 text-center space-y-2">
                      <CheckCircle2 className="w-7 h-7 text-teal-600 mx-auto" />
                      <p className="text-xs font-bold text-slate-800">
                        Ready for Zero-Friction Legacy Clinic Migration
                      </p>
                      <p className="text-xs text-slate-500">
                        Click &ldquo;1-Click Load &amp; Sync Sample Clinic Dataset&rdquo; above to ingest 8 full patient journeys across doctors, labs, and prescriptions into Patient 360°.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Website Widget & API Keys */}
        <div
          role="tabpanel"
          aria-labelledby="hub-tab-widget"
          hidden={activeTab !== "widget"}
        >
          <div className="p-5 sm:p-6 space-y-6">
            {/* 2-Line Embeddable Booking Widget Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-black text-slate-900">
                    2-Line Website Booking Widget Embed
                  </h2>
                  <button
                    type="button"
                    onClick={() => copyText(twoLineIframeCode, "Embed snippet")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Embed HTML
                  </button>
                </div>
                <p className="text-xs text-slate-600">
                  Paste this snippet onto your clinic WordPress, Webflow, or custom HTML site. Every patient booking flows straight into Oxpecker Appointments, HMS, and Patient 360°.
                </p>
                <pre className="p-3 rounded-xl bg-slate-900 text-teal-200 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap break-all">
                  {twoLineIframeCode}
                </pre>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Route: /embed/book/{clinicSlug}
                  </span>
                  <Link
                    href={`/embed/book/${clinicSlug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:underline"
                  >
                    Open Live Widget <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-black text-slate-900">
                    1-Endpoint Universal REST / Webhook Sync (cURL)
                  </h2>
                  <button
                    type="button"
                    onClick={() => copyText(snippets.curlSync || "", "cURL snippet")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy cURL
                  </button>
                </div>
                <p className="text-xs text-slate-600">
                  Send Patient + Appointment + Prescription + Lab Report in one idempotent POST call from any external EMR, LIS, or clinic backend.
                </p>
                <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap break-all">
                  {snippets.curlSync || "Loading integration snippet..."}
                </pre>
              </div>
            </div>

            {/* Tenant API Key Minting & Management */}
            <div className="rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 id={keyFormHeadingId} className="text-base font-black text-slate-900 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-teal-600" />
                    Tenant Connector API Keys (`x-oxpecker-api-key`)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Keys are stored using irreversible SHA-256 hashes. Revoke any compromised key instantly without downtime.
                  </p>
                </div>
              </div>

              <form
                method="POST"
                onSubmit={handleCreateApiKey}
                aria-labelledby={keyFormHeadingId}
                className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end"
              >
                <div className="flex-1">
                  <label htmlFor="hub-key-label" className="block text-xs font-bold text-slate-700 mb-1">
                    Connector Label
                  </label>
                  <input
                    id="hub-key-label"
                    name="keyLabel"
                    type="text"
                    required
                    value={keyLabel}
                    onChange={(e) => setKeyLabel(e.target.value)}
                    placeholder="e.g., Main Clinic Website + Reception POS"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creatingKey}
                  className="h-10 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-xs font-black whitespace-nowrap cursor-pointer"
                >
                  {creatingKey ? "Generating Key..." : "Generate 1-Click API Key"}
                </button>
              </form>

              {freshRawKey && (
                <div
                  role="status"
                  aria-live="polite"
                  className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-xs font-black text-amber-900">
                      Copy your new API key now — it will not be shown in full again:
                    </p>
                    <code className="text-xs font-mono font-bold text-slate-900 break-all">
                      {freshRawKey}
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(freshRawKey, "New API Key")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-900 text-white text-xs font-bold cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Key
                  </button>
                </div>
              )}

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black">
                    <tr>
                      <th className="py-2.5 px-3">Label</th>
                      <th className="py-2.5 px-3">Key Prefix</th>
                      <th className="py-2.5 px-3">Scopes</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {keys.map((k) => (
                      <tr key={k.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{k.label}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{k.keyPrefix}</td>
                        <td className="py-2.5 px-3 text-slate-500">{(k.scopes || []).join(", ")}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              k.isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {k.isActive ? "Active" : "Revoked"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {k.isActive && (
                            <button
                              type="button"
                              onClick={() => handleRevokeKey(k.id)}
                              className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {keys.length === 0 && !loading && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          No custom keys issued yet. Use the form above to generate one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: Live Sync Audit & DGHS Compliance */}
        <div
          role="tabpanel"
          aria-labelledby="hub-tab-logs"
          hidden={activeTab !== "logs"}
        >
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Live Inbound / Outbound Integration Sync Ledger
                </h2>
                <p className="text-xs text-slate-500">
                  Every widget booking, REST webhook push, and CSV/FHIR batch import is recorded with idempotency tracking and DGHS audit metadata.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchHubState}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh Audit Ledger
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Channel</th>
                    <th className="py-2.5 px-3">Entities</th>
                    <th className="py-2.5 px-3">Ref / Idempotency</th>
                    <th className="py-2.5 px-3">Records</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {syncLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : "Just now"}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{log.channel}</td>
                      <td className="py-2.5 px-3 text-slate-700">{log.entityType}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                        {log.externalRefId || log.idempotencyKey || log.id.slice(0, 12)}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {log.recordsProcessed}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {syncLogs.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No sync transactions recorded yet. Run the 1-Click Sample Importer or test the Booking Widget to stream live audit entries.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
