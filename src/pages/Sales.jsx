import React, { useState } from "react";
import { Search, SlidersHorizontal, Plus } from "lucide-react";
import SalesKanban from "@/components/sales/SalesKanban";
import SalesFilterDrawer from "@/components/sales/SalesFilterDrawer";
import OpportunityModal from "@/components/sales/OpportunityModal";

const EMPTY_FILTERS = { search: "", stages: [], org_types: [], regions: [], owner_id: "" };

export default function Sales() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultStage, setDefaultStage] = useState("prospeccao");
  const [searchVal, setSearchVal] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [kanbanKey, setKanbanKey] = useState(0);

  const handleNewOpportunity = (stage) => {
    setDefaultStage(stage || "prospeccao");
    setModalOpen(true);
  };

  const activeFiltersCount = [
    filters.stages.length, filters.org_types.length, filters.regions.length, filters.owner_id ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="font-bold flex-1" style={{ color: "#1A1A1A", fontSize: 28 }}>Vendas</h1>

        {/* Search */}
        {searchOpen ? (
          <input autoFocus value={searchVal}
            onChange={e => { setSearchVal(e.target.value); setFilters(f => ({ ...f, search: e.target.value })); }}
            onBlur={() => { if (!searchVal) setSearchOpen(false); }}
            placeholder="Buscar organização..."
            className="h-9 w-48 rounded-xl px-3 text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(240,192,0,0.20)", color: "#1A1A1A", fontFamily: "Inter, sans-serif" }} />
        ) : (
          <button onClick={() => setSearchOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(255,255,255,0.90)", color: "#555555" }}>
            <Search className="w-4 h-4" />
          </button>
        )}

        {/* Filters */}
        <button onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 h-9 px-3 rounded-xl text-sm font-medium transition-colors relative"
          style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(255,255,255,0.90)", color: "#555555" }}>
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
              style={{ background: "#F0C000", color: "#1A1A1A" }}>{activeFiltersCount}</span>
          )}
        </button>

        {/* New */}
        <button onClick={() => handleNewOpportunity("prospeccao")}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold"
          style={{ background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)", color: "#1A1A1A", boxShadow: "0 2px 8px rgba(240,192,0,0.30)" }}>
          <Plus className="w-4 h-4" /> Nova Oportunidade
        </button>
      </div>

      {/* Kanban */}
      <SalesKanban key={kanbanKey} onNewOpportunity={handleNewOpportunity} filters={filters} />

      {/* Drawers & Modals */}
      <SalesFilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} filters={filters} onApply={setFilters} />
      {modalOpen && (
        <OpportunityModal defaultStage={defaultStage} onClose={() => setModalOpen(false)} onSaved={() => setKanbanKey(k => k + 1)} />
      )}
    </div>
  );
}