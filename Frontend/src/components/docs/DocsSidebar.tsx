"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DocPost } from '@/lib/docs';
import { FadeInStagger, FadeIn } from '@/components/docs/DocsAnimator';
import { DocsSearch } from '@/components/docs/DocsSearch';

interface DocsSidebarProps {
  groupedDocs: Record<string, DocPost[]>;
}

export function DocsSidebar({ groupedDocs }: DocsSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-[280px] shrink-0 h-[calc(100vh-72px)] sticky top-[72px] overflow-y-auto border-r border-slate-200/60 dark:border-slate-800/60 bg-transparent pb-20 hidden md:block hide-scrollbar pt-8 pr-6">
      
      {/* Search Command Palette Component */}
      <DocsSearch groupedDocs={groupedDocs} />

      <FadeInStagger>
        <nav className="space-y-8">
          {Object.entries(groupedDocs).map(([category, docs]) => (
            <FadeIn key={category} className="space-y-3" y={10}>
              <h4 className="font-semibold text-slate-900 dark:text-slate-200 text-[12px] tracking-[0.05em] uppercase px-1">
                {category}
              </h4>
              <ul className="space-y-0.5 border-l border-slate-100 dark:border-slate-800/60 ml-2">
                {docs.map((doc) => {
                  const href = `/docs/${doc.slug}`;
                  const isActive = pathname === href;

                  return (
                    <li key={doc.slug}>
                      <Link 
                        href={href}
                        className={`block -ml-[1px] border-l-2 pl-4 py-1.5 text-[14px] transition-all duration-200 ${
                          isActive 
                            ? 'border-[#00C2A8] text-[#00C2A8] font-medium bg-[#00C2A8]/5 rounded-r-md' 
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-[#00C2A8] hover:border-[#00C2A8] hover:bg-[#00C2A8]/5 hover:rounded-r-md dark:hover:text-[#00C2A8]'
                        }`}
                      >
                        {doc.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </FadeIn>
          ))}
        </nav>
      </FadeInStagger>
    </aside>
  );
}
