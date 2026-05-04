import React from "react";
import { useNavigate } from "react-router-dom";
import { Building, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PRIORITY_MAP = {
  critica: { label: "Crítica", bg: "#FEE2E2", color: "#EF4444" },
  alta: { label: "Alta", bg: "#FEF3C7", color: "#D97706" },
  media: { label: "Média", bg: "#EFF6FF", color: "#3B82F6" },
  baixa: { label: "Baixa", bg: "#F0FDF4", color: "#22C55E" },
};
const STATUS_MAP = {
  aberto: { label: "Aberto", color: "#EF4444", bg: "rgba(239,68,68,0.10)" },
  em_andamento: { label: "Em andamento", color: "#F0C000", bg: "rgba(240,192,0,0.10)" },
  aguardando_cliente: { label: "Aguardando", color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
  resolvido: { label: "Resolvido", color: "#22C55E", bg: "rgba(34,197,94,0.10)" },
  arquivado: { label: "Arquivado", color: "#999", bg: "rgba(153,153,153,0.10)" },
};
const TYPE_LABELS = {
  suporte_tecnico: "Suporte", duvida_funcional: "Dúvida", melhoria: "Melhoria", incidente: "Incidente",
};

function SlaBar({ createdAt, slaHours }) {
  if (!slaHours || !createdAt) return null;
  const elapsed = (Date.now() - new Date(createdAt).getTime()) / 3600000;
  const pct = Math.min((elapsed / slaHours) * 100, 100);
  const color = pct > 80 ? "#EF4444" : pct > 50 ? "#F59E0B" : "#22C55E";
  return (
    <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function TicketCard({ ticket, org, index }) {
  const navigate = useNavigate();
  const p = PRIORITY_MAP[ticket.priority] || PRIORITY_MAP.media;
  const s = STATUS_MAP[ticket.status] || STATUS_MAP.aberto;
  const ticketId = `#${String(index + 1).padStart(4, "0")}`;

  return (
    <div onClick={() => navigate(`/support/${ticket.id}`)}
      className="rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(255,255,255,0.90)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.10)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold" style={{ color: "#999" }}>{ticketId}</span>
            <p className="font-semibold text-sm truncate" style={{ color: "#1A1A1A" }}>{ticket.title}</p>
          </div>
          {org && (
            <div className="flex items-center gap-1 mt-1">
              <Building className="w-3 h-3 flex-shrink-0" style={{ color: "#999" }} />
              <span className="text-xs truncate" style={{ color: "#555" }}>{org.name}</span>
              {ticket.module_related && (
                <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: "rgba(0,0,0,0.05)", color: "#999" }}>{ticket.module_related}</span>
              )}
            </div>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.color }}>{s.label}</span>
            <span className="px-2 py-0.5 rounded text-xs" style={{ background: "rgba(0,0,0,0.05)", color: "#555", border: "1px solid rgba(0,0,0,0.08)" }}>{TYPE_LABELS[ticket.type] || ticket.type}</span>
            <span className="text-xs ml-auto" style={{ color: "#999" }}>
              {format(new Date(ticket.created_date), "dd MMM yyyy", { locale: ptBR })}
            </span>
          </div>
        </div>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
          style={{ background: p.bg, color: p.color }}>
          {ticket.priority === "critica" && <AlertTriangle className="w-3 h-3" />}
          {p.label}
        </span>
      </div>
      <SlaBar createdAt={ticket.created_date} slaHours={ticket.sla_hours} />
    </div>
  );
}