"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  MessageSquare,
  Send,
  Image as ImageIcon,
  User,
  Loader2,
  Search,
  ArrowLeft,
  CheckCheck,
  AlertCircle
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { containsProfanity, censorProfanity } from "@/lib/contentFilter";

interface Conversation {
  id: number;
  ad_id: number;
  ad_title: string;
  ad_price: number | string;
  ad_currency: string;
  ad_image: string | null;
  other_user_id: number;
  other_user_name: string;
  last_message: string;
  last_message_at: string;
  is_buyer: boolean;
}

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  content: string;
  created_at: string;
  is_mine: boolean;
}

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  initialConversationId?: number | null;
}

export default function MessagesModal({
  isOpen,
  onClose,
  token,
  initialConversationId = null
}: MessagesModalProps) {
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(initialConversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Mobile visual viewport and keyboard tracking
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [viewportOffsetTop, setViewportOffsetTop] = useState<number>(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  // Body scroll lock & visualViewport tracking on mobile browsers
  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    const updateViewport = () => {
      if (typeof window !== "undefined" && window.visualViewport) {
        const vv = window.visualViewport;
        setViewportHeight(vv.height);
        setViewportOffsetTop(vv.offsetTop);

        // Detect if keyboard is open on mobile
        const isKeyboard = window.innerHeight - vv.height > 100;
        setIsKeyboardVisible(isKeyboard);
      }
    };

    updateViewport();

    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (vv) {
      vv.addEventListener("resize", updateViewport);
      vv.addEventListener("scroll", updateViewport);
    }
    window.addEventListener("resize", updateViewport);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overscrollBehavior = originalOverscroll;

      if (vv) {
        vv.removeEventListener("resize", updateViewport);
        vv.removeEventListener("scroll", updateViewport);
      }
      window.removeEventListener("resize", updateViewport);
    };
  }, [isOpen]);

  // Scroll strictly inside the message container without moving window/ancestors
  const scrollToBottom = useCallback((smooth = false) => {
    if (messagesContainerRef.current) {
      const el = messagesContainerRef.current;
      if (smooth) {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      } else {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, []);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 90;
    }
  };

  // Auto-scroll when messages change if user was near bottom
  useEffect(() => {
    if (isNearBottomRef.current) {
      requestAnimationFrame(() => {
        scrollToBottom(false);
      });
    }
  }, [messages, scrollToBottom]);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!token) return;
    const apiUrl = getApiUrl();
    try {
      const res = await fetch(`${apiUrl}/api/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.conversations)) {
        setConversations(data.conversations);
        if (!selectedConvId && data.conversations.length > 0 && !initialConversationId) {
          setSelectedConvId(data.conversations[0].id);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch conversations:", err);
    }
  }, [token, selectedConvId, initialConversationId]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(
    async (convId: number) => {
      if (!token) return;
      const apiUrl = getApiUrl();
      try {
        const res = await fetch(`${apiUrl}/api/conversations/${convId}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.warn("Failed to fetch messages:", err);
      }
    },
    [token]
  );

  // Initial load
  useEffect(() => {
    if (isOpen && token) {
      setLoadingConvs(true);
      fetchConversations().finally(() => setLoadingConvs(false));
      if (initialConversationId) {
        setSelectedConvId(initialConversationId);
      }
    }
  }, [isOpen, token, initialConversationId, fetchConversations]);

  // When conversation changes, load its messages
  useEffect(() => {
    if (selectedConvId && token && isOpen) {
      setLoadingMsgs(true);
      isNearBottomRef.current = true;
      fetchMessages(selectedConvId).finally(() => {
        setLoadingMsgs(false);
        requestAnimationFrame(() => {
          scrollToBottom(false);
        });
      });

      // Polling for live updates every 3.5 seconds
      const interval = setInterval(() => {
        fetchMessages(selectedConvId);
        fetchConversations();
      }, 3500);

      return () => clearInterval(interval);
    }
  }, [selectedConvId, token, isOpen, fetchMessages, fetchConversations, scrollToBottom]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConvId || !token || sending) return;

    setErrorMsg(null);
    const content = inputText.trim();

    // Client-side profanity validation
    const profCheck = containsProfanity(content);
    if (profCheck.hasProfanity) {
      setErrorMsg(t("errors.profanityMessage"));
      return;
    }

    setSending(true);
    const apiUrl = getApiUrl();

    try {
      const res = await fetch(`${apiUrl}/api/conversations/${selectedConvId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (data.success && data.message) {
        setInputText("");
        setMessages((prev) => [...prev, data.message]);
        isNearBottomRef.current = true;
        requestAnimationFrame(() => {
          scrollToBottom(false);
        });
        fetchConversations(); // Update snippet in thread list
      } else {
        const errText = data.error || "";
        if (
          errText.toLowerCase().includes("prohibited") ||
          errText.toLowerCase().includes("offensive") ||
          errText.toLowerCase().includes("niedozwolon") ||
          errText.toLowerCase().includes("obrażliw")
        ) {
          setErrorMsg(t("errors.profanityMessage"));
        } else {
          setErrorMsg(errText || t("common.error"));
        }
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setErrorMsg(t("common.error"));
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  const currentConv = conversations.find((c) => c.id === selectedConvId) || null;

  const filteredConversations = conversations.filter(
    (c) =>
      c.ad_title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      c.other_user_name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-hidden animate-in fade-in duration-150"
      style={
        viewportHeight && typeof window !== "undefined" && window.innerWidth < 640
          ? { height: `${viewportHeight}px`, top: `${viewportOffsetTop}px` }
          : undefined
      }
    >
      <div className="bg-white dark:bg-slate-900 rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-gray-100 dark:border-slate-800 w-full max-w-4xl h-full sm:h-[88vh] flex flex-col overflow-hidden relative sm:my-auto text-[#002f34] dark:text-slate-100">
        {/* Top Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#002f34] dark:text-white">{t("messages.title")}</h2>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400">{t("messages.subtitle")}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#002f34] dark:hover:text-white p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Body (2 Columns) */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* Left Column: Conversations List */}
          <div
            className={`w-full md:w-80 border-r border-gray-200 dark:border-slate-800 flex flex-col bg-gray-50/50 dark:bg-slate-900/50 shrink-0 min-h-0 ${
              selectedConvId ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Search Threads */}
            <div className="p-3 border-b border-gray-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder={t("common.search")}
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-base sm:text-xs text-[#002f34] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 outline-none"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800 overscroll-contain">
              {loadingConvs ? (
                <div className="py-12 text-center text-gray-400 dark:text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-600 dark:text-teal-400 mb-2" />
                  <p className="text-xs">{t("common.loading")}</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="py-14 px-4 text-center text-gray-400 dark:text-slate-500">
                  <MessageSquare className="w-10 h-10 mx-auto text-gray-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs font-semibold text-[#002f34] dark:text-white">{t("messages.emptyConvs")}</p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
                    {t("messages.emptyConvsDesc")}
                  </p>
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isSelected = selectedConvId === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedConvId(c.id)}
                      className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-teal-50/80 dark:bg-teal-950/50 border-l-4 border-teal-600 dark:border-teal-400"
                          : "hover:bg-gray-100/70 dark:hover:bg-slate-800/70"
                      }`}
                    >
                      {/* Thumbnail of Ad */}
                      <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-slate-800 overflow-hidden shrink-0 relative flex items-center justify-center border border-gray-200 dark:border-slate-700">
                        {c.ad_image ? (
                          <img
                            src={c.ad_image}
                            alt={c.ad_title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h4 className="text-xs font-bold text-[#002f34] dark:text-white truncate">
                            {c.other_user_name}
                          </h4>
                          <span className="text-[10px] text-gray-400 dark:text-slate-500 shrink-0 ml-1">
                            {new Date(c.last_message_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 truncate mb-1">
                          {c.ad_title} &bull; {c.ad_price} {c.ad_currency}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                          {c.last_message}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Active Chat */}
          <div
            className={`flex-1 min-h-0 flex flex-col bg-white dark:bg-slate-900 ${
              !selectedConvId ? "hidden md:flex" : "flex"
            }`}
          >
            {currentConv ? (
              <>
                {/* Chat Top Banner */}
                <div className="p-3 sm:p-3.5 px-4 sm:px-5 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0 shadow-2xs">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <button
                      onClick={() => setSelectedConvId(null)}
                      className="md:hidden p-2 -ml-1 text-gray-600 dark:text-slate-300 hover:text-[#002f34] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg shrink-0 transition-colors"
                      title={t("common.back")}
                      aria-label={t("common.back")}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {currentConv.other_user_name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#002f34] dark:text-white leading-tight truncate">
                        {currentConv.other_user_name}
                      </h3>
                      <div className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                        <span className="font-medium text-teal-700 dark:text-teal-400 truncate">{currentConv.ad_title}</span>
                        <span>&bull;</span>
                        <span className="font-bold text-[#002f34] dark:text-slate-200 shrink-0">
                          {currentConv.ad_price} {currentConv.ad_currency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages Bubbles Stream */}
                <div
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 min-h-0 p-3.5 sm:p-6 overflow-y-auto space-y-3 bg-[#f8f9fa] dark:bg-slate-950 overscroll-contain touch-pan-y"
                >
                  {loadingMsgs ? (
                    <div className="py-16 text-center text-gray-400 dark:text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-600 dark:text-teal-400 mb-2" />
                      <p className="text-xs">{t("common.loading")}</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 dark:text-slate-500">
                      <p className="text-xs font-semibold text-[#002f34] dark:text-white">
                        {t("messages.convStart")}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
                        {t("messages.convStartDesc")}
                      </p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col ${
                          m.is_mine ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-2xs ${
                            m.is_mine
                              ? "bg-[#002f34] dark:bg-teal-600 text-white rounded-br-xs"
                              : "bg-white dark:bg-slate-800 text-[#002f34] dark:text-slate-100 border border-gray-200 dark:border-slate-700 rounded-bl-xs"
                          }`}
                        >
                          {censorProfanity(m.content)}
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 px-1 flex items-center gap-1">
                          {new Date(m.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                          {m.is_mine && <CheckCheck className="w-3 h-3 text-teal-600 dark:text-teal-400" />}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Error Banner if message blocked */}
                {errorMsg && (
                  <div className="px-4 py-2 bg-red-50 dark:bg-red-950/60 border-t border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-150 shrink-0">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setErrorMsg(null)}
                      className="text-red-400 hover:text-red-700 dark:hover:text-red-200 p-0.5 rounded cursor-pointer transition-colors"
                      aria-label="Dismiss error"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Message Input Box - Fixed and anchored at bottom */}
                <form
                  onSubmit={handleSendMessage}
                  className={`p-2.5 sm:p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex items-center gap-2 shrink-0 z-20 shadow-xs sm:shadow-none ${
                    isKeyboardVisible ? "pb-2.5" : "pb-[max(0.75rem,env(safe-area-inset-bottom))]"
                  }`}
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    onFocus={() => {
                      if (errorMsg) setErrorMsg(null);
                      setTimeout(() => {
                        scrollToBottom(false);
                      }, 100);
                    }}
                    placeholder={t("messages.placeholder")}
                    className="flex-1 px-4 py-2.5 sm:py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-base sm:text-sm text-[#002f34] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 outline-none font-normal min-w-0 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="w-11 h-11 sm:w-10 sm:h-10 min-w-[44px] min-h-[44px] bg-[#002f34] dark:bg-teal-600 hover:bg-[#003e45] dark:hover:bg-teal-700 active:bg-[#001e22] text-white rounded-xl transition-colors disabled:opacity-40 cursor-pointer shrink-0 shadow-xs active:scale-95 flex items-center justify-center"
                    title={t("messages.send")}
                    aria-label={t("messages.send")}
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5 sm:w-4 sm:h-4" />
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 p-8">
                <MessageSquare className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
                <p className="text-sm font-bold text-[#002f34] dark:text-white">{t("messages.selectChat")}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  {t("messages.emptyConvsDesc")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
