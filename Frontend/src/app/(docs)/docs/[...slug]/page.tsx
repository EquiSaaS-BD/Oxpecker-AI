import React from 'react';
import { notFound } from 'next/navigation';
import { getDocBySlug, getDocSlugs, getPrevNextDocs } from '@/lib/docs';
import { MdxRenderer } from '@/components/docs/MdxRenderer';
import { DocsTOC } from '@/components/docs/DocsTOC';
import { ArrowRight, ChevronRight, BookOpen } from 'lucide-react';
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
  const { prev, next } = doc ? getPrevNextDocs(doc.slug) : { prev: null, next: null };

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
      <div className="flex-1 min-w-0 max-w-4xl mx-auto">
        <FadeInStagger>
          {/* Breadcrumb */}
          <FadeIn className="flex items-center text-xs font-semibold text-slate-500 mb-8 space-x-2 tracking-wide uppercase">
            <Link href="/docs" className="hover:text-slate-900 transition-colors">DOCS</Link>
            <ChevronRight size={14} className="text-slate-300" />
            <span>{categoryName}</span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="text-slate-900">{doc.title}</span>
          </FadeIn>

          {/* Header */}
          <header className="mb-12">
            <FadeIn y={10}>
              <h1 className="text-5xl font-extrabold text-slate-900 tracking-tighter mb-6 leading-tight">
                {doc.title}
              </h1>
            </FadeIn>
            
            {doc.description && (
              <FadeIn y={10}>
                <TiltBox>
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl flex items-start gap-4 shadow-sm group hover:border-slate-300 transition-colors">
                    <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-sm group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-300">
                      <BookOpen className="w-6 h-6 text-slate-900" />
                    </div>
                    <p className="text-lg text-slate-700 font-medium leading-relaxed pt-0.5">
                      {doc.description}
                    </p>
                  </div>
                </TiltBox>
              </FadeIn>
            )}
          </header>

          {/* Markdown Content */}
          <FadeIn y={20}>
            <article className="pb-16 border-b border-slate-200 relative z-10">
              <MdxRenderer content={doc.content} />
            </article>
          </FadeIn>
          
          {/* Footer Navigation */}
          <FadeIn y={10} className="py-8 flex justify-between items-center text-sm font-semibold">
            {prev ? (
              <Link href={`/docs/${prev.slug}`} className="text-slate-500 hover:text-slate-900 transition-colors px-4 py-2 rounded-xl hover:bg-slate-100 flex flex-col items-start">
                <span className="text-[10px] uppercase tracking-widest text-slate-400">Previous</span>
                <span className="mt-1">{prev.title}</span>
              </Link>
            ) : <div />}
            {next ? (
              <Link href={`/docs/${next.slug}`} className="text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex flex-col items-end group px-5 py-3 rounded-xl">
                <span className="text-[10px] uppercase tracking-widest text-slate-400">Next</span>
                <span className="mt-1 flex items-center gap-2">{next.title} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></span>
              </Link>
            ) : <div />}
          </FadeIn>
        </FadeInStagger>
      </div>

      <DocsTOC content={doc.content} />
    </div>
  );
}
