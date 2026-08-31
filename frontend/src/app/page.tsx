"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Image as ImageIcon,
  Download,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Shield,
  Bell,
  Loader2
} from "lucide-react";
import AuthModal from "@/components/AuthModal";
import AdsManagerModal from "@/components/AdsManagerModal";
import SavedItemsModal from "@/components/SavedItemsModal";
import AccountSettingsModal from "@/components/AccountSettingsModal";
import AdDetailsModal from "@/components/AdDetailsModal";
import MessagesModal from "@/components/MessagesModal";
import NotificationsModal, { NotificationItem } from "@/components/NotificationsModal";
import AdminPanelModal from "@/components/AdminPanelModal";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/context/LanguageContext";
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
  role?: string;
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
  const { t, getCategoryName, language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Authentication State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register" | "forgot" | "reset">("login");
  const [authResetToken, setAuthResetToken] = useState("");
  const [globalBanner, setGlobalBanner] = useState<{ text: string; type: "success" | "error" } | null>(null);
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
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);

  // Notifications State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Admin Portal State (Portal Owner)
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Check if any modal is currently open to handle body lock and hide mobile bottom bar
  const isAnyModalOpen =
    isAuthOpen ||
    isAdsModalOpen ||
    isSavedModalOpen ||
    isSettingsModalOpen ||
    !!selectedAd ||
    isMessagesOpen ||
    isNotificationsOpen ||
    isAdminPanelOpen;

  // Live Search Dropdown State
  const [liveSearchResults, setLiveSearchResults] = useState<Advertisement[]>([]);
  const [isLiveDropdownOpen, setIsLiveDropdownOpen] = useState(false);
  const [isLiveSearching, setIsLiveSearching] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced Live Search Effect
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 1) {
      setLiveSearchResults([]);
      setIsLiveDropdownOpen(false);
      return;
    }

    setIsLiveSearching(true);
    const timer = setTimeout(() => {
      const apiUrl = getApiUrl();
      const params = new URLSearchParams();
      params.append("search", trimmed);
      if (location.trim() && !/entire country/i.test(location.trim())) {
        params.append("location", location.trim());
      }
      params.append("limit", "8");

      fetch(`${apiUrl}/api/ads?${params.toString()}`)
        .then((res) => {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            return res.json();
          }
          throw new Error("Non-JSON response");
        })
        .then((data) => {
          if (data.success && Array.isArray(data.ads)) {
            setLiveSearchResults(data.ads);
            setIsLiveDropdownOpen(true);
          }
        })
        .catch((err) => {
          console.warn("Live search error:", err);
        })
        .finally(() => {
          setIsLiveSearching(false);
        });
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery, location]);

  // Click Outside & Escape key to close live dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsLiveDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLiveDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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

  // URL parameters check for Email Verification & Password Reset
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const verifyToken = urlParams.get("verify_email");
    const isVerified = urlParams.get("verified");
    const verifyError = urlParams.get("verify_error");
    const resetToken = urlParams.get("reset_token");

    if (verifyToken) {
      const apiUrl = getApiUrl();
      fetch(`${apiUrl}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verifyToken })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setGlobalBanner({ text: "Email address verified successfully! 🎉 Welcome to your profile.", type: "success" });
            if (data.user && data.token) {
              handleAuthSuccess(data.user, data.token);
              setIsSettingsModalOpen(true);
            }
            if (typeof window !== "undefined") {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } else {
            setGlobalBanner({ text: data.error || "Email verification link is invalid or expired.", type: "error" });
          }
        })
        .catch(() => {
          setGlobalBanner({ text: "Failed to verify email. Please try again.", type: "error" });
        });
    } else if (isVerified === "true") {
      setGlobalBanner({ text: "Email address verified successfully! 🎉 Welcome to your profile.", type: "success" });
      setIsSettingsModalOpen(true);
      if (typeof window !== "undefined") {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else if (verifyError) {
      setGlobalBanner({ text: "Verification link was invalid or expired. Please request a new one.", type: "error" });
    } else if (resetToken) {
      setAuthResetToken(resetToken);
      setAuthModalMode("reset");
      setIsAuthOpen(true);
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
    if (location.trim() && !/entire country/i.test(location.trim())) {
      params.append("location", location.trim());
    }
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
  }, [activeCategory, searchQuery, location]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAds();
    const el = document.getElementById("listings-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

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

  const handleOpenMessages = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
    } else {
      setIsProfileMenuOpen(false);
      setActiveConversationId(null);
      setIsMessagesOpen(true);
    }
  };

  // Notifications fetch & polling
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadNotificationsCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.warn("Failed to fetch notifications:", err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 25000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadNotificationsCount(0);
    }
  }, [token, fetchNotifications]);

  const handleMarkNotificationRead = async (id: number) => {
    if (!token) return;
    try {
      const apiUrl = getApiUrl();
      await fetch(`${apiUrl}/api/notifications/${id}/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!token) return;
    try {
      const apiUrl = getApiUrl();
      await fetch(`${apiUrl}/api/notifications/read-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadNotificationsCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
    }
  };

  const handleStartChat = async (adId: number) => {
    if (!token) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ adId })
      });

      const data = await res.json();
      if (data.success && data.conversation) {
        setActiveConversationId(data.conversation.id);
        setIsMessagesOpen(true);
      } else {
        alert(data.error || "Could not start conversation.");
      }
    } catch (err) {
      console.error("Error starting chat:", err);
    }
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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-15 sm:h-18 flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <div
            onClick={() => {
              setActiveCategory(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 sm:gap-3 shrink-0 cursor-pointer"
          >
            <img
              src="/logo.png"
              alt="Deally"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl shadow-sm object-cover"
            />
            <span className="text-xl sm:text-2xl font-black tracking-tight text-[#002f34] select-none">
              Deally<span className="text-teal-600">hub</span>
            </span>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 text-sm font-medium text-[#002f34] shrink-0">
            {/* Language Switcher */}
            <LanguageSelector />

            {/* Messages Button (Desktop) */}
            <button
              onClick={handleOpenMessages}
              className="hidden md:flex items-center gap-1.5 hover:text-teal-600 transition-colors cursor-pointer rounded-lg py-1 px-2 hover:bg-gray-50"
              title={t("nav.messages")}
            >
              <MessageSquare className="w-4 h-4 text-[#002f34]" />
              <span>{t("nav.messages")}</span>
            </button>

            {/* Saved Items Nav Button (Desktop) */}
            <button
              onClick={handleOpenSaved}
              className="hidden md:flex items-center gap-1.5 hover:text-teal-600 transition-colors cursor-pointer rounded-lg py-1 px-2 hover:bg-gray-50"
              title={t("nav.saved")}
            >
              <Heart className={`w-4 h-4 ${savedAdIds.length > 0 ? "text-rose-500 fill-rose-500" : ""}`} />
              <span>{t("nav.saved")}</span>
              {savedAdIds.length > 0 && (
                <span className="text-xs bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-full">
                  {savedAdIds.length}
                </span>
              )}
            </button>

            {/* Notification Bell Nav Button */}
            {currentUser && (
              <button
                onClick={() => setIsNotificationsOpen(true)}
                className="relative p-2 text-[#002f34] hover:text-teal-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer active:scale-95"
                title={t("nav.notifications")}
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-[17px] h-[17px] bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-xs">
                    {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}

            {/* My Profile Button / Dropdown */}
            <div className="relative">
              {currentUser ? (
                <div>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 hover:text-teal-600 transition-colors bg-gray-50 hover:bg-gray-100 p-1 sm:px-3 sm:py-1.5 rounded-full border border-gray-200 cursor-pointer active:scale-95"
                    title={currentUser.name}
                  >
                    <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline max-w-[100px] md:max-w-[120px] truncate font-semibold">
                      {currentUser.name}
                    </span>
                    <ChevronDown className="w-3 h-3 text-gray-500 hidden sm:inline" />
                  </button>

                  {/* Logged-In User Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">{t("nav.signedInAs")}</p>
                          {(currentUser.role === "admin" || currentUser.email.startsWith("jannowak") || currentUser.email.startsWith("admin")) && (
                            <span className="bg-teal-100 text-teal-800 text-[10px] font-black uppercase px-1.5 py-0.5 rounded">
                              {t("nav.ownerAdmin")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-[#002f34] truncate">{currentUser.name}</p>
                        <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setIsNotificationsOpen(true);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-[#002f34] hover:bg-gray-50 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Bell className="w-4 h-4 text-teal-600" />
                            <span>{t("nav.notifications")}</span>
                          </div>
                          {unreadNotificationsCount > 0 && (
                            <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                              {unreadNotificationsCount}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={handleOpenMessages}
                          className="w-full text-left px-4 py-2 text-sm text-[#002f34] hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4 text-teal-600" />
                          <span>{t("nav.messages")}</span>
                        </button>
                        <button
                          onClick={handleOpenMyAds}
                          className="w-full text-left px-4 py-2 text-sm text-[#002f34] hover:bg-gray-50 flex items-center gap-2.5 cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span>{t("nav.myAdvertisements")}</span>
                        </button>
                        <button
                          onClick={handleOpenSaved}
                          className="w-full text-left px-4 py-2 text-sm text-[#002f34] hover:bg-gray-50 flex items-center gap-2.5 cursor-pointer"
                        >
                          <Heart className="w-4 h-4 text-rose-500" />
                          <span>{t("nav.savedItems")} ({savedAdIds.length})</span>
                        </button>
                        <button
                          onClick={handleOpenSettings}
                          className="w-full text-left px-4 py-2 text-sm text-[#002f34] hover:bg-gray-50 flex items-center gap-2.5 cursor-pointer"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          <span>{t("nav.accountSettings")}</span>
                        </button>

                        {/* Admin Portal Option for Deallyhub Owner */}
                        {(currentUser.role === "admin" || currentUser.email.startsWith("jannowak") || currentUser.email.startsWith("admin")) && (
                          <div className="pt-1 mt-1 border-t border-gray-100">
                            <button
                              onClick={() => {
                                setIsProfileMenuOpen(false);
                                setIsAdminPanelOpen(true);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm font-bold text-teal-900 bg-teal-50 hover:bg-teal-100 flex items-center gap-2.5 cursor-pointer transition-colors"
                            >
                              <Shield className="w-4 h-4 text-teal-700" />
                              <span>{t("nav.adminPortal")}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 font-medium cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t("nav.logout")}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="flex items-center gap-1.5 hover:text-teal-600 transition-colors cursor-pointer py-1.5 px-2 text-xs sm:text-sm font-semibold rounded-lg bg-gray-50 sm:bg-transparent"
                >
                  <User className="w-4 h-4 text-[#002f34]" />
                  <span>{t("nav.myProfile")}</span>
                </button>
              )}
            </div>

            {/* Post Ad Button (Desktop) */}
            <button
              onClick={handlePostAdClick}
              className="hidden sm:flex items-center gap-1.5 sm:gap-2 bg-[#002f34] hover:bg-[#003d44] active:bg-[#001e22] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t("nav.postAd")}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Verification / Alert Banner */}
      {globalBanner && (
        <div
          className={`py-3 px-4 text-center text-sm font-medium flex items-center justify-center gap-2 shadow-xs transition-all ${
            globalBanner.type === "success"
              ? "bg-teal-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          <span>{globalBanner.text}</span>
          <button
            onClick={() => setGlobalBanner(null)}
            className="ml-3 underline text-xs hover:opacity-80 font-bold cursor-pointer"
          >
            {t("common.dismiss")}
          </button>
        </div>
      )}

      {/* Hero Search Section */}
      <section className="bg-[#f2f4f5] py-6 sm:py-12 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-3 sm:px-6">
          <div ref={searchContainerRef} className="relative">
            <form
              onSubmit={(e) => {
                setIsLiveDropdownOpen(false);
                handleSearchSubmit(e);
              }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row items-stretch"
            >
              {/* Search Input */}
              <div className="flex-1 flex items-center px-3.5 sm:px-4 py-3 sm:py-3.5 border-b md:border-b-0 md:border-r border-gray-200">
                <Search className="w-5 h-5 text-gray-400 mr-2.5 sm:mr-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 1) setIsLiveDropdownOpen(true);
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("hero.searchPlaceholder")}
                  className="w-full text-base outline-none text-[#002f34] placeholder-gray-400 bg-transparent font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setIsLiveDropdownOpen(false);
                    }}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ml-1 text-xs shrink-0 cursor-pointer"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Location Input */}
              <div className="flex-1 flex items-center px-3.5 sm:px-4 py-3 sm:py-3.5 border-b md:border-b-0 md:border-r border-gray-200">
                <MapPin className="w-5 h-5 text-gray-400 mr-2.5 sm:mr-3 shrink-0" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t("hero.locationPlaceholder")}
                  className="w-full text-base outline-none text-[#002f34] placeholder-gray-400 bg-transparent font-medium"
                />
                {location && (
                  <button
                    type="button"
                    onClick={() => setLocation("")}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ml-1 text-xs shrink-0 cursor-pointer"
                    aria-label="Clear location"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="bg-[#002f34] hover:bg-[#003e45] active:bg-[#001e22] text-white px-6 sm:px-8 py-3.5 sm:py-4 font-extrabold tracking-tight flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm sm:text-base active:scale-[0.99]"
              >
                <span>{t("hero.searchBtn")}</span>
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Live Search Autocomplete Tree Dropdown */}
            {isLiveDropdownOpen && searchQuery.trim().length >= 1 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden max-h-[60vh] sm:max-h-[460px] flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Dropdown Header */}
                <div className="px-4 py-2.5 bg-gray-50/90 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#002f34]">
                    <Search className="w-3.5 h-3.5 text-teal-600" />
                    <span>{t("hero.liveResults")} ({liveSearchResults.length})</span>
                  </div>
                  {isLiveSearching && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                      <Loader2 className="w-3 h-3 animate-spin text-teal-600" />
                      <span>{t("common.loading")}</span>
                    </div>
                  )}
                </div>

                {/* Dropdown Cards List */}
                <div className="overflow-y-auto divide-y divide-gray-100 flex-1">
                  {liveSearchResults.length === 0 && !isLiveSearching ? (
                    <div className="py-8 text-center px-4">
                      <p className="text-sm font-semibold text-[#002f34]">{t("feed.noAdsTitle")}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {t("feed.noAdsDesc")}
                      </p>
                    </div>
                  ) : (
                    liveSearchResults.map((ad) => {
                      const cat = categories.find((c) => c.slug === ad.category_slug);
                      const cover = ad.images && ad.images.length > 0 ? ad.images[0] : null;
                      const isFree = parseFloat(ad.price as string) === 0;

                      return (
                        <div
                          key={ad.id}
                          onClick={() => {
                            setSelectedAd(ad);
                            setIsLiveDropdownOpen(false);
                          }}
                          className="p-3 hover:bg-teal-50/70 transition-colors flex items-center gap-3.5 cursor-pointer group"
                        >
                          {/* Card Thumbnail */}
                          <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                            {cover ? (
                              <img src={cover} alt={ad.title} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                            )}
                          </div>

                          {/* Title & Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-[#002f34] group-hover:text-teal-700 transition-colors truncate">
                              {ad.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              {cat && (
                                <span className="bg-gray-100 text-[#002f34] text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                                  {getCategoryName(cat.slug, cat.name)}
                                </span>
                              )}
                              <span className="flex items-center gap-0.5 text-[11px] text-gray-400 truncate">
                                <MapPin className="w-3 h-3" />
                                <span>{ad.location}</span>
                              </span>
                            </div>
                          </div>

                          {/* Price & Action */}
                          <div className="text-right shrink-0">
                            <div className={`text-sm font-extrabold ${ad.original_price && parseFloat(ad.original_price as string) > parseFloat(ad.price as string) ? "text-green-600" : "text-[#002f34]"}`}>
                              {isFree ? (
                                <span className="text-teal-600">{t("common.free")}</span>
                              ) : (
                                `${ad.price} ${ad.currency}`
                              )}
                            </div>
                            {ad.original_price && parseFloat(ad.original_price as string) > parseFloat(ad.price as string) && (
                              <span className="text-[10px] text-gray-400 line-through block">
                                {ad.original_price} {ad.currency}
                              </span>
                            )}
                            <span className="text-[10px] text-teal-600 font-semibold group-hover:underline">
                              {t("feed.details")} &rarr;
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Dropdown Footer Action */}
                <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      setIsLiveDropdownOpen(false);
                      handleSearchSubmit(e);
                    }}
                    className="text-xs font-bold text-[#002f34] hover:text-teal-700 transition-colors cursor-pointer py-1"
                  >
                    {t("feed.details")} &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Categories & Content Section */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-16 pb-28 md:pb-16 flex-1 w-full">
        <div className="text-center mb-10 sm:mb-14">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002f34] tracking-tight">
            {t("hero.categoriesTitle")}
          </h1>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            {t("feed.subtitle")}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-3 min-[420px]:grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-x-2.5 sm:gap-x-5 gap-y-6 sm:gap-y-11 justify-items-center">
          {categories.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || Sparkles;
            const colorClass = COLOR_STYLES[cat.color] || "bg-teal-100 text-teal-800";
            const isSelected = activeCategory === cat.slug;

            return (
              <button
                key={cat.id || cat.slug}
                onClick={() => setActiveCategory(isSelected ? null : cat.slug)}
                className="group flex flex-col items-center text-center cursor-pointer w-full max-w-[105px] sm:max-w-[130px] focus:outline-none transition-transform duration-300 ease-out active:scale-95 md:hover:-translate-y-2"
              >
                {/* Circle Icon Badge */}
                <div
                  className={`w-16 h-16 sm:w-22 sm:h-22 rounded-full flex items-center justify-center transition-all duration-300 ease-out transform md:group-hover:scale-115 md:group-hover:shadow-2xl md:group-hover:shadow-black/20 md:group-hover:ring-4 md:group-hover:ring-teal-400/50 md:group-hover:ring-offset-2 mb-2 sm:mb-3 shadow-xs ${colorClass} ${
                    isSelected ? "ring-4 ring-teal-600 ring-offset-2 scale-105 sm:scale-110 shadow-lg -translate-y-0.5 sm:-translate-y-1" : ""
                  }`}
                >
                  <IconComponent className="w-7 h-7 sm:w-10 sm:h-10 stroke-[2.2] transition-transform duration-300 ease-out md:group-hover:scale-115 md:group-hover:-rotate-6" />
                </div>

                {/* Category Label */}
                <span className="text-xs sm:text-[15px] font-bold text-[#002f34] leading-tight line-clamp-2 tracking-tight transition-all duration-300 md:group-hover:text-teal-700 md:group-hover:scale-105">
                  {getCategoryName(cat.slug, cat.name)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Indicator */}
        {activeCategory && (
          <div className="mt-6 sm:mt-8 flex items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-teal-50 border-2 border-teal-300 rounded-full text-xs sm:text-[15px] font-bold text-teal-900 shadow-sm hover:shadow-md transition-shadow">
              <span>{t("feed.activeFilter")} {categories.find((c) => c.slug === activeCategory) ? getCategoryName(activeCategory) : activeCategory}</span>
              <button
                onClick={() => setActiveCategory(null)}
                className="text-teal-700 hover:text-teal-950 ml-1 p-1 rounded-full hover:bg-teal-200 transition-colors cursor-pointer"
                title={t("feed.clearCategory")}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Recent & Featured Advertisements Section */}
        <section id="listings-section" className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-gray-100 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-[#002f34] tracking-tight">
                {activeCategory
                  ? `${getCategoryName(activeCategory)}`
                  : searchQuery.trim()
                  ? `${t("common.search")}: "${searchQuery}"`
                  : t("feed.title")}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {searchQuery.trim()
                  ? `${t("common.search")}: ${ads.length} ${location.trim() && !/entire country/i.test(location) ? ` (${location})` : ""}`
                  : t("feed.subtitle")}
              </p>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              {(searchQuery.trim() || (location.trim() && !/entire country/i.test(location))) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setLocation("");
                  }}
                  className="text-xs font-semibold text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors cursor-pointer active:scale-95"
                >
                  {t("feed.clearCategory")} ✕
                </button>
              )}

              <button
                onClick={handlePostAdClick}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3.5 py-2 rounded-lg transition-colors cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t("nav.postAd")}</span>
              </button>
            </div>
          </div>

          {/* Advertisements Grid */}
          {ads.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-gray-50/70 rounded-2xl border border-gray-200/60 max-w-lg mx-auto">
              <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-[#002f34]">{t("feed.noAdsTitle")}</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                {t("feed.noAdsDesc")}
              </p>
              <button
                onClick={handlePostAdClick}
                className="bg-[#002f34] hover:bg-[#003e45] text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                {t("nav.postAd")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
              {ads.map((ad) => {
                const cat = categories.find((c) => c.slug === ad.category_slug);
                const coverImg = ad.images && ad.images.length > 0 ? ad.images[0] : null;
                const isSaved = savedAdIds.includes(ad.id);

                return (
                  <div
                    key={ad.id}
                    onClick={() => setSelectedAd(ad)}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group relative cursor-pointer hover:border-teal-500/50 active:scale-[0.99]"
                  >
                    {/* Thumbnail Image */}
                    <div className="h-44 sm:h-48 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                      {coverImg ? (
                        <img
                          src={coverImg}
                          alt={ad.title}
                          className="w-full h-full object-cover md:group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                          <ImageIcon className="w-10 h-10 mb-1" />
                          <span className="text-xs">{t("adDetails.noPhoto")}</span>
                        </div>
                      )}

                      {/* Category Badge */}
                      {cat && (
                        <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-[#002f34]/90 backdrop-blur-xs text-white text-[11px] sm:text-[12px] font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-sm pointer-events-none">
                          {getCategoryName(cat.slug, cat.name)}
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
                        className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-2 sm:p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all hover:scale-110 active:scale-95 cursor-pointer z-20 min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title={isSaved ? t("saved.remove") : t("common.save")}
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            isSaved
                              ? "fill-rose-500 text-rose-500"
                              : "text-gray-400 hover:text-rose-500"
                          }`}
                        />
                      </button>

                      {/* Promo discount badge on photo */}
                      {ad.original_price && parseFloat(ad.original_price as string) > parseFloat(ad.price as string) && (
                        <span className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 bg-gradient-to-r from-rose-600 to-red-500 text-white text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-md shadow-md tracking-wider flex items-center gap-1 z-10">
                          <span>-{Math.round(((parseFloat(ad.original_price as string) - parseFloat(ad.price as string)) / parseFloat(ad.original_price as string)) * 100)}%</span>
                        </span>
                      )}
                    </div>

                    {/* Listing Content */}
                    <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-baseline gap-2 mb-1">
                          <div className={`text-lg sm:text-xl font-black tracking-tight ${ad.original_price && parseFloat(ad.original_price as string) > parseFloat(ad.price as string) ? "text-green-600" : "text-[#002f34]"}`}>
                            {parseFloat(ad.price as string) === 0 ? (
                              <span className="text-teal-600">{t("common.free")}</span>
                            ) : (
                              `${ad.price} ${ad.currency}`
                            )}
                          </div>
                          {ad.original_price && parseFloat(ad.original_price as string) > parseFloat(ad.price as string) && (
                            <span className="text-xs font-semibold text-gray-400 line-through">
                              {ad.original_price} {ad.currency}
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-[#002f34] text-sm sm:text-base line-clamp-1 group-hover:text-teal-600 transition-colors tracking-tight">
                          {ad.title}
                        </h3>

                        <p className="text-xs text-gray-600 line-clamp-2 mt-1 mb-2.5 sm:mb-3 font-normal leading-relaxed">
                          {ad.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                        <div className="flex items-center gap-1 truncate max-w-[65%]">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-teal-600" />
                          <span className="truncate">{ad.location}</span>
                        </div>
                        <span className="shrink-0 text-gray-400 text-[10px] sm:text-[11px]">
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

        {/* Mobile App & APK Download Section with English Q&A */}
        <section className="mt-20 pt-12 border-t border-gray-200">
          <div className="bg-gradient-to-br from-[#002f34] to-[#004a52] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            {/* Background glow decoration */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="max-w-3xl space-y-6 relative z-10">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="Deally Logo"
                  className="w-12 h-12 rounded-2xl shadow-md object-cover border border-teal-400/30"
                />
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold tracking-wide uppercase border border-teal-500/30">
                  <Smartphone className="w-4 h-4" />
                  <span>{t("apk.badge")}</span>
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {t("apk.title")}
              </h2>

              <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                {t("apk.subtitle")}
              </p>

              {/* Download Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="https://github.com/aucikkosmonaucik-boop/deallyhub/releases/latest/download/Deally.apk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-[#002f34] px-6 py-3.5 rounded-xl font-extrabold text-sm transition-all duration-300 ease-out shadow-lg hover:shadow-2xl hover:shadow-teal-400/40 hover:-translate-y-1 hover:scale-105 active:scale-95 active:translate-y-0 flex items-center gap-2.5 cursor-pointer"
                >
                  <Download className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-0.5" />
                  <span>{t("apk.downloadBtn")} (v1.0.0)</span>
                </a>

                <a
                  href="https://github.com/aucikkosmonaucik-boop/deallyhub/releases/latest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white/10 hover:bg-white/20 text-white px-5 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ease-out border border-white/20 hover:border-white/40 shadow-md hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1 hover:scale-105 active:scale-95 active:translate-y-0 flex items-center gap-2 cursor-pointer"
                >
                  <span>GitHub Release</span>
                  <ExternalLink className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-gray-300 group-hover:text-white" />
                </a>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>{t("apk.safeBadge")}</span>
                </span>
                <span>&bull;</span>
                <span>{t("apk.instantSync")}</span>
                <span>&bull;</span>
                <span>{t("apk.fastMobile")}</span>
              </div>
            </div>
          </div>

          {/* Installation Guide & Q&A */}
          <div className="mt-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-[#002f34] flex items-center justify-center gap-2">
                <HelpCircle className="w-6 h-6 text-teal-600" />
                <span>{t("faq.title")}</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {t("faq.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Q1 */}
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <h4 className="font-bold text-[#002f34] text-base mb-2">
                  {t("faq.q1")}
                </h4>
                <div className="text-xs text-gray-600 space-y-1.5 leading-relaxed">
                  <p><strong>{t("faq.q1_step1_label")}</strong> {t("faq.q1_step1_text")}</p>
                  <p><strong>{t("faq.q1_step2_label")}</strong> {t("faq.q1_step2_text")}</p>
                  <p><strong>{t("faq.q1_step3_label")}</strong> {t("faq.q1_step3_text")}</p>
                  <p><strong>{t("faq.q1_step4_label")}</strong> {t("faq.q1_step4_text")}</p>
                </div>
              </div>

              {/* Q2 */}
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <h4 className="font-bold text-[#002f34] text-base mb-2">
                  {t("faq.q2")}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {t("faq.a2")}
                </p>
              </div>

              {/* Q3 */}
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <h4 className="font-bold text-[#002f34] text-base mb-2">
                  {t("faq.q3")}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {t("faq.a3")}
                </p>
              </div>

              {/* Q4 */}
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <h4 className="font-bold text-[#002f34] text-base mb-2">
                  {t("faq.q4")}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {t("faq.a4")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-[#f2f4f5] text-gray-500 text-xs py-8 pb-28 md:pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-1.5">
          <p className="font-semibold text-[#002f34]">{t("footer.tagline")}</p>
          <p className="text-gray-400">Deallyhub Marketplace &copy; 2026 &bull; {t("footer.allRights")}</p>
        </div>
      </footer>

      {/* Native-feel Mobile Bottom Navigation Bar (Android & Mobile browsers) */}
      {!isAnyModalOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-1 flex items-center justify-around shadow-[0_-4px_25px_rgba(0,0,0,0.08)] pb-safe md:hidden select-none"
        >
          {/* Home */}
          <button
            type="button"
            onClick={() => {
              setActiveCategory(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex flex-col items-center justify-center py-1 px-3 text-[#002f34] hover:text-teal-700 active:scale-95 transition-all cursor-pointer"
          >
            <HomeIcon className="w-5 h-5 text-[#002f34]" />
            <span className="text-[10px] font-bold mt-0.5 tracking-tight">{t("nav.home", "Home")}</span>
          </button>

          {/* Search / Explore */}
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("listings-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
              else window.scrollTo({ top: 400, behavior: "smooth" });
            }}
            className="flex flex-col items-center justify-center py-1 px-3 text-[#002f34] hover:text-teal-700 active:scale-95 transition-all cursor-pointer"
          >
            <Search className="w-5 h-5 text-[#002f34]" />
            <span className="text-[10px] font-bold mt-0.5 tracking-tight">{t("common.search", "Search")}</span>
          </button>

          {/* Post Ad (Center Primary Floating Button) */}
          <button
            type="button"
            onClick={handlePostAdClick}
            className="-mt-5 w-12 h-12 rounded-full bg-[#002f34] hover:bg-teal-700 active:scale-90 text-white flex items-center justify-center shadow-lg border-4 border-white transition-all cursor-pointer"
            title={t("nav.postAd")}
          >
            <PlusCircle className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Saved Items */}
          <button
            type="button"
            onClick={handleOpenSaved}
            className="relative flex flex-col items-center justify-center py-1 px-3 text-[#002f34] hover:text-teal-700 active:scale-95 transition-all cursor-pointer"
          >
            <Heart className={`w-5 h-5 ${savedAdIds.length > 0 ? "text-rose-500 fill-rose-500" : "text-[#002f34]"}`} />
            <span className="text-[10px] font-bold mt-0.5 tracking-tight">{t("nav.saved", "Saved")}</span>
            {savedAdIds.length > 0 && (
              <span className="absolute top-0 right-1 min-w-[15px] h-[15px] bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 shadow-xs">
                {savedAdIds.length > 9 ? "9+" : savedAdIds.length}
              </span>
            )}
          </button>

          {/* Messages */}
          <button
            type="button"
            onClick={handleOpenMessages}
            className="relative flex flex-col items-center justify-center py-1 px-3 text-[#002f34] hover:text-teal-700 active:scale-95 transition-all cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 text-[#002f34]" />
            <span className="text-[10px] font-bold mt-0.5 tracking-tight">{t("nav.messages", "Messages")}</span>
          </button>
        </nav>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setAuthModalMode("login");
          setAuthResetToken("");
        }}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
        initialResetToken={authResetToken}
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
        onStartChat={handleStartChat}
      />

      {/* Messages (Buyer/Seller Chat) Modal */}
      <MessagesModal
        isOpen={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
        token={token}
        initialConversationId={activeConversationId}
      />

      {/* Notifications Modal (Dzwonek Powiadomień) */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        unreadCount={unreadNotificationsCount}
        onMarkAsRead={handleMarkNotificationRead}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
      />

      {/* Admin Panel Modal (Panel Administratora dla Właściciela Portalu) */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        token={token}
        onAdDeleted={fetchAds}
      />
    </div>
  );
}
