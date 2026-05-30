import { useState } from "react";
import { Link } from "react-router";
import { Mail, Phone, MapPin, Send, MessageSquare, Building, Globe, Clock, CircleCheck as CheckCircle2 } from "lucide-react";

const OFFICES = [
  {
    city: "Algiers",
    country: "Algeria",
    address: "160 Lot Benmerdia, Dely Ibrahim",
    phone: "+213 555 123 456",
    email: "contact@staffly.dz",
    type: "Headquarters"
  },
  {
    city: "Dubai",
    country: "UAE",
    address: "Dubai Internet City, Building 16",
    phone: "+971 4 123 4567",
    email: "mena@staffly.ai",
    type: "MENA Office"
  },
  {
    city: "Paris",
    country: "France",
    address: "123 Avenue des Champs-Élysées",
    phone: "+33 1 23 45 67 89",
    email: "europe@staffly.ai",
    type: "European Office"
  },
];

const SUPPORT_OPTIONS = [
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Chat with our support team in real-time.",
    action: "Start Chat",
    link: "#"
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Send us an email and we'll respond within 24 hours.",
    action: "support@staffly.ai",
    link: "mailto:support@staffly.ai"
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Available Monday-Friday, 9am-6pm CET.",
    action: "+213 555 123 456",
    link: "tel:+213555123456"
  },
];

const INQUIRY_TYPES = [
  "General Inquiry",
  "Sales / Demo Request",
  "Technical Support",
  "Partnership Opportunity",
  "Media / Press",
  "Career Inquiry",
  "Other"
];

export function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phone: "",
    inquiryType: "General Inquiry",
    employees: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              Contact Us
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
              We'd Love to
              <span className="text-blue-600"> Hear From You</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Have questions? Our team is here to help you transform your HR operations.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-12 -mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {SUPPORT_OPTIONS.map((option, i) => (
              <a
                key={i}
                href={option.link}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                  <option.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{option.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{option.description}</p>
                <span className="text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:underline">
                  {option.action}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
                {!submitted ? (
                  <>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      Send Us a Message
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">First Name *</label>
                          <input
                            type="text"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Last Name *</label>
                          <input
                            type="text"
                            required
                            value={formData.lastName}
                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Doe"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Work Email *</label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="john@company.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company</label>
                          <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Acme Inc."
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Inquiry Type</label>
                          <select
                            value={formData.inquiryType}
                            onChange={(e) => setFormData(prev => ({ ...prev, inquiryType: e.target.value }))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {INQUIRY_TYPES.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Number of Employees</label>
                          <select
                            value={formData.employees}
                            onChange={(e) => setFormData(prev => ({ ...prev, employees: e.target.value }))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select...</option>
                            <option value="1-25">1-25 employees</option>
                            <option value="26-100">26-100 employees</option>
                            <option value="101-500">101-500 employees</option>
                            <option value="501-1000">501-1000 employees</option>
                            <option value="1000+">1000+ employees</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message *</label>
                        <textarea
                          required
                          rows={4}
                          value={formData.message}
                          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Tell us how we can help..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      Message Sent!
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Office Hours</h3>
                <div className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                  <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Monday - Friday</p>
                    <p className="text-sm">9:00 AM - 6:00 PM (CET)</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Response Time</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  We typically respond to all inquiries within 24 business hours. For urgent matters, please call our support line.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Locations</h3>
                <div className="space-y-4">
                  {OFFICES.map((office, i) => (
                    <div key={i} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-slate-900 dark:text-white">{office.city}, {office.country}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">{office.type}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{office.address}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{office.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Ready for a Demo?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Schedule a personalized demo with our team.
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-all"
          >
            Schedule Demo
          </Link>
        </div>
      </section>
    </div>
  );
}
