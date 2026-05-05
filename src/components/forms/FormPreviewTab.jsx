import React from "react";
import PublicFormPage from "@/pages/PublicFormPage";

export default function FormPreviewTab({ fields, landingPage, slug, status }) {
  const form = { fields, landing_page: landingPage, status, slug };

  const handleOpenNewTab = () => {
    if (!slug || status === "rascunho") {
      alert("Publique o formulário primeiro para acessar a URL pública.");
      return;
    }
    window.open(`/f/${slug}`, "_blank");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "#999" }}>Prévia da landing page</p>
        <button onClick={handleOpenNewTab}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium"
          style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(255,255,255,0.90)", color: "#555" }}>
          Abrir em nova aba
        </button>
      </div>
      {/* Desktop frame */}
      <div className="rounded-2xl overflow-hidden shadow-xl"
        style={{ border: "1px solid rgba(0,0,0,0.10)", maxWidth: 1024, margin: "0 auto" }}>
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: "#1A1A1A" }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: "#EF4444" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#F0C000" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#22C55E" }} />
          </div>
          <div className="flex-1 mx-4 px-3 py-1 rounded text-xs" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.40)" }}>
            {slug ? `/f/${slug}` : "sem URL pública (rascunho)"}
          </div>
        </div>
        {/* Content in iframe-like scroll */}
        <div style={{ height: 600, overflowY: "auto" }}>
          <PublicFormPage previewData={{ form }} />
        </div>
      </div>
    </div>
  );
}