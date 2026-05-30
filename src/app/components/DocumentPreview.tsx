import { useEffect } from "react";
import { X, Printer, Download } from "lucide-react";
import { useApp } from "../context/AppContext";

interface Props {
  title: string;
  content: string;
  onClose: () => void;
}

const toHtml = (raw: string) => /<[a-z][\s\S]*>/i.test(raw) ? raw : raw.replace(/\n/g, "<br>");

export function DocumentPreview({ title, content, onClose }: Props) {
  const { theme } = useApp();
  const isDark = theme === "dark";
  const cardBg = isDark ? "#1F2937" : "#ffffff";
  const borderColor = isDark ? "#374151" : "#E5E7EB";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";

  const htmlContent = toHtml(content);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handlePrint = () => {
    const w = window.open("", "_blank", "width=900,height=1000");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>${title}</title><style>
      body { font-family: Georgia, serif; max-width: 720px; margin: 40px auto; padding: 40px; line-height: 1.8; color: #111; }
      h1.doc-title { font-size: 22px; margin-bottom: 24px; text-align: center; }
      img { max-width: 100%; height: auto; }
      @media print { body { margin: 0; padding: 24px; } }
    </style></head><body><h1 class="doc-title">${title}</h1><div>${htmlContent}</div></body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  const handleDownload = () => {
    const fullHtml = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>
      body { font-family: Georgia, serif; max-width: 720px; margin: 40px auto; padding: 40px; line-height: 1.8; color: #111; }
      h1.doc-title { font-size: 22px; margin-bottom: 24px; text-align: center; }
      img { max-width: 100%; height: auto; }
    </style></head><body><h1 class="doc-title">${title}</h1><div>${htmlContent}</div></body></html>`;
    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]+/gi, "_")}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="rounded-2xl border shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" style={{ backgroundColor: cardBg, borderColor }} onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: textPrimary }}>{title}</h3>
            <p style={{ fontSize: 12, color: textSecondary }}>Document preview</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-black/5"><X className="w-5 h-5" style={{ color: textSecondary }} /></button>
        </div>
        <div className="flex-1 overflow-auto p-8" style={{ backgroundColor: isDark ? "#111827" : "#F9FAFB" }}>
          <div
            className="mx-auto max-w-2xl rounded-lg shadow-sm p-10 doc-render"
            style={{ backgroundColor: "#ffffff", color: "#111", lineHeight: 1.8, fontFamily: "Georgia, serif", fontSize: 14 }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
        <div className="px-6 py-4 flex items-center justify-end gap-3" style={{ borderTop: `1px solid ${borderColor}` }}>
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg" style={{ fontSize: 13, fontWeight: 500, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }}>Close</button>
          <button onClick={handleDownload} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg" style={{ fontSize: 13, fontWeight: 600, backgroundColor: isDark ? "#374151" : "#F3F4F6", color: textPrimary }}><Download className="w-4 h-4" /> Download</button>
          <button onClick={handlePrint} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--acc-primary)] to-[var(--acc-primary-strong)] text-white rounded-lg" style={{ fontSize: 13, fontWeight: 600 }}><Printer className="w-4 h-4" /> Print / PDF</button>
        </div>
      </div>
    </div>
  );
}
