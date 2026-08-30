"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Calendar,
  Heart,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Image as ImageIcon,
  MessageSquare,
  ZoomIn
} from "lucide-react";

import { getApiUrl } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import ImageLightboxModal from "./ImageLightboxModal";

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
  author_name?: string;
  author_email?: string;
}

interface AdDetailsModalProps {
  ad: Advertisement | null;
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  isSaved: boolean;
  onToggleSave: (adId: number) => void;
  onStartChat?: (adId: number) => void;
}

export default function AdDetailsModal({
  ad,
  isOpen,
  onClose,
  categoryName,
  isSaved,
  onToggleSave,
  onStartChat
}: AdDetailsModalProps) {
  const { t, getCategoryName } = useLanguage();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setSelectedImageIdx(0);
    setShowPhone(false);
    setIsLightboxOpen(false);
  }, [ad]);

  if (!isOpen || !ad) return null;

  const images = ad.images && ad.images.length > 0 ? ad.images : [];
  const currentImage = images[selectedImageIdx] || null;
  const isFree = parseFloat(ad.price as string) === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden relative my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="bg-[#002f34] text-white text-xs font-bold px-3 py-1 rounded-full">
              {getCategoryName(ad.category_slug, categoryName)}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>{ad.location}</span>
            </div>
            <span className="text-gray-300 hidden sm:inline">&bull;</span>
            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(ad.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#002f34] p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Photos & Full Description (7 cols) */}
          <div className="md:col-span-7 space-y-6">
            {/* Main Photo Container */}
            <div
              onClick={() => currentImage && setIsLightboxOpen(true)}
              className={`w-full h-72 sm:h-96 bg-gray-100 rounded-2xl overflow-hidden relative flex items-center justify-center border border-gray-200 shadow-xs group ${
                currentImage ? "cursor-zoom-in" : ""
              }`}
            >
              {currentImage ? (
                <>
                  <img
                    src={currentImage}
                    alt={ad.title}
                    className="w-full h-full object-contain bg-black/5 transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  {/* Floating Zoom Badge */}
                  <div className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg opacity-90 group-hover:opacity-100 transition-all transform group-hover:scale-105">
                    <ZoomIn className="w-3.5 h-3.5 text-teal-400" />
                    <span>{t("adDetails.zoomIn", "Powiększ")}</span>
                  </div>
                </>
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <ImageIcon className="w-12 h-12 mb-2" />
                  <span className="text-sm font-medium">{t("adDetails.noPhoto")}</span>
                </div>
              )}
            </div>

            {/* Thumbnail Strip (if multiple photos) */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      selectedImageIdx === idx
                        ? "border-teal-600 ring-2 ring-teal-500/30 scale-105"
                        : "border-gray-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Description Section */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-sm font-bold text-[#002f34] uppercase tracking-wider mb-2">
                {t("adsManager.descLabel")}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line font-normal">
                {ad.description}
              </p>
            </div>
          </div>

          {/* Right Column: Title, Price, Seller Profile & Actions (5 cols) */}
          <div className="md:col-span-5 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Title & Price */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002f34] tracking-tight leading-snug">
                  {ad.title}
                </h1>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#002f34]">
                    {isFree ? t("common.free") : `${ad.price} ${ad.currency}`}
                  </span>
                </div>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => onToggleSave(ad.id)}
                className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer shadow-xs ${
                  isSaved
                    ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                    : "bg-gray-50 border-gray-200 text-[#002f34] hover:bg-gray-100"
                }`}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isSaved ? "fill-rose-500 text-rose-500" : "text-gray-400"
                  }`}
                />
                <span>{isSaved ? t("saved.remove") : t("common.save")}</span>
              </button>

              {/* Seller Information Card */}
              <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-4">
                <h4 className="text-xs font-bold text-[#002f34] uppercase tracking-wider">
                  {t("adDetails.seller")}
                </h4>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
                    {(ad.author_name || "S").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-[#002f34] text-base leading-tight">
                      {ad.author_name || t("adDetails.verifiedMember")}
                    </p>
                    <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span>{t("adDetails.verifiedMember")}</span>
                    </span>
                  </div>
                </div>

                {/* Contact Options */}
                <div className="space-y-2.5 pt-2 border-t border-gray-200/60">
                  {/* Chat with Seller Button */}
                  {onStartChat && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onStartChat(ad.id);
                      }}
                      className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{t("adDetails.chatBtn")}</span>
                    </button>
                  )}

                  {/* Phone Number */}
                  {ad.phone ? (
                    showPhone ? (
                      <a
                        href={`tel:${ad.phone}`}
                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-xs"
                      >
                        <Phone className="w-4 h-4" />
                        <span>{t("adDetails.callBtn")}: {ad.phone}</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => setShowPhone(true)}
                        className="w-full py-3 px-4 bg-[#002f34] hover:bg-[#003e45] text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <Phone className="w-4 h-4 text-teal-300" />
                        <span>{t("adDetails.showPhone")}</span>
                      </button>
                    )
                  ) : (
                    <div className="py-2.5 px-4 bg-gray-100 rounded-xl text-xs text-gray-500 flex items-center justify-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{t("adDetails.noPhone")}</span>
                    </div>
                  )}

                  {/* Email Seller */}
                  {ad.author_email && (
                    <a
                      href={`mailto:${ad.author_email}?subject=Regarding your offer: ${encodeURIComponent(ad.title)} on Deallyhub`}
                      className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-[#002f34] font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 border border-gray-300 shadow-xs"
                    >
                      <Mail className="w-4 h-4 text-teal-600" />
                      <span>{t("adDetails.emailBtn")}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Safety Tips Banner */}
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/60 text-[11px] text-teal-900 leading-relaxed space-y-1">
                <span className="font-bold block text-teal-950">{t("adDetails.safetyTip")}</span>
                <p>&bull; {t("adDetails.safetyTip1")}</p>
                <p>&bull; {t("adDetails.safetyTip2")}</p>
                <p>&bull; {t("adDetails.safetyTip3")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Lightbox with Zoom */}
      <ImageLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={images}
        initialIndex={selectedImageIdx}
        title={ad.title}
      />
    </div>
  );
}
