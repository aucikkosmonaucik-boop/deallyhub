"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  Plus,
  Tag,
  DollarSign,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Layers,
  Phone,
  Edit3,
  ChevronDown,
  Check,
  Sparkles
} from "lucide-react";
import LocationPicker from "@/components/LocationPicker";
import { getApiUrl } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { containsProfanity } from "@/lib/contentFilter";
import { CATEGORY_DETAILS } from "@/data/categoryData";

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

interface AdsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "my-ads" | "create";
  categories: Category[];
  token: string | null;
  onAdCreated?: () => void;
  onSelectAd?: (ad: Advertisement) => void;
}

export default function AdsManagerModal({
  isOpen,
  onClose,
  initialTab = "my-ads",
  categories,
  token,
  onAdCreated,
  onSelectAd
}: AdsManagerModalProps) {
  const { t, getCategoryName, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"my-ads" | "create">(initialTab);
  const [myAds, setMyAds] = useState<Advertisement[]>([]);
  const [loadingAds, setLoadingAds] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug || "antiques-collectibles");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [isPromo, setIsPromo] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [isFree, setIsFree] = useState(false);
  const [location, setLocation] = useState("Entire Country");
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingAdId, setEditingAdId] = useState<number | null>(null);

  const resetForm = () => {
    setEditingAdId(null);
    setTitle("");
    setDescription("");
    setPrice("");
    setOriginalPrice("");
    setIsPromo(false);
    setPhone("");
    setImages([]);
    setIsFree(false);
    setCategorySlug(categories[0]?.slug || "antiques-collectibles");
    setSelectedSubcategory(null);
    setSelectedGroupIndex(null);
    setLocation("Entire Country");
    setCurrency("USD");
  };

  const handleStartEdit = (ad: Advertisement) => {
    setEditingAdId(ad.id);
    setTitle(ad.title || "");
    setCategorySlug(ad.category_slug || categories[0]?.slug || "");
    setPrice(ad.price ? String(ad.price) : "");
    const origPriceVal = ad.original_price ? String(ad.original_price) : "";
    setOriginalPrice(origPriceVal);
    setIsPromo(!!(ad.original_price && parseFloat(String(ad.original_price)) > parseFloat(String(ad.price || 0))));
    setIsFree(parseFloat(String(ad.price)) === 0);
    setCurrency(ad.currency || "USD");
    setLocation(ad.location || "Entire Country");
    setPhone(ad.phone || "");
    setDescription(ad.description || "");
    setImages(Array.isArray(ad.images) ? [...ad.images] : []);
    setError(null);
    setSuccessMessage(null);
    setActiveTab("create");
  };

  // Sync tab with initialTab prop when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialTab === "create" && !editingAdId) {
        resetForm();
      }
      setActiveTab(initialTab);
      setError(null);
      setSuccessMessage(null);
      if (token) {
        fetchMyAds();
      }
    }
  }, [isOpen, initialTab, token]);

  const fetchMyAds = async () => {
    if (!token) return;
    setLoadingAds(true);
    const apiUrl = getApiUrl();

    try {
      const res = await fetch(`${apiUrl}/api/ads/my`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.ads)) {
        setMyAds(data.ads);
      }
    } catch (err) {
      console.warn("Failed to fetch my ads:", err);
    } finally {
      setLoadingAds(false);
    }
  };

  // Helper to compress local uploaded images on the client side before converting to Base64
  const compressImageFile = (file: File, maxDimension = 1600, quality = 0.82): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type === "image/svg+xml" || !file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || "");
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", quality));
          } else {
            resolve((event.target?.result as string) || "");
          }
        };
        img.onerror = () => resolve((event.target?.result as string) || "");
        img.src = (event.target?.result as string) || "";
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  // Handle local file uploads with automatic compression and preview
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (fileList.length === 0) return;

    for (const file of fileList) {
      try {
        const compressedBase64 = await compressImageFile(file, 1600, 0.82);
        if (compressedBase64) {
          setImages((prev) => [...prev, compressedBase64]);
        }
      } catch (err) {
        console.warn("Failed to process image file:", err);
      }
    }

    e.target.value = "";
  };

  // Add Image URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput("");
  };

  // Remove Image
  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Handle Delete Ad
  const handleDeleteAd = async (adId: number) => {
    if (!confirm(t("adsManager.deletePrompt"))) return;
    const apiUrl = getApiUrl();

    try {
      const res = await fetch(`${apiUrl}/api/ads/${adId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (data.success) {
          setMyAds((prev) => prev.filter((ad) => ad.id !== adId));
          if (onAdCreated) onAdCreated();
          return;
        }
      }
      alert("Failed to delete advertisement.");
    } catch (err) {
      alert("Network error while deleting advertisement.");
    }
  };

  // Handle Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("You must be signed in to post an advertisement.");
      return;
    }

    const currentPriceNum = isFree ? 0 : parseFloat(price) || 0;
    const origPriceNum = isPromo && !isFree && originalPrice ? parseFloat(originalPrice) : null;

    if (isPromo && !isFree && origPriceNum !== null && origPriceNum <= currentPriceNum) {
      setError("Regular price must be greater than current promo price.");
      return;
    }

    // Client-side profanity validation
    const titleCheck = containsProfanity(title.trim());
    const descCheck = containsProfanity(description.trim());
    const locCheck = containsProfanity(location.trim());
    if (titleCheck.hasProfanity || descCheck.hasProfanity || locCheck.hasProfanity) {
      setError(t("errors.profanityAd"));
      return;
    }

    setError(null);
    setSubmitting(true);
    const apiUrl = getApiUrl();

    const payload = {
      categorySlug,
      title: title.trim(),
      description: description.trim(),
      price: currentPriceNum,
      originalPrice: origPriceNum,
      currency,
      location: location.trim() || "Entire Country",
      phone: phone.trim(),
      images
    };

    const isEditing = editingAdId !== null;
    const url = isEditing ? `${apiUrl}/api/ads/${editingAdId}` : `${apiUrl}/api/ads`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      let data: any;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        if (res.status === 413) {
          throw new Error("Photos payload is too large. Please select fewer or smaller images.");
        }
        throw new Error(`Server returned error ${res.status}. Please try again.`);
      }

      if (!res.ok || !data.success) {
        const errStr = data.error || "";
        if (
          data.violation === "NSFW_IMAGE_DETECTED" ||
          errStr.toLowerCase().includes("nudity") ||
          errStr.toLowerCase().includes("nagość") ||
          errStr.toLowerCase().includes("erotic") ||
          errStr.toLowerCase().includes("adult material") ||
          errStr.toLowerCase().includes("porn")
        ) {
          throw new Error(t("errors.nsfwImage"));
        }
        if (
          errStr.toLowerCase().includes("prohibited") ||
          errStr.toLowerCase().includes("offensive") ||
          errStr.toLowerCase().includes("niedozwolon") ||
          errStr.toLowerCase().includes("obrażliw")
        ) {
          throw new Error(t("errors.profanityAd"));
        }
        throw new Error(errStr || `Failed to ${isEditing ? "update" : "publish"} advertisement.`);
      }

      setSuccessMessage(isEditing ? "Advertisement updated successfully!" : "Advertisement published successfully!");
      resetForm();

      // Refresh list & switch tab after brief delay
      fetchMyAds();
      if (onAdCreated) onAdCreated();

      setTimeout(() => {
        setSuccessMessage(null);
        setActiveTab("my-ads");
      }, 1200);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const currentCategoryDetails = useMemo(() => {
    return categorySlug ? CATEGORY_DETAILS[categorySlug] : null;
  }, [categorySlug]);

  const getTranslatedText = useCallback(
    (obj?: Record<string, string>, fallback: string = "") => {
      if (!obj) return fallback;
      return obj[language] || obj.pl || obj.en || fallback;
    },
    [language]
  );

  const subcategoryGroups = useMemo(() => {
    return currentCategoryDetails?.groups || [];
  }, [currentCategoryDetails]);

  const visibleSubcategories = useMemo(() => {
    if (!subcategoryGroups.length) return [];
    if (selectedGroupIndex !== null && subcategoryGroups[selectedGroupIndex]) {
      return subcategoryGroups[selectedGroupIndex].items.map((item) => ({
        name: getTranslatedText(item.name, "Item"),
        groupName: getTranslatedText(subcategoryGroups[selectedGroupIndex].title, "Group"),
        query: item.query
      }));
    }
    const all: Array<{ name: string; groupName: string; query?: string }> = [];
    subcategoryGroups.forEach((g) => {
      const gTitle = getTranslatedText(g.title, "Group");
      g.items.forEach((item) => {
        all.push({
          name: getTranslatedText(item.name, "Item"),
          groupName: gTitle,
          query: item.query
        });
      });
    });
    return all;
  }, [subcategoryGroups, selectedGroupIndex, getTranslatedText]);

  const categoryPopularTags = useMemo(() => {
    if (!currentCategoryDetails?.popularTags) return [];
    return (
      currentCategoryDetails.popularTags[language] ||
      currentCategoryDetails.popularTags.pl ||
      currentCategoryDetails.popularTags.en ||
      []
    );
  }, [currentCategoryDetails, language]);

  const handleSelectSubcategory = (subName: string) => {
    if (selectedSubcategory === subName) {
      setSelectedSubcategory(null);
      return;
    }
    setSelectedSubcategory(subName);
    // Autofill title if empty
    if (!title.trim()) {
      setTitle(subName);
    }
  };

  const handleAddTagToTitle = (tag: string) => {
    if (!title.trim()) {
      setTitle(tag);
    } else if (!title.toLowerCase().includes(tag.toLowerCase())) {
      setTitle(`${title.trim()} ${tag}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-gray-100 dark:border-slate-800 w-full max-w-3xl h-full sm:h-auto max-h-[100dvh] sm:max-h-[90vh] flex flex-col overflow-hidden relative sm:my-auto text-[#002f34] dark:text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-5">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#002f34] dark:text-white">{t("nav.myAdvertisements", "Advertisements Hub")}</h2>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400">Manage your listings and post new classifieds</p>
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

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 dark:border-slate-800 px-4 sm:px-6 bg-gray-50/50 dark:bg-slate-900/50 shrink-0">
          <button
            onClick={() => {
              setActiveTab("my-ads");
              setError(null);
            }}
            className={`py-3.5 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "my-ads"
                ? "border-[#002f34] dark:border-teal-400 text-[#002f34] dark:text-teal-400"
                : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
            }`}
          >
            <span>{t("adsManager.myAds")}</span>
            <span className="bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full font-semibold">
              {myAds.length}
            </span>
          </button>

          <button
            onClick={() => {
              if (activeTab !== "create" && !editingAdId) {
                resetForm();
              }
              setActiveTab("create");
              setError(null);
            }}
            className={`py-3.5 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "create"
                ? "border-[#002f34] dark:border-teal-400 text-[#002f34] dark:text-teal-400"
                : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
            }`}
          >
            {editingAdId ? (
              <>
                <Edit3 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>{t("adsManager.editAd")}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>{t("adsManager.postNew")}</span>
              </>
            )}
          </button>

          {editingAdId && activeTab === "create" && (
            <button
              onClick={() => {
                resetForm();
                setActiveTab("my-ads");
              }}
              className="ml-auto my-auto text-xs text-gray-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-rose-400 font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-rose-800 transition-colors"
            >
              {t("common.cancel")}
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: MY ADS */}
          {activeTab === "my-ads" && (
            <div>
              {loadingAds ? (
                <div className="py-16 text-center text-gray-400 dark:text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600 dark:text-teal-400 mb-2" />
                  <p className="text-sm">{t("common.loading")}</p>
                </div>
              ) : myAds.length === 0 ? (
                <div className="py-16 text-center max-w-sm mx-auto">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-[#002f34] dark:text-white">{t("adsManager.noMyAds")}</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 mb-5">
                    {t("feed.noAdsDesc")}
                  </p>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="inline-flex items-center gap-2 bg-[#002f34] dark:bg-teal-600 hover:bg-[#003e45] dark:hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t("adsManager.postNew")}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myAds.map((ad) => {
                    const catObj = categories.find((c) => c.slug === ad.category_slug);
                    const catName = catObj ? getCategoryName(catObj.slug, catObj.name) : ad.category_slug;
                    const coverImg = ad.images && ad.images.length > 0 ? ad.images[0] : null;

                    return (
                      <div
                        key={ad.id}
                        className="bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                      >
                        {/* Photo Thumbnail - clickable to open ad */}
                        <div
                          onClick={() => onSelectAd && onSelectAd(ad)}
                          className="h-40 bg-gray-100 dark:bg-slate-950 relative overflow-hidden flex items-center justify-center cursor-pointer select-none"
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
                              <ImageIcon className="w-8 h-8 mb-1" />
                              <span className="text-xs">{t("adDetails.noPhoto")}</span>
                            </div>
                          )}

                          {/* Category Badge */}
                          <span className="absolute top-2.5 left-2.5 bg-[#002f34]/85 dark:bg-teal-900/90 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full pointer-events-none">
                            {catName}
                          </span>

                          {/* Multiple Images Badge */}
                          {ad.images && ad.images.length > 1 && (
                            <span className="absolute bottom-2.5 right-2.5 bg-black/65 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs pointer-events-none">
                              <ImageIcon className="w-3 h-3" />
                              <span>{ad.images.length}</span>
                            </span>
                          )}
                        </div>

                        {/* Card Info */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div
                            onClick={() => onSelectAd && onSelectAd(ad)}
                            className="cursor-pointer"
                          >
                            <h4 className="font-bold text-[#002f34] dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors text-base line-clamp-1 mb-1">
                              {ad.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mb-3">
                              {ad.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                            <div
                              onClick={() => onSelectAd && onSelectAd(ad)}
                              className="cursor-pointer flex-1 mr-2"
                            >
                              <div className="flex items-baseline gap-2">
                                <span className={`text-lg font-black ${ad.original_price && parseFloat(ad.original_price as string) > parseFloat(ad.price as string) ? "text-green-600 dark:text-green-400" : "text-[#002f34] dark:text-teal-400"}`}>
                                  {parseFloat(ad.price as string) === 0
                                    ? t("common.free")
                                    : `${ad.price} ${ad.currency}`}
                                </span>
                                {ad.original_price && parseFloat(ad.original_price as string) > parseFloat(ad.price as string) && (
                                  <>
                                    <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 line-through">
                                      {ad.original_price} {ad.currency}
                                    </span>
                                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded">
                                      -{Math.round(((parseFloat(ad.original_price as string) - parseFloat(ad.price as string)) / parseFloat(ad.original_price as string)) * 100)}%
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="text-[11px] text-gray-400 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                <span>{ad.location}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEdit(ad);
                                }}
                                className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 active:bg-teal-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer border border-transparent dark:border-teal-800/60"
                                title={t("common.edit")}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>{t("common.edit")}</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAd(ad.id);
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 active:bg-red-100 p-2 rounded-lg transition-colors cursor-pointer"
                                title={t("common.delete")}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: POST NEW AD FORM */}
          {activeTab === "create" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Feedback Banners */}
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* 1. Category Selection & Subcategories Bar */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#002f34] dark:text-slate-200 uppercase tracking-wider mb-2">
                    {t("adsManager.categoryLabel")} *
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={categorySlug}
                      onChange={(e) => {
                        setCategorySlug(e.target.value);
                        setSelectedSubcategory(null);
                        setSelectedGroupIndex(null);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-[#002f34] dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition-all appearance-none cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.slug} value={c.slug} className="dark:bg-slate-900">
                          {getCategoryName(c.slug, c.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subcategories Bar (Responsive for WWW & Android Mobile Browsers) */}
                {currentCategoryDetails && (
                  <div className="p-3 sm:p-3.5 bg-gradient-to-b from-gray-50 to-gray-100/70 dark:from-slate-800/80 dark:to-slate-900/80 rounded-2xl border border-gray-200/90 dark:border-slate-700/80 space-y-2.5 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span className="text-xs font-bold text-[#002f34] dark:text-slate-200 truncate">
                          {t("adsManager.subcategoriesLabel", "Pasek podkategorii")}
                        </span>
                        {selectedSubcategory && (
                          <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100/90 dark:bg-teal-950/80 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800/80 truncate max-w-[140px] sm:max-w-none">
                            {selectedSubcategory}
                          </span>
                        )}
                      </div>
                      {selectedSubcategory && (
                        <button
                          type="button"
                          onClick={() => setSelectedSubcategory(null)}
                          className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors shrink-0 ml-2"
                        >
                          <span>{t("adsManager.clearSubcategory", "Wyczyść")}</span>
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Group Filter Tabs (if category has multiple groups) */}
                    {subcategoryGroups.length > 1 && (
                      <div
                        className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1"
                        style={{
                          WebkitOverflowScrolling: "touch",
                          scrollbarWidth: "none",
                          msOverflowStyle: "none"
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedGroupIndex(null)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer border shrink-0 select-none ${
                            selectedGroupIndex === null
                              ? "bg-[#002f34] text-white border-[#002f34] dark:bg-teal-600 dark:border-teal-500 shadow-2xs"
                              : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600"
                          }`}
                        >
                          {t("adsManager.allSubcategories", "Wszystkie")}
                        </button>
                        {subcategoryGroups.map((group, gIdx) => {
                          const groupTitle = getTranslatedText(group.title, "Group");
                          const isSelected = selectedGroupIndex === gIdx;
                          return (
                            <button
                              key={gIdx}
                              type="button"
                              onClick={() => setSelectedGroupIndex(isSelected ? null : gIdx)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer border shrink-0 select-none ${
                                isSelected
                                  ? "bg-[#002f34] text-white border-[#002f34] dark:bg-teal-600 dark:border-teal-500 shadow-2xs"
                                  : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600"
                              }`}
                            >
                              {groupTitle}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Subcategories Scrollable Pill List */}
                    <div
                      className="flex items-center gap-1.5 overflow-x-auto py-1 -mx-1 px-1"
                      style={{
                        WebkitOverflowScrolling: "touch",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none"
                      }}
                    >
                      {visibleSubcategories.map((sub, sIdx) => {
                        const isSelected = selectedSubcategory === sub.name;
                        return (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => handleSelectSubcategory(sub.name)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer select-none shrink-0 active:scale-95 border ${
                              isSelected
                                ? "bg-teal-600 text-white border-teal-600 shadow-xs font-bold ring-2 ring-teal-300 dark:ring-teal-800"
                                : "bg-white dark:bg-slate-800/90 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-teal-900 dark:hover:text-teal-300 hover:border-teal-300"
                            }`}
                          >
                            {isSelected ? (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            ) : (
                              <span className="text-teal-600 dark:text-teal-400 font-bold">›</span>
                            )}
                            <span>{sub.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Popular Tags & Keywords Row */}
                    {categoryPopularTags.length > 0 && (
                      <div
                        className="flex items-center gap-1.5 overflow-x-auto pt-1.5 border-t border-gray-200/60 dark:border-slate-700/60 -mx-1 px-1"
                        style={{
                          WebkitOverflowScrolling: "touch",
                          scrollbarWidth: "none",
                          msOverflowStyle: "none"
                        }}
                      >
                        <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-0.5">
                          <Tag className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                          <span>{t("adsManager.popularTagsLabel", "Popularne:")}</span>
                        </span>
                        {categoryPopularTags.map((tag, tIdx) => (
                          <button
                            key={tIdx}
                            type="button"
                            onClick={() => handleAddTagToTitle(tag)}
                            className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold whitespace-nowrap bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-teal-800 dark:hover:text-teal-300 border border-gray-200 dark:border-slate-700 transition-colors cursor-pointer active:scale-95 shrink-0"
                            title={t("adsManager.applyToTitle", "Kliknij, aby dodać do tytułu")}
                          >
                            +{tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Title */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-[#002f34] dark:text-slate-200 uppercase tracking-wider">
                    {t("adsManager.titleLabel")} *
                  </label>
                  <span className="text-[11px] text-gray-400 dark:text-slate-500">{title.length}/100</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("adsManager.titlePlaceholder")}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-[#002f34] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
                />
              </div>

              {/* 3. Price & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <div>
                  <label className="block text-xs font-bold text-[#002f34] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    {t("adsManager.priceLabel")} *
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      disabled={isFree}
                      required={!isFree}
                      value={isFree ? "0" : price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder={t("adsManager.pricePlaceholder")}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-[#002f34] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold disabled:bg-gray-100 dark:disabled:bg-slate-800/50 disabled:text-gray-400 dark:disabled:text-slate-600"
                    />
                  </div>

                  <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isFree}
                      onChange={(e) => {
                        setIsFree(e.target.checked);
                        if (e.target.checked) setIsPromo(false);
                      }}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-gray-300 dark:border-slate-700"
                    />
                    <span className="text-xs text-gray-600 dark:text-slate-300 font-medium">{t("adsManager.freeItem")}</span>
                  </label>

                  {/* Promo Checkbox */}
                  {!isFree && (
                    <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isPromo}
                        onChange={(e) => setIsPromo(e.target.checked)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-gray-300 dark:border-slate-700"
                      />
                      <span className="text-xs text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        {t("adsManager.isPromo")}
                      </span>
                    </label>
                  )}

                  {/* Original / Regular Price Input */}
                  {isPromo && !isFree && (
                    <div className="mt-3 p-3 bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 rounded-xl space-y-2">
                      <label className="block text-[11px] font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wider">
                        {t("adsManager.originalPriceLabel")} *
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={originalPrice}
                          onChange={(e) => setOriginalPrice(e.target.value)}
                          placeholder={t("adsManager.originalPricePlaceholder")}
                          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 rounded-lg text-xs font-bold text-gray-900 dark:text-slate-100 placeholder-rose-300 dark:placeholder-slate-500 focus:ring-2 focus:ring-rose-500"
                        />
                      </div>
                      {parseFloat(originalPrice) > parseFloat(price || "0") && parseFloat(price || "0") > 0 && (
                        <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-300">
                          <span>
                            {t("adsManager.youSave")}: {(parseFloat(originalPrice) - parseFloat(price)).toFixed(2)} {currency}
                          </span>
                          <span className="px-2 py-0.5 bg-rose-600 text-white rounded-md text-[11px]">
                            -{Math.round(((parseFloat(originalPrice) - parseFloat(price)) / parseFloat(originalPrice)) * 100)}% {t("adsManager.discountBadge")}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002f34] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    {t("adsManager.currencyLabel")}
                  </label>
                  <select
                    disabled={isFree}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-[#002f34] dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition-all disabled:bg-gray-100 dark:disabled:bg-slate-800/50 disabled:text-gray-400 dark:disabled:text-slate-600 cursor-pointer"
                  >
                    <option value="USD" className="dark:bg-slate-900">USD ($)</option>
                    <option value="EUR" className="dark:bg-slate-900">EUR (€)</option>
                    <option value="PLN" className="dark:bg-slate-900">PLN (zł)</option>
                    <option value="GBP" className="dark:bg-slate-900">GBP (£)</option>
                  </select>
                </div>
              </div>

              {/* 4. Photos / Images */}
              <div>
                <label className="block text-xs font-bold text-[#002f34] dark:text-slate-200 uppercase tracking-wider mb-2">
                  {t("adsManager.photosLabel")} ({images.length})
                </label>

                {/* Upload Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {/* File Upload Button */}
                  <label className="flex items-center justify-center gap-2.5 p-3.5 border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 rounded-xl bg-gray-50 dark:bg-slate-800/60 hover:bg-teal-50/50 dark:hover:bg-slate-800 cursor-pointer transition-all text-sm font-semibold text-[#002f34] dark:text-slate-200">
                    <Upload className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>{t("adsManager.uploadLocal")}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* URL Input */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder={t("adsManager.orUrl")}
                      className="flex-1 px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-[#002f34] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-[#002f34] dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-transparent dark:border-slate-700"
                    >
                      {t("adsManager.addUrlBtn")}
                    </button>
                  </div>
                </div>

                {/* Image Thumbnails Preview Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-700">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-lg overflow-hidden border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 group"
                      >
                        <img
                          src={img}
                          alt={`Uploaded preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 bg-[#002f34] text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-90 group-hover:opacity-100 transition-opacity shadow-xs cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#002f34] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    {t("adsManager.locationLabel")}
                  </label>
                  <div className="relative">
                    <div
                      onClick={() => setIsLocationPickerOpen((prev) => !prev)}
                      className="w-full pl-10 pr-9 py-2.5 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100/80 dark:hover:bg-slate-700/80 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-[#002f34] dark:text-slate-100 focus:ring-2 focus:ring-teal-500 transition-all font-medium flex items-center justify-between cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 absolute left-3.5 top-3.5" />
                      <span className="truncate">
                        {location || t("adsManager.locationPlaceholder")}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 dark:text-slate-400 transition-transform duration-200 shrink-0 ${
                          isLocationPickerOpen ? "rotate-180 text-teal-600 dark:text-teal-400" : ""
                        }`}
                      />
                    </div>

                    {/* Location Picker Dropdown */}
                    {isLocationPickerOpen && (
                      <LocationPicker
                        value={location}
                        isOpen={isLocationPickerOpen}
                        onChange={(newLoc) => {
                          setLocation(newLoc);
                          setIsLocationPickerOpen(false);
                        }}
                        onClose={() => setIsLocationPickerOpen(false)}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002f34] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    {t("adsManager.phoneLabel")}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t("adsManager.phonePlaceholder")}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-[#002f34] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Description */}
              <div>
                <label className="block text-xs font-bold text-[#002f34] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  {t("adsManager.descLabel")} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("adsManager.descPlaceholder")}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-[#002f34] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-normal leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#002f34] dark:bg-teal-600 hover:bg-[#003e45] dark:hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t("common.loading")}</span>
                    </>
                  ) : (
                    <>
                      {editingAdId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{editingAdId ? t("adsManager.updateBtn") : t("adsManager.publishBtn")}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
