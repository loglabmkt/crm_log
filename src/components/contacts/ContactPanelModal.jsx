import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Save } from "lucide-react";
import { UF_LIST, UF_TO_REGION, STATUS_LIST } from "@/lib/ufData";

const inputStyle = {
  background: "rgba(0,0,0,0.04)",
  border: "1px solid rgba(0,0,0,0.10)",
  color: "#1A1A1A",
  fontFamily: "Inter, sans-serif",
  borderRadius: 10,
  padding: "8px 12px",
  width: "100%",
  fontSize: 14,
  outline: "none",
};

function SectionTitle({ children, sub }) {
  return (
    <div className="pl-3 mb-4" style={{ borderLeft: "3px solid #F0C000" }}>
      <p className="font-semibold text-sm" style={{ color: "#1A1A1A" }}>{children}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: "#999" }}>{sub}</p>}
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>
        {label}{required && <span style={{ color: "#EF4444" }}> *</span>}
      </label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{error}</p>}
    </div>
  );
}

const EMPTY = {
  pos_id_logistico: "",
  municipio: "",
  uf: "",
  regiao: "",
  populacao_estimada: "",
  orgao_secretaria: "",
  nome_contato: "",
  email: "",
  telefone: "",
  status: "lead_email",
  observacoes: "",
};

export default function ContactPanelModal({ contact, onClose, onSaved }) {
  const isEdit = !!contact?.id;
  const [form, setForm] = useState({ ...EMPTY, ...(contact || {}) });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleUF = (uf) => {
    set("uf", uf);
    if (UF_TO_REGION[uf]) set("regiao", UF_TO_REGION[uf]);
  };

  const validate = () => {
    const e = {};
    if (!form.municipio.trim()) e.municipio = "Obrigatório";
    if (!form.uf) e.uf = "Obrigatório";
    if (!form.status) e.status = "Obrigatório";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      ...form,
      populacao_estimada: form.populacao_estimada ? Number(form.populacao_estimada) : undefined,
    };
    if (isEdit) {
      await base44.entities.ContactPanel.update(contact.id, payload);
    } else {
      await base44.entities.ContactPanel.create(payload);
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: "rgba(255,255,255,0.98)", border: "1px solid rgba(240,192,0,0.20)", boxShadow: "0 16px 48px rgba(0,0,0,0.18)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 className="font-semibold text-base" style={{ color: "#1A1A1A" }}>
            {isEdit ? "Editar Contato" : "Novo Contato"}
          </h2>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: "#999" }} /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Seção 1 */}
          <div>
            <SectionTitle>Dados de Localização & Demografia</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* POS - span 2 */}
              <div className="sm:col-span-2">
                <Field label="POS / ID Logístico">
                  <input value={form.pos_id_logistico} onChange={e => set("pos_id_logistico", e.target.value)}
                    placeholder="Ex: POS-001, LOG-SP-123" style={inputStyle} />
                </Field>
              </div>

              <Field label="Município" required error={errors.municipio}>
                <input value={form.municipio} onChange={e => set("municipio", e.target.value)}
                  placeholder="Nome da cidade" style={inputStyle} />
              </Field>

              <Field label="UF" required error={errors.uf}>
                <select value={form.uf} onChange={e => handleUF(e.target.value)} style={inputStyle}>
                  <option value="">Selecionar UF...</option>
                  {UF_LIST.map(u => <option key={u.uf} value={u.uf}>{u.label}</option>)}
                </select>
              </Field>

              <Field label="Região">
                <input value={form.regiao?.replace("_", "-") || ""} readOnly
                  placeholder="Preenchida automaticamente"
                  style={{ ...inputStyle, background: "rgba(0,0,0,0.02)", color: "#999", cursor: "not-allowed" }} />
              </Field>

              <Field label="População Estimada">
                <input type="number" min="0" value={form.populacao_estimada}
                  onChange={e => set("populacao_estimada", e.target.value)}
                  placeholder="Ex: 45000" style={inputStyle} />
              </Field>
            </div>
          </div>

          {/* Seção 2 */}
          <div>
            <SectionTitle sub="Informações do órgão e responsável">Dados do Contato</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Órgão / Secretaria">
                <input value={form.orgao_secretaria} onChange={e => set("orgao_secretaria", e.target.value)}
                  placeholder="Secretaria de Educação" style={inputStyle} />
              </Field>

              <Field label="Nome do Contato">
                <input value={form.nome_contato} onChange={e => set("nome_contato", e.target.value)}
                  placeholder="João Silva" style={inputStyle} />
              </Field>

              <Field label="Email" error={errors.email}>
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                  placeholder="contato@exemplo.com" style={inputStyle} />
              </Field>

              <Field label="Telefone">
                <input value={form.telefone} onChange={e => set("telefone", e.target.value)}
                  placeholder="(00) 00000-0000" style={inputStyle} />
              </Field>

              <Field label="Status" required error={errors.status}>
                <select value={form.status} onChange={e => set("status", e.target.value)} style={inputStyle}>
                  {STATUS_LIST.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </Field>

              {/* Observações - span 2 */}
              <div className="sm:col-span-2">
                <Field label="Observações">
                  <textarea rows={3} value={form.observacoes} onChange={e => set("observacoes", e.target.value)}
                    placeholder="Informações adicionais..."
                    style={{ ...inputStyle, resize: "vertical" }} />
                </Field>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "rgba(0,0,0,0.06)", color: "#555" }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)", color: "#1A1A1A", opacity: saving ? 0.7 : 1, boxShadow: "0 2px 8px rgba(240,192,0,0.30)" }}>
            <Save className="w-4 h-4" />
            {saving ? "Salvando..." : isEdit ? "Salvar Alterações" : "Cadastrar Contato"}
          </button>
        </div>
      </div>
    </div>
  );
}