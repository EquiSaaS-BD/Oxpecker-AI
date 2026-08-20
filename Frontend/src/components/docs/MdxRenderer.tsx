"use client";

import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Script from 'next/script';

interface MdxRendererProps {
  content: string;
}

function highlightCode(code: string, language: string) {
  const safeCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  if (language === 'json') {
    return safeCode
      .replace(/(&quot;[\s\S]*?&quot;):/g, '<span class="text-[#6DDA6E]">$1</span>:')
      .replace(/: (&quot;[\s\S]*?&quot;)/g, ': <span class="text-[#00C2A8]">$1</span>')
      .replace(/: (true|false|null)/g, ': <span class="text-[#FFBD2E]">$1</span>')
      .replace(/: ([0-9.]+)/g, ': <span class="text-[#FFBD2E]">$1</span>');
  }
  if (language === 'bash' || language === 'sh') {
    return safeCode
      .replace(/^(npm|npx|git|cd|python|pip|uvicorn|docker) /gm, '<span class="text-[#FFBD2E]">$1</span> ')
      .replace(/ (install|add|commit|push|run|build) /g, ' <span class="text-[#6DDA6E]">$1</span> ')
      .replace(/(&quot;[\s\S]*?&quot;|'[\s\S]*?')/g, '<span class="text-[#00C2A8]">$1</span>')
      .replace(/(-[a-zA-Z0-9-]+)/g, '<span class="text-slate-400">$1</span>')
      .replace(/#.*$/gm, '<span class="text-slate-500 italic">$&</span>');
  }
  if (language === 'python' || language === 'py') {
    return safeCode
      .replace(/\b(def|class|import|from|return|if|else|elif|for|while|try|except|with|as|pass|async|await)\b/g, '<span class="text-[#FFBD2E]">$1</span>')
      .replace(/(&quot;[\s\S]*?&quot;|'[\s\S]*?')/g, '<span class="text-[#00C2A8]">$1</span>')
      .replace(/\b(print|len|str|int|float|bool|list|dict|set|FastAPI|APIRouter)\b/g, '<span class="text-[#6DDA6E]">$1</span>')
      .replace(/#.*$/gm, '<span class="text-slate-500 italic">$&</span>');
  }
  if (language === 'typescript' || language === 'ts' || language === 'tsx' || language === 'javascript' || language === 'js') {
    return safeCode
      .replace(/\b(import|export|from|const|let|var|function|return|if|else|for|while|interface|type|class|await|async)\b/g, '<span class="text-[#FFBD2E]">$1</span>')
      .replace(/(&quot;[\s\S]*?&quot;|'[\s\S]*?'|`[\s\S]*?`)/g, '<span class="text-[#00C2A8]">$1</span>')
      .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-[#FF5F56]">$1</span>')
      .replace(/\/\/.*/g, '<span class="text-slate-500 italic">$&</span>');
  }
  return safeCode;
}

export function MdxRenderer({ content }: MdxRendererProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).mermaid) {
      try {
        (window as any).mermaid.contentLoaded();
      } catch (e) {}
    }
  }, [content]);

  return (
    <>
      <Script 
        src="https://cdn.jsdelivr.net/npm/mermaid@10.4.0/dist/mermaid.min.js" 
        strategy="lazyOnload"
        onLoad={() => {
          if (typeof window !== 'undefined' && (window as any).mermaid) {
            (window as any).mermaid.initialize({
              startOnLoad: true,
              theme: 'dark',
              themeVariables: {
                edgeLabelBackground: 'transparent',
                clusterBkg: 'transparent'
              }
            });
            (window as any).mermaid.contentLoaded();
          }
        }}
      />
      <div className="prose prose-slate  max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:font-medium prose-a:text-[#00C2A8] hover:prose-a:text-[#6DDA6E] prose-a:underline-offset-4 prose-p:text-[16px] prose-p:leading-[1.8] prose-p:text-slate-600  prose-li:text-slate-600  prose-strong:text-slate-900  prose-blockquote:border-l-[#6DDA6E] prose-blockquote:bg-slate-50  prose-blockquote:px-6 prose-blockquote:py-2 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-slate-700  prose-img:rounded-2xl prose-img:shadow-xl prose-img:border prose-img:border-slate-200 ">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              
              // Special handling for mermaid blocks
              if (!inline && language === 'mermaid') {
                return (
                  <div className="relative group my-10 rounded-[16px] overflow-hidden border border-slate-200  shadow-lg bg-[#0F172A]">
                    {/* macOS style window header */}
                    <div className="absolute top-0 left-0 w-full px-4 py-3 bg-[#1e293b]/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 font-medium tracking-wider uppercase flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-[#00C2A8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                        Architecture Diagram
                      </div>
                      <div className="w-12"></div> {/* Spacer for centering */}
                    </div>
                    
                    <div className="pt-16 pb-8 px-6 overflow-x-auto">
                      <div className="mermaid flex justify-center min-w-max text-slate-200">
                        {String(children).replace(/\n$/, '')}
                      </div>
                    </div>
                  </div>
                );
              }

            return !inline && match ? (
              <div className="relative group my-10 rounded-[16px] overflow-hidden border border-slate-200  shadow-lg bg-[#0F172A]">
                {/* macOS style window header */}
                <div className="absolute top-0 left-0 w-full px-4 py-3 bg-[#1e293b]/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 font-medium tracking-wider uppercase">{language}</div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 px-2 py-1 rounded-md" onClick={() => navigator.clipboard.writeText(String(children))}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Copy
                  </button>
                </div>
                <div className="pt-14 pb-5 px-6 overflow-x-auto text-[14px] text-slate-300 font-mono leading-[1.6]">
                  <pre>
                    <code 
                      className={className} 
                      {...props}
                      dangerouslySetInnerHTML={{ 
                        __html: highlightCode(String(children).replace(/\n$/, ''), language) 
                      }}
                    />
                  </pre>
                </div>
              </div>
            ) : (
              <code className="bg-slate-100  border border-slate-200  px-1.5 py-0.5 rounded-md text-[14px] font-medium text-slate-800 " {...props}>
                {children}
              </code>
            );
          },
          h1: ({node, ...props}) => <h1 className="text-[42px] sm:text-[48px] tracking-tight font-extrabold mb-8 text-slate-900 " {...props} />,
          h2: ({node, ...props}) => {
             const id = props.children?.toString().toLowerCase().replace(/\s+/g, '-');
             return <h2 id={id} className="text-[32px] font-bold mt-[80px] scroll-mt-28 border-b border-slate-200 pb-4 text-slate-900 group relative" {...props}>
               {props.children}
               <a href={`#${id}`} className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#00C2A8] transition-opacity">#</a>
             </h2>;
          },
          h3: ({node, ...props}) => {
             const id = props.children?.toString().toLowerCase().replace(/\s+/g, '-');
             return <h3 id={id} className="text-[24px] font-semibold mt-12 scroll-mt-28 text-slate-900 group relative" {...props}>
               {props.children}
               <a href={`#${id}`} className="absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#00C2A8] transition-opacity">#</a>
             </h3>;
          },
          table: ({node, ...props}) => (
             <div className="overflow-x-auto my-10 border border-slate-200 rounded-2xl shadow-sm">
               <table className="w-full text-left border-collapse text-sm" {...props} />
             </div>
          ),
          th: ({node, ...props}) => <th className="bg-slate-50 p-4 border-b border-slate-200 font-semibold text-slate-900" {...props} />,
          td: ({node, ...props}) => <td className="p-4 border-b border-slate-100 text-slate-600" {...props} />,
          ul: ({node, ...props}) => <ul className="space-y-2 list-disc pl-6 marker:text-slate-400" {...props} />,
          ol: ({node, ...props}) => <ol className="space-y-2 list-decimal pl-6 marker:text-slate-400 marker:font-medium" {...props} />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
    </>
  );
}
