import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts";
import { Ticket, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { differenceInHours, differenceInDays, format, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

const TYPE_COLORS = { suporte_tecnico:"#3B82F6", duvida_funcional:"#F0C000", melhoria:"#8B5CF6", incidente:"#EF4444" };
const TYPE_LABELS = { suporte_tecnico:"Suporte Técnico", duvida_funcional:"Dúvida Funcional", melhoria:"Melhoria", incidente:"Incidente" };

function resolvedStr(hrs) {
  if (hrs < 1) return "<1h";
  if (hrs < 24) return `${Math.round(hrs)}h`;
  const d = Math.floor(hrs / 24); const h = Math.round(hrs % 24);
  return h > 0 ? `${d}d ${h}h` : `${d}d`;
}

function KpiCard({ label, icon: Icon, value, loading, iconColor }) {
  return (
    <GlassCard>
      <div className="flex items-start justify-between">
        <div>
          <p className="uppercase font-medium tracking-widest" style={{ color:"#999", fontSize:10 }}>{label}</p>
          <p className="font-bold mt-2" style={{ color:"#1A1A1A", fontSize:28 }}>
            {loading ? <span className="inline-block h-8 w-20 rounded-lg animate-pulse" style={{ background:"rgba(240,192,0,0.08)" }} /> : value}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:`${iconColor||"#F0C000"}18` }}>
          <Icon className="w-5 h-5" style={{ color:iconColor||"#F0C000" }} />
        </div>
      </div>
    </GlassCard>
  );
}

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-sm" style={{ background:"rgba(255,255,255,0.97)", border:"1px solid rgba(240,192,0,0.25)", boxShadow:"0 4px 16px rgba(0,0,0,0.10)", color:"#1A1A1A" }}>
      <p className="font-semibold">{payload[0].name}</p>
      <p style={{ color:payload[0].payload.fill }}>{payload[0].value} tickets ({payload[0].payload.pct}%)</p>
    </div>
  );
};

const CustomLineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-sm space-y-1" style={{ background:"rgba(255,255,255,0.97)", border:"1px solid rgba(240,192,0,0.25)", boxShadow:"0 4px 16px rgba(0,0,0,0.10)", color:"#1A1A1A" }}>
      <p className="font-semibold">{label}</p>
      {payload.map(p => <p key={p.dataKey} style={{ color:p.color }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function SupportReport({ periodRange }) {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [orgsMap, setOrgsMap] = useState({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [tList, oList] = await Promise.all([
        base44.entities.Ticket.list(),
        base44.entities.Organization.list(),
      ]);
      const om = {}; oList.forEach(o => { om[o.id] = o; });
      setOrgsMap(om);
      setTickets(tList);
      setLoading(false);
    }
    load();
  }, []);

  const inRange = (dateStr) => {
    if (!periodRange?.start || !periodRange?.end || !dateStr) return true;
    const d = new Date(dateStr);
    return d >= periodRange.start && d <= periodRange.end;
  };

  const openedInPeriod = tickets.filter(t => t.status !== "arquivado" && inRange(t.created_date));
  const resolvedInPeriod = tickets.filter(t => t.status === "resolvido" && inRange(t.resolved_at));
  const cycleTimes = resolvedInPeriod.filter(t => t.created_date && t.resolved_at).map(t => differenceInHours(new Date(t.resolved_at), new Date(t.created_date)));
  const avgResolution = cycleTimes.length > 0 ? cycleTimes.reduce((a,b) => a+b, 0) / cycleTimes.length : null;

  // Pie by type
  const typeCount = {};
  openedInPeriod.forEach(t => { typeCount[t.type] = (typeCount[t.type] || 0) + 1; });
  const total = openedInPeriod.length;
  const pieData = Object.entries(typeCount).map(([key, count]) => ({
    name: TYPE_LABELS[key] || key,
    value: count,
    fill: TYPE_COLORS[key] || "#999",
    pct: total > 0 ? Math.round((count/total)*100) : 0,
  }));

  // Over time chart
  const useDays = !periodRange?.start || differenceInDays(periodRange?.end || new Date(), periodRange?.start || new Date()) <= 30;
  const timeGroups = {};
  [...openedInPeriod, ...resolvedInPeriod].forEach(t => {
    const ref = t.resolved_at && resolvedInPeriod.includes(t) ? t.resolved_at : t.created_date;
    if (!ref) return;
    let key;
    if (useDays) {
      key = format(new Date(ref), "dd/MM", { locale: ptBR });
    } else {
      key = format(startOfWeek(new Date(ref)), "dd/MM", { locale: ptBR });
    }
    if (!timeGroups[key]) timeGroups[key] = { name: key, abertos: 0, resolvidos: 0 };
  });
  openedInPeriod.forEach(t => {
    if (!t.created_date) return;
    const key = useDays ? format(new Date(t.created_date),"dd/MM",{locale:ptBR}) : format(startOfWeek(new Date(t.created_date)),"dd/MM",{locale:ptBR});
    if (timeGroups[key]) timeGroups[key].abertos++;
  });
  resolvedInPeriod.forEach(t => {
    if (!t.resolved_at) return;
    const key = useDays ? format(new Date(t.resolved_at),"dd/MM",{locale:ptBR}) : format(startOfWeek(new Date(t.resolved_at)),"dd/MM",{locale:ptBR});
    if (timeGroups[key]) timeGroups[key].resolvidos++;
  });
  const timeData = Object.values(timeGroups).sort((a,b) => a.name.localeCompare(b.name));

  // Top clients table
  const orgGroups = {};
  tickets.filter(t => inRange(t.created_date)).forEach(t => {
    if (!t.organization_id) return;
    if (!orgGroups[t.organization_id]) orgGroups[t.organization_id] = { abertos:0, resolvidos:0, em_andamento:0, resolvedHrs:[] };
    const g = orgGroups[t.organization_id];
    if (t.status === "aberto" || t.status === "aguardando_cliente") g.abertos++;
    else if (t.status === "resolvido" || t.status === "arquivado") g.resolvidos++;
    else if (t.status === "em_andamento") g.em_andamento++;
    if (t.status === "resolvido" && t.created_date && t.resolved_at) g.resolvedHrs.push(differenceInHours(new Date(t.resolved_at), new Date(t.created_date)));
  });
  const topClients = Object.entries(orgGroups)
    .sort((a,b) => (b[1].abertos+b[1].resolvidos+b[1].em_andamento) - (a[1].abertos+a[1].resolvidos+a[1].em_andamento))
    .slice(0,5)
    .map(([orgId, g]) => ({ org: orgsMap[orgId], ...g, avgHrs: g.resolvedHrs.length > 0 ? g.resolvedHrs.reduce((a,b)=>a+b,0)/g.resolvedHrs.length : null }))
    .filter(r => r.org);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Tickets abertos" icon={Ticket} value={openedInPeriod.length} loading={loading} iconColor="#EF4444" />
        <KpiCard label="Tickets resolvidos" icon={CheckCircle2} value={resolvedInPeriod.length} loading={loading} iconColor="#22C55E" />
        <KpiCard label="Tempo médio resolução" icon={Clock} value={avgResolution !== null ? resolvedStr(avgResolution) : "—"} loading={loading} iconColor="#F0C000" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie by type */}
        <GlassCard>
          <h2 className="font-semibold mb-4" style={{ color:"#1A1A1A", fontSize:17 }}>Distribuição por Tipo</h2>
          {pieData.length === 0 ? (
            <p className="text-center py-10" style={{ color:"#999", fontSize:14 }}>Nenhum ticket no período</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" outerRadius={90} dataKey="value" label={({ name, pct: p }) => `${name} ${p}%`} labelLine={{ stroke:"rgba(0,0,0,0.15)" }}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend formatter={(v) => <span style={{ color:"#555", fontSize:12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        {/* Line chart */}
        <GlassCard>
          <h2 className="font-semibold mb-4" style={{ color:"#1A1A1A", fontSize:17 }}>Abertos vs Resolvidos</h2>
          {timeData.length === 0 ? (
            <p className="text-center py-10" style={{ color:"#999", fontSize:14 }}>Sem dados no período</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={timeData} margin={{ left:0, right:8 }}>
                <defs>
                  <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill:"#999", fontSize:11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill:"#999", fontSize:11 }} />
                <Tooltip content={<CustomLineTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="abertos" name="Abertos" stroke="#EF4444" fill="url(#redGrad)" strokeWidth={2} dot={{ r:3, fill:"#EF4444", strokeWidth:0 }} />
                <Area type="monotone" dataKey="resolvidos" name="Resolvidos" stroke="#22C55E" fill="url(#greenGrad)" strokeWidth={2} dot={{ r:3, fill:"#22C55E", strokeWidth:0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </div>

      {/* Top clients */}
      <GlassCard>
        <h2 className="font-semibold mb-4" style={{ color:"#1A1A1A", fontSize:17 }}>Clientes que mais abriram tickets</h2>
        {topClients.length === 0 ? (
          <p className="text-center py-10" style={{ color:"#999", fontSize:14 }}>Nenhum dado no período</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(0,0,0,0.08)" }}>
                  {["#","Organização","Abertos","Resolvidos","Em andamento","Tempo méd. resolução"].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wider" style={{ color:"#999" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topClients.map((row, i) => {
                  const needsAttention = row.abertos > row.resolvidos;
                  return (
                    <tr key={row.org.id}
                      style={{ background:i%2===0?"rgba(0,0,0,0.02)":"transparent" }}
                      onMouseEnter={e => e.currentTarget.style.background="rgba(240,192,0,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background=i%2===0?"rgba(0,0,0,0.02)":"transparent"}>
                      <td className="py-2.5 px-3" style={{ color:"#999" }}>{i+1}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium" style={{ color:"#1A1A1A" }}>{row.org.name}</span>
                          {needsAttention && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background:"#FEE2E2", color:"#EF4444" }}>Atenção</span>}
                        </div>
                      </td>
                      <td className="py-2.5 px-3" style={{ color:"#EF4444", fontWeight:600 }}>{row.abertos}</td>
                      <td className="py-2.5 px-3" style={{ color:"#22C55E", fontWeight:600 }}>{row.resolvidos}</td>
                      <td className="py-2.5 px-3" style={{ color:"#F0C000", fontWeight:600 }}>{row.em_andamento}</td>
                      <td className="py-2.5 px-3" style={{ color:"#555" }}>{row.avgHrs !== null ? resolvedStr(row.avgHrs) : "—"}</td>
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