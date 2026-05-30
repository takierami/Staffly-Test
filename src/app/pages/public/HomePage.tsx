import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowRight, Play, CircleCheck as CheckCircle2, Users, ChartBar as BarChart3, Zap, Shield, Clock, Star, ChevronRight, Building2, Globe, Award, TrendingUp, HeartHandshake, Sparkles, Target, MessageSquare, Calendar, CreditCard, FileText, UserCheck, Briefcase, GraduationCap, Bot } from "lucide-react";
import stafflyLogo from "@/imports/photo_2026-05-24_18-48-49-removebg-preview__3_.png";

const HERO_STATS = [
  { value: "10,000+", label: "Active Users" },
  { value: "500+", label: "Companies" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
];

const FEATURES = [
  {
    icon: Users,
    title: "Employee Management",
    description: "Centralized employee profiles, org charts, and workforce analytics. Manage your entire organization from a single dashboard.",
    link: "/features/employee-management",
    color: "blue"
  },
  {
    icon: Calendar,
    title: "Leave & Attendance",
    description: "Smart leave tracking with intelligent approvals. Real-time attendance monitoring with geolocation and biometric integration.",
    link: "/features/leave-attendance",
    color: "emerald"
  },
  {
    icon: CreditCard,
    title: "Payroll & Compliance",
    description: "Automated payroll processing with full tax compliance. Multi-currency support and comprehensive compensation management.",
    link: "/features/payroll",
    color: "violet"
  },
  {
    icon: TrendingUp,
    title: "Performance & Goals",
    description: "Goal-setting frameworks (OKR, KPI), continuous feedback, and comprehensive performance review cycles.",
    link: "/features/performance",
    color: "amber"
  },
  {
    icon: Briefcase,
    title: "Recruitment & ATS",
    description: "End-to-end recruitment funnel with AI-powered candidate matching and automated screening workflows.",
    link: "/features/recruitment",
    color: "rose"
  },
  {
    icon: GraduationCap,
    title: "Training & Development",
    description: "Learning management system with course creation, certifications tracking, and skills development programs.",
    link: "/features/training",
    color: "cyan"
  },
];

const TESTIMONIALS = [
  {
    name: "M. Ghzala",
    role: "HR Manager",
    company: "University of Larbi Tebessi, Tebessa",
    quote: "Staffly AI significantly simplified our HR operations and improved employee management workflows. The platform helped us centralize HR processes while providing a much better experience for both employees and administrators.",
    image: null
  },
  {
    name: "Sarah Benmoussa",
    role: "Chief People Officer",
    company: "Condor Electronics",
    quote: "We reduced our payroll processing time by 70% after implementing Staffly AI. The automated compliance checks and multi-currency support have been game-changers for our international teams.",
    image: null
  },
  {
    name: "Khaled Amri",
    role: "Operations Director",
    company: "Saidal Pharmaceuticals",
    quote: "The recruitment module transformed our hiring process. We went from weeks to days in filling critical positions, and the AI-powered candidate matching is incredibly accurate.",
    image: null
  },
  {
    name: "Fatima Zohra Hadj",
    role: "HR Director",
    company: "Sonatrach",
    quote: "Managing 15,000+ employees across multiple sites was a challenge until Staffly AI. The platform scales beautifully and the real-time analytics help us make data-driven decisions.",
    image: null
  },
  {
    name: "Yacine Boudiaf",
    role: "CEO",
    company: "Cevital Group",
    quote: "Staffly AI impressed us with their attention to security and compliance. The SSO integration and role-based access control gave us peace of mind for our enterprise deployment.",
    image: null
  },
  {
    name: "Nadia Cherif",
    role: "Head of HR",
    company: "Ministry of Education",
    quote: "The Arabic language support and RTL interface made Staffly AI the obvious choice for our government ministry. The platform has modernized our entire HR infrastructure.",
    image: null
  },
];

const TRUSTED_COMPANIES = [
  "University of Larbi Tebessi",
  "Condor Electronics",
  "Saidal Pharmaceuticals",
  "Sonatrach",
  "Cevital Group",
  "Ministry of Education",
  "Algiers Telecom",
  "Air Algerie"
];

const AWARDS = [
  { year: "2025", title: "Best HR Tech Innovation", org: "TechCrunch Disrupt" },
  { year: "2025", title: "G2 Leader in HR Management", org: "G2 Crowd" },
  { year: "2024", title: "Fastest Growing SaaS", org: "SaaS Awards" },
  { year: "2024", title: "Best Enterprise Solution", org: "Middle East Tech Awards" },
];

const FAQ_ITEMS = [
  {
    q: "How long does implementation take?",
    a: "Most organizations are fully operational within 2-4 weeks. Enterprise deployments with complex integrations may take 6-8 weeks."
  },
  {
    q: "Is there a free trial available?",
    a: "Yes, we offer a 14-day free trial with full access to all features. No credit card required."
  },
  {
    q: "Can I migrate my existing HR data?",
    a: "Yes, we provide free data migration services for annual plans. Our team handles the entire process to ensure a smooth transition."
  },
  {
    q: "Is Staffly AI SOC 2 compliant?",
    a: "Yes, we are SOC 2 Type II certified. We also maintain ISO 27001 certification and GDPR compliance."
  },
  {
    q: "Do you offer Arabic language support?",
    a: "Yes, Staffly AI has full Arabic language support with RTL (right-to-left) interface, making it ideal for organizations in MENA region."
  },
  {
    q: "What support options are available?",
    a: "We offer 24/7 email and chat support on all plans. Enterprise customers get dedicated account managers and priority phone support."
  },
];

export function HomePage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[data-animate]").forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #dbeafe 100%)" }} />
          <div className="dark:hidden absolute inset-0" style={{ background: "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)" }} />
          <div className="dark:hidden absolute inset-0" style={{ background: "radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 40%)" }} />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-30 dark:opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Now with AI-Powered Insights</span>
              <ArrowRight className="w-3 h-3 text-blue-500" />
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              <span className="text-slate-900 dark:text-white">The Complete HR Platform</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 bg-clip-text text-transparent">Built for Modern Enterprises</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              From onboarding to payroll, performance to recruitment — Staffly AI unifies your entire HR workflow in one intelligent, secure, and beautifully designed platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                to="/demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl shadow-blue-600/25 transition-all hover:shadow-2xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-blue-300 dark:hover:border-blue-600 transition-all"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
              <div className="flex items-center gap-2 text-slate-500">
                <Shield className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium">SOC 2 Certified</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Globe className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Award className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium">G2 Leader 2025</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {HERO_STATS.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section id="trusted" data-animate className={`py-16 bg-slate-50 dark:bg-slate-900/50 transition-all duration-700 ${isVisible.trusted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-slate-500 mb-8">Trusted by forward-thinking organizations</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {TRUSTED_COMPANIES.map((company, i) => (
              <div key={i} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors font-medium text-sm">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" data-animate className={`py-24 transition-all duration-700 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">Platform Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Everything You Need to Manage Your Workforce
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Staffly AI brings every aspect of HR management into one unified platform, eliminating data silos and streamlining operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => {
              const colorClasses: Record<string, string> = {
                blue: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900",
                emerald: "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900",
                violet: "bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900",
                amber: "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900",
                rose: "bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900",
                cyan: "bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900",
              };

              return (
                <Link
                  key={i}
                  to={feature.link}
                  className="group p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClasses[feature.color]} border`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                    Learn more
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section id="ai" data-animate className={`py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 transition-all duration-700 ${isVisible.ai ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/20 text-blue-400 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Intelligent HR, Powered by AI
              </h2>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Staffly AI leverages machine learning to automate repetitive tasks, predict workforce trends, and provide actionable insights that help you make smarter decisions.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Target, title: "Smart Candidate Matching", desc: "AI-powered ATS that identifies the best-fit candidates automatically" },
                  { icon: TrendingUp, title: "Predictive Analytics", desc: "Forecast turnover and identify retention risks before they happen" },
                  { icon: Bot, title: "Automated Workflows", desc: "Let AI handle routine approvals and document processing" },
                  { icon: MessageSquare, title: "Intelligent Insights", desc: "Natural language queries for instant HR metrics" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-3xl blur-3xl" />
              <div className="relative bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-blue-400">
                    <Bot className="w-6 h-6" />
                    <span className="font-medium">AI Assistant</span>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-700/50 border border-slate-600/50">
                      <p className="text-white text-sm">"What's our current turnover rate for Q4?"</p>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-600/20 border border-blue-500/30">
                      <p className="text-blue-100 text-sm">
                        <span className="font-semibold">Based on current data:</span><br />
                        Turnover rate is 4.2% this quarter, down from 6.1% in Q3. Key drivers: increased engagement scores (+15%) and new retention initiatives.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" data-animate className={`py-24 bg-slate-50 dark:bg-slate-900/50 transition-all duration-700 ${isVisible.testimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">Customer Success</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Loved by HR Teams Worldwide
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              See why organizations across industries trust Staffly AI for their HR operations.
            </p>
          </div>

          {/* Featured testimonial */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-700 shadow-xl">
              <div className="absolute top-6 left-8">
                <svg className="w-12 h-12 text-blue-100 dark:text-blue-900" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-2.2 1.8-4 4-4V8zm18 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8z"/>
                </svg>
              </div>
              <div className="relative">
                <p className="text-xl sm:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed mb-8">
                  "{TESTIMONIALS[activeTestimonial].quote}"
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-lg">{TESTIMONIALS[activeTestimonial].name}</div>
                    <div className="text-slate-500">{TESTIMONIALS[activeTestimonial].role} — {TESTIMONIALS[activeTestimonial].company}</div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial navigation */}
            <div className="flex justify-center gap-2 mt-6">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === activeTestimonial ? "bg-blue-600 w-6" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* All testimonials grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.slice(0, 6).map((testimonial, i) => (
              <div key={i} className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3">"{testimonial.quote}"</p>
                <div className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</div>
                <div className="text-sm text-slate-500">{testimonial.role}, {testimonial.company}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section id="awards" data-animate className={`py-16 transition-all duration-700 ${isVisible.awards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AWARDS.map((award, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border border-amber-200 dark:border-amber-800">
                <div className="w-12 h-12 rounded-xl bg-amber-200 dark:bg-amber-800 flex items-center justify-center">
                  <Award className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{award.title}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{award.org} • {award.year}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" data-animate className={`py-24 bg-slate-50 dark:bg-slate-900/50 transition-all duration-700 ${isVisible.faq ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">FAQ</span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Everything you need to know about Staffly AI.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <details key={i} className="group rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-semibold text-slate-900 dark:text-white">{item.q}</span>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-slate-600 dark:text-slate-300">
                  {item.a}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-500 mb-4">Still have questions?</p>
            <Link to="/contact" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Contact our team
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Ready to Transform Your HR Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of organizations that trust Staffly AI to manage their workforce.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-all shadow-xl"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-700/50 text-white font-semibold border-2 border-blue-400/50 hover:bg-blue-700 transition-all"
            >
              Talk to Sales
            </Link>
          </div>
          <p className="text-blue-200 text-sm mt-6">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>
    </div>
  );
}
