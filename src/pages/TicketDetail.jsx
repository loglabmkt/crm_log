import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import TicketModal from "@/components/support/TicketModal";
import TicketReplyPanel from "@/components/support/TicketReplyPanel";
import { ArrowLeft, Edit2, MessageSquare, Lock, RefreshCw, Phone, AlertTriangle, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format, differenceInHours, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_FLOW = ["aberto", "em_andamento", "aguardando_cliente", "resolvido", "arquivado"];
const STATUS_LABELS = { aberto: "Aberto", em_andamento: "Em andamento", aguardando_cliente: "Aguardando cliente", resolvido: "Resolvido", arquivado: "Arquivado" };
const STATUS_COLORS = { aberto: "#EF4444", em_andamento: "#F0C000", aguardando_cliente: "#F59E0B", resolvido: "#22C55E", arquivado: "#999" };
const PRIORITY_MAP = {
  critica: { label: "Crítica", bg: "#FEE2E2", color: "#EF4444" },
  alta: { label: "Alta", bg: "#FEF3C7", color: "#D97706" },
  media: { label: "Média", bg: "#EFF6FF", color: "#3B82F6" },
  baixa: { label: "Baixa", bg: "#F0FDF4", color: "#22C55E" },
};
const MSG_TYPE_MAP = {
  resposta: { icon: MessageSquare, color: "#3B82F6", label: "Resposta" },
  anotacao_interna: { icon: Lock, color: "#F59E0B", label: "Interno" },
  mudanca_status: { icon: RefreshCw, color: "#8B5CF6", label: "Status" },
  ligacao_registrada: { icon: Phone, color: "#22C55E", label: "Ligação" },
};

function elapsedStr(createdAt) {
  const mins = differenceInMinutes(new Date(), new Date(createdAt));
  if (mins < 60) return `${mins}m`;
  const hrs = differenceInHours(new Date(), new Date(createdAt));
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function SlaProgress({ createdAt, slaHours }) {
  if (!slaHours || !createdAt) return <p style={{ color: "#999", fontSize: 13 }}>SLA não definido</p>;
  const elapsed = differenceInHours(new Date(), new Date(createdAt));
  const pct = Math.min((elapsed / slaHours) * 100, 100);
  const color = pct > 80 ? "#EF4444" : pct > 50 ? "#F59E0B" : "#22C55E";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs" style={{ color: "#999" }}>
        <span>{Math.round(pct)}% consumido</span>
        <span>{elapsed}h / {slaHours}h</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: "rgba(0,0,0,0.08)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [org, setOrg] = useState(null);
  const [contact, setContact] = useState(null);
  const [assignee, setAssignee] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [editModal, setEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [changingStatus, setChangingStatus] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [tList, uList] = await Promise.all([
      base44.entities.Ticket.filter({ id }),
      base44.entities.User.list(),
    ]);
    const t = tList[0];
    if (!t) { setLoading(false); return; }
    setTicket(t);
    setAllUsers(uList);
    const um = {}; uList.forEach(u => { um[u.id] = u; });
    setUsersMap(um);
    const msgs = await base44.entities.TicketMessage.filter({ ticket_id: id });
    setMessages(msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
    if (t.organization_id) {
      const orgs = await base44.entities.Organization.filter({ id: t.organization_id });
      setOrg(orgs[0] || null);
    }
    if (t.contact_id) {
      const cs = await base44.entities.Contact.filter({ id: t.contact_id });
      setContact(cs[0] || null);
    }
    if (t.assigned_to) setAssignee(um[t.assigned_to] || null);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (newStatus) => {
    setChangingStatus(true);
    const user = await base44.auth.me();
    await base44.entities.Ticket.update(ticket.id, { status: newStatus, ...(newStatus === "resolvido" ? { resolved_at: new Date().toISOString() } : {}) });
    await base44.entities.TicketMessage.create({
      ticket_id: ticket.id, user_id: user?.id,
      type: "mudanca_status",
      content: `Status alterado para "${STATUS_LABELS[newStatus]}" por ${user?.full_name || "usuário"}`,
      is_internal: true,
    });
    setChangingStatus(false);
    load();
  };

  const reassign = async (userId) => {
    await base44.entities.Ticket.update(ticket.id, { assigned_to: userId });
    load();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(240,192,0,0.2)", borderTopColor: "#F0C000" }} />
    </div>
  );
  if (!ticket) return <div className="py-20 text-center" style={{ color: "#999" }}>Ticket não encontrado.</div>;

  const p = PRIORITY_MAP[ticket.priority] || PRIORITY_MAP.media;
  const statusColor = STATUS_COLORS[ticket.status] || "#999";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <button onClick={() => navigate("/support")} className="flex items-center gap-1.5 text-sm font-medium mt-1" style={{ color: "#999" }}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-bold" style={{ color: "#1A1A1A", fontSize: 22 }}>{ticket.title}</h1>
            {/* Status dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium" style={{ background: `${statusColor}18`, color: statusColor }}>
                  {STATUS_LABELS[ticket.status]} <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(240,192,0,0.15)" }}>
                {STATUS_FLOW.filter(s => s !== ticket.status).map(s => (
                  <DropdownMenuItem key={s} className="cursor-pointer text-sm" style={{ color: STATUS_COLORS[s] }} onClick={() => changeStatus(s)}>
                    {STATUS_LABELS[s]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: p.bg, color: p.color }}>
              {ticket.priority === "critica" && <AlertTriangle className="w-3 h-3" />} {p.label}
            </span>
          </div>
        </div>
        <button onClick={() => setEditModal(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium"
          style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(255,255,255,0.90)", color: "#555" }}>
          <Edit2 className="w-4 h-4" /> Editar
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT 65% */}
        <div className="lg:col-span-3 space-y-5">
          {/* Timeline */}
          <GlassCard>
            <h2 className="font-semibold mb-4" style={{ color: "#1A1A1A", fontSize: 17 }}>Histórico de Interações</h2>
            {messages.length === 0 ? (
              <p className="text-center py-6" style={{ color: "#999", fontSize: 14 }}>Nenhuma interação registrada</p>
            ) : (
              <div className="space-y-4">
                {messages.map(msg => {
                  const mt = MSG_TYPE_MAP[msg.type] || MSG_TYPE_MAP.resposta;
                  const Icon = mt.icon;
                  const author = usersMap[msg.user_id];
                  return (
                    <div key={msg.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: `${mt.color}18`, color: mt.color }}>
                        {author?.full_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0 rounded-xl p-3" style={{ background: msg.is_internal ? "rgba(245,158,11,0.06)" : "rgba(0,0,0,0.03)", border: msg.is_internal ? "1px solid rgba(245,158,11,0.15)" : "1px solid rgba(0,0,0,0.06)" }}>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-xs font-semibold" style={{ color: "#1A1A1A" }}>{author?.full_name || "Usuário"}</p>
                          <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${mt.color}15`, color: mt.color }}>
                            <Icon className="w-2.5 h-2.5" /> {mt.label}
                          </span>
                          {msg.is_internal && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.12)", color: "#D97706" }}>Interno</span>}
                          <span className="text-[10px] ml-auto" style={{ color: "#999" }}>
                            {format(new Date(msg.created_date), "dd MMM, HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-sm" style={{ color: "#555", whiteSpace: "pre-wrap" }}>{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <TicketReplyPanel ticketId={id} onSaved={load} />
          </GlassCard>

          {/* Description */}
          <GlassCard>
            <h2 className="font-semibold mb-3" style={{ color: "#1A1A1A", fontSize: 17 }}>Descrição original</h2>
            <p className="text-sm" style={{ color: "#555", whiteSpace: "pre-wrap" }}>{ticket.description}</p>
          </GlassCard>
        </div>

        {/* RIGHT 35% */}
        <div className="lg:col-span-2 space-y-4">
          {/* Client data */}
          <GlassCard>
            <h3 className="font-semibold mb-3" style={{ color: "#1A1A1A", fontSize: 15 }}>Dados do Cliente</h3>
            {org && <><p className="font-semibold text-sm" style={{ color: "#1A1A1A" }}>{org.name}</p><p className="text-xs" style={{ color: "#999" }}>{org.type}</p></>}
            {contact && (
              <div className="mt-2 pt-2" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <p className="text-sm font-medium" style={{ color: "#1A1A1A" }}>{contact.name}</p>
                {contact.role_title && <p className="text-xs" style={{ color: "#999" }}>{contact.role_title}</p>}
                {contact.email && <p className="text-xs mt-1" style={{ color: "#555" }}>{contact.email}</p>}
                {contact.phone && <p className="text-xs" style={{ color: "#555" }}>{contact.phone}</p>}
              </div>
            )}
            {ticket.module_related && (
              <div className="mt-2 pt-2" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <p className="text-xs" style={{ color: "#999" }}>Módulo</p>
                <p className="text-sm" style={{ color: "#555" }}>{ticket.module_related}</p>
              </div>
            )}
          </GlassCard>

          {/* SLA */}
          <GlassCard>
            <h3 className="font-semibold mb-3" style={{ color: "#1A1A1A", fontSize: 15 }}>SLA e Tempo</h3>
            <div className="space-y-2 text-sm mb-3">
              <div className="flex justify-between"><span style={{ color: "#999" }}>Abertura</span><span style={{ color: "#555" }}>{format(new Date(ticket.created_date), "dd/MM/yyyy HH:mm")}</span></div>
              {ticket.sla_hours && <div className="flex justify-between"><span style={{ color: "#999" }}>SLA</span><span style={{ color: "#555" }}>{ticket.sla_hours}h</span></div>}
              <div className="flex justify-between"><span style={{ color: "#999" }}>Decorrido</span><span style={{ color: "#555" }}>{elapsedStr(ticket.created_date)}</span></div>
              {ticket.resolved_at && <div className="flex justify-between"><span style={{ color: "#999" }}>Resolvido em</span><span style={{ color: "#22C55E" }}>{differenceInHours(new Date(ticket.resolved_at), new Date(ticket.created_date))}h</span></div>}
            </div>
            <SlaProgress createdAt={ticket.created_date} slaHours={ticket.sla_hours} />
          </GlassCard>

          {/* Assignee */}
          <GlassCard>
            <h3 className="font-semibold mb-3" style={{ color: "#1A1A1A", fontSize: 15 }}>Responsável</h3>
            {assignee ? (
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg,#F0C000,#C49A00)", color: "#1A1A1A" }}>{assignee.full_name?.[0]?.toUpperCase()}</div>
                <p className="text-sm font-medium" style={{ color: "#1A1A1A" }}>{assignee.full_name}</p>
              </div>
            ) : <p className="text-sm mb-3" style={{ color: "#999" }}>Não atribuído</p>}
            <select value={ticket.assigned_to || ""} onChange={e => reassign(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.10)", color: "#1A1A1A", fontFamily: "Inter,sans-serif" }}>
              <option value="">Reatribuir para...</option>
              {allUsers.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
            </select>
          </GlassCard>
        </div>
      </div>

      {editModal && <TicketModal ticket={ticket} onClose={() => setEditModal(false)} onSaved={() => { setEditModal(false); load(); }} />}
    </div>
  );
}