"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  MapPin,
  Heart,
  MessageSquare,
  User,
  PlusCircle,
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
  LogOut,
  ChevronDown,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import AuthModal from "@/components/AuthModal";
import AdsManagerModal from "@/components/AdsManagerModal";
import SavedItemsModal from "@/components/SavedItemsModal";
import AccountSettingsModal from "@/components/AccountSettingsModal";
import AdDetailsModal from "@/components/AdDetailsModal";
import { getApiUrl } from "@/lib/api";

// Icon mapping dictionary
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

// Color styles matching the vibrant/pastel circles from the design
const COLOR_STYLES: Record<string, string> = {
  amber: "bg-amber-400 text-amber-950 hover:bg-amber-500",
  orange: "bg-orange-500 text-white hover:bg-orange-600",
  cyan: "bg-cyan-300 text-cyan-950 hover:bg-cyan-400",
  red: "bg-rose-500 text-white hover:bg-rose-600",
  yellow: "bg-yellow-200 text-yellow-900 hover:bg-yellow-300",
  stone: "bg-stone-700 text-white hover:bg-stone-800",
  blue: "bg-sky-200 text-sky-900 hover:bg-sky-300",
  pink: "bg-pink-200 text-pink-900 hover:bg-pink-300",
  indigo: "bg-indigo-500 text-white hover:bg-indigo-600",
  sky: "bg-blue-100 text-blue-900 hover:bg-blue-200",
  emerald: "bg-emerald-100 text-emerald-900 hover:bg-emerald-200",
  rose: "bg-rose-200 text-rose-900 hover:bg-rose-300",
  slate: "bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200",
  teal: "bg-teal-300 text-teal-950 hover:bg-teal-400",
  violet: "bg-violet-200 text-violet-900 hover:bg-violet-300"
};

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
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
  author_name?: string;
}

