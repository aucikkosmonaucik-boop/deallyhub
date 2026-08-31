"use client";

import React, { useState, useEffect } from "react";
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
  Edit3
} from "lucide-react";
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
  const { t, getCategoryName } = useLanguage();
  const [activeTab, setActiveTab] = useState<"my-ads" | "create">(initialTab);
  const [myAds, setMyAds] = useState<Advertisement[]>([]);
  const [loadingAds, setLoadingAds] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug || "antiques-collectibles");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [isPromo, setIsPromo] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [isFree, setIsFree] = useState(false);
  const [location, setLocation] = useState("Entire Country");
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
        throw new Error(data.error || `Failed to ${isEditing ? "update" : "publish"} advertisement.`);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-gray-100 w-full max-w-3xl h-full sm:h-auto max-h-[100dvh] sm:max-h-[90vh] flex flex-col overflow-hidden relative sm:my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-5">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#002f34]">Advertisements Hub</h2>
              <p className="text-[11px] sm:text-xs text-gray-500">Manage your listings and post new classifieds</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#002f34] p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 px-4 sm:px-6 bg-gray-50/50 shrink-0">
          <button
            onClick={() => {
              setActiveTab("my-ads");
              setError(null);
            }}
            className={`py-3.5 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "my-ads"
                ? "border-[#002f34] text-[#002f34]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <span>{t("adsManager.myAds")}</span>
            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full font-semibold">
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
            className={`py-3.5 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "create"
                ? "border-[#002f34] text-[#002f34]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {editingAdId ? (
              <>
                <Edit3 className="w-4 h-4 text-teal-600" />
                <span>{t("adsManager.editAd")}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-teal-600" />
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
              className="ml-auto my-auto text-xs text-gray-500 hover:text-red-500 font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:border-red-200 transition-colors"
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
                <div className="py-16 text-center text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600 mb-2" />
                  <p className="text-sm">{t("common.loading")}</p>
                </div>
              ) : myAds.length === 0 ? (
                <div className="py-16 text-center max-w-sm mx-auto">
                  <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-[#002f34]">{t("adsManager.noMyAds")}</h3>
                  <p className="text-xs text-gray-500 mt-1 mb-5">
                    {t("feed.noAdsDesc")}
                  </p>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="inline-flex items-center gap-2 bg-[#002f34] hover:bg-[#003e45] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all"
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
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                      >
                        {/* Photo Thumbnail - clickable to open ad */}
                        <div
                          onClick={() => onSelectAd && onSelectAd(ad)}
                          className="h-40 bg-gray-100 relative overflow-hidden flex items-center justify-center cursor-pointer select-none"
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
                            <div className="text-gray-400 flex flex-col items-center">
                              <ImageIcon className="w-8 h-8 mb-1" />
                              <span className="text-xs">{t("adDetails.noPhoto")}</span>
                            </div>
                          )}

                          {/* Category Badge */}
                          <span className="absolute top-2.5 left-2.5 bg-[#002f34]/85 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full pointer-events-none">
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
                            <h4 className="font-bold text-[#002f34] group-hover:text-teal-700 transition-colors text-base line-clamp-1 mb-1">
                              {ad.title}
                            </h4>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                              {ad.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                            <div
                              onClick={() => onSelectAd && onSelectAd(ad)}
                              className="cursor-pointer flex-1 mr-2"
                            >
                              <div className="flex items-baseline gap-2">
                                <span className={`text-lg font-black ${ad.original_price && parseFloat(ad.original_price as string) > parseFloat(ad.price as string) ? "text-green-600" : "text-[#002f34]"}`}>
                                  {parseFloat(ad.price as string) === 0
                                    ? t("common.free")
                                    : `${ad.price} ${ad.currency}`}
                                </span>
                                {ad.original_price && parseFloat(ad.original_price as string) > parseFloat(ad.price as string) && (
                                  <>
                                    <span className="text-xs font-semibold text-gray-400 line-through">
                                      {ad.original_price} {ad.currency}
                                    </span>
                                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded">
                                      -{Math.round(((parseFloat(ad.original_price as string) - parseFloat(ad.price as string)) / parseFloat(ad.original_price as string)) * 100)}%
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
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
                                className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 active:bg-teal-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
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
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 active:bg-red-100 p-2 rounded-lg transition-colors cursor-pointer"
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
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* 1. Category Selection */}
              <div>
                <label className="block text-xs font-bold text-[#002f34] uppercase tracking-wider mb-2">
                  {t("adsManager.categoryLabel")} *
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-[#002f34] focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {getCategoryName(c.slug, c.name)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Title */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-[#002f34] uppercase tracking-wider">
                    {t("adsManager.titleLabel")} *
                  </label>
                  <span className="text-[11px] text-gray-400">{title.length}/100</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("adsManager.titlePlaceholder")}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#002f34] placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
                />
              </div>

              {/* 3. Price & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <div>
                  <label className="block text-xs font-bold text-[#002f34] uppercase tracking-wider mb-1.5">
                    {t("adsManager.priceLabel")} *
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      disabled={isFree}
                      required={!isFree}
                      value={isFree ? "0" : price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder={t("adsManager.pricePlaceholder")}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#002f34] placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-bold disabled:bg-gray-100 disabled:text-gray-400"
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
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-gray-300"
                    />
                    <span className="text-xs text-gray-600 font-medium">{t("adsManager.freeItem")}</span>
                  </label>

                  {/* Promo Checkbox */}
                  {!isFree && (
                    <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isPromo}
                        onChange={(e) => setIsPromo(e.target.checked)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-gray-300"
                      />
                      <span className="text-xs text-rose-700 font-semibold flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        {t("adsManager.isPromo")}
                      </span>
                    </label>
                  )}

                  {/* Original / Regular Price Input */}
                  {isPromo && !isFree && (
                    <div className="mt-3 p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl space-y-2">
                      <label className="block text-[11px] font-bold text-rose-900 uppercase tracking-wider">
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
                          className="w-full pl-9 pr-3 py-2 bg-white border border-rose-300 rounded-lg text-xs font-bold text-gray-900 placeholder-rose-300 focus:ring-2 focus:ring-rose-500"
                        />
                      </div>
                      {parseFloat(originalPrice) > parseFloat(price || "0") && parseFloat(price || "0") > 0 && (
                        <div className="flex items-center justify-between text-xs font-bold text-rose-700">
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
                  <label className="block text-xs font-bold text-[#002f34] uppercase tracking-wider mb-1.5">
                    {t("adsManager.currencyLabel")}
                  </label>
                  <select
                    disabled={isFree}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-[#002f34] focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all disabled:bg-gray-100 disabled:text-gray-400 cursor-pointer"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="PLN">PLN (zł)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              {/* 4. Photos / Images */}
              <div>
                <label className="block text-xs font-bold text-[#002f34] uppercase tracking-wider mb-2">
                  {t("adsManager.photosLabel")} ({images.length})
                </label>

                {/* Upload Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {/* File Upload Button */}
                  <label className="flex items-center justify-center gap-2.5 p-3.5 border-2 border-dashed border-gray-300 hover:border-teal-500 rounded-xl bg-gray-50 hover:bg-teal-50/50 cursor-pointer transition-all text-sm font-semibold text-[#002f34]">
                    <Upload className="w-4 h-4 text-teal-600" />
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
                      className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#002f34] placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 bg-gray-100 hover:bg-gray-200 text-[#002f34] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {t("adsManager.addUrlBtn")}
                    </button>
                  </div>
                </div>

                {/* Image Thumbnails Preview Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-lg overflow-hidden border border-gray-300 bg-white group"
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
                  <label className="block text-xs font-bold text-[#002f34] uppercase tracking-wider mb-1.5">
                    {t("adsManager.locationLabel")}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder={t("adsManager.locationPlaceholder")}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#002f34] placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002f34] uppercase tracking-wider mb-1.5">
                    {t("adsManager.phoneLabel")}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t("adsManager.phonePlaceholder")}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#002f34] placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Description */}
              <div>
                <label className="block text-xs font-bold text-[#002f34] uppercase tracking-wider mb-1.5">
                  {t("adsManager.descLabel")} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("adsManager.descPlaceholder")}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#002f34] placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-normal leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#002f34] hover:bg-[#003e45] text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
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
