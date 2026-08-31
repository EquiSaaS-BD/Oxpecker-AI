import os

filepath = 'src/app/(app)/assistant/layout.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

new_imports = '''import React from "react";
import AssistantSidebar from "@/components/dashboard/assistant/AssistantSidebar";
import AssistantTopNav from "@/components/dashboard/assistant/AssistantTopNav";
import AssistantBottomNav from "@/components/dashboard/assistant/AssistantBottomNav";
import { useAuth } from "@/context/AuthContext";
import { AccessDeniedModal } from "@/components/doctor/AccessDeniedModal";
import { PendingApprovalModal } from "@/components/shared/PendingApprovalModal";'''

content = content.replace('import React from "react";\nimport AssistantSidebar from "@/components/dashboard/assistant/AssistantSidebar";\nimport AssistantTopNav from "@/components/dashboard/assistant/AssistantTopNav";\nimport AssistantBottomNav from "@/components/dashboard/assistant/AssistantBottomNav";', new_imports)

old_comp = '''export default function AssistantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F7FAFC] font-sans">'''

new_comp = '''export default function AssistantLayout({ children }: { children: React.ReactNode }) {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="h-screen w-full bg-slate-50"></div>;
  }
  
  if (!isAuthenticated || role !== "assistant") {
    return <AccessDeniedModal />;
  }
  
  if (user && !user.isApproved) {
    return <PendingApprovalModal />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7FAFC] font-sans">'''

content = content.replace(old_comp, new_comp)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
