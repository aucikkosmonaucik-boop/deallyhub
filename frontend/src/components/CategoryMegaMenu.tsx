"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  ArrowLeft,
  X,
  Search,
  Grid,
  Tag,
  Check
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

function CategoryMegaMenuComponent({
  isOpen,
  onClose,
  categories,
  activeCategory,
  onSelectCategory,
  getCategoryName,
  language,
  t
}: CategoryMegaMenuProps) {
  // Selected category slug
  const [selectedSlug, setSelectedSlug] = useState<string>(
    activeCategory || (categories.length > 0 ? categories[0].slug : "electronics")
  );
  const [searchFilter, setSearchFilter] = useState("");
  
  // Mobile drilldown view: "categories" (master list) or "subcategories" (details)
  const [mobileView, setMobileView] = useState<"categories" | "subcategories">("categories");
  const menuRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // Sync selected category when menu opens or activeCategory changes
  useEffect(() => {
    if (isOpen) {
      if (activeCategory) {
        setSelectedSlug(activeCategory);
        setMobileView("subcategories");
      } else if (categories.length > 0) {
        setSelectedSlug(categories[0].slug);
        setMobileView("categories");
      }
      setSearchFilter("");
    }
  }, [isOpen, activeCategory, categories]);

  // Lock body scroll smoothly while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Handle ESC key to close
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

  const currentCategory = useMemo(() => {
    return categories.find((c) => c.slug === selectedSlug) || categories[0];
  }, [categories, selectedSlug]);

  const currentDetails = useMemo(() => {
    return selectedSlug ? CATEGORY_DETAILS[selectedSlug] : null;
  }, [selectedSlug]);

  // Filtered list of categories based on category search input
  const filteredCategories = useMemo(() => {
    const query = searchFilter.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((cat) => {
      const catName = getCategoryName(cat.slug, cat.name).toLowerCase();
      return catName.includes(query);
    });
  }, [categories, searchFilter, getCategoryName]);

  const getTranslated = useCallback(
    (obj: Record<string, string> | undefined, fallback: string = ""): string => {
      if (!obj) return fallback;
      return obj[language] || obj.pl || obj.en || fallback;
    },
    [language]
  );

  const popularTags = useMemo(() => {
    if (!currentDetails?.popularTags) return [];
    return (
      currentDetails.popularTags[language] ||
      currentDetails.popularTags.pl ||
      currentDetails.popularTags.en ||
      []
    );
  }, [currentDetails, language]);

  // When switching category on desktop, scroll right subcategory panel back to top smoothly
  const handleCategoryHoverOrClick = (slug: string) => {
    setSelectedSlug(slug);
    if (rightPanelRef.current) {
      rightPanelRef.current.scrollTop = 0;
    }
  };

  if (!isOpen) return null;

  const IconHeaderComp = currentCategory ? ICON_MAP[currentCategory.icon] || Sparkles : Sparkles;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex flex-col justify-start md:justify-center items-center animate-in fade-in duration-150 p-0 sm:p-3 md:p-6"
      style={{
        WebkitOverflowScrolling: "touch",
        overscrollBehavior: "contain"
      }}
    >
      {/* Click outside backdrop layer */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mega Menu Modal Container */}
      <div
        ref={menuRef}
        className="relative z-10 w-full max-w-6xl bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-gray-200 overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[90vh] md:max-h-[85vh] animate-in zoom-in-[0.98] slide-in-from-bottom-2 sm:slide-in-from-top-2 duration-200"
        style={{
          transform: "translate3d(0, 0, 0)",
          willChange: "transform, opacity"
        }}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-[#002f34] via-[#00383e] to-[#00424a] text-white border-b border-teal-900 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* On mobile, show back button when viewing subcategories */}
            <div className="md:hidden flex items-center">
              {mobileView === "subcategories" ? (
                <button
                  type="button"
                  onClick={() => setMobileView("categories")}
                  className="p-1.5 -ml-1 mr-1 rounded-lg text-teal-200 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors flex items-center gap-1 font-bold text-xs cursor-pointer"
                  aria-label="Back to all categories"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t("common.back", "Wróć")}</span>
                </button>
              ) : (
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center mr-1">
                  <Grid className="w-3.5 h-3.5 text-teal-300" />
                </div>
              )}
            </div>

            <div className="hidden md:flex w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 items-center justify-center shrink-0">
              <Grid className="w-4 h-4 text-teal-300" />
            </div>

            <h2 className="text-sm sm:text-base md:text-lg font-extrabold tracking-tight truncate flex items-center gap-2">
              <span>{t("nav.allCategories", "Kategorie")}</span>
              <span className="text-[11px] sm:text-xs bg-teal-600/70 font-semibold px-2 py-0.5 rounded-full text-teal-100 shrink-0">
                {categories.length}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick All Listings Link */}
            <button
              type="button"
              onClick={() => {
                onSelectCategory(null);
                onClose();
              }}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-teal-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95"
            >
              <span>{t("feed.filterAll", "Wszystkie oferty")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg text-teal-200 hover:text-white hover:bg-white/15 active:bg-white/25 transition-colors cursor-pointer"
              title={t("common.close", "Zamknij")}
              aria-label="Close categories menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body: Desktop 2-Column Split View OR Mobile Drilldown */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-gray-200 min-h-0 bg-white">
          
          {/* ========================================================
              LEFT COLUMN: Categories List
              (Shown on desktop always; on mobile only when mobileView === "categories")
             ======================================================== */}
          <div
            className={`w-full md:w-72 lg:w-80 bg-gray-50 flex-col shrink-0 overflow-y-auto ${
              mobileView === "categories" ? "flex flex-1 md:flex-initial" : "hidden md:flex"
            }`}
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {/* Search Filter Header */}
            <div className="p-2.5 sm:p-3 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-2xs">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 pointer-events-none stroke-[2.5]" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder={t("category.searchPlaceholder", "Filtruj kategorie...")}
                  className="w-full text-xs sm:text-sm pl-9 pr-7 py-2 bg-gray-100/90 rounded-xl border border-gray-200 focus:border-teal-600 focus:bg-white text-gray-900 placeholder-gray-500 outline-none transition-all font-semibold"
                />
                {searchFilter && (
                  <button
                    type="button"
                    onClick={() => setSearchFilter("")}
                    className="absolute right-2 text-xs font-bold text-gray-500 hover:text-gray-900 p-1 cursor-pointer"
                    aria-label="Clear filter"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Quick "All Categories / Clear filter" Row on Mobile */}
            <div className="md:hidden px-3 pt-2 pb-1">
              <button
                type="button"
                onClick={() => {
                  onSelectCategory(null);
                  onClose();
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-between border ${
                  !activeCategory
                    ? "bg-teal-700 text-white border-teal-800 shadow-xs"
                    : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Grid className="w-4 h-4 stroke-[2.5]" />
                  <span>{t("feed.filterAll", "Wszystkie kategorie (Wyczyść filtr)")}</span>
                </div>
                {!activeCategory && <Check className="w-4 h-4 stroke-[3]" />}
              </button>
            </div>

            {/* List of 25 DB Categories */}
            <div className="divide-y divide-gray-100 py-1 flex-1">
              {filteredCategories.map((cat) => {
                const IconComponent = ICON_MAP[cat.icon] || Sparkles;
                const isSelected = selectedSlug === cat.slug;
                const isCurrentActive = activeCategory === cat.slug;

                return (
                  <button
                    key={cat.id || cat.slug}
                    type="button"
                    onMouseEnter={() => handleCategoryHoverOrClick(cat.slug)}
                    onClick={() => {
                      handleCategoryHoverOrClick(cat.slug);
                      // On mobile (< 768px), navigate into subcategories screen
                      if (window.innerWidth < 768) {
                        setMobileView("subcategories");
                      }
                    }}
                    className={`w-full text-left px-3.5 sm:px-4 py-3 sm:py-2.5 flex items-center justify-between text-[13px] sm:text-sm transition-colors cursor-pointer group active:bg-gray-200/80 ${
                      isSelected
                        ? "bg-white text-teal-950 shadow-xs md:border-l-4 md:border-teal-600 font-extrabold"
                        : "text-gray-900 font-bold hover:bg-gray-100/90 hover:text-teal-900"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div
                        className={`w-8 h-8 sm:w-7 sm:h-7 rounded-xl sm:rounded-lg flex items-center justify-center shrink-0 transition-transform duration-150 ${
                          isSelected
                            ? "bg-teal-600 text-white scale-105 shadow-xs"
                            : isCurrentActive
                            ? "bg-teal-100 text-teal-900 font-black"
                            : "bg-gray-200 text-gray-700 group-hover:bg-teal-100 group-hover:text-teal-800"
                        }`}
                      >
                        <IconComponent className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <span className="truncate leading-tight tracking-tight">{getCategoryName(cat.slug, cat.name)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isCurrentActive && (
                        <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                      )}
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-transform stroke-[2.5] ${
                          isSelected ? "text-teal-600 translate-x-0.5" : "text-gray-400 group-hover:text-gray-700"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}

              {filteredCategories.length === 0 && (
                <div className="p-6 text-center text-xs text-gray-500">
                  <p className="font-bold text-gray-700 mb-1 text-sm">
                    {t("category.noMatch", "Nie znaleziono kategorii")}
                  </p>
                  <p>{t("hero.searchPlaceholder", "Spróbuj wpisać inną frazę")}</p>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================
              RIGHT COLUMN: Subcategories, Groups & Popular Tags
              (Shown on desktop always; on mobile only when mobileView === "subcategories")
             ======================================================== */}
          <div
            ref={rightPanelRef}
            className={`flex-1 bg-white flex-col overflow-y-auto p-4 sm:p-6 ${
              mobileView === "subcategories" ? "flex flex-1" : "hidden md:flex"
            }`}
            style={{
              WebkitOverflowScrolling: "touch",
              scrollBehavior: "smooth"
            }}
          >
            {currentCategory && (
              <>
                {/* Active Category Header Banner with "View all in category" CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-gray-200 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center shrink-0 shadow-2xs">
                      <IconHeaderComp className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-xl font-black text-gray-950 tracking-tight truncate">
                        {getCategoryName(currentCategory.slug, currentCategory.name)}
                      </h3>
                      <p className="text-xs font-medium text-gray-500 truncate">
                        {t("category.exploreSubtitle", "Przeglądaj podkategorie i oferty")}
                      </p>
                    </div>
                  </div>

                  {/* Primary CTA Button to Filter by Entire Category */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCategory(currentCategory.slug);
                      onClose();
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-[#002f34] hover:bg-teal-700 active:bg-[#001e22] text-white px-4 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
                  >
                    <span>
                      {t("category.viewAllIn", "Wszystkie w")} {getCategoryName(currentCategory.slug, currentCategory.name)}
                    </span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* Subcategory Groups Grid (Allegro 3-4 Columns Layout) */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 py-2">
                  {currentDetails && currentDetails.groups && currentDetails.groups.length > 0 ? (
                    currentDetails.groups.map((group, gIdx) => (
                      <div key={gIdx} className="space-y-2 bg-gray-50/70 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-gray-200">
                        {/* Subcategory Group Header */}
                        <h4 className="text-[12px] sm:text-[13px] font-black text-gray-950 uppercase tracking-wide border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                          <span className="truncate">{getTranslated(group.title, "Grupa")}</span>
                        </h4>

                        {/* List of subcategories in group */}
                        <ul className="space-y-1 text-[13px]">
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
                                  className="w-full text-left py-1.5 sm:py-1 px-1 rounded-lg text-gray-800 hover:text-teal-900 hover:bg-teal-50/80 sm:hover:bg-teal-50/50 font-semibold hover:font-bold hover:translate-x-0.5 transition-all inline-flex items-center gap-1.5 cursor-pointer group active:scale-[0.99]"
                                >
                                  <span className="text-teal-600 font-bold group-hover:text-teal-800 transition-colors">›</span>
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
                    <div className="col-span-full py-8 text-center bg-gray-50 rounded-2xl border border-gray-200 p-6">
                      <p className="text-base font-extrabold text-gray-900 mb-2">
                        {getCategoryName(currentCategory.slug, currentCategory.name)}
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-gray-600 mb-4">
                        {t("category.noSpecificSub", "Przeglądaj wszystkie ogłoszenia w tej kategorii z bazy danych.")}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCategory(currentCategory.slug);
                          onClose();
                        }}
                        className="bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-extrabold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        {t("category.showAdsBtn", "Pokaż ogłoszenia")} &rarr;
                      </button>
                    </div>
                  )}
                </div>

                {/* Popular Tags / Brands Footer inside Category Panel */}
                {popularTags.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
                        <Tag className="w-3.5 h-3.5 text-teal-600 stroke-[2.5]" />
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
                          className="text-xs font-bold bg-gray-100 hover:bg-teal-50 hover:text-teal-900 text-gray-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95 border border-gray-300"
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
        <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <span className="hidden md:inline">
            {t("category.footerHint", "Wybierz kategorię lub kliknij podkategorię, aby szybko przefiltrować oferty.")}
          </span>
          <div className="flex items-center justify-between sm:justify-end w-full md:w-auto gap-2">
            <button
              type="button"
              onClick={() => {
                onSelectCategory(null);
                onClose();
              }}
              className="text-teal-700 font-bold hover:underline cursor-pointer px-2 py-1 text-xs"
            >
              {t("feed.filterAll", "Wszystkie kategorie (Wyczyść filtr)")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-[#002f34] font-bold px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer active:scale-95 text-xs"
            >
              {t("common.close", "Zamknij")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(CategoryMegaMenuComponent);

