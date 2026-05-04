import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import { Calendar, Phone, MessageCircle } from "lucide-react";
import { format, differenceInDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

function getUrgency(dateStr) {
  const today = startOfDay(new Date());
  const d = startOfDay(new Date(dateStr));
  const diff = differenceInDays(d, today);
  if (diff < 0) return { label: "Atrasado", bg: "#FEE2E2", color: "#EF4444" };
  if (diff === 0) return { label: "Hoje", bg: "rgba(240,192,0,0.12)", color: "#C49A00" };
  if (diff <= 3) return { label: "Em breve", bg: "#EFF6FF", color: "#3B82F6" };
  return { label: format(d, "dd MMM", { locale: ptBR }), bg: "#F0FDF4", color: "#22C55E" };
}

export default function UpcomingFollowups() {
  const [items, setItems] = useState([]);
  const [orgsMap, setOrgsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [acts, orgs] = await Promise.all([
        base44.entities.Activity.list("next_followup_at", 50),
        base44.entities.Organization.list(),
      ]);
      const map = {};
      orgs.forEach(o => { map[o.id] = o; });
      setOrgsMap(map);
      const today = startOfDay(new Date());
      const filtered = acts
        .filter(a => a.next_followup_at && new Date(a.next_followup_at) >= today)
        .sort((a, b) => new Date(a.next_followup_at) - new Date(b.next_followup_at))
        .slice(0, 6);
      setItems(filtered);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <GlassCard className="flex flex-col">
      <h2 className="font-semibold mb-4" style={{ color: "#1A1A1A", fontSize: 18 }}>Próximos Follow-ups</h2>
      {loading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: "rgba(240,192,0,0.06)" }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 gap-2">
          <Calendar className="w-10 h-10" style={{ color: "#CCCCCC" }} />
          <p style={{ color: "#999999", fontSize: 14 }}>Nenhum follow-up agendado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((act) => {
            const urgency = getUrgency(act.next_followup_at);
            const org = orgsMap[act.organization_id];
            return (
              <div key={act.id} className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {org && <p className="text-sm font-semibold truncate" style={{ color: "#1A1A1A" }}>{org.name}</p>}
                  <p className="text-xs truncate mt-0.5" style={{ color: "#555555" }}>{act.title}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: urgency.bg, color: urgency.color }}>
                    {urgency.label}
                  </span>
                  <Phone className="w-3.5 h-3.5 cursor-pointer" style={{ color: "#3B82F6" }} />
                  <MessageCircle className="w-3.5 h-3.5 cursor-pointer" style={{ color: "#22C55E" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}