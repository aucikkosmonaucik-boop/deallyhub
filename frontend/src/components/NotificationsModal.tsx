import React from "react";
import {
  X,
  Bell,
  CheckCheck,
  AlertTriangle,
  Sparkles,
  Info,
  Shield,
  Clock
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface NotificationItem {
  id: number;
  user_id: number | null;
  title: string;
  message: string;
  type: "system" | "promotion" | "alert" | "info" | string;
  created_at: string;
  is_read: boolean;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
}

export default function NotificationsModal({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationsModalProps) {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case "promotion":
        return <Sparkles className="w-5 h-5 text-purple-600" />;
      case "system":
        return <Shield className="w-5 h-5 text-teal-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case "alert":
        return "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60";
      case "promotion":
        return "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60";
      case "system":
        return "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/60";
      default:
        return "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-none sm:rounded-2xl w-full max-w-lg shadow-2xl border-0 sm:border border-gray-100 dark:border-slate-800 flex flex-col h-full sm:h-auto max-h-[100dvh] sm:max-h-[85vh] overflow-hidden sm:my-auto text-[#002f34] dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-slate-800 shrink-0 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-5 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-700 dark:text-teal-400 shrink-0">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-[#002f34] dark:text-white">{t("notifications.title")}</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] sm:text-xs font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400">{t("notifications.subtitle")}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs font-semibold text-teal-700 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer active:scale-95 border border-transparent dark:border-teal-800/60"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t("notifications.markAllRead")}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-2.5 sm:space-y-3">
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-gray-300 dark:text-slate-600">
                <Bell className="w-8 h-8" />
              </div>
              <p className="font-bold text-[#002f34] dark:text-white text-base">{t("notifications.empty")}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                {t("notifications.emptyDesc")}
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const bgClass = getTypeBg(n.type);
              return (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && onMarkAsRead(n.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                    n.is_read
                      ? "bg-white dark:bg-slate-800/60 border-gray-200 dark:border-slate-800 opacity-80"
                      : `${bgClass} shadow-xs`
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800 shrink-0 border border-gray-100 dark:border-slate-700 shadow-2xs">
                      {getTypeIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-bold text-sm text-[#002f34] dark:text-white truncate">
                          {n.title}
                        </h4>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed break-words whitespace-pre-line">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-1 mt-2.5 text-[11px] text-gray-400 dark:text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(n.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 text-center">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-[#002f34] dark:hover:text-white transition-colors cursor-pointer"
          >
            {t("common.close", "Close")}
          </button>
        </div>
      </div>
    </div>
  );
}
