import { useState } from "react";
import { FileText, Download, Plus, Eye, Search, Trash2, Edit2, FileCode, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import { useApp, type DocumentTemplate } from "../context/AppContext";
import { TemplateEditor } from "../components/TemplateEditor";
import { DocumentPreview } from "../components/DocumentPreview";
import { buildFieldValues, renderTemplate } from "../lib/document-fields";

export function Documents() {
  const { t, theme, documents: docs, addDocument, deleteDocument, employees, documentTemplates, deleteDocumentTemplate, formatCurrency, formatDate } = useApp();
  const [tab, setTab] = useState<"library" | "templates">("library");
  const [showGen, setShowGen] = useState(false);
  const [genForm, setGenForm] = useState({ employeeId: "", templateId: "" });
  const [generating, setGenerating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ kind: "doc" | "tpl"; id: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null | undefined>(undefined);
  const [preview, setPreview] = useState<{ title: string; content: string } | null>(null);

  const isDark = theme === "dark";
  const cardBg = isDark ? "#1F2937" : "#ffffff";
  const borderColor = isDark ? "#374151" : "#F3F4F6";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const inputBg = isDark ? "#374151" : "#F9FAFB";
  const inputBorder = isDark ? "#4B5563" : "#E5E7EB";

  const statusStyles: Record<string, { bg: string; text: string }> = {
    generated: { bg: isDark ? "bg-[#064E3B]" : "bg-[#D1FAE5]", text: "text-[#059669]" },
    pending: { bg: isDark ? "bg-[#78350F]" : "bg-[#FEF3C7]", text: "text-[#D97706]" },
    signed: { bg: isDark ? "bg-[var(--acc-tint-dark)]" : "bg-[var(--acc-tint-light)]", text: "text-[var(--acc-primary)]" },
  };

  const filteredDocs = docs.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTemplates = documentTemplates.filter((tp) =>
    tp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tp.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateContent = (templateId: string, employeeId: string) => {
    const tpl = documentTemplates.find((tp) => tp.id === templateId);
    const emp = employees.find((em) => em.id === employeeId);
    if (!tpl || !emp) return null;
    const values = buildFieldValues(emp, undefined, formatCurrency, formatDate);
    const rendered = renderTemplate(tpl.content, values);
    return { tpl, emp, rendered };
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    const result = generateContent(genForm.templateId, genForm.employeeId);
    if (!result) { setGenerating(false); toast.error("Select employee and template"); return; }
    const { tpl, emp, rendered } = result;
    await new Promise((r) => setTimeout(r, 600));
    addDocument({
      id: `DOC${String(Date.now()).slice(-6)}`,
      name: `${tpl.name} - ${emp.firstName} ${emp.lastName}`,
      type: tpl.name,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      generatedDate: new Date().toISOString().split("T")[0],
      status: "generated",
    });
    setShowGen(false);
    setGenForm({ employeeId: "", templateId: "" });
    setGenerating(false);
    toast.success("Document generated");
    setPreview({ title: `${tpl.name} - ${emp.firstName} ${emp.lastName}`, content: rendered });
  };

  const handlePreviewExisting = (docName: string) => {
    // Re-render based on stored template name + employee name (best effort lookup)
    const doc = docs.find((d) => d.name === docName);
    if (!doc) return;
    const tpl = documentTemplates.find((tp) => tp.name === doc.type);
    const emp = employees.find((em) => `${em.firstName} ${em.lastName}` === doc.employeeName);
    if (!tpl || !emp) {
      toast.error("Original template or employee no longer available");
      return;
    }
    const rendered = renderTemplate(tpl.content, buildFieldValues(emp, undefined, formatCurrency, formatDate));
    setPreview({ title: doc.name, content: rendered });
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.kind === "doc") {
      deleteDocument(deleteConfirm.id);
      toast.success("Document deleted");
    } else {
      deleteDocumentTemplate(deleteConfirm.id);
      toast.success("Template deleted");
    }
    setDeleteConfirm(null);
  };

  const previewTemplate = (tpl: DocumentTemplate) => {
    const sampleEmp = employees[0];
    if (!sampleEmp) { toast.error("Add an employee first to preview"); return; }
    const rendered = renderTemplate(tpl.content, buildFieldValues(sampleEmp, undefined, formatCurrency, formatDate));
    setPreview({ title: `${tpl.name} (Preview · ${sampleEmp.firstName} ${sampleEmp.lastName})`, content: rendered });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 style={{ fontSize: 24, fontWeight: 700, color: textPrimary }}>{t("doc.title")}</h2>
        <div className="flex gap-2">
          {tab === "templates" && (
            <button onClick={() => setEditingTemplate(null)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg" style={{ fontSize: 13, fontWeight: 600, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }}>
              <Plus className="w-4 h-4" /> New Template
            </button>
          )}
          <button onClick={() => setShowGen(!showGen)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg" style={{ fontSize: 13, fontWeight: 600 }}>
            <FileCode className="w-4 h-4" /> Generate Document
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b" style={{ borderColor: inputBorder }}>
        {[
          { id: "library" as const, label: "Document Library", icon: FileText },
          { id: "templates" as const, label: "Templates", icon: LayoutTemplate },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className="inline-flex items-center gap-2 px-4 py-2.5 -mb-px border-b-2 transition" style={{ fontSize: 13, fontWeight: 600, color: tab === id ? "var(--acc-primary)" : textSecondary, borderColor: tab === id ? "var(--acc-primary)" : "transparent" }}>
            <Icon className="w-4 h-4" /> {label}
            <span className="ml-1 px-1.5 py-0.5 rounded" style={{ fontSize: 11, backgroundColor: tab === id ? (isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)") : "transparent", color: tab === id ? "var(--acc-primary)" : textSecondary }}>
              {id === "library" ? docs.length : documentTemplates.length}
            </span>
          </button>
        ))}
      </div>

      {showGen && (
        <form onSubmit={handleGenerate} className="rounded-xl border p-6" style={{ backgroundColor: cardBg, borderColor }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)" }}><FileText className="w-5 h-5 text-[var(--acc-primary)]" /></div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>Generate Document</h3>
              <p style={{ fontSize: 13, color: textSecondary }}>Pick an employee and a template — placeholders are filled automatically.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{t("doc.employee")}</label>
              <select required value={genForm.employeeId} onChange={(e) => setGenForm({ ...genForm, employeeId: e.target.value })} className="w-full px-3 py-2.5 rounded-lg outline-none" style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}>
                <option value="">{t("doc.selectEmployee")}</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Template</label>
              <select required value={genForm.templateId} onChange={(e) => setGenForm({ ...genForm, templateId: e.target.value })} className="w-full px-3 py-2.5 rounded-lg outline-none" style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}>
                <option value="">Select a template…</option>
                {documentTemplates.map((tp) => <option key={tp.id} value={tp.id}>{tp.name}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={generating} className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg disabled:opacity-60" style={{ fontSize: 13, fontWeight: 600 }}>
                <Download className="w-4 h-4" />{generating ? "Generating…" : "Generate"}
              </button>
            </div>
          </div>
        </form>
      )}

      {tab === "library" ? (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: cardBg, borderColor }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${borderColor}` }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>{t("doc.documentLibrary")}</h3>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 w-48" style={{ backgroundColor: inputBg }}>
              <Search className="w-4 h-4" style={{ color: textSecondary }} />
              <input placeholder={t("nav.search")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none w-full" style={{ fontSize: 13, color: textPrimary }} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                {[t("doc.document"), t("doc.type"), t("doc.employee"), t("doc.date"), t("doc.status"), t("doc.actions")].map((h) => (
                  <th key={h} className="text-left px-5 py-3" style={{ fontSize: 12, fontWeight: 600, color: textSecondary }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{filteredDocs.map((d) => (
                <tr key={d.id} style={{ borderBottom: `1px solid ${isDark ? "#1F2937" : "#F9FAFB"}` }}>
                  <td className="px-5 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)" }}><FileText className="w-4 h-4 text-[var(--acc-primary)]" /></div><span style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{d.name}</span></div></td>
                  <td className="px-5 py-3" style={{ fontSize: 13, color: textSecondary }}>{d.type}</td>
                  <td className="px-5 py-3" style={{ fontSize: 13, color: textPrimary }}>{d.employeeName}</td>
                  <td className="px-5 py-3" style={{ fontSize: 13, color: textSecondary }}>{d.generatedDate}</td>
                  <td className="px-5 py-3"><span className={`${(statusStyles[d.status?.toLowerCase()] ?? statusStyles["pending"]).bg} ${(statusStyles[d.status?.toLowerCase()] ?? statusStyles["pending"]).text} px-2.5 py-1 rounded-md`} style={{ fontSize: 11, fontWeight: 600 }}>{d.status}</span></td>
                  <td className="px-5 py-3"><div className="flex gap-1">
                    <button onClick={() => handlePreviewExisting(d.name)} className="p-1.5 rounded hover:bg-[var(--acc-tint-light)] text-[#6B7280] hover:text-[var(--acc-primary)]"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => handlePreviewExisting(d.name)} className="p-1.5 rounded hover:bg-[var(--acc-tint-light)] text-[#6B7280] hover:text-[var(--acc-primary)]"><Download className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteConfirm({ kind: "doc", id: d.id })} className="p-1.5 rounded hover:bg-[#FEE2E2] text-[#6B7280] hover:text-[#DC2626]"><Trash2 className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              ))}
              {filteredDocs.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center" style={{ fontSize: 13, color: textSecondary }}>No documents yet. Click “Generate Document” to create one.</td></tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: cardBg, borderColor }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${borderColor}` }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary }}>Document Templates</h3>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 w-48" style={{ backgroundColor: inputBg }}>
              <Search className="w-4 h-4" style={{ color: textSecondary }} />
              <input placeholder="Search templates" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none w-full" style={{ fontSize: 13, color: textPrimary }} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
            {filteredTemplates.map((tp) => (
              <div key={tp.id} className="rounded-lg border p-4 flex flex-col" style={{ borderColor: inputBorder, backgroundColor: isDark ? "#111827" : "#F9FAFB" }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)" }}><LayoutTemplate className="w-4 h-4 text-[var(--acc-primary)]" /></div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary }}>{tp.name}</div>
                      <div style={{ fontSize: 11, color: textSecondary }}>Updated {tp.updatedDate}</div>
                    </div>
                  </div>
                </div>
                {tp.description && <p className="mb-3" style={{ fontSize: 12, color: textSecondary }}>{tp.description}</p>}
                <div className="mb-3 flex flex-wrap gap-1">
                  {tp.fields.slice(0, 4).map((f) => (
                    <span key={f} className="px-1.5 py-0.5 rounded" style={{ fontSize: 10, fontWeight: 500, backgroundColor: isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)", color: "var(--acc-primary)" }}>{`{{${f}}}`}</span>
                  ))}
                  {tp.fields.length > 4 && <span style={{ fontSize: 10, color: textSecondary }}>+{tp.fields.length - 4} more</span>}
                </div>
                <div className="mt-auto flex gap-2">
                  <button onClick={() => previewTemplate(tp)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md" style={{ fontSize: 12, fontWeight: 500, backgroundColor: isDark ? "#374151" : "#ffffff", color: textPrimary, border: `1px solid ${inputBorder}` }}><Eye className="w-3.5 h-3.5" /> Preview</button>
                  <button onClick={() => setEditingTemplate(tp)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md" style={{ fontSize: 12, fontWeight: 500, backgroundColor: isDark ? "#374151" : "#ffffff", color: textPrimary, border: `1px solid ${inputBorder}` }}><Edit2 className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => setDeleteConfirm({ kind: "tpl", id: tp.id })} className="px-2.5 py-2 rounded-md hover:bg-[#FEE2E2] text-[#DC2626]" style={{ border: `1px solid ${inputBorder}` }}><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
            {filteredTemplates.length === 0 && (
              <div className="col-span-full text-center py-12" style={{ fontSize: 13, color: textSecondary }}>
                No templates yet. Click “New Template” to create your first one.
              </div>
            )}
          </div>
        </div>
      )}

      {editingTemplate !== undefined && (
        <TemplateEditor template={editingTemplate} onClose={() => setEditingTemplate(undefined)} />
      )}

      {preview && <DocumentPreview title={preview.title} content={preview.content} onClose={() => setPreview(null)} />}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="rounded-2xl border shadow-2xl w-full max-w-sm p-6" style={{ backgroundColor: cardBg, borderColor }} onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2" }}><Trash2 className="w-6 h-6 text-[#DC2626]" /></div>
            <h3 className="text-center mb-2" style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>Delete {deleteConfirm.kind === "doc" ? "Document" : "Template"}?</h3>
            <p className="text-center mb-6" style={{ fontSize: 13, color: textSecondary }}>This action cannot be undone.</p>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2.5 rounded-lg" style={{ fontSize: 13, fontWeight: 500, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="flex-1 px-4 py-2.5 rounded-lg bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors" style={{ fontSize: 13, fontWeight: 600 }} onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
