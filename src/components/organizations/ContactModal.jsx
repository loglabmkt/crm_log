import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";

const inputStyle = { background:"rgba(0,0,0,0.04)", border:"1px solid rgba(0,0,0,0.10)", color:"#1A1A1A", fontFamily:"Inter,sans-serif", borderRadius:10, padding:"8px 12px", width:"100%", fontSize:14, outline:"none" };

export default function ContactModal({ contact, organizationId, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: contact?.name || "", role_title: contact?.role_title || "",
    email: contact?.email || "", phone: contact?.phone || "",
    whatsapp: contact?.whatsapp || "", is_primary: contact?.is_primary || false,
    notes: contact?.notes || "", is_active: contact?.is_active !== undefined ? contact.is_active : true,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Obrigatório";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    if (form.is_primary) {
      const existing = await base44.entities.Contact.filter({ organization_id: organizationId, is_primary: true });
      for (const c of existing) {
        if (!contact?.id || c.id !== contact.id) {
          await base44.entities.Contact.update(c.id, { is_primary: false });
        }
      }
    }
    const payload = { ...form, organization_id: organizationId };
    if (contact?.id) await base44.entities.Contact.update(contact.id, payload);
    else await base44.entities.Contact.create(payload);
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.20)", backdropFilter:"blur(4px)" }}>
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background:"rgba(255,255,255,0.97)", border:"1px solid rgba(240,192,0,0.20)", boxShadow:"0 16px 48px rgba(0,0,0,0.16)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:"1px solid rgba(0,0,0,0.06)" }}>
          <h2 className="text-base font-semibold" style={{ color:"#1A1A1A" }}>{contact?.id ? "Editar Contato" : "Novo Contato"}</h2>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color:"#999" }} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color:"#555" }}>Nome *</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Nome completo" style={inputStyle} />
            {errors.name && <p className="text-xs mt-1" style={{ color:"#EF4444" }}>{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color:"#555" }}>Cargo</label>
            <input value={form.role_title} onChange={e => set("role_title", e.target.value)} placeholder="Ex: Secretário de Saúde" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color:"#555" }}>Email</label>
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@exemplo.com" style={inputStyle} />
            {errors.email && <p className="text-xs mt-1" style={{ color:"#EF4444" }}>{errors.email}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color:"#555" }}>Telefone</label>
              <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(00) 00000-0000" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color:"#555" }}>WhatsApp</label>
              <input value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} placeholder="(00) 00000-0000" style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color:"#555" }}>Observações</label>
            <textarea rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} style={{ ...inputStyle, resize:"vertical" }} />
          </div>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => set("is_primary", !form.is_primary)} className="w-10 h-5 rounded-full relative transition-colors" style={{ background: form.is_primary ? "#F0C000" : "rgba(0,0,0,0.15)" }}>
                <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: form.is_primary ? "22px" : "2px", boxShadow:"0 1px 3px rgba(0,0,0,0.20)" }} />
              </div>
              <span className="text-sm" style={{ color:"#555" }}>Contato principal</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => set("is_active", !form.is_active)} className="w-10 h-5 rounded-full relative transition-colors" style={{ background: form.is_active ? "#F0C000" : "rgba(0,0,0,0.15)" }}>
                <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: form.is_active ? "22px" : "2px", boxShadow:"0 1px 3px rgba(0,0,0,0.20)" }} />
              </div>
              <span className="text-sm" style={{ color:"#555" }}>Contato ativo</span>
            </label>
          </div>
        </div>
        <div className="flex gap-2 px-6 py-4" style={{ borderTop:"1px solid rgba(0,0,0,0.06)" }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background:"rgba(0,0,0,0.06)", color:"#555" }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ background:"linear-gradient(135deg,#F0C000 0%,#C49A00 100%)", color:"#1A1A1A", opacity:saving?0.7:1 }}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}