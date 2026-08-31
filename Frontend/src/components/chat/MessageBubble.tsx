"use client";

import { Bot, Stethoscope, Pill, FileText, Activity, Apple, Building2, User, HeartPulse } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DoctorRecommendationLoader, HospitalRecommendationLoader, MedicineRecommendationLoader } from "./cards/RecommendationLoaders";
import { EmergencyAlert } from "./cards/EmergencyAlert";
import { NutritionCard } from "./cards/NutritionCard";
import { PrescriptionCard } from "./cards/PrescriptionCard";
import { ReportCard } from "./cards/ReportCard";

const MODE_ICONS: Record<string, any> = {
  "Analyze my symptoms": Stethoscope,
  "Compare medicines": Pill,
  "Scan prescription": FileText,
  "Analyze blood report": Activity,
  "Calculate food calories": Apple,
  "Find nearby hospitals": Building2,
  "Find a specialist doctor": User,
  "Check health risks": HeartPulse,
};

interface MessageBubbleProps {
  role: "user" | "bot";
  content: string;
}

/**
 * Parses structured JSON blocks from AI response.
 * Format: ```json:block_type { ... } ```
 */
function parseStructuredBlocks(content: string) {
  const blocks: { type: string; data: any; start: number; end: number }[] = [];
  const regex = /```json:([\w_]+)\s*\n?([\s\S]*?)```/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    try {
      const data = JSON.parse(match[2].trim());
      blocks.push({
        type: match[1],
        data,
        start: match.index,
        end: match.index + match[0].length,
      });
    } catch {
      // Skip invalid JSON
    }
  }

  return blocks;
}

/**
 * Removes structured JSON blocks from content for clean markdown rendering
 */
function cleanContent(content: string): string {
  return content.replace(/```json:[\w_]+\s*\n?[\s\S]*?```/g, '').trim();
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  // Parse structured blocks from bot messages
  const structuredBlocks = !isUser ? parseStructuredBlocks(content) : [];
  const cleanedContent = !isUser && structuredBlocks.length > 0 
    ? cleanContent(content) 
    : content;

  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div className={`flex gap-4 max-w-full ${isUser ? "flex-row-reverse w-[720px]" : "w-[760px]"}`}>
        
        {/* Avatar */}
        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-1 ${isUser ? "bg-slate-200 text-slate-600 hidden md:flex" : "bg-primary/5 ring-1 ring-primary/20 shadow-sm relative overflow-hidden"}`}>
          {isUser ? <span className="text-sm font-bold">R</span> : <Image src="/images/Oxpecker_icon.png" alt="AI" fill sizes="40px" className="object-contain p-2" />}
        </div>

        {/* Message Content */}
        <div className={`flex-1 min-w-0 ${isUser ? "" : "pt-1"}`}>
          {isUser ? (
            <div className="text-[16px] text-slate-800 leading-relaxed whitespace-pre-wrap flex flex-col items-end gap-1.5">
              {content.startsWith('|MODE:') ? (
                <>
                  <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-[12px] font-bold border border-primary/20 flex items-center gap-1.5 shadow-sm">
                    {(() => {
                      const modeTitle = content.split('|')[1].replace('MODE:', '');
                      const Icon = MODE_ICONS[modeTitle] || Activity;
                      return (
                        <>
                          <Icon size={14} />
                          {modeTitle}
                        </>
                      );
                    })()}
                  </div>
                  {content.split('|').slice(2).join('|') && (
                    <div className="bg-slate-50 px-5 py-3.5 rounded-3xl rounded-tr-sm">
                      {content.split('|').slice(2).join('|')}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-slate-50 px-5 py-3.5 rounded-3xl rounded-tr-sm">
                  {content}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Markdown content */}
              {cleanedContent && (
                <div className="prose prose-slate max-w-none text-[16px] leading-relaxed prose-p:mb-4 prose-headings:font-semibold prose-a:text-primary hover:prose-a:underline prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-200 prose-pre:text-slate-800">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ node, ...props }) => (
                        <div className="my-4 w-full overflow-x-auto rounded-2xl border border-slate-200 shadow-xs bg-white">
                          <table className="w-full text-left text-sm border-collapse" {...props} />
                        </div>
                      ),
                      thead: ({ node, ...props }) => (
                        <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-900 font-bold" {...props} />
                      ),
                      th: ({ node, ...props }) => (
                        <th className="px-4 py-3 font-bold border-r last:border-r-0 border-slate-200 text-slate-800" {...props} />
                      ),
                      td: ({ node, ...props }) => (
                        <td className="px-4 py-2.5 border-t border-r last:border-r-0 border-slate-100 text-slate-700 font-medium" {...props} />
                      ),
                    }}
                  >
                    {cleanedContent}
                  </ReactMarkdown>
                </div>
              )}

              {/* Structured cards */}
              {structuredBlocks.map((block, idx) => (
                <div key={idx} className="mt-3 w-full">
                  {block.type === 'doctor_recommendation' && (
                    <DoctorRecommendationLoader data={block.data} />
                  )}
                  {block.type === 'hospital_recommendation' && (
                    <HospitalRecommendationLoader data={block.data} />
                  )}
                  {block.type === 'medicine_info' && (
                    <MedicineRecommendationLoader data={block.data} />
                  )}
                  {block.type === 'emergency_alert' && (
                    <EmergencyAlert alert={block.data} />
                  )}
                  {block.type === 'nutrition_analysis' && (
                    <NutritionCard data={block.data} />
                  )}
                  {block.type === 'prescription_analysis' && (
                    <PrescriptionCard data={block.data} />
                  )}
                  {block.type === 'report_analysis' && (
                    <ReportCard data={block.data} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
