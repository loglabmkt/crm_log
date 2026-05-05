import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import OpportunityFormModal from "@/components/opportunities/OpportunityFormModal";
import ProposalModal, { PROPOSAL_STATUS_MAP } from "@/components/opportunities/ProposalModal";
import SituacaoBadge, { ETAPA_LABELS } from "@/components/opportunities/SituacaoBadge";
import ChanceSquares from "@/components/opportunities/ChanceSquares";
import { ArrowLeft, Edit2, Clock, FileText, Target, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function fmtValue(v) {
  if (!v && v !== 0) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}

function fmtNr(nr) {
  if (!nr && nr !== 0) return "—";
  return String(nr).padStart(4, "0");
}

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opp, setOpp] = useState(null);
  const [activities, setActivities] = useState([]);
  const [actUsers, setActUsers] = useState({});
  const [usersMap, setUsersMap] = useState({});
  const [orgsMap, setOrgsMap] = useState({});
  const [proposals, setProposals] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [proposalModal, setProposalModal] = useState(null); // null | "new" | proposal
  const [deleteProposal, setDeleteProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [factText, setFactText] = useState("");
  const [savingFact, setSavingFact] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const [list, allUsers, allOrgs, propList] = await Promise.all([
      base44.entities.Opportunity.filter({ id }),
      base44.entities.User.list(),
      base44.entities.Organization.list(),
      base44.entities.Proposal.filter({ opportunity_id: id }),
    ]);

    const oppData = list[0];
    if (!oppData) { setLoading(false); return; }
    setOpp(oppData);

    const um = {};
    allUsers.forEach(u => { um[u.id] = u.full_name; });
    setUsersMap(um);
    setActUsers(um);

    const om = {};
    allOrgs.forEach(o => { om[o.id] = o; });
    setOrgsMap(om);

    setProposals(propList.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));

    const acts = await base44.entities.Activity.filter({ opportunity_id: id });
    setActivities(acts.sort((a, b) =>
      new Date(b.occurred_at || b.created_date) - new Date(a.occurred_at || a.created_date)
    ));

    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const saveFact = async () => {
    if (!factText.trim()) return;
    setSavingFact(true);
    await base44.entities.Activity.create({
      type: "anotacao",
      title: factText.slice(0, 60),
      description: factText,
      occurred_at: new Date().toISOString(),
      opportunity_id: id,
      user_id: currentUser?.id,
    });
    setFactText("");
    setSavingFact(false);
    load();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{ borderColor: "rgba(240,192,0,0.2)", borderTopColor: "#F0C000" }} />
    </div>
  );
  if (!opp) return (
    <div className="py-20 text-center" style={{ color: "#999" }}>
      Oportunidade não encontrada.
    </div>
  );

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-start gap-3 flex-wrap">
        <button onClick={() => navigate("/opportunities")}
          className="flex items-center gap-1.5 text-sm font-medium mt-1" style={{ color: "#999" }}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-bold" style={{ color: "#1A1A1A", fontSize: 24 }}>
              {fmtNr(opp.nr)} — {opp.title}
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <SituacaoBadge situacao={opp.situacao} />
            {opp.etapa && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ background: "rgba(240,192,0,0.12)", color: "#8A6E00", border: "1px solid rgba(240,192,0,0.25)" }}>
                {ETAPA_LABELS[opp.etapa] || opp.etapa}
              </span>
            )}
          </div>
        </div>
        <button onClick={() => setEditModal(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium"
          style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(255,255,255,0.90)", color: "#555" }}>
          <Edit2 className="w-4 h-4" /> Editar
        </button>
      </div>

      {/* Dados da Oportunidade */}
      <GlassCard>
        <h3 className="font-semibold mb-4" style={{ color: "#1A1A1A", fontSize: 16 }}>Dados da Oportunidade</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna Esquerda */}
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs" style={{ color: "#999" }}>Cliente</span>
              <p className="font-semibold mt-0.5" style={{ color: "#1A1A1A" }}>{opp.client_name || "—"}</p>
              {opp.organization_id && orgsMap[opp.organization_id] && (
                <button onClick={() => navigate(`/organizations/${opp.organization_id}`)}
                  className="flex items-center gap-1 text-xs mt-1"
                  style={{ color: "#3B82F6" }}>
                  <ExternalLink className="w-3 h-3" /> Ver organização
                </button>
              )}
            </div>
            <div>
              <span className="text-xs" style={{ color: "#999" }}>Responsável</span>
              <p className="mt-0.5" style={{ color: "#555" }}>{usersMap[opp.owner_id] || opp.owner_id || "—"}</p>
            </div>
            {opp.parceiro && (
              <div>
                <span className="text-xs" style={{ color: "#999" }}>Parceiro</span>
                <p className="mt-0.5" style={{ color: "#555" }}>{opp.parceiro}</p>
              </div>
            )}
            {opp.tipo_negocio && (
              <div>
                <span className="text-xs" style={{ color: "#999" }}>Tipo de Negócio</span>
                <p className="mt-0.5" style={{ color: "#555" }}>{opp.tipo_negocio}</p>
              </div>
            )}
            {opp.nr_contrato_os && (
              <div>
                <span className="text-xs" style={{ color: "#999" }}>Nº Contrato/OS</span>
                <p className="mt-0.5" style={{ color: "#555" }}>{opp.nr_contrato_os}</p>
              </div>
            )}
          </div>

          {/* Coluna Direita */}
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs" style={{ color: "#999" }}>Valor</span>
              <p className="font-bold mt-0.5" style={{ color: "#F0C000", fontSize: 22 }}>
                {fmtValue(opp.estimated_value)}
              </p>
            </div>
            <div>
              <span className="text-xs" style={{ color: "#999" }}>Chance</span>
              <div className="mt-1.5">
                <ChanceSquares value={opp.chance || 0} size={16} gap={4} />
              </div>
            </div>
            {opp.funil && (
              <div>
                <span className="text-xs" style={{ color: "#999" }}>Funil</span>
                <p className="mt-0.5" style={{ color: "#555" }}>{opp.funil}</p>
              </div>
            )}
            <div>
              <span className="text-xs" style={{ color: "#999" }}>Data de criação</span>
              <p className="mt-0.5" style={{ color: "#555" }}>
                {opp.created_date ? format(new Date(opp.created_date), "dd/MM/yyyy", { locale: ptBR }) : "—"}
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Propostas */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" style={{ color: "#F0C000" }} />
            <h3 className="font-semibold" style={{ color: "#1A1A1A", fontSize: 15 }}>Propostas</h3>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: "rgba(240,192,0,0.12)", color: "#C49A00" }}>
              {proposals.length}
            </span>
          </div>
          <button onClick={() => setProposalModal("new")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium"
            style={{ background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)", color: "#1A1A1A" }}>
            <Plus className="w-3.5 h-3.5" /> Adicionar
          </button>
        </div>

        {proposals.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: "#999" }}>Nenhuma proposta cadastrada</p>
        ) : (
          <div className="space-y-2">
            {proposals.map(p => {
              const sit = PROPOSAL_STATUS_MAP[p.status];
              return (
                <div key={p.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl"
                  style={{ background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium truncate" style={{ color: "#1A1A1A" }}>{p.title}</span>
                      {sit && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                          style={{ background: `${sit.color}18`, color: sit.color }}>
                          {sit.label}
                        </span>
                      )}
                    </div>
                    {p.sent_at && (
                      <p className="text-xs mt-0.5" style={{ color: "#999" }}>
                        Enviada em {format(new Date(p.sent_at), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {p.file_url && (
                      <a href={p.file_url} target="_blank" rel="noreferrer"
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ color: "#3B82F6" }}
                        title="Abrir documento">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button onClick={() => setProposalModal(p)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ color: "#999" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#C49A00"}
                      onMouseLeave={e => e.currentTarget.style.color = "#999"}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteProposal(p)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ color: "#999" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#EF4444"}
                      onMouseLeave={e => e.currentTarget.style.color = "#999"}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Ata / Anotações */}
      {opp.ata_anotacoes && (
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4" style={{ color: "#F0C000" }} />
            <h3 className="font-semibold" style={{ color: "#1A1A1A", fontSize: 15 }}>Ata / Anotações</h3>
          </div>
          <p className="text-sm whitespace-pre-wrap" style={{ color: "#555", lineHeight: 1.6 }}>
            {opp.ata_anotacoes}
          </p>
        </GlassCard>
      )}

      {/* Timeline de Fatos */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-5">
          <Clock className="w-4 h-4" style={{ color: "#F0C000" }} />
          <h3 className="font-semibold flex-1" style={{ color: "#1A1A1A", fontSize: 15 }}>
            Timeline de Fatos
          </h3>
          <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.05)", color: "#999" }}>
            {activities.length} eventos
          </span>
        </div>

        {/* Campo de registro */}
        <div className="mb-6 p-4 rounded-xl" style={{ background: "rgba(240,192,0,0.04)", border: "1px solid rgba(240,192,0,0.15)" }}>
          <label className="block text-xs font-medium mb-2" style={{ color: "#555" }}>O que aconteceu hoje?</label>
          <textarea
            rows={3}
            value={factText}
            onChange={e => setFactText(e.target.value)}
            placeholder="Ex: Cliente solicitou ajuste no prazo..."
            className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none"
            style={{ background: "rgba(255,255,255,0.80)", border: "1px solid rgba(0,0,0,0.10)", color: "#1A1A1A", fontFamily: "Inter, sans-serif" }}
          />
          <button
            onClick={saveFact}
            disabled={savingFact || !factText.trim()}
            className="w-full mt-2 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)",
              color: "#1A1A1A",
              opacity: (savingFact || !factText.trim()) ? 0.6 : 1,
            }}>
            {savingFact ? "Registrando..." : "Registrar Fato"}
          </button>
        </div>

        {/* Histórico */}
        {activities.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-2">
            <Clock className="w-8 h-8" style={{ color: "#ddd" }} />
            <p className="text-sm" style={{ color: "#999" }}>Nenhum evento registrado ainda</p>
          </div>
        ) : (
          <div className="relative pl-6" style={{ borderLeft: "2px solid rgba(240,192,0,0.25)" }}>
            {activities.map((act, idx) => (
              <div key={act.id} className={`relative ${idx < activities.length - 1 ? "mb-5" : ""}`}>
                <div className="absolute -left-8 top-0 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(240,192,0,0.15)", border: "2px solid #F0C000" }}>
                  <Clock className="w-2.5 h-2.5" style={{ color: "#F0C000" }} />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    {actUsers[act.user_id] && (
                      <span className="text-xs font-medium" style={{ color: "#C49A00" }}>
                        {actUsers[act.user_id]}
                      </span>
                    )}
                    <p className="text-sm mt-0.5" style={{ color: "#1A1A1A", lineHeight: 1.5 }}>
                      {act.description || act.title}
                    </p>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: "#999" }}>
                    {act.occurred_at
                      ? format(new Date(act.occurred_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                      : format(new Date(act.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {editModal && (
        <OpportunityFormModal
          opportunity={opp}
          onClose={() => setEditModal(false)}
          onSaved={load}
        />
      )}

      {proposalModal && (
        <ProposalModal
          proposal={proposalModal === "new" ? null : proposalModal}
          opportunityId={id}
          onClose={() => setProposalModal(null)}
          onSaved={() => { setProposalModal(null); load(); }}
        />
      )}

      {deleteProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }}>
          <div className="rounded-2xl p-6 w-80 space-y-4"
            style={{ background: "rgba(255,255,255,0.98)", border: "1px solid rgba(240,192,0,0.20)", boxShadow: "0 16px 48px rgba(0,0,0,0.18)" }}>
            <p className="font-semibold" style={{ color: "#1A1A1A" }}>Excluir proposta?</p>
            <p className="text-sm" style={{ color: "#555" }}>"{deleteProposal.title}" será removida permanentemente.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteProposal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "rgba(0,0,0,0.06)", color: "#555" }}>Cancelar</button>
              <button onClick={async () => {
                await base44.entities.Proposal.delete(deleteProposal.id);
                setDeleteProposal(null);
                load();
              }} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "#EF4444", color: "#fff" }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}