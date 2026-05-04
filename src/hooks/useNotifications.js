import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const STORAGE_KEY = "crm_read_notifications";

function getReadIds() {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); }
  catch { return new Set(); }
}

function saveReadIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(getReadIds);

  const fetchNotifications = useCallback(async () => {
    const now = new Date();
    const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

    const [activities, tickets, opportunities, orgs] = await Promise.all([
      base44.entities.Activity.list(),
      base44.entities.Ticket.list(),
      base44.entities.Opportunity.list(),
      base44.entities.Organization.list(),
    ]);

    const orgMap = {};
    orgs.forEach(o => { orgMap[o.id] = o; });

    const list = [];

    // TYPE 1 — Follow-up atrasado
    activities.forEach(act => {
      if (!act.next_followup_at || !act.opportunity_id) return;
      if (new Date(act.next_followup_at) < now) {
        const opp = opportunities.find(o => o.id === act.opportunity_id);
        const org = opp?.organization_id ? orgMap[opp.organization_id] : null;
        list.push({
          id: `followup-${act.id}`,
          type: "followup",
          group: "urgent",
          title: org?.name || opp?.title || "Oportunidade",
          label: "Follow-up atrasado",
          icon: "Clock",
          iconColor: "#EF4444",
          link: `/sales/${act.opportunity_id}`,
          createdAt: act.next_followup_at,
        });
      }
    });

    // TYPE 2 — Ticket crítico aberto
    tickets.forEach(t => {
      if (t.priority === "critica" && (t.status === "aberto" || t.status === "em_andamento")) {
        const org = t.organization_id ? orgMap[t.organization_id] : null;
        list.push({
          id: `critical-${t.id}`,
          type: "critical_ticket",
          group: "urgent",
          title: org?.name || t.title,
          label: "Ticket crítico aberto",
          icon: "AlertTriangle",
          iconColor: "#EF4444",
          link: `/support/${t.id}`,
          createdAt: t.created_date,
        });
      }
    });

    // TYPE 3 — SLA vencido
    tickets.forEach(t => {
      if (!t.sla_hours || t.sla_hours <= 0) return;
      if (t.status === "resolvido" || t.status === "arquivado") return;
      const hoursElapsed = (now - new Date(t.created_date)) / (1000 * 60 * 60);
      if (hoursElapsed > t.sla_hours) {
        const org = t.organization_id ? orgMap[t.organization_id] : null;
        list.push({
          id: `sla-${t.id}`,
          type: "sla_breach",
          group: "attention",
          title: org?.name || t.title,
          label: "SLA vencido",
          icon: "AlertOctagon",
          iconColor: "#F59E0B",
          link: `/support/${t.id}`,
          createdAt: t.created_date,
        });
      }
    });

    // TYPE 4 — Oportunidade sem atividade há 14+ dias
    const closedStages = ["fechado_ganho", "fechado_perdido"];
    opportunities.forEach(opp => {
      if (closedStages.includes(opp.stage)) return;
      const recentActivity = activities.some(a =>
        a.opportunity_id === opp.id &&
        a.occurred_at &&
        new Date(a.occurred_at) >= fourteenDaysAgo
      );
      if (!recentActivity) {
        const org = opp.organization_id ? orgMap[opp.organization_id] : null;
        list.push({
          id: `inactive-${opp.id}`,
          type: "no_activity",
          group: "attention",
          title: org?.name || opp.title,
          label: "Sem atividade há 14+ dias",
          icon: "TrendingDown",
          iconColor: "#F59E0B",
          link: `/sales/${opp.id}`,
          createdAt: opp.created_date,
        });
      }
    });

    setNotifications(list);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = useCallback((id) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds(prev => {
      const next = new Set(prev);
      notifications.forEach(n => next.add(n.id));
      saveReadIds(next);
      return next;
    });
  }, [notifications]);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  return {
    notifications: notifications.map(n => ({ ...n, isRead: readIds.has(n.id) })),
    unreadCount,
    markAllAsRead,
    markAsRead,
  };
}