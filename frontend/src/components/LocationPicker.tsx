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
      {/* 1. Light Teal Header with 7 Countries Flags */}
      <div className="bg-[#E8F6F7] border-b border-[#D2ECEF] px-3.5 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#002f34] flex items-center justify-center text-white shrink-0 shadow-2xs">
            <MapPin className="w-4 h-4 text-teal-300" />
          </div>
          <span className="text-xs font-bold text-[#002f34] tracking-tight">
            {currentCountry.nativeName}
          </span>
        </div>

        {/* 7 Countries Pills Selector */}
        <div className="flex items-center gap-1 bg-white/80 backdrop-blur-xs p-1 rounded-xl border border-[#C5E5E9] shadow-2xs overflow-x-auto no-scrollbar">
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
                className={`px-2 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#002f34] text-white shadow-xs scale-105"
                    : "text-gray-700 hover:bg-teal-50"
                }`}
              >
                <span>{c.flag}</span>
                <span className="hidden sm:inline text-[11px]">{c.code}</span>
              </button>
            );
          })}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-teal-100/50 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Fast Search Bar */}
      <div className="px-3.5 py-2 bg-gray-50/70 border-b border-gray-100">
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
            className="w-full pl-8 pr-7 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-[#002f34] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="p-1 text-gray-400 hover:text-gray-600 absolute right-2 top-1/2 -translate-y-1/2 text-xs cursor-pointer"
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
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-teal-50/70 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {match.type === "city" && (
                      <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                    )}
                    {match.type === "region" && (
                      <Map className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span className="text-sm font-semibold text-[#002f34] group-hover:text-teal-700 truncate">
                      {match.displayName}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium shrink-0 ml-2">
                    {match.type === "city" ? t("location.city") : t("location.region")}
                  </span>
                </button>
              ))
            ) : (
              <div className="py-6 text-center px-4">
                <p className="text-xs font-medium text-gray-500">
                  Brak wyników dla: <strong>"{searchQuery}"</strong>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onChange(searchQuery.trim());
                    if (onClose) onClose();
                  }}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#002f34] hover:bg-[#003e45] text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Użyj "{searchQuery.trim()}"</span>
                </button>
              </div>
            )}
          </div>
        ) : selectedRegion ? (
          /* B) Level 2: Cities View for Selected Region */
          <div>
            {/* Back Button to Regions List */}
            <button
              type="button"
              onClick={() => {
                setSelectedRegion(null);
                setCitySearchQuery("");
              }}
              className="w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100/90 text-left text-xs font-bold text-[#002f34] flex items-center gap-2 transition-colors cursor-pointer border-b border-gray-200"
            >
              <ChevronLeft className="w-4 h-4 text-teal-600 shrink-0" />
              <span>← Wybierz inne województwo / region</span>
            </button>

            {/* Option 1: Entire Region */}
            <button
              type="button"
              onClick={() => handleSelectEntireRegion(selectedRegion)}
              className="w-full px-4 py-3 text-left hover:bg-teal-50/50 transition-colors flex items-center justify-between cursor-pointer border-b border-gray-100 group"
            >
              <div>
                <div className="text-sm font-bold text-[#002f34] group-hover:text-teal-700">
                  Całe województwo {selectedRegion.name}
                </div>
                <div className="text-xs text-gray-400">
                  Wszystkie ogłoszenia w tym regionie
                </div>
              </div>
              <Check className="w-4 h-4 text-teal-600" />
            </button>

            {/* Section Header */}
            <div className="px-4 py-2 bg-gray-50/80 text-[11px] font-bold text-[#002f34] tracking-wide border-b border-gray-100 flex items-center justify-between">
              <span>Miejscowości w {selectedRegion.name}</span>
              <span className="text-gray-400 font-normal">
                ({filteredCities.length})
              </span>
            </div>

            {/* Cities List */}
            <div className="divide-y divide-gray-100 max-h-[260px] overflow-y-auto">
              {filteredCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleSelectCity(city)}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-800 hover:text-teal-800 hover:bg-teal-50/60 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <span className="truncate group-hover:font-semibold">{city}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-teal-600 transition-colors" />
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
                className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-[#002f34] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
              />
              <button
                type="submit"
                disabled={!customCityInput.trim()}
                className="px-3 py-1.5 bg-[#002f34] hover:bg-[#003e45] disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                Wybierz
              </button>
            </form>
          </div>
        ) : (
          /* C) Level 1: Main View (Exact layout from user screenshot) */
          <div>
            {/* Primary Action: Cała Polska / Cały Kraj */}
            <button
              type="button"
              onClick={() => handleSelectEntireCountry()}
              className="w-full px-4 py-3.5 text-left hover:bg-teal-50/50 transition-colors flex items-center justify-between cursor-pointer border-b border-gray-100 group"
            >
              <div>
                <div className="text-sm font-bold text-[#002f34] group-hover:text-teal-700">
                  {currentCountry.code === "PL" ? "Cała Polska" : `${t("hero.entireCountry")} (${currentCountry.nativeName})`}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Wszystkie w całym kraju
                </div>
              </div>
              <Check className="w-4 h-4 text-teal-600" />
            </button>

            {/* Section Header: Wybierz województwo / region */}
            <div className="px-4 py-2 bg-gray-50/80 text-[11px] font-bold text-[#002f34] tracking-wide border-b border-gray-100">
              {currentCountry.code === "PL" ? "Wybierz województwo" : `Wybierz region (${currentCountry.nativeName})`}
            </div>

            {/* List of Regions with '>' Chevron */}
            <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
              {currentCountry.regions.map((region) => (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => setSelectedRegion(region)}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-[#002f34] hover:bg-teal-50/60 hover:text-teal-800 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <span className="truncate group-hover:font-semibold">
                    {region.name}
                  </span>
                  <ChevronRight className="w-5 h-5 text-[#002f34] group-hover:text-teal-700 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Footer */}
      <div className="px-4 py-2 bg-gray-50/90 border-t border-gray-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-gray-500 truncate max-w-[70%]">
          <span className="font-semibold text-gray-400">Wybrano:</span>
          <span className="font-bold text-[#002f34] truncate">
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
            className="text-[11px] font-semibold text-gray-500 hover:text-gray-800 cursor-pointer"
          >
            Wyczyść
          </button>
        )}
      </div>
    </div>
  );
}
