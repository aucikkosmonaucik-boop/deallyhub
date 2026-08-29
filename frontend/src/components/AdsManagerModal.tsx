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
  currency: string;
  location: string;
  images: string[];
  phone?: string;
  status: string;
  created_at: string;
}

interface AdsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "my-ads" | "create";
  categories: Category[];
  token: string | null;
  onAdCreated?: () => void;
}

export default function AdsManagerModal({
  isOpen,
  onClose,
  initialTab = "my-ads",
  categories,
  token,
  onAdCreated
}: AdsManagerModalProps) {
  const [activeTab, setActiveTab] = useState<"my-ads" | "create">(initialTab);
  const [myAds, setMyAds] = useState<Advertisement[]>([]);
  const [loadingAds, setLoadingAds] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug || "antiques-collectibles");
  const [price, setPrice] = useState("");
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

  // Handle local file uploads with preview
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

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
    if (!confirm("Are you sure you want to delete this advertisement?")) return;
    const apiUrl = getApiUrl();

    try {
      const res = await fetch(`${apiUrl}/api/ads/${adId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setMyAds((prev) => prev.filter((ad) => ad.id !== adId));
        if (onAdCreated) onAdCreated();
      } else {
        alert(data.error || "Failed to delete advertisement.");
      }
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

    setError(null);
    setSubmitting(true);
    const apiUrl = getApiUrl();

    const payload = {
      categorySlug,
      title: title.trim(),
      description: description.trim(),
      price: isFree ? 0 : parseFloat(price) || 0,
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

      const data = await res.json();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden relative my-auto">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#002f34]">Advertisements Hub</h2>
              <p className="text-xs text-gray-500">Manage your listings and post new classifieds</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#002f34] p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 px-6 bg-gray-50/50 shrink-0">
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
            <span>My Advertisements</span>
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
                <span>Edit Advertisement</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-teal-600" />
                <span>Post New Advertisement</span>
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
              Cancel Edit
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
                  <p className="text-sm">Loading your advertisements...</p>
                </div>
              ) : myAds.length === 0 ? (
                <div className="py-16 text-center max-w-sm mx-auto">
                  <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-[#002f34]">No advertisements yet</h3>
                  <p className="text-xs text-gray-500 mt-1 mb-5">
                    You haven&apos;t posted any classifieds yet. Start selling your items, services, or vehicles today!
                  </p>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="inline-flex items-center gap-2 bg-[#002f34] hover:bg-[#003e45] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post Your First Ad</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myAds.map((ad) => {
                    const catName = categories.find((c) => c.slug === ad.category_slug)?.name || ad.category_slug;
                    const coverImg = ad.images && ad.images.length > 0 ? ad.images[0] : null;

                    return (
                      <div
                        key={ad.id}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                      >
                        {/* Photo Thumbnail */}
                        <div className="h-40 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                          {coverImg ? (
                            <img
                              src={coverImg}
                              alt={ad.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-gray-400 flex flex-col items-center">
                              <ImageIcon className="w-8 h-8 mb-1" />
                              <span className="text-xs">No photo</span>
                            </div>
                          )}

                          {/* Category Badge */}
                          <span className="absolute top-2.5 left-2.5 bg-[#002f34]/85 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                            {catName}
                          </span>
                        </div>

                        {/* Card Info */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-[#002f34] text-base line-clamp-1 mb-1">
                              {ad.title}
                            </h4>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                              {ad.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                            <div>
                              <span className="text-lg font-black text-[#002f34]">
                                {parseFloat(ad.price as string) === 0
                                  ? "Free"
                                  : `${ad.price} ${ad.currency}`}
                              </span>
                              <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                <span>{ad.location}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleStartEdit(ad)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                title="Edit advertisement"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteAd(ad.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer"
                                title="Delete advertisement"
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
                  Category *
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
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Title */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-[#002f34] uppercase tracking-wider">
                    Title *
                  </label>
                  <span className="text-[11px] text-gray-400">{title.length}/100</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Vintage Leather Jacket, iPhone 14 Pro, Apartment for rent..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#002f34] placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
                />
              </div>

              {/* 3. Price & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <div>
                  <label className="block text-xs font-bold text-[#002f34] uppercase tracking-wider mb-1.5">
                    Price *
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
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#002f34] placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-bold disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>

                  <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isFree}
                      onChange={(e) => setIsFree(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-gray-300"
                    />
                    <span className="text-xs text-gray-600 font-medium">Free / Giveaway item</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002f34] uppercase tracking-wider mb-1.5">
                    Currency
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
                  Photos ({images.length} added)
                </label>

                {/* Upload Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {/* File Upload Button */}
                  <label className="flex items-center justify-center gap-2.5 p-3.5 border-2 border-dashed border-gray-300 hover:border-teal-500 rounded-xl bg-gray-50 hover:bg-teal-50/50 cursor-pointer transition-all text-sm font-semibold text-[#002f34]">
                    <Upload className="w-4 h-4 text-teal-600" />
                    <span>Upload photos from device</span>
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
                      placeholder="Paste image link URL..."
                      className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#002f34] placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 bg-gray-100 hover:bg-gray-200 text-[#002f34] rounded-xl text-xs font-bold transition-colors"
                    >
                      Add
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
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-90 group-hover:opacity-100 transition-opacity shadow-xs"
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
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Warsaw, Remote, Entire Country..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#002f34] placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002f34] uppercase tracking-wider mb-1.5">
                    Phone Number (Contact)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +48 123 456 789"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#002f34] placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Description */}
              <div>
                <label className="block text-xs font-bold text-[#002f34] uppercase tracking-wider mb-1.5">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your item or service in detail. Include condition, brand, specifications, and reason for selling..."
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
                      <span>{editingAdId ? "Saving changes..." : "Publishing advertisement..."}</span>
                    </>
                  ) : (
                    <>
                      {editingAdId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{editingAdId ? "Save Changes" : "Publish Advertisement"}</span>
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
