import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import OrganizationModal from "@/components/organizations/OrganizationModal";
import ContactModal from "@/components/organizations/ContactModal";
import OpportunityModal from "@/components/sales/OpportunityModal";
import TicketModal from "@/components/support/TicketModal";
import { ArrowLeft, Edit2, Plus, Mail, Phone, MessageCircle, ExternalLink, Users, Trash2, Activity, Target, Ticket, Pencil } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const TYPE_COLORS = { prefeitura:"#3B82F6", secretaria:"#8B5CF6", autarquia:"#F59E0B", fundacao:"#22C55E", empresa_publica:"#F0C000", outros:"#6B7280" };
const TYPE_LABELS = { prefeitura:"Prefeitura", secretaria:"Secretaria", autarquia:"Autarquia", fundacao:"Fundação", empresa_publica:"Empresa Pública", outros:"Outros" };
const STAGE_COLORS = { prospeccao:"#6B7280", qualificacao:"#3B82F6", proposta:"#8B5CF6", negociacao:"#F59E0B", licitacao:"#F0C000", fechado_ganho:"#22C55E", fechado_perdido:"#EF4444" };
const STAGE_LABELS = { prospeccao:"Prospecção", qualificacao:"Qualificação", proposta:"Proposta", negociacao:"Negociação", licitacao:"Licitação", fechado_ganho:"Ganho", fechado_perdido:"Perdido" };
const STATUS_MAP = { aberto:{ label:"Aberto", color:"#EF4444" }, em_andamento:{ label:"Em andamento", color:"#F0C000" }, aguardando_cliente:{ label:"Aguardando", color:"#F59E0B" }, resolvido:{ label:"Resolvido", color:"#22C55E" }, arquivado:{ label:"Arquivado", color:"#999" } };
const PRIORITY_MAP = { critica:{ label:"Crítica", color:"#EF4444" }, alta:{ label:"Alta", color:"#D97706" }, media:{ label:"Média", color:"#3B82F6" }, baixa:{ label:"Baixa", color:"#22C55E" } };
const ACT_COLORS = { ligacao:"#3B82F6", email:"#22C55E", reuniao:"#8B5CF6", anotacao:"#F59E0B", whatsapp:"#22C55E", visita:"#EF4444", outro:"#999" };

function fmt(v) { if (!v) return null; if (v>=1_000_000) return `R$ ${(v/1_000_000).toFixed(1)}M`; if (v>=1_000) return `R$ ${(v/1_000).toFixed(0)}K`; return `R$ ${v}`; }

