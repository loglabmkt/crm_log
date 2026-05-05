import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { Target, TrendingUp, CheckCircle2, DollarSign } from "lucide-react";

const SITUACOES = [
  { key: "em_andamento", label: "Em Andamento", color: "#3B82F6" },
  { key: "congelada", label: "Congelada", color: "#6B7280" },
  { key: "desistida", label: "Desistida", color: "#D97706" },
  { key: "cancelada", label: "Cancelada", color: "#EF4444" },
  { key: "substituida", label: "Substituída", color: "#9333EA" },
  { key: "vendida", label: "Vendida", color: "#22C55E" },
];

const ETAPAS = [
  { key: "dimensionando", label: "Dimensionando" },
  { key: "elaborando_contrato", label: "Elab. Contrato" },
  { key: "elaborando_os", label: "Elaborando OS" },
  { key: "executando", label: "Executando" },
  { key: "obtendo_aprovacoes", label: "Obtendo Aprovações" },
  { key: "encerrado", label: "Encerrado" },
];

const MONTHS_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const SIT_MAP = Object.fromEntries(SITUACOES.map(s => [s.key, s]));

function fmt(v) {
  if (!v && v !== 0) return "—";
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(2).replace(".", ",")}M`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`;
  return `R$ ${v.toFixed(0)}`;
}

