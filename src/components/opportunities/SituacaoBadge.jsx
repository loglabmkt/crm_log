import React from "react";

export const SITUACAO_CONFIG = {
  em_andamento: { label: "Em Andamento", bg: "#EFF6FF", color: "#3B82F6" },
  congelada:    { label: "Congelada",    bg: "#F3F4F6", color: "#6B7280" },
  desistida:    { label: "Desistida",    bg: "#FEF3C7", color: "#D97706" },
  cancelada:    { label: "Cancelada",    bg: "#FEE2E2", color: "#EF4444" },
  substituida:  { label: "Substituída",  bg: "#F3E8FF", color: "#9333EA" },
  vendida:      { label: "Vendida",      bg: "#F0FDF4", color: "#22C55E" },
};

export const ETAPA_LABELS = {
  dimensionando:        "Dimensionando",
  elaborando_contrato:  "Elab. Contrato",
  elaborando_os:        "Elaborando OS",
  executando:           "Executando",
  obtendo_aprovacoes:   "Obtendo Aprovações",
  encerrado:            "Encerrado",
};

export default function SituacaoBadge({ situacao }) {
  const cfg = SITUACAO_CONFIG[situacao] || { label: situacao || "—", bg: "#F3F4F6", color: "#6B7280" };
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}