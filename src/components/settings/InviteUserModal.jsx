import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Mail } from "lucide-react";

const inputStyle = { background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.10)", color: "#1A1A1A", fontFamily: "Inter,sans-serif", borderRadius: 10, padding: "8px 12px", width: "100%", fontSize: 14, outline: "none" };

const ROLES = [
  { key: "admin", label: "Admin" },
  { key: "manager", label: "Gerente" },
  { key: "sales", label: "Vendas" },
  { key: "support", label: "Suporte" },
  { key: "marketing", label: "Marketing" },
];

export default function InviteUserModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ email: "", full_name: "", role: "sales" });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Obrigatório";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "E-mail inválido";
    if (!form.full_name.trim()) e.full_name = "Obrigatório";
    if (!form.role) e.role = "Obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSend = async () => {
    if (!validate()) return;
    setSending(true);
    await base44.users.inviteUser(form.email, form.role);
    setSending(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.20)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-2xl" style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(240,192,0,0.20)", boxShadow: "0 16px 48px rgba(0,0,0,0.16)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>Convidar usuário</h2>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: "#999" }} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-xl text-sm" style={{ background: "rgba(240,192,0,0.07)", border: "1px solid rgba(240,192,0,0.20)" }}>
            <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#C49A00" }} />
            <p style={{ color: "#8A6E00" }}>Um convite será enviado para o e-mail informado.</p>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>E-mail *</label>
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@exemplo.com" style={inputStyle} />
            {errors.email && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.email}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Nome completo *</label>
            <input value={form.full_name} onChange={e => set("full_name", e.target.value)} placeholder="Nome do usuário" style={inputStyle} />
            {errors.full_name && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.full_name}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Role *</label>
            <select value={form.role} onChange={e => set("role", e.target.value)} style={inputStyle}>
              {ROLES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
            {errors.role && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.role}</p>}
          </div>
        </div>
        <div className="flex gap-2 px-6 py-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: "rgba(0,0,0,0.06)", color: "#555" }}>Cancelar</button>
          <button onClick={handleSend} disabled={sending} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "linear-gradient(135deg,#F0C000 0%,#C49A00 100%)", color: "#1A1A1A", opacity: sending ? 0.7 : 1 }}>
            {sending ? "Enviando..." : "Enviar convite"}
          </button>
        </div>
      </div>
    </div>
  );
}