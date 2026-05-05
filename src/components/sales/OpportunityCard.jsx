import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock } from "lucide-react";
import { differenceInDays, startOfDay, format } from "date-fns";
import { ptBR } from "date-fns/locale";

function getUrgency(dateStr) {
  if (!dateStr) return null;
  const today = startOfDay(new Date());
  const d = startOfDay(new Date(dateStr));
  const diff = differenceInDays(d, today);
  if (diff < 0) return { label: "Atrasado", bg: "#FEE2E2", color: "#EF4444" };
  if (diff === 0) return { label: "Hoje", bg: "rgba(240,192,0,0.12)", color: "#C49A00" };
  if (diff <= 3) return { label: "Em breve", bg: "#EFF6FF", color: "#3B82F6" };
  return { label: format(d, "dd/MM", { locale: ptBR }), bg: "#F0FDF4", color: "#22C55E" };
}

function fmtValue(v) {
  if (!v) return "—";
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`;
  return `R$ ${v}`;
}

export default function OpportunityCard({ opportunity, org, owner, activities = [] }) {
  const navigate = useNavigate();
  const daysInStage = differenceInDays(new Date(), new Date(opportunity.updated_date || opportunity.created_date));
  const nextFollowup = activities.find(a => a.opportunity_id === opportunity.id && a.next_followup_at);
  const urgency = nextFollowup ? getUrgency(nextFollowup.next_followup_at) : null;
  const probability = opportunity.probability || 0;

  return (
    <div
      onClick={() => navigate(`/opportunities/${opportunity.id}`)}
      className="rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group"
      style={{
        background: "rgba(255,255,255,0.70)",
        border: "1px solid rgba(255,255,255,0.90)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.10)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"}
    >
      {/* Org name */}
      <p className="font-bold text-sm truncate" style={{ color: "#1A1A1A" }}>
        {org ? org.name : opportunity.title}
      </p>
      {org && <p className="text-xs mt-0.5 truncate" style={{ color: "#999999" }}>
        {[org.city, org.state].filter(Boolean).join(" / ")}
      </p>}

      {/* Value */}
      <p className="font-semibold text-sm mt-2" style={{ color: "#F0C000" }}>
        {fmtValue(opportunity.estimated_value)}
      </p>

      {/* Owner */}
      {owner && (
        <div className="flex items-center gap-1.5 mt-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #F0C000, #C49A00)", color: "#1A1A1A" }}>
            {owner.full_name?.[0]?.toUpperCase() || "?"}
          </div>
          <span className="text-xs truncate" style={{ color: "#555555" }}>{owner.full_name}</span>
        </div>
      )}

      {/* Follow-up */}
      {urgency && (
        <div className="flex items-center gap-1.5 mt-2">
          <Calendar className="w-3 h-3 flex-shrink-0" style={{ color: "#999" }} />
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium" style={{ background: urgency.bg, color: urgency.color }}>
            {urgency.label}
          </span>
        </div>
      )}

      {/* Days in stage */}
      <div className="flex items-center gap-1 mt-2">
        <Clock className="w-3 h-3 flex-shrink-0" style={{ color: daysInStage > 14 ? "#F59E0B" : "#999" }} />
        <span className="text-[10px]" style={{ color: daysInStage > 14 ? "#F59E0B" : "#999999" }}>
          {daysInStage} dias neste estágio
        </span>
      </div>

      {/* Probability bar */}
      <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${probability}%`, background: "linear-gradient(90deg, #F0C000, #C49A00)" }} />
      </div>
    </div>
  );
}