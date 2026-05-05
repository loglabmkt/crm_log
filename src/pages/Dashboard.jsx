import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Headphones, Target } from "lucide-react";
import PeriodFilter, { getPeriodRange } from "@/components/dashboard/PeriodFilter";
import KpiCards from "@/components/dashboard/KpiCards";
import SalesFunnelChart from "@/components/dashboard/SalesFunnelChart";
import MonthlyRevenueChart from "@/components/dashboard/MonthlyRevenueChart";
import RecentActivities from "@/components/dashboard/RecentActivities";
import UpcomingFollowups from "@/components/dashboard/UpcomingFollowups";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function DayGreeting() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pills, setPills] = useState({ followups: 0, tickets: 0, opps: 0 });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
    Promise.all([
      base44.entities.Activity.list(),
      base44.entities.Ticket.list(),
      base44.entities.Opportunity.list(),
    ]).then(([acts, tickets, opps]) => {
      const followups = acts.filter(a => {
        if (!a.next_followup_at) return false;
        const d = new Date(a.next_followup_at);
        return d >= todayStart && d <= todayEnd;
      }).length;
      const openTickets = tickets.filter(t => t.status === "aberto").length;
      const activeOpps = opps.filter(o => o.situacao === "em_andamento").length;
      setPills({ followups, tickets: openTickets, opps: activeOpps });
    }).catch(() => {});
  }, []);

  const firstName = user?.full_name?.split(" ")[0] || "";
  const today = format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  const pillData = [
    { label: `${pills.followups} follow-up${pills.followups !== 1 ? "s" : ""} hoje`, icon: Clock, color: pills.followups > 0 ? "#F59E0B" : "#999", path: "/opportunities" },
    { label: `${pills.tickets} ticket${pills.tickets !== 1 ? "s" : ""} aberto${pills.tickets !== 1 ? "s" : ""}`, icon: Headphones, color: pills.tickets > 0 ? "#EF4444" : "#999", path: "/support" },
    { label: `${pills.opps} oportunidade${pills.opps !== 1 ? "s" : ""} ativa${pills.opps !== 1 ? "s" : ""}`, icon: Target, color: pills.opps > 0 ? "#F0C000" : "#999", path: "/opportunities" },
  ];

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-bold" style={{ color: "#1A1A1A", fontSize: 22 }}>
          {getGreeting()}{firstName ? `, ${firstName}` : ""}
        </h2>
        <p className="mt-0.5 text-sm capitalize" style={{ color: "#999" }}>
          Resumo do dia — {today}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {pillData.map(p => {
          const Icon = p.icon;
          return (
            <button key={p.label} onClick={() => navigate(p.path)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                background: "rgba(255,255,255,0.60)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.90)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                color: p.color,
              }}
              onMouseEnter={e => e.currentTarget.style.border = "1px solid rgba(240,192,0,0.40)"}
              onMouseLeave={e => e.currentTarget.style.border = "1px solid rgba(255,255,255,0.90)"}>
              <Icon className="w-3.5 h-3.5" />
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [filter, setFilter] = useState({ period: "month", customRange: {} });
  const periodRange = getPeriodRange(filter.period, filter.customRange);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <DayGreeting />

      {/* Period filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm font-medium" style={{ color: "#999999" }}>Visão geral do período</p>
        <PeriodFilter value={filter} onChange={setFilter} />
      </div>

      {/* KPIs */}
      <KpiCards periodRange={periodRange} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SalesFunnelChart periodRange={periodRange} />
        <MonthlyRevenueChart />
      </div>

      {/* Activity + Followups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentActivities />
        </div>
        <UpcomingFollowups />
      </div>
    </div>
  );
}