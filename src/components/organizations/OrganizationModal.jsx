import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";

const ORG_TYPES = [
  { key: "prefeitura", label: "Prefeitura" }, { key: "secretaria", label: "Secretaria" },
  { key: "autarquia", label: "Autarquia" }, { key: "fundacao", label: "Fundação" },
  { key: "empresa_publica", label: "Empresa Pública" }, { key: "outros", label: "Outros" },
];
const REGIONS = [
  { key: "norte", label: "Norte" }, { key: "nordeste", label: "Nordeste" },
  { key: "centro_oeste", label: "Centro-Oeste" }, { key: "sudeste", label: "Sudeste" },
  { key: "sul", label: "Sul" },
];
const STATE_REGION = {
  AC:"norte", AM:"norte", AP:"norte", PA:"norte", RO:"norte", RR:"norte", TO:"norte",
  AL:"nordeste", BA:"nordeste", CE:"nordeste", MA:"nordeste", PB:"nordeste", PE:"nordeste", PI:"nordeste", RN:"nordeste", SE:"nordeste",
  DF:"centro_oeste", GO:"centro_oeste", MS:"centro_oeste", MT:"centro_oeste",
  ES:"sudeste", MG:"sudeste", RJ:"sudeste", SP:"sudeste",
  PR:"sul", RS:"sul", SC:"sul",
};
const ALL_STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const inputStyle = { background:"rgba(0,0,0,0.04)", border:"1px solid rgba(0,0,0,0.10)", color:"#1A1A1A", fontFamily:"Inter,sans-serif", borderRadius:10, padding:"8px 12px", width:"100%", fontSize:14, outline:"none" };

export default function OrganizationModal({ organization, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: organization?.name || "", type: organization?.type || "",
    state: organization?.state || "", city: organization?.city || "",
    region: organization?.region || "", website: organization?.website || "",
    phone: organization?.phone || "", address: organization?.address || "",
    owner_id: organization?.owner_id || "", notes: organization?.notes || "",
    is_active: organization?.is_active !== undefined ? organization.is_active : true,
  });
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { base44.entities.User.list().then(setUsers); }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleStateChange = (state) => {
    set("state", state);
    if (STATE_REGION[state]) set("region", STATE_REGION[state]);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Obrigatório";
    if (!form.type) e.type = "Obrigatório";
    if (!form.state) e.state = "Obrigatório";
    if (!form.city.trim()) e.city = "Obrigatório";
    if (form.website && !form.website.includes(".")) e.website = "URL inválida";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    if (organization?.id) await base44.entities.Organization.update(organization.id, form);
    else await base44.entities.Organization.create(form);
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.20)", backdropFilter:"blur(4px)" }}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background:"rgba(255,255,255,0.97)", border:"1px solid rgba(240,192,0,0.20)", boxShadow:"0 16px 48px rgba(0,0,0,0.16)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:"1px solid rgba(0,0,0,0.06)" }}>
          <h2 className="text-base font-semibold" style={{ color:"#1A1A1A" }}>{organization?.id ? "Editar Organização" : "Nova Organização"}</h2>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color:"#999" }} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color:"#555" }}>Nome *</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Nome da organização" style={inputStyle} />
            {errors.name && <p className="text-xs mt-1" style={{ color:"#EF4444" }}>{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color:"#555" }}>Tipo *</label>
            <select value={form.type} onChange={e => set("type", e.target.value)} style={inputStyle}>
              <option value="">Selecionar...</option>
              {ORG_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
            {errors.type && <p className="text-xs mt-1" style={{ color:"#EF4444" }}>{errors.type}</p>}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color:"#555" }}>Estado *</label>
              <select value={form.state} onChange={e => handleStateChange(e.target.value)} style={inputStyle}>
                <option value="">UF</option>
                {ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <p className="text-xs mt-1" style={{ color:"#EF4444" }}>{errors.state}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color:"#555" }}>Cidade *</label>
              <input value={form.city} onChange={e => set("city", e.target.value)} placeholder="Cidade" style={inputStyle} />
              {errors.city && <p className="text-xs mt-1" style={{ color:"#EF4444" }}>{errors.city}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color:"#555" }}>Região (preenchida automaticamente)</label>
            <select value={form.region} onChange={e => set("region", e.target.value)} style={inputStyle}>
              <option value="">Selecionar...</option>
              {REGIONS.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color:"#555" }}>Website</label>
            <input value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://..." style={inputStyle} />
            {errors.website && <p className="text-xs mt-1" style={{ color:"#EF4444" }}>{errors.website}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color:"#555" }}>Telefone</label>
              <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(00) 00000-0000" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color:"#555" }}>Responsável</label>
              <select value={form.owner_id} onChange={e => set("owner_id", e.target.value)} style={inputStyle}>
                <option value="">Selecionar...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color:"#555" }}>Endereço</label>
            <input value={form.address} onChange={e => set("address", e.target.value)} placeholder="Endereço completo" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color:"#555" }}>Observações</label>
            <textarea rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} style={{ ...inputStyle, resize:"vertical" }} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => set("is_active", !form.is_active)} className="w-10 h-5 rounded-full relative transition-colors" style={{ background: form.is_active ? "#F0C000" : "rgba(0,0,0,0.15)" }}>
              <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: form.is_active ? "22px" : "2px", boxShadow:"0 1px 3px rgba(0,0,0,0.20)" }} />
            </div>
            <span className="text-sm" style={{ color:"#555" }}>Organização ativa</span>
          </label>
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