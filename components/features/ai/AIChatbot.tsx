"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "@/lib/contexts/LanguageContext";
import { useUserSnapshot } from "@/lib/hooks/useUserSnapshot";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatbot() {
  const t = useTranslations("ai");
  const { snapshot } = useUserSnapshot();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<"openai" | "gemini">("openai");

  // Load API Key from local storage
  useEffect(() => {
    const storedKey = localStorage.getItem("tcap_ai_key");
    const storedProvider = localStorage.getItem("tcap_ai_provider");
    if (storedKey) setApiKey(storedKey);
    if (storedProvider) setProvider(storedProvider as "openai" | "gemini");
  }, []);

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: "assistant", content: t("intro") }]);
    }
  }, [t, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isLoading, isSettingsOpen]);

  const handleSaveSettings = () => {
    localStorage.setItem("tcap_ai_key", apiKey);
    localStorage.setItem("tcap_ai_provider", provider);
    setIsSettingsOpen(false);
    // Optional: Add toast or visual confirmation
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey || "", // Send key in header (safer than body logging)
          "x-provider": provider,
        },
        body: JSON.stringify({ message: userMsg, snapshot }),
      });

      if (!res.ok) throw new Error("API call failed");

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "Sorry, I didn't get that.",
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-[#111816] shadow-[0_0_20px_rgba(16,183,127,0.4)] hover:scale-110 hover:shadow-[0_0_30px_rgba(16,183,127,0.6)] transition-all duration-300 animate-bounce-subtle"
        aria-label="Open AI Advisor"
      >
        <span className="material-symbols-outlined text-[28px]">smart_toy</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111816]/95 backdrop-blur-xl shadow-2xl animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
            <span className="material-symbols-outlined text-[18px]">
              smart_toy
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{t("title")}</h3>
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
              <span
                className={`relative flex h-1.5 w-1.5 ${
                  apiKey ? "" : "grayscale"
                }`}
              >
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                    apiKey ? "bg-emerald-400" : "bg-gray-400"
                  }`}
                ></span>
                <span
                  className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                    apiKey ? "bg-emerald-500" : "bg-gray-500"
                  }`}
                ></span>
              </span>
              {apiKey ? t("connect") : t("useMock")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            aria-label={t("settings")}
            className={`rounded-full p-1 transition-colors ${
              isSettingsOpen
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              settings
            </span>
          </button>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
            className="rounded-full p-1 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isSettingsOpen ? (
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div>
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                security
              </span>
              {t("settings")}
            </h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  {t("provider")}
                </label>
                <div className="flex gap-2">
                  {/* Provider Toggles */}
                  <button
                    onClick={() => setProvider("openai")}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                      provider === "openai"
                        ? "border-primary bg-primary/10 text-white"
                        : "border-white/10 bg-black/20 text-gray-400"
                    }`}
                  >
                    OpenAI
                  </button>
                  <button
                    onClick={() => setProvider("gemini")}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                      provider === "gemini"
                        ? "border-blue-500 bg-blue-500/10 text-white"
                        : "border-white/10 bg-black/20 text-gray-400"
                    }`}
                  >
                    Gemini
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  {t("apiKey")}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={t("enterKey")}
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 px-3 text-white placeholder-gray-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                  <span className="absolute right-3 top-2.5 material-symbols-outlined text-gray-500 text-[18px]">
                    key
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 leading-tight">
                  Key is stored locally on your device. Never shared.
                </p>
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full bg-white text-black font-bold py-2.5 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  check_circle
                </span>
                {t("save")}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Messages Area */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-[#111816] font-medium rounded-tr-sm"
                      : "bg-white/10 text-gray-200 rounded-tl-sm border border-white/5"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/5 px-4 py-3 text-gray-400">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 delay-0"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 delay-150"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 delay-300"></span>
                  </div>
                  <span className="sr-only">{t("typing")}</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-white/10 bg-black/20 p-3">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("placeholder")}
                disabled={isLoading}
                className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-[#111816] hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] ml-0.5">
                  send
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
