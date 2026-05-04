import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import OpportunityModal from "@/components/sales/OpportunityModal";
import ActivityModal from "@/components/sales/ActivityModal";
import { ArrowLeft, Edit2, Phone as PhoneIcon, Mail as MailIcon, Globe, MessageCircle, MessageCircle as MsgIcon, Plus, FileText, Users, MapPin, Activity } from "lucide-react";
const FileTextIcon = FileText;
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STAGE_COLORS = {
  prospeccao: "#6B7280", qualificacao: "#3B82F6", proposta: "#8B5CF6",
  negociacao: "#F59E0B", licitacao: "#F0C000", fechado_ganho: "#22C55E", fechado_perdido: "#EF4444",
};
const STAGE_LABELS = {
  prospeccao: "Prospecção", qualificacao: "Qualificação", proposta: "Proposta",
  negociacao: "Negociação", licitacao: "Licitação", fechado_ganho: "Fechado ✓", fechado_perdido: "Perdido ✗",
};
const TYPE_MAP = {
  ligacao: { icon: PhoneIcon, color: "#3B82F6" },
  email: { icon: MailIcon, color: "#22C55E" },
  reuniao: { icon: Users, color: "#8B5CF6" },
  anotacao: { icon: FileTextIcon, color: "#F59E0B" },
  whatsapp: { icon: MsgIcon, color: "#22C55E" },
  visita: { icon: MapPin, color: "#EF4444" },
  outro: { icon: Activity, color: "#999999" },
};
const PROPOSAL_STATUS_COLORS = {
  rascunho: "#999", enviada: "#3B82F6", em_analise: "#F59E0B",
  aprovada: "#22C55E", rejeitada: "#EF4444", aguardando_resultado: "#8B5CF6",
};
const PROPOSAL_STATUS_LABELS = {
  rascunho: "Rascunho", enviada: "Enviada", em_analise: "Em Análise",
  aprovada: "Aprovada", rejeitada: "Rejeitada", aguardando_resultado: "Aguardando",
};

