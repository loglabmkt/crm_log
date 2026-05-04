import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import { Target, TrendingUp, Users, Headphones } from "lucide-react";

function formatValue(n) {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(2).replace(".", ",")}M`;
  if (n >= 1_000) return `R$ ${(n / 1_000).toFixed(0)}K`;
  return `R$ ${n.toFixed(0)}`;
}

function Skeleton() {
  return (
    <div className="h-8 w-24 rounded-lg animate-pulse" style={{ background: "linear-gradient(90deg, rgba(240,192,0,0.08) 25%, rgba(240,192,0,0.16) 50%, rgba(240,192,0,0.08) 75%)", backgroundSize: "200% 100%" }} />
  );
}

function KpiCard({ label, IconComponent, value, loading }) {
  return (
    <GlassCard>
      <div className="flex items-start justify-between">
        <div>
          <p className="uppercase font-medium tracking-widest" style={{ color: "#999999", fontSize: 11 }}>{label}</p>
          <div className="mt-2">
            {loading ? <Skeleton /> : <p className="font-bold" style={{ color: "#1A1A1A", fontSize: 32 }}>{value}</p>}
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(240,192,0,0.12)" }}>
          <IconComponent className="w-5 h-5" style={{ color: "#F0C000" }} />
        </div>
      </div>
    </GlassCard>
  );
}

export default function KpiCards({ periodRange }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ activeOpps: 0, pipeline: 0, orgs: 0, tickets: 0 });

  useEffect(() => {
    async function load() {
      setLoading(true);
      const closedStages = ["fechado_ganho", "fechado_perdido"];
      const [opps, orgs, tickets] = await Promise.all([
        base44.entities.Opportunity.list(),
        base44.entities.Organization.list(),
        base44.entities.Ticket.list(),
      ]);

      const inRange = (dateStr) => {
        if (!periodRange.start || !periodRange.end || !dateStr) return true;
        const d = new Date(dateStr);
        return d >= periodRange.start && d <= periodRange.end;
      };

      const activeOpps = opps.filter(o => !closedStages.includes(o.stage) && inRange(o.opened_at));
      const pipeline = activeOpps.reduce((s, o) => s + (o.estimated_value || 0), 0);
      const activeOrgs = orgs.filter(o => o.is_active !== false);
      const openTickets = tickets.filter(t => (t.status === "aberto" || t.status === "em_andamento") && inRange(t.created_date));

      setData({ activeOpps: activeOpps.length, pipeline, orgs: activeOrgs.length, tickets: openTickets.length });
      setLoading(false);
    }
    load();
  }, [periodRange]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="Oportunidades Ativas" IconComponent={Target} value={data.activeOpps} loading={loading} />
      <KpiCard label="Valor no Pipeline" IconComponent={TrendingUp} value={formatValue(data.pipeline)} loading={loading} />
      <KpiCard label="Organizações" IconComponent={Users} value={data.orgs} loading={loading} />
      <KpiCard label="Tickets Abertos" IconComponent={Headphones} value={data.tickets} loading={loading} />
    </div>
  );
}