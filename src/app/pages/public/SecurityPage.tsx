import { Link } from "react-router";
import { Shield, Lock, Server, Key, Eye, FileCheck, Globe, Award, CircleCheck as CheckCircle2, ArrowRight, Building2, Users, Zap } from "lucide-react";

const SECURITY_FEATURES = [
  {
    icon: Shield,
    title: "SOC 2 Type II Certified",
    description: "Our security controls are independently audited annually. We maintain strict controls over data access, encryption, and system monitoring."
  },
  {
    icon: Globe,
    title: "GDPR Compliant",
    description: "Full compliance with EU data protection regulations. Data processing agreements, right to erasure, and data portability are all supported."
  },
  {
    icon: FileCheck,
    title: "ISO 27001 Certified",
    description: "Our information security management system is ISO 27001 certified, demonstrating our commitment to systematic security practices."
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Your sensitive HR data is protected at every step."
  },
  {
    icon: Key,
    title: "SSO & SAML Integration",
    description: "Integrate with your existing identity provider. Support for Okta, Azure AD, Google Workspace, and custom SAML providers."
  },
  {
    icon: Eye,
    title: "Audit Logging",
    description: "Comprehensive audit trails for every action. Know who accessed what, when, and from where with immutable logs."
  },
  {
    icon: Server,
    title: "Data Residency Options",
    description: "Choose where your data is stored. We offer data residency in EU, US, and MENA regions to meet local requirements."
  },
  {
    icon: Users,
    title: "Role-Based Access Control",
    description: "Granular permissions ensure employees only see what they need. Admin, Manager, and Employee roles with customizable access levels."
  },
];

const COMPLIANCE_CERTIFICATIONS = [
  { name: "SOC 2 Type II", org: "AICPA", year: "2024" },
  { name: "ISO 27001", org: "International Organization for Standardization", year: "2024" },
  { name: "GDPR", org: "European Union", year: "Ongoing" },
  { name: "CCPA", org: "California", year: "Ongoing" },
  { name: "HIPAA", org: "US Department of HHS", year: "Available" },
];

const DATA_PROTECTION = [
  { title: "Encryption at Rest", value: "AES-256" },
  { title: "Encryption in Transit", value: "TLS 1.3" },
  { title: "Password Hashing", value: "bcrypt" },
  { title: "Uptime SLA", value: "99.9%" },
  { title: "Backup Frequency", value: "Hourly" },
  { title: "Disaster Recovery", value: "< 4 hours" },
];

export function SecurityPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium mb-6 border border-emerald-500/30">
              <Shield className="w-4 h-4" />
              Enterprise-Grade Security
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Your Data is Safe
              <br />
              <span className="text-blue-400">With Staffly AI</span>
            </h1>
            <p className="text-xl text-slate-300">
              We build security into every layer of our platform. Your HR data deserves the highest level of protection.
            </p>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12">
            {COMPLIANCE_CERTIFICATIONS.map((cert, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <Award className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-white font-medium text-sm">{cert.name}</div>
                  <div className="text-slate-400 text-xs">{cert.org}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SECURITY_FEATURES.map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Protection Stats */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Technical Specifications
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Industry-leading security standards for your peace of mind.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DATA_PROTECTION.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400 font-medium">{item.title}</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Built on Secure Infrastructure
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Staffly AI runs on enterprise-grade cloud infrastructure with automatic scaling, disaster recovery, and continuous monitoring.
              </p>
              <ul className="space-y-4">
                {[
                  "99.9% uptime SLA with automatic failover",
                  "Real-time threat monitoring and response",
                  "Regular penetration testing by third parties",
                  "Instant security patches and updates",
                  "Geographic redundancy for disaster recovery",
                  "DDoS protection at network edge"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 rounded-2xl p-12 flex items-center justify-center">
              <div className="text-center">
                <Server className="w-24 h-24 text-blue-400 dark:text-blue-600 mx-auto mb-4" />
                <p className="text-blue-600 dark:text-blue-400 font-medium">Enterprise Infrastructure</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Commitment */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Shield className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Our Privacy Commitment
            </h2>
            <div className="text-slate-300 space-y-4 text-left max-w-2xl mx-auto">
              <p>
                At Staffly AI, we believe that trust is the foundation of any HR partnership. We will never sell your data, use it for advertising, or share it with third parties without your explicit consent.
              </p>
              <p>
                Your employee data belongs to you. We act as custodians, implementing the strongest possible protections while ensuring you maintain full control over access and permissions.
              </p>
              <p>
                We are committed to transparency. Our security practices, data handling procedures, and compliance certifications are available for your review. Enterprise customers can request additional security documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Have Security Questions?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Our security team is ready to discuss your specific requirements.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-all"
            >
              Contact Security Team
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/docs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-700/50 text-white font-semibold border-2 border-blue-400/50 hover:bg-blue-700 transition-all"
            >
              View Security Docs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
