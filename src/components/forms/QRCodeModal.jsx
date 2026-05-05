import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { X, Download, Copy } from "lucide-react";

export default function QRCodeModal({ form, onClose }) {
  const canvasRef = useRef(null);
  const publicUrl = `${window.location.origin}/f/${form.slug}`;
  const [copied, setCopied] = React.useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const canvas = document.querySelector("#qr-canvas canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qrcode-${form.slug || form.id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }}>
      <div className="rounded-2xl w-full max-w-sm overflow-hidden"
        style={{ background: "rgba(255,255,255,0.98)", border: "1px solid rgba(240,192,0,0.20)", boxShadow: "0 16px 48px rgba(0,0,0,0.18)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 className="text-sm font-semibold truncate" style={{ color: "#1A1A1A" }}>
            QR Code — {form.title}
          </h2>
          <button onClick={onClose} style={{ color: "#999" }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR */}
        <div className="flex flex-col items-center gap-4 py-8 px-6">
          <div id="qr-canvas" className="p-4 rounded-2xl" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.06)" }}>
            <QRCodeCanvas value={publicUrl} size={256} level="H" includeMargin={false} />
          </div>

          {/* URL */}
          <button onClick={copyLink}
            className="text-xs text-center px-3 py-2 rounded-xl w-full transition-colors"
            style={{ background: "rgba(0,0,0,0.04)", color: "#555", fontFamily: "monospace", wordBreak: "break-all" }}>
            {publicUrl}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "rgba(0,0,0,0.06)", color: "#555" }}>
            Fechar
          </button>
          <button onClick={copyLink}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            style={{ background: "rgba(240,192,0,0.10)", color: "#8A6E00", border: "1px solid rgba(240,192,0,0.25)" }}>
            <Copy className="w-4 h-4" /> {copied ? "Copiado!" : "Copiar link"}
          </button>
          <button onClick={downloadQR}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)", color: "#1A1A1A" }}>
            <Download className="w-4 h-4" /> Baixar
          </button>
        </div>
      </div>
    </div>
  );
}