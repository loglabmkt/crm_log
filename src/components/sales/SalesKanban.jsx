import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import OpportunityCard from "./OpportunityCard";
import { Plus } from "lucide-react";

const STAGES = [
  { key: "prospeccao", label: "Prospecção", color: "#6B7280" },
  { key: "qualificacao", label: "Qualificação", color: "#3B82F6" },
  { key: "proposta", label: "Proposta", color: "#8B5CF6" },
  { key: "negociacao", label: "Negociação", color: "#F59E0B" },
  { key: "licitacao", label: "Licitação", color: "#F0C000" },
  { key: "fechado_ganho", label: "Fechado ✓", color: "#22C55E" },
  { key: "fechado_perdido", label: "Perdido ✗", color: "#EF4444" },
];

function fmtValue(v) {
  if (!v) return null;
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`;
  return `R$ ${v}`;
}

function DraggableCard({ id, children }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={{ opacity: isDragging ? 0.3 : 1 }}>
      {children}
    </div>
  );
}

function DroppableColumn({ stageKey, children, isOver }) {
  const { setNodeRef } = useDroppable({ id: stageKey });
  return (
    <div ref={setNodeRef} className="flex-1 min-h-[200px] rounded-xl transition-colors"
      style={{ background: isOver ? "rgba(240,192,0,0.06)" : "transparent", outline: isOver ? "2px dashed rgba(240,192,0,0.40)" : "none" }}>
      {children}
    </div>
  );
}

export default function SalesKanban({ onNewOpportunity, filters }) {
  const [opps, setOpps] = useState([]);
  const [orgsMap, setOrgsMap] = useState({});
  const [usersMap, setUsersMap] = useState({});
  const [activities, setActivities] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const load = useCallback(async () => {
    setLoading(true);
    const [oppsList, orgsList, usersList, actsList] = await Promise.all([
      base44.entities.Opportunity.list(),
      base44.entities.Organization.list(),
      base44.entities.User.list(),
      base44.entities.Activity.list(),
    ]);
    const om = {}; orgsList.forEach(o => { om[o.id] = o; });
    const um = {}; usersList.forEach(u => { um[u.id] = u; });
    setOrgsMap(om);
    setUsersMap(um);
    setActivities(actsList);
    setOpps(oppsList);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredOpps = opps.filter(o => {
    if (!filters) return true;
    if (filters.search) {
      const org = orgsMap[o.organization_id];
      if (!org?.name?.toLowerCase().includes(filters.search.toLowerCase()) &&
          !o.title?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    }
    if (filters.stages?.length && !filters.stages.includes(o.stage)) return false;
    if (filters.owner_id && o.owner_id !== filters.owner_id) return false;
    if (filters.regions?.length) {
      const org = orgsMap[o.organization_id];
      if (!org || !filters.regions.includes(org.region)) return false;
    }
    if (filters.org_types?.length) {
      const org = orgsMap[o.organization_id];
      if (!org || !filters.org_types.includes(org.type)) return false;
    }
    return true;
  });

  const handleDragStart = ({ active }) => setActiveId(active.id);
  const handleDragOver = ({ over }) => setOverId(over?.id || null);
  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null);
    setOverId(null);
    if (!over) return;
    const newStage = over.id;
    const opp = opps.find(o => o.id === active.id);
    if (!opp || opp.stage === newStage) return;
    setOpps(prev => prev.map(o => o.id === active.id ? { ...o, stage: newStage } : o));
    await base44.entities.Opportunity.update(active.id, { stage: newStage });
  };

  const activeOpp = activeId ? opps.find(o => o.id === activeId) : null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: STAGES.length * 296 + "px" }}>
          {STAGES.map((stage) => {
            const colOpps = filteredOpps.filter(o => o.stage === stage.key);
            const total = colOpps.reduce((s, o) => s + (o.estimated_value || 0), 0);
            return (
              <div key={stage.key} style={{ width: 280, flexShrink: 0 }}>
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: stage.color }} />
                  <span className="text-sm font-semibold truncate" style={{ color: stage.key === "fechado_ganho" ? "#22C55E" : stage.key === "fechado_perdido" ? "#EF4444" : "#1A1A1A" }}>{stage.label}</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold ml-auto flex-shrink-0" style={{ background: "rgba(240,192,0,0.12)", color: "#C49A00" }}>{colOpps.length}</span>
                </div>
                {total > 0 && <p className="text-xs mb-2 px-1" style={{ color: "#999999" }}>{fmtValue(total)}</p>}
                <DroppableColumn stageKey={stage.key} isOver={overId === stage.key}>
                  <div className="space-y-2">
                    {colOpps.map(opp => (
                      <DraggableCard key={opp.id} id={opp.id}>
                        <OpportunityCard opportunity={opp} org={orgsMap[opp.organization_id]} owner={usersMap[opp.owner_id]} activities={activities} />
                      </DraggableCard>
                    ))}
                    {/* Empty + add */}
                    <button onClick={() => onNewOpportunity(stage.key)}
                      className="w-full py-3 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors"
                      style={{ border: "2px dashed rgba(0,0,0,0.10)", color: "#999999" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(240,192,0,0.40)"; e.currentTarget.style.color = "#C49A00"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.10)"; e.currentTarget.style.color = "#999999"; }}>
                      <Plus className="w-3.5 h-3.5" /> Adicionar
                    </button>
                  </div>
                </DroppableColumn>
              </div>
            );
          })}
        </div>
      </div>
      <DragOverlay>
        {activeOpp && (
          <div style={{ width: 280, opacity: 0.95 }}>
            <OpportunityCard opportunity={activeOpp} org={orgsMap[activeOpp.organization_id]} owner={usersMap[activeOpp.owner_id]} activities={activities} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}