import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Shield,
  Send,
  Trash2,
  BarChart3,
  Users,
  ShoppingBag,
  MessageSquare,
  Bell,
  Search,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  MapPin
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  onAdDeleted?: () => void;
}

export default function AdminPanelModal({
  isOpen,
  onClose,
  token,
  onAdDeleted
}: AdminPanelModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"stats" | "notify" | "ads" | "users">("stats");

  // Stats state
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalAds: number;
    totalConversations: number;
    totalMessages: number;
    totalNotifications: number;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Send Notification state
  const [targetType, setTargetType] = useState<"all" | "specific">("all");
  const [targetEmail, setTargetEmail] = useState("");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState("system");
  const [sendingNotif, setSendingNotif] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState<string | null>(null);
  const [notifError, setNotifError] = useState<string | null>(null);

  // Ads Moderation state
  const [ads, setAds] = useState<any[]>([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [adsError, setAdsError] = useState<string | null>(null);
  const [adSearchQuery, setAdSearchQuery] = useState("");
  const [deletingAdId, setDeletingAdId] = useState<number | null>(null);
  const [adActionMsg, setAdActionMsg] = useState<string | null>(null);

  // Users state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setLoadingStats(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (e) {
      console.error("Failed to load admin stats:", e);
    } finally {
      setLoadingStats(false);
    }
  }, [token]);

  const fetchAds = useCallback(async () => {
    if (!token) return;
    setAdsLoading(true);
    setAdsError(null);
    try {
      const params = new URLSearchParams();
      if (adSearchQuery.trim()) params.append("search", adSearchQuery.trim());
      params.append("limit", "100");

      const res = await fetch(`${getApiUrl()}/api/admin/ads?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (data.success) {
          setAds(data.ads || []);
        } else {
          setAdsError(data.error || "Failed to load advertisements.");
        }
      } else {
        setAdsError("Server returned an invalid response. Please try again.");
      }
    } catch (e: any) {
      console.error("Failed to fetch ads for moderation:", e);
      setAdsError(e.message || "Network error loading advertisements.");
    } finally {
      setAdsLoading(false);
    }
  }, [token, adSearchQuery]);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setUsersLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (data.success) {
          setUsersList(data.users || []);
        }
      }
    } catch (e) {
      console.error("Failed to fetch users:", e);
    } finally {
      setUsersLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      fetchStats();
      if (activeTab === "ads") fetchAds();
      if (activeTab === "users") fetchUsers();
    }
  }, [isOpen, activeTab, fetchStats, fetchAds, fetchUsers]);

  // Debounced auto-search when typing
  useEffect(() => {
    if (isOpen && activeTab === "ads") {
      const timer = setTimeout(() => {
        fetchAds();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [adSearchQuery, isOpen, activeTab, fetchAds]);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    setSendingNotif(true);
    setNotifSuccess(null);
    setNotifError(null);

    try {
      const res = await fetch(`${getApiUrl()}/api/admin/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          target: targetType,
          targetEmail: targetType === "specific" ? targetEmail.trim() : undefined,
          title: notifTitle.trim(),
          message: notifMessage.trim(),
          type: notifType
        })
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Backend service was restarting. Please try again in a few seconds.");
      }

      const data = await res.json();
      if (data.success) {
        setNotifSuccess(data.message || "Notification sent successfully!");
        setNotifTitle("");
        setNotifMessage("");
        setTargetEmail("");
        fetchStats();
      } else {
        setNotifError(data.error || "Failed to send notification.");
      }
    } catch (err: any) {
      setNotifError(err.message || "Network error sending notification.");
    } finally {
      setSendingNotif(false);
    }
  };

  const handleDeleteAd = async (adId: number, title: string) => {
    if (!confirm(`Are you sure you want to delete advertisement "${title}" (#${adId}) from Deallyhub? This cannot be undone.`)) {
      return;
    }

    setDeletingAdId(adId);
    setAdActionMsg(null);

    try {
      const res = await fetch(`${getApiUrl()}/api/admin/ads/${adId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (data.success) {
        setAdActionMsg(`Advertisement #${adId} successfully deleted.`);
        setAds((prev) => prev.filter((a) => a.id !== adId));
        fetchStats();
        onAdDeleted?.call(null);
      } else {
        alert(data.error || "Failed to delete advertisement.");
      }
    } catch (e: any) {
      alert("Error deleting advertisement: " + e.message);
    } finally {
      setDeletingAdId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-5xl shadow-2xl border border-gray-100 flex flex-col max-h-[92dvh] sm:max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#002f34] text-white p-4 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl">{t("admin.title")}</h3>
                <span className="bg-teal-400 text-[#002f34] text-[10px] sm:text-[11px] font-black uppercase px-2 py-0.5 rounded-md">
                  Admin
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-300">
                {t("nav.adminPanel")}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 pt-3 sm:pt-4 border-b border-gray-100 bg-gray-50/70 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab("stats")}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "stats"
                ? "border-teal-600 text-teal-700 font-extrabold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{t("admin.overviewTab")}</span>
          </button>

          <button
            onClick={() => setActiveTab("notify")}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "notify"
                ? "border-teal-600 text-teal-700 font-extrabold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{t("admin.sendNotifTab")}</span>
          </button>

          <button
            onClick={() => setActiveTab("ads")}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "ads"
                ? "border-teal-600 text-teal-700 font-extrabold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>{t("admin.moderationTab")}</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "users"
                ? "border-teal-600 text-teal-700 font-extrabold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t("admin.usersTab")}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: OVERVIEW & STATS */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-[#002f34]">{t("admin.statsTitle")}</h4>
                  <p className="text-xs text-gray-400">{t("admin.statsSubtitle")}</p>
                </div>
                <button
                  onClick={fetchStats}
                  className="p-2 rounded-lg text-gray-400 hover:text-teal-700 hover:bg-gray-100 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? "animate-spin" : ""}`} />
                  <span>{t("common.refresh")}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-100">
                  <div className="flex items-center justify-between text-teal-700 mb-2">
                    <ShoppingBag className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-wider bg-teal-200/50 px-2 py-0.5 rounded">Ads</span>
                  </div>
                  <div className="text-2xl font-black text-[#002f34]">
                    {stats ? stats.totalAds : "..."}
                  </div>
                  <div className="text-xs text-gray-500 font-medium mt-1">{t("admin.activeOffers")}</div>
                </div>

                <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-100">
                  <div className="flex items-center justify-between text-blue-700 mb-2">
                    <Users className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-wider bg-blue-200/50 px-2 py-0.5 rounded">Users</span>
                  </div>
                  <div className="text-2xl font-black text-[#002f34]">
                    {stats ? stats.totalUsers : "..."}
                  </div>
                  <div className="text-xs text-gray-500 font-medium mt-1">{t("admin.regAccounts")}</div>
                </div>

                <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-100">
                  <div className="flex items-center justify-between text-purple-700 mb-2">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-wider bg-purple-200/50 px-2 py-0.5 rounded">Chats</span>
                  </div>
                  <div className="text-2xl font-black text-[#002f34]">
                    {stats ? stats.totalConversations : "..."}
                  </div>
                  <div className="text-xs text-gray-500 font-medium mt-1">{t("admin.activeThreads")}</div>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-100">
                  <div className="flex items-center justify-between text-amber-700 mb-2">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200/50 px-2 py-0.5 rounded">Messages</span>
                  </div>
                  <div className="text-2xl font-black text-[#002f34]">
                    {stats ? stats.totalMessages : "..."}
                  </div>
                  <div className="text-xs text-gray-500 font-medium mt-1">{t("admin.messagesExchanged")}</div>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <div className="flex items-center justify-between text-emerald-700 mb-2">
                    <Bell className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200/50 px-2 py-0.5 rounded">Broadcast</span>
                  </div>
                  <div className="text-2xl font-black text-[#002f34]">
                    {stats ? stats.totalNotifications : "..."}
                  </div>
                  <div className="text-xs text-gray-500 font-medium mt-1">{t("admin.notifsSent")}</div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
                <h5 className="font-bold text-sm text-[#002f34] mb-3">{t("admin.ownerShortcuts")}</h5>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab("notify")}
                    className="bg-[#002f34] hover:bg-[#003d44] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{t("admin.broadcastShortcut")}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("ads")}
                    className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t("admin.moderateShortcut")}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SEND NOTIFICATIONS */}
          {activeTab === "notify" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h4 className="text-lg font-bold text-[#002f34]">{t("admin.sendNotifHeader")}</h4>
                <p className="text-xs text-gray-500">
                  {t("admin.sendNotifDesc")}
                </p>
              </div>

              {notifSuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{notifSuccess}</span>
                </div>
              )}

              {notifError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{notifError}</span>
                </div>
              )}

              <form onSubmit={handleSendNotification} className="space-y-4">
                {/* Target Audience */}
                <div>
                  <label className="block text-xs font-bold text-[#002f34] mb-2">{t("admin.notifTarget")}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        targetType === "all"
                          ? "bg-teal-50/70 border-teal-500 ring-2 ring-teal-500/20 text-[#002f34] font-bold"
                          : "bg-white border-gray-200 text-gray-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="target"
                        checked={targetType === "all"}
                        onChange={() => setTargetType("all")}
                        className="hidden"
                      />
                      <div className="w-4 h-4 rounded-full border-2 border-teal-600 flex items-center justify-center">
                        {targetType === "all" && <div className="w-2 h-2 rounded-full bg-teal-600" />}
                      </div>
                      <div className="text-xs">
                        <div className="font-bold">{t("admin.broadcastAll")}</div>
                        <div className="text-[11px] text-gray-500">{t("admin.allAdvertisers")}</div>
                      </div>
                    </label>

                    <label
                      className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        targetType === "specific"
                          ? "bg-teal-50/70 border-teal-500 ring-2 ring-teal-500/20 text-[#002f34] font-bold"
                          : "bg-white border-gray-200 text-gray-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="target"
                        checked={targetType === "specific"}
                        onChange={() => setTargetType("specific")}
                        className="hidden"
                      />
                      <div className="w-4 h-4 rounded-full border-2 border-teal-600 flex items-center justify-center">
                        {targetType === "specific" && <div className="w-2 h-2 rounded-full bg-teal-600" />}
                      </div>
                      <div className="text-xs">
                        <div className="font-bold">{t("admin.specificUser")}</div>
                        <div className="text-[11px] text-gray-500">{t("admin.sendByEmail")}</div>
                      </div>
                    </label>
                  </div>
                </div>

                {targetType === "specific" && (
                  <div>
                    <label className="block text-xs font-bold text-[#002f34] mb-1">{t("admin.userEmailLabel")}</label>
                    <input
                      type="email"
                      value={targetEmail}
                      onChange={(e) => setTargetEmail(e.target.value)}
                      placeholder="user@example.com"
                      required
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>
                )}

                {/* Type Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#002f34] mb-1">{t("admin.notifTypeLabel")}</label>
                  <select
                    value={notifType}
                    onChange={(e) => setNotifType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
                  >
                    <option value="system">{t("admin.typeSystem")}</option>
                    <option value="promotion">{t("admin.typePromotion")}</option>
                    <option value="alert">{t("admin.typeAlert")}</option>
                    <option value="info">{t("admin.typeInfo")}</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-[#002f34] mb-1">{t("admin.notifTitle")}</label>
                  <input
                    type="text"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    placeholder={t("admin.notifTitlePlaceholder")}
                    required
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                {/* Message Body */}
                <div>
                  <label className="block text-xs font-bold text-[#002f34] mb-1">{t("admin.notifMessage")}</label>
                  <textarea
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    placeholder={t("admin.notifMsgPlaceholder")}
                    rows={4}
                    required
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingNotif}
                  className="w-full bg-[#002f34] hover:bg-[#003d44] text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{sendingNotif ? t("admin.sendingBtn") : t("admin.sendNowBtn")}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: MANAGE & DELETE ADVERTISEMENTS */}
          {activeTab === "ads" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-[#002f34]">{t("admin.moderationHeader")}</h4>
                  <p className="text-xs text-gray-500">
                    {t("admin.moderationDesc")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={adSearchQuery}
                      onChange={(e) => setAdSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && fetchAds()}
                      placeholder={t("admin.searchAdsPlaceholder")}
                      className="pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 w-64 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>
                  <button
                    onClick={fetchAds}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 cursor-pointer"
                    title="Search / Refresh"
                  >
                    <RefreshCw className={`w-4 h-4 ${adsLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {adsError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{adsError}</span>
                </div>
              )}

              {adActionMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{adActionMsg}</span>
                </div>
              )}

              {adsLoading ? (
                <div className="py-16 text-center text-gray-400 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
                  <span>{t("admin.loadingAds")}</span>
                </div>
              ) : ads.length === 0 ? (
                <div className="py-16 text-center text-gray-400 text-xs">
                  {t("admin.noAdsFound")}
                </div>
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
                  {ads.map((ad) => {
                    const cover = ad.images && ad.images.length > 0 ? ad.images[0] : null;
                    return (
                      <div
                        key={ad.id}
                        className="p-4 hover:bg-gray-50/80 transition-colors flex items-center gap-4"
                      >
                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                          {cover ? (
                            <img src={cover} alt={ad.title} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-gray-400" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-black text-gray-400">#{ad.id}</span>
                            <span className="bg-gray-100 text-[#002f34] text-[10px] font-bold px-2 py-0.5 rounded">
                              {ad.category_name || ad.category_slug}
                            </span>
                            <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                              <MapPin className="w-3 h-3" />
                              <span>{ad.location}</span>
                            </span>
                          </div>

                          <h5 className="font-bold text-sm text-[#002f34] truncate">
                            {ad.title}
                          </h5>

                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="font-bold text-[#002f34]">
                              {ad.price} {ad.currency}
                            </span>
                            <span>&bull;</span>
                            <span className="text-gray-500 truncate">
                              {t("admin.sellerLabel")} <strong>{ad.seller_name || "Unknown"}</strong> ({ad.seller_email})
                            </span>
                            <span>&bull;</span>
                            <span className="text-gray-400">
                              {new Date(ad.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteAd(ad.id, ad.title)}
                          disabled={deletingAdId === ad.id}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{deletingAdId === ad.id ? t("admin.deletingBtn") : t("admin.deleteAdBtn")}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: REGISTERED USERS */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-[#002f34]">{t("admin.regAccountsHeader")}</h4>
                  <p className="text-xs text-gray-500">{t("admin.regAccountsDesc")}</p>
                </div>
                <button
                  onClick={fetchUsers}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 cursor-pointer text-xs font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${usersLoading ? "animate-spin" : ""}`} />
                  <span>{t("common.refresh")}</span>
                </button>
              </div>

              {usersLoading ? (
                <div className="py-12 text-center text-gray-400 text-xs">{t("admin.loadingUsers")}</div>
              ) : (
                <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                  {usersList.map((u) => (
                    <div key={u.id} className="p-4 flex items-center justify-between hover:bg-gray-50/70">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm">
                          {u.name ? u.name[0].toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#002f34]">{u.name}</span>
                            {u.role === "admin" && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                                Admin / Owner
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>

                      <div className="text-right text-xs text-gray-400">
                        {t("admin.joinedLabel")} {new Date(u.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>{t("admin.footerNotice")}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-gray-600 hover:text-[#002f34] transition-colors cursor-pointer"
          >
            {t("admin.closePanel")}
          </button>
        </div>
      </div>
    </div>
  );
}
