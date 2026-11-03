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
  ExternalLink,
  PlaySquare,
  Video
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

  return blocks;
}

/**
 * Extracts and separates YouTube video IDs from text
 */
function extractYouTubeVideos(content: string): { cleanContent: string; videoIds: string[] } {
  const videoIds: string[] = [];

  // Tag pattern: [YOUTUBE:id]
  const tagRegex = /\[YOUTUBE:([a-zA-Z0-9_-]{11})\]/g;
  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    if (!videoIds.includes(match[1])) {
      videoIds.push(match[1]);
    }
  }

  // Standalone link pattern: https://www.youtube.com/watch?v=... or https://youtu.be/...
  const ytUrlRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
  while ((match = ytUrlRegex.exec(content)) !== null) {
    if (!videoIds.includes(match[1])) {
      videoIds.push(match[1]);
    }
  }

  // Remove [YOUTUBE:id] tags from raw text so they render cleanly via iframe
  const cleanContent = content.replace(/\[YOUTUBE:[a-zA-Z0-9_-]{11}\]/g, "").trim();

  return { cleanContent, videoIds };
}

/**
 * Removes raw JSON blocks, code tags, and recommendation dumps from visible text
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
  const mdImgMatch = content.match(/!\[([^\]]*)\]\((data:image\/[^;]+;base64,[^)]+|https?:\/\/[^)]+)\)/);
  if (mdImgMatch) {
    const cleanText = content.replace(mdImgMatch[0], "").trim();
    return { cleanText, detectedImageUrl: mdImgMatch[2] };
  }

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
  const [activeZoomUrl, setActiveZoomUrl] = useState<string | null>(null);

  // Extract embedded image or use explicit prop
  const { cleanText: textAfterImageExtraction, detectedImageUrl } = isUser 
    ? extractImageFromContent(content) 
    : { cleanText: content };

  const userImageUrl = explicitImageUrl || detectedImageUrl;

  // Clean legacy text like "Uploaded: **filename.jpg**"
  let userDisplayPrompt = textAfterImageExtraction;
  if (isUser && userDisplayPrompt.startsWith("Uploaded:")) {
    const quoteMatch = userDisplayPrompt.match(/\n\n"([\s\S]*?)"$/);
    userDisplayPrompt = quoteMatch ? quoteMatch[1] : "";
  } else if (isUser && userDisplayPrompt.startsWith("[Uploaded File:")) {
    userDisplayPrompt = userDisplayPrompt.replace(/\[Uploaded File:[^\]]+\]\n*/g, "").trim();
  }

  // Parse structured blocks & YouTube videos from bot messages
  const structuredBlocks = !isUser ? parseStructuredBlocks(content) : [];
  const initialCleaned = !isUser ? cleanContent(content) : userDisplayPrompt;
  const { cleanContent: finalBotContent, videoIds } = !isUser ? extractYouTubeVideos(initialCleaned) : { cleanContent: initialCleaned, videoIds: [] };

  return (
    <>
      <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
        <div className={`flex gap-3 sm:gap-4 max-w-full ${isUser ? "flex-row-reverse w-[720px]" : "w-[760px]"}`}>
          
          {/* Avatar */}
          <div className={`shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mt-1 ${
            isUser ? "bg-slate-200 text-slate-700 hidden md:flex font-bold text-sm shadow-xs" : "bg-white ring-1 ring-sky-500/20 shadow-sm relative overflow-hidden"
          }`}>
            {isUser ? <span>R</span> : <Image src="/images/Oxpecker_icon.png" alt="Oxpecker AI" fill sizes="40px" className="object-contain p-2" />}
          </div>

          {/* Message Content Container */}
          <div className={`flex-1 min-w-0 ${isUser ? "" : "pt-1"}`}>
            {isUser ? (
              <div className="font-bengali text-[15px] sm:text-[16px] text-slate-800 leading-relaxed whitespace-pre-wrap flex flex-col items-end gap-2">
                
                {/* 1. Mode Pill if present */}
                {content.startsWith("|MODE:") && (
                  <div className="bg-sky-50 text-sky-800 px-3 py-1 rounded-full text-[12px] font-bold border border-sky-200/80 flex items-center gap-1.5 shadow-2xs">
                    {(() => {
                      const modeTitle = content.split("|")[1].replace("MODE:", "");
                      const Icon = MODE_ICONS[modeTitle] || Activity;
                      return (
                        <>
                          <Icon size={14} className="text-sky-600" />
                          <span>{modeTitle}</span>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* 2. User Image Thumbnail Preview */}
                {userImageUrl && (
                  <div 
                    onClick={() => {
                      setActiveZoomUrl(userImageUrl);
                      setLightboxOpen(true);
                    }}
                    className="relative group rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white cursor-pointer hover:shadow-md transition-all max-w-[240px] sm:max-w-[280px]"
                  >
                    <div className="relative w-full h-[180px] sm:h-[200px] bg-slate-100 flex items-center justify-center">
                      <img 
                        src={userImageUrl} 
                        alt={imageName || "Medical Attachment"} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="p-2 rounded-full bg-white/90 text-slate-900 shadow-lg">
                          <Maximize2 size={16} />
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] font-bold text-slate-700">
                      <span className="truncate flex items-center gap-1.5">
                        <ImageIcon size={14} className="text-sky-600 shrink-0" />
                        {imageName || "Medical Image"}
                      </span>
                      {fileSize && (
                        <span className="text-slate-400 font-mono text-[10px] shrink-0">{fileSize}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. User Text Bubble */}
                {userDisplayPrompt && (
                  <div className="bg-slate-100/90 hover:bg-slate-100 text-slate-800 px-5 py-3 rounded-2xl rounded-tr-xs shadow-2xs font-medium">
                    {userDisplayPrompt}
                  </div>
                )}

              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Clean Markdown Content with Interactive Tables & Links */}
                {finalBotContent && (
                  <div className="font-bengali prose prose-slate max-w-none text-[15px] sm:text-[16px] leading-[1.8] prose-p:mb-3.5 prose-headings:font-bold prose-headings:tracking-normal prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-200 prose-pre:text-slate-800">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // 1. High-Precision Responsive Clinical Table
                        table: ({ node, ...props }) => (
                          <div className="my-4 w-full overflow-x-auto rounded-2xl border border-slate-200/90 shadow-2xs bg-white scrollbar-thin">
                            <table className="w-full text-left text-sm border-collapse" {...props} />
                          </div>
                        ),
                        thead: ({ node, ...props }) => (
                          <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-800 font-extrabold text-xs uppercase tracking-wider" {...props} />
                        ),
                        th: ({ node, ...props }) => (
                          <th className="px-4 py-3 font-bold border-r last:border-r-0 border-slate-200 text-slate-900" {...props} />
                        ),
                        tr: ({ node, ...props }) => (
                          <tr className="border-b last:border-b-0 border-slate-100 even:bg-slate-50/50 hover:bg-sky-50/40 transition-colors" {...props} />
                        ),
                        td: ({ node, ...props }) => (
                          <td className="px-4 py-3 border-r last:border-r-0 border-slate-100 text-slate-700 font-medium" {...props} />
                        ),

                        // 2. Clickable Links with Seamless Routing
                        a: ({ node, href, children, ...props }) => {
                          const isInternal = href && (href.startsWith('/') || href.startsWith('#'));
                          if (isInternal) {
                            return (
                              <Link 
                                href={href || '#'} 
                                className="inline-flex items-center gap-1 font-bold text-sky-600 hover:text-sky-800 hover:underline decoration-sky-300 underline-offset-2 transition-colors cursor-pointer"
                                {...props}
                              >
                                {children}
                              </Link>
                            );
                          }
                          return (
                            <a 
                              href={href} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-bold text-sky-600 hover:text-sky-800 hover:underline decoration-sky-300 underline-offset-2 transition-colors cursor-pointer"
                              {...props}
                            >
                              <span>{children}</span>
                              <ExternalLink size={12} className="inline opacity-70 shrink-0" />
                            </a>
                          );
                        },

                        // 3. Embedded Images with Preview & Lightbox
                        img: ({ node, src, alt, ...props }) => {
                          if (!src) return null;
                          const imgSrc = typeof src === "string" ? src : "";
                          return (
                            <div 
                              onClick={() => {
                                if (imgSrc) setActiveZoomUrl(imgSrc);
                                setLightboxOpen(true);
                              }}
                              className="my-3.5 max-w-md rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white cursor-pointer group hover:shadow-md transition-all"
                            >
                              <div className="relative w-full h-48 sm:h-56 bg-slate-50 flex items-center justify-center overflow-hidden">
                                <img 
                                  src={imgSrc} 
                                  alt={alt || "Clinical Illustration"} 
                                  className="w-full h-full object-contain p-2 group-hover:scale-103 transition-transform duration-300" 
                                  loading="lazy"
                                  {...props}
                                />
                                <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="p-2 rounded-full bg-white/95 text-slate-900 shadow-md">
                                    <Maximize2 size={16} />
                                  </span>
                                </div>
                              </div>
                              {alt && (
                                <div className="p-2.5 bg-slate-50/80 border-t border-slate-100 text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                                  <ImageIcon size={13} className="text-sky-600 shrink-0" />
                                  <span className="truncate">{alt}</span>
                                </div>
                              )}
                            </div>
                          );
                        }
                      }}
                    >
                      {finalBotContent}
                    </ReactMarkdown>
                  </div>
                )}

                {/* 4. Interactive Embedded YouTube Players */}
                {videoIds.length > 0 && (
                  <div className="space-y-4 my-4">
                    {videoIds.map((vId, vIdx) => (
                      <div 
                        key={vIdx} 
                        className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-md bg-slate-900 max-w-xl"
                      >
                        <div className="px-4 py-2.5 bg-slate-800/90 text-white flex items-center justify-between text-xs font-bold border-b border-slate-700">
                          <span className="flex items-center gap-2 text-sky-400">
                            <PlaySquare size={16} className="text-red-500 fill-red-500" />
                            <span>স্বাস্থ্য শিক্ষা ও নির্দেশনামূলক ভিডিও (Clinical Video Guide)</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">HD 1080p</span>
                        </div>
                        <div className="relative aspect-video w-full bg-black">
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${vId}?rel=0`}
                            title="Oxpecker Health Education Video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 5. Visual Structured Cards (Doctors, Hospitals, Emergency, Medicines) */}
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
      {lightboxOpen && activeZoomUrl && (
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
              src={activeZoomUrl} 
              alt="Enlarged medical image" 
              className="max-h-[82vh] w-auto object-contain rounded-xl mx-auto"
            />
          </div>
        </div>
      )}
    </>
  );
}
