"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  MapPin,
  Search,
  Check,
  X,
  ChevronRight,
  Globe,
  Building2,
  Map,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  COUNTRIES_DATA,
  POPULAR_POLISH_CITIES,
  searchLocations,
  LocationMatch,
  CountryInfo,
  RegionInfo,
} from "@/data/locations";

interface LocationPickerProps {
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
  isOpen: boolean;
  className?: string;
  mode?: "dropdown" | "modal";
}

export default function LocationPicker({
  value,
  onChange,
  onClose,
  isOpen,
  className = "",
  mode = "dropdown",
}: LocationPickerProps) {
  const { t } = useLanguage();
  const pickerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("PL");
  const [selectedRegionId, setSelectedRegionId] = useState<string>("mazowieckie");
  const [customCityInput, setCustomCityInput] = useState("");
  const [activeMobileTab, setActiveMobileTab] = useState<"country" | "region" | "city">("region");

  // Selected country and region objects
  const currentCountry = useMemo<CountryInfo>(() => {
    return (
      COUNTRIES_DATA.find((c) => c.code === selectedCountryCode) ||
      COUNTRIES_DATA[0]
    );
  }, [selectedCountryCode]);

  const currentRegion = useMemo<RegionInfo>(() => {
    return (
      currentCountry.regions.find((r) => r.id === selectedRegionId) ||
      currentCountry.regions[0] || {
        id: "all",
        name: currentCountry.nativeName,
        cities: [],
      }
    );
  }, [currentCountry, selectedRegionId]);

  // Live search autocompletion
  const searchResults = useMemo<LocationMatch[]>(() => {
    if (!searchQuery.trim()) return [];
    return searchLocations(searchQuery, 12);
  }, [searchQuery]);

  // Update selection based on incoming value if matched
  useEffect(() => {
    if (!value) return;
    const clean = value.trim();
    if (!clean) return;

    // Check if value matches city, region or country
    for (const c of COUNTRIES_DATA) {
      if (clean.toLowerCase() === c.nativeName.toLowerCase() || clean.toLowerCase() === c.name.toLowerCase()) {
        setSelectedCountryCode(c.code);
        return;
      }
      for (const r of c.regions) {
        if (clean.includes(r.name)) {
          setSelectedCountryCode(c.code);
          setSelectedRegionId(r.id);
          return;
        }
      }
    }
  }, [value]);

  // Handler for selecting entire country
  const handleSelectEntireCountry = (country?: CountryInfo) => {
    const targetCountry = country || currentCountry;
    const formatted = targetCountry.code === "PL" ? t("hero.locationPlaceholder") : targetCountry.nativeName;
    onChange(formatted);
    if (onClose) onClose();
  };

  // Handler for selecting entire region
  const handleSelectEntireRegion = (region: RegionInfo) => {
    const formatted = `${region.name}, ${currentCountry.nativeName}`;
    onChange(formatted);
    if (onClose) onClose();
  };

  // Handler for selecting specific city
  const handleSelectCity = (cityName: string, regionName?: string) => {
    const reg = regionName || currentRegion.name;
    const formatted = `${cityName}, ${reg}`;
    onChange(formatted);
    if (onClose) onClose();
  };

  // Handler for custom city entry
  const handleCustomCitySubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customCityInput.trim()) return;
    const formatted = `${customCityInput.trim()}, ${currentRegion.name}`;
    onChange(formatted);
    setCustomCityInput("");
    if (onClose) onClose();
  };

  // Handler for search match click
  const handleSearchMatchClick = (match: LocationMatch) => {
    onChange(match.formattedValue);
    setSearchQuery("");
    if (onClose) onClose();
  };

  // Reset to default
  const handleClear = () => {
    onChange("");
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      className={`bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-150 ${
        mode === "dropdown"
          ? "absolute top-full left-0 right-0 mt-2 max-w-full"
          : "relative w-full max-h-[85vh]"
      } ${className}`}
      style={{ minHeight: "440px" }}
    >
      {/* 1. Header & Live Search Bar */}
      <div className="p-3 sm:p-4 bg-gray-50/95 border-b border-gray-200">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 text-sm font-bold text-[#002f34]">
            <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{t("location.title")}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectEntireCountry()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors border border-teal-200 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t("location.allCountry")}</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/70 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("location.searchPlaceholder")}
            className="w-full pl-9 pr-8 py-2 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-[#002f34] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 absolute right-2.5 top-1/2 -translate-y-1/2 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. Search Autocomplete Results View (When typing) */}
      {searchQuery.trim().length > 0 ? (
        <div className="flex-1 overflow-y-auto max-h-[380px] p-2 divide-y divide-gray-100">
          {searchResults.length > 0 ? (
            searchResults.map((match, idx) => (
              <button
                key={`${match.displayName}-${idx}`}
                type="button"
                onClick={() => handleSearchMatchClick(match)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-teal-50/60 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {match.type === "city" && <Building2 className="w-4 h-4 text-teal-600 shrink-0" />}
                  {match.type === "region" && <Map className="w-4 h-4 text-amber-500 shrink-0" />}
                  {match.type === "country" && <Globe className="w-4 h-4 text-blue-500 shrink-0" />}
                  <span className="text-sm font-semibold text-[#002f34] group-hover:text-teal-700 truncate">
                    {match.displayName}
                  </span>
                </div>
                <span className="text-xs text-gray-400 font-medium shrink-0 ml-2">
                  {match.type === "city" && t("location.city")}
                  {match.type === "region" && t("location.region")}
                  {match.type === "country" && t("location.country")}
                </span>
              </button>
            ))
          ) : (
            <div className="py-8 text-center px-4">
              <p className="text-sm font-medium text-gray-600">
                Brak wyników dla: <strong className="text-[#002f34]">"{searchQuery}"</strong>
              </p>
              <button
                type="button"
                onClick={() => {
                  onChange(searchQuery.trim());
                  setSearchQuery("");
                  if (onClose) onClose();
                }}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#002f34] hover:bg-[#003e45] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Użyj wpisanej wartości "{searchQuery.trim()}"</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* 3. Standard Hierarchical View (Country -> Region -> City) */
        <div className="flex-1 flex flex-col">
          {/* Quick Popular Polish Cities Chips */}
          <div className="px-3 sm:px-4 py-2.5 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              {t("location.popularCities")}:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {POPULAR_POLISH_CITIES.map(({ city, region }) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleSelectCity(city, region)}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white hover:bg-teal-50 text-gray-700 hover:text-teal-700 border border-gray-200 hover:border-teal-300 transition-all cursor-pointer shrink-0 shadow-2xs"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Breadcrumb / Level Indicator for Mobile & Tabs */}
          <div className="md:hidden flex items-center justify-between border-b border-gray-200 px-3 py-2 bg-white">
            <div className="flex items-center gap-1 text-xs font-bold text-gray-600">
              <button
                type="button"
                onClick={() => setActiveMobileTab("country")}
                className={`px-2 py-1 rounded-md transition-colors ${
                  activeMobileTab === "country"
                    ? "bg-[#002f34] text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {currentCountry.flag} {currentCountry.nativeName}
              </button>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <button
                type="button"
                onClick={() => setActiveMobileTab("region")}
                className={`px-2 py-1 rounded-md transition-colors ${
                  activeMobileTab === "region"
                    ? "bg-[#002f34] text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {currentRegion.name}
              </button>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <button
                type="button"
                onClick={() => setActiveMobileTab("city")}
                className={`px-2 py-1 rounded-md transition-colors ${
                  activeMobileTab === "city"
                    ? "bg-[#002f34] text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {t("location.city")}
              </button>
            </div>
          </div>

          {/* Desktop 3-Column Rectangular View & Mobile Single-Tab View */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-[300px] max-h-[340px] divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {/* Column 1: Country (Kraj) */}
            <div
              className={`md:col-span-3 overflow-y-auto p-2 bg-gray-50/40 ${
                activeMobileTab === "country" ? "block" : "hidden md:block"
              }`}
            >
              <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Globe className="w-3 h-3" />
                <span>{t("location.country")}</span>
              </div>
              <div className="space-y-0.5 mt-1">
                {COUNTRIES_DATA.map((c) => {
                  const isSelected = c.code === selectedCountryCode;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setSelectedCountryCode(c.code);
                        if (c.regions.length > 0) {
                          setSelectedRegionId(c.regions[0].id);
                        }
                        setActiveMobileTab("region");
                      }}
                      className={`w-full px-2.5 py-2 rounded-xl text-left text-xs sm:text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#002f34] text-white shadow-xs"
                          : "text-[#002f34] hover:bg-gray-100/80"
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span className="text-base leading-none">{c.flag}</span>
                        <span className="truncate">{c.nativeName}</span>
                      </span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected ? "text-white" : "text-gray-400"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Region / Voivodeship (Województwo) */}
            <div
              className={`md:col-span-4 overflow-y-auto p-2 bg-white ${
                activeMobileTab === "region" ? "block" : "hidden md:block"
              }`}
            >
              <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Map className="w-3 h-3 text-amber-500" />
                  <span>{t("location.region")}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-normal">
                  ({currentCountry.regions.length})
                </span>
              </div>

              {/* Entire Country Option */}
              <button
                type="button"
                onClick={() => handleSelectEntireCountry()}
                className="w-full mt-1 mb-1.5 px-2.5 py-2 rounded-xl text-left text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-teal-600" />
                  <span>{t("location.allCountry")} ({currentCountry.nativeName})</span>
                </span>
                <Check className="w-3.5 h-3.5 text-teal-600" />
              </button>

              {/* Regions List */}
              <div className="space-y-0.5">
                {currentCountry.regions.map((r) => {
                  const isSelected = r.id === selectedRegionId;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setSelectedRegionId(r.id);
                        setActiveMobileTab("city");
                      }}
                      className={`w-full px-2.5 py-2 rounded-xl text-left text-xs sm:text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-teal-50 text-teal-900 font-bold border border-teal-300"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="truncate">{r.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-gray-400 font-normal">
                          {r.cities.length}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Column 3: City (Miejscowość / Miasto) */}
            <div
              className={`md:col-span-5 overflow-y-auto p-2 bg-gray-50/30 flex flex-col justify-between ${
                activeMobileTab === "city" ? "block" : "hidden md:block"
              }`}
            >
              <div>
                <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3 h-3 text-teal-600" />
                    <span>{t("location.city")}</span>
                  </div>
                  <span className="text-[10px] text-teal-700 font-semibold truncate max-w-[120px]">
                    {currentRegion.name}
                  </span>
                </div>

                {/* Option: Whole Region */}
                <button
                  type="button"
                  onClick={() => handleSelectEntireRegion(currentRegion)}
                  className="w-full mt-1 mb-2 px-2.5 py-2 rounded-xl text-left text-xs font-bold text-[#002f34] bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Map className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">
                      {t("location.allRegion")} ({currentRegion.name})
                    </span>
                  </span>
                  <Check className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                </button>

                {/* Cities Grid/List */}
                <div className="grid grid-cols-2 gap-1 max-h-[190px] overflow-y-auto pr-1">
                  {currentRegion.cities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleSelectCity(city, currentRegion.name)}
                      className="px-2.5 py-1.5 rounded-lg text-left text-xs font-medium text-gray-700 hover:text-teal-900 hover:bg-teal-50/80 border border-transparent hover:border-teal-200 transition-colors cursor-pointer truncate"
                      title={city}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom City Entry Field */}
              <form
                onSubmit={handleCustomCitySubmit}
                className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={customCityInput}
                  onChange={(e) => setCustomCityInput(e.target.value)}
                  placeholder={t("location.customCityPlaceholder")}
                  className="flex-1 px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-[#002f34] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  disabled={!customCityInput.trim()}
                  className="px-3 py-1.5 bg-[#002f34] hover:bg-[#003e45] disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  {t("location.customCityAdd")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 4. Footer Bar */}
      <div className="px-3 sm:px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-gray-600 truncate max-w-[60%]">
          <span className="font-semibold text-gray-400">{t("location.selected")}:</span>
          <span className="font-bold text-[#002f34] truncate">
            {value ? value : t("location.allCountry")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1 text-gray-500 hover:text-gray-800 font-semibold cursor-pointer transition-colors"
            >
              {t("location.clear")}
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-[#002f34] hover:bg-[#003e45] text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              {t("location.apply")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
