import { Link } from "react-router";
import { ArrowRight, Users, Calendar, CreditCard, TrendingUp, Briefcase, GraduationCap, FileText, Shield, Bot, CircleCheck as CheckCircle2, Zap, Globe, Clock } from "lucide-react";

const FEATURE_CATEGORIES = [
  {
    id: "employee-management",
    title: "Employee Management",
    description: "Centralized employee profiles, organizational charts, and comprehensive workforce analytics.",
    icon: Users,
    color: "blue",
    features: [
      "Comprehensive employee profiles with 40+ data fields",
      "Interactive organizational charts",
      "Document management and digital file storage",
      "Emergency contact management",
      "Skills and certifications tracking",
      "Employment history and timeline",
      "Custom fields and categories",
      "Bulk import and export capabilities",
    ],
    benefits: [
      "Reduce time spent on employee lookups by 60%",
      "Eliminate duplicate data across systems",
      "Self-service portal for employees",
      "Real-time org chart updates",
    ],
    image: "/screenshots/employee-management.png"
  },
  {
    id: "leave-attendance",
    title: "Leave & Attendance",
    description: "Smart leave management with intelligent approvals and real-time attendance tracking.",
    icon: Calendar,
    color: "emerald",
    features: [
      "Multiple leave types with custom policies",
      "Automated leave balance calculations",
      "Smart approval workflows",
      "Team calendar with conflict detection",
      "Geolocation-based check-in",
      "Biometric integration support",
      "Overtime and shift management",
      "Leave adjustment proposals",
    ],
    benefits: [
      "Reduce leave processing time by 75%",
      "Eliminate leave balance errors",
      "Improve team planning visibility",
      "Ensure policy compliance",
    ],
    image: "/screenshots/leave-attendance.png"
  },
  {
    id: "payroll",
    title: "Payroll & Compliance",
    description: "Automated payroll processing with full tax compliance and multi-currency support.",
    icon: CreditCard,
    color: "violet",
    features: [
      "Automated salary calculations",
      "Tax and deduction management",
      "Multi-currency support",
      "Payslip generation and distribution",
      "Bonus and commission tracking",
      "Loan and advance management",
      "Historical payroll records",
      "Compliance reporting",
    ],
    benefits: [
      "Process payroll 80% faster",
      "Eliminate calculation errors",
      "Stay compliant with local regulations",
      "Reduce payroll disputes to zero",
    ],
    image: "/screenshots/payroll.png"
  },
  {
    id: "performance",
    title: "Performance & Goals",
    description: "OKR tracking, continuous feedback, and comprehensive performance review cycles.",
    icon: TrendingUp,
    color: "amber",
    features: [
      "Goal-setting frameworks (OKR, KPI, MBO)",
      "360-degree feedback",
      "Performance review cycles",
      "Competency assessments",
      "Calibration tools",
      "Performance improvement plans",
      "Succession planning",
      "Achievement recognition",
    ],
    benefits: [
      "Increase goal achievement by 40%",
      "Improve feedback culture",
      "Identify top performers objectively",
      "Plan succession effectively",
    ],
    image: "/screenshots/performance.png"
  },
  {
    id: "recruitment",
    title: "Recruitment & ATS",
    description: "End-to-end recruitment funnel with AI-powered candidate matching.",
    icon: Briefcase,
    color: "rose",
    features: [
      "Job posting management",
      "Careers page builder",
      "Applicant tracking system",
      "AI-powered resume screening",
      "Interview scheduling",
      "Candidate scoring and ranking",
      "Offer letter generation",
      "Onboarding integration",
    ],
    benefits: [
      "Reduce time-to-hire by 50%",
      "Improve quality of hires",
      "Streamline interview process",
      "Enhance candidate experience",
    ],
    image: "/screenshots/recruitment.png"
  },
  {
    id: "training",
    title: "Training & Development",
    description: "Learning management system with course creation and skills development tracking.",
    icon: GraduationCap,
    color: "cyan",
    features: [
      "Course creation and management",
      "Learning path design",
      "Certification tracking",
      "Skills matrix",
      "Training calendar",
      "Progress tracking",
      "Assessments and quizzes",
      "Training ROI analytics",
    ],
    benefits: [
      "Increase training completion rates",
      "Track skill development progress",
      "Ensure certification compliance",
      "Measure training effectiveness",
    ],
    image: "/screenshots/training.png"
  },
];

