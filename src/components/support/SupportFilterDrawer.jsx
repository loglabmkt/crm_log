import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";

const PRIORITIES = [
  { key: "baixa", label: "Baixa" }, { key: "media", label: "Média" },
  { key: "alta", label: "Alta" }, { key: "critica", label: "Crítica" },
];
const TYPES = [
  { key: "suporte_tecnico", label: "Suporte Técnico" }, { key: "duvida_funcional", label: "Dúvida Funcional" },
  { key: "melhoria", label: "Melhoria" }, { key: "incidente", label: "Incidente" },
];

function CheckGroup({ label, items, selected, onChange }) {
  const toggle = (k) => onChange(selected.includes(k) ? selected.filter(x => x !== k) : [...selected, k]);
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#999" }}>{label}</p>
      <div className="space-y-1.5">
        {items.map(item => (
          <label key={item.key} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={selected.includes(item.key)} onChange={() => toggle(item.key)} style={{ accentColor: "#F0C000" }} />
            <span className="text-sm" style={{ color: "#555" }}>{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function SupportFilterDrawer({ open, onClose, filters, onApply }) {
  const [local, setLocal] = useState(filters);
  const [users, setUsers] = useState([]);
  const [orgs, setOrgs] = useState([]);

  useEffect(() => {
    Promise.all([base44.entities.User.list(), base44.entities.Organization.list()])
      .then(([u, o]) => { setUsers(u); setOrgs(o); });
  }, []);
  useEffect(() => { setLocal(filters); }, [filters]);

  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }));
  const clear = () => setLocal({ priorities: [], types: [], owner_id: "", organization_id: "" });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1" onClick={onClose} />
      <div className="w-72 h-full flex flex-col" style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)", borderLeft: "1px solid rgba(240,192,0,0.15)", boxShadow: "-8px 0 32px rgba(0,0,0,0.10)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <h3 className="font-semibold" style={{ color: "#1A1A1A" }}>Filtros</h3>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: "#999" }} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <CheckGroup label="Prioridade" items={PRIORITIES} selected={local.priorities || []} onChange={v => set("priorities", v)} />
          <CheckGroup label="Tipo" items={TYPES} selected={local.types || []} onChange={v => set("types", v)} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#999" }}>Responsável</p>
            <select value={local.owner_id || ""} onChange={e => set("owner_id", e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.10)", color: "#1A1A1A", fontFamily: "Inter,sans-serif" }}>
              <option value="">Todos</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#999" }}>Organização</p>
            <select value={local.organization_id || ""} onChange={e => set("organization_id", e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.10)", color: "#1A1A1A", fontFamily: "Inter,sans-serif" }}>
              <option value="">Todas</option>
              {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
        </div>
        <div className="px-5 py-4 flex gap-2" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <button onClick={clear} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: "rgba(0,0,0,0.06)", color: "#555" }}>Limpar</button>
          <button onClick={() => { onApply(local); onClose(); }} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "linear-gradient(135deg,#F0C000 0%,#C49A00 100%)", color: "#1A1A1A" }}>Aplicar</button>
        </div>
      </div>
    </div>
  );
}