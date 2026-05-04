import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Headphones } from "lucide-react";

const statusColumns = [
  { key: "aberto", label: "Aberto", color: "#EF4444" },
  { key: "em_andamento", label: "Em Andamento", color: "#F0C000" },
  { key: "aguardando_cliente", label: "Aguardando Cliente", color: "#F59E0B" },
  { key: "resolvido", label: "Resolvido", color: "#22C55E" },
];

export default function Support() {
  return (
    <div className="space-y-6">
      {/* Status summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statusColumns.map((col) => (
          <GlassCard key={col.key}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.color }} />
              <span className="font-medium" style={{ color: "#999999", fontSize: 11 }}>
                {col.label}
              </span>
            </div>
            <p className="font-bold" style={{ color: "#1A1A1A", fontSize: 28 }}>0</p>
          </GlassCard>
        ))}
      </div>

      {/* Tickets list placeholder */}
      <GlassCard className="min-h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: "#1A1A1A", fontSize: 18 }}>Tickets</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <Headphones className="w-10 h-10" style={{ color: "#CCCCCC" }} />
          <p style={{ color: "#555555", fontSize: 14 }}>Nenhum ticket registrado</p>
          <p style={{ color: "#999999", fontSize: 14 }}>Tickets de suporte aparecerão aqui</p>
        </div>
      </GlassCard>
    </div>
  );
}