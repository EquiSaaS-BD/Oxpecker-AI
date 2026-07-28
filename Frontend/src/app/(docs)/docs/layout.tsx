import React from 'react';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { getDocsGroupedByCategory } from '@/lib/docs';
import { Navbar } from '@/components/layout/Navbar';
import { DocsBackground3D } from '@/components/docs/DocsBackground3D';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const groupedDocs = getDocsGroupedByCategory();

  return (
    <div className="min-h-screen bg-white/40 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 flex flex-col font-sans relative">
      <DocsBackground3D />
      
      {/* 72px Navbar fixed at top */}
      <div className="fixed top-0 left-0 right-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <Navbar />
      </div>

      <div className="flex flex-1 w-full max-w-[1536px] mx-auto px-4 md:px-6 lg:px-8 relative pt-[72px]">
        <DocsSidebar groupedDocs={groupedDocs} />
        
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
