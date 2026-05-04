import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Send, Mail, MessageCircle, Smartphone, Star } from "lucide-react";

const CHANNEL_MAP = { email: { icon: Mail, color: "#3B82F6" }, whatsapp: { icon: MessageCircle, color: "#22C55E" }, sms: { icon: Smartphone, color: "#8B5CF6" } };
const STATUS_MAP = { rascunho:"Rascunho", programada:"Programada", ativa:"Ativa", pausada:"Pausada", finalizada:"Finalizada" };

function pct(n, d) { if (!d || !n) return null; return Math.round((n / d) * 100); }
function fmt(v) { if (v >= 1_000_000) return `R$ ${(v/1_000_000).toFixed(1)}M`; if (v >= 1_000) return `R$ ${(v/1_000).toFixed(0)}K`; return `${v}`; }

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
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:`${iconColor || "#F0C000"}18` }}>
          <Icon className="w-5 h-5" style={{ color: iconColor || "#F0C000" }} />
        </div>
      </div>
    </GlassCard>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-sm space-y-1" style={{ background:"rgba(255,255,255,0.97)", border:"1px solid rgba(240,192,0,0.25)", boxShadow:"0 4px 16px rgba(0,0,0,0.10)", color:"#1A1A1A" }}>
      <p className="font-semibold">{label}</p>
      {payload.map(p => <p key={p.dataKey} style={{ color:p.color }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function MarketingReport({ periodRange }) {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [segments, setSegments] = useState([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [cList, sList] = await Promise.all([
        base44.entities.Campaign.list(),
        base44.entities.Segment.list(),
      ]);
      setCampaigns(cList);
      setSegments(sList);
      setLoading(false);
    }
    load();
  }, []);

  const inRange = (dateStr) => {
    if (!periodRange?.start || !periodRange?.end || !dateStr) return true;
    const d = new Date(dateStr);
    return d >= periodRange.start && d <= periodRange.end;
  };

  const periodCampaigns = campaigns.filter(c => inRange(c.sent_at || c.scheduled_at || c.created_date));
  const active = campaigns.filter(c => c.status === "ativa").length;
  const withSent = periodCampaigns.filter(c => (c.stats?.sent || 0) > 0);
  const avgOpen = withSent.length > 0 ? Math.round(withSent.reduce((s, c) => s + (pct(c.stats?.opened, c.stats?.sent) || 0), 0) / withSent.length) : null;
  const avgReply = withSent.length > 0 ? Math.round(withSent.reduce((s, c) => s + (pct(c.stats?.replied, c.stats?.sent) || 0), 0) / withSent.length) : null;
  const totalOpps = periodCampaigns.reduce((s, c) => s + (c.stats?.opportunities_generated || 0), 0);

  const chartData = withSent.map(c => ({
    name: c.name.length > 20 ? c.name.slice(0,20) + "…" : c.name,
    Enviados: c.stats?.sent || 0,
    Abertos: c.stats?.opened || 0,
    Respondidos: c.stats?.replied || 0,
  }));

  const bestCampaign = withSent.length > 0
    ? withSent.reduce((best, c) => {
        const r = pct(c.stats?.replied, c.stats?.sent) || 0;
        const br = pct(best.stats?.replied, best.stats?.sent) || 0;
        return r > br ? c : best;
      }, withSent[0])
    : null;

  const segMap = {}; segments.forEach(s => { segMap[s.id] = s; });

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Campanhas ativas" icon={Send} value={active} loading={loading} iconColor="#22C55E" />
        <KpiCard label="Taxa méd. abertura" icon={Mail} value={avgOpen !== null ? `${avgOpen}%` : "—"} loading={loading} iconColor="#3B82F6" />
        <KpiCard label="Taxa méd. resposta" icon={MessageCircle} value={avgReply !== null ? `${avgReply}%` : "—"} loading={loading} iconColor="#8B5CF6" />
        <KpiCard label="Oportunidades geradas" icon={Star} value={totalOpps} loading={loading} iconColor="#F0C000" />
      </div>

      {/* Campaign performance chart */}
      <GlassCard>
        <h2 className="font-semibold mb-4" style={{ color:"#1A1A1A", fontSize:17 }}>Desempenho por Campanha</h2>
        {chartData.length === 0 ? (
          <p className="text-center py-10" style={{ color:"#999", fontSize:14 }}>Nenhuma campanha com dados de envio no período</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 52)}>
            <BarChart data={chartData} layout="vertical" margin={{ left:8, right:16 }}>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill:"#999", fontSize:11 }} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={130} tick={{ fill:"#555", fontSize:12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill:"rgba(240,192,0,0.04)" }} />
              <Bar dataKey="Enviados" fill="rgba(240,192,0,0.35)" radius={[0,4,4,0]} />
              <Bar dataKey="Abertos" fill="#F0C000" radius={[0,4,4,0]} />
              <Bar dataKey="Respondidos" fill="#C49A00" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </GlassCard>

      {/* Best campaign */}
      <GlassCard>
        <h2 className="font-semibold mb-3" style={{ color:"#1A1A1A", fontSize:17 }}>Top Campanha do Período</h2>
        {!bestCampaign ? (
          <p style={{ color:"#999", fontSize:14 }}>Sem dados suficientes</p>
        ) : (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1">
              <p className="font-bold text-base" style={{ color:"#1A1A1A" }}>{bestCampaign.name}</p>
              <div className="flex gap-3 mt-1 text-sm flex-wrap">
                <span style={{ color:"#555" }}>Canal: {bestCampaign.channel}</span>
                {segMap[bestCampaign.segment_id] && <span style={{ color:"#555" }}>Segmento: {segMap[bestCampaign.segment_id].name}</span>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider" style={{ color:"#999" }}>Taxa de resposta</p>
              <p className="font-bold text-3xl" style={{ color:"#F0C000" }}>{pct(bestCampaign.stats?.replied, bestCampaign.stats?.sent) || 0}%</p>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Campaigns table */}
      <GlassCard>
        <h2 className="font-semibold mb-4" style={{ color:"#1A1A1A", fontSize:17 }}>Todas as Campanhas</h2>
        {periodCampaigns.length === 0 ? (
          <p className="text-center py-10" style={{ color:"#999", fontSize:14 }}>Nenhuma campanha no período</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(0,0,0,0.08)" }}>
                  {["Campanha","Canal","Segmento","Status","Enviados","Abertura%","Resposta%","Opps"].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wider" style={{ color:"#999" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...periodCampaigns].sort((a,b) => (b.stats?.sent||0) - (a.stats?.sent||0)).map((c, i) => {
                  const ch = CHANNEL_MAP[c.channel];
                  const Icon = ch?.icon;
                  return (
                    <tr key={c.id}
                      style={{ background: i%2===0 ? "rgba(0,0,0,0.02)" : "transparent" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(240,192,0,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background = i%2===0 ? "rgba(0,0,0,0.02)" : "transparent"}>
                      <td className="py-2.5 px-3 font-medium max-w-xs truncate" style={{ color:"#1A1A1A" }}>{c.name}</td>
                      <td className="py-2.5 px-3">
                        {Icon && <Icon className="w-4 h-4" style={{ color:ch.color }} />}
                      </td>
                      <td className="py-2.5 px-3" style={{ color:"#555" }}>{segMap[c.segment_id]?.name || "—"}</td>
                      <td className="py-2.5 px-3" style={{ color:"#555" }}>{STATUS_MAP[c.status] || c.status}</td>
                      <td className="py-2.5 px-3" style={{ color:"#555" }}>{c.stats?.sent || "—"}</td>
                      <td className="py-2.5 px-3" style={{ color:"#555" }}>{pct(c.stats?.opened, c.stats?.sent) !== null ? `${pct(c.stats?.opened, c.stats?.sent)}%` : "—"}</td>
                      <td className="py-2.5 px-3" style={{ color:"#555" }}>{pct(c.stats?.replied, c.stats?.sent) !== null ? `${pct(c.stats?.replied, c.stats?.sent)}%` : "—"}</td>
                      <td className="py-2.5 px-3" style={{ color:"#555" }}>{c.stats?.opportunities_generated ?? "—"}</td>
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