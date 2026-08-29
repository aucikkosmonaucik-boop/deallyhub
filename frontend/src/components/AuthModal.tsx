"use client";

import React, { useState } from "react";
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: { id: number; name: string; email: string }, token: string) => void;
  initialMode?: "login" | "register";
}

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = "login"
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://deallyhub-production.up.railway.app";
    const endpoint = mode === "login" ? `${apiUrl}/api/auth/login` : `${apiUrl}/api/auth/register`;
    const payload = mode === "login" ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed. Please check your credentials.");
      }

      onAuthSuccess(data.user, data.token);
      onClose();
      // Reset form
      setName("");
      setEmail("");
      setPassword("");
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-[#002f34] p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-2 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-50 text-teal-600 mb-3">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#002f34]">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {mode === "login"
              ? "Sign in to manage your advertisements and favorites"
              : "Join Deallyhub and start buying and selling locally"}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-gray-200 mx-6 mt-4">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors ${
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
            }}
            className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors ${
              mode === "register"
                ? "border-[#002f34] text-[#002f34]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
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
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#002f34] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
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
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#002f34] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-[#002f34] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-11 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#002f34] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#002f34] hover:bg-[#003e45] text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
            )}
          </button>

          {/* Footer note */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account yet?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setError(null);
                    }}
                    className="font-semibold text-teal-600 hover:underline"
                  >
                    Register here
                  </button>
                </>
              ) : (
                <>
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError(null);
                    }}
                    className="font-semibold text-teal-600 hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
