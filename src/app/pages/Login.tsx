import { useState, useEffect } from "react";
import { Eye, EyeOff, Shield, Building2, Globe, Moon, Sun, CircleAlert as AlertCircle, Loader as Loader2, Lock, Mail, ChevronDown, Users, ChartBar as BarChart3, Zap, ArrowRight, CircleCheck as CheckCircle2 } from "lucide-react";
import { useAuth, type UserRole } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import stafflyLogo from "@/imports/photo_2026-05-24_18-48-49-removebg-preview__3_.png";
import { authService } from "../lib/supabase/authService";
import { profileService } from "../lib/supabase/profileService";

const ROLE_OPTIONS: { value: UserRole; label: string; labelAr: string; desc: string; descAr: string; icon: string }[] = [
  { value: "super_admin", label: "Super Admin", labelAr: "مدير عام", desc: "Platform administrator", descAr: "مدير المنصة", icon: "🔐" },
  { value: "admin", label: "Admin", labelAr: "مدير", desc: "Organization admin", descAr: "مدير المؤسسة", icon: "🏢" },
  { value: "hr_manager", label: "HR Manager", labelAr: "مدير موارد بشرية", desc: "HR operations", descAr: "عمليات الموارد البشرية", icon: "👥" },
  { value: "employee", label: "Employee", labelAr: "موظف", desc: "Staff portal", descAr: "بوابة الموظفين", icon: "👤" },
];

const DEMO_CREDENTIALS: Record<UserRole, { email: string; password: string }> = {
  super_admin: { email: "taki@boss.dz", password: "TakiTakiBossBoss123/" },
  admin: { email: "admin@staffly.dz", password: "admin123" },
  hr_manager: { email: "hr@staffly.dz", password: "hr123" },
  employee: { email: "employee@staffly.dz", password: "emp123" },
};

const TAGLINES = [
  "Digitalize Your Workforce",
  "Empower Your People",
  "Intelligent HR, Effortlessly",
  "One Platform. Every Employee.",
  "The Future of Work is Here",
];

const FEATURES = [
  { icon: Users, text: "Smart Employee Management", sub: "Unified profiles & org charts" },
  { icon: BarChart3, text: "Real-Time Analytics", sub: "Insights that drive decisions" },
  { icon: Zap, text: "AI-Powered Workflows", sub: "Automate repetitive HR tasks" },
  { icon: Shield, text: "Enterprise-Grade Security", sub: "SOC2 ready, role-based access" },
];

const STATS = [
  { value: "10K+", label: "Employees Managed" },
  { value: "98%", label: "Uptime Reliability" },
  { value: "3x", label: "Faster Onboarding" },
];

// Floating orb data — fixed so it doesn't regenerate on render
const ORBS = [
  { w: 420, h: 420, top: "-10%", left: "-8%", animDelay: "0s", animDuration: "18s", colorFrom: "#6366f1", colorTo: "#818cf8" },
  { w: 320, h: 320, top: "55%", left: "60%", animDelay: "3s", animDuration: "22s", colorFrom: "#3b82f6", colorTo: "#60a5fa" },
  { w: 260, h: 260, top: "30%", left: "35%", animDelay: "6s", animDuration: "26s", colorFrom: "#8b5cf6", colorTo: "#a78bfa" },
  { w: 180, h: 180, top: "70%", left: "5%", animDelay: "1.5s", animDuration: "20s", colorFrom: "#06b6d4", colorTo: "#22d3ee" },
  { w: 140, h: 140, top: "10%", left: "70%", animDelay: "8s", animDuration: "15s", colorFrom: "#f59e0b", colorTo: "#fbbf24" },
];

// Dot grid positions
const DOTS: { x: number; y: number; delay: number }[] = Array.from({ length: 40 }, (_, i) => ({
  x: (i % 8) * 13 + 2,
  y: Math.floor(i / 8) * 22 + 5,
  delay: (i * 0.15) % 3,
}));

