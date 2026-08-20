import React from 'react';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { getDocsGroupedByCategory } from '@/lib/docs';
import { Navbar } from '@/components/layout/Navbar';
import { DocsBackground3D } from '@/components/docs/DocsBackground3D';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const groupedDocs = getDocsGroupedByCategory();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative selection:bg-slate-900 selection:text-white">
      <DocsBackground3D />
      
      {/* 72px Navbar fixed at top */}
      <div className="fixed top-0 left-0 right-0 w-full z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-200/60">
        <Navbar />
      </div>

      <div className="flex flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-[72px]">
        <DocsSidebar groupedDocs={groupedDocs} />
        
        <main className="flex-1 min-w-0 pt-8 pb-24 lg:pl-12">
          <div className="glass-panel p-8 md:p-12 rounded-[2rem] shadow-sm relative z-10 spatial-shadow">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
