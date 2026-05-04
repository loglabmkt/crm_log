import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import { useToast } from "@/components/ui/use-toast";

const inputStyle = { background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.10)", color: "#1A1A1A", fontFamily: "Inter,sans-serif", borderRadius: 10, padding: "8px 12px", width: "100%", fontSize: 14, outline: "none" };

const ALL_STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

function parseMeta(user) {
  try { const p = JSON.parse(user?.notes || "{}"); return p.company || {}; } catch { return {}; }
}

function formatCNPJ(v) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, "$1.$2.$3/$4-$5")
          .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})$/, "$1.$2.$3/$4")
          .replace(/^(\d{2})(\d{3})(\d{3})$/, "$1.$2.$3")
          .replace(/^(\d{2})(\d{3})$/, "$1.$2")
          .replace(/^(\d{2})$/, "$1");
}

export default function CompanySettings() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "Log Lab", cnpj: "", phone: "", email: "", website: "", address: "", city: "", state: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      const c = parseMeta(u);
      setForm(f => ({ ...f, ...c }));
    });
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    let currentNotes = {};
    try { currentNotes = JSON.parse(user?.notes || "{}"); } catch {}
    const newNotes = JSON.stringify({ ...currentNotes, company: form });
    await base44.auth.updateMe({ notes: newNotes });
    const updated = await base44.auth.me();
    setUser(updated);
    setSaving(false);
    toast({ title: "Dados da empresa salvos com sucesso!" });
  };

  if (!user) return (
    <div className="space-y-4">
      {[1,2].map(i => <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: "rgba(240,192,0,0.06)" }} />)}
    </div>
  );

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Informações da empresa */}
      <GlassCard>
        <h3 className="font-semibold mb-4" style={{ color: "#1A1A1A", fontSize: 16 }}>Informações da empresa</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Nome da empresa</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Log Lab" style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>CNPJ</label>
              <input value={form.cnpj} onChange={e => set("cnpj", formatCNPJ(e.target.value))} placeholder="00.000.000/0000-00" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Telefone principal</label>
              <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(00) 00000-0000" style={inputStyle} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>E-mail de contato</label>
              <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="contato@empresa.com" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Website</label>
              <input value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://..." style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Endereço completo</label>
            <input value={form.address} onChange={e => set("address", e.target.value)} placeholder="Rua, número, complemento" style={inputStyle} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Cidade</label>
              <input value={form.city} onChange={e => set("city", e.target.value)} placeholder="Cidade" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Estado</label>
              <select value={form.state} onChange={e => set("state", e.target.value)} style={inputStyle}>
                <option value="">UF</option>
                {ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "linear-gradient(135deg,#F0C000 0%,#C49A00 100%)", color: "#1A1A1A", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Salvando..." : "Salvar dados da empresa"}
        </button>
      </GlassCard>

      {/* Aparência */}
      <GlassCard>
        <h3 className="font-semibold mb-4" style={{ color: "#1A1A1A", fontSize: 16 }}>Aparência</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.03)" }}>
            <span className="text-sm" style={{ color: "#555" }}>Tema atual</span>
            <span className="text-sm font-medium" style={{ color: "#1A1A1A" }}>Log Lab CRM</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.03)" }}>
            <span className="text-sm" style={{ color: "#555" }}>Cor primária</span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full" style={{ background: "#F0C000" }} />
              <span className="text-sm font-medium" style={{ color: "#1A1A1A" }}>#F0C000</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.03)" }}>
            <span className="text-sm" style={{ color: "#555" }}>Tipografia</span>
            <span className="text-sm font-medium" style={{ color: "#1A1A1A", fontFamily: "Inter" }}>Inter</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}