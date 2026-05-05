import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import OpportunityFormModal from "@/components/opportunities/OpportunityFormModal";
import SituacaoBadge, { ETAPA_LABELS } from "@/components/opportunities/SituacaoBadge";
import ChanceSquares from "@/components/opportunities/ChanceSquares";
import { ArrowLeft, Edit2, Clock, FileText, Target } from "lucide-react";
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
  const [editModal, setEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [factText, setFactText] = useState("");
  const [savingFact, setSavingFact] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await base44.entities.Opportunity.filter({ id });
    const oppData = list[0];
    if (!oppData) { setLoading(false); return; }
    setOpp(oppData);

    const acts = await base44.entities.Activity.filter({ opportunity_id: id });
    const sorted = acts.sort((a, b) =>
      new Date(b.occurred_at || b.created_date) - new Date(a.occurred_at || a.created_date)
    );
    setActivities(sorted);

    // Resolve user names for activities
    const userIds = [...new Set(acts.map(a => a.user_id).filter(Boolean))];
    if (userIds.length > 0) {
      const allUsers = await base44.entities.User.list();
      const map = {};
      allUsers.forEach(u => { map[u.id] = u.full_name; });
      setActUsers(map);
    }

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
            </div>
            <div>
              <span className="text-xs" style={{ color: "#999" }}>Responsável</span>
              <p className="mt-0.5" style={{ color: "#555" }}>{opp.owner_id || "—"}</p>
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
    </div>
  );
}