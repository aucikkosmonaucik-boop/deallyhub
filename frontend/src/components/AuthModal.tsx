"use client";

import React, { useState, useEffect } from "react";
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowLeft, Send } from "lucide-react";
import { getApiUrl } from "@/lib/api";

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

  const handleGoogleCallback = async (response: any) => {
    if (!response?.credential) return;
    setLoading(true);
    setError(null);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
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

  useEffect(() => {
    if (!isOpen || (mode !== "login" && mode !== "register")) return;

    const initGoogle = () => {
      if (typeof window === "undefined" || !(window as any).google?.accounts?.id) return;
      try {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        });

        const container = document.getElementById("google-signin-btn-container");
        if (container) {
          container.innerHTML = "";
          (window as any).google.accounts.id.renderButton(container, {
            theme: "outline",
            size: "large",
            width: 320,
            text: mode === "register" ? "signup_with" : "signin_with",
            shape: "rectangular",
            logo_alignment: "left",
            locale: "en"
          });
        }
      } catch (err) {
        console.warn("Failed to initialize Google Sign-In:", err);
      }
    };

    initGoogle();
    const timer = setTimeout(initGoogle, 500);
    return () => clearTimeout(timer);
  }, [isOpen, mode]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-[#002f34] p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Mode: Verify Notice (Shown right after registration) */}
        {mode === "verify_notice" ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 text-teal-600 mb-4 ring-8 ring-teal-50/50">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#002f34]">Check your inbox!</h2>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              We have sent a verification link in Deallyhub style to{" "}
              <strong className="text-[#002f34]">{registeredUser?.email || email}</strong>.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Click the link in your email to verify and activate your advertiser account.
            </p>

            {successMsg && (
              <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs text-left">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full py-2.5 px-4 border border-gray-300 hover:border-teal-600 text-[#002f34] hover:text-teal-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
              >
                {resending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                ) : (
                  <Send className="w-4 h-4 text-teal-600" />
                )}
                <span>Resend verification email</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setSuccessMsg("Please click the verification link in your email before logging in.");
                }}
                className="w-full py-3 px-4 bg-[#002f34] hover:bg-[#003e45] text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer text-sm"
              >
                Go to Sign In
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div className="p-6 pb-2 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-50 text-teal-600 mb-3">
                {mode === "forgot" || mode === "reset" ? <Lock className="w-6 h-6" /> : <User className="w-6 h-6" />}
              </div>
              <h2 className="text-2xl font-extrabold text-[#002f34]">
                {mode === "login" && "Welcome back"}
                {mode === "register" && "Create your account"}
                {mode === "forgot" && "Reset your password"}
                {mode === "reset" && "Choose new password"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {mode === "login" && "Sign in to manage your advertisements and favorites"}
                {mode === "register" && "Join Deallyhub and start buying and selling locally"}
                {mode === "forgot" && "Enter your email address and we will send you a reset link"}
                {mode === "reset" && "Enter your new password below"}
              </p>
            </div>

            {/* Mode Switcher Tabs (Only for login & register) */}
            {(mode === "login" || mode === "register") && (
              <div className="flex border-b border-gray-200 mx-6 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors cursor-pointer ${
                    mode === "login"
                      ? "border-[#002f34] text-[#002f34]"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Sign In
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
                      ? "border-[#002f34] text-[#002f34]"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Create Account
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
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#002f34] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
              {/* Error Message */}
              {error && (
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="flex-1">{error}</span>
                  </div>
                  {isUnverified && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resending}
                      className="w-full py-2.5 px-3 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{resending ? "Sending link..." : `Resend verification link to ${email}`}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Success Message */}
              {successMsg && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-sm">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-teal-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Name Field (Register mode only) */}
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-[#002f34] uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Konrad Kowalski"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#002f34] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Field (Login, Register, Forgot) */}
              {mode !== "reset" && (
                <div>
                  <label className="block text-xs font-semibold text-[#002f34] uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#002f34] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
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
                    <label className="block text-xs font-semibold text-[#002f34] uppercase tracking-wider mb-1.5">
                      Security Token
                    </label>
                    <input
                      type="text"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Paste reset token from email"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#002f34] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                    />
                  </div>
                )
              )}

              {/* Password Field (Login, Register, Reset) */}
              {mode !== "forgot" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#002f34] uppercase tracking-wider">
                      {mode === "reset" ? "New Password" : "Password"}
                    </label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setError(null);
                          setSuccessMsg(null);
                        }}
                        className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-11 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#002f34] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password (Reset mode) */}
              {mode === "reset" && (
                <div>
                  <label className="block text-xs font-semibold text-[#002f34] uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type your new password"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#002f34] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#002f34] hover:bg-[#003e45] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>
                    {mode === "login" && "Sign In"}
                    {mode === "register" && "Create Account"}
                    {mode === "forgot" && "Send Reset Link"}
                    {mode === "reset" && "Update Password"}
                  </span>
                )}
              </button>

              {/* Footer Switcher */}
              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  {mode === "login" && (
                    <>
                      Don&apos;t have an account yet?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("register");
                          setError(null);
                          setSuccessMsg(null);
                        }}
                        className="font-semibold text-teal-600 hover:underline cursor-pointer"
                      >
                        Register here
                      </button>
                    </>
                  )}
                  {mode === "register" && (
                    <>
                      Already registered?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("login");
                          setError(null);
                          setSuccessMsg(null);
                        }}
                        className="font-semibold text-teal-600 hover:underline cursor-pointer"
                      >
                        Sign in
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
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-gray-400 font-semibold tracking-wider text-[11px]">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div id="google-signin-btn-container" className="w-full flex justify-center min-h-[40px]"></div>

                  <button
                    type="button"
                    onClick={handleFacebookLogin}
                    disabled={loading}
                    className="w-full max-w-[320px] h-[40px] px-4 rounded-[4px] bg-[#1877F2] hover:bg-[#166fe5] text-white text-[13px] font-semibold flex items-center justify-center gap-2.5 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>{mode === "register" ? "Sign up with Facebook" : "Continue with Facebook"}</span>
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
