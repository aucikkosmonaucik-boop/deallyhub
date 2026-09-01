"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  MapPin,
  Search,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Building2,
  Map,
  Check,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  COUNTRIES_DATA,
  searchLocations,
  LocationMatch,
  CountryInfo,
  RegionInfo,
  normalizeText,
} from "@/data/locations";

function CountryFlag({ code, className = "w-4 h-3" }: { code: string; className?: string }) {
  switch (code) {
    case "PL":
      return (
        <svg viewBox="0 0 16 11" className={`rounded-[2px] shadow-2xs shrink-0 overflow-hidden ${className}`}>
          <rect width="16" height="5.5" fill="#FFFFFF" />
          <rect y="5.5" width="16" height="5.5" fill="#DC143C" />
        </svg>
      );
    case "DE":
      return (
        <svg viewBox="0 0 16 11" className={`rounded-[2px] shadow-2xs shrink-0 overflow-hidden ${className}`}>
          <rect width="16" height="3.67" fill="#000000" />
          <rect y="3.67" width="16" height="3.67" fill="#DD0000" />
          <rect y="7.34" width="16" height="3.67" fill="#FFCE00" />
        </svg>
      );
    case "FR":
      return (
        <svg viewBox="0 0 16 11" className={`rounded-[2px] shadow-2xs shrink-0 overflow-hidden ${className}`}>
          <rect width="5.33" height="11" fill="#002395" />
          <rect x="5.33" width="5.33" height="11" fill="#FFFFFF" />
          <rect x="10.66" width="5.34" height="11" fill="#ED2939" />
        </svg>
      );
    case "ES":
      return (
        <svg viewBox="0 0 16 11" className={`rounded-[2px] shadow-2xs shrink-0 overflow-hidden ${className}`}>
          <rect width="16" height="2.75" fill="#AA151B" />
          <rect y="2.75" width="16" height="5.5" fill="#F1BF00" />
          <rect y="8.25" width="16" height="2.75" fill="#AA151B" />
        </svg>
      );
    case "IT":
      return (
        <svg viewBox="0 0 16 11" className={`rounded-[2px] shadow-2xs shrink-0 overflow-hidden ${className}`}>
          <rect width="5.33" height="11" fill="#009246" />
          <rect x="5.33" width="5.33" height="11" fill="#FFFFFF" />
          <rect x="10.66" width="5.34" height="11" fill="#CE2B37" />
        </svg>
      );
    case "GB":
      return (
        <svg viewBox="0 0 16 11" className={`rounded-[2px] shadow-2xs shrink-0 overflow-hidden ${className}`}>
          <rect width="16" height="11" fill="#012169" />
          <path d="M0,0 L16,11 M16,0 L0,11" stroke="#FFFFFF" strokeWidth="2.5" />
          <path d="M0,0 L16,11 M16,0 L0,11" stroke="#C8102E" strokeWidth="1.2" />
          <path d="M8,0 V11 M0,5.5 H16" stroke="#FFFFFF" strokeWidth="3.5" />
          <path d="M8,0 V11 M0,5.5 H16" stroke="#C8102E" strokeWidth="2" />
        </svg>
      );
    case "GR":
      return (
        <svg viewBox="0 0 16 11" className={`rounded-[2px] shadow-2xs shrink-0 overflow-hidden ${className}`}>
          <rect width="16" height="11" fill="#0D5EAF" />
          <rect y="1.22" width="16" height="1.22" fill="#FFFFFF" />
          <rect y="3.66" width="16" height="1.22" fill="#FFFFFF" />
          <rect y="6.1" width="16" height="1.22" fill="#FFFFFF" />
          <rect y="8.54" width="16" height="1.22" fill="#FFFFFF" />
          <rect width="6" height="6" fill="#0D5EAF" />
          <rect x="2.4" width="1.2" height="6" fill="#FFFFFF" />
          <rect y="2.4" width="6" height="1.2" fill="#FFFFFF" />
        </svg>
      );
    default:
      return <span className="text-xs">🌍</span>;
  }
}

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

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("PL");
  const [selectedRegion, setSelectedRegion] = useState<RegionInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [customCityInput, setCustomCityInput] = useState("");

  // Selected Country
  const currentCountry = useMemo<CountryInfo>(() => {
    return (
      COUNTRIES_DATA.find((c) => c.code === selectedCountryCode) ||
      COUNTRIES_DATA[0]
    );
  }, [selectedCountryCode]);

  // If value is passed, sync initial country / region
  useEffect(() => {
    if (!value) return;
    const clean = value.trim();
    if (!clean) return;

    for (const c of COUNTRIES_DATA) {
      if (
        clean.toLowerCase() === c.nativeName.toLowerCase() ||
        clean.toLowerCase() === c.name.toLowerCase()
      ) {
        setSelectedCountryCode(c.code);
        setSelectedRegion(null);
        return;
      }
      for (const r of c.regions) {
        if (clean.includes(r.name)) {
          setSelectedCountryCode(c.code);
          setSelectedRegion(r);
          return;
        }
      }
    }
  }, [value]);

  // Live search autocompletion
  const searchResults = useMemo<LocationMatch[]>(() => {
    if (!searchQuery.trim()) return [];
    return searchLocations(searchQuery, 10);
  }, [searchQuery]);

  // Filtered cities when inside a region
  const filteredCities = useMemo<string[]>(() => {
    if (!selectedRegion) return [];
    if (!citySearchQuery.trim()) return selectedRegion.cities;
    const norm = normalizeText(citySearchQuery);
    return selectedRegion.cities.filter((city) =>
      normalizeText(city).includes(norm)
    );
  }, [selectedRegion, citySearchQuery]);

  // Handlers
  const handleSelectEntireCountry = (country?: CountryInfo) => {
    const c = country || currentCountry;
    const formatted = c.code === "PL" ? "Cała Polska" : `${t("hero.entireCountry")} (${c.nativeName})`;
    onChange(formatted);
    if (onClose) onClose();
  };

  const handleSelectEntireRegion = (region: RegionInfo) => {
    const formatted = `${region.name}, ${currentCountry.nativeName}`;
    onChange(formatted);
    if (onClose) onClose();
  };

  const handleSelectCity = (cityName: string) => {
    const reg = selectedRegion ? selectedRegion.name : currentCountry.nativeName;
    const formatted = `${cityName}, ${reg}`;
    onChange(formatted);
    if (onClose) onClose();
  };

  const handleCustomCitySubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customCityInput.trim()) return;
    const reg = selectedRegion ? selectedRegion.name : currentCountry.nativeName;
    const formatted = `${customCityInput.trim()}, ${reg}`;
    onChange(formatted);
    setCustomCityInput("");
    if (onClose) onClose();
  };

  const handleSearchMatchClick = (match: LocationMatch) => {
    onChange(match.formattedValue);
    setSearchQuery("");
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      className={`bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-150 ${
        mode === "dropdown"
          ? "absolute top-full left-0 right-0 mt-1.5 w-full sm:min-w-[360px] md:min-w-[400px] max-w-full"
          : "relative w-full max-h-[85vh]"
      } ${className}`}
      style={{ maxHeight: "540px" }}
    >
      {/* 1. Light Mint/Teal Header with 7 Countries Flags */}
      <div className="bg-[#E8F6F7] border-b border-[#D2ECEF] px-3.5 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[#002f34] flex items-center justify-center text-white shrink-0 shadow-2xs">
            <MapPin className="w-4 h-4 text-teal-300" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <CountryFlag code={currentCountry.code} className="w-4 h-3 shrink-0" />
            <span className="text-xs font-black text-[#002f34] tracking-tight truncate">
              {currentCountry.nativeName}
            </span>
          </div>
        </div>

        {/* 7 Countries Pills Selector with vector flags */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#C5E5E9] shadow-2xs overflow-x-auto no-scrollbar">
          {COUNTRIES_DATA.map((c) => {
            const isSelected = c.code === selectedCountryCode;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setSelectedCountryCode(c.code);
                  setSelectedRegion(null);
                  setSearchQuery("");
                  setCitySearchQuery("");
                }}
                title={c.nativeName}
                className={`px-2 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-[#002f34] text-white shadow-xs scale-105"
                    : "text-[#002f34] hover:bg-teal-50 hover:text-teal-950 hover:scale-105"
                }`}
              >
                <CountryFlag code={c.code} className="w-3.5 h-2.5" />
                <span className={isSelected ? "text-white font-bold" : "text-[#002f34] font-bold"}>{c.code}</span>
              </button>
            );
          })}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-teal-100/60 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-[#002f34]" />
          </button>
        )}
      </div>

      {/* 2. Fast Search Bar */}
      <div className="px-3.5 py-2 bg-gray-50/80 border-b border-gray-100">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              selectedRegion
                ? `Szukaj w ${selectedRegion.name}...`
                : `Wpisz miejscowość lub region (${currentCountry.nativeName})...`
            }
            className="w-full pl-8 pr-7 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-[#002f34] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="p-1 text-gray-400 hover:text-gray-700 absolute right-2 top-1/2 -translate-y-1/2 text-xs cursor-pointer hover:bg-gray-100 rounded-full"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. Main Content Views */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {/* A) Search Results View (when searching) */}
        {searchQuery.trim().length > 0 ? (
          <div className="p-2 space-y-0.5">
            {searchResults.length > 0 ? (
              searchResults.map((match, idx) => (
                <button
                  key={`${match.displayName}-${idx}`}
                  type="button"
                  onClick={() => handleSearchMatchClick(match)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-teal-50/90 hover:pl-4.5 rounded-xl transition-all duration-150 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {match.type === "city" && (
                      <Building2 className="w-4 h-4 text-teal-600 shrink-0 group-hover:scale-110 transition-transform" />
                    )}
                    {match.type === "region" && (
                      <Map className="w-4 h-4 text-amber-500 shrink-0 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-sm font-bold text-[#002f34] group-hover:text-teal-950 truncate">
                      {match.displayName}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 group-hover:text-teal-700 font-bold shrink-0 ml-2">
                    {match.type === "city" ? t("location.city") : t("location.region")}
                  </span>
                </button>
              ))
            ) : (
              <div className="py-6 text-center px-4">
                <p className="text-xs font-medium text-gray-600">
                  Brak wyników dla: <strong className="text-[#002f34]">"{searchQuery}"</strong>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onChange(searchQuery.trim());
                    if (onClose) onClose();
                  }}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#002f34] hover:bg-[#003e45] text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-white">Użyj "{searchQuery.trim()}"</span>
                </button>
              </div>
            )}
          </div>
        ) : selectedRegion ? (
          /* B) Level 2: Cities View for Selected Region */
          <div>
            {/* Back Button to Regions List with rich hover */}
            <button
              type="button"
              onClick={() => {
                setSelectedRegion(null);
                setCitySearchQuery("");
              }}
              className="w-full px-4 py-2.5 bg-gray-50 hover:bg-teal-100/70 hover:pl-5 text-left text-xs font-black text-[#002f34] hover:text-teal-950 flex items-center gap-2 transition-all duration-150 cursor-pointer border-b border-gray-200 group"
            >
              <ChevronLeft className="w-4 h-4 text-teal-600 group-hover:-translate-x-0.5 transition-transform shrink-0" />
              <span>← Wybierz inne województwo / region</span>
            </button>

            {/* Option 1: Entire Region with rich hover */}
            <button
              type="button"
              onClick={() => handleSelectEntireRegion(selectedRegion)}
              className="w-full px-4 py-3 text-left hover:bg-teal-50/90 hover:pl-5 transition-all duration-150 flex items-center justify-between cursor-pointer border-b border-gray-100 group"
            >
              <div>
                <div className="text-sm font-bold text-[#002f34] group-hover:text-teal-900">
                  Całe województwo {selectedRegion.name}
                </div>
                <div className="text-xs text-gray-500 group-hover:text-teal-700">
                  Wszystkie ogłoszenia w tym regionie
                </div>
              </div>
              <Check className="w-4 h-4 text-teal-600 group-hover:scale-125 transition-transform" />
            </button>

            {/* Section Header */}
            <div className="px-4 py-2 bg-gray-50/90 text-[11px] font-bold text-[#002f34] tracking-wide border-b border-gray-100 flex items-center justify-between">
              <span>Miejscowości w {selectedRegion.name}</span>
              <span className="text-gray-500 font-bold">
                ({filteredCities.length})
              </span>
            </div>

            {/* Cities List with rich hover */}
            <div className="divide-y divide-gray-100 max-h-[260px] overflow-y-auto">
              {filteredCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleSelectCity(city)}
                  className="w-full px-4 py-2.5 text-left text-sm font-bold text-[#002f34] hover:text-teal-900 hover:bg-teal-50/90 hover:pl-5 transition-all duration-150 flex items-center justify-between cursor-pointer group"
                >
                  <span className="truncate">{city}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all duration-150" />
                </button>
              ))}
            </div>

            {/* Custom City Entry Field */}
            <form
              onSubmit={handleCustomCitySubmit}
              className="p-3 bg-gray-50 border-t border-gray-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={customCityInput}
                onChange={(e) => setCustomCityInput(e.target.value)}
                placeholder="Wpisz inną miejscowość..."
                className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-[#002f34] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
              <button
                type="submit"
                disabled={!customCityInput.trim()}
                className="px-3 py-1.5 bg-[#002f34] hover:bg-[#003e45] disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-95"
              >
                <span className="text-white">Wybierz</span>
              </button>
            </form>
          </div>
        ) : (
          /* C) Level 1: Main View (Exact layout from user screenshot with rich hover) */
          <div>
            {/* Primary Action: Cała Polska / Cały Kraj with rich hover */}
            <button
              type="button"
              onClick={() => handleSelectEntireCountry()}
              className="w-full px-4 py-3.5 text-left hover:bg-teal-50/90 hover:pl-5 transition-all duration-150 flex items-center justify-between cursor-pointer border-b border-gray-100 group"
            >
              <div>
                <div className="text-sm font-bold text-[#002f34] group-hover:text-teal-900">
                  {currentCountry.code === "PL" ? "Cała Polska" : `${t("hero.entireCountry")} (${currentCountry.nativeName})`}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 group-hover:text-teal-700">
                  Wszystkie w całym kraju
                </div>
              </div>
              <Check className="w-4 h-4 text-teal-600 group-hover:scale-125 transition-transform" />
            </button>

            {/* Section Header: Wybierz województwo / region */}
            <div className="px-4 py-2 bg-gray-50/90 text-[11px] font-bold text-[#002f34] tracking-wide border-b border-gray-100">
              {currentCountry.code === "PL" ? "Wybierz województwo" : `Wybierz region (${currentCountry.nativeName})`}
            </div>

            {/* List of Regions with '>' Chevron and smooth slide-in hover */}
            <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
              {currentCountry.regions.map((region) => (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => setSelectedRegion(region)}
                  className="w-full px-4 py-3 text-left text-sm font-bold text-[#002f34] hover:bg-teal-50/90 hover:text-teal-900 hover:pl-5 transition-all duration-150 ease-out flex items-center justify-between cursor-pointer group"
                >
                  <span className="truncate">
                    {region.name}
                  </span>
                  <ChevronRight className="w-5 h-5 text-[#002f34] group-hover:text-teal-600 group-hover:translate-x-1.5 transition-all duration-150 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Footer */}
      <div className="px-4 py-2 bg-gray-50/95 border-t border-gray-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-gray-500 truncate max-w-[70%]">
          <span className="font-bold text-gray-400">Wybrano:</span>
          <span className="font-extrabold text-[#002f34] truncate">
            {value || (currentCountry.code === "PL" ? "Cała Polska" : currentCountry.nativeName)}
          </span>
        </div>

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              if (onClose) onClose();
            }}
            className="text-[11px] font-bold text-gray-500 hover:text-red-600 transition-colors cursor-pointer hover:underline"
          >
            Wyczyść
          </button>
        )}
      </div>
    </div>
  );
}
