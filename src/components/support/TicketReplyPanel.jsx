import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Lock, MessageSquare, Phone, Paperclip } from "lucide-react";

export default function TicketReplyPanel({ ticketId, onSaved }) {
  const [isInternal, setIsInternal] = useState(false);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const send = async (type) => {
    if (!content.trim()) { setError("Mensagem obrigatória"); return; }
    setSending(true);
    const user = await base44.auth.me();
    await base44.entities.TicketMessage.create({
      ticket_id: ticketId,
      user_id: user?.id,
      type,
      content,
      is_internal: type === "anotacao_interna" || isInternal,
    });
    setContent("");
    setError("");
    setSending(false);
    onSaved();
  };

  return (
    <div className="mt-6 rounded-2xl p-4 space-y-3" style={{ background: isInternal ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.60)", border: isInternal ? "1px solid rgba(245,158,11,0.20)" : "1px solid rgba(255,255,255,0.90)" }}>
      {/* Toggle */}
      <div className="flex gap-1 p-1 w-fit rounded-xl" style={{ background: "rgba(0,0,0,0.04)" }}>
        {[
          { key: false, label: "Resposta ao cliente", icon: MessageSquare },
          { key: true, label: "Anotação interna", icon: Lock },
        ].map(opt => (
          <button key={String(opt.key)} onClick={() => setIsInternal(opt.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: isInternal === opt.key ? (opt.key ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.90)") : "transparent", color: isInternal === opt.key ? (opt.key ? "#D97706" : "#1A1A1A") : "#999", boxShadow: isInternal === opt.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
            <opt.icon className="w-3.5 h-3.5" /> {opt.label}
          </button>
        ))}
      </div>

      <textarea rows={3} value={content} onChange={e => { setContent(e.target.value); setError(""); }}
        placeholder={isInternal ? "Anotação visível apenas para a equipe..." : "Digite sua resposta ao cliente..."}
        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none transition-colors"
        style={{ background: "rgba(0,0,0,0.04)", border: `1px solid ${error ? "#EF4444" : "rgba(0,0,0,0.10)"}`, color: "#1A1A1A", fontFamily: "Inter,sans-serif" }} />
      {error && <p className="text-xs" style={{ color: "#EF4444" }}>{error}</p>}

      <div className="flex gap-2">
        <button onClick={() => send("ligacao_registrada")} disabled={sending}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
          style={{ background: "rgba(34,197,94,0.10)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.20)" }}>
          <Phone className="w-3.5 h-3.5" /> Registrar ligação
        </button>
        <div className="flex-1" />
        <button onClick={() => send(isInternal ? "anotacao_interna" : "resposta")} disabled={sending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ background: "linear-gradient(135deg,#F0C000 0%,#C49A00 100%)", color: "#1A1A1A", opacity: sending ? 0.7 : 1 }}>
          {sending ? "Enviando..." : isInternal ? "Salvar anotação" : "Enviar resposta"}
        </button>
      </div>
    </div>
  );
}