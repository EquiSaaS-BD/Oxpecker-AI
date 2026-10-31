"use client";

import { useState } from "react";
import { 
  Bot, 
  Stethoscope, 
  Pill, 
  FileText, 
  Activity, 
  Apple, 
  Building2, 
  User, 
  HeartPulse, 
  ImageIcon, 
  Maximize2, 
  X, 
  ExternalLink 
} from "lucide-react";
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
  "লক্ষণ (Symptoms)": Stethoscope,
  "প্রেসক্রিপশন (Prescription)": FileText,
  "ওষুধ (Medicines)": Pill,
  "পুষ্টি (Nutrition)": Apple,
  "হাসপাতাল (Hospitals)": Building2,
};

interface MessageBubbleProps {
  role: "user" | "bot";
  content: string;
  imageUrl?: string;
  imageName?: string;
  fileSize?: string;
}

/**
 * Robust parser for structured JSON and recommendation blocks.
 * Extracts tagged blocks (```json:type), untagged blocks, and raw "Output for recommendation: { ... }" text.
 */
function parseStructuredBlocks(content: string) {
  const blocks: { type: string; data: any }[] = [];
  const seenSpecialities = new Set<string>();

  // 1. Tagged blocks: ```json:block_type { ... } ```
  const taggedRegex = /```json:([\w_]+)\s*\n?([\s\S]*?)```/g;
  let match;
  while ((match = taggedRegex.exec(content)) !== null) {
    try {
      const data = JSON.parse(match[2].trim());
      blocks.push({ type: match[1], data });
      if (data.speciality) seenSpecialities.add(data.speciality);
    } catch {}
  }

  // 2. Untagged code blocks: ```json { "speciality": ... } ```
  const untaggedCodeRegex = /```(?:json)?\s*\n?(\{[\s\S]*?\})\s*```/g;
  while ((match = untaggedCodeRegex.exec(content)) !== null) {
    try {
      const data = JSON.parse(match[1].trim());
      if (data.speciality && !seenSpecialities.has(data.speciality)) {
        blocks.push({ type: "doctor_recommendation", data });
        seenSpecialities.add(data.speciality);
      } else if (data.hospital && !blocks.some((b) => b.type === "hospital_recommendation")) {
        blocks.push({ type: "hospital_recommendation", data });
      }
    } catch {}
  }

  // 3. Raw text recommendations: e.g. "Output for clinic/specialist recommendation: { ... }"
  const rawRecommendationRegex = /(?:Output for )?(?:clinic\/?specialist|specialist|doctor|hospital) recommendation:?\s*(\{[\s\S]*?\})/gi;
  while ((match = rawRecommendationRegex.exec(content)) !== null) {
    try {
      const data = JSON.parse(match[1].trim());
      if (data.speciality && !seenSpecialities.has(data.speciality)) {
        blocks.push({ type: "doctor_recommendation", data });
        seenSpecialities.add(data.speciality);
      } else if (data.hospital && !blocks.some((b) => b.type === "hospital_recommendation")) {
        blocks.push({ type: "hospital_recommendation", data });
      }
    } catch {}
  }

  // 4. Raw JSON object containing "speciality": "..." anywhere in the output
  const rawSpecialityRegex = /(\{\s*"speciality"\s*:\s*"[^"]+"[\s\S]*?\})/g;
  while ((match = rawSpecialityRegex.exec(content)) !== null) {
    try {
      const data = JSON.parse(match[1].trim());
      if (data.speciality && !seenSpecialities.has(data.speciality)) {
        blocks.push({ type: "doctor_recommendation", data });
        seenSpecialities.add(data.speciality);
      }
    } catch {}
  }

  return blocks;
}

/**
 * Removes raw JSON blocks, code tags, and "Output for recommendation: { ... }" from visible text
 */
function cleanContent(content: string): string {
  return content
    .replace(/```json:[\w_]+\s*\n?[\s\S]*?```/g, "")
    .replace(/```(?:json)?\s*\n?\{[\s\S]*?"speciality"[\s\S]*?\}\s*```/g, "")
    .replace(/(?:Output for )?(?:clinic\/?specialist|specialist|doctor|hospital) recommendation:?\s*\{[\s\S]*?\}/gi, "")
    .replace(/\{\s*"speciality"\s*:\s*"[^"]+"[\s\S]*?\}/g, "")
    .replace(/(?:Output for )?(?:clinic\/?specialist|specialist|doctor|hospital) recommendation:?/gi, "")
    .trim();
}

/**
 * Extract image data from markdown or content if not explicitly passed as prop
 */
function extractImageFromContent(content: string): { cleanText: string; detectedImageUrl?: string } {
  // Check for markdown image: ![...](image_url)
  const mdImgMatch = content.match(/!\[([^\]]*)\]\((data:image\/[^;]+;base64,[^)]+|https?:\/\/[^)]+)\)/);
  if (mdImgMatch) {
    const cleanText = content.replace(mdImgMatch[0], "").trim();
    return { cleanText, detectedImageUrl: mdImgMatch[2] };
  }

  // Check for [IMAGE:url]
  const tagImgMatch = content.match(/\[IMAGE:(data:image\/[^;]+;base64,[^\]]+|https?:\/\/[^\]]+)\]/);
  if (tagImgMatch) {
    const cleanText = content.replace(tagImgMatch[0], "").trim();
    return { cleanText, detectedImageUrl: tagImgMatch[1] };
  }

  return { cleanText: content };
}

