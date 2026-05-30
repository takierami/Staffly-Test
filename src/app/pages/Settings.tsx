import { useState, useEffect } from "react";
import { Building, Users, Globe, Bell, Shield, Palette, Mail, ExternalLink, Send, CheckCircle, AlertCircle, Key, Lock, Eye, EyeOff, Moon, Sun, Monitor, Languages, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import {
  getNotificationEmail, setNotificationEmail as saveNotificationEmail,
  getWeb3FormsKey, setWeb3FormsKey as saveWeb3FormsKey,
  getNotificationPrefs, setNotificationPrefs as saveNotificationPrefs,
  sendTestEmail,
} from "../lib/email-service";

export function Settings() {
  const [activeTab, setActiveTab] = useState("company");
  const [company, setCompany] = useState({ name: "Staffly AI Corp", email: "contact@stafflyai.dz", phone: "+213555000000", address: "123 Rue Didouche Mourad, Algiers 16000, Algeria" });
  const { t, theme, setTheme, lang, setLang, appearance, setAppearance, localization, setLocalization, security, setSecurity } = useApp();
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });

  const isDark = theme === "dark";
  const cardBg = isDark ? "#1F2937" : "#ffffff";
  const borderColor = isDark ? "#374151" : "#F3F4F6";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const textMuted = isDark ? "#6B7280" : "#9CA3AF";
  const inputBg = isDark ? "#374151" : "#F9FAFB";
  const inputBorder = isDark ? "#4B5563" : "#E5E7EB";

  // Email notification state
  const [notifEmail, setNotifEmail] = useState(() => getNotificationEmail() || company.email);
  const [web3Key, setWeb3Key] = useState(() => getWeb3FormsKey());
  const [showKey, setShowKey] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState(() => getNotificationPrefs());

  const tabs = [
    { id: "company", label: t("set.company"), icon: Building },
    { id: "users", label: t("set.userManagement"), icon: Users },
    { id: "notifications", label: t("set.notifications"), icon: Bell },
    { id: "security", label: t("set.security"), icon: Shield },
    { id: "appearance", label: t("set.appearance"), icon: Palette },
    { id: "localization", label: t("set.localization"), icon: Globe },
  ];

  const handleSaveEmailSettings = () => {
    saveNotificationEmail(notifEmail);
    saveWeb3FormsKey(web3Key);
    saveNotificationPrefs(notifPrefs);
    toast.success(t("set.notif.emailSaved"));
  };

  const handleSendTest = async () => {
    if (!web3Key) {
      toast.error("Please enter your Web3Forms access key first.");
      return;
    }
    if (!notifEmail) {
      toast.error("Please enter a notification email first.");
      return;
    }
    // Save before sending so the service picks up latest values
    saveNotificationEmail(notifEmail);
    saveWeb3FormsKey(web3Key);

    setSendingTest(true);
    const result = await sendTestEmail();
    setSendingTest(false);
    if (result.success) {
      toast.success(t("set.notif.testSent"));
    } else {
      toast.error(`${t("set.notif.testFailed")}: ${result.message}`);
    }
  };

  const togglePref = (key: string) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    saveNotificationPrefs(updated);
  };

  const notifToggleItems = [
    { key: "leaveApproval", label: t("set.notif.leaveApproval") },
    { key: "payroll", label: t("set.notif.payroll") },
    { key: "onboarding", label: t("set.notif.onboarding") },
    { key: "performance", label: t("set.notif.performance") },
    { key: "training", label: t("set.notif.training") },
    { key: "promotions", label: t("set.notif.promotions") },
  ];

  return (
    <div className="space-y-6">
      <h2 style={{ fontSize: 24, fontWeight: 700, color: textPrimary }}>{t("set.title")}</h2>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-60 shrink-0">
          <div className="rounded-xl border p-2" style={{ backgroundColor: cardBg, borderColor }}>
            {tabs.map((tb) => (
              <button key={tb.id} onClick={() => setActiveTab(tb.id)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors" style={{ backgroundColor: activeTab === tb.id ? (isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)") : "transparent", color: activeTab === tb.id ? "var(--acc-primary-strong)" : textSecondary }}>
                <tb.icon className="w-4 h-4" /><span style={{ fontSize: 13, fontWeight: activeTab === tb.id ? 600 : 400 }}>{tb.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {activeTab === "company" && (
            <div className="rounded-xl border p-6 space-y-6" style={{ backgroundColor: cardBg, borderColor }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>{t("set.companyInfo")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[{ label: t("set.companyName"), field: "name" }, { label: t("set.email"), field: "email" }, { label: t("set.phone"), field: "phone" }].map((input) => (
                  <div key={input.field}><label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{input.label}</label><input value={(company as any)[input.field]} onChange={(e) => setCompany({ ...company, [input.field]: e.target.value })} className="w-full px-3 py-2.5 rounded-lg outline-none" style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} /></div>
                ))}
                <div className="sm:col-span-2"><label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("set.address")}</label><textarea value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} rows={3} className="w-full px-3 py-2.5 rounded-lg outline-none resize-none" style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} /></div>
              </div>
              <button onClick={() => toast.success(t("set.saveChanges") + "!")} className="px-5 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg" style={{ fontSize: 13, fontWeight: 600 }}>{t("set.saveChanges")}</button>
            </div>
          )}

          {activeTab === "users" && (
            <div className="rounded-xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: textPrimary }} className="mb-4">{t("set.userManagement")}</h3>
              <div className="space-y-3">
                {[{ name: "Admin User", email: "admin@staffly.dz", role: "Super Admin" }, { name: "Fatima Zerhouni", email: "fatima@company.dz", role: "HR Manager" }, { name: "Rachid Bouzid", email: "rachid@company.dz", role: "Dept Manager" }].map((u) => (
                  <div key={u.email} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: isDark ? "#374151" : "#F9FAFB" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--acc-primary)] to-[var(--acc-primary-soft)] flex items-center justify-center text-white" style={{ fontSize: 12, fontWeight: 600 }}>{u.name.split(" ").map((n) => n[0]).join("")}</div>
                      <div><div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{u.name}</div><div style={{ fontSize: 12, color: textMuted }}>{u.email}</div></div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md" style={{ fontSize: 11, fontWeight: 600, backgroundColor: isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)", color: "var(--acc-primary-strong)" }}>{u.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              {/* Email Configuration Card */}
              <div className="rounded-xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--acc-primary)] to-[var(--acc-primary-strong)] flex items-center justify-center">
                    <Mail className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>{t("set.notif.emailSection")}</h3>
                    <p style={{ fontSize: 12, color: textSecondary }}>{t("set.notif.emailDesc")}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {/* Notification Email */}
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("set.notif.emailLabel")}</label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={notifEmail}
                        onChange={(e) => setNotifEmail(e.target.value)}
                        placeholder={t("set.notif.emailPlaceholder")}
                        className="flex-1 px-3 py-2.5 rounded-lg outline-none"
                        style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
                      />
                    </div>
                    <p style={{ fontSize: 11, color: textMuted, marginTop: 4 }}>
                      Default: {company.email} (login email)
                    </p>
                  </div>

                  {/* Web3Forms Key */}
                  <div>
                    <label className="flex items-center gap-2 mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>
                      <Key className="w-3.5 h-3.5" />
                      {t("set.notif.web3formsKey")}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showKey ? "text" : "password"}
                          value={web3Key}
                          onChange={(e) => setWeb3Key(e.target.value)}
                          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                          className="w-full px-3 py-2.5 rounded-lg outline-none pr-16"
                          style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
                        />
                        <button
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded"
                          style={{ fontSize: 11, color: "var(--acc-primary-strong)" }}
                        >
                          {showKey ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: 11, color: textMuted, marginTop: 4 }}>
                      {t("set.notif.web3formsDesc")}{" "}
                      <a href="https://web3forms.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5" style={{ color: "var(--acc-primary-strong)" }}>
                        web3forms.com <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={handleSaveEmailSettings}
                      className="px-5 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg flex items-center gap-2"
                      style={{ fontSize: 13, fontWeight: 600 }}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {t("set.saveChanges")}
                    </button>
                    <button
                      onClick={handleSendTest}
                      disabled={sendingTest}
                      className="px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        backgroundColor: isDark ? "#374151" : "#F3F4F6",
                        color: sendingTest ? textMuted : textPrimary,
                        border: `1px solid ${inputBorder}`,
                        opacity: sendingTest ? 0.7 : 1,
                      }}
                    >
                      <Send className="w-4 h-4" />
                      {sendingTest ? t("set.notif.sending") : t("set.notif.sendTest")}
                    </button>
                  </div>

                  {/* Connection status indicator */}
                  <div className="flex items-center gap-2 pt-1" style={{ fontSize: 12 }}>
                    {web3Key ? (
                      <>
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span style={{ color: "#22C55E" }}>Web3Forms key configured</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span style={{ color: "#F59E0B" }}>Web3Forms key not set — email notifications disabled</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Notification Toggles Card */}
              <div className="rounded-xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: textPrimary }} className="mb-4">{t("set.notifPrefs")}</h3>
                <div className="space-y-1">
                  {notifToggleItems.map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-opacity-50 transition-colors" style={{ borderBottom: `1px solid ${borderColor}` }}>
                      <span style={{ fontSize: 14, color: textPrimary }}>{item.label}</span>
                      <button
                        onClick={() => togglePref(item.key)}
                        className="relative w-11 h-6 rounded-full transition-colors"
                        style={{ backgroundColor: notifPrefs[item.key] ? "var(--acc-primary-strong)" : (isDark ? "#4B5563" : "#D1D5DB") }}
                      >
                        <div
                          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                          style={{ left: notifPrefs[item.key] ? 22 : 2 }}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="rounded-xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--acc-primary)] to-[var(--acc-primary-strong)] flex items-center justify-center"><Lock className="w-4.5 h-4.5 text-white" /></div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>{t("set.sec.changePassword")}</h3>
                    <p style={{ fontSize: 12, color: textSecondary }}>{t("set.sec.changePasswordDesc")}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {([
                    { key: "current", label: t("set.sec.currentPassword") },
                    { key: "next", label: t("set.sec.newPassword") },
                    { key: "confirm", label: t("set.sec.confirmPassword") },
                  ] as const).map((f) => (
                    <div key={f.key}>
                      <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{f.label}</label>
                      <div className="relative">
                        <input type={showPw[f.key] ? "text" : "password"} value={pwForm[f.key]} onChange={(e) => setPwForm({ ...pwForm, [f.key]: e.target.value })} className="w-full px-3 py-2.5 pr-10 rounded-lg outline-none" style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }} />
                        <button type="button" onClick={() => setShowPw({ ...showPw, [f.key]: !showPw[f.key] })} className="absolute right-2 top-1/2 -translate-y-1/2 p-1" style={{ color: textMuted }}>
                          {showPw[f.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => {
                  if (!pwForm.current || !pwForm.next) { toast.error("Fill in all password fields"); return; }
                  if (pwForm.next.length < 8) { toast.error("New password must be at least 8 characters"); return; }
                  if (pwForm.next !== pwForm.confirm) { toast.error("Passwords don't match"); return; }
                  setPwForm({ current: "", next: "", confirm: "" });
                  toast.success("Password updated successfully");
                }} className="mt-5 px-5 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg" style={{ fontSize: 13, fontWeight: 600 }}>{t("set.sec.updatePassword")}</button>
              </div>

              <div className="rounded-xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
                <h3 className="mb-5" style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>{t("set.sec.accountSecurity")}</h3>
                <div className="space-y-1">
                  {[
                    { key: "twoFactor", label: t("set.sec.twoFactor"), desc: t("set.sec.twoFactorDesc") },
                    { key: "loginAlerts", label: t("set.sec.loginAlerts"), desc: t("set.sec.loginAlertsDesc") },
                    { key: "requireStrongPassword", label: t("set.sec.strongPwd"), desc: t("set.sec.strongPwdDesc") },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-3 px-2 rounded-lg" style={{ borderBottom: `1px solid ${borderColor}` }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: textPrimary }}>{item.label}</div>
                        <div style={{ fontSize: 12, color: textSecondary }}>{item.desc}</div>
                      </div>
                      <button onClick={() => setSecurity({ ...security, [item.key]: !security[item.key] })} className="relative w-11 h-6 rounded-full transition-colors shrink-0" style={{ backgroundColor: security[item.key] ? "var(--acc-primary-strong)" : (isDark ? "#4B5563" : "#D1D5DB") }}>
                        <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform" style={{ left: security[item.key] ? 22 : 2 }} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("set.sec.sessionTimeout")}</label>
                    <select value={security.sessionTimeout} onChange={(e) => setSecurity({ ...security, sessionTimeout: parseInt(e.target.value, 10) })} className="w-full px-3 py-2.5 rounded-lg outline-none" style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}>
                      {[15, 30, 60, 120, 240].map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("set.sec.passwordExpiry")}</label>
                    <select value={security.passwordExpiry} onChange={(e) => setSecurity({ ...security, passwordExpiry: parseInt(e.target.value, 10) })} className="w-full px-3 py-2.5 rounded-lg outline-none" style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}>
                      {[30, 60, 90, 180, 365, 0].map((v) => <option key={v} value={v}>{v === 0 ? t("set.sec.never") : v}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
                <h3 className="mb-4" style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>{t("set.sec.recentActivity")}</h3>
                <div className="space-y-2">
                  {[
                    { device: "Chrome on macOS", location: "Algiers, Algeria", time: "Just now", current: true },
                    { device: "Safari on iPhone", location: "Algiers, Algeria", time: "2 hours ago", current: false },
                    { device: "Firefox on Windows", location: "Oran, Algeria", time: "Yesterday, 14:22", current: false },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: isDark ? "#374151" : "#F9FAFB" }}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{s.device}</span>
                          {s.current && <span className="px-2 py-0.5 rounded" style={{ fontSize: 10, fontWeight: 600, backgroundColor: "#D1FAE5", color: "#059669" }}>{t("set.sec.current")}</span>}
                        </div>
                        <div style={{ fontSize: 12, color: textMuted }}>{s.location} · {s.time}</div>
                      </div>
                      {!s.current && <button className="px-3 py-1.5 rounded-md" style={{ fontSize: 12, fontWeight: 500, color: "#DC2626", border: `1px solid ${inputBorder}` }}>{t("set.sec.revoke")}</button>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div className="rounded-xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--acc-primary)] to-[var(--acc-primary-strong)] flex items-center justify-center"><Palette className="w-4.5 h-4.5 text-white" /></div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>{t("set.app.theme")}</h3>
                    <p style={{ fontSize: 12, color: textSecondary }}>{t("set.app.themeDesc")}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {([
                    { v: "light", label: t("set.app.light"), Icon: Sun },
                    { v: "dark", label: t("set.app.dark"), Icon: Moon },
                    { v: "system", label: t("set.app.system"), Icon: Monitor },
                  ] as const).map(({ v, label, Icon }) => {
                    const active = (v === "system") ? false : theme === v;
                    return (
                      <button key={v} onClick={() => {
                        if (v === "system") {
                          const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                          setTheme(prefers);
                          toast.success(`Using system preference (${prefers})`);
                        } else { setTheme(v); }
                      }} className="p-4 rounded-lg flex flex-col items-center gap-2 transition" style={{ backgroundColor: active ? (isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)") : inputBg, border: `1px solid ${active ? "var(--acc-primary-strong)" : inputBorder}`, color: active ? "var(--acc-primary-strong)" : textPrimary }}>
                        <Icon className="w-5 h-5" />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
                <h3 className="mb-4" style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>{t("set.app.accent")}</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { v: "blue", color: "#2563EB" },
                    { v: "indigo", color: "#4F46E5" },
                    { v: "emerald", color: "#059669" },
                    { v: "rose", color: "#E11D48" },
                    { v: "amber", color: "#D97706" },
                    { v: "violet", color: "#7C3AED" },
                  ].map((c) => (
                    <button key={c.v} onClick={() => setAppearance({ ...appearance, accent: c.v })} className="w-10 h-10 rounded-full flex items-center justify-center transition" style={{ backgroundColor: c.color, boxShadow: appearance.accent === c.v ? `0 0 0 3px ${cardBg}, 0 0 0 5px ${c.color}` : "none" }}>
                      {appearance.accent === c.v && <CheckCircle className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
                <p className="mt-3" style={{ fontSize: 12, color: textMuted }}>{t("set.app.accentNote")}</p>
              </div>

              <div className="rounded-xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
                <h3 className="mb-4" style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>{t("set.app.layout")}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("set.app.density")}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { v: "compact", label: t("set.app.densityCompact") },
                        { v: "comfortable", label: t("set.app.densityComfortable") },
                        { v: "spacious", label: t("set.app.densitySpacious") },
                      ].map((d) => (
                        <button key={d.v} onClick={() => setAppearance({ ...appearance, density: d.v as any })} className="px-3 py-2 rounded-lg" style={{ fontSize: 13, fontWeight: 600, backgroundColor: appearance.density === d.v ? (isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)") : inputBg, color: appearance.density === d.v ? "var(--acc-primary-strong)" : textPrimary, border: `1px solid ${appearance.density === d.v ? "var(--acc-primary-strong)" : inputBorder}` }}>{d.label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("set.app.sidebar")}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { v: "expanded", label: t("set.app.expanded") },
                        { v: "collapsed", label: t("set.app.collapsed") },
                      ].map((s) => (
                        <button key={s.v} onClick={() => setAppearance({ ...appearance, sidebar: s.v as any })} className="px-3 py-2 rounded-lg" style={{ fontSize: 13, fontWeight: 600, backgroundColor: appearance.sidebar === s.v ? (isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)") : inputBg, color: appearance.sidebar === s.v ? "var(--acc-primary-strong)" : textPrimary, border: `1px solid ${appearance.sidebar === s.v ? "var(--acc-primary-strong)" : inputBorder}` }}>{s.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 px-2 rounded-lg" style={{ borderTop: `1px solid ${borderColor}` }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: textPrimary }}>{t("set.app.reduceMotion")}</div>
                      <div style={{ fontSize: 12, color: textSecondary }}>{t("set.app.reduceMotionDesc")}</div>
                    </div>
                    <button onClick={() => setAppearance({ ...appearance, reduceMotion: !appearance.reduceMotion })} className="relative w-11 h-6 rounded-full transition-colors" style={{ backgroundColor: appearance.reduceMotion ? "var(--acc-primary-strong)" : (isDark ? "#4B5563" : "#D1D5DB") }}>
                      <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform" style={{ left: appearance.reduceMotion ? 22 : 2 }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "localization" && (
            <div className="space-y-6">
              <div className="rounded-xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--acc-primary)] to-[var(--acc-primary-strong)] flex items-center justify-center"><Languages className="w-4.5 h-4.5 text-white" /></div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>{t("set.loc.language")}</h3>
                    <p style={{ fontSize: 12, color: textSecondary }}>{t("set.loc.languageDesc")}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { v: "en" as const, label: "English", sub: t("set.loc.ltr") },
                    { v: "ar" as const, label: "العربية", sub: t("set.loc.rtl") },
                  ].map((l) => (
                    <button key={l.v} onClick={() => setLang(l.v)} className="p-4 rounded-lg text-left transition" style={{ backgroundColor: lang === l.v ? (isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)") : inputBg, border: `1px solid ${lang === l.v ? "var(--acc-primary-strong)" : inputBorder}`, color: lang === l.v ? "var(--acc-primary-strong)" : textPrimary }}>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{l.label}</div>
                      <div style={{ fontSize: 12, color: textMuted }}>{l.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
                <h3 className="mb-5" style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>{t("set.loc.region")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}><Globe className="w-3.5 h-3.5" /> {t("set.loc.timezone")}</label>
                    <select value={localization.timezone} onChange={(e) => setLocalization({ ...localization, timezone: e.target.value })} className="w-full px-3 py-2.5 rounded-lg outline-none" style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}>
                      {["Africa/Algiers", "Africa/Casablanca", "Africa/Tunis", "Africa/Cairo", "Europe/Paris", "Europe/London", "America/New_York", "Asia/Dubai", "UTC"].map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}><Calendar className="w-3.5 h-3.5" /> {t("set.loc.dateFormat")}</label>
                    <select value={localization.dateFormat} onChange={(e) => setLocalization({ ...localization, dateFormat: e.target.value as any })} className="w-full px-3 py-2.5 rounded-lg outline-none" style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}>
                      {["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY", "DD MMM YYYY"].map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}><Clock className="w-3.5 h-3.5" /> {t("set.loc.timeFormat")}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { v: "24h", label: t("set.loc.h24") },
                        { v: "12h", label: t("set.loc.h12") },
                      ].map((tf) => (
                        <button key={tf.v} onClick={() => setLocalization({ ...localization, timeFormat: tf.v as any })} className="px-3 py-2.5 rounded-lg" style={{ fontSize: 13, fontWeight: 600, backgroundColor: localization.timeFormat === tf.v ? (isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)") : inputBg, color: localization.timeFormat === tf.v ? "var(--acc-primary-strong)" : textPrimary, border: `1px solid ${localization.timeFormat === tf.v ? "var(--acc-primary-strong)" : inputBorder}` }}>{tf.label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("set.loc.weekStart")}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { v: "saturday", label: t("set.loc.saturday") },
                        { v: "sunday", label: t("set.loc.sunday") },
                        { v: "monday", label: t("set.loc.monday") },
                      ].map((w) => (
                        <button key={w.v} onClick={() => setLocalization({ ...localization, weekStart: w.v as any })} className="px-3 py-2.5 rounded-lg" style={{ fontSize: 13, fontWeight: 600, backgroundColor: localization.weekStart === w.v ? (isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)") : inputBg, color: localization.weekStart === w.v ? "var(--acc-primary-strong)" : textPrimary, border: `1px solid ${localization.weekStart === w.v ? "var(--acc-primary-strong)" : inputBorder}` }}>{w.label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("set.loc.numberFormat")}</label>
                    <select value={localization.numberFormat} onChange={(e) => setLocalization({ ...localization, numberFormat: e.target.value })} className="w-full px-3 py-2.5 rounded-lg outline-none" style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}>
                      <option value="fr-DZ">1 234 567,89 (French)</option>
                      <option value="en-US">1,234,567.89 (English)</option>
                      <option value="ar-DZ">١٬٢٣٤٬٥٦٧٫٨٩ (Arabic)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("set.currency")}</label>
                    <select value={localization.currency} onChange={(e) => setLocalization({ ...localization, currency: e.target.value })} className="w-full px-3 py-2.5 rounded-lg outline-none" style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}>
                      {["DZD", "USD", "EUR", "GBP", "MAD", "TND", "AED", "SAR"].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-5 p-4 rounded-lg" style={{ backgroundColor: isDark ? "#111827" : "#F9FAFB", border: `1px solid ${inputBorder}` }}>
                  <div className="mb-1" style={{ fontSize: 11, fontWeight: 600, color: textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Preview</div>
                  <div style={{ fontSize: 13, color: textPrimary }}>
                    {(() => {
                      const now = new Date();
                      const pad = (n: number) => String(n).padStart(2, "0");
                      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                      const fmt = localization.dateFormat
                        .replace("YYYY", String(now.getFullYear()))
                        .replace("MMM", months[now.getMonth()])
                        .replace("MM", pad(now.getMonth() + 1))
                        .replace("DD", pad(now.getDate()));
                      const time = localization.timeFormat === "24h"
                        ? `${pad(now.getHours())}:${pad(now.getMinutes())}`
                        : `${((now.getHours() + 11) % 12) + 1}:${pad(now.getMinutes())} ${now.getHours() >= 12 ? "PM" : "AM"}`;
                      const num = new Intl.NumberFormat(localization.numberFormat).format(1234567.89);
                      return `${fmt} · ${time} · ${num} ${localization.currency}`;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}