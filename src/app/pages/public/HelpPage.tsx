import { useState } from "react";
import { Link } from "react-router";
import {
  Search, ChevronDown, ChevronRight, BookOpen, Video, FileText,
  MessageSquare, Mail, Phone, ArrowRight, Clock, Users, Zap
} from "lucide-react";

const HELP_CATEGORIES = [
  {
    icon: BookOpen,
    title: "Getting Started",
    description: "New to Staffly AI? Start here with our quick setup guides.",
    articles: 12,
    color: "blue"
  },
  {
    icon: Users,
    title: "Employee Management",
    description: "Manage employee profiles, org charts, and data.",
    articles: 24,
    color: "emerald"
  },
  {
    icon: Clock,
    title: "Leave & Attendance",
    description: "Configure leave policies and track attendance.",
    articles: 18,
    color: "amber"
  },
  {
    icon: FileText,
    title: "Payroll & Compliance",
    description: "Process payroll and ensure regulatory compliance.",
    articles: 15,
    color: "violet"
  },
  {
    icon: Zap,
    title: "Integrations",
    description: "Connect Staffly AI with your existing tools.",
    articles: 8,
    color: "rose"
  },
  {
    icon: Users,
    title: "Account & Settings",
    description: "Manage your account, users, and permissions.",
    articles: 10,
    color: "cyan"
  },
];

const POPULAR_ARTICLES = [
  { title: "How to set up your organization", category: "Getting Started", views: 15420 },
  { title: "Importing employees from CSV/Excel", category: "Employee Management", views: 12350 },
  { title: "Configuring leave types and balances", category: "Leave & Attendance", views: 10800 },
  { title: "Running your first payroll", category: "Payroll & Compliance", views: 9200 },
  { title: "Setting up SSO integration", category: "Integrations", views: 7650 },
  { title: "Understanding role permissions", category: "Account & Settings", views: 6500 },
];

const FAQ_HELP = [
  {
    q: "How do I reset my password?",
    a: "Click 'Forgot password' on the login page and enter your email. Your administrator will be notified to reset your access. For security reasons, password resets require administrator approval."
  },
  {
    q: "Can I export my employee data?",
    a: "Yes, administrators can export employee data at any time via Settings > Data Management > Export. Data is available in CSV, Excel, or JSON format."
  },
  {
    q: "How do I invite new employees?",
    a: "Navigate to Employees > Add Employee. Fill in the required details and the employee will receive an email invitation to set up their account."
  },
  {
    q: "Is there a mobile app?",
    a: "Yes, Staffly AI is available on iOS and Android. Download from the App Store or Google Play. The mobile app supports check-in, leave requests, and basic HR functions."
  },
  {
    q: "How do I customize leave policies?",
    a: "Go to Settings > Leave Configuration. You can create custom leave types, set accrual rules, and configure approval workflows for each leave type."
  },
  {
    q: "Can I run payroll for multiple locations?",
    a: "Yes, the Professional and Enterprise plans support multi-location payroll. You can configure different pay schedules, tax settings, and currencies for each location."
  },
];

export function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              Help Center
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
              How Can We
              <span className="text-blue-600"> Help You?</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-10">
              Find answers, tutorials, and support for Staffly AI.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help articles..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 -mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {HELP_CATEGORIES.map((category, i) => {
              const colorClasses: Record<string, string> = {
                blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
                emerald: "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400",
                amber: "bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400",
                violet: "bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-400",
                rose: "bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-400",
                cyan: "bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-400",
              };

              return (
                <Link
                  key={i}
                  to={`/help/${category.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="group p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClasses[category.color]}`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">{category.description}</p>
                  <span className="text-xs text-slate-500">{category.articles} articles</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Articles */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Popular Articles
              </h2>
              <div className="space-y-4">
                {POPULAR_ARTICLES.map((article, i) => (
                  <Link
                    key={i}
                    to={`/help/article/${article.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="group flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {article.title}
                      </h3>
                      <p className="text-sm text-slate-500">{article.category}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Video Tutorials */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Video Tutorials
              </h2>
              <div className="space-y-4">
                {[
                  "Getting Started with Staffly AI",
                  "Setting Up Payroll",
                  "Managing Employee Records",
                  "Configuring Leave Policies"
                ].map((video, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <Video className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{video}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ_HELP.map((item, i) => (
              <div
                key={i}
                className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-slate-900 dark:text-white pr-4">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform shrink-0 ${expandedFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {expandedFaq === i && (
                  <div className="px-5 pb-5 text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700 pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Need More Help?
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Our support team is here to assist you.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <a
              href="#"
              className="flex flex-col items-center p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Live Chat</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">Available 24/7</p>
            </a>
            <a
              href="mailto:support@staffly.ai"
              className="flex flex-col items-center p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Email Support</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">support@staffly.ai</p>
            </a>
            <a
              href="tel:+213555123456"
              className="flex flex-col items-center p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Phone</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">Mon-Fri 9am-6pm</p>
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of organizations using Staffly AI.
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-all"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
