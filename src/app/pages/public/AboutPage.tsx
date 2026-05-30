import { Link } from "react-router";
import { ArrowRight, Users, Globe, Award, HeartHandshake, Target, Lightbulb, Building2 } from "lucide-react";

const TEAM_MEMBERS = [
  {
    name: "Mohamed Kheireddine",
    role: "Founder & CEO",
    bio: "Former HR director with 15+ years experience in enterprise workforce management.",
    image: null
  },
  {
    name: "Sarah Benali",
    role: "Chief Technology Officer",
    bio: "Ex-Google engineer specializing in scalable SaaS architectures and AI/ML.",
    image: null
  },
  {
    name: "Karim Boudiaf",
    role: "Chief Product Officer",
    bio: "Product leader who has shipped HR solutions used by millions globally.",
    image: null
  },
  {
    name: "Fatima Amrani",
    role: "VP of Customer Success",
    bio: "Passionate about helping organizations transform their HR operations.",
    image: null
  },
  {
    name: "Yacine Hadj",
    role: "VP of Engineering",
    bio: "Building resilient systems with a focus on security and performance.",
    image: null
  },
  {
    name: "Nadia Cherif",
    role: "VP of Sales",
    bio: "Driving growth across MENA and European markets.",
    image: null
  },
];

const MILESTONES = [
  { year: "2020", title: "Staffly AI Founded", description: "Started with a vision to simplify HR for Algerian businesses." },
  { year: "2021", title: "First 100 Customers", description: "Reached our first major milestone with local enterprise adoption." },
  { year: "2022", title: "MENA Expansion", description: "Expanded to serve customers across the Middle East and North Africa." },
  { year: "2023", title: "AI Integration", description: "Launched AI-powered features including smart candidate matching." },
  { year: "2024", title: "Series A Funding", description: "Raised $12M to accelerate growth and product development." },
  { year: "2025", title: "Global Expansion", description: "Now serving 500+ organizations across 15 countries." },
];

const VALUES = [
  {
    icon: HeartHandshake,
    title: "Customer First",
    description: "Every decision we make starts with the question: 'How does this help our customers succeed?'"
  },
  {
    icon: Target,
    title: "Purpose-Driven",
    description: "We're building technology that genuinely improves how organizations manage their people."
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We continuously push boundaries to bring AI and automation to everyday HR workflows."
  },
  {
    icon: Globe,
    title: "Global Perspective",
    description: "We design for the world, with deep respect for local needs and cultural contexts."
  },
];

const STATS = [
  { value: "500+", label: "Organizations" },
  { value: "15", label: "Countries" },
  { value: "10,000+", label: "Users" },
  { value: "50+", label: "Team Members" },
];

export function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              Our Story
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Building the Future
              <br />
              <span className="text-blue-600">of Workforce Management</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              We believe every organization deserves access to world-class HR tools. Staffly AI was founded on this principle.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 -mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {stat.value}
                  </div>
                  <div className="text-slate-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Our Mission
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                We started Staffly AI after witnessing first-hand the challenges that organizations face in managing their workforce with outdated tools and fragmented systems.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Our founders, having worked in HR leadership positions across Algeria and the MENA region, understood that most HR software was designed for Western enterprises with little consideration for local needs, languages, or regulatory environments.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Staffly AI was built from the ground up to serve organizations in emerging markets while maintaining the quality and sophistication expected from world-class enterprise software.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 rounded-2xl p-12 flex items-center justify-center">
              <Building2 className="w-48 h-48 text-blue-300 dark:text-blue-700" />
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Our Journey
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              From a small team in Algiers to serving organizations across the globe.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-200 dark:bg-blue-800" />

            <div className="space-y-12">
              {MILESTONES.map((milestone, i) => (
                <div key={i} className={`relative flex items-center ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                  <div className={`w-1/2 ${i % 2 === 0 ? "pr-12 text-right" : "pl-12 text-left"}`}>
                    <div className="inline-block px-3 py-1 rounded-full bg-blue-600 text-white text-sm font-medium mb-2">
                      {milestone.year}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{milestone.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400">{milestone.description}</p>
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600 border-4 border-white dark:border-slate-900" />
                  <div className="w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Our Values
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              The principles that guide everything we do.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((value, i) => (
              <div key={i} className="text-center p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{value.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
              Leadership Team
            </span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Meet Our Team
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Industry veterans building the future of HR technology.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEAM_MEMBERS.map((member, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center mb-4 mx-auto">
                  <Users className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{member.name}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mb-2">{member.role}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Join Our Journey
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            We're always looking for talented people to join our team.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/careers"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-all"
            >
              View Open Positions
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-700/50 text-white font-semibold border-2 border-blue-400/50 hover:bg-blue-700 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
