"use client";

import { useState } from "react";
import {
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
  Copy,
  Check,
  Volume2,
  VolumeX,
  Database,
  Sparkles,
  BookOpen,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  DoctorRecommendationLoader,
  HospitalRecommendationLoader,
  MedicineRecommendationLoader,
} from "./cards/RecommendationLoaders";
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

export interface MessageBubbleProps {
  role: "user" | "bot";
  content: string;
  imageUrl?: string;
  imageName?: string;
  fileSize?: string;
  onSelectFollowUp?: (question: string) => void;
}

const IMAGE_URL_PATTERN =
  /^https?:\/\/[^\s)]+(?:\.(?:png|jpe?g|webp|gif|svg)(?:\?[^\s)]*)?|\/storage\/images\/packaging\/[^\s)]+|\/storage\/res\/[^\s)]+|\/img\/dosage-forms\/[^\s)]+)$/i;

/**
 * Extracts YouTube video ID from any YouTube URL format
 */
function extractYouTubeIdFromUrl(url: string): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

/**
 * Robust parser for structured JSON, RAG citations, follow-up chips, and recommendation blocks.
 */
function parseStructuredBlocks(content: string): {
  blocks: { type: string; data: any }[];
  ragSources: any[];
  followUps: string[];
} {
  const blocks: { type: string; data: any }[] = [];
  let ragSources: any[] = [];
  let followUps: string[] = [];
  const seenSpecialities = new Set<string>();
  const seenMedNames = new Set<string>();

  // 1. Tagged blocks: ```json:block_type ... ```
  const taggedRegex = /```json:([\w_]+)\s*\n?([\s\S]*?)```/g;
  let match;
  while ((match = taggedRegex.exec(content)) !== null) {
    const blockType = match[1].trim();
    const rawJson = match[2].trim();
    try {
      const data = JSON.parse(rawJson);
      if (blockType === "rag_sources" && Array.isArray(data)) {
        ragSources = data;
      } else if (blockType === "follow_ups" && Array.isArray(data)) {
        followUps = data.filter((item) => typeof item === "string");
      } else if (blockType === "medicine_recommendation") {
        const key = String(data.name || data.generic || "").toLowerCase();
        if (!seenMedNames.has(key)) {
          seenMedNames.add(key);
          blocks.push({ type: blockType, data });
        }
      } else if (blockType === "doctor_recommendation") {
        const spec = data.speciality || data.specialty || "Medicine";
        if (!seenSpecialities.has(spec)) {
          seenSpecialities.add(spec);
          blocks.push({ type: "doctor_recommendation", data: { ...data, speciality: spec } });
        }
      } else {
        blocks.push({ type: blockType, data });
      }
    } catch {}
  }

  // 2. Untagged code blocks: ```json { "speciality": ... } ```
  const untaggedCodeRegex = /```(?:json)?\s*\n?(\{[\s\S]*?\})\s*```/g;
  while ((match = untaggedCodeRegex.exec(content)) !== null) {
    try {
      const data = JSON.parse(match[1].trim());
      const spec = data.speciality || data.specialty;
      if (spec && !seenSpecialities.has(spec)) {
        blocks.push({ type: "doctor_recommendation", data: { ...data, speciality: spec } });
        seenSpecialities.add(spec);
      } else if (data.hospital && !blocks.some((b) => b.type === "hospital_recommendation")) {
        blocks.push({ type: "hospital_recommendation", data });
      }
    } catch {}
  }

  // 3. Raw text recommendations
  const rawRecommendationRegex =
    /(?:Output for )?(?:clinic\/?specialist|specialist|doctor|hospital) recommendation:?\s*(\{[\s\S]*?\})/gi;
  while ((match = rawRecommendationRegex.exec(content)) !== null) {
    try {
      const data = JSON.parse(match[1].trim());
      const spec = data.speciality || data.specialty;
      if (spec && !seenSpecialities.has(spec)) {
        blocks.push({ type: "doctor_recommendation", data: { ...data, speciality: spec } });
        seenSpecialities.add(spec);
      } else if (data.hospital && !blocks.some((b) => b.type === "hospital_recommendation")) {
        blocks.push({ type: "hospital_recommendation", data });
      }
    } catch {}
  }

  return { blocks, ragSources, followUps };
}

