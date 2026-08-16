import React from 'react';
import { notFound } from 'next/navigation';
import { getDocBySlug, getDocSlugs } from '@/lib/docs';
import { MdxRenderer } from '@/components/docs/MdxRenderer';
import { DocsTOC } from '@/components/docs/DocsTOC';
import { ArrowRight, ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { FadeInStagger, FadeIn, TiltBox } from '@/components/docs/DocsAnimator';

export function generateStaticParams() {
  const slugs = getDocSlugs();
  return slugs.map((slug) => ({
    slug: slug.split('/'),
  }));
}

export default async function DocPage(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params;
  const doc = getDocBySlug(params.slug);

  if (!doc) {
    notFound();
  }

  const categoryName = doc.category
      .replace(/^\d+-/, '')
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  return (
    <div className="flex w-full">
      <div className="flex-1 min-w-0 px-6 pt-8 pb-24 md:px-12 lg:px-16 max-w-[860px] mx-auto">
        <FadeInStagger>
          {/* Breadcrumb */}
          <FadeIn className="flex items-center text-sm text-slate-500 mb-8 space-x-2">
            <Link href="/docs" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">DOC</Link>
            <ChevronRight size={14} />
            <span>{categoryName}</span>
            <ChevronRight size={14} />
            <span className="text-slate-900 dark:text-slate-100 font-medium">{doc.title}</span>
          </FadeIn>

          {/* Header */}
          <header className="mb-12">
            <FadeIn y={10}>
              <h1 className="text-[48px] font-bold text-slate-900 dark:text-white tracking-tight mb-6 leading-[1.1]">
                {doc.title}
              </h1>
            </FadeIn>
            
            {doc.description && (
              <FadeIn y={10}>
                <TiltBox>
                  <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/60 dark:to-slate-900/20 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl flex items-start sm:items-center gap-4 shadow-sm group">
                    <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <svg className="w-5 h-5 text-[#00C2A8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-[15px] sm:text-[16px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {doc.description}
                    </p>
                  </div>
                </TiltBox>
              </FadeIn>
            )}
          </header>

          {/* Markdown Content */}
          <FadeIn y={20}>
            <article className="pb-16 border-b border-slate-200 dark:border-slate-800 relative z-10">
              <MdxRenderer content={doc.content} />
            </article>
          </FadeIn>
          
          {/* Footer Navigation */}
          <FadeIn y={10} className="py-8 flex justify-between items-center text-sm font-medium">
            <button className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
              ← Previous
            </button>
            <button className="text-[#2F80ED] hover:text-[#6DDA6E] transition-colors flex items-center gap-1 group">
              Next Section <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </FadeIn>
        </FadeInStagger>
      </div>

      <DocsTOC content={doc.content} />
    </div>
  );
}
