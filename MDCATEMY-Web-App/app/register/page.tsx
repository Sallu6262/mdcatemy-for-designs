"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Mail, Lock, User, Phone,
  ChevronDown, MapPin, ArrowRight, Hash,
} from "lucide-react";
import AuthBrandPanel from "@/components/ui/AuthBrandPanel";

/* ── Constants ─────────────────────────────────────────── */
const PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Kashmir",
];

type StudentType = "fresher" | "repeater";

/* ── Reusable input field ───────────────────────────────── */
function InputField({
  label,
  icon,
  type,
  value,
  onChange,
  placeholder,
  error,
  rightElement,
  inputMode,
}: {
  label: string;
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
  rightElement?: React.ReactNode;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div>
      <label className="block text-[10px] font-inter font-black uppercase tracking-[0.12em] text-warrior-text mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-warrior-text pointer-events-none">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className={`w-full h-[48px] bg-warrior-black border ${
            error ? "border-red-500 focus:border-red-500" : "border-warrior-border focus:border-mdcat-yellow"
          } rounded-lg pl-11 ${rightElement ? "pr-12" : "pr-4"} text-white font-inter text-sm placeholder:text-warrior-text/35 focus:outline-none transition-colors duration-200`}
        />
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="text-red-400 text-[11px] font-inter mt-1.5 overflow-hidden"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Section divider label ──────────────────────────────── */
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-5 h-px bg-mdcat-yellow/50" />
      <span className="text-[10px] font-inter font-black uppercase tracking-[0.18em] text-mdcat-yellow">
        {label}
      </span>
      <div className="flex-1 h-px bg-mdcat-yellow/15" />
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────── */
export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [studentType, setStudentType] = useState<StudentType>("fresher");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    whatsapp: "",
    previousScore: "",
    province: "",
    city: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): Partial<Record<keyof typeof form, string>> => {
    const e: Partial<Record<keyof typeof form, string>> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.email.includes("@")) e.email = "Enter a valid email address.";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match.";
    if (!form.whatsapp.trim()) e.whatsapp = "WhatsApp number is required.";
    if (studentType === "repeater" && !form.previousScore)
      e.previousScore = "Enter your previous MDCAT score.";
    if (!form.province) e.province = "Select your province.";
    if (!form.city.trim()) e.city = "City is required.";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to first error
      const firstError = document.querySelector("[data-error='true']");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setLoading(true);
    // Frontend-only: simulate registration → redirect
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-warrior-black">
      {/* Left: sticky brand panel */}
      <div className="hidden lg:block lg:w-[55%] sticky top-0 h-screen">
        <AuthBrandPanel />
      </div>

      {/* Right: scrollable form */}
      <div className="flex-1 bg-dark-charcoal overflow-y-auto">
        <div className="flex items-start justify-center p-6 lg:p-16 min-h-screen">
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-[420px] py-8"
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
                Limited seats · 100 warriors per batch
              </p>
              <h1
                className="font-poppins font-black text-white leading-[1.0]"
                style={{ fontSize: "clamp(2.2rem, 4vw, 3rem)" }}
              >
                Join the{" "}
                <span className="text-gradient-yellow">Tribe.</span>
              </h1>
              <p className="text-warrior-text font-inter text-sm mt-3 leading-relaxed">
                Build your warrior profile. Your preparation starts now.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8" noValidate>

              {/* ── SECTION 1: Account Details ── */}
              <div>
                <SectionLabel label="Account Details" />
                <div className="space-y-4">

                  <InputField
                    label="Full Name"
                    icon={<User size={14} />}
                    type="text"
                    value={form.fullName}
                    onChange={(v) => update("fullName", v)}
                    placeholder="Muhammad Ali Khan"
                    error={errors.fullName}
                  />

                  <InputField
                    label="Email Address"
                    icon={<Mail size={14} />}
                    type="email"
                    value={form.email}
                    onChange={(v) => update("email", v)}
                    placeholder="ali@email.com"
                    error={errors.email}
                  />

                  <InputField
                    label="Password"
                    icon={<Lock size={14} />}
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(v) => update("password", v)}
                    placeholder="Min. 8 characters"
                    error={errors.password}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-warrior-text hover:text-white transition-colors"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    }
                  />

                  <InputField
                    label="Confirm Password"
                    icon={<Lock size={14} />}
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(v) => update("confirmPassword", v)}
                    placeholder="Repeat your password"
                    error={errors.confirmPassword}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="text-warrior-text hover:text-white transition-colors"
                        aria-label="Toggle password visibility"
                      >
                        {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    }
                  />
                </div>
              </div>

              {/* ── SECTION 2: Your Profile ── */}
              <div>
                <SectionLabel label="Your Profile" />
                <div className="space-y-4">

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-[10px] font-inter font-black uppercase tracking-[0.12em] text-warrior-text mb-2">
                      WhatsApp Number
                    </label>
                    <div className="flex">
                      <div className="flex items-center px-3.5 bg-warrior-gray border border-r-0 border-warrior-border rounded-l-lg h-[48px]">
                        <Phone size={13} className="text-warrior-text mr-1.5" />
                        <span className="text-warrior-text text-sm font-inter font-bold">+92</span>
                      </div>
                      <input
                        type="tel"
                        value={form.whatsapp}
                        onChange={(e) => update("whatsapp", e.target.value)}
                        placeholder="3XX XXXXXXX"
                        inputMode="tel"
                        className={`flex-1 h-[48px] bg-warrior-black border ${
                          errors.whatsapp ? "border-red-500" : "border-warrior-border focus:border-mdcat-yellow"
                        } border-l-0 rounded-r-lg px-4 text-white font-inter text-sm placeholder:text-warrior-text/35 focus:outline-none transition-colors duration-200`}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.whatsapp && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-red-400 text-[11px] font-inter mt-1.5 overflow-hidden"
                        >
                          {errors.whatsapp}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Fresher / Repeater toggle */}
                  <div>
                    <label className="block text-[10px] font-inter font-black uppercase tracking-[0.12em] text-warrior-text mb-2">
                      MDCAT Status
                    </label>
                    <div className="flex rounded-lg overflow-hidden border border-warrior-border h-[48px]">
                      {(["fresher", "repeater"] as StudentType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setStudentType(type);
                            if (type === "fresher") update("previousScore", "");
                          }}
                          className={`flex-1 font-inter font-bold text-sm transition-all duration-200 ${
                            studentType === type
                              ? "bg-mdcat-yellow text-warrior-black"
                              : "bg-warrior-black text-warrior-text hover:text-white"
                          }`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Previous MDCAT Score (conditional) */}
                  <AnimatePresence>
                    {studentType === "repeater" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <InputField
                          label="Previous MDCAT Score (out of 210)"
                          icon={<Hash size={14} />}
                          type="number"
                          value={form.previousScore}
                          onChange={(v) => update("previousScore", v)}
                          placeholder="e.g. 152"
                          error={errors.previousScore}
                          inputMode="numeric"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Province */}
                  <div>
                    <label className="block text-[10px] font-inter font-black uppercase tracking-[0.12em] text-warrior-text mb-2">
                      Province
                    </label>
                    <div className="relative">
                      <select
                        value={form.province}
                        onChange={(e) => update("province", e.target.value)}
                        className={`w-full h-[48px] bg-warrior-black border ${
                          errors.province ? "border-red-500" : "border-warrior-border focus:border-mdcat-yellow"
                        } rounded-lg px-4 pr-10 text-sm font-inter focus:outline-none transition-colors duration-200 appearance-none cursor-pointer ${
                          form.province ? "text-white" : "text-warrior-text/50"
                        }`}
                      >
                        <option value="" disabled className="text-warrior-text bg-dark-charcoal">
                          Select province...
                        </option>
                        {PROVINCES.map((p) => (
                          <option key={p} value={p} className="bg-dark-charcoal text-white">
                            {p}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-warrior-text pointer-events-none"
                      />
                    </div>
                    <AnimatePresence>
                      {errors.province && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-red-400 text-[11px] font-inter mt-1.5 overflow-hidden"
                        >
                          {errors.province}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* City */}
                  <InputField
                    label="City"
                    icon={<MapPin size={14} />}
                    type="text"
                    value={form.city}
                    onChange={(v) => update("city", v)}
                    placeholder="e.g. Lahore"
                    error={errors.city}
                  />
                </div>
              </div>

              {/* Submit button */}
              <div className="space-y-4 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  {loading ? (
                    <div className="w-[18px] h-[18px] border-2 border-warrior-black/25 border-t-warrior-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Join the Tribe</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>

                <p className="text-warrior-text text-xs font-inter text-center leading-relaxed">
                  By joining, you agree to our{" "}
                  <span className="text-mdcat-yellow cursor-pointer hover:underline">Terms</span>
                  {" "}and{" "}
                  <span className="text-mdcat-yellow cursor-pointer hover:underline">Privacy Policy</span>.
                </p>
              </div>

              {/* Divider + Google */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-warrior-border" />
                  <span className="text-warrior-text text-xs font-inter">or</span>
                  <div className="flex-1 h-px bg-warrior-border" />
                </div>
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
              </div>
            </form>

            {/* Already have account */}
            <p className="text-center text-warrior-text text-sm font-inter mt-8 pb-4">
              Already a warrior?{" "}
              <Link href="/login" className="text-mdcat-yellow font-bold hover:underline underline-offset-2">
                Login →
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