export function MessageBubble({ role, content, imageUrl: explicitImageUrl, imageName, fileSize }: MessageBubbleProps) {
  const isUser = role === "user";
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Extract any embedded image or use explicit prop
  const { cleanText: textAfterImageExtraction, detectedImageUrl } = isUser 
    ? extractImageFromContent(content) 
    : { cleanText: content };

  const activeImageUrl = explicitImageUrl || detectedImageUrl;

  // Clean legacy text like "Uploaded: **filename.jpg** (Analyzing Medical Image)"
  let userDisplayPrompt = textAfterImageExtraction;
  if (isUser && userDisplayPrompt.startsWith("Uploaded:")) {
    // If it has prompt quotes like: Uploaded: **file** (Label)\n\n"My prompt"
    const quoteMatch = userDisplayPrompt.match(/\n\n"([\s\S]*?)"$/);
    if (quoteMatch) {
      userDisplayPrompt = quoteMatch[1];
    } else {
      userDisplayPrompt = ""; // image only
    }
  } else if (isUser && userDisplayPrompt.startsWith("[Uploaded File:")) {
    const afterFile = userDisplayPrompt.replace(/\[Uploaded File:[^\]]+\]\n*/g, "").trim();
    userDisplayPrompt = afterFile;
  }

  // Parse structured blocks from bot messages
  const structuredBlocks = !isUser ? parseStructuredBlocks(content) : [];
  const cleanedContent = !isUser ? cleanContent(content) : userDisplayPrompt;

  return (
    <>
      <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
        <div className={`flex gap-3 sm:gap-4 max-w-full ${isUser ? "flex-row-reverse w-[720px]" : "w-[760px]"}`}>
          
          {/* Avatar */}
          <div className={`shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mt-1 ${
            isUser ? "bg-slate-200 text-slate-700 hidden md:flex font-bold text-sm shadow-xs" : "bg-white ring-1 ring-emerald-500/20 shadow-sm relative overflow-hidden"
          }`}>
            {isUser ? <span>R</span> : <Image src="/images/Oxpecker_icon.png" alt="AI" fill sizes="40px" className="object-contain p-2" />}
          </div>

          {/* Message Content Container */}
          <div className={`flex-1 min-w-0 ${isUser ? "" : "pt-1"}`}>
            {isUser ? (
              <div className="font-bengali text-[15px] sm:text-[16px] text-slate-800 leading-relaxed whitespace-pre-wrap flex flex-col items-end gap-2">
                
                {/* 1. Mode Pill if present */}
                {content.startsWith("|MODE:") && (
                  <div className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-[12px] font-bold border border-emerald-200/80 flex items-center gap-1.5 shadow-2xs">
                    {(() => {
                      const modeTitle = content.split("|")[1].replace("MODE:", "");
                      const Icon = MODE_ICONS[modeTitle] || Activity;
                      return (
                        <>
                          <Icon size={14} className="text-emerald-600" />
                          <span>{modeTitle}</span>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* 2. ChatGPT-Style User Image Thumbnail Preview */}
                {activeImageUrl && (
                  <div 
                    onClick={() => setLightboxOpen(true)}
                    className="relative group rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white cursor-pointer hover:shadow-md transition-all max-w-[240px] sm:max-w-[280px]"
                  >
                    <div className="relative w-full h-[180px] sm:h-[200px] bg-slate-100 flex items-center justify-center">
                      <img 
                        src={activeImageUrl} 
                        alt={imageName || "Uploaded medical attachment"} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="p-2 rounded-full bg-white/90 text-slate-900 shadow-lg">
                          <Maximize2 size={16} />
                        </span>
                      </div>
                    </div>

                    {/* Image Footer Label */}
                    <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] font-bold text-slate-700">
                      <span className="truncate flex items-center gap-1.5">
                        <ImageIcon size={14} className="text-emerald-600 shrink-0" />
                        {imageName || "Medical Image"}
                      </span>
                      {fileSize && (
                        <span className="text-slate-400 font-mono text-[10px] shrink-0">{fileSize}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. User Text Bubble */}
                {cleanedContent && (
                  <div className="bg-slate-100/90 hover:bg-slate-100 text-slate-800 px-5 py-3 rounded-2xl rounded-tr-xs shadow-2xs font-medium">
                    {cleanedContent}
                  </div>
                )}

              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Clean Markdown content */}
                {cleanedContent && (
                  <div className="font-bengali prose prose-slate max-w-none text-[15px] sm:text-[16px] leading-[1.8] prose-p:mb-3.5 prose-headings:font-bold prose-headings:tracking-normal prose-a:text-emerald-600 hover:prose-a:underline prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-200 prose-pre:text-slate-800">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ node, ...props }) => (
                          <div className="my-4 w-full overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs bg-white">
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

                {/* Visual Structured Cards (Replaces Raw JSON & Brackets) */}
                {structuredBlocks.map((block, idx) => (
                  <div key={idx} className="mt-3 w-full">
                    {block.type === "doctor_recommendation" && (
                      <DoctorRecommendationLoader data={block.data} />
                    )}
                    {block.type === "hospital_recommendation" && (
                      <HospitalRecommendationLoader data={block.data} />
                    )}
                    {block.type === "medicine_recommendation" && (
                      <MedicineRecommendationLoader data={block.data} />
                    )}
                    {block.type === "emergency_alert" && (
                      <EmergencyAlert alert={block.data} />
                    )}
                    {block.type === "prescription" && (
                      <PrescriptionCard data={block.data} />
                    )}
                    {block.type === "nutrition" && (
                      <NutritionCard data={block.data} />
                    )}
                    {block.type === "report" && (
                      <ReportCard data={block.data} />
                    )}
                  </div>
                ))}

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal for High-Res Image Zoom */}
      {lightboxOpen && activeImageUrl && (
        <div 
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
            >
              <X size={18} />
            </button>
            <img 
              src={activeImageUrl} 
              alt={imageName || "Enlarged medical image"} 
              className="max-h-[82vh] w-auto object-contain rounded-xl mx-auto"
            />
          </div>
        </div>
      )}
    </>
  );
}