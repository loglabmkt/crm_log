import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import { Mail, MessageCircle, Smartphone, MoreVertical, Send } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CampaignModal from "./CampaignModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_MAP = {
  rascunho: { label: "Rascunho", color: "#6B7280", bg: "rgba(107,114,128,0.10)" },
  programada: { label: "Programada", color: "#3B82F6", bg: "rgba(59,130,246,0.10)" },
  ativa: { label: "Ativa", color: "#22C55E", bg: "rgba(34,197,94,0.10)" },
  pausada: { label: "Pausada", color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
  finalizada: { label: "Finalizada", color: "#999999", bg: "rgba(153,153,153,0.10)" },
};
const CHANNEL_MAP = {
  email: { icon: Mail, color: "#3B82F6" },
  whatsapp: { icon: MessageCircle, color: "#22C55E" },
  sms: { icon: Smartphone, color: "#8B5CF6" },
};

function pct(num, den) {
  if (!den) return "—";
  return `${Math.round((num / den) * 100)}%`;
}

export default function CampaignsList() {
  const [campaigns, setCampaigns] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCampaign, setEditCampaign] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    setLoading(true);
    const [cList, sList] = await Promise.all([
      base44.entities.Campaign.list("-created_date"),
      base44.entities.Segment.list(),
    ]);
    setCampaigns(cList);
    setSegments(sList);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleDuplicate = async (c) => {
    const { id, created_date, updated_date, ...rest } = c;
    await base44.entities.Campaign.create({ ...rest, name: `${c.name} (cópia)`, status: "rascunho" });
    load();
  };

  const handleArchive = async (c) => {
    await base44.entities.Campaign.update(c.id, { status: "finalizada" });
    load();
  };

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "rgba(240,192,0,0.06)" }} />)}
    </div>
  );

  if (campaigns.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Send className="w-12 h-12" style={{ color: "#CCCCCC" }} />
      <p style={{ color: "#999", fontSize: 14 }}>Nenhuma campanha criada ainda.</p>
    </div>
  );

  return (
    <>
      <div className="space-y-3">
        {campaigns.map(c => {
          const ch = CHANNEL_MAP[c.channel] || CHANNEL_MAP.email;
          const st = STATUS_MAP[c.status] || STATUS_MAP.rascunho;
          const seg = segments.find(s => s.id === c.segment_id);
          const stats = c.stats || {};
          const canEdit = c.status === "rascunho" || c.status === "programada";
          return (
            <GlassCard key={c.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${ch.color}12` }}>
                    <ch.icon className="w-5 h-5" style={{ color: ch.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: "#1A1A1A" }}>{c.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {seg && <span className="text-xs" style={{ color: "#999" }}>Segmento: {seg.name}</span>}
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      {(c.scheduled_at || c.sent_at) && (
                        <span className="text-xs" style={{ color: "#999" }}>
                          {format(new Date(c.scheduled_at || c.sent_at), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                        </span>
                      )}
                    </div>
                    {/* Stats */}
                    <div className="flex gap-4 mt-2">
                      {[
                        { label: "Enviados", value: stats.sent || "—" },
                        { label: "Aberturas", value: pct(stats.opened, stats.sent) },
                        { label: "Respostas", value: pct(stats.replied, stats.sent) },
                        { label: "Oportunidades", value: stats.opportunities_generated ?? "—" },
                      ].map(m => (
                        <div key={m.label}>
                          <p className="text-[10px] uppercase tracking-wider" style={{ color: "#999" }}>{m.label}</p>
                          <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>{m.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 flex-shrink-0" style={{ color: "#999" }}><MoreVertical className="w-4 h-4" /></button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(240,192,0,0.15)" }}>
                    {canEdit && <DropdownMenuItem className="cursor-pointer text-sm" style={{ color: "#555" }} onClick={() => { setEditCampaign(c); setShowModal(true); }}>Editar</DropdownMenuItem>}
                    <DropdownMenuItem className="cursor-pointer text-sm" style={{ color: "#555" }} onClick={() => handleDuplicate(c)}>Duplicar</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-sm" style={{ color: "#EF4444" }} onClick={() => handleArchive(c)}>Arquivar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </GlassCard>
          );
        })}
      </div>
      {showModal && (
        <CampaignModal campaign={editCampaign} onClose={() => { setShowModal(false); setEditCampaign(null); }} onSaved={load} />
      )}
    </>
  );
}