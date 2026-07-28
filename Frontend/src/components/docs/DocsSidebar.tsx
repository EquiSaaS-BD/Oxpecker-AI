"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { DocPost } from '@/lib/docs';

interface DocsSidebarProps {
  groupedDocs: Record<string, DocPost[]>;
}

export function DocsSidebar({ groupedDocs }: DocsSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-[300px] shrink-0 h-[calc(100vh-72px)] sticky top-[72px] overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pb-20 hidden md:block hide-scrollbar">
      <div className="p-6">
        {/* Search placeholder - you could inject a search button here */}
        <div className="mb-8 w-full h-[48px] bg-slate-100 dark:bg-slate-900 rounded-[12px] flex items-center px-4 text-slate-400 text-sm border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search documentation...
          <span className="ml-auto text-xs border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5">⌘K</span>
        </div>

        <nav className="space-y-8">
          {Object.entries(groupedDocs).map(([category, docs]) => (
            <div key={category}>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm tracking-wide uppercase mb-3 px-2">
                {category}
              </h4>
              <ul className="space-y-1">
                {docs.map((doc) => {
                  const href = `/docs/${doc.slug}`;
                  const isActive = pathname === href;

                  return (
                    <li key={doc.slug}>
                      <Link 
                        href={href}
                        className={`flex items-center px-2 py-2 text-[15px] rounded-[12px] transition-colors duration-200 ${
                          isActive 
                            ? 'bg-[#6DDA6E]/10 text-[#6DDA6E] font-medium' 
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        {isActive && <ChevronRight size={16} className="mr-1 shrink-0" />}
                        {!isActive && <span className="w-[20px]" />}
                        <span className="truncate">{doc.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
