"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  X,
  MessageSquare,
  Send,
  Image as ImageIcon,
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
  sending?: boolean;
}

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  initialConversationId?: number | null;
}

// Deep/shallow equality helpers to prevent unnecessary React re-renders on polling
function areMessagesEqual(a: Message[], b: Message[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  if (a.length === 0) return true;
  const lastA = a[a.length - 1];
  const lastB = b[b.length - 1];
  if (lastA.id !== lastB.id || lastA.content !== lastB.content || lastA.sending !== lastB.sending) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id || a[i].content !== b[i].content || a[i].sending !== b[i].sending) {
      return false;
    }
  }
  return true;
}

function areConversationsEqual(a: Conversation[], b: Conversation[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const itemA = a[i];
    const itemB = b[i];
    if (
      itemA.id !== itemB.id ||
      itemA.last_message !== itemB.last_message ||
      itemA.last_message_at !== itemB.last_message_at ||
      itemA.ad_title !== itemB.ad_title ||
      itemA.ad_price !== itemB.ad_price ||
      itemA.ad_image !== itemB.ad_image
    ) {
      return false;
    }
  }
  return true;
}

// Memoized single message bubble for 60fps typing & zero lag
const MessageBubble = memo(function MessageBubble({ message }: { message: Message }) {
  return (
    <div
      className={`flex flex-col ${
        message.is_mine ? "items-end" : "items-start"
      }`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-2xs break-words transition-opacity duration-150 ${
          message.is_mine
            ? "bg-[#002f34] dark:bg-teal-600 text-white rounded-br-xs"
            : "bg-white dark:bg-slate-800 text-[#002f34] dark:text-slate-100 border border-gray-200 dark:border-slate-700 rounded-bl-xs"
        } ${message.sending ? "opacity-70" : "opacity-100"}`}
      >
        {censorProfanity(message.content)}
      </div>
      <span className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 px-1 flex items-center gap-1 select-none">
        {new Date(message.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })}
        {message.is_mine && (
          message.sending ? (
            <Loader2 className="w-3 h-3 animate-spin text-teal-500" />
          ) : (
            <CheckCheck className="w-3 h-3 text-teal-600 dark:text-teal-400" />
          )
        )}
      </span>
    </div>
  );
});

// Memoized single conversation item in sidebar
const ConversationItem = memo(function ConversationItem({
  conversation,
  isSelected,
  onSelect
}: {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (id: number) => void;
}) {
  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
        isSelected
          ? "bg-teal-50/80 dark:bg-teal-950/50 border-l-4 border-teal-600 dark:border-teal-400"
          : "hover:bg-gray-100/70 dark:hover:bg-slate-800/70"
      }`}
    >
      {/* Thumbnail of Ad */}
      <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-slate-800 overflow-hidden shrink-0 relative flex items-center justify-center border border-gray-200 dark:border-slate-700">
        {conversation.ad_image ? (
          <img
            src={conversation.ad_image}
            alt={conversation.ad_title}
            loading="lazy"
            decoding="async"
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
            {conversation.other_user_name}
          </h4>
          <span className="text-[10px] text-gray-400 dark:text-slate-500 shrink-0 ml-1">
            {new Date(conversation.last_message_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </span>
        </div>
        <p className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 truncate mb-1">
          {conversation.ad_title} &bull; {conversation.ad_price} {conversation.ad_currency}
        </p>
        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
          {conversation.last_message}
        </p>
      </div>
    </button>
  );
});

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
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // In-memory cache for loaded conversation messages to avoid spinner flashes on switch
  const messagesCacheRef = useRef<Record<number, Message[]>>({});
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const activeConvIdRef = useRef<number | null>(selectedConvId);

  useEffect(() => {
    activeConvIdRef.current = selectedConvId;
  }, [selectedConvId]);

  // Lock body scroll while open without modifying documentElement (which causes jumping on mobile)
  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    // Track visual viewport resize solely for mobile virtual keyboard padding
    const handleResize = () => {
      if (typeof window !== "undefined" && window.visualViewport) {
        const isKeyboard = window.innerHeight - window.visualViewport.height > 120;
        setIsKeyboardVisible(isKeyboard);
      }
    };

    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (vv) {
      vv.addEventListener("resize", handleResize);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.overscrollBehavior = originalOverscroll;
      if (vv) {
        vv.removeEventListener("resize", handleResize);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  // Handle mobile Android hardware back button (returns to conversation list instead of exiting modal)
  useEffect(() => {
    if (!isOpen || !selectedConvId) return;

    if (typeof window !== "undefined" && window.innerWidth < 768) {
      window.history.pushState({ deallyChatConv: selectedConvId }, "");

      const handlePopState = () => {
        setSelectedConvId(null);
      };

      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [isOpen, selectedConvId]);

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

  // Fetch all conversations with shallow comparison
  const fetchConversations = useCallback(async () => {
    if (!token) return;
    const apiUrl = getApiUrl();
    try {
      const res = await fetch(`${apiUrl}/api/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.conversations)) {
        setConversations((prev) => (areConversationsEqual(prev, data.conversations) ? prev : data.conversations));

        // Auto-select first conversation on initial load if none selected
        if (!activeConvIdRef.current && data.conversations.length > 0 && !initialConversationId) {
          const firstId = data.conversations[0].id;
          setSelectedConvId(firstId);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch conversations:", err);
    }
  }, [token, initialConversationId]);

  // Fetch messages for selected conversation with caching and zero unnecessary re-renders
  const fetchMessages = useCallback(
    async (convId: number, isInitial = false) => {
      if (!token) return;
      const apiUrl = getApiUrl();
      try {
        const res = await fetch(`${apiUrl}/api/conversations/${convId}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
          // If user switched away while network request was in flight, ignore
          if (activeConvIdRef.current !== convId) return;

          messagesCacheRef.current[convId] = data.messages;

          let hasNewItems = false;
          setMessages((prev) => {
            if (areMessagesEqual(prev, data.messages)) {
              return prev;
            }
            if (data.messages.length > prev.length) {
              hasNewItems = true;
            }
            return data.messages;
          });

          // Scroll if initial open or if new message arrived while near bottom
          if (isInitial) {
            requestAnimationFrame(() => {
              scrollToBottom(false);
            });
          } else if (hasNewItems && isNearBottomRef.current) {
            requestAnimationFrame(() => {
              scrollToBottom(true);
            });
          }
        }
      } catch (err) {
        console.warn("Failed to fetch messages:", err);
      } finally {
        if (activeConvIdRef.current === convId) {
          setLoadingMsgs(false);
        }
      }
    },
    [token, scrollToBottom]
  );

  // Initial load of conversations
  useEffect(() => {
    if (isOpen && token) {
      setLoadingConvs(true);
      fetchConversations().finally(() => setLoadingConvs(false));
      if (initialConversationId) {
        setSelectedConvId(initialConversationId);
      }
    }
  }, [isOpen, token, initialConversationId, fetchConversations]);

  // Handler for selecting a conversation: uses cache immediately for 0ms transition
  const handleSelectConversation = useCallback(
    (convId: number) => {
      setSelectedConvId(convId);
      setErrorMsg(null);
      isNearBottomRef.current = true;

      const cached = messagesCacheRef.current[convId];
      if (cached && cached.length > 0) {
        setMessages(cached);
        setLoadingMsgs(false);
        requestAnimationFrame(() => {
          scrollToBottom(false);
        });
        // Refresh silently in background
        fetchMessages(convId, false);
      } else {
        setMessages([]);
        setLoadingMsgs(true);
        fetchMessages(convId, true);
      }
    },
    [fetchMessages, scrollToBottom]
  );

  // Sync initial conversation change
  useEffect(() => {
    if (selectedConvId && token && isOpen) {
      const cached = messagesCacheRef.current[selectedConvId];
      if (cached && cached.length > 0) {
        setMessages(cached);
        setLoadingMsgs(false);
        requestAnimationFrame(() => {
          scrollToBottom(false);
        });
        fetchMessages(selectedConvId, false);
      } else {
        setLoadingMsgs(true);
        fetchMessages(selectedConvId, true);
      }

      // Live polling every 3.5 seconds (only when tab is active)
      const interval = setInterval(() => {
        if (typeof document !== "undefined" && document.visibilityState === "hidden") {
          return;
        }
        fetchMessages(selectedConvId, false);
        fetchConversations();
      }, 3500);

      return () => clearInterval(interval);
    }
  }, [selectedConvId, token, isOpen, fetchMessages, fetchConversations, scrollToBottom]);

  // Send message with instant Optimistic UI
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

    // Instant optimistic message
    const tempId = -Date.now();
    const optimisticMsg: Message = {
      id: tempId,
      conversation_id: selectedConvId,
      sender_id: 0,
      sender_name: "Me",
      content,
      created_at: new Date().toISOString(),
      is_mine: true,
      sending: true
    };

    setInputText("");
    setMessages((prev) => {
      const updated = [...prev, optimisticMsg];
      if (selectedConvId) {
        messagesCacheRef.current[selectedConvId] = updated;
      }
      return updated;
    });

    isNearBottomRef.current = true;
    requestAnimationFrame(() => {
      scrollToBottom(true);
    });

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
        setMessages((prev) => {
          const replaced = prev.map((m) => (m.id === tempId ? data.message : m));
          if (selectedConvId) {
            messagesCacheRef.current[selectedConvId] = replaced;
          }
          return replaced;
        });
        fetchConversations(); // Update snippet in sidebar list
      } else {
        // Rollback optimistic message
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setInputText(content); // Restore user text so it is not lost
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
      // Rollback optimistic message
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInputText(content); // Restore user text
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-hidden animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-gray-100 dark:border-slate-800 w-full max-w-4xl h-[100dvh] sm:h-[88vh] max-h-[100dvh] sm:max-h-[88vh] flex flex-col overflow-hidden relative sm:my-auto text-[#002f34] dark:text-slate-100">
        {/* Top Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-4 select-none">
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
            className="text-gray-400 hover:text-[#002f34] dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
                <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder={t("common.search")}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-[#002f34] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 outline-none"
                />
              </div>
            </div>

            {/* Threads List */}
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
                filteredConversations.map((c) => (
                  <ConversationItem
                    key={c.id}
                    conversation={c}
                    isSelected={selectedConvId === c.id}
                    onSelect={handleSelectConversation}
                  />
                ))
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
                      className="md:hidden p-2 -ml-1 text-gray-600 dark:text-slate-300 hover:text-[#002f34] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg shrink-0 transition-colors cursor-pointer"
                      title={t("common.back")}
                      aria-label={t("common.back")}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs select-none">
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

                {/* Messages Stream */}
                <div
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 min-h-0 p-3.5 sm:p-6 overflow-y-auto space-y-3 bg-[#f8f9fa] dark:bg-slate-950 overscroll-contain touch-pan-y"
                  style={{
                    overflowAnchor: "auto",
                    WebkitOverflowScrolling: "touch",
                    transform: "translateZ(0)"
                  }}
                >
                  {loadingMsgs && messages.length === 0 ? (
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
                      <MessageBubble key={m.id} message={m} />
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

                {/* Message Input Box */}
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
                    className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-base sm:text-sm text-[#002f34] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 outline-none font-normal min-w-0 transition-colors"
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
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 p-8 select-none">
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
