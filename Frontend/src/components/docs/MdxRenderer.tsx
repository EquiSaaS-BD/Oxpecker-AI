"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MdxRendererProps {
  content: string;
}

export function MdxRenderer({ content }: MdxRendererProps) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-[#2F80ED] hover:prose-a:text-[#6DDA6E] prose-pre:bg-[#0F172A] prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-[16px] prose-p:text-[16px] prose-p:leading-[1.8] prose-p:mb-[24px]">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            // Special handling for mermaid blocks
            if (!inline && language === 'mermaid') {
              // Note: For a real production app, you'd render mermaid here.
              // For simplicity in this MDX renderer, we render it as a code block 
              // or you could use a dedicated mermaid react component.
              return (
                <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl overflow-x-auto my-6 text-slate-300 font-mono text-sm">
                  <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Mermaid Diagram</div>
                  <pre>{String(children).replace(/\n$/, '')}</pre>
                </div>
              );
            }

            return !inline && match ? (
              <div className="relative group my-8 rounded-[16px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="absolute top-0 left-0 w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 font-mono flex items-center justify-between">
                  <span>{language}</span>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-slate-900 dark:hover:text-white" onClick={() => navigator.clipboard.writeText(String(children))}>Copy</button>
                </div>
                <div className="pt-10 bg-[#0F172A]">
                  <SyntaxHighlighter
                    style={atomDark}
                    language={language}
                    PreTag="div"
                    customStyle={{ background: 'transparent', padding: '1.5rem', margin: 0 }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              </div>
            ) : (
              <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md text-sm text-[#EF4444] dark:text-[#6DDA6E]" {...props}>
                {children}
              </code>
            );
          },
          h1: ({node, ...props}) => <h1 className="text-[48px] tracking-tight mb-8" {...props} />,
          h2: ({node, ...props}) => {
             const id = props.children?.toString().toLowerCase().replace(/\s+/g, '-');
             return <h2 id={id} className="text-[36px] mt-[80px] scroll-mt-24 border-b border-slate-200 dark:border-slate-800 pb-4" {...props} />;
          },
          h3: ({node, ...props}) => <h3 className="text-[28px] mt-12" {...props} />,
          table: ({node, ...props}) => (
             <div className="overflow-x-auto my-8 border border-slate-200 dark:border-slate-800 rounded-xl">
               <table className="w-full text-left border-collapse" {...props} />
             </div>
          ),
          th: ({node, ...props}) => <th className="bg-slate-50 dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 font-medium" {...props} />,
          td: ({node, ...props}) => <td className="p-4 border-b border-slate-100 dark:border-slate-800/50" {...props} />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
