import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid, Legend } from "recharts";
import { Target, TrendingUp, Percent, Clock } from "lucide-react";
import { differenceInDays } from "date-fns";

const STAGES = [
  { key: "prospeccao", label: "Prospecção" },
  { key: "qualificacao", label: "Qualificação" },
  { key: "proposta", label: "Proposta" },
  { key: "negociacao", label: "Negociação" },
  { key: "licitacao", label: "Licitação" },
  { key: "fechado_ganho", label: "Ganho" },
  { key: "fechado_perdido", label: "Perdido" },
];
const MONTHS_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function fmt(v) {
  if (v >= 1_000_000) return `R$ ${(v/1_000_000).toFixed(2).replace(".",",")}M`;
  if (v >= 1_000) return `R$ ${(v/1_000).toFixed(0)}K`;
  return `R$ ${v?.toFixed(0) || 0}`;
}

function KpiCard({ label, icon: Icon, value, loading }) {
  return (
    <GlassCard>
      <div className="flex items-start justify-between">
        <div>
          <p className="uppercase font-medium tracking-widest" style={{ color: "#999", fontSize: 10 }}>{label}</p>
          <p className="font-bold mt-2" style={{ color: "#1A1A1A", fontSize: 28 }}>
            {loading ? <span className="inline-block h-8 w-20 rounded-lg animate-pulse" style={{ background: "rgba(240,192,0,0.08)" }} /> : value}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(240,192,0,0.12)" }}>
          <Icon className="w-5 h-5" style={{ color: "#F0C000" }} />
        </div>
      </div>
    </GlassCard>
  );
}

const OrgTypeLabels = { prefeitura:"Prefeitura", secretaria:"Secretaria", autarquia:"Autarquia", fundacao:"Fundação", empresa_publica:"Emp. Pública", outros:"Outros" };
const StageColors = { prospeccao:"#6B7280", qualificacao:"#3B82F6", proposta:"#8B5CF6", negociacao:"#F59E0B", licitacao:"#F0C000", fechado_ganho:"#22C55E", fechado_perdido:"#EF4444" };

const CustomFunnelTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-sm" style={{ background:"rgba(255,255,255,0.97)", border:"1px solid rgba(240,192,0,0.25)", boxShadow:"0 4px 16px rgba(0,0,0,0.10)", color:"#1A1A1A" }}>
      <p className="font-semibold">{label}</p>
      <p style={{ color:"#C49A00" }}>{payload[0].value} opps · {fmt(payload[1]?.value || 0)}</p>
    </div>
  );
};

const CustomMonthTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-sm space-y-1" style={{ background:"rgba(255,255,255,0.97)", border:"1px solid rgba(240,192,0,0.25)", boxShadow:"0 4px 16px rgba(0,0,0,0.10)", color:"#1A1A1A" }}>
      <p className="font-semibold">{label}</p>
      {payload.map(p => <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.dataKey === "value" ? fmt(p.value) : p.value}</p>)}
    </div>
  );
};