/**
 * Extracts and separates YouTube video IDs from text (tags, raw links, or markdown links)
 */
function extractYouTubeVideos(content: string): { cleanContent: string; videoIds: string[] } {
  const videoIds: string[] = [];

  // 1. Tag pattern: [YOUTUBE:id]
  const tagRegex = /\[YOUTUBE:([a-zA-Z0-9_-]{11})\]/g;
  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    if (!videoIds.includes(match[1])) {
      videoIds.push(match[1]);
    }
  }

  // 2. Any YouTube URL (watch?v=, youtu.be/, embed/, shorts/)
  const ytUrlRegex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?[^\s)"']*v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})[^\s)"']*/g;
  while ((match = ytUrlRegex.exec(content)) !== null) {
    if (!videoIds.includes(match[1])) {
      videoIds.push(match[1]);
    }
  }

  // Remove [YOUTUBE:id] tags from visible markdown text so they render cleanly via the HD player card
  let cleanContent = content.replace(/\[YOUTUBE:[a-zA-Z0-9_-]{11}\]/g, "");

  // Also convert standalone bare YouTube URLs on their own line into clean player embeds
  cleanContent = cleanContent.replace(
    /^[ \t]*(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?[^\s]*v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})[^\s]*[ \t]*$/gm,
    ""
  );

  return { cleanContent: cleanContent.trim(), videoIds };
}

/**
 * Normalizes bot markdown so GFM tables, standalone image URLs, and bare links ALWAYS render properly.
 */
