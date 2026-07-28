import React from 'react';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { getDocsGroupedByCategory } from '@/lib/docs';
import { Navbar } from '@/components/layout/Navbar';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const groupedDocs = getDocsGroupedByCategory();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* 72px Navbar fixed at top */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <Navbar />
      </div>

      <div className="flex flex-1 max-w-[1280px] w-full mx-auto relative">
        <DocsSidebar groupedDocs={groupedDocs} />
        
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
