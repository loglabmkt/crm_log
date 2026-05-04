import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";

const STAGES = [
  { key: "prospeccao", label: "Prospecção" },
  { key: "qualificacao", label: "Qualificação" },
  { key: "proposta", label: "Proposta" },
  { key: "negociacao", label: "Negociação" },
  { key: "licitacao", label: "Licitação" },
  { key: "fechado_ganho", label: "Fechado Ganho" },
  { key: "fechado_perdido", label: "Perdido" },
];

const ORIGINS = [
  { key: "indicacao", label: "Indicação" },
  { key: "licitacao", label: "Licitação" },
  { key: "prospeccao_ativa", label: "Prospecção Ativa" },
  { key: "evento", label: "Evento" },
  { key: "campanha", label: "Campanha" },
  { key: "outros", label: "Outros" },
];

const FIELD = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium mb-1" style={{ color: "#555555" }}>{label}</label>
    {children}
  </div>
);

const inputStyle = { background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.10)", color: "#1A1A1A", fontFamily: "Inter, sans-serif", borderRadius: 10, padding: "8px 12px", width: "100%", fontSize: 14, outline: "none" };

export default function OpportunityModal({ opportunity, defaultStage, defaultOrgId, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: "", organization_id: defaultOrgId || "", contact_id: "", owner_id: "",
    stage: defaultStage || "prospeccao", estimated_value: "", probability: 50,
    origin: "", expected_close_date: "", notes: "", ...opportunity,
  });
  const [orgs, setOrgs] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([base44.entities.Organization.list(), base44.entities.User.list()])
      .then(([o, u]) => { setOrgs(o); setUsers(u); });
  }, []);

  useEffect(() => {
    if (!form.organization_id) { setContacts([]); return; }
    base44.entities.Contact.filter({ organization_id: form.organization_id }).then(setContacts);
  }, [form.organization_id]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Obrigatório";
    if (!form.organization_id) e.organization_id = "Obrigatório";
    if (!form.stage) e.stage = "Obrigatório";
    if (form.estimated_value !== "" && Number(form.estimated_value) < 0) e.estimated_value = "Deve ser >= 0";
    if (form.expected_close_date && new Date(form.expected_close_date) < new Date().setHours(0, 0, 0, 0)) e.expected_close_date = "Deve ser >= hoje";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = { ...form, estimated_value: form.estimated_value ? Number(form.estimated_value) : undefined, probability: Number(form.probability) };
    if (opportunity?.id) await base44.entities.Opportunity.update(opportunity.id, payload);
    else await base44.entities.Opportunity.create(payload);
    setSaving(false);
    onSaved();
    onClose();
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.20)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(240,192,0,0.20)", boxShadow: "0 16px 48px rgba(0,0,0,0.16)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>{opportunity?.id ? "Editar Oportunidade" : "Nova Oportunidade"}</h2>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: "#999" }} /></button>
        </div>
        <div className="p-6 space-y-4">
          <FIELD label="Título *">
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Ex: Implantação de sistema SAMU" style={inputStyle} />
            {errors.title && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.title}</p>}
          </FIELD>

          <div className="grid grid-cols-2 gap-4">
            <FIELD label="Organização *">
              <select value={form.organization_id} onChange={e => { set("organization_id", e.target.value); set("contact_id", ""); }} style={inputStyle}>
                <option value="">Selecionar...</option>
                {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              {errors.organization_id && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.organization_id}</p>}
            </FIELD>
            <FIELD label="Contato principal">
              <select value={form.contact_id} onChange={e => set("contact_id", e.target.value)} style={inputStyle} disabled={!form.organization_id}>
                <option value="">Selecionar...</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FIELD>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FIELD label="Responsável">
              <select value={form.owner_id} onChange={e => set("owner_id", e.target.value)} style={inputStyle}>
                <option value="">Selecionar...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
              </select>
            </FIELD>
            <FIELD label="Stage *">
              <select value={form.stage} onChange={e => set("stage", e.target.value)} style={inputStyle}>
                {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </FIELD>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FIELD label="Valor estimado (R$)">
              <input type="number" min="0" value={form.estimated_value} onChange={e => set("estimated_value", e.target.value)} placeholder="0" style={inputStyle} />
              {errors.estimated_value && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.estimated_value}</p>}
            </FIELD>
            <FIELD label="Origem">
              <select value={form.origin} onChange={e => set("origin", e.target.value)} style={inputStyle}>
                <option value="">Selecionar...</option>
                {ORIGINS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </FIELD>
          </div>

          <FIELD label={`Probabilidade: ${form.probability}%`}>
            <input type="range" min="0" max="100" value={form.probability} onChange={e => set("probability", e.target.value)}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: "#F0C000" }} />
          </FIELD>

          <FIELD label="Data prevista de fechamento">
            <input type="date" min={today} value={form.expected_close_date} onChange={e => set("expected_close_date", e.target.value)} style={inputStyle} />
            {errors.expected_close_date && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.expected_close_date}</p>}
          </FIELD>

          <FIELD label="Observações">
            <textarea rows={3} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Notas adicionais..." style={{ ...inputStyle, resize: "vertical" }} />
          </FIELD>
        </div>
        <div className="flex gap-2 px-6 py-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: "rgba(0,0,0,0.06)", color: "#555555" }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)", color: "#1A1A1A", boxShadow: "0 2px 8px rgba(240,192,0,0.30)", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}