// Fallback list of categories in English
const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: "Antiques & Collectibles", slug: "antiques-collectibles", icon: "Landmark", color: "amber" },
  { id: 2, name: "Construction & Renovation", slug: "construction-renovation", icon: "Hammer", color: "orange" },
  { id: 3, name: "Business & Industry", slug: "business-industry", icon: "Factory", color: "cyan" },
  { id: 4, name: "Automotive & Vehicles", slug: "automotive-vehicles", icon: "Car", color: "red" },
  { id: 5, name: "Real Estate", slug: "real-estate", icon: "Home", color: "yellow" },
  { id: 6, name: "Jobs & Careers", slug: "jobs-careers", icon: "Briefcase", color: "stone" },
  { id: 7, name: "Home & Garden", slug: "home-garden", icon: "Armchair", color: "blue" },
  { id: 8, name: "Electronics", slug: "electronics", icon: "Smartphone", color: "pink" },
  { id: 9, name: "Fashion & Apparel", slug: "fashion-apparel", icon: "Shirt", color: "indigo" },
  { id: 10, name: "Agriculture & Farming", slug: "agriculture-farming", icon: "Tractor", color: "sky" },
  { id: 11, name: "Pets & Animals", slug: "pets-animals", icon: "Dog", color: "emerald" },
  { id: 12, name: "Baby & Kids", slug: "baby-kids", icon: "Baby", color: "rose" },
  { id: 13, name: "Sports & Hobbies", slug: "sports-hobbies", icon: "Trophy", color: "slate" },
  { id: 14, name: "Music & Education", slug: "music-education", icon: "Music", color: "blue" },
  { id: 15, name: "Health & Beauty", slug: "health-beauty", icon: "Sparkles", color: "teal" },
  { id: 16, name: "Services", slug: "services", icon: "Wrench", color: "orange" },
  { id: 17, name: "Accommodations & Stays", slug: "accommodations-stays", icon: "Bed", color: "emerald" },
  { id: 18, name: "Rentals & Hire", slug: "rentals-hire", icon: "CalendarCheck", color: "violet" },
  { id: 19, name: "Free Stuff (Giveaway)", slug: "free-stuff", icon: "Gift", color: "teal" },
  { id: 20, name: "Delivery Deals", slug: "delivery-deals", icon: "PackageCheck", color: "amber" },
  { id: 21, name: "Books & Textbooks", slug: "books-textbooks", icon: "BookOpen", color: "yellow" },
  { id: 22, name: "Auto Parts", slug: "auto-parts", icon: "Cog", color: "blue" },
  { id: 23, name: "Machinery Parts", slug: "machinery-parts", icon: "Settings", color: "cyan" },
  { id: 24, name: "Featured Employers", slug: "featured-employers", icon: "Users", color: "orange" },
  { id: 25, name: "Auto Expo & Events", slug: "auto-expo-events", icon: "Compass", color: "blue" }
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Authentication State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Advertisements State
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [isAdsModalOpen, setIsAdsModalOpen] = useState(false);
  const [adsModalTab, setAdsModalTab] = useState<"my-ads" | "create">("my-ads");

  // Wishlist & Settings Modal States
  const [savedAdIds, setSavedAdIds] = useState<number[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);

  // Load saved session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("deallyhub_user");
      const savedToken = localStorage.getItem("deallyhub_token");
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
      if (savedToken) setToken(savedToken);
    } catch {
      // Ignore parse error
    }
  }, []);

  // Fetch categories from backend API
  useEffect(() => {
    const apiUrl = getApiUrl();
    fetch(`${apiUrl}/api/categories`)
      .then((res) => {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        }
        throw new Error("Non-JSON response");
      })
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCategories(json.data);
        }
      })
      .catch((err) => {
        console.log("Using local default categories:", err.message);
      });
  }, []);

  // Fetch Public Advertisements
  const fetchAds = useCallback(() => {
    const apiUrl = getApiUrl();
    let url = `${apiUrl}/api/ads`;
    const params = new URLSearchParams();
    if (activeCategory) params.append("category", activeCategory);
    if (searchQuery.trim()) params.append("search", searchQuery.trim());
    if (params.toString()) url += `?${params.toString()}`;

    fetch(url)
      .then((res) => {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        }
        throw new Error("Non-JSON response");
      })
      .then((json) => {
        if (json.success && Array.isArray(json.ads)) {
          setAds(json.ads);
        }
      })
      .catch((err) => {
        console.log("Could not fetch advertisements:", err.message);
      });
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  // Fetch Wishlist Items
  const fetchSavedIds = useCallback(() => {
    if (!token) {
      setSavedAdIds([]);
      return;
    }
    const apiUrl = getApiUrl();
    fetch(`${apiUrl}/api/saved`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.saved)) {
          setSavedAdIds(data.saved.map((s: Advertisement) => s.id));
        }
      })
      .catch((err) => console.warn("Failed to fetch saved items:", err));
  }, [token]);

  useEffect(() => {
    fetchSavedIds();
  }, [fetchSavedIds]);

  // Toggle Heart / Wishlist
  const handleToggleSave = async (adId: number) => {
    if (!token) {
      setIsAuthOpen(true);
      return;
    }

    const apiUrl = getApiUrl();
    // Optimistic UI update
    setSavedAdIds((prev) =>
      prev.includes(adId) ? prev.filter((id) => id !== adId) : [...prev, adId]
    );

    try {
      const res = await fetch(`${apiUrl}/api/saved/${adId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if (data.isSaved) {
          setSavedAdIds((prev) => (prev.includes(adId) ? prev : [...prev, adId]));
        } else {
          setSavedAdIds((prev) => prev.filter((id) => id !== adId));
        }
      }
    } catch (err) {
      console.error("Failed to toggle wishlist item:", err);
      fetchSavedIds(); // rollback
    }
  };

  const handleAuthSuccess = (user: UserProfile, receivedToken: string) => {
    setCurrentUser(user);
    setToken(receivedToken);
    localStorage.setItem("deallyhub_user", JSON.stringify(user));
    localStorage.setItem("deallyhub_token", receivedToken);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    setSavedAdIds([]);
    setIsProfileMenuOpen(false);
    localStorage.removeItem("deallyhub_user");
    localStorage.removeItem("deallyhub_token");
  };

  const handleOpenMyAds = () => {
    setIsProfileMenuOpen(false);
    setAdsModalTab("my-ads");
    setIsAdsModalOpen(true);
  };

  const handleOpenSaved = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
    } else {
      setIsProfileMenuOpen(false);
      setIsSavedModalOpen(true);
    }
  };

  const handleOpenSettings = () => {
    setIsProfileMenuOpen(false);
    setIsSettingsModalOpen(true);
  };

  const handlePostAdClick = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
    } else {
      setAdsModalTab("create");
      setIsAdsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#002f34] font-sans antialiased">
      {/* Top Navbar */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tight text-[#002f34]">
              Deally<span className="text-teal-600">hub</span>
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-sm font-medium text-[#002f34]">
            <button className="hidden sm:flex items-center gap-1.5 hover:text-teal-600 transition-colors">
              <MessageSquare className="w-4 h-4" />
              <span>Messages</span>
            </button>

            {/* Saved Items Nav Button */}
            <button
              onClick={handleOpenSaved}
              className="flex items-center gap-1.5 hover:text-teal-600 transition-colors cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${savedAdIds.length > 0 ? "text-rose-500 fill-rose-500" : ""}`} />
              <span>Saved {savedAdIds.length > 0 && `(${savedAdIds.length})`}</span>
            </button>

            {/* My Profile Button / Dropdown */}
            <div className="relative">
              {currentUser ? (
                <div>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 hover:text-teal-600 transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[120px] truncate font-semibold">
                      {currentUser.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  </button>

                  {/* Logged-In User Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-bold text-[#002f34] truncate">{currentUser.name}</p>
                        <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleOpenMyAds}
                          className="w-full text-left px-4 py-2.5 text-sm text-[#002f34] hover:bg-teal-50 flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-teal-600" />
                          <span>My Advertisements</span>
                        </button>
                        <button
                          onClick={handleOpenSaved}
                          className="w-full text-left px-4 py-2 text-sm text-[#002f34] hover:bg-gray-50 flex items-center gap-2.5 cursor-pointer"
                        >
                          <Heart className="w-4 h-4 text-rose-500" />
                          <span>Saved Items ({savedAdIds.length})</span>
                        </button>
                        <button
                          onClick={handleOpenSettings}
                          className="w-full text-left px-4 py-2 text-sm text-[#002f34] hover:bg-gray-50 flex items-center gap-2.5 cursor-pointer"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          <span>Account Settings</span>
                        </button>
                      </div>

                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 font-medium cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="flex items-center gap-1.5 hover:text-teal-600 transition-colors cursor-pointer py-1.5"
                >
                  <User className="w-4 h-4" />
                  <span>My Profile</span>
                </button>
              )}
            </div>

            {/* Post Ad Button */}
            <button
              onClick={handlePostAdClick}
              className="flex items-center gap-2 bg-[#002f34] hover:bg-[#003d44] text-white px-4 py-2.5 rounded-md font-semibold transition-all shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Ad</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Search Section */}
      <section className="bg-[#f2f4f5] py-8 sm:py-12 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row items-stretch">
            {/* Search Input */}
            <div className="flex-1 flex items-center px-4 py-3.5 border-b md:border-b-0 md:border-r border-gray-200">
              <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find something for yourself..."
                className="w-full text-base outline-none text-[#002f34] placeholder-gray-400 bg-transparent font-normal"
              />
            </div>

            {/* Location Input */}
            <div className="flex-1 flex items-center px-4 py-3.5 border-b md:border-b-0 md:border-r border-gray-200">
              <MapPin className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Entire Country / Location"
                className="w-full text-base outline-none text-[#002f34] placeholder-gray-400 bg-transparent font-normal"
              />
            </div>

            {/* Search Button */}
            <button
              onClick={fetchAds}
              className="bg-[#002f34] hover:bg-[#003e45] active:bg-[#001e22] text-white px-8 py-4 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Search</span>
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Categories Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex-1 w-full">
        <div className="text-center mb-10 sm:mb-14">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002f34] tracking-tight">
            Main Categories
          </h1>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            Browse through verified local classifieds, goods, vehicles, and services
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-x-4 gap-y-8 sm:gap-y-10 justify-items-center">
          {categories.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || Sparkles;
            const colorClass = COLOR_STYLES[cat.color] || "bg-teal-100 text-teal-800";
            const isSelected = activeCategory === cat.slug;

            return (
              <button
                key={cat.id || cat.slug}
                onClick={() => setActiveCategory(isSelected ? null : cat.slug)}
                className="group flex flex-col items-center text-center cursor-pointer max-w-[105px] focus:outline-none"
              >
                {/* Circle Icon Badge */}
                <div
                  className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center transition-all duration-200 transform group-hover:scale-108 group-hover:shadow-md mb-2.5 ${colorClass} ${
                    isSelected ? "ring-4 ring-teal-500 scale-105 shadow-md" : ""
                  }`}
                >
                  <IconComponent className="w-9 h-9 stroke-[2]" />
                </div>

                {/* Category Label in English */}
                <span className="text-xs sm:text-[13px] font-semibold text-[#002f34] leading-snug line-clamp-2 group-hover:text-teal-700 transition-colors">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Indicator */}
        {activeCategory && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 rounded-full text-sm font-semibold text-teal-900">
              <span>Category: {categories.find((c) => c.slug === activeCategory)?.name}</span>
              <button
                onClick={() => setActiveCategory(null)}
                className="text-teal-600 hover:text-teal-900 ml-1 p-0.5 rounded-full hover:bg-teal-100"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Recent & Featured Advertisements Section */}
        <section className="mt-16 pt-12 border-t border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#002f34]">
                {activeCategory
                  ? `${categories.find((c) => c.slug === activeCategory)?.name} Listings`
                  : "Recent Advertisements"}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Latest offers published by members of Deallyhub
              </p>
            </div>

            <button
              onClick={handlePostAdClick}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post an Ad</span>
            </button>
          </div>

          {/* Advertisements Grid */}
          {ads.length === 0 ? (
            <div className="p-12 text-center bg-gray-50/70 rounded-2xl border border-gray-200/60 max-w-lg mx-auto">
              <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-[#002f34]">No advertisements found</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                Be the first to post an offer in this category!
              </p>
              <button
                onClick={handlePostAdClick}
                className="bg-[#002f34] hover:bg-[#003e45] text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Post New Advertisement
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {ads.map((ad) => {
                const cat = categories.find((c) => c.slug === ad.category_slug);
                const coverImg = ad.images && ad.images.length > 0 ? ad.images[0] : null;
                const isSaved = savedAdIds.includes(ad.id);

                return (
                  <div
                    key={ad.id}
                    onClick={() => setSelectedAd(ad)}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group relative cursor-pointer hover:border-teal-500/50"
                  >
                    {/* Thumbnail Image */}
                    <div className="h-48 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                      {coverImg ? (
                        <img
                          src={coverImg}
                          alt={ad.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                          <ImageIcon className="w-10 h-10 mb-1" />
                          <span className="text-xs">No image provided</span>
                        </div>
                      )}

                      {/* Category Badge */}
                      {cat && (
                        <span className="absolute top-3 left-3 bg-[#002f34]/85 backdrop-blur-xs text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-xs pointer-events-none">
                          {cat.name}
                        </span>
                      )}

                      {/* Heart Wishlist Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleSave(ad.id);
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all hover:scale-110 cursor-pointer z-20"
                        title={isSaved ? "Remove from saved items" : "Save this advertisement"}
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            isSaved
                              ? "fill-rose-500 text-rose-500"
                              : "text-gray-400 hover:text-rose-500"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Listing Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-xl font-black text-[#002f34] mb-1">
                          {parseFloat(ad.price as string) === 0 ? (
                            <span className="text-teal-600">Free</span>
                          ) : (
                            `${ad.price} ${ad.currency}`
                          )}
                        </div>

                        <h3 className="font-bold text-[#002f34] text-base line-clamp-1 group-hover:text-teal-600 transition-colors">
                          {ad.title}
                        </h3>

                        <p className="text-xs text-gray-500 line-clamp-2 mt-1 mb-3">
                          {ad.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                        <div className="flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{ad.location}</span>
                        </div>
                        <span className="shrink-0 text-gray-400">
                          {new Date(ad.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-[#f2f4f5] text-gray-500 text-xs py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-2">
          <p className="font-semibold text-[#002f34]">Deallyhub Marketplace &copy; 2026</p>
          <p>Next.js Frontend on Vercel &bull; Node.js &amp; PostgreSQL Backend on Railway</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Advertisements Manager Modal */}
      <AdsManagerModal
        isOpen={isAdsModalOpen}
        onClose={() => setIsAdsModalOpen(false)}
        initialTab={adsModalTab}
        categories={categories}
        token={token}
        onAdCreated={fetchAds}
      />

      {/* Saved Items (Wishlist) Modal */}
      <SavedItemsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        token={token}
        categories={categories}
        onItemRemoved={(removedId) => {
          setSavedAdIds((prev) => prev.filter((id) => id !== removedId));
        }}
      />

      {/* Account Settings Modal */}
      <AccountSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        token={token}
        currentUser={currentUser}
        onProfileUpdated={(updated) => {
          setCurrentUser(updated);
          localStorage.setItem("deallyhub_user", JSON.stringify(updated));
        }}
        onAccountDeleted={handleLogout}
      />

      {/* Advertisement Details Modal */}
      <AdDetailsModal
        ad={selectedAd}
        isOpen={!!selectedAd}
        onClose={() => setSelectedAd(null)}
        categoryName={
          categories.find((c) => c.slug === selectedAd?.category_slug)?.name ||
          selectedAd?.category_slug ||
          "Classifieds"
        }
        isSaved={selectedAd ? savedAdIds.includes(selectedAd.id) : false}
        onToggleSave={handleToggleSave}
      />
    </div>
  );
}
