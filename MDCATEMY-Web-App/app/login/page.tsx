"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import AuthBrandPanel from "@/components/ui/AuthBrandPanel";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    // Frontend-only: simulate auth delay → redirect to dashboard
    setTimeout(() => {
      router.push("/dashboard");
    }, 1400);
  };

  return (
    <div className="min-h-screen flex bg-warrior-black">
      {/* Left brand panel */}
      <AuthBrandPanel />

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-dark-charcoal overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile-only logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div
              className="w-7 h-8 bg-mdcat-yellow flex items-center justify-center"
              style={{ clipPath: "polygon(50% 0%, 100% 15%, 100% 75%, 50% 100%, 0% 75%, 0% 15%)" }}
            >
              <span className="font-poppins font-black text-warrior-black text-[10px]">M</span>
            </div>
            <span className="font-poppins font-black text-xl tracking-tight">
              <span className="text-mdcat-yellow">MDCAT</span>
              <span className="text-white">EMY</span>
            </span>
          </div>

          {/* Header */}
          <div className="mb-9">
            <p className="text-mdcat-yellow text-[10px] font-inter font-black uppercase tracking-[0.18em] mb-3">
              Welcome back
            </p>
            <h1 className="font-poppins font-black text-white leading-[1.0]" style={{ fontSize: "clamp(2.2rem, 4vw, 3rem)" }}>
              Warrior,<br />Login.
            </h1>
            <p className="text-warrior-text font-inter text-sm mt-3 leading-relaxed">
              Your tribe is waiting. Pick up where you left off.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-[10px] font-inter font-black uppercase tracking-[0.12em] text-warrior-text mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-warrior-text pointer-events-none"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="your@email.com"
                  autoComplete="email"
                  className="w-full h-[48px] bg-warrior-black border border-warrior-border rounded-lg pl-11 pr-4 text-white font-inter text-sm placeholder:text-warrior-text/35 focus:outline-none focus:border-mdcat-yellow transition-colors duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-inter font-black uppercase tracking-[0.12em] text-warrior-text">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-inter text-mdcat-yellow hover:underline underline-offset-2"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-warrior-text pointer-events-none"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full h-[48px] bg-warrior-black border border-warrior-border rounded-lg pl-11 pr-12 text-white font-inter text-sm placeholder:text-warrior-text/35 focus:outline-none focus:border-mdcat-yellow transition-colors duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-warrior-text hover:text-white transition-colors duration-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="text-red-400 text-xs font-inter bg-red-400/8 border border-red-400/20 rounded-lg px-4 py-3">
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2.5 mt-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {loading ? (
                <div className="w-[18px] h-[18px] border-2 border-warrior-black/25 border-t-warrior-black rounded-full animate-spin" />
              ) : (
                <>
                  <span>Login to My Camp</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-warrior-border" />
              <span className="text-warrior-text text-xs font-inter">or</span>
              <div className="flex-1 h-px bg-warrior-border" />
            </div>

            {/* Google Sign-In */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 h-[48px] bg-warrior-black border border-warrior-border hover:border-mdcat-yellow/40 hover:bg-warrior-gray rounded-xl text-white font-inter font-medium text-sm transition-all duration-200 group"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" className="flex-shrink-0">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="group-hover:text-mdcat-yellow transition-colors duration-200">
                Continue with Google
              </span>
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-warrior-text text-sm font-inter mt-8">
            New to MDCATEMY?{" "}
            <Link href="/register" className="text-mdcat-yellow font-bold hover:underline underline-offset-2">
              Join the Tribe →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
