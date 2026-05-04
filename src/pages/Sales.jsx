import React from "react";
import GlassCard from "@/components/ui/GlassCard";

const stages = [
  { key: "prospeccao", label: "Prospecção", color: "#888888" },
  { key: "qualificacao", label: "Qualificação", color: "#6B8AFF" },
  { key: "proposta", label: "Proposta", color: "#F0C000" },
  { key: "negociacao", label: "Negociação", color: "#FF8A65" },
  { key: "licitacao", label: "Licitação", color: "#AB47BC" },
  { key: "fechado_ganho", label: "Fechado Ganho", color: "#4CAF50" },
  { key: "fechado_perdido", label: "Fechado Perdido", color: "#EF5350" },
];

export default function Sales() {
  return (
    <div className="space-y-6">
      {/* Pipeline kanban */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {stages.map((stage) => (
            <div key={stage.key} className="w-64 flex-shrink-0">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: stage.color }} />
                <h3 className="text-sm font-semibold text-foreground">{stage.label}</h3>
                <span className="text-xs text-muted-foreground ml-auto">0</span>
              </div>
              <GlassCard className="min-h-[400px] flex items-center justify-center">
                <p className="text-xs text-muted-foreground text-center">
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