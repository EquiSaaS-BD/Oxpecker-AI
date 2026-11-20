"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
  sensitive?: boolean;
  imageUrl?: string;
  imageName?: string;
  fileSize?: string;
};

export type ChatThread = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};

interface ChatHistoryContextType {
  threads: ChatThread[];
  activeThreadId: string | null;
  createNewThread: (title?: string) => string;
  switchThread: (id: string | null) => void;
  deleteThread: (id: string) => void;
  addMessageToThread: (threadId: string, message: Message) => void;
  updateMessageInThread: (threadId: string, messageId: string, content: string) => void;
  updateThreadTitle: (threadId: string, title: string) => void;
  getActiveThread: () => ChatThread | undefined;
  isLoaded: boolean;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

function sanitizeChatThreads(raw: unknown): ChatThread[] {
  if (!Array.isArray(raw)) return [];
  const clean: ChatThread[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const t = item as Record<string, unknown>;
    const id = typeof t.id === "string" && t.id.trim() ? t.id : `thread_${Date.now()}_${clean.length}`;
    const title = typeof t.title === "string" && t.title.trim() ? t.title : "New Chat";
    const createdAt = typeof t.createdAt === "number" && Number.isFinite(t.createdAt) ? t.createdAt : Date.now();
    const updatedAt = typeof t.updatedAt === "number" && Number.isFinite(t.updatedAt) ? t.updatedAt : createdAt;
    const rawMessages = Array.isArray(t.messages) ? t.messages : [];
    const messages: Message[] = rawMessages
      .filter((m): m is Record<string, unknown> => !!m && typeof m === "object" && typeof (m as Record<string, unknown>).content === "string")
      .map((m, idx) => ({
        id: typeof m.id === "string" && m.id ? m.id : `msg_${createdAt}_${idx}`,
        role: m.role === "user" ? "user" : "bot",
        content: String(m.content || ""),
        ...(typeof m.sensitive === "boolean" ? { sensitive: m.sensitive } : {}),
        ...(typeof m.imageUrl === "string" ? { imageUrl: m.imageUrl } : {}),
        ...(typeof m.imageName === "string" ? { imageName: m.imageName } : {}),
        ...(typeof m.fileSize === "string" ? { fileSize: m.fileSize } : {}),
      }));
    clean.push({ id, title, messages, createdAt, updatedAt });
  }
  return clean;
}

export function ChatHistoryProvider({ children }: { children: React.ReactNode }) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount with strict schema sanitization
  useEffect(() => {
    try {
      const saved = localStorage.getItem("oxpecker_chat_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        const sanitized = sanitizeChatThreads(parsed);
        setThreads(sanitized);
        if (sanitized.length === 0) {
          localStorage.removeItem("oxpecker_chat_history");
        }
      }
    } catch (e) {
      console.error("Failed to parse chat history, resetting cache:", e);
      try {
        localStorage.removeItem("oxpecker_chat_history");
      } catch {}
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      const localSafeThreads = threads.map((thread) => ({
        ...thread,
        messages: thread.messages.map((message) => message.sensitive
          ? { ...message, content: "Prescription scan details are not retained in local chat history. If the scan was saved, review it in Reports." }
          : message),
      }));
      localStorage.setItem("oxpecker_chat_history", JSON.stringify(localSafeThreads));
    }
  }, [threads, isLoaded]);

  const createNewThread = (title: string = "New Chat") => {
    const newThread: ChatThread = {
      id: `thread_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
    return newThread.id;
  };

  const switchThread = (id: string | null) => {
    setActiveThreadId(id);
  };

  const deleteThread = (id: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (activeThreadId === id) {
      setActiveThreadId(null);
    }
  };

  const addMessageToThread = (threadId: string, message: Message) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          // Auto-generate title from first user message if it's currently "New Chat"
          let newTitle = t.title;
          const safeContent = typeof message?.content === "string" ? message.content : "";
          const safeMessages = Array.isArray(t.messages) ? t.messages : [];
          if (safeMessages.length === 0 && message.role === "user") {
            const words = message.sensitive ? ["Prescription", "scan"] : safeContent.split(" ");
            newTitle = words.slice(0, 4).join(" ") + (words.length > 4 ? "..." : "");
          }
          return {
            ...t,
            title: newTitle,
            messages: [...safeMessages, { ...message, content: safeContent }],
            updatedAt: Date.now(),
          };
        }
        return t;
      }).sort((a, b) => b.updatedAt - a.updatedAt)
    );
  };

  const updateMessageInThread = (threadId: string, messageId: string, content: string) => {
    setThreads(prev => 
      prev.map(t => {
        if (t.id === threadId) {
          return {
            ...t,
            updatedAt: Date.now(),
            messages: t.messages.map(m => 
              m.id === messageId ? { ...m, content } : m
            )
          };
        }
        return t;
      })
    );
  };

  const updateThreadTitle = (threadId: string, title: string) => {
    setThreads(prev =>
      prev.map(t =>
        t.id === threadId
          ? { ...t, title, updatedAt: Date.now() }
          : t
      )
    );
  };

  const getActiveThread = () => {
    return threads.find((t) => t.id === activeThreadId);
  };

  return (
    <ChatHistoryContext.Provider
      value={{
        threads,
        activeThreadId,
        createNewThread,
        switchThread,
        deleteThread,
        addMessageToThread,
        updateMessageInThread,
        updateThreadTitle,
        getActiveThread,
        isLoaded,
      }}
    >
      {children}
    </ChatHistoryContext.Provider>
  );
}

export function useChatHistory() {
  const context = useContext(ChatHistoryContext);
  if (context === undefined) {
    throw new Error("useChatHistory must be used within a ChatHistoryProvider");
  }
  return context;
}
