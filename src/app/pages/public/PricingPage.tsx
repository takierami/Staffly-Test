import { Link } from "react-router";
import { Check, X, ArrowRight, Sparkles, Building2, Building, Crown } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    description: "Perfect for small teams getting started with HR management.",
    price: 49,
    currency: "USD",
    period: "per employee/month",
    billing: "Billed annually ($588/employee/year)",
    icon: Building2,
    highlight: false,
    features: [
      { name: "Up to 25 employees", included: true },
      { name: "Employee profiles & org chart", included: true },
      { name: "Leave management", included: true },
      { name: "Basic attendance tracking", included: true },
      { name: "Document storage (5GB)", included: true },
      { name: "Email support", included: true },
      { name: "Mobile app access", included: true },
      { name: "Standard integrations", included: true },
      { name: "Payroll module", included: false },
      { name: "Performance reviews", included: false },
      { name: "Recruitment & ATS", included: false },
      { name: "Training management", included: false },
      { name: "API access", included: false },
      { name: "Custom roles", included: false },
      { name: "SSO integration", included: false },
      { name: "Dedicated account manager", included: false },
    ],
    cta: "Start Free Trial",
    ctaLink: "/demo"
  },
  {
    name: "Professional",
    description: "Full HR suite for growing organizations.",
    price: 99,
    currency: "USD",
    period: "per employee/month",
    billing: "Billed annually ($1,188/employee/year)",
    icon: Building,
    highlight: true,
    badge: "Most Popular",
    features: [
      { name: "Up to 200 employees", included: true },
      { name: "Everything in Starter", included: true },
      { name: "Payroll & compliance", included: true },
      { name: "Performance management", included: true },
      { name: "Recruitment & ATS", included: true },
      { name: "Training management", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Document storage (50GB)", included: true },
      { name: "Priority support", included: true },
      { name: "API access", included: true },
      { name: "Custom roles & permissions", included: true },
      { name: "Multi-location support", included: false },
      { name: "SSO integration", included: false },
      { name: "Custom workflows", included: false },
      { name: "Dedicated account manager", included: false },
      { name: "SLA guarantee", included: false },
    ],
    cta: "Start Free Trial",
    ctaLink: "/demo"
  },
  {
    name: "Enterprise",
    description: "Tailored solutions for large organizations with complex needs.",
    price: null,
    currency: "",
    period: "Custom pricing",
    billing: "Based on your requirements",
    icon: Crown,
    highlight: false,
    features: [
      { name: "Unlimited employees", included: true },
      { name: "Everything in Professional", included: true },
      { name: "Multi-location & multi-currency", included: true },
      { name: "SSO (SAML, OAuth)", included: true },
      { name: "Custom workflows", included: true },
      { name: "Advanced security controls", included: true },
      { name: "Data residency options", included: true },
      { name: "Custom API limits", included: true },
      { name: "Dedicated success manager", included: true },
      { name: "24/7 priority support", included: true },
      { name: "Implementation support", included: true },
      { name: "Custom SLA", included: true },
      { name: "On-premise deployment option", included: true },
      { name: "Custom contract terms", included: true },
      { name: "Data migration services", included: true },
      { name: "Training & onboarding", included: true },
    ],
    cta: "Contact Sales",
    ctaLink: "/contact"
  }
];

const FAQ_PRICING = [
  {
    q: "Is there a free trial?",
    a: "Yes, we offer a 14-day free trial with full access to all Professional plan features. No credit card required."
  },
  {
    q: "Can I switch plans later?",
    a: "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle."
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards (Visa, MasterCard, American Express) and bank transfers for annual plans."
  },
  {
    q: "Is there a minimum contract length?",
    a: "Monthly plans have no minimum commitment. Annual plans are billed yearly but can be cancelled with 30 days notice."
  },
  {
    q: "Do you offer discounts?",
    a: "Yes, we offer volume discounts for organizations with 500+ employees. Contact our sales team for custom pricing."
  },
  {
    q: "What happens to my data if I cancel?",
    a: "You retain full access to export your data for 30 days after cancellation. After that, data is securely deleted per our retention policy."
  },
];

