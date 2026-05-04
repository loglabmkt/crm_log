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

function CheckGroup({ label, items, selected, onChange }) {
  const toggle = (k) => onChange(selected.includes(k) ? selected.filter(x => x !== k) : [...selected, k]);
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#999999" }}>{label}</p>
      <div className="space-y-1.5">
        {items.map(item => (
          <label key={item.key} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={selected.includes(item.key)} onChange={() => toggle(item.key)} style={{ accentColor: "#F0C000" }} />
            <span className="text-sm" style={{ color: "#555555" }}>{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function SalesFilterDrawer({ open, onClose, filters, onApply }) {
  const [local, setLocal] = useState(filters);
  const [users, setUsers] = useState([]);

  useEffect(() => { base44.entities.User.list().then(setUsers); }, []);
  useEffect(() => { setLocal(filters); }, [filters]);

  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }));
  const clear = () => setLocal({ search: "", stages: [], org_types: [], regions: [], owner_id: "" });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1" onClick={onClose} />
      <div className="w-80 h-full flex flex-col" style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)", borderLeft: "1px solid rgba(240,192,0,0.15)", boxShadow: "-8px 0 32px rgba(0,0,0,0.10)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <h3 className="font-semibold" style={{ color: "#1A1A1A" }}>Filtros</h3>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: "#999" }} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#999999" }}>Busca</p>
            <input value={local.search || ""} onChange={e => set("search", e.target.value)} placeholder="Nome da organização..."
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.10)", color: "#1A1A1A", fontFamily: "Inter, sans-serif" }} />
          </div>
          <CheckGroup label="Stage" items={STAGES} selected={local.stages || []} onChange={v => set("stages", v)} />
          <CheckGroup label="Tipo de Órgão" items={ORG_TYPES} selected={local.org_types || []} onChange={v => set("org_types", v)} />
          <CheckGroup label="Região" items={REGIONS} selected={local.regions || []} onChange={v => set("regions", v)} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#999999" }}>Responsável</p>
            <select value={local.owner_id || ""} onChange={e => set("owner_id", e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.10)", color: "#1A1A1A", fontFamily: "Inter, sans-serif" }}>
              <option value="">Todos</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
            </select>
          </div>
        </div>
        <div className="px-5 py-4 flex gap-2" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <button onClick={clear} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: "rgba(0,0,0,0.06)", color: "#555555" }}>Limpar tudo</button>
          <button onClick={() => { onApply(local); onClose(); }} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)", color: "#1A1A1A", boxShadow: "0 2px 8px rgba(240,192,0,0.30)" }}>Aplicar</button>
        </div>
      </div>
    </div>
  );
}