import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp } from "lucide-react";

const MONTHS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function fmtY(v) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="px-3 py-2 rounded-xl text-sm" style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(240,192,0,0.25)", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", color: "#1A1A1A" }}>
      <p className="font-semibold">{label}</p>
      <p style={{ color: "#C49A00" }}>{v >= 1000 ? `R$ ${fmtY(v)}` : `R$ ${v}`}</p>
    </div>
  );
};

export default function MonthlyRevenueChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const opps = await base44.entities.Opportunity.list();
      const won = opps.filter(o => o.stage === "fechado_ganho" && o.closed_at);
      const now = new Date();
      const months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
        return { year: d.getFullYear(), month: d.getMonth(), label: MONTHS_PT[d.getMonth()], value: 0 };
      });
      won.forEach((o) => {
        const d = new Date(o.closed_at);
        const idx = months.findIndex(m => m.year === d.getFullYear() && m.month === d.getMonth());
        if (idx !== -1) months[idx].value += o.estimated_value || 0;
      });
      setChartData(months);
      setLoading(false);
    }
    load();
  }, []);

  const isEmpty = !loading && chartData.every(d => d.value === 0);

  return (
    <GlassCard className="flex flex-col min-h-[300px]">
      <h2 className="font-semibold mb-4" style={{ color: "#1A1A1A", fontSize: 18 }}>Receita Mensal</h2>
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <TrendingUp className="w-10 h-10" style={{ color: "#F0C000", opacity: 0.5 }} />
          <p style={{ color: "#999999", fontSize: 14 }}>Nenhuma venda fechada no período</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ left: 0, right: 8 }}>
            <defs>
              <linearGradient id="areaGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F0C000" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#F0C000" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#999", fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tickFormatter={fmtY} tick={{ fill: "#999", fontSize: 11 }} width={40} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(240,192,0,0.20)", strokeWidth: 1 }} />
            <Area type="monotone" dataKey="value" stroke="#F0C000" strokeWidth={2.5} fill="url(#areaGold)" dot={{ fill: "#F0C000", r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: "#C49A00" }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </GlassCard>
  );
}