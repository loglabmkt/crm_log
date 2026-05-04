import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import { MoreVertical, Users, Layers } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import SegmentModal from "./SegmentModal";
import CampaignModal from "./CampaignModal";

const FILTER_LABEL_MAP = {
  org_types: "Tipo", regions: "Região", states: "Estado", stages: "Stage",
};

function getActiveTags(filters) {
  if (!filters) return [];
  const tags = [];
  Object.entries(filters).forEach(([k, v]) => {
    if (Array.isArray(v) && v.length > 0 && FILTER_LABEL_MAP[k]) {
      tags.push(`${FILTER_LABEL_MAP[k]}: ${v.slice(0, 2).join(", ")}${v.length > 2 ? ` +${v.length - 2}` : ""}`);
    }
  });
  return tags;
}

export default function SegmentsList({ onNewCampaignWithSegment }) {
  const [segments, setSegments] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editSegment, setEditSegment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [campaignSegment, setCampaignSegment] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    const [segs, orgList, contactList] = await Promise.all([
      base44.entities.Segment.list(),
      base44.entities.Organization.list(),
      base44.entities.Contact.list(),
    ]);
    setSegments(segs);
    setOrgs(orgList);
    setContacts(contactList);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const getMatchingOrgs = (seg) => {
    const f = seg.filters || {};
    let filtered = orgs;
    if (f.org_types?.length) filtered = filtered.filter(o => f.org_types.includes(o.type));
    if (f.regions?.length) filtered = filtered.filter(o => f.regions.includes(o.region));
    if (f.states?.length) filtered = filtered.filter(o => f.states.includes(o.state));
    return filtered;
  };

  const handleDelete = async (id) => {
    await base44.entities.Segment.delete(id);
    setDeleteConfirm(null);
    load();
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1,2,3].map(i => <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: "rgba(240,192,0,0.06)" }} />)}
    </div>
  );

  if (segments.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Layers className="w-12 h-12" style={{ color: "#CCCCCC" }} />
      <p className="font-medium" style={{ color: "#555", fontSize: 15 }}>Nenhum segmento criado</p>
      <p style={{ color: "#999", fontSize: 14 }}>Crie o primeiro para segmentar sua base.</p>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map(seg => {
          const matchOrgs = getMatchingOrgs(seg);
          const matchContacts = contacts.filter(c => matchOrgs.some(o => o.id === c.organization_id));
          const tags = getActiveTags(seg.filters);
          return (
            <GlassCard key={seg.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-sm" style={{ color: "#1A1A1A" }}>{seg.name}</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded-lg" style={{ color: "#999" }}><MoreVertical className="w-4 h-4" /></button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(240,192,0,0.15)" }}>
                    <DropdownMenuItem className="cursor-pointer text-sm" style={{ color: "#555" }} onClick={() => { setEditSegment(seg); setShowModal(true); }}>Editar segmento</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-sm" style={{ color: "#555" }} onClick={() => setCampaignSegment(seg)}>Usar em campanha</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-sm" style={{ color: "#EF4444" }} onClick={() => setDeleteConfirm(seg.id)}>Excluir</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {seg.description && <p className="text-sm line-clamp-2" style={{ color: "#555" }}>{seg.description}</p>}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(t => (
                    <span key={t} className="px-2.5 py-0.5 rounded-full text-xs" style={{ background: "rgba(240,192,0,0.10)", color: "#8A6E00", border: "1px solid rgba(240,192,0,0.20)" }}>{t}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-4 pt-2" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <span className="flex items-center gap-1 text-xs" style={{ color: "#999" }}>
                  <Users className="w-3.5 h-3.5" /> {matchOrgs.length} organizações
                </span>
                <span className="text-xs" style={{ color: "#999" }}>{matchContacts.length} contatos</span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {showModal && (
        <SegmentModal segment={editSegment} onClose={() => { setShowModal(false); setEditSegment(null); }} onSaved={load} />
      )}
      {campaignSegment && (
        <CampaignModal defaultSegment={campaignSegment} onClose={() => setCampaignSegment(null)} onSaved={load} />
      )}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.20)", backdropFilter: "blur(4px)" }}>
          <div className="rounded-2xl p-6 w-80 space-y-4" style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(240,192,0,0.20)", boxShadow: "0 16px 48px rgba(0,0,0,0.16)" }}>
            <p className="font-semibold" style={{ color: "#1A1A1A" }}>Excluir segmento?</p>
            <p className="text-sm" style={{ color: "#555" }}>Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ background: "rgba(0,0,0,0.06)", color: "#555" }}>Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ background: "#EF4444", color: "#fff" }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}