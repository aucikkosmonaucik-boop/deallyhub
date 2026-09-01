"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  Loader2,
  Menu,
  ArrowUpDown,
  SlidersHorizontal,
  Layers,
  Tag
} from "lucide-react";
import AuthModal from "@/components/AuthModal";
import AdsManagerModal from "@/components/AdsManagerModal";
import SavedItemsModal from "@/components/SavedItemsModal";
import AccountSettingsModal from "@/components/AccountSettingsModal";
import AdDetailsModal from "@/components/AdDetailsModal";
import MessagesModal from "@/components/MessagesModal";
import NotificationsModal, { NotificationItem } from "@/components/NotificationsModal";
import AdminPanelModal from "@/components/AdminPanelModal";
import CategoryMegaMenu from "@/components/CategoryMegaMenu";
import LanguageSelector from "@/components/LanguageSelector";
import ThemeToggle from "@/components/ThemeToggle";
import LocationPicker from "@/components/LocationPicker";
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
  const [sortBy, setSortBy] = useState<"latest" | "price-asc" | "price-desc">("latest");

  // Category Mega Menu State (Allegro style)
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

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

  // Sorted advertisements
  const sortedAds = useMemo(() => {
    const list = [...ads];
    if (sortBy === "price-asc") {
      return list.sort((a, b) => (parseFloat(a.price as string) || 0) - (parseFloat(b.price as string) || 0));
    }
    if (sortBy === "price-desc") {
      return list.sort((a, b) => (parseFloat(b.price as string) || 0) - (parseFloat(a.price as string) || 0));
    }
    // Default: latest
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [ads, sortBy]);

  // Check if any modal is currently open to handle body lock and hide mobile bottom bar
  const isAnyModalOpen =
    isAuthOpen ||
    isAdsModalOpen ||
    isSavedModalOpen ||
    isSettingsModalOpen ||
    !!selectedAd ||
    isMessagesOpen ||
    isNotificationsOpen ||
    isAdminPanelOpen ||
    isMegaMenuOpen;

  // Live Search & Location Picker State
  const [liveSearchResults, setLiveSearchResults] = useState<Advertisement[]>([]);
  const [isLiveDropdownOpen, setIsLiveDropdownOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
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
      const isEntire = !location.trim() || /entire country|cała polska|cały kraj|wszystkie w całym kraju|tout le pays|todo el país|ganzes land|tutto il paese|ολόκληρη η χώρα/i.test(location.trim());
      if (!isEntire) {
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

  // Click Outside & Escape key to close live dropdown and location picker
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsLiveDropdownOpen(false);
        setIsLocationPickerOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLiveDropdownOpen(false);
        setIsLocationPickerOpen(false);
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
    const isEntire = !location.trim() || /entire country|cała polska|cały kraj|wszystkie w całym kraju|tout le pays|todo el país|ganzes land|tutto il paese|ολόκληρη η χώρα/i.test(location.trim());
    if (!isEntire) {
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
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0b1120] text-[#002f34] dark:text-slate-100 font-sans antialiased transition-colors duration-150">
      {/* Top Navbar */}
      <header className="border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40">
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
            <span className="text-xl sm:text-2xl font-black tracking-tight text-[#002f34] dark:text-white select-none">
              Deally<span className="text-teal-600 dark:text-teal-400">hub</span>
            </span>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 text-sm font-medium text-[#002f34] dark:text-slate-200 shrink-0">
            {/* Language Switcher */}
            <LanguageSelector />

            {/* Dark / Light Mode Toggle */}
            <ThemeToggle />

            {/* Messages Button (Desktop) */}
            <button
              onClick={handleOpenMessages}
              className="hidden md:flex items-center gap-1.5 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer rounded-lg py-1 px-2 hover:bg-gray-50 dark:hover:bg-slate-800"
              title={t("nav.messages")}
            >
              <MessageSquare className="w-4 h-4 text-[#002f34] dark:text-slate-200" />
              <span>{t("nav.messages")}</span>
            </button>

            {/* Saved Items Nav Button (Desktop) */}
            <button
              onClick={handleOpenSaved}
              className="hidden md:flex items-center gap-1.5 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer rounded-lg py-1 px-2 hover:bg-gray-50 dark:hover:bg-slate-800"
              title={t("nav.saved")}
            >
              <Heart className={`w-4 h-4 ${savedAdIds.length > 0 ? "text-rose-500 fill-rose-500" : ""}`} />
              <span>{t("nav.saved")}</span>
              {savedAdIds.length > 0 && (
                <span className="text-xs bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold px-1.5 py-0.2 rounded-full">
                  {savedAdIds.length}
                </span>
              )}
            </button>

            {/* Notification Bell Nav Button */}
            {currentUser && (
              <button
                onClick={() => setIsNotificationsOpen(true)}
                className="relative p-2 text-[#002f34] dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer active:scale-95"
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
                    className="flex items-center gap-1.5 sm:gap-2 hover:text-teal-600 dark:hover:text-teal-400 transition-colors bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 p-1 sm:px-3 sm:py-1.5 rounded-full border border-gray-200 dark:border-slate-700 cursor-pointer active:scale-95"
                    title={currentUser.name}
                  >
                    <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline max-w-[100px] md:max-w-[120px] truncate font-semibold">
                      {currentUser.name}
                    </span>
                    <ChevronDown className="w-3 h-3 text-gray-500 dark:text-slate-400 hidden sm:inline" />
                  </button>

                  {/* Logged-In User Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 dark:text-slate-400">{t("nav.signedInAs")}</p>
                          {(currentUser.role === "admin" || currentUser.email.startsWith("jannowak") || currentUser.email.startsWith("admin")) && (
                            <span className="bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 text-[10px] font-black uppercase px-1.5 py-0.5 rounded">
                              {t("nav.ownerAdmin")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-[#002f34] dark:text-white truncate">{currentUser.name}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-400 truncate">{currentUser.email}</p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setIsNotificationsOpen(true);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-[#002f34] dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Bell className="w-4 h-4 text-teal-600 dark:text-teal-400" />
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
                          className="w-full text-left px-4 py-2 text-sm text-[#002f34] dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                          <span>{t("nav.messages")}</span>
                        </button>
                        <button
                          onClick={handleOpenMyAds}
                          className="w-full text-left px-4 py-2 text-sm text-[#002f34] dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-gray-400 dark:text-slate-400" />
                          <span>{t("nav.myAdvertisements")}</span>
                        </button>
                        <button
                          onClick={handleOpenSaved}
                          className="w-full text-left px-4 py-2 text-sm text-[#002f34] dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                        >
                          <Heart className="w-4 h-4 text-rose-500" />
                          <span>{t("nav.savedItems")} ({savedAdIds.length})</span>
                        </button>
                        <button
                          onClick={handleOpenSettings}
                          className="w-full text-left px-4 py-2 text-sm text-[#002f34] dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                        >
                          <Settings className="w-4 h-4 text-gray-400 dark:text-slate-400" />
                          <span>{t("nav.accountSettings")}</span>
                        </button>

                        {/* Admin Portal Option for Deallyhub Owner */}
                        {(currentUser.role === "admin" || currentUser.email.startsWith("jannowak") || currentUser.email.startsWith("admin")) && (
                          <div className="pt-1 mt-1 border-t border-gray-100 dark:border-slate-800">
                            <button
                              onClick={() => {
                                setIsProfileMenuOpen(false);
                                setIsAdminPanelOpen(true);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm font-bold text-teal-900 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/50 flex items-center gap-2.5 cursor-pointer transition-colors"
                            >
                              <Shield className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                              <span>{t("nav.adminPortal")}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-gray-100 dark:border-slate-800 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-rose-400 hover:bg-red-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-medium cursor-pointer"
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
                  className="flex items-center gap-1.5 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer py-1.5 px-2 text-xs sm:text-sm font-semibold rounded-lg bg-gray-50 dark:bg-slate-800 sm:bg-transparent"
                >
                  <User className="w-4 h-4 text-[#002f34] dark:text-slate-200" />
                  <span>{t("nav.myProfile")}</span>
                </button>
              )}
            </div>

            {/* Post Ad Button (Desktop) */}
            <button
              onClick={handlePostAdClick}
              className="hidden sm:flex items-center gap-1.5 sm:gap-2 bg-[#002f34] hover:bg-[#003d44] dark:bg-teal-600 dark:hover:bg-teal-500 active:bg-[#001e22] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
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
      <section className="bg-[#f2f4f5] dark:bg-slate-900/60 py-6 sm:py-12 border-b border-gray-200 dark:border-slate-800 transition-colors">
        <div className="max-w-5xl mx-auto px-3 sm:px-6">
          <div ref={searchContainerRef} className="relative">
            <form
              onSubmit={(e) => {
                setIsLiveDropdownOpen(false);
                handleSearchSubmit(e);
              }}
              className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row items-stretch transition-colors"
            >
              {/* Search Input */}
              <div className="flex-1 flex items-center px-3.5 sm:px-4 py-3 sm:py-3.5 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700">
                <Search className="w-5 h-5 text-gray-400 dark:text-slate-400 mr-2.5 sm:mr-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => {
                    setIsLocationPickerOpen(false);
                    if (searchQuery.trim().length >= 1) setIsLiveDropdownOpen(true);
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("hero.searchPlaceholder")}
                  className="w-full text-base outline-none text-[#002f34] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 bg-transparent font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setIsLiveDropdownOpen(false);
                    }}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ml-1 text-xs shrink-0 cursor-pointer"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Location Input / Expandable Rectangular Trigger */}
              <div
                onClick={() => {
                  setIsLiveDropdownOpen(false);
                  setIsLocationPickerOpen((prev) => !prev);
                }}
                className="flex-1 flex items-center px-3.5 sm:px-4 py-3 sm:py-3.5 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700 cursor-pointer group hover:bg-teal-50/50 dark:hover:bg-slate-700/50 transition-all duration-150 select-none"
              >
                <MapPin
                  className={`w-5 h-5 mr-2.5 sm:mr-3 shrink-0 transition-all duration-150 ${
                    location ? "text-teal-600 dark:text-teal-400 scale-105" : "text-gray-400 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:scale-110"
                  }`}
                />
                <div className="w-full flex items-center justify-between min-w-0 pr-1">
                  <span
                    className={`text-sm sm:text-base font-bold truncate transition-colors ${
                      location ? "text-[#002f34] dark:text-slate-100" : "text-gray-500 dark:text-slate-400 group-hover:text-teal-950 dark:group-hover:text-teal-200"
                    }`}
                  >
                    {location || t("hero.locationPlaceholder")}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {location && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation("");
                        }}
                        className="p-1 rounded-full text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-200/80 dark:hover:bg-slate-700 transition-colors text-xs cursor-pointer"
                        aria-label="Clear location"
                      >
                        ✕
                      </button>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-transform duration-200 shrink-0 ${
                        isLocationPickerOpen ? "rotate-180 text-teal-600 dark:text-teal-400 scale-110" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="bg-[#002f34] dark:bg-teal-600 hover:bg-[#003e45] dark:hover:bg-teal-500 active:bg-[#001e22] text-white px-6 sm:px-8 py-3.5 sm:py-4 font-extrabold tracking-tight flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm sm:text-base active:scale-[0.99]"
              >
                <span>{t("hero.searchBtn")}</span>
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Expandable Rectangular Location Picker Panel */}
            {isLocationPickerOpen && (
              <LocationPicker
                value={location}
                isOpen={isLocationPickerOpen}
                onChange={(newLoc) => {
                  setLocation(newLoc);
                  setIsLocationPickerOpen(false);
                }}
                onClose={() => setIsLocationPickerOpen(false)}
              />
            )}

            {/* Live Search Autocomplete Tree Dropdown */}
            {isLiveDropdownOpen && searchQuery.trim().length >= 1 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden max-h-[60vh] sm:max-h-[460px] flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Dropdown Header */}
                <div className="px-4 py-2.5 bg-gray-50/90 dark:bg-slate-800/90 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#002f34] dark:text-slate-100">
                    <Search className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>{t("hero.liveResults")} ({liveSearchResults.length})</span>
                  </div>
                  {isLiveSearching && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-slate-400">
                      <Loader2 className="w-3 h-3 animate-spin text-teal-600 dark:text-teal-400" />
                      <span>{t("common.loading")}</span>
                    </div>
                  )}
                </div>

                {/* Dropdown Cards List */}
                <div className="overflow-y-auto divide-y divide-gray-100 dark:divide-slate-700/60 flex-1">
                  {liveSearchResults.length === 0 && !isLiveSearching ? (
                    <div className="py-8 text-center px-4">
                      <p className="text-sm font-semibold text-[#002f34] dark:text-slate-200">{t("feed.noAdsTitle")}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">
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
                          className="p-3 hover:bg-teal-50/70 dark:hover:bg-slate-700/60 transition-colors flex items-center gap-3.5 cursor-pointer group"
                        >
                          {/* Card Thumbnail */}
                          <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-slate-700 overflow-hidden shrink-0 border border-gray-200 dark:border-slate-600 flex items-center justify-center">
                            {cover ? (
                              <img src={cover} alt={ad.title} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-gray-400 dark:text-slate-400" />
                            )}
                          </div>

                          {/* Title & Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-[#002f34] dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors truncate">
                              {ad.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-slate-400">
                              {cat && (
                                <span className="bg-gray-100 dark:bg-slate-700 text-[#002f34] dark:text-slate-200 text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                                  {getCategoryName(cat.slug, cat.name)}
                                </span>
                              )}
                              <span className="flex items-center gap-0.5 text-[11px] text-gray-400 dark:text-slate-400 truncate">
                                <MapPin className="w-3 h-3" />
                                <span>{ad.location}</span>
                              </span>
                            </div>
                          </div>

                          {/* Price & Action */}
                          <div className="text-right shrink-0">
                            <div className={`text-sm font-extrabold ${ad.original_price && parseFloat(ad.original_price as string) > parseFloat(ad.price as string) ? "text-green-600 dark:text-green-400" : "text-[#002f34] dark:text-teal-300"}`}>
                              {isFree ? (
                                <span className="text-teal-600 dark:text-teal-400">{t("common.free")}</span>
                              ) : (
                                `${ad.price} ${ad.currency}`
                              )}
                            </div>
                            {ad.original_price && parseFloat(ad.original_price as string) > parseFloat(ad.price as string) && (
                              <span className="text-[10px] text-gray-400 dark:text-slate-500 line-through block">
                                {ad.original_price} {ad.currency}
                              </span>
                            )}
                            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold group-hover:underline">
                              {t("feed.details")} &rarr;
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Dropdown Footer Action */}
                <div className="p-2.5 bg-gray-50 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 text-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      setIsLiveDropdownOpen(false);
                      handleSearchSubmit(e);
                    }}
                    className="text-xs font-bold text-[#002f34] dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer py-1"
                  >
                    {t("feed.details")} &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Category Button under Search Bar (Allegro style) */}
            <div className="mt-3.5 sm:mt-5 flex items-center select-none">
              <button
                type="button"
                onClick={() => setIsMegaMenuOpen((prev) => !prev)}
                className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 shrink-0 cursor-pointer shadow-xs active:scale-95 tracking-tight ${
                  isMegaMenuOpen || activeCategory
                    ? "bg-teal-600 text-white shadow-teal-700/20 ring-2 ring-teal-500 ring-offset-1"
                    : "bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-teal-950 dark:hover:text-teal-300 hover:border-teal-400"
                }`}
              >
                <Menu className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {activeCategory
                    ? `${t("nav.categories", "Kategorie")}: ${getCategoryName(activeCategory)}`
                    : t("nav.categories", "Kategorie")}
                </span>
                <ChevronDown className={`w-4 h-4 stroke-[2.5] transition-transform duration-200 ${isMegaMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {activeCategory && (
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className="ml-2.5 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 transition-colors cursor-pointer active:scale-95"
                  title={t("feed.clearCategory", "Wyczyść filtry")}
                >
                  <span className="font-black">✕</span>
                  <span className="hidden sm:inline">{t("feed.clearCategory", "Wyczyść")}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category Mega Menu Overlay Modal */}
      <CategoryMegaMenu
        isOpen={isMegaMenuOpen}
        onClose={() => setIsMegaMenuOpen(false)}
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={(slug, query) => {
          setActiveCategory(slug);
          if (query) {
            setSearchQuery(query);
          }
          setIsMegaMenuOpen(false);
          const el = document.getElementById("listings-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
        getCategoryName={getCategoryName}
        language={language}
        t={t}
      />

      {/* Main Content Section - Classified Ads Prominently Visible on Homepage */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 pb-28 md:pb-16 flex-1 w-full">
        {/* Advertisements Feed */}
        <section id="listings-section" className="scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-gray-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#002f34] dark:text-white tracking-tight">
                  {activeCategory
                    ? getCategoryName(activeCategory)
                    : searchQuery.trim()
                    ? `${t("common.search")}: "${searchQuery}"`
                    : t("feed.title", "Najnowsze Ogłoszenia")}
                </h1>
                <span className="text-xs bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/80 font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                  {sortedAds.length} {t("feed.resultsFound", "ogłoszeń")}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                {activeCategory || searchQuery.trim() || (location.trim() && !/entire country|cała polska|cały kraj/i.test(location))
                  ? `${t("feed.activeFilters", "Aktywne filtry:")} ${[
                      activeCategory ? `${t("feed.activeFilter", "Kategoria:")} ${getCategoryName(activeCategory)}` : null,
                      location && !/entire country|cała polska|cały kraj/i.test(location) ? `${t("common.location", "Lokalizacja:")} ${location}` : null,
                      searchQuery.trim() ? `"${searchQuery}"` : null
                    ].filter(Boolean).join(" • ")}`
                  : t("feed.subtitle", "Odkryj oferty z Twojej okolicy i z całej Polski")}
              </p>
            </div>

            {/* Sorting & Filter Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Sort Selector */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                <span className="text-gray-400 dark:text-slate-400 pl-2 pr-1 hidden sm:inline-flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>{t("feed.sortBy", "Sortuj")}:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSortBy("latest")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    sortBy === "latest"
                      ? "bg-white dark:bg-slate-700 text-[#002f34] dark:text-white font-bold shadow-xs"
                      : "text-gray-600 dark:text-slate-400 hover:text-[#002f34] dark:hover:text-white"
                  }`}
                >
                  {t("feed.sortLatest", "Najnowsze")}
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("price-asc")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    sortBy === "price-asc"
                      ? "bg-white dark:bg-slate-700 text-[#002f34] dark:text-white font-bold shadow-xs"
                      : "text-gray-600 dark:text-slate-400 hover:text-[#002f34] dark:hover:text-white"
                  }`}
                >
                  {t("feed.sortPriceAsc", "Cena: rosnąco")}
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("price-desc")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    sortBy === "price-desc"
                      ? "bg-white dark:bg-slate-700 text-[#002f34] dark:text-white font-bold shadow-xs"
                      : "text-gray-600 dark:text-slate-400 hover:text-[#002f34] dark:hover:text-white"
                  }`}
                >
                  {t("feed.sortPriceDesc", "Cena: malejąco")}
                </button>
              </div>

              {/* Clear Filters button */}
              {(activeCategory || searchQuery.trim() || (location.trim() && !/entire country|cała polska|cały kraj/i.test(location))) && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory(null);
                    setSearchQuery("");
                    setLocation("");
                  }}
                  className="text-xs font-bold text-rose-700 dark:text-rose-300 hover:text-rose-900 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/80 dark:border-rose-800/80 px-3 py-1.5 rounded-xl transition-colors cursor-pointer active:scale-95"
                >
                  {t("feed.clearCategory", "Wyczyść filtry")} ✕
                </button>
              )}

              {/* Post Ad Button */}
              <button
                type="button"
                onClick={handlePostAdClick}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 hover:text-teal-900 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200/80 dark:border-teal-800/80 px-3 py-1.5 rounded-xl transition-colors cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t("nav.postAd", "Dodaj ogłoszenie")}</span>
              </button>
            </div>
          </div>

          {/* Advertisements Grid */}
          {sortedAds.length === 0 ? (
            <div className="p-8 sm:p-14 text-center bg-gray-50/70 dark:bg-slate-800/50 rounded-2xl border border-gray-200/60 dark:border-slate-700 max-w-lg mx-auto my-6">
              <ImageIcon className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#002f34] dark:text-white">{t("feed.noAdsTitle")}</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 mb-5 leading-relaxed">
                {t("feed.noAdsDesc")}
              </p>
              <button
                type="button"
                onClick={handlePostAdClick}
                className="bg-[#002f34] dark:bg-teal-600 hover:bg-[#003e45] dark:hover:bg-teal-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                {t("nav.postAd")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
              {sortedAds.map((ad) => {
                const cat = categories.find((c) => c.slug === ad.category_slug);
                const coverImg = ad.images && ad.images.length > 0 ? ad.images[0] : null;
                const isSaved = savedAdIds.includes(ad.id);

                return (
                  <div
                    key={ad.id}
                    onClick={() => setSelectedAd(ad)}
                    className="bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group relative cursor-pointer hover:border-teal-500/50 dark:hover:border-teal-400 active:scale-[0.99]"
                  >
                    {/* Thumbnail Image */}
                    <div className="h-44 sm:h-48 bg-gray-100 dark:bg-slate-700 relative overflow-hidden flex items-center justify-center">
                      {coverImg ? (
                        <img
                          src={coverImg}
                          alt={ad.title}
                          className="w-full h-full object-cover md:group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-gray-400 dark:text-slate-400 flex flex-col items-center">
                          <ImageIcon className="w-10 h-10 mb-1" />
                          <span className="text-xs">{t("adDetails.noPhoto")}</span>
                        </div>
                      )}

                      {/* Category Badge */}
                      {cat && (
                        <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-[#002f34]/90 dark:bg-slate-900/90 backdrop-blur-xs text-white text-[11px] sm:text-[12px] font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-sm pointer-events-none">
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
                        className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-2 sm:p-2 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all hover:scale-110 active:scale-95 cursor-pointer z-20 min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title={isSaved ? t("saved.remove") : t("common.save")}
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            isSaved
                              ? "fill-rose-500 text-rose-500"
                              : "text-gray-400 dark:text-slate-400 hover:text-rose-500"
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
                          <div className={`text-lg sm:text-xl font-black tracking-tight ${ad.original_price && parseFloat(ad.original_price as string) > parseFloat(ad.price as string) ? "text-green-600 dark:text-green-400" : "text-[#002f34] dark:text-teal-300"}`}>
                            {parseFloat(ad.price as string) === 0 ? (
                              <span className="text-teal-600 dark:text-teal-400">{t("common.free")}</span>
                            ) : (
                              `${ad.price} ${ad.currency}`
                            )}
                          </div>
                          {ad.original_price && parseFloat(ad.original_price as string) > parseFloat(ad.price as string) && (
                            <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 line-through">
                              {ad.original_price} {ad.currency}
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-[#002f34] dark:text-slate-100 text-sm sm:text-base line-clamp-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors tracking-tight">
                          {ad.title}
                        </h3>

                        <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2 mt-1 mb-2.5 sm:mb-3 font-normal leading-relaxed">
                          {ad.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-100 dark:border-slate-700/80 flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400 font-medium">
                        <div className="flex items-center gap-1 truncate max-w-[65%]">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-teal-600 dark:text-teal-400" />
                          <span className="truncate">{ad.location}</span>
                        </div>
                        <span className="shrink-0 text-gray-400 dark:text-slate-500 text-[10px] sm:text-[11px]">
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
        <section className="mt-20 pt-12 border-t border-gray-200 dark:border-slate-800">
          <div className="bg-gradient-to-br from-[#002f34] to-[#004a52] dark:from-slate-900 dark:to-slate-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden border dark:border-slate-800">
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
              <h3 className="text-2xl font-bold text-[#002f34] dark:text-white flex items-center justify-center gap-2">
                <HelpCircle className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                <span>{t("faq.title")}</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                {t("faq.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Q1 */}
              <div className="p-6 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-200 dark:border-slate-700">
                <h4 className="font-bold text-[#002f34] dark:text-slate-100 text-base mb-2">
                  {t("faq.q1")}
                </h4>
                <div className="text-xs text-gray-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                  <p><strong>{t("faq.q1_step1_label")}</strong> {t("faq.q1_step1_text")}</p>
                  <p><strong>{t("faq.q1_step2_label")}</strong> {t("faq.q1_step2_text")}</p>
                  <p><strong>{t("faq.q1_step3_label")}</strong> {t("faq.q1_step3_text")}</p>
                  <p><strong>{t("faq.q1_step4_label")}</strong> {t("faq.q1_step4_text")}</p>
                </div>
              </div>

              {/* Q2 */}
              <div className="p-6 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-200 dark:border-slate-700">
                <h4 className="font-bold text-[#002f34] dark:text-slate-100 text-base mb-2">
                  {t("faq.q2")}
                </h4>
                <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                  {t("faq.a2")}
                </p>
              </div>

              {/* Q3 */}
              <div className="p-6 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-200 dark:border-slate-700">
                <h4 className="font-bold text-[#002f34] dark:text-slate-100 text-base mb-2">
                  {t("faq.q3")}
                </h4>
                <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                  {t("faq.a3")}
                </p>
              </div>

              {/* Q4 */}
              <div className="p-6 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-200 dark:border-slate-700">
                <h4 className="font-bold text-[#002f34] dark:text-slate-100 text-base mb-2">
                  {t("faq.q4")}
                </h4>
                <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                  {t("faq.a4")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-slate-800 bg-[#f2f4f5] dark:bg-slate-950 text-gray-500 dark:text-slate-400 text-xs py-8 pb-28 md:pb-8 mt-auto transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-1.5">
          <p className="font-semibold text-[#002f34] dark:text-slate-200">{t("footer.tagline")}</p>
          <p className="text-gray-400 dark:text-slate-500">Deallyhub Marketplace &copy; 2026 &bull; {t("footer.allRights")}</p>
        </div>
      </footer>

      {/* Native-feel Mobile Bottom Navigation Bar (Android & Mobile browsers) */}
      {!isAnyModalOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 px-2 py-1 flex items-center justify-around shadow-[0_-4px_25px_rgba(0,0,0,0.08)] pb-safe md:hidden select-none transition-colors"
        >
          {/* Home */}
          <button
            type="button"
            onClick={() => {
              setActiveCategory(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex flex-col items-center justify-center py-1 px-3 text-[#002f34] dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 active:scale-95 transition-all cursor-pointer"
          >
            <HomeIcon className="w-5 h-5 text-[#002f34] dark:text-slate-200" />
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
            className="flex flex-col items-center justify-center py-1 px-3 text-[#002f34] dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 active:scale-95 transition-all cursor-pointer"
          >
            <Search className="w-5 h-5 text-[#002f34] dark:text-slate-200" />
            <span className="text-[10px] font-bold mt-0.5 tracking-tight">{t("common.search", "Search")}</span>
          </button>

          {/* Post Ad (Center Primary Floating Button) */}
          <button
            type="button"
            onClick={handlePostAdClick}
            className="-mt-5 w-12 h-12 rounded-full bg-[#002f34] dark:bg-teal-600 hover:bg-teal-700 dark:hover:bg-teal-500 active:scale-90 text-white flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-900 transition-all cursor-pointer"
            title={t("nav.postAd")}
          >
            <PlusCircle className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Saved Items */}
          <button
            type="button"
            onClick={handleOpenSaved}
            className="relative flex flex-col items-center justify-center py-1 px-3 text-[#002f34] dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 active:scale-95 transition-all cursor-pointer"
          >
            <Heart className={`w-5 h-5 ${savedAdIds.length > 0 ? "text-rose-500 fill-rose-500" : "text-[#002f34] dark:text-slate-200"}`} />
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
            className="relative flex flex-col items-center justify-center py-1 px-3 text-[#002f34] dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 active:scale-95 transition-all cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 text-[#002f34] dark:text-slate-200" />
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
        onSelectAd={(ad) => setSelectedAd(ad)}
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
        onSelectAd={(ad) => setSelectedAd(ad)}
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
