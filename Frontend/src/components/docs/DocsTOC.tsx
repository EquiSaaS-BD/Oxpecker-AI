"use client";

import React, { useEffect, useState } from 'react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface DocsTOCProps {
  content: string;
}

export function DocsTOC({ content }: DocsTOCProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Very simple markdown heading parser (H2 and H3 only)
    const regex = /^(##|###)\s+(.+)$/gm;
    const matches: TOCItem[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2];
      const id = text.toLowerCase().replace(/\s+/g, '-');
      matches.push({ id, text, level });
    }
    setHeadings(matches);
  }, [content]);

  useEffect(() => {
    // Scroll spy
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside className="w-[260px] shrink-0 hidden xl:block sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto pb-20 py-8 pl-8 hide-scrollbar border-l border-slate-100 dark:border-slate-800/50">
      <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider">
        On this page
      </h5>
      <ul className="space-y-2.5 border-l border-slate-200 dark:border-slate-800">
        {headings.map((heading) => (
          <li 
            key={heading.id} 
            className={`${heading.level === 3 ? 'ml-4' : 'ml-0'}`}
          >
            <a
              href={`#${heading.id}`}
              className={`block -ml-[1px] pl-4 border-l-2 text-[14px] transition-colors ${
                activeId === heading.id
                  ? 'border-[#6DDA6E] text-[#6DDA6E] font-medium'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
