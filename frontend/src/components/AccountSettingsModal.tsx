"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  KeyRound,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ShieldAlert
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { containsProfanity } from "@/lib/contentFilter";

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  currentUser: UserProfile | null;
  onProfileUpdated: (user: UserProfile) => void;
  onAccountDeleted: () => void;
}

export default function AccountSettingsModal({
  isOpen,
  onClose,
  token,
  currentUser,
  onProfileUpdated,
  onAccountDeleted
}: AccountSettingsModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "danger">("profile");

  // Profile Form
  const [name, setName] = useState(currentUser?.name || "");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  // Danger Zone
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
    }
    setProfileSuccess(null);
    setProfileError(null);
    setPassSuccess(null);
    setPassError(null);
    setDeleteError(null);
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  // 1. Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Client-side profanity pre-check
    const nameCheck = containsProfanity(name.trim());
    if (nameCheck.hasProfanity) {
      setProfileError(t("errors.profanityName"));
      return;
    }

    setProfileError(null);
    setProfileSuccess(null);
    setUpdatingProfile(true);
    const apiUrl = getApiUrl();

    try {
      const res = await fetch(`${apiUrl}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const errStr = data.error || "";
        if (
          errStr.toLowerCase().includes("prohibited") ||
          errStr.toLowerCase().includes("offensive") ||
          errStr.toLowerCase().includes("niedozwolon") ||
          errStr.toLowerCase().includes("obrażliw")
        ) {
          throw new Error(t("errors.profanityName"));
        }
        throw new Error(errStr || "Failed to update profile.");
      }

      setProfileSuccess("Profile name updated successfully!");
      onProfileUpdated({ ...currentUser, name });
    } catch (err: unknown) {
      if (err instanceof Error) setProfileError(err.message);
      else setProfileError("An error occurred.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // 2. Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setPassError(null);
    setPassSuccess(null);

    if (newPassword.length < 6) {
      setPassError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("New password and confirmation do not match.");
      return;
    }

    setChangingPass(true);
    const apiUrl = getApiUrl();

    try {
      const res = await fetch(`${apiUrl}/api/auth/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to change password.");
      }

      setPassSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      if (err instanceof Error) setPassError(err.message);
      else setPassError("An error occurred.");
    } finally {
      setChangingPass(false);
    }
  };

  // 3. Handle Account Deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      setDeleteError('Please type "DELETE" into the box to confirm.');
      return;
    }

    setDeleting(true);
    setDeleteError(null);
    const apiUrl = getApiUrl();

    try {
      const res = await fetch(`${apiUrl}/api/auth/account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete account.");
      }

      alert("Your account has been deleted successfully.");
      onAccountDeleted();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) setDeleteError(err.message);
      else setDeleteError("Failed to delete account.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-gray-100 w-full max-w-xl h-full sm:h-auto max-h-[100dvh] sm:max-h-[90vh] flex flex-col overflow-hidden relative sm:my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#002f34]">{t("settings.title")}</h2>
            <p className="text-[11px] sm:text-xs text-gray-500">{t("settings.subtitle")}</p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#002f34] p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 px-4 sm:px-6 bg-gray-50/50 shrink-0">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-3 sm:py-3.5 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "profile"
                ? "border-[#002f34] text-[#002f34]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{t("settings.profileTab")}</span>
          </button>

          <button
            onClick={() => setActiveTab("password")}
            className={`py-3 sm:py-3.5 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "password"
                ? "border-[#002f34] text-[#002f34]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{t("settings.passwordTab")}</span>
          </button>

          <button
            onClick={() => setActiveTab("danger")}
            className={`py-3 sm:py-3.5 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "danger"
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-400 hover:text-red-500"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t("settings.dangerTab")}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* TAB 1: PROFILE */}
          {activeTab === "profile" && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {profileError && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {profileSuccess && (
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#002f34] uppercase tracking-wider">
                    {t("auth.emailLabel")}
                  </label>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{t("common.verified")}</span>
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002f34] uppercase tracking-wider mb-1.5">
                  {t("auth.nameLabel")}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#002f34] focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="w-full py-2.5 bg-[#002f34] hover:bg-[#003e45] text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {updatingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t("common.loading")}</span>
                    </>
                  ) : (
                    <span>{t("settings.saveProfile")}</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === "password" && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passError && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#002f34] uppercase tracking-wider mb-1.5">
                  {t("settings.currentPassword")}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t("settings.currentPassword")}
                    className="w-full pl-10 pr-11 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#002f34] focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002f34] uppercase tracking-wider mb-1.5">
                  {t("settings.newPassword")}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPass ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t("auth.passwordPlaceholder")}
                    className="w-full pl-10 pr-11 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#002f34] focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#002f34] uppercase tracking-wider mb-1.5">
                  {t("settings.confirmNewPassword")}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("settings.confirmNewPassword")}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#002f34] focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changingPass}
                  className="w-full py-2.5 bg-[#002f34] hover:bg-[#003e45] text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {changingPass ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t("common.loading")}</span>
                    </>
                  ) : (
                    <span>{t("settings.updatePassword")}</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: DANGER ZONE / DELETE ACCOUNT */}
          {activeTab === "danger" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs text-red-900 leading-relaxed">
                  <strong className="font-bold block mb-1">{t("settings.deleteAccount")}</strong>
                  {t("settings.deleteWarning")}
                </div>
              </div>

              {deleteError && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {t("settings.deleteConfirmText")}
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder='DELETE'
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold text-red-600 focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirmation !== "DELETE"}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t("common.loading")}</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>{t("settings.deleteBtn")}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
