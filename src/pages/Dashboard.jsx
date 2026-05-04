import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import { TrendingUp, Users, Target, Headphones } from "lucide-react";

const statCards = [
  { label: "Oportunidades Ativas", icon: Target, value: "—" },
  { label: "Valor no Pipeline", icon: TrendingUp, value: "—" },
  { label: "Organizações", icon: Users, value: "—" },
  { label: "Tickets Abertos", icon: Headphones, value: "—" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <GlassCard key={stat.label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="uppercase tracking-widest font-medium" style={{ color: "#999999", fontSize: 11 }}>
                  {stat.label}
                </p>
                <p className="font-bold mt-2" style={{ color: "#1A1A1A", fontSize: 28 }}>
                  {stat.value}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(240, 192, 0, 0.12)" }}>
                <stat.icon className="w-5 h-5" style={{ color: "#F0C000" }} />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="min-h-[300px] flex flex-col">
          <h2 className="font-semibold mb-4" style={{ color: "#1A1A1A", fontSize: 18 }}>Funil de Vendas</h2>
          <div className="flex-1 flex items-center justify-center" style={{ color: "#999999", fontSize: 14 }}>
            Gráfico disponível na próxima fase
          </div>
        </GlassCard>
        <GlassCard className="min-h-[300px] flex flex-col">
          <h2 className="font-semibold mb-4" style={{ color: "#1A1A1A", fontSize: 18 }}>Receita Mensal</h2>
          <div className="flex-1 flex items-center justify-center" style={{ color: "#999999", fontSize: 14 }}>
            Gráfico disponível na próxima fase
          </div>
        </GlassCard>
      </div>

      {/* Activity & follow-ups row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2 min-h-[250px] flex flex-col">
          <h2 className="font-semibold mb-4" style={{ color: "#1A1A1A", fontSize: 18 }}>Atividades Recentes</h2>
          <div className="flex-1 flex items-center justify-center" style={{ color: "#999999", fontSize: 14 }}>
            Sem atividades registradas
          </div>
        </GlassCard>
        <GlassCard className="min-h-[250px] flex flex-col">
          <h2 className="font-semibold mb-4" style={{ color: "#1A1A1A", fontSize: 18 }}>Próximos Follow-ups</h2>
          <div className="flex-1 flex items-center justify-center" style={{ color: "#999999", fontSize: 14 }}>
            Nenhum follow-up agendado
          </div>
        </GlassCard>
      </div>
    </div>
  );
}