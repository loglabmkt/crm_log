import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Headphones } from "lucide-react";

const statusColumns = [
  { key: "aberto", label: "Aberto", color: "#EF5350" },
  { key: "em_andamento", label: "Em Andamento", color: "#F0C000" },
  { key: "aguardando_cliente", label: "Aguardando Cliente", color: "#FF8A65" },
  { key: "resolvido", label: "Resolvido", color: "#4CAF50" },
];

export default function Support() {
  return (
    <div className="space-y-6">
      {/* Stats summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statusColumns.map((col) => (
          <GlassCard key={col.key}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
              <span className="text-xs font-medium text-muted-foreground">{col.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">0</p>
          </GlassCard>
        ))}
      </div>

      {/* Tickets list */}
      <GlassCard className="min-h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Tickets</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <Headphones className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum ticket registrado</p>
          <p className="text-xs text-muted-foreground mt-1">Tickets de suporte aparecerão aqui</p>
        </div>
      </GlassCard>
    </div>
  );
}