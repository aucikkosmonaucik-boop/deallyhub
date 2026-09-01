"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Landmark,
  Hammer,
  Factory,
  Car,
  Home as HomeIcon,
  Briefcase,
  Armchair,
  Smartphone,
  Shirt,
  Tractor,
  Dog,
  Baby,
  Trophy,
  Music,
  Sparkles,
  Wrench,
  Bed,
  CalendarCheck,
  Gift,
  PackageCheck,
  BookOpen,
  Cog,
  Settings,
  Users,
  Compass,
  ChevronRight,
  ArrowRight,
  X,
  Search,
  Grid,
  Tag
} from "lucide-react";
import { CATEGORY_DETAILS } from "@/data/categoryData";

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Landmark,
  Hammer,
  Factory,
  Car,
  Home: HomeIcon,
  Briefcase,
  Armchair,
  Smartphone,
  Shirt,
  Tractor,
  Dog,
  Baby,
  Trophy,
  Music,
  Sparkles,
  Wrench,
  Bed,
  CalendarCheck,
  Gift,
  PackageCheck,
  BookOpen,
  Cog,
  Settings,
  Users,
  Compass
};

interface CategoryMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  activeCategory: string | null;
  onSelectCategory: (categorySlug: string | null, searchQuery?: string) => void;
  getCategoryName: (slug: string, defaultName?: string) => string;
  language: string;
  t: (key: string, fallback?: string) => string;
}

