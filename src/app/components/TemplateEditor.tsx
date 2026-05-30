import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { X, Plus, Save, ImagePlus, AlignLeft, AlignCenter, AlignRight, Trash2 } from "lucide-react";
import { useApp, type DocumentTemplate } from "../context/AppContext";
import { AVAILABLE_FIELDS, extractPlaceholders } from "../lib/document-fields";
import { toast } from "sonner";

interface Props {
  template?: DocumentTemplate | null;
  onClose: () => void;
}

const toEditorHtml = (raw: string) => /<[a-z][\s\S]*>/i.test(raw) ? raw : raw.replace(/\n/g, "<br>");

export function TemplateEditor({ template, onClose }: Props) {
  const { theme, addDocumentTemplate, updateDocumentTemplate } = useApp();
  const isDark = theme === "dark";
  const cardBg = isDark ? "#1F2937" : "#ffffff";
  const borderColor = isDark ? "#374151" : "#E5E7EB";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const inputBg = isDark ? "#374151" : "#F9FAFB";
  const chipBg = isDark ? "var(--acc-tint-dark)" : "var(--acc-tint-light)";

  const [name, setName] = useState(template?.name || "");
  const [description, setDescription] = useState(template?.description || "");
  const [html, setHtml] = useState(toEditorHtml(template?.content || ""));
  const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
  const [, forceTick] = useState(0);

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastRangeRef = useRef<Range | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useLayoutEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
  }, []); // initial mount only

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      lastRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const range = lastRangeRef.current;
    if (!range || !editorRef.current) return null;
    const sel = window.getSelection();
    if (!sel) return null;
    sel.removeAllRanges();
    sel.addRange(range);
    return range;
  };

  const syncHtml = () => {
    if (editorRef.current) setHtml(editorRef.current.innerHTML);
  };

  const insertNodeAtCursor = (node: Node) => {
    editorRef.current?.focus();
    const range = restoreSelection() || (() => {
      const r = document.createRange();
      r.selectNodeContents(editorRef.current!);
      r.collapse(false);
      return r;
    })();
    range.deleteContents();
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    lastRangeRef.current = range.cloneRange();
    syncHtml();
  };

  const insertPlaceholder = (key: string) => {
    insertNodeAtCursor(document.createTextNode(`{{${key}}}`));
  };

  const handleImagePicked = (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file"); return; }
    if (file.size > 4 * 1024 * 1024) { toast.error("Image too large (max 4MB)"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = document.createElement("img");
      img.src = reader.result as string;
      img.setAttribute("data-doc-image", "1");
      img.style.maxWidth = "100%";
      img.style.width = "50%";
      img.style.display = "block";
      img.style.marginLeft = "auto";
      img.style.marginRight = "auto";
      img.style.cursor = "pointer";
      insertNodeAtCursor(img);
      // also add a trailing line break so the cursor sits below
      const br = document.createElement("br");
      insertNodeAtCursor(br);
    };
    reader.readAsDataURL(file);
  };

  const onImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImagePicked(file);
    e.target.value = "";
  };

  const onEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") {
      e.preventDefault();
      setSelectedImg(target as HTMLImageElement);
    } else {
      setSelectedImg(null);
    }
  };

  const updateImg = (mutator: (img: HTMLImageElement) => void) => {
    if (!selectedImg) return;
    mutator(selectedImg);
    syncHtml();
    forceTick((n) => n + 1);
  };

  const setImgWidth = (pct: number) => updateImg((img) => { img.style.width = `${pct}%`; });
  const setImgAlign = (align: "left" | "center" | "right") => updateImg((img) => {
    img.style.display = "block";
    if (align === "center") { img.style.marginLeft = "auto"; img.style.marginRight = "auto"; }
    else if (align === "left") { img.style.marginLeft = "0"; img.style.marginRight = "auto"; }
    else { img.style.marginLeft = "auto"; img.style.marginRight = "0"; }
  });
  const removeImg = () => {
    if (!selectedImg) return;
    selectedImg.remove();
    setSelectedImg(null);
    syncHtml();
  };

  const currentImgWidth = (() => {
    if (!selectedImg) return 50;
    const w = selectedImg.style.width;
    const m = w.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 50;
  })();

  const handleSave = () => {
    if (!name.trim()) { toast.error("Template name is required"); return; }
    const content = editorRef.current?.innerHTML.trim() || "";
    if (!content) { toast.error("Template content is required"); return; }
    const fields = extractPlaceholders(content);
    if (template) {
      updateDocumentTemplate(template.id, { name, description, content, fields });
      toast.success("Template updated");
    } else {
      addDocumentTemplate({
        id: `TPL${Date.now()}`,
        name,
        description,
        content,
        fields,
        createdDate: new Date().toISOString().split("T")[0],
        updatedDate: new Date().toISOString().split("T")[0],
      });
      toast.success("Template created");
    }
    onClose();
  };

  const grouped = AVAILABLE_FIELDS.reduce<Record<string, typeof AVAILABLE_FIELDS>>((acc, f) => {
    (acc[f.category] ||= []).push(f);
    return acc;
  }, {});
  const categoryLabels: Record<string, string> = { personal: "Personal Info", job: "Job Info", system: "System" };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="rounded-2xl border shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col" style={{ backgroundColor: cardBg, borderColor }} onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>{template ? "Edit Template" : "New Document Template"}</h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-black/5"><X className="w-5 h-5" style={{ color: textSecondary }} /></button>
        </div>
        <div className="flex-1 overflow-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Template Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Employment Contract" className="w-full px-3 py-2.5 rounded-lg outline-none" style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textPrimary }} />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Description (optional)</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" className="w-full px-3 py-2.5 rounded-lg outline-none" style={{ fontSize: 13, backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textPrimary }} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Document Content</label>
                <div className="flex items-center gap-2">
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onImageInput} />
                  <button type="button" onClick={() => { saveSelection(); fileInputRef.current?.click(); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:opacity-90 transition" style={{ fontSize: 12, fontWeight: 600, backgroundColor: chipBg, color: "var(--acc-primary)" }}>
                    <ImagePlus className="w-3.5 h-3.5" /> Insert Image
                  </button>
                </div>
              </div>

              {selectedImg && (
                <div className="mb-2 flex flex-wrap items-center gap-3 p-2.5 rounded-lg" style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}` }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: textPrimary }}>Image:</span>
                  <div className="flex items-center gap-1.5">
                    <span style={{ fontSize: 11, color: textSecondary }}>Width</span>
                    <input type="range" min={10} max={100} step={5} value={currentImgWidth} onChange={(e) => setImgWidth(parseInt(e.target.value, 10))} />
                    <span className="w-10 text-right" style={{ fontSize: 11, color: textPrimary }}>{currentImgWidth}%</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[
                      { v: "left" as const, Icon: AlignLeft },
                      { v: "center" as const, Icon: AlignCenter },
                      { v: "right" as const, Icon: AlignRight },
                    ].map(({ v, Icon }) => (
                      <button key={v} type="button" onClick={() => setImgAlign(v)} className="p-1.5 rounded hover:opacity-80" style={{ backgroundColor: isDark ? "#111827" : "#ffffff", color: textPrimary, border: `1px solid ${borderColor}` }}>
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={removeImg} className="ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[#DC2626] hover:bg-[#FEE2E2]" style={{ fontSize: 12, fontWeight: 500 }}>
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              )}

              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={syncHtml}
                onBlur={saveSelection}
                onKeyUp={saveSelection}
                onMouseUp={saveSelection}
                onClick={onEditorClick}
                className="w-full px-4 py-3 rounded-lg outline-none overflow-auto"
                style={{ minHeight: 360, maxHeight: 420, fontSize: 13, backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textPrimary, lineHeight: 1.7, fontFamily: "Georgia, serif" }}
              />
              <p className="mt-1.5" style={{ fontSize: 11, color: textSecondary }}>{extractPlaceholders(html).length} placeholders detected · click an image to resize or align it.</p>
            </div>
          </div>

          <div>
            <h4 className="mb-3" style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>Insert Field</h4>
            <p className="mb-3" style={{ fontSize: 12, color: textSecondary }}>Click a field to insert it at the cursor position.</p>
            <div className="space-y-4">
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat}>
                  <div className="mb-2" style={{ fontSize: 11, fontWeight: 600, color: textSecondary, textTransform: "uppercase", letterSpacing: 0.5 }}>{categoryLabels[cat]}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((f) => (
                      <button key={f.key} type="button" onMouseDown={(e) => { e.preventDefault(); saveSelection(); }} onClick={() => insertPlaceholder(f.key)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:opacity-80 transition" style={{ fontSize: 12, fontWeight: 500, backgroundColor: chipBg, color: "var(--acc-primary)" }}>
                        <Plus className="w-3 h-3" /> {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 flex items-center justify-end gap-3" style={{ borderTop: `1px solid ${borderColor}` }}>
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg" style={{ fontSize: 13, fontWeight: 500, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }}>Cancel</button>
          <button onClick={handleSave} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg" style={{ fontSize: 13, fontWeight: 600 }}><Save className="w-4 h-4" /> {template ? "Save Changes" : "Create Template"}</button>
        </div>
      </div>
    </div>
  );
}
