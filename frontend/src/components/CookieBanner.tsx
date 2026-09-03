"use client";

import React, { useState, useEffect } from "react";
import { Cookie, ShieldCheck, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function CookieBanner() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(true);

  const updateGtagConsent = (status: "granted" | "denied") => {
    if (typeof window !== "undefined" && typeof (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag === "function") {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("consent", "update", {
        analytics_storage: status,
        ad_storage: status,
        ad_user_data: status,
        ad_personalization: status,
      });
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("deallyhub_cookie_consent");
      if (!saved) {
        // First-time visitor: display banner
        setIsOpen(true);
      } else if (saved === "granted") {
        updateGtagConsent("granted");
      }
    } catch {
      // Ignore storage errors in restricted iframe/browser modes
    }

    const handleReopen = () => {
      setShowDetails(true);
      setIsOpen(true);
    };

    window.addEventListener("deallyhub:openCookieSettings", handleReopen);
    return () => {
      window.removeEventListener("deallyhub:openCookieSettings", handleReopen);
    };
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem("deallyhub_cookie_consent", "granted");
    } catch {}
    updateGtagConsent("granted");
    setIsOpen(false);
  };

  const handleNecessaryOnly = () => {
    try {
      localStorage.setItem("deallyhub_cookie_consent", "denied");
    } catch {}
    updateGtagConsent("denied");
    setIsOpen(false);
  };

  const handleSaveCustom = () => {
    const status = analyticsEnabled ? "granted" : "denied";
    try {
      localStorage.setItem("deallyhub_cookie_consent", status);
    } catch {}
    updateGtagConsent(status);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 md:bottom-6 md:right-6 md:left-auto md:max-w-lg z-[9999] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-5 text-slate-800 dark:text-slate-100 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
          <Cookie className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-base text-slate-900 dark:text-white">
              {t("cookie.title", "Cookie & Privacy Preferences")}
            </h3>
            <button
              onClick={handleNecessaryOnly}
              title={t("cookie.necessaryOnly", "Essential Only")}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 -mr-1 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {t(
              "cookie.description",
              "We use cookies and Google Analytics to analyze traffic, improve Deallyhub performance, and enhance your experience. You can choose to accept all cookies or only essential ones."
            )}
          </p>

          {/* Collapsible Details */}
          {showDetails && (
            <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800 space-y-3">
              {/* Essential */}
              <div className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{t("cookie.essentialTitle", "Essential (Required)")}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t(
                      "cookie.essentialDesc",
                      "Required for authentication, security, theme settings, and core marketplace functionality."
                    )}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {t("cookie.alwaysActive", "Always active")}
                </span>
              </div>

              {/* Analytics */}
              <div className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                    <span>{t("cookie.analyticsTitle", "Analytics (Google Analytics)")}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t(
                      "cookie.analyticsDesc",
                      "Help us understand visitor usage and traffic patterns (Measurement ID: G-JKH1MXWFNY)."
                    )}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={analyticsEnabled}
                    onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition underline underline-offset-2"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  {t("cookie.customize", "Preferences")}
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  {t("cookie.customize", "Preferences")}
                </>
              )}
            </button>

            <div className="flex items-center gap-2 ml-auto">
              {showDetails ? (
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
                >
                  {t("cookie.saveChoices", "Save Preferences")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNecessaryOnly}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                >
                  {t("cookie.necessaryOnly", "Essential Only")}
                </button>
              )}

              <button
                type="button"
                onClick={handleAcceptAll}
                className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow transition"
              >
                <Check className="w-3.5 h-3.5" />
                {t("cookie.acceptAll", "Accept All")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