function KpiCard({ label, icon: Icon, value, iconColor, loading }) {
  return (
    <GlassCard>
      <div className="flex items-start justify-between">
        <div>
          <p className="uppercase font-medium tracking-widest" style={{ color: "#999", fontSize: 10 }}>{label}</p>
          <p className="font-bold mt-2" style={{ color: "#1A1A1A", fontSize: 28 }}>
            {loading
              ? <span className="inline-block h-8 w-20 rounded-lg animate-pulse" style={{ background: "rgba(240,192,0,0.08)" }} />
              : value}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${iconColor}18` }}>
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
      </div>
    </GlassCard>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-sm space-y-1"
      style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(240,192,0,0.25)", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", color: "#1A1A1A" }}>
      <p className="font-semibold">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color || "#555" }}>
          {p.name}: {typeof p.value === "number" && p.value > 999 ? fmt(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function SalesReport({ periodRange }) {
  const [loading, setLoading] = useState(true);
  const [opps, setOpps] = useState([]);
  const [usersMap, setUsersMap] = useState({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [oppList, userList] = await Promise.all([
        base44.entities.Opportunity.list(),
        base44.entities.User.list(),
      ]);
      const um = {};
      userList.forEach(u => { um[u.id] = u.full_name; });
      setUsersMap(um);
      setOpps(oppList);
      setLoading(false);
    }
    load();
  }, []);

  const inRange = (dateStr) => {
    if (!periodRange?.start || !periodRange?.end || !dateStr) return true;
    const d = new Date(dateStr);
    return d >= periodRange.start && d <= periodRange.end;
  };

  const periodOpps = opps.filter(o => inRange(o.opened_at || o.created_date));
  const pipeline = periodOpps.filter(o => o.situacao === "em_andamento").reduce((s, o) => s + (o.estimated_value || 0), 0);
  const vendidas = periodOpps.filter(o => o.situacao === "vendida");
  const ticketMedio = vendidas.length > 0 ? vendidas.reduce((s, o) => s + (o.estimated_value || 0), 0) / vendidas.length : null;

  // Situação chart
  const situacaoData = SITUACOES.map(s => ({
    name: s.label,
    count: periodOpps.filter(o => o.situacao === s.key).length,
    valor: periodOpps.filter(o => o.situacao === s.key).reduce((sum, o) => sum + (o.estimated_value || 0), 0),
    color: s.color,
  })).filter(d => d.count > 0);

  // Etapa chart — apenas em_andamento
  const etapaData = ETAPAS.map(e => ({
    name: e.label,
    count: periodOpps.filter(o => o.situacao === "em_andamento" && o.etapa === e.key).length,
  })).filter(d => d.count > 0);

  // Monthly evolution — last 12 months
  const now = new Date();
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const yr = d.getFullYear();
    const mo = d.getMonth();
    const criadas = opps.filter(o => {
      const cd = new Date(o.opened_at || o.created_date);
      return cd.getFullYear() === yr && cd.getMonth() === mo;
    }).length;
    const vendaNo = opps.filter(o => {
      if (o.situacao !== "vendida" || !o.closed_at) return false;
      const cd = new Date(o.closed_at);
      return cd.getFullYear() === yr && cd.getMonth() === mo;
    }).length;
    return { name: MONTHS_PT[mo], criadas, vendidas: vendaNo };
  });

  // Top 10 by value
  const top10 = [...periodOpps]
    .sort((a, b) => (b.estimated_value || 0) - (a.estimated_value || 0))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total no Período" icon={Target} value={periodOpps.length} iconColor="#F0C000" loading={loading} />
        <KpiCard label="Pipeline (Em Andamento)" icon={TrendingUp} value={fmt(pipeline)} iconColor="#3B82F6" loading={loading} />
        <KpiCard label="Vendidas" icon={CheckCircle2} value={vendidas.length} iconColor="#22C55E" loading={loading} />
        <KpiCard label="Ticket Médio (Vendidas)" icon={DollarSign} value={ticketMedio !== null ? fmt(ticketMedio) : "—"} iconColor="#C49A00" loading={loading} />
      </div>

      {/* Distribuição por Situação */}
      <GlassCard>
        <h2 className="font-semibold mb-4" style={{ color: "#1A1A1A", fontSize: 17 }}>Distribuição por Situação</h2>
        {situacaoData.length === 0 ? (
          <p className="text-center py-10" style={{ color: "#999", fontSize: 14 }}>Nenhuma oportunidade no período</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={situacaoData} layout="vertical" margin={{ left: 8, right: 60 }}>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#999", fontSize: 11 }} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={110} tick={{ fill: "#555", fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(240,192,0,0.04)" }} />
              <Bar dataKey="count" name="Qtd." radius={[0, 6, 6, 0]} background={{ fill: "rgba(0,0,0,0.03)", radius: 6 }}>
                {situacaoData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </GlassCard>

      {/* Distribuição por Etapa */}
      <GlassCard>
        <h2 className="font-semibold mb-1" style={{ color: "#1A1A1A", fontSize: 17 }}>Distribuição por Etapa</h2>
        <p className="text-xs mb-4" style={{ color: "#999" }}>Apenas oportunidades Em Andamento</p>
        {etapaData.length === 0 ? (
          <p className="text-center py-10" style={{ color: "#999", fontSize: 14 }}>Nenhuma oportunidade em andamento</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={etapaData} layout="vertical" margin={{ left: 8, right: 40 }}>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#999", fontSize: 11 }} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={130} tick={{ fill: "#555", fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(240,192,0,0.04)" }} />
              <Bar dataKey="count" name="Qtd." fill="#F0C000" radius={[0, 6, 6, 0]} background={{ fill: "rgba(240,192,0,0.05)", radius: 6 }} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </GlassCard>

      {/* Evolução Mensal */}
      <GlassCard>
        <h2 className="font-semibold mb-4" style={{ color: "#1A1A1A", fontSize: 17 }}>Evolução Mensal (12 meses)</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={monthlyData} margin={{ left: 0, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#999", fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#999", fontSize: 11 }} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="criadas" name="Criadas" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="vendidas" name="Vendidas" stroke="#22C55E" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Top 10 */}
      <GlassCard>
        <h2 className="font-semibold mb-4" style={{ color: "#1A1A1A", fontSize: 17 }}>Top Oportunidades por Valor</h2>
        {top10.length === 0 ? (
          <p className="text-center py-10" style={{ color: "#999", fontSize: 14 }}>Nenhuma oportunidade no período</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                  {["Nr", "Oportunidade", "Cliente", "Situação", "Etapa", "Responsável", "Valor"].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#999" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {top10.map((opp, i) => {
                  const sit = SIT_MAP[opp.situacao];
                  return (
                    <tr key={opp.id}
                      style={{ background: i % 2 === 0 ? "rgba(0,0,0,0.02)" : "transparent" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(240,192,0,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "rgba(0,0,0,0.02)" : "transparent"}>
                      <td className="py-2.5 px-3 font-mono text-xs" style={{ color: "#999" }}>{String(opp.nr || 0).padStart(4, "0")}</td>
                      <td className="py-2.5 px-3 font-medium max-w-[180px]" style={{ color: "#1A1A1A" }}>
                        <div className="truncate">{opp.title}</div>
                      </td>
                      <td className="py-2.5 px-3" style={{ color: "#555" }}>{opp.client_name || "—"}</td>
                      <td className="py-2.5 px-3">
                        {sit && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ background: `${sit.color}18`, color: sit.color }}>
                            {sit.label}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-xs" style={{ color: "#555" }}>
                        {ETAPAS.find(e => e.key === opp.etapa)?.label || opp.etapa || "—"}
                      </td>
                      <td className="py-2.5 px-3" style={{ color: "#555" }}>{usersMap[opp.owner_id] || "—"}</td>
                      <td className="py-2.5 px-3 font-semibold" style={{ color: "#C49A00" }}>{fmt(opp.estimated_value)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}