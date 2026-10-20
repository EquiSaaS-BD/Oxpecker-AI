"use client";

import React from "react";
import { CreditCard, ShieldCheck } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthPassSearchEngine } from "@/components/health-card/HealthPassSearchEngine";

export default function AdminHealthCardsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title="HealthPass Card Registry & Verification"
        description="বাংলাদেশ জাতীয় ডিজিটাল স্বাস্থ্য পরিচয়পত্র ডাটাবেস ও জরুরি অনুসন্ধান কনসোল"
        icon={<CreditCard size={24} />}
      />

      <HealthPassSearchEngine
        portalRole="admin"
        title="Admin HealthPass Master Registry"
        subtitle="অ্যাডমিন প্যানেল থেকে সমস্ত রোগীর স্বাস্থ্য কার্ড, ভেরিফিকেশন স্ট্যাটাস ও জরুরি তথ্য অনুসন্ধান করুন"
      />
    </div>
  );
}
