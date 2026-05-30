import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { Menu, X, ChevronDown, Globe, Moon, Sun, ArrowRight, Phone, Mail, MapPin, Linkedin, Twitter, Youtube, Zap, Shield, Users, ChartBar as BarChart3 } from "lucide-react";
import stafflyLogo from "@/imports/photo_2026-05-24_18-48-49-removebg-preview__3_.png";

const NAV_LINKS = [
  { label: "Products", href: "/features", children: [
    { label: "Employee Management", href: "/features/employee-management" },
    { label: "Leave & Attendance", href: "/features/leave-attendance" },
    { label: "Payroll & Compliance", href: "/features/payroll" },
    { label: "Performance & Goals", href: "/features/performance" },
    { label: "Recruitment & ATS", href: "/features/recruitment" },
    { label: "Training & Development", href: "/features/training" },
  ]},
  { label: "Solutions", href: "/solutions", children: [
    { label: "Small Business", href: "/solutions/small-business" },
    { label: "Mid-Market", href: "/solutions/mid-market" },
    { label: "Enterprise", href: "/solutions/enterprise" },
    { label: "Government", href: "/solutions/government" },
    { label: "Education", href: "/solutions/education" },
  ]},
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/resources", children: [
    { label: "Help Center", href: "/help" },
    { label: "Blog", href: "/blog" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Webinars", href: "/webinars" },
    { label: "API Documentation", href: "/docs" },
  ]},
  { label: "Company", href: "/about", children: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Security", href: "/security" },
  ]},
];

export function PublicLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    (localStorage.getItem("staffly-theme") as "light" | "dark") || "light"
  );

  const isDark = theme === "dark";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("staffly-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light");

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Top announcement bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-2 px-4 text-sm font-medium">
        <span>Get 3 months free when you sign up for an annual plan</span>
        <Link to="/pricing" className="ml-2 underline hover:no-underline">Learn more</Link>
      </div>

      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? isDark
              ? "bg-slate-900/95 backdrop-blur-md border-b border-slate-800"
              : "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm"
            : isDark
              ? "bg-slate-900/80"
              : "bg-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <img src={stafflyLogo} alt="Staffly AI" className="h-8 w-8 object-contain" />
              <div>
                <span className={`font-bold text-lg ${isDark ? "text-white" : "text-slate-900"}`} style={{ fontFamily: "'Outfit', sans-serif" }}>Staffly AI</span>
                <span className="block text-[10px] uppercase tracking-widest text-blue-600">Enterprise HR</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={link.href}
                    className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isDark
                        ? "text-slate-300 hover:text-white hover:bg-slate-800"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {link.label}
                    {link.children && <ChevronDown className="w-4 h-4" />}
                  </Link>

                  {link.children && activeDropdown === link.label && (
                    <div
                      className={`absolute top-full left-0 mt-1 w-56 rounded-xl shadow-2xl border overflow-hidden ${
                        isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                      }`}
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className={`block px-4 py-3 text-sm transition-colors ${
                            isDark
                              ? "text-slate-300 hover:bg-slate-700 hover:text-white"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <Link
                to="/login"
                className={`hidden sm:block text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                  isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Sign In
              </Link>

              <Link
                to="/demo"
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden w-10 h-10 rounded-lg flex items-center justify-center ${
                  isDark ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"
                }`}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className={`lg:hidden border-t ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <div className="max-h-[80vh] overflow-y-auto py-4 px-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <div key={link.label}>
                  <Link
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-medium ${
                      isDark ? "text-white hover:bg-slate-800" : "text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <div className="ml-4 mt-1 space-y-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block px-4 py-2 text-sm rounded-lg ${
                            isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block w-full text-center px-4 py-3 rounded-lg font-medium ${
                    isDark ? "text-white bg-slate-800" : "text-slate-900 bg-slate-100"
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/demo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 rounded-lg font-semibold text-white bg-blue-600"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"} border-t`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {/* Brand column */}
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <img src={stafflyLogo} alt="Staffly AI" className="h-8 w-8 object-contain" />
                <div>
                  <span className={`font-bold text-lg ${isDark ? "text-white" : "text-slate-900"}`} style={{ fontFamily: "'Outfit', sans-serif" }}>Staffly AI</span>
                  <span className="block text-[10px] uppercase tracking-widest text-blue-600">Enterprise HR</span>
                </div>
              </Link>
              <p className={`text-sm mb-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                The complete HR platform built for modern enterprises. From onboarding to payroll, all in one intelligent workspace.
              </p>
              <div className="flex gap-3">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${isDark ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}>
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${isDark ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}>
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${isDark ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}>
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className={`font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>Products</h4>
              <ul className="space-y-2">
                {["Employee Management", "Leave & Attendance", "Payroll", "Performance", "Recruitment", "Training"].map((item) => (
                  <li key={item}>
                    <Link to={`/features/${item.toLowerCase().replace(/\s+/g, '-')}`} className={`text-sm transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solutions */}
            <div>
              <h4 className={`font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>Solutions</h4>
              <ul className="space-y-2">
                {["Small Business", "Mid-Market", "Enterprise", "Government", "Education"].map((item) => (
                  <li key={item}>
                    <Link to={`/solutions/${item.toLowerCase().replace(/\s+/g, '-')}`} className={`text-sm transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className={`font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>Resources</h4>
              <ul className="space-y-2">
                {[
                  { label: "Help Center", href: "/help" },
                  { label: "Blog", href: "/blog" },
                  { label: "Case Studies", href: "/case-studies" },
                  { label: "API Docs", href: "/docs" },
                  { label: "Webinars", href: "/webinars" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link to={item.href} className={`text-sm transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className={`font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>Company</h4>
              <ul className="space-y-2">
                {[
                  { label: "About Us", href: "/about" },
                  { label: "Careers", href: "/careers" },
                  { label: "Contact", href: "/contact" },
                  { label: "Security", href: "/security" },
                  { label: "Press", href: "/press" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link to={item.href} className={`text-sm transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className={`mt-12 pt-8 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                &copy; {new Date().getFullYear()} Staffly AI. All rights reserved.
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {[
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Cookie Policy", href: "/cookies" },
                  { label: "GDPR", href: "/gdpr" },
                ].map((item) => (
                  <Link key={item.href} to={item.href} className={`${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
