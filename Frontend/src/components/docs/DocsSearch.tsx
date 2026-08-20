"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DocPost } from '@/lib/docs';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface DocsSearchProps {
  groupedDocs: Record<string, DocPost[]>;
}

export function DocsSearch({ groupedDocs }: DocsSearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Flatten docs for easier searching
  const allDocs = React.useMemo(() => {
    const flat: (DocPost & { categoryName: string })[] = [];
    Object.entries(groupedDocs).forEach(([cat, docs]) => {
      docs.forEach(d => flat.push({ ...d, categoryName: cat }));
    });
    return flat;
  }, [groupedDocs]);

  const searchResults = React.useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    
    return allDocs.filter(doc => 
      doc.title.toLowerCase().includes(lowerQuery) ||
      (doc.description && doc.description.toLowerCase().includes(lowerQuery)) ||
      (doc.content && doc.content.toLowerCase().includes(lowerQuery))
    ).slice(0, 5); // Limit to 5 results to fit in sidebar
  }, [query, allDocs]);

  const handleSelect = (slug: string) => {
    setQuery('');
    setIsFocused(false);
    router.push(`/docs/${slug}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="mb-8 w-full relative z-50" ref={wrapperRef}>
      <div className={`relative h-[40px] bg-slate-50  rounded-lg flex items-center px-3 text-slate-500  text-[13px] border transition-colors ${isFocused ? 'border-[#00C2A8] text-[#00C2A8]' : 'border-slate-200  hover:border-[#00C2A8]'}`}>
        <svg className={`w-4 h-4 mr-2.5 transition-opacity ${isFocused ? 'opacity-100 text-[#00C2A8]' : 'opacity-70'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search documentation..."
          className="flex-1 bg-transparent border-none outline-none text-slate-900  placeholder-slate-400  w-full"
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); setIsFocused(false); }}
            className="ml-2 text-slate-400 hover:text-slate-600 "
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Inline Results Dropdown */}
      <AnimatePresence>
        {isFocused && query.trim() && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-[48px] left-0 w-[300px] sm:w-[350px] bg-white  rounded-xl shadow-xl border border-slate-200  overflow-hidden"
          >
            <div className="max-h-[300px] overflow-y-auto p-2">
              {searchResults.length === 0 ? (
                <div className="px-4 py-6 text-center text-slate-500 text-sm">
                  No results found for "{query}"
                </div>
              ) : (
                <ul className="space-y-1">
                  {searchResults.map((doc) => (
                    <li key={doc.slug}>
                      <Link 
                        href={`/docs/${doc.slug}`}
                        onClick={() => { setQuery(''); setIsFocused(false); }}
                        className="w-full block text-left px-3 py-2 rounded-lg hover:bg-slate-50  transition-colors group"
                      >
                        <div className="font-medium text-[14px] text-slate-900  group-hover:text-[#00C2A8] transition-colors">
                          {doc.title}
                        </div>
                        <div className="text-[12px] text-slate-500  mt-0.5 truncate">
                          {doc.categoryName}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
