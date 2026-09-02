"use client";

import React, { useState, useEffect } from "react";
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowLeft, Send } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { containsProfanity } from "@/lib/contentFilter";

export type AuthMode = "login" | "register" | "forgot" | "reset" | "verify_notice";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: { id: number; name: string; email: string }, token: string) => void;
  initialMode?: AuthMode;
  initialResetToken?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = "login",
  initialResetToken = ""
}: AuthModalProps) {
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState(initialResetToken);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [registeredUser, setRegisteredUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [userToken, setUserToken] = useState<string>("");
  const [isUnverified, setIsUnverified] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      if (initialResetToken) {
        setResetToken(initialResetToken);
        setMode("reset");
      }
      setError(null);
      setSuccessMsg(null);
      setIsUnverified(false);
    }
  }, [isOpen, initialMode, initialResetToken]);

  const GOOGLE_CLIENT_ID = "1073600566504-rmbe5e4na60o18ehark84qv74d2v57ku.apps.googleusercontent.com";

  const handleGoogleLogin = () => {
    setLoading(true);
    setError(null);

    const onTokenReceived = async (accessToken: string) => {
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Google authentication failed.");
        }
        onAuthSuccess(data.user, data.token);
        onClose();
      } catch (err: any) {
        setError(err.message || "Failed to sign in with Google.");
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== "undefined" && (window as any).google?.accounts?.oauth2) {
      try {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "email profile openid",
          callback: (response: any) => {
            if (response?.access_token) {
              onTokenReceived(response.access_token);
            } else if (response?.error) {
              setLoading(false);
              if (response.error !== "access_denied") {
                setError(response.error_description || "Google sign-in was cancelled or failed.");
              }
            } else {
              setLoading(false);
            }
          },
          error_callback: (err: any) => {
            setLoading(false);
            if (err?.type !== "popup_closed") {
              setError("Google sign-in popup was closed or blocked.");
            }
          },
        });
        client.requestAccessToken();
        return;
      } catch (err) {
        console.warn("initTokenClient failed, using popup fallback:", err);
      }
    }

    // Direct OAuth popup fallback
    const redirectUri = encodeURIComponent(window.location.origin);
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token&scope=email%20profile%20openid`;
    window.open(googleAuthUrl, "_blank", "width=600,height=700");
    setLoading(false);
  };

  const FB_APP_ID = "1983054212398881";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const initFB = () => {
      if ((window as any).FB) {
        try {
          (window as any).FB.init({
            appId: FB_APP_ID,
            cookie: true,
            xfbml: true,
            version: "v19.0"
          });
        } catch (_) {}
      }
    };
    initFB();
    const timer = setTimeout(initFB, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleFacebookLogin = () => {
    setLoading(true);
    setError(null);

    const onTokenReceived = async (accessToken: string) => {
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/api/auth/facebook`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Facebook authentication failed.");
        }
        onAuthSuccess(data.user, data.token);
        onClose();
      } catch (err: any) {
        setError(err.message || "Failed to authenticate with Facebook.");
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== "undefined" && (window as any).FB) {
      try {
        (window as any).FB.login((response: any) => {
          if (response?.authResponse?.accessToken) {
            onTokenReceived(response.authResponse.accessToken);
          } else {
            setLoading(false);
          }
        }, { scope: "email,public_profile" });
        return;
      } catch (_) {}
    }

    // Direct OAuth popup fallback
    const redirectUri = encodeURIComponent(window.location.origin + "/");
    const fbUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${redirectUri}&scope=email,public_profile&response_type=token`;
    window.open(fbUrl, "_blank", "width=600,height=700");
    setLoading(false);
  };

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsUnverified(false);
    setLoading(true);

    const apiUrl = getApiUrl();

    try {
      if (mode === "login" || mode === "register") {
        if (mode === "register") {
          const nameCheck = containsProfanity(name.trim());
          if (nameCheck.hasProfanity) {
            throw new Error(t("errors.profanityName"));
          }
        }

        const endpoint = mode === "login" ? `${apiUrl}/api/auth/login` : `${apiUrl}/api/auth/register`;
        const payload = mode === "login" ? { email, password } : { name, email, password };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          if (data.requiresVerification) {
            setIsUnverified(true);
            setRegisteredUser({ id: 0, name: "", email });
          }
          throw new Error(data.error || "Authentication failed.");
        }

        if (mode === "register" && data.requiresVerification) {
          setRegisteredUser(data.user);
          setUserToken("");
          setMode("verify_notice");
          return;
        }

        onAuthSuccess(data.user, data.token);
        onClose();
      } else if (mode === "forgot") {
        const res = await fetch(`${apiUrl}/api/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to process password reset request.");
        }

        setSuccessMsg("If an account exists with this email, a password reset link has been sent! Check your inbox.");
      } else if (mode === "reset") {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        const res = await fetch(`${apiUrl}/api/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: resetToken, newPassword: password })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to reset password. Link may be expired.");
        }

        setSuccessMsg("Your password has been successfully reset! You can now log in.");
        setTimeout(() => {
          setMode("login");
          setPassword("");
          setConfirmPassword("");
          setSuccessMsg(null);
        }, 2000);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    setError(null);
    setSuccessMsg(null);
    const apiUrl = getApiUrl();

    try {
      const targetEmail = registeredUser?.email || email;
      const res = await fetch(`${apiUrl}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to resend verification email.");
      }
      setSuccessMsg("Verification link sent! Check your email inbox and spam folder.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Could not resend email.");
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 w-full max-w-md overflow-hidden relative my-auto max-h-[92dvh] sm:max-h-[90vh] flex flex-col text-[#002f34] dark:text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-[#002f34] dark:hover:text-white p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Mode: Verify Notice (Shown right after registration) */}
        {mode === "verify_notice" ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 mb-4 ring-8 ring-teal-50/50 dark:ring-teal-950/30">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#002f34] dark:text-white">{t("auth.verifyTitle")}</h2>
            <p className="text-sm text-gray-600 dark:text-slate-300 mt-2 leading-relaxed">
              {t("auth.verifyNotice")}{" "}
              <strong className="text-[#002f34] dark:text-teal-300">{registeredUser?.email || email}</strong>.
            </p>

            {successMsg && (
              <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs text-left">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600 dark:text-teal-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full py-2.5 px-4 border border-gray-300 dark:border-slate-700 hover:border-teal-600 dark:hover:border-teal-500 text-[#002f34] dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
              >
                {resending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600 dark:text-teal-400" />
                ) : (
                  <Send className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                )}
                <span>{t("auth.resendVerification")}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="w-full py-3 px-4 bg-[#002f34] dark:bg-teal-600 hover:bg-[#003e45] dark:hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer text-sm"
              >
                {t("auth.signInBtn")}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div className="p-6 pb-2 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 mb-3">
                {mode === "forgot" || mode === "reset" ? <Lock className="w-6 h-6" /> : <User className="w-6 h-6" />}
              </div>
              <h2 className="text-2xl font-extrabold text-[#002f34] dark:text-white">
                {mode === "login" && t("auth.loginTitle")}
                {mode === "register" && t("auth.registerTitle")}
                {mode === "forgot" && t("auth.forgotTitle")}
                {mode === "reset" && t("auth.resetTitle")}
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                {mode === "login" && t("auth.loginSubtitle")}
                {mode === "register" && t("auth.registerSubtitle")}
                {mode === "forgot" && t("auth.forgotSubtitle")}
                {mode === "reset" && t("auth.resetSubtitle")}
              </p>
            </div>

            {/* Mode Switcher Tabs (Only for login & register) */}
            {(mode === "login" || mode === "register") && (
              <div className="flex border-b border-gray-200 dark:border-slate-800 mx-6 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors cursor-pointer ${
                    mode === "login"
                      ? "border-[#002f34] dark:border-teal-400 text-[#002f34] dark:text-teal-400 font-bold"
                      : "border-transparent text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                  }`}
                >
                  {t("auth.signInBtn")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors cursor-pointer ${
                    mode === "register"
                      ? "border-[#002f34] dark:border-teal-400 text-[#002f34] dark:text-teal-400 font-bold"
                      : "border-transparent text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                  }`}
                >
                  {t("auth.registerBtn")}
                </button>
              </div>
            )}

            {/* Back button for Forgot/Reset */}
            {(mode === "forgot" || mode === "reset") && (
              <div className="px-6 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-[#002f34] dark:hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t("common.back")}</span>
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="p-5 sm:p-6 space-y-3.5 overflow-y-auto">
              {/* Error Message */}
              {error && (
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="flex-1">{error}</span>
                  </div>
                  {isUnverified && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resending}
                      className="w-full py-2.5 px-3 text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{resending ? t("common.loading") : `${t("auth.resendTo")} ${email}`}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Success Message */}
              {successMsg && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-sm">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-teal-600 dark:text-teal-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Name Field (Register mode only) */}
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-[#002f34] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    {t("auth.nameLabel")}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("auth.namePlaceholder")}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-[#002f34] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Field (Login, Register, Forgot) */}
              {mode !== "reset" && (
                <div>
                  <label className="block text-xs font-semibold text-[#002f34] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    {t("auth.emailLabel")}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("auth.emailPlaceholder")}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-[#002f34] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Reset Token (Hidden when provided from email link) */}
              {mode === "reset" && (
                resetToken ? (
                  <input type="hidden" value={resetToken} />
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-[#002f34] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                      {t("auth.securityToken")}
                    </label>
                    <input
                      type="text"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder={t("auth.pasteToken")}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-[#002f34] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    />
                  </div>
                )
              )}

              {/* Password Field (Login, Register, Reset) */}
              {mode !== "forgot" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#002f34] dark:text-slate-200 uppercase tracking-wider">
                      {mode === "reset" ? t("auth.resetTitle") : t("auth.passwordLabel")}
                    </label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setError(null);
                          setSuccessMsg(null);
                        }}
                        className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 hover:underline cursor-pointer"
                      >
                        {t("auth.forgotPasswordLink")}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("auth.passwordPlaceholder")}
                      className="w-full pl-10 pr-11 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-[#002f34] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password (Reset mode) */}
              {mode === "reset" && (
                <div>
                  <label className="block text-xs font-semibold text-[#002f34] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    {t("auth.confirmPasswordLabel")}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t("auth.confirmPasswordPlaceholder")}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-[#002f34] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#002f34] dark:bg-teal-600 hover:bg-[#003e45] dark:hover:bg-teal-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t("common.loading")}</span>
                  </>
                ) : (
                  <span>
                    {mode === "login" && t("auth.signInBtn")}
                    {mode === "register" && t("auth.registerBtn")}
                    {mode === "forgot" && t("auth.sendResetLink")}
                    {mode === "reset" && t("auth.updatePasswordBtn")}
                  </span>
                )}
              </button>

              {/* Footer Switcher */}
              <div className="text-center pt-2">
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {mode === "login" && (
                    <>
                      {t("auth.noAccount")}{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("register");
                          setError(null);
                          setSuccessMsg(null);
                        }}
                        className="font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                      >
                        {t("auth.signUpLink")}
                      </button>
                    </>
                  )}
                  {mode === "register" && (
                    <>
                      {t("auth.haveAccount")}{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("login");
                          setError(null);
                          setSuccessMsg(null);
                        }}
                        className="font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                      >
                        {t("auth.signInLink")}
                      </button>
                    </>
                  )}
                </p>
              </div>

              {/* Social Logins (Google & Facebook) below "Don't have an account yet? Register here" */}
              {(mode === "login" || mode === "register") && (
                <div className="pt-3 flex flex-col items-center gap-2.5">
                  <div className="relative w-full my-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-slate-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-slate-900 px-3 text-gray-400 dark:text-slate-500 font-semibold tracking-wider text-[11px]">
                        {t("auth.orContinueWith")}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full max-w-[320px] h-[40px] px-4 rounded-[4px] bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/60 text-[#3c4043] dark:text-slate-100 text-[13px] font-semibold flex items-center justify-center gap-2.5 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>{mode === "register" ? t("auth.googleRegister") : t("auth.googleLogin")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFacebookLogin}
                    disabled={loading}
                    className="w-full max-w-[320px] h-[40px] px-4 rounded-[4px] bg-[#1877F2] hover:bg-[#166fe5] text-white text-[13px] font-semibold flex items-center justify-center gap-2.5 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>{mode === "register" ? t("auth.facebookRegister") : t("auth.facebookLogin")}</span>
                  </button>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