const INTEGRATIONS = [
  { name: "Microsoft 365", logo: "/logos/microsoft.svg" },
  { name: "Google Workspace", logo: "/logos/google.svg" },
  { name: "Slack", logo: "/logos/slack.svg" },
  { name: "Zoom", logo: "/logos/zoom.svg" },
  { name: "SAP", logo: "/logos/sap.svg" },
  { name: "Oracle", logo: "/logos/oracle.svg" },
];

const SECURITY_FEATURES = [
  { icon: Shield, title: "SOC 2 Type II Certified", description: "Independently audited security controls" },
  { icon: Globe, title: "GDPR Compliant", description: "Full data protection compliance" },
  { icon: FileText, title: "ISO 27001", description: "Information security management certified" },
  { icon: Bot, title: "AI/ML Security", description: "Responsible AI with privacy controls" },
];

export function FeaturesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              Platform Features
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
              A Complete HR Platform
              <br />
              <span className="text-blue-600">For Every Need</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-10">
              From recruitment to retirement, Staffly AI provides every tool your HR team needs to excel.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      {FEATURE_CATEGORIES.map((category, index) => {
        const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
          blue: { bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
          emerald: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
          violet: { bg: "bg-violet-50 dark:bg-violet-950", text: "text-violet-600 dark:text-violet-400", border: "border-violet-200 dark:border-violet-800" },
          amber: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800" },
          rose: { bg: "bg-rose-50 dark:bg-rose-950", text: "text-rose-600 dark:text-rose-400", border: "border-rose-200 dark:border-rose-800" },
          cyan: { bg: "bg-cyan-50 dark:bg-cyan-950", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-200 dark:border-cyan-800" },
        };

        const colors = colorClasses[category.color];

        return (
          <section
            key={category.id}
            id={category.id}
            className={`py-20 ${index % 2 === 1 ? "bg-slate-50 dark:bg-slate-900/50" : ""}`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${colors.bg} ${colors.border} ${colors.text} border font-medium text-sm mb-6`}>
                    <category.icon className="w-4 h-4" />
                    {category.title}
                  </div>

                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {category.description}
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-3 mb-8">
                    {category.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className={`w-5 h-5 mt-0.5 shrink-0 ${colors.text}`} />
                        <span className="text-slate-600 dark:text-slate-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-6">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Key Benefits
                    </h4>
                    <ul className="space-y-2">
                      {category.benefits.map((benefit, i) => (
                        <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                          <ArrowRight className="w-3 h-3 text-blue-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to="/demo"
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    See {category.title} in action
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <div className={`rounded-2xl ${colors.bg} ${colors.border} border p-8 aspect-video flex items-center justify-center`}>
                    <category.icon className={`w-32 h-32 ${colors.text} opacity-50`} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Integrations */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Integrates With Your Stack
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Staffly AI seamlessly integrates with the tools your team already uses.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {INTEGRATIONS.map((integration, i) => (
              <div key={i} className="bg-slate-800 rounded-xl p-6 flex flex-col items-center gap-3 border border-slate-700">
                <div className="w-12 h-12 bg-slate-700 rounded-lg" />
                <span className="text-sm text-slate-300 font-medium">{integration.name}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/integrations" className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-2">
              View all integrations
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
              Enterprise-Grade Security
            </span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Your Data is Safe With Us
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Staffly AI is built with security as a foundation, not an afterthought.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SECURITY_FEATURES.map((feature, i) => (
              <div key={i} className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/security" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Learn more about our security practices
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Experience Staffly AI Today
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Start your free trial and see the difference.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-all"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-700/50 text-white font-semibold border-2 border-blue-400/50 hover:bg-blue-700 transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