export function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              Transparent Pricing
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Simple, Predictable Pricing
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
              No hidden fees. No surprises. Just straightforward pricing that scales with your organization.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-4 p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white">
                Annual (Save 20%)
              </button>
              <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                Monthly
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl ${
                  plan.highlight
                    ? "bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-600/25 scale-105"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400 text-amber-900 text-xs font-bold">
                      <Sparkles className="w-3 h-3" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      plan.highlight ? "bg-white/20" : "bg-slate-100 dark:bg-slate-700"
                    }`}>
                      <plan.icon className={`w-6 h-6 ${plan.highlight ? "text-white" : "text-slate-600 dark:text-slate-300"}`} />
                    </div>
                    <div>
                      <h3 className={`font-bold text-xl ${plan.highlight ? "text-white" : "text-slate-900 dark:text-white"}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {plan.name}
                      </h3>
                      <p className={`text-sm ${plan.highlight ? "text-blue-100" : "text-slate-500"}`}>
                        {plan.description}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    {plan.price ? (
                      <div className="flex items-baseline gap-1">
                        <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-slate-900 dark:text-white"}`}>
                          ${plan.price}
                        </span>
                        <span className={plan.highlight ? "text-blue-200" : "text-slate-500"}>{plan.currency}</span>
                      </div>
                    ) : (
                      <div className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-slate-900 dark:text-white"}`}>
                        Custom
                      </div>
                    )}
                    <p className={`text-sm ${plan.highlight ? "text-blue-200" : "text-slate-500"}`}>
                      {plan.period}
                    </p>
                    <p className={`text-xs ${plan.highlight ? "text-blue-300" : "text-slate-400"}`}>
                      {plan.billing}
                    </p>
                  </div>

                  <Link
                    to={plan.ctaLink}
                    className={`block w-full text-center py-3 rounded-xl font-semibold transition-all ${
                      plan.highlight
                        ? "bg-white text-blue-700 hover:bg-blue-50"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {plan.cta}
                  </Link>

                  <div className="mt-8 space-y-3">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {feature.included ? (
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            plan.highlight ? "bg-white/20" : "bg-emerald-100 dark:bg-emerald-900"
                          }`}>
                            <Check className={`w-3 h-3 ${plan.highlight ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`} />
                          </div>
                        ) : (
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            plan.highlight ? "bg-white/10" : "bg-slate-100 dark:bg-slate-700"
                          }`}>
                            <X className={`w-3 h-3 ${plan.highlight ? "text-blue-200" : "text-slate-400"}`} />
                          </div>
                        )}
                        <span className={`text-sm ${
                          feature.included
                            ? (plan.highlight ? "text-white" : "text-slate-700 dark:text-slate-300")
                            : (plan.highlight ? "text-blue-200" : "text-slate-400")
                        }`}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compare Plans */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Compare Plans
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Find the perfect plan for your organization's needs.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-4 font-medium text-slate-500">Feature</th>
                  <th className="text-center p-4 font-medium text-slate-500">Starter</th>
                  <th className="text-center p-4 font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">Professional</th>
                  <th className="text-center p-4 font-medium text-slate-500">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {[
                  { name: "Employee limit", starter: "25", pro: "200", enterprise: "Unlimited" },
                  { name: "Document storage", starter: "5GB", pro: "50GB", enterprise: "Unlimited" },
                  { name: "Support", starter: "Email", pro: "Priority", enterprise: "24/7 + Dedicated" },
                  { name: "SSO Integration", starter: false, pro: false, enterprise: true },
                  { name: "API Access", starter: false, pro: true, enterprise: "Custom limits" },
                  { name: "Custom Workflows", starter: false, pro: false, enterprise: true },
                  { name: "SLA Guarantee", starter: false, pro: false, enterprise: "Custom" },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="p-4 font-medium text-slate-900 dark:text-white">{row.name}</td>
                    <td className="p-4 text-center text-slate-600 dark:text-slate-300">
                      {typeof row.starter === "boolean" ? (
                        row.starter ? <Check className="w-5 h-5 mx-auto text-emerald-500" /> : <X className="w-5 h-5 mx-auto text-slate-300" />
                      ) : row.starter}
                    </td>
                    <td className="p-4 text-center bg-blue-50/50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                      {typeof row.pro === "boolean" ? (
                        row.pro ? <Check className="w-5 h-5 mx-auto text-emerald-500" /> : <X className="w-5 h-5 mx-auto text-blue-400 dark:text-blue-600" />
                      ) : row.pro}
                    </td>
                    <td className="p-4 text-center text-slate-600 dark:text-slate-300">
                      {typeof row.enterprise === "boolean" ? (
                        row.enterprise ? <Check className="w-5 h-5 mx-auto text-emerald-500" /> : <X className="w-5 h-5 mx-auto text-slate-300" />
                      ) : row.enterprise}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Pricing FAQ
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_PRICING.map((item, i) => (
              <details key={i} className="group rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-semibold text-slate-900 dark:text-white">{item.q}</span>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-slate-600 dark:text-slate-300">
                  {item.a}
                </div>
              </details>
            ))}
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
            Start your free trial today. No credit card required.
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
