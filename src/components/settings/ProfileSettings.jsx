import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import { Shield, Camera } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const inputStyle = { background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.10)", color: "#1A1A1A", fontFamily: "Inter,sans-serif", borderRadius: 10, padding: "8px 12px", width: "100%", fontSize: 14, outline: "none" };

const TIMEZONES = [
  { value: "America/Sao_Paulo", label: "America/Sao_Paulo (GMT-3)" },
  { value: "America/Belem", label: "America/Belem (GMT-3)" },
  { value: "America/Fortaleza", label: "America/Fortaleza (GMT-3)" },
  { value: "America/Recife", label: "America/Recife (GMT-3)" },
  { value: "America/Manaus", label: "America/Manaus (GMT-4)" },
  { value: "America/Porto_Velho", label: "America/Porto_Velho (GMT-4)" },
  { value: "America/Boa_Vista", label: "America/Boa_Vista (GMT-4)" },
  { value: "America/Rio_Branco", label: "America/Rio_Branco (GMT-5)" },
  { value: "America/Noronha", label: "America/Noronha (GMT-2)" },
];

function parsePrefs(user) {
  try { return JSON.parse(user?.notes || "{}"); } catch { return {}; }
}

export default function ProfileSettings() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ full_name: "", role_title: "" });
  const [prefs, setPrefs] = useState({ timezone: "America/Sao_Paulo" });
  const [saving, setSaving] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setForm({ full_name: u?.full_name || "", role_title: u?.role_title || "" });
      const p = parsePrefs(u);
      setPrefs({ timezone: p.timezone || "America/Sao_Paulo" });
    });
  }, []);

  const initials = (user?.full_name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const handleSaveProfile = async () => {
    if (!form.full_name.trim()) return;
    setSaving(true);
    await base44.auth.updateMe({ full_name: form.full_name, role_title: form.role_title });
    setSaving(false);
    toast({ title: "Perfil atualizado com sucesso!" });
  };

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    const currentPrefs = parsePrefs(user);
    const newNotes = JSON.stringify({ ...currentPrefs, timezone: prefs.timezone });
    await base44.auth.updateMe({ notes: newNotes });
    const updated = await base44.auth.me();
    setUser(updated);
    setSavingPrefs(false);
    toast({ title: "Preferências salvas com sucesso!" });
  };

  if (!user) return (
    <div className="space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "rgba(240,192,0,0.06)" }} />)}
    </div>
  );

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Dados pessoais */}
      <GlassCard>
        <h3 className="font-semibold mb-4" style={{ color: "#1A1A1A", fontSize: 16 }}>Dados pessoais</h3>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#F0C000,#C49A00)", color: "#1A1A1A" }}>
            {initials}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
            style={{ background: "rgba(0,0,0,0.05)", color: "#555", border: "1px solid rgba(0,0,0,0.08)" }}>
            <Camera className="w-4 h-4" /> Alterar foto
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Nome completo *</label>
            <input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>E-mail</label>
            <input value={user.email || ""} disabled style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }} />
            <p className="text-xs mt-1" style={{ color: "#999" }}>Gerenciado pelo sistema de autenticação</p>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Cargo / função</label>
            <input value={form.role_title || ""} onChange={e => setForm(p => ({ ...p, role_title: e.target.value }))} placeholder="Ex: Gerente Comercial" style={inputStyle} />
          </div>
        </div>
        <button onClick={handleSaveProfile} disabled={saving || !form.full_name.trim()}
          className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "linear-gradient(135deg,#F0C000 0%,#C49A00 100%)", color: "#1A1A1A", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </GlassCard>

      {/* Segurança */}
      <GlassCard>
        <h3 className="font-semibold mb-3" style={{ color: "#1A1A1A", fontSize: 16 }}>Segurança</h3>
        <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(240,192,0,0.06)", border: "1px solid rgba(240,192,0,0.15)" }}>
          <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#C49A00" }} />
          <p className="text-sm" style={{ color: "#555" }}>
            A senha é gerenciada pelo sistema de autenticação. Para alterá-la, use a opção de recuperação de senha na tela de login.
          </p>
        </div>
      </GlassCard>

      {/* Preferências */}
      <GlassCard>
        <h3 className="font-semibold mb-4" style={{ color: "#1A1A1A", fontSize: 16 }}>Preferências</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Idioma</label>
            <select disabled style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }}>
              <option>Português (BR)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Fuso horário</label>
            <select value={prefs.timezone} onChange={e => setPrefs(p => ({ ...p, timezone: e.target.value }))} style={inputStyle}>
              {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
            </select>
          </div>
        </div>
        <button onClick={handleSavePrefs} disabled={savingPrefs}
          className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "linear-gradient(135deg,#F0C000 0%,#C49A00 100%)", color: "#1A1A1A", opacity: savingPrefs ? 0.7 : 1 }}>
          {savingPrefs ? "Salvando..." : "Salvar preferências"}
        </button>
      </GlassCard>
    </div>
  );
}