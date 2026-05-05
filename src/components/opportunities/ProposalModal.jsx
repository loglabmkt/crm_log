import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Save, ExternalLink } from "lucide-react";

const STATUSES = [
  { key: "rascunho", label: "Rascunho", color: "#6B7280" },
  { key: "enviada", label: "Enviada", color: "#3B82F6" },
  { key: "em_analise", label: "Em Análise", color: "#D97706" },
  { key: "aprovada", label: "Aprovada", color: "#22C55E" },
  { key: "rejeitada", label: "Rejeitada", color: "#EF4444" },
  { key: "aguardando_resultado", label: "Aguardando Resultado", color: "#F0C000" },
];

export const PROPOSAL_STATUS_MAP = Object.fromEntries(STATUSES.map(s => [s.key, s]));

const inputStyle = {
  background: "rgba(0,0,0,0.04)",
  border: "1px solid rgba(0,0,0,0.10)",
  color: "#1A1A1A",
  fontFamily: "Inter, sans-serif",
  borderRadius: 10,
  padding: "8px 12px",
  width: "100%",
  fontSize: 14,
  outline: "none",
};

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>{label}</label>
    {children}
    {error && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{error}</p>}
  </div>
);

export default function ProposalModal({ proposal, opportunityId, onClose, onSaved }) {
  const isEdit = !!proposal?.id;
  const [form, setForm] = useState({
    title: proposal?.title || "",
    status: proposal?.status || "rascunho",
    sent_at: proposal?.sent_at ? proposal.sent_at.split("T")[0] : "",
    file_url: proposal?.file_url || "",
    notes: proposal?.notes || "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Obrigatório";
    if (!form.status) e.status = "Obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      ...form,
      opportunity_id: opportunityId,
      sent_at: form.sent_at ? new Date(form.sent_at).toISOString() : undefined,
    };
    if (!payload.sent_at) delete payload.sent_at;
    if (isEdit) {
      await base44.entities.Proposal.update(proposal.id, payload);
    } else {
      await base44.entities.Proposal.create(payload);
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-2xl"
        style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(240,192,0,0.20)", boxShadow: "0 16px 48px rgba(0,0,0,0.16)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>
            {isEdit ? "Editar Proposta" : "Nova Proposta"}
          </h2>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: "#999" }} /></button>
        </div>

        <div className="p-6 space-y-4">
          <Field label="Título *" error={errors.title}>
            <input value={form.title} onChange={e => set("title", e.target.value)}
              placeholder="Ex: Proposta Técnica - Jan/2025" style={inputStyle} />
          </Field>

          <Field label="Status *" error={errors.status}>
            <select value={form.status} onChange={e => set("status", e.target.value)} style={inputStyle}>
              {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </Field>

          {form.status !== "rascunho" && (
            <Field label="Data de envio">
              <input type="date" value={form.sent_at} onChange={e => set("sent_at", e.target.value)} style={inputStyle} />
            </Field>
          )}

          <Field label="Link do documento">
            <input value={form.file_url} onChange={e => set("file_url", e.target.value)}
              placeholder="https://drive.google.com/..." style={inputStyle} />
          </Field>

          <Field label="Observações">
            <textarea rows={3} value={form.notes} onChange={e => set("notes", e.target.value)}
              placeholder="Notas adicionais..."
              style={{ ...inputStyle, resize: "vertical" }} />
          </Field>
        </div>

        <div className="flex gap-3 px-6 py-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "rgba(0,0,0,0.06)", color: "#555" }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)", color: "#1A1A1A", opacity: saving ? 0.7 : 1 }}>
            <Save className="w-4 h-4" />
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}