function fmtValue(v) {
  if (!v && v !== 0) return "—";
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(2).replace(".", ",")}M`;
  if (v >= 1_000) return `R$ ${v.toLocaleString("pt-BR")}`;
  return `R$ ${v}`;
}

const nowLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opp, setOpp] = useState(null);
  const [org, setOrg] = useState(null);
  const [contact, setContact] = useState(null);
  const [owner, setOwner] = useState(null);
  const [activities, setActivities] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [actModal, setActModal] = useState(false);
  const [followup, setFollowup] = useState({ text: "", datetime: "" });
  const [savingFollowup, setSavingFollowup] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const o = await base44.entities.Opportunity.filter({ id });
    const oppData = o[0];
    if (!oppData) { setLoading(false); return; }
    setOpp(oppData);
    const [actList, propList] = await Promise.all([
      base44.entities.Activity.filter({ opportunity_id: id }),
      base44.entities.Proposal.filter({ opportunity_id: id }),
    ]);
    const sorted = actList.sort((a, b) => new Date(b.occurred_at || b.created_date) - new Date(a.occurred_at || a.created_date));
    setActivities(sorted);
    setProposals(propList);
    if (oppData.organization_id) {
      const orgs = await base44.entities.Organization.filter({ id: oppData.organization_id });
      setOrg(orgs[0] || null);
    }
    if (oppData.contact_id) {
      const cs = await base44.entities.Contact.filter({ id: oppData.contact_id });
      setContact(cs[0] || null);
    }
    if (oppData.owner_id) {
      const us = await base44.entities.User.filter({ id: oppData.owner_id });
      setOwner(us[0] || null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const saveFollowup = async () => {
    if (!followup.text.trim()) return;
    setSavingFollowup(true);
    await base44.entities.Activity.create({
      type: "anotacao", title: followup.text,
      occurred_at: new Date().toISOString(),
      next_followup_at: followup.datetime || undefined,
      opportunity_id: id,
      organization_id: opp?.organization_id,
    });
    setFollowup({ text: "", datetime: "" });
    setSavingFollowup(false);
    load();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(240,192,0,0.2)", borderTopColor: "#F0C000" }} />
    </div>
  );
  if (!opp) return <div className="py-20 text-center" style={{ color: "#999" }}>Oportunidade não encontrada.</div>;

  const stageColor = STAGE_COLORS[opp.stage] || "#999";

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <button onClick={() => navigate("/sales")} className="flex items-center gap-1.5 text-sm font-medium mt-1" style={{ color: "#999999" }}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-bold" style={{ color: "#1A1A1A", fontSize: 26 }}>{org?.name || opp.title}</h1>
            <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: `${stageColor}18`, color: stageColor }}>
              {STAGE_LABELS[opp.stage]}
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: "#999999" }}>{opp.title}</p>
        </div>
        <button onClick={() => setEditModal(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium"
          style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(255,255,255,0.90)", color: "#555555" }}>
          <Edit2 className="w-4 h-4" /> Editar
        </button>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT 60% */}
        <div className="lg:col-span-3 space-y-6">
          {/* Activities timeline */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold" style={{ color: "#1A1A1A", fontSize: 18 }}>Atividades</h2>
              <button onClick={() => setActModal(true)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-sm font-medium"
                style={{ background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)", color: "#1A1A1A" }}>
                <Plus className="w-3.5 h-3.5" /> Registrar
              </button>
            </div>
            {activities.length === 0 ? (
              <p className="text-center py-8" style={{ color: "#999999", fontSize: 14 }}>Nenhuma atividade registrada</p>
            ) : (
              <div className="relative pl-6" style={{ borderLeft: "2px solid rgba(240,192,0,0.25)" }}>
                {activities.map((act) => {
                  const t = TYPE_MAP[act.type] || TYPE_MAP.outro;
                  const Icon = t.icon;
                  return (
                    <div key={act.id} className="relative mb-5 last:mb-0">
                      <div className="absolute -left-8 top-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${t.color}20`, border: `2px solid ${t.color}` }}>
                        <Icon className="w-2.5 h-2.5" style={{ color: t.color }} />
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>{act.title}</p>
                          {act.description && <p className="text-sm mt-0.5" style={{ color: "#555555" }}>{act.description}</p>}
                        </div>
                        {act.occurred_at && (
                          <p className="text-xs flex-shrink-0" style={{ color: "#999999" }}>
                            {format(new Date(act.occurred_at), "dd MMM, HH:mm", { locale: ptBR })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>

          {/* Proposals */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold" style={{ color: "#1A1A1A", fontSize: 18 }}>Propostas</h2>
            </div>
            {proposals.length === 0 ? (
              <p className="text-center py-8" style={{ color: "#999999", fontSize: 14 }}>Nenhuma proposta vinculada</p>
            ) : (
              <div className="space-y-3">
                {proposals.map(p => (
                  <div key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.03)" }}>
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 flex-shrink-0" style={{ color: "#999" }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#1A1A1A" }}>{p.title}</p>
                        {p.sent_at && <p className="text-xs" style={{ color: "#999" }}>Enviada em {format(new Date(p.sent_at), "dd/MM/yyyy")}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: `${PROPOSAL_STATUS_COLORS[p.status] || "#999"}18`, color: PROPOSAL_STATUS_COLORS[p.status] || "#999" }}>
                        {PROPOSAL_STATUS_LABELS[p.status] || p.status}
                      </span>
                      {p.file_url && <a href={p.file_url} target="_blank" rel="noreferrer" style={{ color: "#C49A00" }}><Globe className="w-4 h-4" /></a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* RIGHT 40% */}
        <div className="lg:col-span-2 space-y-4">
          {/* Dados da oportunidade */}
          <GlassCard>
            <h3 className="font-semibold mb-3" style={{ color: "#1A1A1A", fontSize: 15 }}>Dados da Oportunidade</h3>
            <p className="font-bold mb-3" style={{ color: "#F0C000", fontSize: 26 }}>{fmtValue(opp.estimated_value)}</p>
            {opp.probability != null && (
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1" style={{ color: "#999" }}>
                  <span>Probabilidade</span><span>{opp.probability}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "rgba(0,0,0,0.08)" }}>
                  <div className="h-full rounded-full" style={{ width: `${opp.probability}%`, background: "linear-gradient(90deg,#F0C000,#C49A00)" }} />
                </div>
              </div>
            )}
            <div className="space-y-2 text-sm">
              {opp.opened_at && <div className="flex justify-between"><span style={{ color: "#999" }}>Abertura</span><span style={{ color: "#555" }}>{format(new Date(opp.opened_at), "dd/MM/yyyy")}</span></div>}
              {opp.expected_close_date && <div className="flex justify-between"><span style={{ color: "#999" }}>Previsão</span><span style={{ color: "#555" }}>{format(new Date(opp.expected_close_date), "dd/MM/yyyy")}</span></div>}
              {opp.origin && <div className="flex justify-between"><span style={{ color: "#999" }}>Origem</span><span style={{ color: "#555" }}>{opp.origin}</span></div>}
              {owner && <div className="flex justify-between"><span style={{ color: "#999" }}>Responsável</span><span style={{ color: "#555" }}>{owner.full_name}</span></div>}
            </div>
          </GlassCard>

          {/* Org */}
          {org && (
            <GlassCard>
              <h3 className="font-semibold mb-3" style={{ color: "#1A1A1A", fontSize: 15 }}>Organização</h3>
              <p className="font-semibold text-sm" style={{ color: "#1A1A1A" }}>{org.name}</p>
              <p className="text-xs mt-0.5" style={{ color: "#999" }}>{[org.type, org.city, org.state].filter(Boolean).join(" · ")}</p>
              {org.website && <a href={org.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs mt-2" style={{ color: "#C49A00" }}><Globe className="w-3.5 h-3.5" />{org.website}</a>}
              {org.phone && <p className="flex items-center gap-1.5 text-xs mt-1" style={{ color: "#555" }}><PhoneIcon className="w-3.5 h-3.5" style={{ color: "#999" }} />{org.phone}</p>}
            </GlassCard>
          )}

          {/* Contact */}
          {contact && (
            <GlassCard>
              <h3 className="font-semibold mb-3" style={{ color: "#1A1A1A", fontSize: 15 }}>Contato Principal</h3>
              <p className="font-semibold text-sm" style={{ color: "#1A1A1A" }}>{contact.name}</p>
              {contact.role_title && <p className="text-xs" style={{ color: "#999" }}>{contact.role_title}</p>}
              <div className="space-y-1.5 mt-2">
                {contact.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-xs" style={{ color: "#555" }}><MailIcon className="w-3.5 h-3.5" style={{ color: "#999" }} />{contact.email}</a>}
                {contact.phone && <p className="flex items-center gap-1.5 text-xs" style={{ color: "#555" }}><PhoneIcon className="w-3.5 h-3.5" style={{ color: "#999" }} />{contact.phone}</p>}
                {contact.whatsapp && <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs" style={{ color: "#22C55E" }}><MessageCircle className="w-3.5 h-3.5" />{contact.whatsapp}</a>}
              </div>
            </GlassCard>
          )}

          {/* Próximos passos */}
          <GlassCard>
            <h3 className="font-semibold mb-3" style={{ color: "#1A1A1A", fontSize: 15 }}>Próximos Passos</h3>
            <div className="space-y-3">
              <input value={followup.text} onChange={e => setFollowup(p => ({ ...p, text: e.target.value }))}
                placeholder="Próxima ação..."
                className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.10)", color: "#1A1A1A", fontFamily: "Inter, sans-serif" }} />
              <input type="datetime-local" value={followup.datetime} onChange={e => setFollowup(p => ({ ...p, datetime: e.target.value }))}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.10)", color: "#1A1A1A", fontFamily: "Inter, sans-serif" }} />
              <button onClick={saveFollowup} disabled={savingFollowup || !followup.text.trim()}
                className="w-full py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)", color: "#1A1A1A", opacity: (savingFollowup || !followup.text.trim()) ? 0.6 : 1 }}>
                {savingFollowup ? "Salvando..." : "Salvar follow-up"}
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      {editModal && <OpportunityModal opportunity={opp} onClose={() => setEditModal(false)} onSaved={load} />}
      {actModal && <ActivityModal opportunityId={id} organizationId={opp.organization_id} onClose={() => setActModal(false)} onSaved={load} />}
    </div>
  );
}