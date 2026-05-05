import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Target } from "lucide-react";

const STAGES = [
  { key: "em_andamento", label: "Em Andamento" },
  { key: "congelada", label: "Congelada" },
  { key: "desistida", label: "Desistida" },
  { key: "cancelada", label: "Cancelada" },
  { key: "substituida", label: "Substituída" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-sm" style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(240,192,0,0.25)", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", color: "#1A1A1A" }}>
      <p className="font-semibold">{label}</p>
      <p style={{ color: "#C49A00" }}>{payload[0].value} oportunidades</p>
    </div>
  );
};

export default function SalesFunnelChart({ periodRange }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const opps = await base44.entities.Opportunity.list();
      const inRange = (dateStr) => {
        if (!periodRange.start || !periodRange.end || !dateStr) return true;
        const d = new Date(dateStr);
        return d >= periodRange.start && d <= periodRange.end;
      };
      const counts = STAGES.map((s) => ({
        name: s.label,
        value: opps.filter(o => o.situacao === s.key && inRange(o.opened_at || o.created_date)).length,
      }));
      setChartData(counts);
      setLoading(false);
    }
    load();
  }, [periodRange]);

  const isEmpty = !loading && chartData.every(d => d.value === 0);

  return (
    <GlassCard className="flex flex-col min-h-[300px]">
      <h2 className="font-semibold mb-4" style={{ color: "#1A1A1A", fontSize: 18 }}>Funil de Oportunidades</h2>
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <Target className="w-10 h-10" style={{ color: "#F0C000", opacity: 0.5 }} />
          <p style={{ color: "#999999", fontSize: 14 }}>Nenhuma oportunidade cadastrada ainda</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#999", fontSize: 11 }} />
            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={90} tick={{ fill: "#555", fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(240,192,0,0.06)" }} />
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F0C000" />
                <stop offset="100%" stopColor="#C49A00" />
              </linearGradient>
            </defs>
            <Bar dataKey="value" radius={[0, 6, 6, 0]} background={{ fill: "rgba(240,192,0,0.06)", radius: 6 }}>
              {chartData.map((_, i) => (
                <Cell key={i} fill="url(#goldGrad)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </GlassCard>
  );
}