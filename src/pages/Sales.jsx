import React from "react";
import GlassCard from "@/components/ui/GlassCard";

const stages = [
  { key: "prospeccao", label: "Prospecção", color: "#999999" },
  { key: "qualificacao", label: "Qualificação", color: "#3B82F6" },
  { key: "proposta", label: "Proposta", color: "#F0C000" },
  { key: "negociacao", label: "Negociação", color: "#F59E0B" },
  { key: "licitacao", label: "Licitação", color: "#8B5CF6" },
  { key: "fechado_ganho", label: "Fechado Ganho", color: "#22C55E" },
  { key: "fechado_perdido", label: "Fechado Perdido", color: "#EF4444" },
];

export default function Sales() {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {stages.map((stage) => (
            <div key={stage.key} className="w-64 flex-shrink-0">
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: stage.color }} />
                <h3 className="text-sm font-semibold truncate" style={{ color: "#1A1A1A" }}>
                  {stage.label}
                </h3>
                <span className="text-xs ml-auto font-medium" style={{ color: "#999999" }}>0</span>
              </div>
              {/* Column body */}
              <GlassCard className="min-h-[420px] flex items-center justify-center" hover={false}>
                <p className="text-xs" style={{ color: "#999999" }}>
                  Nenhuma oportunidade
                </p>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}