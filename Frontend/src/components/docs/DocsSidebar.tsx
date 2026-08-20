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
    <aside className="w-[280px] shrink-0 h-[calc(100vh-72px)] sticky top-[72px] overflow-y-auto border-r border-slate-200 bg-transparent pb-20 hidden md:block hide-scrollbar pt-8 pr-6">
      <DocsSearch groupedDocs={groupedDocs} />
      
      <FadeInStagger>
        <nav className="space-y-8 mt-6">
          {Object.entries(groupedDocs).map(([category, docs]) => (
            <FadeIn key={category} className="space-y-3" y={10}>
              <h4 className="font-semibold text-slate-900 text-xs tracking-wider uppercase px-2">
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
                        className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                          isActive
                            ? 'bg-slate-100 text-slate-900 font-medium'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
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