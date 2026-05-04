import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";

const TYPES = [
  { key: "suporte_tecnico", label: "Suporte Técnico" },
  { key: "duvida_funcional", label: "Dúvida Funcional" },
  { key: "melhoria", label: "Melhoria" },
  { key: "incidente", label: "Incidente" },
];
const PRIORITIES = [
  { key: "baixa", label: "Baixa" },
  { key: "media", label: "Média" },
  { key: "alta", label: "Alta" },
  { key: "critica", label: "Crítica" },
];
const SLA_QUICK = [4, 8, 24, 48, 72];
const inputStyle = { background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.10)", color: "#1A1A1A", fontFamily: "Inter,sans-serif", borderRadius: 10, padding: "8px 12px", width: "100%", fontSize: 14, outline: "none" };

export default function TicketModal({ ticket, defaultOrgId, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: ticket?.title || "", organization_id: ticket?.organization_id || defaultOrgId || "",
    contact_id: ticket?.contact_id || "", type: ticket?.type || "suporte_tecnico",
    priority: ticket?.priority || "media", module_related: ticket?.module_related || "",
    sla_hours: ticket?.sla_hours || "", description: ticket?.description || "",
  });
  const [orgs, setOrgs] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { base44.entities.Organization.list().then(setOrgs); }, []);
  useEffect(() => {
    if (!form.organization_id) { setContacts([]); return; }
    base44.entities.Contact.filter({ organization_id: form.organization_id }).then(setContacts);
  }, [form.organization_id]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Obrigatório";
    if (!form.organization_id) e.organization_id = "Obrigatório";
    if (!form.type) e.type = "Obrigatório";
    if (!form.priority) e.priority = "Obrigatório";
    if (!form.description.trim()) e.description = "Obrigatório";
    if (form.sla_hours && Number(form.sla_hours) <= 0) e.sla_hours = "Deve ser > 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const user = await base44.auth.me();
    const payload = { ...form, sla_hours: form.sla_hours ? Number(form.sla_hours) : undefined };
    if (ticket?.id) {
      await base44.entities.Ticket.update(ticket.id, payload);
    } else {
      await base44.entities.Ticket.create({ ...payload, status: "aberto", created_by: user?.id });
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.20)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(240,192,0,0.20)", boxShadow: "0 16px 48px rgba(0,0,0,0.16)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>{ticket?.id ? "Editar Ticket" : "Novo Ticket"}</h2>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: "#999" }} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Título *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Descreva o problema resumidamente" style={inputStyle} />
            {errors.title && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.title}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Organização *</label>
              <select value={form.organization_id} onChange={e => { set("organization_id", e.target.value); set("contact_id", ""); }} style={inputStyle}>
                <option value="">Selecionar...</option>
                {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              {errors.organization_id && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.organization_id}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Contato</label>
              <select value={form.contact_id} onChange={e => set("contact_id", e.target.value)} style={inputStyle} disabled={!form.organization_id}>
                <option value="">Selecionar...</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Tipo *</label>
              <select value={form.type} onChange={e => set("type", e.target.value)} style={inputStyle}>
                {TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Prioridade *</label>
              <select value={form.priority} onChange={e => set("priority", e.target.value)} style={inputStyle}>
                {PRIORITIES.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Módulo/sistema relacionado</label>
            <input value={form.module_related} onChange={e => set("module_related", e.target.value)} placeholder="Ex: Módulo financeiro" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "#555" }}>SLA (horas)</label>
            <div className="flex gap-1.5 flex-wrap mb-2">
              {SLA_QUICK.map(h => (
                <button key={h} onClick={() => set("sla_hours", h)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                  style={{ background: Number(form.sla_hours) === h ? "rgba(240,192,0,0.15)" : "rgba(0,0,0,0.05)", color: Number(form.sla_hours) === h ? "#8A6E00" : "#555", border: `1px solid ${Number(form.sla_hours) === h ? "rgba(240,192,0,0.30)" : "transparent"}` }}>
                  {h}h
                </button>
              ))}
            </div>
            <input type="number" min="1" value={form.sla_hours} onChange={e => set("sla_hours", e.target.value)} placeholder="Ou digitar..." style={{ ...inputStyle }} />
            {errors.sla_hours && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.sla_hours}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Descrição *</label>
            <textarea rows={4} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Descreva o problema com detalhes..." style={{ ...inputStyle, resize: "vertical" }} />
            {errors.description && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.description}</p>}
          </div>
        </div>
        <div className="flex gap-2 px-6 py-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: "rgba(0,0,0,0.06)", color: "#555" }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "linear-gradient(135deg,#F0C000 0%,#C49A00 100%)", color: "#1A1A1A", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}