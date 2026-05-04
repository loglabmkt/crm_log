import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";

const ORG_TYPES = [
  { key: "prefeitura", label: "Prefeitura" },
  { key: "secretaria", label: "Secretaria" },
  { key: "autarquia", label: "Autarquia" },
  { key: "fundacao", label: "Fundação" },
  { key: "empresa_publica", label: "Empresa Pública" },
  { key: "outros", label: "Outros" },
];
const REGIONS = [
  { key: "norte", label: "Norte" },
  { key: "nordeste", label: "Nordeste" },
  { key: "centro_oeste", label: "Centro-Oeste" },
  { key: "sudeste", label: "Sudeste" },
  { key: "sul", label: "Sul" },
];
const STAGES = [
  { key: "prospeccao", label: "Prospecção" },
  { key: "qualificacao", label: "Qualificação" },
  { key: "proposta", label: "Proposta" },
  { key: "negociacao", label: "Negociação" },
  { key: "licitacao", label: "Licitação" },
  { key: "fechado_ganho", label: "Fechado Ganho" },
  { key: "fechado_perdido", label: "Perdido" },
];
const STATES_BR = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

function CheckGroup({ label, items, selected, onChange }) {
  const toggle = (k) => onChange(selected.includes(k) ? selected.filter(x => x !== k) : [...selected, k]);
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#999" }}>{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <label key={item.key || item} className="flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-full text-xs transition-colors"
            style={{ background: selected.includes(item.key || item) ? "rgba(240,192,0,0.15)" : "rgba(0,0,0,0.04)", border: "1px solid", borderColor: selected.includes(item.key || item) ? "rgba(240,192,0,0.40)" : "transparent", color: selected.includes(item.key || item) ? "#8A6E00" : "#555" }}>
            <input type="checkbox" checked={selected.includes(item.key || item)} onChange={() => toggle(item.key || item)} className="hidden" />
            {item.label || item}
          </label>
        ))}
      </div>
    </div>
  );
}

const inputStyle = { background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.10)", color: "#1A1A1A", fontFamily: "Inter,sans-serif", borderRadius: 10, padding: "8px 12px", width: "100%", fontSize: 14, outline: "none" };

export default function SegmentModal({ segment, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: segment?.name || "",
    description: segment?.description || "",
    filters: segment?.filters || { org_types: [], states: [], regions: [], cities: [], stages: [], tags: [] },
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [previewCount, setPreviewCount] = useState(null);
  const [allOrgs, setAllOrgs] = useState([]);

  useEffect(() => { base44.entities.Organization.list().then(setAllOrgs); }, []);

  useEffect(() => {
    const f = form.filters;
    let orgs = allOrgs;
    if (f.org_types?.length) orgs = orgs.filter(o => f.org_types.includes(o.type));
    if (f.regions?.length) orgs = orgs.filter(o => f.regions.includes(o.region));
    if (f.states?.length) orgs = orgs.filter(o => f.states.includes(o.state));
    setPreviewCount(orgs.length);
  }, [form.filters, allOrgs]);

  const setFilter = (k, v) => setForm(p => ({ ...p, filters: { ...p.filters, [k]: v } }));
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const hasFilter = Object.values(form.filters).some(v => Array.isArray(v) ? v.length > 0 : !!v);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Obrigatório";
    if (!hasFilter) e.filters = "Selecione pelo menos 1 critério";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    if (segment?.id) await base44.entities.Segment.update(segment.id, form);
    else await base44.entities.Segment.create(form);
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.20)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(240,192,0,0.20)", boxShadow: "0 16px 48px rgba(0,0,0,0.16)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>{segment?.id ? "Editar Segmento" : "Novo Segmento"}</h2>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: "#999" }} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Nome *</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ex: Prefeituras do Nordeste" style={inputStyle} />
            {errors.name && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Descrição</label>
            <textarea rows={2} value={form.description} onChange={e => set("description", e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div className="space-y-4 pt-2" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>Critérios de segmentação</p>
            {errors.filters && <p className="text-xs" style={{ color: "#EF4444" }}>{errors.filters}</p>}
            <CheckGroup label="Tipo de órgão" items={ORG_TYPES} selected={form.filters.org_types || []} onChange={v => setFilter("org_types", v)} />
            <CheckGroup label="Região" items={REGIONS} selected={form.filters.regions || []} onChange={v => setFilter("regions", v)} />
            <CheckGroup label="Estado (UF)" items={STATES_BR.map(s => ({ key: s, label: s }))} selected={form.filters.states || []} onChange={v => setFilter("states", v)} />
            <CheckGroup label="Stage da oportunidade" items={STAGES} selected={form.filters.stages || []} onChange={v => setFilter("stages", v)} />
          </div>

          {/* Preview */}
          <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "rgba(240,192,0,0.08)", border: "1px solid rgba(240,192,0,0.20)" }}>
            <div className="w-2 h-2 rounded-full" style={{ background: "#F0C000" }} />
            <p className="text-sm font-medium" style={{ color: "#8A6E00" }}>
              Este segmento contém <strong>{previewCount ?? "..."}</strong> organizações
            </p>
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