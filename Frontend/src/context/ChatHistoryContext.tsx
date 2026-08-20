"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
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
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

export function ChatHistoryProvider({ children }: { children: React.ReactNode }) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("oxpecker_chat_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        setThreads(parsed);
      }
    } catch (e) {
      console.error("Failed to parse chat history:", e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("oxpecker_chat_history", JSON.stringify(threads));
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
          if (t.messages.length === 0 && message.role === "user") {
            const words = message.content.split(" ");
            newTitle = words.slice(0, 4).join(" ") + (words.length > 4 ? "..." : "");
          }
          return {
            ...t,
            title: newTitle,
            messages: [...t.messages, message],
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
