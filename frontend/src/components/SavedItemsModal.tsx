"use client";

import React, { useState, useEffect } from "react";
import { X, Heart, Trash2, MapPin, Image as ImageIcon, Loader2 } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

interface Advertisement {
  id: number;
  user_id: number;
  category_slug: string;
  title: string;
  description: string;
  price: number | string;
  original_price?: number | string | null;
  currency: string;
  location: string;
  images: string[];
  phone?: string;
  status: string;
  created_at: string;
  author_name?: string;
  author_email?: string;
}

interface SavedItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  categories: Category[];
  onItemRemoved?: (adId: number) => void;
  onSelectAd?: (ad: Advertisement) => void;
}

export default function SavedItemsModal({
  isOpen,
  onClose,
  token,
  categories,
  onItemRemoved,
  onSelectAd
}: SavedItemsModalProps) {
  const { t, getCategoryName } = useLanguage();
  const [savedAds, setSavedAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && token) {
      fetchSavedItems();
    }
  }, [isOpen, token]);

  const fetchSavedItems = async () => {
    if (!token) return;
    setLoading(true);
    const apiUrl = getApiUrl();

    try {
      const res = await fetch(`${apiUrl}/api/saved`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.saved)) {
        setSavedAds(data.saved);
      }
    } catch (err) {
      console.warn("Failed to fetch saved items:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (adId: number) => {
    if (!token) return;
    const apiUrl = getApiUrl();

    try {
      const res = await fetch(`${apiUrl}/api/saved/${adId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setSavedAds((prev) => prev.filter((item) => item.id !== adId));
        if (onItemRemoved) onItemRemoved(adId);
      }
    } catch (err) {
      console.error("Failed to remove saved item:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-gray-100 dark:border-slate-800 w-full max-w-2xl h-full sm:h-auto max-h-[100dvh] sm:max-h-[85vh] flex flex-col overflow-hidden relative sm:my-auto text-[#002f34] dark:text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-5">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-500" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#002f34] dark:text-white">{t("saved.title")}</h2>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400">{t("saved.subtitle")}</p>
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

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-16 text-center text-gray-400 dark:text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600 dark:text-teal-400 mb-2" />
              <p className="text-sm">{t("common.loading")}</p>
            </div>
          ) : savedAds.length === 0 ? (
            <div className="py-14 text-center max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-300 dark:text-rose-500/50 flex items-center justify-center mx-auto mb-3">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#002f34] dark:text-white">{t("saved.empty")}</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 mb-5">
                {t("saved.emptyDesc")}
              </p>
              <button
                onClick={onClose}
                className="bg-[#002f34] dark:bg-teal-600 hover:bg-[#003e45] dark:hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {t("saved.browseBtn")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedAds.map((ad) => {
                const cat = categories.find((c) => c.slug === ad.category_slug);
                const coverImg = ad.images && ad.images.length > 0 ? ad.images[0] : null;

                return (
                  <div
                    key={ad.id}
                    className="bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                  >
                    {/* Thumbnail - clickable to open ad */}
                    <div
                      onClick={() => onSelectAd && onSelectAd(ad)}
                      className="h-36 bg-gray-100 dark:bg-slate-950 relative overflow-hidden flex items-center justify-center cursor-pointer select-none"
                      role="button"
                      tabIndex={0}
                      aria-label={`Open advertisement: ${ad.title}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (onSelectAd) onSelectAd(ad);
                        }
                      }}
                    >
                      {coverImg ? (
                        <img
                          src={coverImg}
                          alt={ad.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-gray-400 dark:text-slate-500 flex flex-col items-center">
                          <ImageIcon className="w-7 h-7 mb-1" />
                          <span className="text-[10px]">{t("adDetails.noPhoto")}</span>
                        </div>
                      )}

                      {cat && (
                        <span className="absolute top-2 left-2 bg-[#002f34]/90 dark:bg-teal-900/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs pointer-events-none">
                          {getCategoryName(cat.slug, cat.name)}
                        </span>
                      )}

                      {/* Multiple Images Badge */}
                      {ad.images && ad.images.length > 1 && (
                        <span className="absolute bottom-2 right-2 bg-black/65 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs pointer-events-none">
                          <ImageIcon className="w-3 h-3" />
                          <span>{ad.images.length}</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(ad.id);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-rose-500 hover:text-rose-600 active:scale-95 rounded-full shadow-xs transition-all cursor-pointer z-10"
                        title={t("saved.remove")}
                        aria-label={t("saved.remove")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Card Content - clickable to open ad */}
                    <div
                      onClick={() => onSelectAd && onSelectAd(ad)}
                      className="p-3.5 flex-1 flex flex-col justify-between cursor-pointer"
                    >
                      <div>
                        <div className="flex items-baseline gap-1.5 mb-0.5">
                          <div className={`text-base font-black ${ad.original_price && parseFloat(ad.original_price as string) > parseFloat(ad.price as string) ? "text-green-600 dark:text-green-400" : "text-[#002f34] dark:text-teal-400"}`}>
                            {parseFloat(ad.price as string) === 0
                              ? t("common.free")
                              : `${ad.price} ${ad.currency}`}
                          </div>
                          {ad.original_price && parseFloat(ad.original_price as string) > parseFloat(ad.price as string) && (
                            <>
                              <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 line-through">
                                {ad.original_price} {ad.currency}
                              </span>
                              <span className="text-[9px] font-bold px-1 py-0.2 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded">
                                -{Math.round(((parseFloat(ad.original_price as string) - parseFloat(ad.price as string)) / parseFloat(ad.original_price as string)) * 100)}%
                              </span>
                            </>
                          )}
                        </div>
                        <h4 className="font-bold text-[#002f34] dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors text-sm line-clamp-1">
                          {ad.title}
                        </h4>
                      </div>

                      <div className="pt-2 border-t border-gray-100 dark:border-slate-700 flex items-center gap-1 text-[11px] text-gray-400 dark:text-slate-400 mt-2">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{ad.location}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