export default function SalesReport({ periodRange }) {
  const [loading, setLoading] = useState(true);
  const [opps, setOpps] = useState([]);
  const [orgsMap, setOrgsMap] = useState({});
  const [usersMap, setUsersMap] = useState({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [oppList, orgList, userList] = await Promise.all([
        base44.entities.Opportunity.list(),
        base44.entities.Organization.list(),
        base44.entities.User.list(),
      ]);
      const om = {}; orgList.forEach(o => { om[o.id] = o; });
      const um = {}; userList.forEach(u => { um[u.id] = u; });
      setOrgsMap(om);
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

  const periodOpps = opps.filter(o => inRange(o.opened_at));
  const wonOpps = periodOpps.filter(o => o.stage === "fechado_ganho");
  const totalVal = periodOpps.reduce((s, o) => s + (o.estimated_value || 0), 0);
  const convRate = periodOpps.length > 0 ? Math.round((wonOpps.length / periodOpps.length) * 100) : null;
  const cycleTimes = wonOpps.filter(o => o.opened_at && o.closed_at).map(o => differenceInDays(new Date(o.closed_at), new Date(o.opened_at)));
  const avgCycle = cycleTimes.length > 0 ? Math.round(cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length) : null;

  // Funnel data
  const funnelData = STAGES.map(s => ({
    name: s.label,
    count: periodOpps.filter(o => o.stage === s.key).length,
    value: periodOpps.filter(o => o.stage === s.key).reduce((sum, o) => sum + (o.estimated_value || 0), 0),
    color: StageColors[s.key],
  }));

  // Monthly
  const now = new Date();
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const monthOpps = opps.filter(o => {
      if (o.stage !== "fechado_ganho" || !o.closed_at) return false;
      const cd = new Date(o.closed_at);
      return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth();
    });
    return { name: MONTHS_PT[d.getMonth()], count: monthOpps.length, value: monthOpps.reduce((s, o) => s + (o.estimated_value || 0), 0) };
  });

  // Top orgs
  const orgGroups = {};
  periodOpps.forEach(o => {
    if (!o.organization_id) return;
    if (!orgGroups[o.organization_id]) orgGroups[o.organization_id] = { opps: [], totalVal: 0 };
    orgGroups[o.organization_id].opps.push(o);
    orgGroups[o.organization_id].totalVal += o.estimated_value || 0;
  });
  const topOrgs = Object.entries(orgGroups)
    .sort((a, b) => b[1].totalVal - a[1].totalVal)
    .slice(0, 10)
    .map(([orgId, data]) => ({ org: orgsMap[orgId], opps: data.opps, totalVal: data.totalVal }))
    .filter(r => r.org);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Oportunidades" icon={Target} value={periodOpps.length} loading={loading} />
        <KpiCard label="Valor Total" icon={TrendingUp} value={fmt(totalVal)} loading={loading} />
        <KpiCard label="Taxa de conversão" icon={Percent} value={convRate !== null ? `${convRate}%` : "—"} loading={loading} />
        <KpiCard label="Ciclo médio" icon={Clock} value={avgCycle !== null ? `${avgCycle} dias` : "—"} loading={loading} />
      </div>

      {/* Funnel */}
      <GlassCard>
        <h2 className="font-semibold mb-4" style={{ color:"#1A1A1A", fontSize:17 }}>Funil por Estágio</h2>
        {funnelData.every(d => d.count === 0) ? (
          <p className="text-center py-10" style={{ color:"#999", fontSize:14 }}>Nenhuma oportunidade no período</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={funnelData} layout="vertical" margin={{ left:8, right:16 }}>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill:"#999", fontSize:11 }} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={80} tick={{ fill:"#555", fontSize:12 }} />
              <Tooltip content={<CustomFunnelTooltip />} cursor={{ fill:"rgba(240,192,0,0.04)" }} />
              <Bar dataKey="count" radius={[0,6,6,0]} background={{ fill:"rgba(240,192,0,0.04)", radius:6 }}>
                {funnelData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
              <Bar dataKey="value" radius={[0,6,6,0]} fill="rgba(240,192,0,0.20)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </GlassCard>

      {/* Monthly */}
      <GlassCard>
        <h2 className="font-semibold mb-4" style={{ color:"#1A1A1A", fontSize:17 }}>Novos Negócios por Mês</h2>
        {monthlyData.every(d => d.count === 0) ? (
          <p className="text-center py-10" style={{ color:"#999", fontSize:14 }}>Nenhuma venda fechada nos últimos 12 meses</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} margin={{ left:0, right:8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill:"#999", fontSize:11 }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill:"#999", fontSize:11 }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} tick={{ fill:"#999", fontSize:11 }} />
              <Tooltip content={<CustomMonthTooltip />} cursor={{ fill:"rgba(240,192,0,0.04)" }} />
              <Legend />
              <Bar yAxisId="left" dataKey="count" name="Fechamentos" fill="#F0C000" radius={[4,4,0,0]} />
              <Bar yAxisId="right" dataKey="value" name="Valor" fill="rgba(196,154,0,0.40)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </GlassCard>

      {/* Top orgs table */}
      <GlassCard>
        <h2 className="font-semibold mb-4" style={{ color:"#1A1A1A", fontSize:17 }}>Principais Contas no Período</h2>
        {topOrgs.length === 0 ? (
          <p className="text-center py-10" style={{ color:"#999", fontSize:14 }}>Nenhuma oportunidade no período selecionado</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(0,0,0,0.08)" }}>
                  {["#","Organização","Tipo","Cidade/UF","Opps","Valor Total","Stage atual"].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wider" style={{ color:"#999" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topOrgs.map((row, i) => {
                  const latestStage = row.opps.sort((a,b) => new Date(b.updated_date) - new Date(a.updated_date))[0]?.stage;
                  return (
                    <tr key={row.org.id}
                      style={{ background: i % 2 === 0 ? "rgba(0,0,0,0.02)" : "transparent", transition:"background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(240,192,0,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "rgba(0,0,0,0.02)" : "transparent"}>
                      <td className="py-2.5 px-3" style={{ color:"#999" }}>{i+1}</td>
                      <td className="py-2.5 px-3 font-medium" style={{ color:"#1A1A1A" }}>{row.org.name}</td>
                      <td className="py-2.5 px-3" style={{ color:"#555" }}>{OrgTypeLabels[row.org.type] || row.org.type}</td>
                      <td className="py-2.5 px-3" style={{ color:"#555" }}>{row.org.city}{row.org.state ? `/${row.org.state}` : ""}</td>
                      <td className="py-2.5 px-3" style={{ color:"#555" }}>{row.opps.length}</td>
                      <td className="py-2.5 px-3 font-semibold" style={{ color:"#C49A00" }}>{fmt(row.totalVal)}</td>
                      <td className="py-2.5 px-3">
                        {latestStage && <span className="px-2 py-0.5 rounded-full text-xs" style={{ background:`${StageColors[latestStage]}18`, color:StageColors[latestStage] }}>{STAGES.find(s=>s.key===latestStage)?.label}</span>}
                      </td>
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