export function Login() {
  const { login, isLoading } = useAuth();
  const { theme, toggleTheme, lang, setLang, isRTL } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("super_admin");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [taglineFading, setTaglineFading] = useState(false);
  const [featVisible, setFeatVisible] = useState(false);

  const isDark = theme === "dark";
  const formBg = isDark ? "#0F172A" : "#F8FAFC";
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textPrimary = isDark ? "#F1F5F9" : "#0F172A";
  const textSecondary = isDark ? "#94A3B8" : "#64748B";
  const inputBg = isDark ? "#0F172A" : "#F8FAFC";
  const inputBorder = isDark ? "#334155" : "#CBD5E1";

  const selectedRoleObj = ROLE_OPTIONS.find((r) => r.value === selectedRole)!;

  // Tagline rotation
  useEffect(() => {
    const id = setInterval(() => {
      setTaglineFading(true);
      setTimeout(() => {
        setTaglineIdx((i) => (i + 1) % TAGLINES.length);
        setTaglineFading(false);
      }, 400);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  // Feature stagger reveal on mount
  useEffect(() => {
    const id = setTimeout(() => setFeatVisible(true), 300);
    return () => clearTimeout(id);
  }, []);

  const fillDemo = () => {
    const creds = DEMO_CREDENTIALS[selectedRole];
    setEmail(creds.email);
    setPassword(creds.password);
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = await login(email, password);
    if (!result.success) {
      setError(result.message);
      return;
    }
    // Get the user profile to determine redirect
    try {
      const { data: { user } } = await authService.getSession();
      if (user) {
        const profile = await profileService.getProfile(user.id);
        if (profile) {
          // Redirect based on role
          if (profile.role === 'super_admin') {
            navigate('/super-admin', { replace: true });
          } else if (profile.role === 'employee') {
            navigate('/portal', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }
      }
    } catch (err) {
      console.error('Post-login redirect error:', err);
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(true);
  };

  return (
    <>
      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          25% { transform: translateY(-30px) translateX(20px) scale(1.04); }
          50% { transform: translateY(-15px) translateX(-25px) scale(0.97); }
          75% { transform: translateY(25px) translateX(15px) scale(1.02); }
        }
        @keyframes gridPulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.65; }
        }
        @keyframes dotBlink {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.5); }
        }
        @keyframes scanLine {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(1200%); opacity: 0; }
        }
        @keyframes taglineIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes taglineOut {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-12px); }
        }
        @keyframes statCount {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
          50% { box-shadow: 0 0 0 3px rgba(99,102,241,0.3); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rotateRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes counterRotateRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .feat-item {
          opacity: 0;
          transform: translateX(-20px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .feat-item.visible {
          opacity: 1;
          transform: translateX(0);
        }
        .tagline-text {
          animation: taglineIn 0.4s ease forwards;
        }
        .tagline-text.fading {
          animation: taglineOut 0.4s ease forwards;
        }
        .stat-item {
          animation: statCount 0.6s ease forwards;
        }
        .logo-ring-1 {
          animation: rotateRing 8s linear infinite;
        }
        .logo-ring-2 {
          animation: counterRotateRing 12s linear infinite;
        }
        .scan-line {
          animation: scanLine 6s ease-in-out infinite;
        }
        .shimmer-text {
          background: linear-gradient(90deg, #e2e8f0 0%, #ffffff 40%, #818cf8 60%, #e2e8f0 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      <div className="min-h-screen flex" style={{ direction: isRTL ? "rtl" : "ltr", fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>

        {/* ── LEFT PANEL: Brand + Animation ─────────────────────────────────── */}
        <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col overflow-hidden" style={{ background: "linear-gradient(135deg, #050816 0%, #0a1628 40%, #0d1f3c 70%, #111827 100%)" }}>

          {/* Animated orbs */}
          {ORBS.map((orb, i) => (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: orb.w,
                height: orb.h,
                top: orb.top,
                left: orb.left,
                background: `radial-gradient(circle, ${orb.colorFrom}22 0%, ${orb.colorTo}11 50%, transparent 70%)`,
                filter: "blur(60px)",
                animation: `orbFloat ${orb.animDuration} ease-in-out infinite`,
                animationDelay: orb.animDelay,
              }}
            />
          ))}

          {/* Dot grid */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.4 }}>
            {DOTS.map((d, i) => (
              <circle
                key={i}
                cx={`${d.x}%`}
                cy={`${d.y}%`}
                r="1.5"
                fill="#6366f1"
                style={{ animation: `dotBlink 3s ease-in-out infinite`, animationDelay: `${d.delay}s` }}
              />
            ))}
          </svg>

          {/* Grid lines overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
              animation: "gridPulse 5s ease-in-out infinite",
            }}
          />

          {/* Scan line */}
          <div
            className="scan-line absolute left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(129,140,248,0.8), rgba(99,102,241,0.6), transparent)", top: "10%" }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full px-12 py-10">

            {/* Logo */}
            <div className="flex items-center gap-4 mb-auto">
              <div className="relative shrink-0" style={{ width: 72, height: 72 }}>
                <div className="logo-ring-1 absolute inset-0 rounded-full border border-indigo-500/25" style={{ borderStyle: "dashed" }} />
                <div className="logo-ring-2 absolute inset-2 rounded-full border border-blue-400/15" />
                <ImageWithFallback
                  src={stafflyLogo}
                  alt="Staffly AI logo"
                  style={{ width: 72, height: 72, objectFit: "contain" }}
                />
              </div>
              <div>
                <div className="font-black text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22 }}>Staffly AI</div>
                <div className="font-medium tracking-widest uppercase" style={{ color: "#818cf8", fontSize: 11 }}>Enterprise HR Suite</div>
              </div>
            </div>

            {/* Hero copy */}
            <div className="my-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 border" style={{ background: "rgba(99,102,241,0.12)", borderColor: "rgba(99,102,241,0.3)" }}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: "#a5b4fc" }}>Now with AI Insights</span>
              </div>

              <div className="mb-3" style={{ minHeight: 80 }}>
                <h1
                  className={`tagline-text${taglineFading ? " fading" : ""}`}
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "clamp(2.2rem, 3.5vw, 3rem)",
                    fontWeight: 900,
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                    color: "#ffffff",
                  }}
                >
                  {TAGLINES[taglineIdx]}
                </h1>
              </div>

              <p className="text-base leading-relaxed mb-10 max-w-sm" style={{ color: "#94a3b8", fontWeight: 400 }}>
                The complete HR platform built for modern enterprises — from onboarding to payroll, all in one intelligent workspace.
              </p>

              {/* Feature list */}
              <div className="space-y-4 mb-12">
                {FEATURES.map((f, i) => (
                  <div
                    key={f.text}
                    className={`feat-item flex items-center gap-4${featVisible ? " visible" : ""}`}
                    style={{ transitionDelay: `${i * 120}ms` }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}
                    >
                      <f.icon className="w-4 h-4" style={{ color: "#818cf8" }} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>{f.text}</div>
                      <div className="text-xs" style={{ color: "#64748b" }}>{f.sub}</div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 ml-auto shrink-0" style={{ color: "#34d399", opacity: 0.7 }} />
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="flex gap-8 border-t pt-8" style={{ borderColor: "rgba(99,102,241,0.15)" }}>
                {STATS.map((s, i) => (
                  <div key={s.label} className="stat-item" style={{ animationDelay: `${0.8 + i * 0.15}s` }}>
                    <div
                      className="text-2xl font-black mb-0.5"
                      style={{ fontFamily: "'Outfit', sans-serif", color: "#ffffff" }}
                    >
                      {s.value}
                    </div>
                    <div className="text-xs" style={{ color: "#64748b" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom tagline */}
            <div className="text-xs" style={{ color: "#334155" }}>
              © 2026 Staffly AI · Powered by Anthropic Claude
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: Login Form ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col" style={{ background: formBg }}>

          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: border, background: cardBg }}>
            {/* Mobile logo */}
            <div className="flex items-center gap-2 lg:hidden">
              <ImageWithFallback src={stafflyLogo} alt="Staffly AI" style={{ width: 40, height: 40, objectFit: "contain" }} />
              <span className="font-bold text-base" style={{ color: textPrimary, fontFamily: "'Outfit', sans-serif" }}>Staffly AI</span>
            </div>
            <div className="hidden lg:block" />

            <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <button
                onClick={() => setLang(lang === "en" ? "ar" : "en")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                style={{ color: textSecondary, background: isDark ? "#334155" : "#F1F5F9" }}
              >
                <Globe className="w-4 h-4" />
                <span>{lang === "en" ? "عربي" : "English"}</span>
              </button>
              <button
                onClick={toggleTheme}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                style={{ background: isDark ? "#334155" : "#F1F5F9", color: textSecondary }}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Form area */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-[400px]">

              {/* Header */}
              <div className="mb-8" style={{ animation: "fadeSlideUp 0.6s ease forwards" }}>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5 border"
                  style={{ background: isDark ? "rgba(99,102,241,0.12)" : "#EEF2FF", color: "#6366f1", borderColor: isDark ? "rgba(99,102,241,0.25)" : "#c7d2fe" }}
                >
                  <Lock className="w-3 h-3" />
                  <span>{isRTL ? "وصول آمن للمؤسسات" : "Secure Enterprise Access"}</span>
                </div>
                <h2
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "1.75rem",
                    fontWeight: 800,
                    letterSpacing: "-0.025em",
                    color: textPrimary,
                    lineHeight: 1.2,
                    marginBottom: "0.5rem",
                  }}
                >
                  {forgotMode
                    ? (isRTL ? "استعادة كلمة المرور" : "Reset Password")
                    : (isRTL ? "مرحباً بعودتك" : "Welcome back")}
                </h2>
                <p className="text-sm" style={{ color: textSecondary }}>
                  {forgotMode
                    ? (isRTL ? "سنبلغ مسؤولك لإعادة التعيين" : "We'll notify your administrator to reset access")
                    : (isRTL ? "سجّل دخولك للوصول إلى لوحة التحكم" : "Sign in to access your HR workspace")}
                </p>
              </div>

              {/* Card */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: cardBg,
                  border: `1px solid ${border}`,
                  boxShadow: isDark ? "0 25px 50px rgba(0,0,0,0.4)" : "0 25px 50px rgba(99,102,241,0.08), 0 4px 16px rgba(0,0,0,0.06)",
                  animation: "fadeSlideUp 0.6s ease 0.1s both",
                }}
              >
                {/* Security strip */}
                <div
                  className="flex items-center gap-2 px-5 py-2.5 text-xs border-b"
                  style={{
                    background: isDark ? "rgba(99,102,241,0.08)" : "#f5f3ff",
                    borderColor: isDark ? "rgba(99,102,241,0.15)" : "#ddd6fe",
                    color: "#6366f1",
                  }}
                >
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(99,102,241,0.2)" }}>
                    <Lock className="w-2.5 h-2.5" />
                  </div>
                  <span className="font-medium">{isRTL ? "اتصال مشفر 256-bit" : "256-bit encrypted connection"}</span>
                  <span className="ml-auto flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold" style={{ color: "#10b981" }}>{isRTL ? "آمن" : "Secure"}</span>
                  </span>
                </div>

                <div className="p-6">
                  {!forgotMode ? (
                    <form onSubmit={handleLogin} className="space-y-4">

                      {/* Role selector */}
                      <div>
                        <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: textSecondary }}>
                          {isRTL ? "نوع الحساب" : "Account Type"}
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all"
                            style={{
                              background: inputBg,
                              borderColor: roleDropdownOpen ? "#6366f1" : inputBorder,
                              color: textPrimary,
                              boxShadow: roleDropdownOpen ? "0 0 0 3px rgba(99,102,241,0.15)" : "none",
                            }}
                          >
                            <div className={`flex items-center gap-2.5 ${isRTL ? "flex-row-reverse" : ""}`}>
                              <span className="text-base">{selectedRoleObj.icon}</span>
                              <span className="font-semibold">{isRTL ? selectedRoleObj.labelAr : selectedRoleObj.label}</span>
                              <span style={{ color: textSecondary }}>·</span>
                              <span className="text-xs" style={{ color: textSecondary }}>{isRTL ? selectedRoleObj.descAr : selectedRoleObj.desc}</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${roleDropdownOpen ? "rotate-180" : ""}`} style={{ color: textSecondary }} />
                          </button>
                          {roleDropdownOpen && (
                            <div
                              className="absolute top-full mt-1.5 w-full rounded-xl shadow-2xl border z-50 overflow-hidden"
                              style={{ background: cardBg, borderColor: border }}
                            >
                              {ROLE_OPTIONS.map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => { setSelectedRole(opt.value); setRoleDropdownOpen(false); setError(""); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:opacity-80"
                                  style={{
                                    background: selectedRole === opt.value ? (isDark ? "rgba(99,102,241,0.12)" : "#f5f3ff") : "transparent",
                                    color: selectedRole === opt.value ? "#6366f1" : textPrimary,
                                  }}
                                >
                                  <span className="text-base">{opt.icon}</span>
                                  <div className="flex-1">
                                    <div className="font-semibold">{isRTL ? opt.labelAr : opt.label}</div>
                                    <div className="text-xs" style={{ color: textSecondary }}>{isRTL ? opt.descAr : opt.desc}</div>
                                  </div>
                                  {selectedRole === opt.value && (
                                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#6366f1" }} />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: textSecondary }}>
                          {isRTL ? "البريد الإلكتروني" : "Work Email"}
                        </label>
                        <div className="relative">
                          <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 ${isRTL ? "right-3.5" : "left-3.5"}`} style={{ color: textSecondary }} />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(""); }}
                            placeholder={isRTL ? "بريدك@شركتك.dz" : "you@company.dz"}
                            required
                            dir={isRTL ? "rtl" : "ltr"}
                            className="w-full rounded-xl border py-3 text-sm outline-none transition-all"
                            style={{
                              background: inputBg,
                              borderColor: inputBorder,
                              color: textPrimary,
                              paddingLeft: isRTL ? "0.875rem" : "2.75rem",
                              paddingRight: isRTL ? "2.75rem" : "0.875rem",
                            }}
                            onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
                            onBlur={(e) => { e.target.style.borderColor = inputBorder; e.target.style.boxShadow = "none"; }}
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <div className={`flex items-center justify-between mb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <label className="text-xs font-bold uppercase tracking-wider" style={{ color: textSecondary }}>
                            {isRTL ? "كلمة المرور" : "Password"}
                          </label>
                          <button
                            type="button"
                            onClick={() => setForgotMode(true)}
                            className="text-xs font-semibold hover:underline"
                            style={{ color: "#6366f1" }}
                          >
                            {isRTL ? "نسيت كلمة المرور؟" : "Forgot password?"}
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 ${isRTL ? "right-3.5" : "left-3.5"}`} style={{ color: textSecondary }} />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(""); }}
                            placeholder="••••••••••"
                            required
                            className="w-full rounded-xl border py-3 text-sm outline-none transition-all"
                            style={{
                              background: inputBg,
                              borderColor: inputBorder,
                              color: textPrimary,
                              paddingLeft: isRTL ? "2.75rem" : "2.75rem",
                              paddingRight: "2.75rem",
                            }}
                            onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
                            onBlur={(e) => { e.target.style.borderColor = inputBorder; e.target.style.boxShadow = "none"; }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70 ${isRTL ? "left-3.5" : "right-3.5"}`}
                            style={{ color: textSecondary }}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Remember me */}
                      <div className={`flex items-center gap-2.5 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <input
                          id="remember"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded"
                          style={{ accentColor: "#6366f1" }}
                        />
                        <label htmlFor="remember" className="text-sm cursor-pointer select-none" style={{ color: textSecondary }}>
                          {isRTL ? "تذكّر جلستي" : "Keep me signed in"}
                        </label>
                      </div>

                      {/* Error */}
                      {error && (
                        <div
                          className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm border"
                          style={{ background: isDark ? "rgba(239,68,68,0.1)" : "#fef2f2", color: "#ef4444", borderColor: isDark ? "rgba(239,68,68,0.2)" : "#fecaca" }}
                        >
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-60 group"
                        style={{
                          background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
                          boxShadow: "0 4px 15px rgba(99,102,241,0.4)",
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: "0.9rem",
                          letterSpacing: "0.01em",
                        }}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{isRTL ? "جاري التحقق..." : "Authenticating..."}</span>
                          </>
                        ) : (
                          <>
                            <span>{isRTL ? "تسجيل الدخول" : "Sign In to Staffly"}</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                          </>
                        )}
                      </button>

                      {/* Demo credentials */}
                      <div
                        className="rounded-xl p-3.5 border"
                        style={{
                          background: isDark ? "rgba(99,102,241,0.05)" : "#f8f7ff",
                          borderColor: isDark ? "rgba(99,102,241,0.15)" : "#e0e7ff",
                          borderStyle: "dashed",
                        }}
                      >
                        <p className="text-xs mb-2 text-center" style={{ color: textSecondary }}>
                          {isRTL ? "بيانات تجريبية" : "Demo credentials for testing"}
                        </p>
                        <button
                          type="button"
                          onClick={fillDemo}
                          className="w-full text-xs font-bold hover:underline text-center"
                          style={{ color: "#6366f1" }}
                        >
                          {isRTL ? `تعبئة بيانات ${selectedRoleObj.labelAr}` : `Auto-fill ${selectedRoleObj.label} credentials`}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      {!forgotSent ? (
                        <form onSubmit={handleForgot} className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: textSecondary }}>
                              {isRTL ? "البريد الإلكتروني" : "Work Email"}
                            </label>
                            <div className="relative">
                              <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 ${isRTL ? "right-3.5" : "left-3.5"}`} style={{ color: textSecondary }} />
                              <input
                                type="email"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                placeholder={isRTL ? "بريدك@شركتك.dz" : "you@company.dz"}
                                required
                                className="w-full rounded-xl border py-3 text-sm outline-none"
                                style={{
                                  background: inputBg,
                                  borderColor: inputBorder,
                                  color: textPrimary,
                                  paddingLeft: isRTL ? "0.875rem" : "2.75rem",
                                  paddingRight: isRTL ? "2.75rem" : "0.875rem",
                                }}
                              />
                            </div>
                          </div>
                          <button
                            type="submit"
                            className="w-full py-3 rounded-xl font-bold text-sm text-white"
                            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)", boxShadow: "0 4px 15px rgba(99,102,241,0.4)", fontFamily: "'Outfit', sans-serif" }}
                          >
                            {isRTL ? "إرسال طلب الاستعادة" : "Send Recovery Request"}
                          </button>
                          <button type="button" onClick={() => setForgotMode(false)} className="w-full text-sm text-center hover:underline font-medium" style={{ color: textSecondary }}>
                            {isRTL ? "العودة لتسجيل الدخول" : "← Back to sign in"}
                          </button>
                        </form>
                      ) : (
                        <div className="text-center space-y-5 py-2">
                          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "linear-gradient(135deg, #d1fae5, #a7f3d0)" }}>
                            <Shield className="w-8 h-8 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-base mb-1.5" style={{ color: textPrimary, fontFamily: "'Outfit', sans-serif" }}>
                              {isRTL ? "تم إرسال الطلب" : "Request Sent Successfully"}
                            </h3>
                            <p className="text-sm leading-relaxed" style={{ color: textSecondary }}>
                              {isRTL
                                ? "تم إبلاغ المسؤول لإعادة تعيين كلمة مرورك."
                                : "Your administrator has been notified. They'll reset your access shortly."}
                            </p>
                          </div>
                          <button
                            onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(""); }}
                            className="w-full py-3 rounded-xl font-bold text-sm text-white"
                            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)", fontFamily: "'Outfit', sans-serif" }}
                          >
                            {isRTL ? "العودة لتسجيل الدخول" : "Back to Sign In"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center" style={{ animation: "fadeSlideUp 0.6s ease 0.3s both" }}>
                <div className={`flex items-center justify-center gap-4 text-xs mb-2 ${isRTL ? "flex-row-reverse" : ""}`} style={{ color: textSecondary }}>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{isRTL ? "منصة مؤسسية" : "Enterprise Platform"}</span>
                  </div>
                  <span>·</span>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{isRTL ? "حسابات مُدارة" : "Managed accounts only"}</span>
                  </div>
                </div>
                <p className="text-xs" style={{ color: isDark ? "#334155" : "#cbd5e1" }}>
                  © 2026 Staffly AI · All rights reserved
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
