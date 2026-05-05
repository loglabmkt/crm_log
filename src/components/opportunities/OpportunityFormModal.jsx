import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Save } from "lucide-react";
import ChanceSquares from "./ChanceSquares";

const SITUACOES = [
  { key: "em_andamento", label: "Em Andamento" },
  { key: "congelada", label: "Congelada" },
  { key: "desistida", label: "Desistida" },
  { key: "cancelada", label: "Cancelada" },
  { key: "substituida", label: "Substituída" },
  { key: "vendida", label: "Vendida" },
];

const ETAPAS = [
  { key: "dimensionando", label: "Dimensionando" },
  { key: "elaborando_contrato", label: "Elaborando Contrato" },
  { key: "elaborando_os", label: "Elaborando OS" },
  { key: "executando", label: "Executando" },
  { key: "obtendo_aprovacoes", label: "Obtendo Aprovações" },
  { key: "encerrado", label: "Encerrado" },
];

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

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>{label}</label>
    {children}
    {error && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{error}</p>}
  </div>
);

export default function OpportunityFormModal({ opportunity, onClose, onSaved }) {
  const isEdit = !!opportunity?.id;
  const [form, setForm] = useState({
    nr: "", client_name: "", estimated_value: "",
    title: "", situacao: "em_andamento", etapa: "dimensionando",
    funil: "", chance: null, owner_id: "", parceiro: "",
    tipo_negocio: "", ata_anotacoes: "", nr_contrato_os: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadingNr, setLoadingNr] = useState(!isEdit);

  // Load next nr on create
  useEffect(() => {
    if (isEdit) {
      setForm({
        nr: opportunity.nr || "",
        client_name: opportunity.client_name || "",
        estimated_value: opportunity.estimated_value ?? "",
        title: opportunity.title || "",
        situacao: opportunity.situacao || "em_andamento",
        etapa: opportunity.etapa || "dimensionando",
        funil: opportunity.funil || "",
        chance: opportunity.chance || null,
        owner_id: opportunity.owner_id || "",
        parceiro: opportunity.parceiro || "",
        tipo_negocio: opportunity.tipo_negocio || "",
        ata_anotacoes: opportunity.ata_anotacoes || "",
        nr_contrato_os: opportunity.nr_contrato_os || "",
      });
    } else {
      setLoadingNr(true);
      base44.entities.Opportunity.list("-nr", 1).then(list => {
        const maxNr = list.reduce((max, o) => Math.max(max, o.nr || 0), 0);
        setForm(f => ({ ...f, nr: maxNr + 1 }));
        setLoadingNr(false);
      }).catch(() => { setLoadingNr(false); });
    }
  }, [isEdit]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.nr && form.nr !== 0) e.nr = "Obrigatório";
    if (!form.client_name?.trim()) e.client_name = "Obrigatório";
    if (form.estimated_value === "" || form.estimated_value === null) e.estimated_value = "Obrigatório";
    if (Number(form.estimated_value) < 0) e.estimated_value = "Deve ser >= 0";
    if (!form.title?.trim()) e.title = "Obrigatório";
    if (!form.situacao) e.situacao = "Obrigatório";
    if (!form.etapa) e.etapa = "Obrigatório";
    if (!form.chance) e.chance = "Obrigatório";
    if (!form.owner_id?.trim()) e.owner_id = "Obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    // Check nr uniqueness
    if (!isEdit || Number(form.nr) !== opportunity.nr) {
      const existing = await base44.entities.Opportunity.list();
      const dup = existing.find(o => o.nr === Number(form.nr) && o.id !== opportunity?.id);
      if (dup) {
        setErrors(e => ({ ...e, nr: `Número ${form.nr} já existe` }));
        setSaving(false);
        return;
      }
    }

    const payload = {
      ...form,
      nr: Number(form.nr),
      estimated_value: Number(form.estimated_value),
      chance: Number(form.chance),
    };

    if (isEdit) {
      await base44.entities.Opportunity.update(opportunity.id, payload);
    } else {
      await base44.entities.Opportunity.create(payload);
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }}>
      <div
        className="w-full max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{
          maxWidth: 720,
          background: "rgba(255,255,255,0.97)",
          border: "1px solid rgba(240,192,0,0.20)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.16)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>
            {isEdit ? `Editar Oportunidade #${String(opportunity.nr || "").padStart(4, "0")}` : "Nova Oportunidade"}
          </h2>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: "#999" }} /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Seção 1 — Identificação */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#999" }}>Identificação</p>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Nr *" error={errors.nr}>
                <input
                  type="number" value={form.nr}
                  onChange={e => set("nr", e.target.value)}
                  placeholder={loadingNr ? "Carregando..." : "0001"}
                  disabled={loadingNr}
                  style={{ ...inputStyle, width: "100%" }}
                />
              </Field>
              <div className="col-span-1">
                <Field label="Cliente *" error={errors.client_name}>
                  <input value={form.client_name} onChange={e => set("client_name", e.target.value)}
                    placeholder="Nome do cliente" style={inputStyle} />
                </Field>
              </div>
              <Field label="Valor (R$) *" error={errors.estimated_value}>
                <input type="number" min="0" step="0.01" value={form.estimated_value}
                  onChange={e => set("estimated_value", e.target.value)}
                  placeholder="0.00" style={inputStyle} />
              </Field>
            </div>
          </div>

          {/* Seção 2 — Descrição */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#999" }}>Descrição</p>
            <Field label="Oportunidade *" error={errors.title}>
              <input value={form.title} onChange={e => set("title", e.target.value)}
                placeholder="Descrição breve da oportunidade" style={inputStyle} />
            </Field>
          </div>

          {/* Seção 3 — Classificação */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#999" }}>Classificação</p>
            <div className="grid grid-cols-4 gap-4">
              <Field label="Situação *" error={errors.situacao}>
                <select value={form.situacao} onChange={e => set("situacao", e.target.value)} style={inputStyle}>
                  {SITUACOES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </Field>
              <Field label="Etapa *" error={errors.etapa}>
                <select value={form.etapa} onChange={e => set("etapa", e.target.value)} style={inputStyle}>
                  {ETAPAS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </Field>
              <Field label="Funil">
                <input value={form.funil} onChange={e => set("funil", e.target.value)}
                  placeholder="Ex: Prospecção" style={inputStyle} />
              </Field>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Chance *</label>
                <div className="flex items-center h-[38px]">
                  <ChanceSquares value={form.chance || 0} size={18} gap={4} interactive onChange={v => set("chance", v)} />
                </div>
                {errors.chance && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.chance}</p>}
              </div>
            </div>
          </div>

          {/* Seção 4 — Responsabilidade */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#999" }}>Responsabilidade</p>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Responsável *" error={errors.owner_id}>
                <input value={form.owner_id} onChange={e => set("owner_id", e.target.value)}
                  placeholder="Nome do responsável" style={inputStyle} />
              </Field>
              <Field label="Parceiro">
                <input value={form.parceiro} onChange={e => set("parceiro", e.target.value)}
                  placeholder="Nome do parceiro" style={inputStyle} />
              </Field>
              <Field label="Tipo de Negócio">
                <input value={form.tipo_negocio} onChange={e => set("tipo_negocio", e.target.value)}
                  placeholder="Ex: Adesão, Contrato" style={inputStyle} />
              </Field>
            </div>
          </div>

          {/* Seção 5 — Registros */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#999" }}>Ata / Anotações</p>
            <textarea rows={4} value={form.ata_anotacoes} onChange={e => set("ata_anotacoes", e.target.value)}
              placeholder="Registros estruturais, atas de reunião..."
              style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          {/* Seção 6 — Contrato */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#999" }}>Contrato</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nº Contrato/OS">
                <input value={form.nr_contrato_os} onChange={e => set("nr_contrato_os", e.target.value)}
                  placeholder="Número do contrato ou OS" style={inputStyle} />
              </Field>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "rgba(0,0,0,0.06)", color: "#555" }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)", color: "#1A1A1A", opacity: saving ? 0.7 : 1 }}>
            <Save className="w-4 h-4" />
            {saving ? "Salvando..." : isEdit ? "Salvar Alterações" : "Criar Oportunidade"}
          </button>
        </div>
      </div>
    </div>
  );
}