function normalizeBotMarkdown(content: string): string {
  let cleaned = content
    // Strip completed structured JSON blocks
    .replace(/```json:[\w_]+\s*\n?[\s\S]*?```/g, "")
    .replace(/```(?:json)?\s*\n?\{[\s\S]*?"special(?:i)?ty"[\s\S]*?\}\s*```/g, "")
    .replace(
      /(?:Output for )?(?:clinic\/?specialist|specialist|doctor|hospital) recommendation:?\s*\{[\s\S]*?\}/gi,
      ""
    )
    .replace(/\{\s*"special(?:i)?ty"\s*:\s*"[^"]+"[\s\S]*?\}/g, "")
    .replace(/(?:Output for )?(?:clinic\/?specialist|specialist|doctor|hospital) recommendation:?/gi, "")
    // Strip incomplete trailing ```json:... block while streaming so user never sees raw JSON code
    .replace(/```json:[\w_]+[\s\S]*$/g, "");

  // Convert [IMAGE:url] tags into standard Markdown images ![Clinical Illustration](url)
  cleaned = cleaned.replace(
    /\[IMAGE:(data:image\/[^;]+;base64,[^\]]+|https?:\/\/[^\]]+)\]/gi,
    "\n\n![Clinical Illustration]($1)\n\n"
  );

  // Convert standalone image URLs on their own line into Markdown images ![Clinical Image](url)
  cleaned = cleaned.replace(
    /^[ \t]*(https?:\/\/[^\s)]+(?:\.(?:png|jpe?g|webp|gif|svg)(?:\?[^\s)]*)?|\/storage\/images\/packaging\/[^\s)]+|\/storage\/res\/[^\s)]+|\/img\/dosage-forms\/[^\s)]+))[ \t]*$/gim,
    "\n\n![Official Clinical & Packaging Image]($1)\n\n"
  );

  // Ensure Markdown tables always have a blank newline before the first pipe row so remark-gfm parses them 100% of the time
  const lines = cleaned.split("\n");
  const normalizedLines: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const prevTrimmed = i > 0 ? lines[i - 1].trim() : "";

    const isTableLine = trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.split("|").length >= 3;
    const wasPrevTableLine =
      prevTrimmed.startsWith("|") && prevTrimmed.endsWith("|") && prevTrimmed.split("|").length >= 3;

    if (isTableLine && !wasPrevTableLine && prevTrimmed !== "") {
      normalizedLines.push("");
    }
    normalizedLines.push(line);
  }

  return normalizedLines.join("\n").trim();
}

/**
 * Extract image data from user message if not explicitly passed as prop
 */
function extractImageFromUserContent(content: string): { cleanText: string; detectedImageUrl?: string } {
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

export function MessageBubble({
  role,
  content,
  imageUrl: explicitImageUrl,
  imageName,
  fileSize,
  onSelectFollowUp,
}: MessageBubbleProps) {
  const isUser = role === "user";
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeZoomUrl, setActiveZoomUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sourcesExpanded, setSourcesExpanded] = useState(true);

  const { cleanText: textAfterImageExtraction, detectedImageUrl } = isUser
    ? extractImageFromUserContent(content)
    : { cleanText: content };

  const userImageUrl = explicitImageUrl || detectedImageUrl;

  let userDisplayPrompt = textAfterImageExtraction;
  if (isUser && userDisplayPrompt.startsWith("Uploaded:")) {
    const quoteMatch = userDisplayPrompt.match(/\n\n"([\s\S]*?)"$/);
    userDisplayPrompt = quoteMatch ? quoteMatch[1] : "";
  } else if (isUser && userDisplayPrompt.startsWith("[Uploaded File:")) {
    userDisplayPrompt = userDisplayPrompt.replace(/\[Uploaded File:[^\]]+\]\n*/g, "").trim();
  }

  // Parse structured blocks, RAG citations, follow-up chips & YouTube videos from bot messages
  const { blocks: structuredBlocks, ragSources, followUps } = !isUser
    ? parseStructuredBlocks(content)
    : { blocks: [], ragSources: [], followUps: [] };

  const initialCleaned = !isUser ? normalizeBotMarkdown(content) : userDisplayPrompt;
  const { cleanContent: finalBotContent, videoIds } = !isUser
    ? extractYouTubeVideos(initialCleaned)
    : { cleanContent: initialCleaned, videoIds: [] };

  const handleCopyMessage = () => {
    if (!finalBotContent) return;
    navigator.clipboard.writeText(finalBotContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const plainText = finalBotContent
      .replace(/[#*|>`~_-]/g, " ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
    if (!plainText) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(plainText);
    const hasBangla = /[\u0980-\u09FF]/.test(plainText);
    utterance.lang = hasBangla ? "bn-BD" : "en-US";
    utterance.rate = 0.98;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
        <div className={`flex gap-3 sm:gap-4 max-w-full ${isUser ? "flex-row-reverse w-[720px]" : "w-[800px]"}`}>
          {/* Avatar */}
          <div
            className={`shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mt-1 ${
              isUser
                ? "bg-slate-200 text-slate-700 hidden md:flex font-bold text-sm shadow-xs"
                : "bg-white ring-1 ring-sky-500/20 shadow-sm relative overflow-hidden"
            }`}
          >
            {isUser ? (
              <span>R</span>
            ) : (
              <Image
                src="/images/Oxpecker_icon.png"
                alt="Oxpecker AI"
                fill
                sizes="40px"
                className="object-contain p-2"
              />
            )}
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
                {/* Clean Markdown Content with Interactive Tables, Clickable Links & Inline Images */}
                {finalBotContent && (
                  <div className="font-bengali prose prose-slate max-w-none text-[15px] sm:text-[16px] leading-[1.8] prose-p:mb-3.5 prose-headings:font-bold prose-headings:tracking-normal prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-200 prose-pre:text-slate-800">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // 1. High-Precision Responsive Clinical Table
                        table: ({ node, ...props }) => (
                          <div className="my-4 w-full overflow-hidden rounded-2xl border border-slate-200/90 shadow-xs bg-white">
                            <div className="px-4 py-2 bg-slate-900 text-white flex items-center justify-between text-xs font-bold">
                              <span className="flex items-center gap-1.5 text-sky-300">
                                <Database size={13} />
                                <span>ভেরিফায়েড ক্লিনিক্যাল ও ফার্মাকোলজি টেবিল (RAG Data Table)</span>
                              </span>
                              <span className="text-[10px] text-slate-300 font-mono uppercase">Interactive</span>
                            </div>
                            <div className="w-full overflow-x-auto scrollbar-thin">
                              <table className="w-full text-left text-sm border-collapse m-0" {...props} />
                            </div>
                          </div>
                        ),
                        thead: ({ node, ...props }) => (
                          <thead
                            className="bg-slate-100/95 border-b border-slate-200 text-slate-800 font-extrabold text-xs uppercase tracking-wider"
                            {...props}
                          />
                        ),
                        th: ({ node, ...props }) => (
                          <th
                            className="px-4 py-3 font-extrabold border-r last:border-r-0 border-slate-200/80 text-slate-900 whitespace-nowrap"
                            {...props}
                          />
                        ),
                        tr: ({ node, ...props }) => (
                          <tr
                            className="border-b last:border-b-0 border-slate-100 even:bg-slate-50/60 hover:bg-sky-50/50 transition-colors"
                            {...props}
                          />
                        ),
                        td: ({ node, ...props }) => (
                          <td
                            className="px-4 py-3 border-r last:border-r-0 border-slate-100 text-slate-700 font-medium align-top"
                            {...props}
                          />
                        ),

                        // 2. Smart Clickable Links (Renders Images & YouTube Links if pointed to media, or Styled Pills for Internal/External Routes)
                        a: ({ node, href, children, ...props }) => {
                          const cleanHref = (href || "").trim();

                          // Check if this link is actually an Image URL
                          if (IMAGE_URL_PATTERN.test(cleanHref)) {
                            return (
                              <span
                                onClick={(e) => {
                                  e.preventDefault();
                                  setActiveZoomUrl(cleanHref);
                                  setLightboxOpen(true);
                                }}
                                className="my-3 block max-w-md rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white cursor-pointer group hover:shadow-md transition-all"
                              >
                                <span className="relative w-full h-48 sm:h-56 bg-slate-50 flex items-center justify-center overflow-hidden">
                                  <img
                                    src={cleanHref}
                                    alt={String(children || "Clinical Image")}
                                    className="w-full h-full object-contain p-2 group-hover:scale-103 transition-transform duration-300"
                                    loading="lazy"
                                  />
                                </span>
                                <span className="p-2.5 bg-slate-50 border-t border-slate-100 text-xs font-bold text-sky-700 flex items-center justify-between">
                                  <span className="truncate flex items-center gap-1.5">
                                    <ImageIcon size={13} />
                                    {children || "ছবি বড় করে দেখুন"}
                                  </span>
                                  <Maximize2 size={13} />
                                </span>
                              </span>
                            );
                          }

                          // Check if this link is a YouTube link
                          const ytId = extractYouTubeIdFromUrl(cleanHref);
                          if (ytId) {
                            return (
                              <a
                                href={`https://www.youtube.com/watch?v=${ytId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-bold text-xs transition-colors no-underline mx-0.5"
                                {...props}
                              >
                                <PlaySquare size={13} className="text-red-600 shrink-0" />
                                <span>{children}</span>
                                <ExternalLink size={11} className="opacity-75 shrink-0" />
                              </a>
                            );
                          }

                          // Internal Route Links (/medicines/..., /doctors..., /hospitals...)
                          const isInternal = cleanHref.startsWith("/") || cleanHref.startsWith("#");
                          if (isInternal) {
                            const isMedLink = cleanHref.startsWith("/medicines");
                            const isDocLink = cleanHref.startsWith("/doctors");
                            const isHospLink = cleanHref.startsWith("/hospitals");
                            return (
                              <Link
                                href={cleanHref || "#"}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold text-[13.5px] transition-all cursor-pointer no-underline mx-0.5 border ${
                                  isMedLink
                                    ? "bg-sky-50 text-sky-700 border-sky-200/80 hover:bg-sky-600 hover:text-white"
                                    : isDocLink
                                    ? "bg-indigo-50 text-indigo-700 border-indigo-200/80 hover:bg-indigo-600 hover:text-white"
                                    : isHospLink
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-600 hover:text-white"
                                    : "text-sky-600 hover:text-sky-800 border-transparent underline"
                                }`}
                                {...props}
                              >
                                {isMedLink && <Pill size={12} className="shrink-0" />}
                                {isDocLink && <Stethoscope size={12} className="shrink-0" />}
                                {isHospLink && <Building2 size={12} className="shrink-0" />}
                                <span>{children}</span>
                                <ArrowUpRight size={12} className="shrink-0 opacity-75" />
                              </Link>
                            );
                          }

                          // External Links (PubMed, MedEx, WHO, etc.)
                          return (
                            <a
                              href={cleanHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-sky-700 hover:text-sky-800 border border-slate-200/80 hover:border-sky-300 font-bold text-[13.5px] transition-colors cursor-pointer no-underline mx-0.5"
                              {...props}
                            >
                              <span>{children}</span>
                              <ExternalLink size={11} className="inline opacity-75 shrink-0" />
                            </a>
                          );
                        },

                        // 3. Embedded Images with Preview, Lightbox & Direct Link
                        img: ({ node, src, alt, ...props }) => {
                          if (!src) return null;
                          const imgSrc = typeof src === "string" ? src : "";
                          return (
                            <span className="my-4 block max-w-md rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white group hover:shadow-md transition-all">
                              <span
                                onClick={() => {
                                  if (imgSrc) setActiveZoomUrl(imgSrc);
                                  setLightboxOpen(true);
                                }}
                                className="relative w-full h-48 sm:h-56 bg-slate-50/70 flex items-center justify-center overflow-hidden cursor-zoom-in p-3"
                              >
                                <img
                                  src={imgSrc}
                                  alt={alt || "Clinical Illustration"}
                                  className="max-h-full max-w-full object-contain group-hover:scale-103 transition-transform duration-300"
                                  loading="lazy"
                                  {...props}
                                />
                                <span className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="px-3 py-1.5 rounded-full bg-white/95 text-slate-900 shadow-md text-xs font-bold flex items-center gap-1.5">
                                    <Maximize2 size={14} />
                                    <span>বড় করে দেখুন (Zoom)</span>
                                  </span>
                                </span>
                              </span>
                              <span className="px-3.5 py-2.5 bg-slate-50/90 border-t border-slate-100 text-xs font-bold text-slate-700 flex items-center justify-between gap-2">
                                <span className="truncate flex items-center gap-1.5">
                                  <ImageIcon size={14} className="text-sky-600 shrink-0" />
                                  <span className="truncate">{alt || "অফিশিয়াল মেডিকেল ইমেজ"}</span>
                                </span>
                                <a
                                  href={imgSrc}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[11px] text-sky-600 hover:underline flex items-center gap-1 shrink-0"
                                >
                                  <span>মূল ছবি</span>
                                  <ExternalLink size={11} />
                                </a>
                              </span>
                            </span>
                          );
                        },
                      }}
                    >
                      {finalBotContent}
                    </ReactMarkdown>
                  </div>
                )}

                {/* 4. Interactive Embedded YouTube Players with Direct Clickable Link */}
                {videoIds.length > 0 && (
                  <div className="space-y-4 my-4">
                    {videoIds.map((vId, vIdx) => (
                      <div
                        key={vIdx}
                        className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-md bg-slate-900 max-w-xl"
                      >
                        <div className="px-4 py-2.5 bg-slate-800/95 text-white flex items-center justify-between gap-2 text-xs font-bold border-b border-slate-700">
                          <span className="flex items-center gap-2 text-sky-400 truncate">
                            <PlaySquare size={16} className="text-red-500 fill-red-500 shrink-0" />
                            <span className="truncate">স্বাস্থ্য শিক্ষা ও নির্দেশনামূলক ভিডিও (Clinical Video Guide)</span>
                          </span>
                          <a
                            href={`https://www.youtube.com/watch?v=${vId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors no-underline"
                          >
                            <span>YouTube-এ দেখুন</span>
                            <ExternalLink size={11} />
                          </a>
                        </div>
                        <div className="relative aspect-video w-full bg-black">
                          <iframe
                            src={`https://www.youtube.com/embed/${vId}?rel=0`}
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

                {/* 5. Visual Structured Cards (Medicines, Doctors, Hospitals, Emergency) */}
                {structuredBlocks.map((block, idx) => (
                  <div key={idx} className="mt-3 w-full">
                    {block.type === "medicine_recommendation" && (
                      <MedicineRecommendationLoader data={block.data} />
                    )}
                    {block.type === "doctor_recommendation" && (
                      <DoctorRecommendationLoader data={block.data} />
                    )}
                    {block.type === "hospital_recommendation" && (
                      <HospitalRecommendationLoader data={block.data} />
                    )}
                    {block.type === "emergency_alert" && <EmergencyAlert alert={block.data} />}
                    {block.type === "prescription" && <PrescriptionCard data={block.data} />}
                    {block.type === "nutrition" && <NutritionCard data={block.data} />}
                    {block.type === "report" && <ReportCard data={block.data} />}
                  </div>
                ))}

                {/* 6. Verified RAG Clinical Sources & Evidence Drawer */}
                {ragSources.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/40 overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setSourcesExpanded(!sourcesExpanded)}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-emerald-50/80 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                        <span className="text-xs font-extrabold text-emerald-950">
                          ভেরিফায়েড মেডিকেল রিসোর্স ও RAG রেফারেন্স ({ragSources.length}টি উৎস যাচাইকৃত)
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {sourcesExpanded ? "সংক্ষিপ্ত করুন" : "বিস্তারিত দেখুন"}
                      </span>
                    </button>

                    {sourcesExpanded && (
                      <div className="px-4 pb-3 pt-1 border-t border-emerald-100/90 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ragSources.map((src, sIdx) => {
                          const isInternal = src.url && src.url.startsWith("/");
                          const contentNode = (
                            <div className="p-2.5 rounded-xl bg-white border border-emerald-200/60 hover:border-emerald-400 transition-all h-full flex flex-col justify-between group">
                              <div>
                                <div className="flex items-center justify-between gap-1.5 mb-1">
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-800">
                                    {src.sourceType || "Clinical Source"}
                                  </span>
                                  {src.url && (
                                    <ExternalLink
                                      size={12}
                                      className="text-slate-400 group-hover:text-emerald-600 shrink-0"
                                    />
                                  )}
                                </div>
                                <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 line-clamp-1">
                                  {src.title}
                                </p>
                              </div>
                              {src.snippet && (
                                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                                  {src.snippet}
                                </p>
                              )}
                            </div>
                          );

                          if (src.url) {
                            return isInternal ? (
                              <Link key={sIdx} href={src.url} className="no-underline">
                                {contentNode}
                              </Link>
                            ) : (
                              <a
                                key={sIdx}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="no-underline"
                              >
                                {contentNode}
                              </a>
                            );
                          }
                          return <div key={sIdx}>{contentNode}</div>;
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 7. Interactive Follow-Up Suggestion Chips */}
                {followUps.length > 0 && onSelectFollowUp && (
                  <div className="pt-2">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <Sparkles size={12} className="text-sky-500" />
                      <span>পরবর্তী সম্পর্কিত প্রশ্ন ( এক ক্লিকে জানতে চান ):</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {followUps.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          type="button"
                          onClick={() => onSelectFollowUp(q)}
                          className="text-left text-xs font-bold text-slate-700 bg-white hover:bg-sky-50 hover:text-sky-700 border border-slate-200/90 hover:border-sky-300 px-3.5 py-2 rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <span>{q}</span>
                          <ArrowUpRight size={13} className="text-sky-500 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. Interactive Message Action Toolbar (Copy & Listen TTS) */}
                {finalBotContent && (
                  <div className="pt-1 flex items-center gap-2 text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 text-slate-600 font-semibold transition-colors cursor-pointer"
                      title="উত্তর কপি করুন"
                    >
                      {copied ? (
                        <>
                          <Check size={13} className="text-emerald-600" />
                          <span className="text-emerald-700">কপি হয়েছে</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>কপি করুন</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleSpeech}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        isSpeaking
                          ? "bg-sky-100 text-sky-700"
                          : "hover:bg-slate-100 text-slate-600"
                      }`}
                      title="অডিওতে শুনুন"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX size={13} className="text-sky-600 animate-pulse" />
                          <span>থামান (Stop)</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={13} />
                          <span>শুনুন (Listen)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
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
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            <img
              src={activeZoomUrl}
              alt="Enlarged medical image"
              className="max-h-[82vh] w-auto object-contain rounded-xl mx-auto bg-white p-2"
            />
          </div>
        </div>
      )}
    </>
  );
}
