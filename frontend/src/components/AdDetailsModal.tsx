"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ZoomIn,
  ChevronLeft,
  ChevronRight
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

  // Touch Swipe Gesture State
  const [touchOffset, setTouchOffset] = useState(0);
  const [isDraggingTouch, setIsDraggingTouch] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const isSwipingGesture = useRef<boolean>(false);

  useEffect(() => {
    setSelectedImageIdx(0);
    setShowPhone(false);
    setIsLightboxOpen(false);
    setTouchOffset(0);
    setIsDraggingTouch(false);
  }, [ad]);

  const images = ad?.images && ad.images.length > 0 ? ad.images : [];
  const currentImage = images[selectedImageIdx] || null;
  const isFree = ad ? parseFloat(ad.price as string) === 0 : false;

  const handlePrevImage = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (images.length <= 1) return;
    setSelectedImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (images.length <= 1) return;
    setSelectedImageIdx((prev) => (prev + 1) % images.length);
  };

  // Keyboard navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    if (!isOpen || isLightboxOpen || images.length <= 1) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevImage();
      } else if (e.key === "ArrowRight") {
        handleNextImage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLightboxOpen, images.length]);

  // Touch handlers for finger swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
      isSwipingGesture.current = false;
      setIsDraggingTouch(false);
      setTouchOffset(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    // If horizontal swipe is dominant
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
      isSwipingGesture.current = true;
      setIsDraggingTouch(true);
      const clampedOffset = Math.max(Math.min(diffX, 120), -120);
      setTouchOffset(clampedOffset);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && isSwipingGesture.current && images.length > 1) {
      const swipeThreshold = 35;
      if (touchOffset < -swipeThreshold) {
        // Swiped LEFT with finger -> Next Image
        handleNextImage();
      } else if (touchOffset > swipeThreshold) {
        // Swiped RIGHT with finger -> Previous Image
        handlePrevImage();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
    setIsDraggingTouch(false);
    setTouchOffset(0);
    setTimeout(() => {
      isSwipingGesture.current = false;
    }, 80);
  };

  const handleImageClick = () => {
    if (isSwipingGesture.current) return;
    if (currentImage) {
      setIsLightboxOpen(true);
    }
  };

  if (!isOpen || !ad) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[92dvh] sm:max-h-[90vh] flex flex-col overflow-hidden relative my-auto">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 truncate mr-2">
            <span className="bg-[#002f34] text-white text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shrink-0">
              {getCategoryName(ad.category_slug, categoryName)}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-teal-600" />
              <span className="truncate">{ad.location}</span>
            </div>
            <span className="text-gray-300 hidden sm:inline">&bull;</span>
            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(ad.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#002f34] p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 pb-20 md:pb-6">
          {/* Left Column: Photos & Full Description (7 cols) */}
          <div className="md:col-span-7 space-y-5 sm:space-y-6">
            {/* Main Photo Container with Touch Swipe Gesture */}
            <div
              onClick={handleImageClick}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`w-full h-64 sm:h-96 bg-gray-100 rounded-2xl overflow-hidden relative flex items-center justify-center border border-gray-200 shadow-xs group select-none touch-pan-y ${
                currentImage ? "cursor-zoom-in" : ""
              }`}
            >
              {currentImage ? (
                <>
                  <div
                    className="w-full h-full flex items-center justify-center transition-transform"
                    style={{
                      transform: isDraggingTouch
                        ? `translateX(${touchOffset}px)`
                        : "translateX(0px)",
                      transitionDuration: isDraggingTouch ? "0ms" : "200ms"
                    }}
                  >
                    <img
                      key={selectedImageIdx}
                      src={currentImage}
                      alt={ad.title}
                      draggable={false}
                      className="w-full h-full object-contain bg-black/5 select-none transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>

                  {/* Multiple Photos Counter Badge */}
                  {images.length > 1 && (
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md pointer-events-none z-10">
                      <ImageIcon className="w-3.5 h-3.5 text-teal-300" />
                      <span>{selectedImageIdx + 1} / {images.length}</span>
                    </div>
                  )}

                  {/* Floating Zoom Badge */}
                  <div className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg opacity-90 group-hover:opacity-100 transition-all pointer-events-none z-10">
                    <ZoomIn className="w-3.5 h-3.5 text-teal-400" />
                    <span>{t("adDetails.zoomIn", "Powiększ")}</span>
                  </div>

                  {/* Navigation Arrows for Prev / Next */}
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevImage}
                        className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 active:bg-black/90 text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer z-10 touch-manipulation"
                        title="Poprzednie zdjęcie"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextImage}
                        className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 active:bg-black/90 text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer z-10 touch-manipulation"
                        title="Następne zdjęcie"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>

                      {/* Pagination Dots */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full pointer-events-none z-10">
                        {images.map((_, dotIdx) => (
                          <span
                            key={dotIdx}
                            className={`block rounded-full transition-all ${
                              selectedImageIdx === dotIdx
                                ? "w-2.5 h-1.5 bg-teal-400"
                                : "w-1.5 h-1.5 bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
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
              <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
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
            <div className="border-t border-gray-100 pt-4 sm:pt-5">
              <h3 className="text-xs sm:text-sm font-bold text-[#002f34] uppercase tracking-wider mb-2">
                {t("adsManager.descLabel")}
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line font-normal">
                {ad.description}
              </p>
            </div>
          </div>

          {/* Right Column: Title, Price, Seller Profile & Actions (5 cols) */}
          <div className="md:col-span-5 space-y-4 sm:space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Title & Price */}
              <div>
                <h1 className="text-xl sm:text-3xl font-extrabold text-[#002f34] tracking-tight leading-snug">
                  {ad.title}
                </h1>
                <div className="mt-2.5 sm:mt-3 flex flex-wrap items-baseline gap-2.5 sm:gap-3">
                  <span className={`text-2xl sm:text-3xl font-black ${ad.original_price && parseFloat(ad.original_price as string) > parseFloat(ad.price as string) ? "text-green-600" : "text-[#002f34]"}`}>
                    {isFree ? t("common.free") : `${ad.price} ${ad.currency}`}
                  </span>
                  {ad.original_price && parseFloat(ad.original_price as string) > parseFloat(ad.price as string) && (
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg font-bold text-gray-400 line-through">
                        {ad.original_price} {ad.currency}
                      </span>
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gradient-to-r from-rose-600 to-red-500 text-white rounded-lg text-[11px] sm:text-xs font-black shadow-xs tracking-wider">
                        -{Math.round(((parseFloat(ad.original_price as string) - parseFloat(ad.price as string)) / parseFloat(ad.original_price as string)) * 100)}% {t("adsManager.discountBadge")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Wishlist Button (Desktop) */}
              <button
                onClick={() => onToggleSave(ad.id)}
                className={`hidden md:flex w-full py-3 px-4 rounded-xl text-sm font-bold items-center justify-center gap-2 border transition-all cursor-pointer shadow-xs active:scale-95 ${
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
              <div className="p-4 sm:p-5 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-4">
                <h4 className="text-xs font-bold text-[#002f34] uppercase tracking-wider">
                  {t("adDetails.seller")}
                </h4>

                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-teal-600 text-white font-bold text-base flex items-center justify-center shadow-xs shrink-0">
                    {(ad.author_name || "S").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#002f34] text-sm sm:text-base leading-tight truncate">
                      {ad.author_name || t("adDetails.verifiedMember")}
                    </p>
                    <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
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
                      className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
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
                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-xs"
                      >
                        <Phone className="w-4 h-4" />
                        <span>{t("adDetails.callBtn")}: {ad.phone}</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => setShowPhone(true)}
                        className="w-full py-3 px-4 bg-[#002f34] hover:bg-[#003e45] active:bg-[#001e22] text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
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
                      className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-[#002f34] font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 border border-gray-300 shadow-xs active:scale-95"
                    >
                      <Mail className="w-4 h-4 text-teal-600" />
                      <span>{t("adDetails.emailBtn")}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Safety Tips Banner */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-teal-50/70 border border-teal-200/60 text-[11px] text-teal-900 leading-relaxed space-y-1">
                <span className="font-bold block text-teal-950">{t("adDetails.safetyTip")}</span>
                <p>&bull; {t("adDetails.safetyTip1")}</p>
                <p>&bull; {t("adDetails.safetyTip2")}</p>
                <p>&bull; {t("adDetails.safetyTip3")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Mobile Contact Action Bar (Android & Mobile browsers) */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2.5 flex items-center justify-between gap-2.5 z-30 shadow-lg pb-safe">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(ad.id)}
              className={`p-2.5 rounded-xl border transition-colors ${
                isSaved
                  ? "bg-rose-50 border-rose-200 text-rose-600"
                  : "bg-gray-50 border-gray-200 text-gray-500"
              }`}
              title={isSaved ? t("saved.remove") : t("common.save")}
            >
              <Heart className={`w-4 h-4 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
            {ad.phone && (
              <a
                href={`tel:${ad.phone}`}
                className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center"
                title={t("adDetails.callBtn")}
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
          </div>

          <div className="flex-1 flex items-center justify-end gap-2">
            {onStartChat && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartChat(ad.id);
                }}
                className="flex-1 py-2.5 px-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{t("adDetails.chatBtn")}</span>
              </button>
            )}
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
