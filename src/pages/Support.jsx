import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, SlidersHorizontal } from "lucide-react";
import TicketCard from "@/components/support/TicketCard";
import TicketModal from "@/components/support/TicketModal";
import SupportFilterDrawer from "@/components/support/SupportFilterDrawer";

const STATUS_TABS = [
  { key: "all", label: "Todos" },
  { key: "aberto", label: "Aberto" },
  { key: "em_andamento", label: "Em andamento" },
  { key: "aguardando_cliente", label: "Aguardando" },
  { key: "resolvido", label: "Resolvido" },
  { key: "arquivado", label: "Arquivado" },
];
const PRIORITY_ORDER = { critica: 0, alta: 1, media: 2, baixa: 3 };
const EMPTY_FILTERS = { priorities: [], types: [], owner_id: "", organization_id: "" };

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [orgsMap, setOrgsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState("all");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const [tList, oList] = await Promise.all([
      base44.entities.Ticket.list(),
      base44.entities.Organization.list(),
    ]);
    const sorted = tList.sort((a, b) => {
      const pd = (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99);
      if (pd !== 0) return pd;
      return new Date(b.created_date) - new Date(a.created_date);
    });
    setTickets(sorted);
    const om = {}; oList.forEach(o => { om[o.id] = o; });
    setOrgsMap(om);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const getCounts = () => {
    const counts = {};
    STATUS_TABS.forEach(t => {
      counts[t.key] = t.key === "all" ? tickets.length : tickets.filter(tk => tk.status === t.key).length;
    });
    return counts;
  };
  const counts = getCounts();

  const filtered = tickets.filter(t => {
    if (statusTab !== "all" && t.status !== statusTab) return false;
    if (filters.priorities?.length && !filters.priorities.includes(t.priority)) return false;
    if (filters.types?.length && !filters.types.includes(t.type)) return false;
    if (filters.owner_id && t.assigned_to !== filters.owner_id) return false;
    if (filters.organization_id && t.organization_id !== filters.organization_id) return false;
    return true;
  });

  const activeFiltersCount = [filters.priorities.length, filters.types.length, filters.owner_id ? 1 : 0, filters.organization_id ? 1 : 0].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="font-bold flex-1" style={{ color: "#1A1A1A", fontSize: 28 }}>Atendimento</h1>
        <button onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 h-9 px-3 rounded-xl text-sm font-medium relative"
          style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(255,255,255,0.90)", color: "#555" }}>
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: "#F0C000", color: "#1A1A1A" }}>{activeFiltersCount}</span>
          )}
        </button>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold"
          style={{ background: "linear-gradient(135deg,#F0C000 0%,#C49A00 100%)", color: "#1A1A1A", boxShadow: "0 2px 8px rgba(240,192,0,0.30)" }}>
          <Plus className="w-4 h-4" /> Novo Ticket
        </button>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_TABS.map(tab => {
          const active = statusTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setStatusTab(tab.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{ background: active ? "linear-gradient(135deg,#F0C000 0%,#C49A00 100%)" : "rgba(255,255,255,0.70)", color: active ? "#1A1A1A" : "#555555", border: active ? "none" : "1px solid rgba(255,255,255,0.90)", boxShadow: active ? "0 2px 8px rgba(240,192,0,0.25)" : "0 1px 4px rgba(0,0,0,0.04)" }}>
              {tab.label}
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: active ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.06)", color: active ? "#1A1A1A" : "#999" }}>{counts[tab.key]}</span>
            </button>
          );
        })}
      </div>

      {/* Ticket list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "rgba(240,192,0,0.06)" }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <p style={{ color: "#999", fontSize: 14 }}>Nenhum ticket encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket, i) => (
            <TicketCard key={ticket.id} ticket={ticket} org={orgsMap[ticket.organization_id]} index={i} />
          ))}
        </div>
      )}

      <SupportFilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} filters={filters} onApply={setFilters} />
      {modalOpen && <TicketModal onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); load(); }} />}
    </div>
  );
}