export default function OrganizationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [opps, setOpps] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [editOrgModal, setEditOrgModal] = useState(false);
  const [newOppModal, setNewOppModal] = useState(false);
  const [newTicketModal, setNewTicketModal] = useState(false);
  const [contactModal, setContactModal] = useState(null); // null | "new" | contact object
  const [deleteContact, setDeleteContact] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [orgList, oppList, tList, actList, cList, uList] = await Promise.all([
      base44.entities.Organization.filter({ id }),
      base44.entities.Opportunity.filter({ organization_id: id }),
      base44.entities.Ticket.filter({ organization_id: id }),
      base44.entities.Activity.filter({ organization_id: id }),
      base44.entities.Contact.filter({ organization_id: id }),
      base44.entities.User.list(),
    ]);
    setOrg(orgList[0] || null);
    setOpps(oppList.sort((a,b) => new Date(b.updated_date) - new Date(a.updated_date)));
    setTickets(tList.sort((a,b) => new Date(b.created_date) - new Date(a.created_date)));
    setActivities(actList.sort((a,b) => new Date(b.occurred_at||b.created_date) - new Date(a.occurred_at||a.created_date)).slice(0,5));
    setContacts(cList);
    const um = {}; uList.forEach(u => { um[u.id] = u; });
    setUsersMap(um);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleDeleteContact = async (c) => {
    await base44.entities.Contact.delete(c.id);
    setDeleteContact(null);
    load();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor:"rgba(240,192,0,0.2)", borderTopColor:"#F0C000" }} />
    </div>
  );
  if (!org) return <div className="py-20 text-center" style={{ color:"#999" }}>Organização não encontrada.</div>;

  const typeColor = TYPE_COLORS[org.type] || "#6B7280";

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <button onClick={() => navigate("/organizations")} className="flex items-center gap-1.5 text-sm font-medium mt-1 flex-shrink-0" style={{ color:"#999" }}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-bold" style={{ color:"#1A1A1A", fontSize:24 }}>{org.name}</h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background:`${typeColor}15`, color:typeColor }}>
              {TYPE_LABELS[org.type] || org.type}
            </span>
            {!org.is_active && <span className="px-2 py-0.5 rounded-full text-xs" style={{ background:"rgba(0,0,0,0.08)", color:"#999" }}>Inativa</span>}
          </div>
        </div>
        <button onClick={() => setEditOrgModal(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium"
          style={{ background:"rgba(255,255,255,0.70)", border:"1px solid rgba(255,255,255,0.90)", color:"#555" }}>
          <Edit2 className="w-4 h-4" /> Editar
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT 60% */}
        <div className="lg:col-span-3 space-y-5">
          {/* Oportunidades */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" style={{ color:"#F0C000" }} />
                <h2 className="font-semibold" style={{ color:"#1A1A1A", fontSize:16 }}>Oportunidades</h2>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background:"rgba(240,192,0,0.12)", color:"#C49A00" }}>{opps.length}</span>
              </div>
              <button onClick={() => setNewOppModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{ background:"linear-gradient(135deg,#F0C000 0%,#C49A00 100%)", color:"#1A1A1A" }}>
                <Plus className="w-3.5 h-3.5" /> Nova
              </button>
            </div>
            {opps.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color:"#999" }}>Nenhuma oportunidade vinculada</p>
            ) : (
              <div className="space-y-2">
                {opps.map(opp => (
                  <div key={opp.id} className="flex items-center gap-3 py-2 cursor-pointer" onClick={() => navigate(`/sales/${opp.id}`)}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color:"#1A1A1A" }}>{opp.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {opp.expected_close_date && <span className="text-xs" style={{ color:"#999" }}>{format(new Date(opp.expected_close_date),"dd/MM/yyyy")}</span>}
                        {usersMap[opp.owner_id] && <span className="text-xs" style={{ color:"#999" }}>· {usersMap[opp.owner_id].full_name}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {opp.estimated_value && <span className="text-xs font-semibold" style={{ color:"#C49A00" }}>{fmt(opp.estimated_value)}</span>}
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background:`${STAGE_COLORS[opp.stage]}18`, color:STAGE_COLORS[opp.stage] }}>{STAGE_LABELS[opp.stage]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Tickets */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4" style={{ color:"#EF4444" }} />
                <h2 className="font-semibold" style={{ color:"#1A1A1A", fontSize:16 }}>Tickets</h2>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background:"rgba(239,68,68,0.10)", color:"#EF4444" }}>{tickets.length}</span>
              </div>
              <button onClick={() => setNewTicketModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{ background:"linear-gradient(135deg,#F0C000 0%,#C49A00 100%)", color:"#1A1A1A" }}>
                <Plus className="w-3.5 h-3.5" /> Novo
              </button>
            </div>
            {tickets.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color:"#999" }}>Nenhum ticket vinculado</p>
            ) : (
              <div className="space-y-2">
                {tickets.map((t, i) => {
                  const s = STATUS_MAP[t.status] || STATUS_MAP.aberto;
                  const p = PRIORITY_MAP[t.priority] || PRIORITY_MAP.media;
                  return (
                    <div key={t.id} className="flex items-center gap-3 py-2 cursor-pointer" onClick={() => navigate(`/support/${t.id}`)}>
                      <span className="text-xs font-mono" style={{ color:"#999" }}>#{String(i+1).padStart(4,"0")}</span>
                      <p className="text-sm flex-1 truncate" style={{ color:"#1A1A1A" }}>{t.title}</p>
                      <span className="text-xs" style={{ color:p.color }}>{p.label}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background:`${s.color}18`, color:s.color }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>

          {/* Recent activities */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4" style={{ color:"#F0C000" }} />
              <h2 className="font-semibold" style={{ color:"#1A1A1A", fontSize:16 }}>Atividades Recentes</h2>
            </div>
            {activities.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color:"#999" }}>Nenhuma atividade registrada</p>
            ) : (
              <div className="space-y-3">
                {activities.map(act => (
                  <div key={act.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:`${ACT_COLORS[act.type]||"#999"}18` }}>
                      <div className="w-2 h-2 rounded-full" style={{ background:ACT_COLORS[act.type]||"#999" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color:"#1A1A1A" }}>{act.title}</p>
                      {act.occurred_at && <p className="text-xs" style={{ color:"#999" }}>{format(new Date(act.occurred_at),"dd MMM yyyy",{locale:ptBR})}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* RIGHT 40% */}
        <div className="lg:col-span-2 space-y-4">
          {/* Org data */}
          <GlassCard>
            <h3 className="font-semibold mb-3" style={{ color:"#1A1A1A", fontSize:15 }}>Dados da Organização</h3>
            <div className="space-y-2 text-sm">
              {org.city && <div className="flex gap-2"><span style={{ color:"#999", minWidth:80 }}>Cidade</span><span style={{ color:"#555" }}>{org.city}{org.state?`/${org.state}`:""}</span></div>}
              {org.region && <div className="flex gap-2"><span style={{ color:"#999", minWidth:80 }}>Região</span><span style={{ color:"#555",textTransform:"capitalize" }}>{org.region?.replace("_"," ")}</span></div>}
              {org.phone && <div className="flex gap-2"><span style={{ color:"#999", minWidth:80 }}>Telefone</span><span style={{ color:"#555" }}>{org.phone}</span></div>}
              {org.address && <div className="flex gap-2"><span style={{ color:"#999", minWidth:80 }}>Endereço</span><span style={{ color:"#555" }}>{org.address}</span></div>}
              {org.website && (
                <div className="flex gap-2"><span style={{ color:"#999", minWidth:80 }}>Website</span>
                  <a href={org.website.startsWith("http")?org.website:`https://${org.website}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1" style={{ color:"#3B82F6" }}>
                    {org.website} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {usersMap[org.owner_id] && <div className="flex gap-2"><span style={{ color:"#999", minWidth:80 }}>Responsável</span><span style={{ color:"#555" }}>{usersMap[org.owner_id].full_name}</span></div>}
              <div className="flex gap-2"><span style={{ color:"#999", minWidth:80 }}>Cadastro</span><span style={{ color:"#555" }}>{format(new Date(org.created_date),"dd/MM/yyyy")}</span></div>
            </div>
            {org.notes && <p className="text-xs mt-3 pt-3 italic" style={{ color:"#999", borderTop:"1px solid rgba(0,0,0,0.06)" }}>{org.notes}</p>}
          </GlassCard>

          {/* Contacts */}
          <GlassCard>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color:"#F0C000" }} />
                <h3 className="font-semibold" style={{ color:"#1A1A1A", fontSize:15 }}>Contatos</h3>
              </div>
              <button onClick={() => setContactModal("new")}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium"
                style={{ background:"rgba(240,192,0,0.10)", color:"#8A6E00", border:"1px solid rgba(240,192,0,0.20)" }}>
                <Plus className="w-3.5 h-3.5" /> Contato
              </button>
            </div>
            {contacts.length === 0 ? (
              <p className="text-sm py-2 text-center" style={{ color:"#999" }}>Nenhum contato cadastrado</p>
            ) : (
              <div className="space-y-3">
                {contacts.map(c => (
                  <div key={c.id} className="pb-3" style={{ borderBottom:"1px solid rgba(0,0,0,0.06)" }}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold" style={{ color:"#1A1A1A" }}>{c.name}</p>
                          {c.is_primary && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background:"rgba(240,192,0,0.15)", color:"#8A6E00" }}>Principal</span>}
                        </div>
                        {c.role_title && <p className="text-xs" style={{ color:"#999" }}>{c.role_title}</p>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setContactModal(c)} className="p-1 rounded" style={{ color:"#999" }}
                          onMouseEnter={e => e.currentTarget.style.color="#F0C000"}
                          onMouseLeave={e => e.currentTarget.style.color="#999"}><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteContact(c)} className="p-1 rounded" style={{ color:"#999" }}
                          onMouseEnter={e => e.currentTarget.style.color="#EF4444"}
                          onMouseLeave={e => e.currentTarget.style.color="#999"}><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-1.5 flex-wrap">
                      {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-xs" style={{ color:"#3B82F6" }}><Mail className="w-3 h-3" />{c.email}</a>}
                      {c.phone && <span className="flex items-center gap-1 text-xs" style={{ color:"#555" }}><Phone className="w-3 h-3" />{c.phone}</span>}
                      {c.whatsapp && <a href={`https://wa.me/${c.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs" style={{ color:"#22C55E" }}><MessageCircle className="w-3 h-3" />{c.whatsapp}</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Modals */}
      {editOrgModal && <OrganizationModal organization={org} onClose={() => setEditOrgModal(false)} onSaved={() => { setEditOrgModal(false); load(); }} />}
      {newOppModal && <OpportunityModal defaultOrgId={org.id} onClose={() => setNewOppModal(false)} onSaved={() => { setNewOppModal(false); load(); }} />}
      {newTicketModal && <TicketModal defaultOrgId={org.id} onClose={() => setNewTicketModal(false)} onSaved={() => { setNewTicketModal(false); load(); }} />}
      {contactModal && (
        <ContactModal
          contact={contactModal === "new" ? null : contactModal}
          organizationId={id}
          onClose={() => setContactModal(null)}
          onSaved={() => { setContactModal(null); load(); }}
        />
      )}
      {deleteContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.20)", backdropFilter:"blur(4px)" }}>
          <div className="rounded-2xl p-6 w-80 space-y-4" style={{ background:"rgba(255,255,255,0.97)", border:"1px solid rgba(240,192,0,0.20)", boxShadow:"0 16px 48px rgba(0,0,0,0.16)" }}>
            <p className="font-semibold" style={{ color:"#1A1A1A" }}>Excluir contato "{deleteContact.name}"?</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteContact(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background:"rgba(0,0,0,0.06)", color:"#555" }}>Cancelar</button>
              <button onClick={() => handleDeleteContact(deleteContact)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background:"#EF4444", color:"#fff" }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}