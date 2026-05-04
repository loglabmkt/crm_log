import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";

const inputStyle = { background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.10)", color: "#1A1A1A", fontFamily: "Inter,sans-serif", borderRadius: 10, padding: "8px 12px", width: "100%", fontSize: 14, outline: "none" };

const ROLES = [
  { key: "admin", label: "Admin" },
  { key: "manager", label: "Gerente" },
  { key: "sales", label: "Vendas" },
  { key: "support", label: "Suporte" },
  { key: "marketing", label: "Marketing" },
];

export default function UserEditModal({ user, isOnlyAdmin, onClose, onSaved }) {
  const [form, setForm] = useState({ full_name: user.full_name || "", role: user.role || "user", is_active: user.is_active !== false });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.full_name.trim()) return;
    setSaving(true);
    await base44.entities.User.update(user.id, {
      full_name: form.full_name,
      role: isOnlyAdmin ? user.role : form.role,
      is_active: form.is_active,
    });
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.20)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-2xl" style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(240,192,0,0.20)", boxShadow: "0 16px 48px rgba(0,0,0,0.16)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>Editar usuário</h2>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: "#999" }} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Nome completo</label>
            <input value={form.full_name} onChange={e => set("full_name", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Role</label>
            <select value={form.role} onChange={e => set("role", e.target.value)} style={{ ...inputStyle, ...(isOnlyAdmin ? { opacity: 0.5, cursor: "not-allowed" } : {}) }} disabled={isOnlyAdmin}>
              {ROLES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
            {isOnlyAdmin && <p className="text-xs mt-1" style={{ color: "#F59E0B" }}>Único admin do sistema — role não pode ser alterado.</p>}
          </div>
          <div className="flex items-center gap-3">
            <div onClick={() => set("is_active", !form.is_active)} className="w-10 h-5 rounded-full relative transition-colors cursor-pointer" style={{ background: form.is_active ? "#F0C000" : "rgba(0,0,0,0.15)" }}>
              <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: form.is_active ? "22px" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.20)" }} />
            </div>
            <span className="text-sm" style={{ color: "#555" }}>Usuário ativo</span>
          </div>
        </div>
        <div className="flex gap-2 px-6 py-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: "rgba(0,0,0,0.06)", color: "#555" }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving || !form.full_name.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "linear-gradient(135deg,#F0C000 0%,#C49A00 100%)", color: "#1A1A1A", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}