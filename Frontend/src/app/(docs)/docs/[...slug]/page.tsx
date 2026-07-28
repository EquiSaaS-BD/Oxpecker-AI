import React from 'react';
import { notFound } from 'next/navigation';
import { getDocBySlug, getDocSlugs } from '@/lib/docs';
import { MdxRenderer } from '@/components/docs/MdxRenderer';
import { DocsTOC } from '@/components/docs/DocsTOC';
import { ArrowRight, ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

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
      <div className="flex-1 min-w-0 px-6 py-12 md:px-12 lg:px-16 max-w-[860px] mx-auto">
        
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-slate-500 mb-8 space-x-2">
          <Link href="/docs" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            <Home size={14} />
          </Link>
          <ChevronRight size={14} />
          <span>{categoryName}</span>
          <ChevronRight size={14} />
          <span className="text-slate-900 dark:text-slate-100 font-medium">{doc.title}</span>
        </div>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-[48px] font-bold text-slate-900 dark:text-white tracking-tight mb-4 leading-[1.1]">
            {doc.title}
          </h1>
          {doc.description && (
            <p className="text-[20px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
              {doc.description}
            </p>
          )}
        </header>

        {/* Markdown Content */}
        <article className="pb-16 border-b border-slate-200 dark:border-slate-800">
          <MdxRenderer content={doc.content} />
        </article>
        
        {/* Footer Navigation */}
        <div className="py-8 flex justify-between items-center text-sm font-medium">
          <button className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            ← Previous
          </button>
          <button className="text-[#2F80ED] hover:text-[#6DDA6E] transition-colors flex items-center gap-1">
            Next Section <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <DocsTOC content={doc.content} />
    </div>
  );
}