export default function CategoryMegaMenu({
  isOpen,
  onClose,
  categories,
  activeCategory,
  onSelectCategory,
  getCategoryName,
  language,
  t
}: CategoryMegaMenuProps) {
  // Default to activeCategory or first category in list
  const [hoveredSlug, setHoveredSlug] = useState<string>(
    activeCategory || (categories.length > 0 ? categories[0].slug : "electronics")
  );
  const [searchFilter, setSearchFilter] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync hovered category when menu opens or activeCategory changes
  useEffect(() => {
    if (isOpen) {
      if (activeCategory) {
        setHoveredSlug(activeCategory);
      } else if (categories.length > 0) {
        setHoveredSlug(categories[0].slug);
      }
    }
  }, [isOpen, activeCategory, categories]);

  // Handle ESC key and outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentCategory = categories.find((c) => c.slug === hoveredSlug) || categories[0];
  const currentDetails = hoveredSlug ? CATEGORY_DETAILS[hoveredSlug] : null;

  // Filtered list of categories if user searches in category search
  const filteredCategories = categories.filter((cat) => {
    if (!searchFilter.trim()) return true;
    const catName = getCategoryName(cat.slug, cat.name).toLowerCase();
    return catName.includes(searchFilter.trim().toLowerCase());
  });

  const getTranslated = (obj: Record<string, string> | undefined, fallback: string = ""): string => {
    if (!obj) return fallback;
    return obj[language] || obj.pl || obj.en || fallback;
  };

  const popularTags = currentDetails?.popularTags
    ? currentDetails.popularTags[language] || currentDetails.popularTags.pl || currentDetails.popularTags.en || []
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex flex-col justify-start items-center animate-in fade-in duration-200 p-2 sm:p-4 md:p-6 lg:pt-16">
      {/* Click outside backdrop layer */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Mega Menu Window */}
      <div
        ref={menuRef}
        className="relative z-10 w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] md:max-h-[82vh] animate-in zoom-in-98 slide-in-from-top-4 duration-200"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-r from-[#002f34] to-[#00424a] text-white border-b border-teal-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
              <Grid className="w-4 h-4 text-teal-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight flex items-center gap-2">
                <span>{t("nav.allCategories", "Kategorie")}</span>
                <span className="text-xs bg-teal-600/60 font-semibold px-2 py-0.5 rounded-full text-teal-100">
                  {categories.length}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick All Listings Link */}
            <button
              onClick={() => {
                onSelectCategory(null);
                onClose();
              }}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-teal-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <span>{t("feed.filterAll", "Wszystkie ogłoszenia")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              title={t("common.close", "Zamknij")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main 2-Column Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {/* Left Column: 25 Categories Sidebar (Allegro style) */}
          <div className="w-full md:w-72 lg:w-80 bg-gray-50 flex flex-col shrink-0 overflow-y-auto max-h-[35vh] md:max-h-full border-b md:border-b-0">
            {/* Category Search Filter on Desktop */}
            <div className="p-2.5 bg-white border-b border-gray-200 sticky top-0 z-10">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder={t("category.searchPlaceholder", "Filtruj kategorie...")}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-gray-100/90 rounded-lg border border-transparent focus:border-teal-500 focus:bg-white text-[#002f34] placeholder-gray-400 outline-none transition-all font-medium"
                />
                {searchFilter && (
                  <button
                    onClick={() => setSearchFilter("")}
                    className="absolute right-2.5 text-xs text-gray-400 hover:text-gray-600 p-0.5"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* List of DB Categories */}
            <div className="divide-y divide-gray-100/80 py-1">
              {filteredCategories.map((cat) => {
                const IconComponent = ICON_MAP[cat.icon] || Sparkles;
                const isHovered = hoveredSlug === cat.slug;
                const isCurrentActive = activeCategory === cat.slug;

                return (
                  <button
                    key={cat.id || cat.slug}
                    type="button"
                    onMouseEnter={() => setHoveredSlug(cat.slug)}
                    onClick={() => {
                      setHoveredSlug(cat.slug);
                      // On mobile/tablet or when double clicked, filter directly
                      if (window.innerWidth < 768) {
                        onSelectCategory(cat.slug);
                        onClose();
                      }
                    }}
                    className={`w-full text-left px-3.5 sm:px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-semibold transition-all cursor-pointer group ${
                      isHovered
                        ? "bg-white text-teal-900 shadow-xs border-l-4 border-teal-600 font-bold"
                        : "text-[#002f34] hover:bg-gray-100/80 hover:text-teal-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-150 ${
                          isHovered
                            ? "bg-teal-600 text-white scale-105 shadow-xs"
                            : isCurrentActive
                            ? "bg-teal-100 text-teal-800"
                            : "bg-gray-200/80 text-gray-600 group-hover:bg-teal-100 group-hover:text-teal-700"
                        }`}
                      >
                        <IconComponent className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <span className="truncate leading-tight">{getCategoryName(cat.slug, cat.name)}</span>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isHovered ? "text-teal-600 translate-x-0.5" : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                  </button>
                );
              })}

              {filteredCategories.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-400">
                  {t("category.noMatch", "Nie znaleziono kategorii")}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Subcategories, Groups & Popular Shortcuts */}
          <div className="flex-1 bg-white flex flex-col overflow-y-auto p-4 sm:p-6 min-h-[300px]">
            {currentCategory && (
              <>
                {/* Active Category Header Banner with "View all" CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-gray-100 gap-3">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const IconComp = ICON_MAP[currentCategory.icon] || Sparkles;
                      return (
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/80 flex items-center justify-center shrink-0">
                          <IconComp className="w-5 h-5 stroke-[2.2]" />
                        </div>
                      );
                    })()}
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-[#002f34] tracking-tight">
                        {getCategoryName(currentCategory.slug, currentCategory.name)}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {t("category.exploreSubtitle", "Przeglądaj podkategorie i oferty")}
                      </p>
                    </div>
                  </div>

                  {/* Primary Button to Filter by this Entire Category */}
                  <button
                    onClick={() => {
                      onSelectCategory(currentCategory.slug);
                      onClose();
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-[#002f34] hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
                  >
                    <span>
                      {t("category.viewAllIn", "Wszystkie w")} {getCategoryName(currentCategory.slug, currentCategory.name)}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subcategory Groups Grid (Allegro 3-4 Columns Style) */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-2">
                  {currentDetails && currentDetails.groups && currentDetails.groups.length > 0 ? (
                    currentDetails.groups.map((group, gIdx) => (
                      <div key={gIdx} className="space-y-2">
                        {/* Subcategory Group Title (Bold Black Header) */}
                        <h4 className="text-xs font-black text-[#002f34] uppercase tracking-wider border-b border-gray-100 pb-1.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                          <span>{getTranslated(group.title, "Grupa")}</span>
                        </h4>

                        {/* List of subcategory links */}
                        <ul className="space-y-1 text-xs">
                          {group.items.map((item, iIdx) => {
                            const itemName = getTranslated(item.name, "Pozycja");
                            return (
                              <li key={iIdx}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onSelectCategory(currentCategory.slug, item.query || itemName);
                                    onClose();
                                  }}
                                  className="w-full text-left py-1 text-gray-600 hover:text-teal-700 hover:font-semibold hover:translate-x-1 transition-all inline-flex items-center gap-1.5 cursor-pointer group"
                                >
                                  <span className="text-gray-300 group-hover:text-teal-600 transition-colors">›</span>
                                  <span className="truncate">{itemName}</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))
                  ) : (
                    /* Fallback when category has direct items */
                    <div className="col-span-full py-8 text-center bg-gray-50 rounded-2xl border border-gray-100 p-6">
                      <p className="text-sm font-bold text-[#002f34] mb-2">
                        {getCategoryName(currentCategory.slug, currentCategory.name)}
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        {t("category.noSpecificSub", "Przeglądaj wszystkie ogłoszenia w tej kategorii z bazy danych.")}
                      </p>
                      <button
                        onClick={() => {
                          onSelectCategory(currentCategory.slug);
                          onClose();
                        }}
                        className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        {t("category.showAdsBtn", "Pokaż ogłoszenia")} &rarr;
                      </button>
                    </div>
                  )}
                </div>

                {/* Popular Tags / Brands Footer inside Category Panel */}
                {popularTags.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
                        <Tag className="w-3 h-3 text-teal-600" />
                        <span>{t("category.popularTags", "Popularne:")}</span>
                      </span>
                      {popularTags.map((tag, tIdx) => (
                        <button
                          key={tIdx}
                          type="button"
                          onClick={() => {
                            onSelectCategory(currentCategory.slug, tag);
                            onClose();
                          }}
                          className="text-xs font-semibold bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-gray-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer active:scale-95 border border-gray-200/60"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom Footer Bar with Quick Actions */}
        <div className="px-4 sm:px-6 py-2.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <span className="hidden sm:inline">
            {t("category.footerHint", "Wybierz kategorię lub kliknij podkategorię, aby szybko przefiltrować oferty.")}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => {
                onSelectCategory(null);
                onClose();
              }}
              className="text-teal-700 font-bold hover:underline cursor-pointer px-2 py-1"
            >
              {t("feed.filterAll", "Wszystkie kategorie (Wyczyść filtr)")}
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-[#002f34] font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
            >
              {t("common.close", "Zamknij")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
