import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";

const TYPES = [
  { key: "ligacao", label: "Ligação" },
  { key: "email", label: "E-mail" },
  { key: "reuniao", label: "Reunião" },
  { key: "anotacao", label: "Anotação" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "visita", label: "Visita" },
  { key: "outro", label: "Outro" },
];

const inputStyle = { background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.10)", color: "#1A1A1A", fontFamily: "Inter, sans-serif", borderRadius: 10, padding: "8px 12px", width: "100%", fontSize: 14, outline: "none" };

const nowLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export default function ActivityModal({ opportunityId, organizationId, onClose, onSaved }) {
  const [form, setForm] = useState({ type: "anotacao", title: "", description: "", occurred_at: nowLocal(), schedule_followup: false, next_followup_at: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Título obrigatório"); return; }
    setSaving(true);
    await base44.entities.Activity.create({
      type: form.type,
      title: form.title,
      description: form.description,
      occurred_at: form.occurred_at,
      next_followup_at: form.schedule_followup ? form.next_followup_at : undefined,
      opportunity_id: opportunityId,
      organization_id: organizationId,
    });
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.20)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-2xl" style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(240,192,0,0.20)", boxShadow: "0 16px 48px rgba(0,0,0,0.16)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>Registrar Atividade</h2>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: "#999" }} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#555555" }}>Tipo</label>
            <select value={form.type} onChange={e => set("type", e.target.value)} style={inputStyle}>
              {TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#555555" }}>Título *</label>
            <input value={form.title} onChange={e => { set("title", e.target.value); setError(""); }} placeholder="Ex: Ligação de prospecção" style={inputStyle} />
            {error && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{error}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#555555" }}>Descrição</label>
            <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Detalhes da atividade..." style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#555555" }}>Data e hora</label>
            <input type="datetime-local" value={form.occurred_at} onChange={e => set("occurred_at", e.target.value)} style={inputStyle} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.schedule_followup} onChange={e => set("schedule_followup", e.target.checked)} style={{ accentColor: "#F0C000" }} />
            <span className="text-sm" style={{ color: "#555555" }}>Agendar próximo follow-up</span>
          </label>
          {form.schedule_followup && (
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#555555" }}>Data/hora do follow-up</label>
              <input type="datetime-local" value={form.next_followup_at} onChange={e => set("next_followup_at", e.target.value)} style={inputStyle} />
            </div>
          )}
        </div>
        <div className="flex gap-2 px-6 py-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: "rgba(0,0,0,0.06)", color: "#555555" }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)", color: "#1A1A1A", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Salvando..." : "Registrar"}
          </button>
        </div>
      </div>
    </div>
  );
}