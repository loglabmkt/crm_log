import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Target, TrendingUp, CheckCircle2, DollarSign, Plus, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import OpportunitiesTable from "@/components/opportunities/OpportunitiesTable";
import OpportunityFormModal from "@/components/opportunities/OpportunityFormModal";
import ImportOpportunitiesModal from "@/components/opportunities/ImportOpportunitiesModal";
import { SITUACAO_CONFIG } from "@/components/opportunities/SituacaoBadge";

function fmtPipeline(v) {
  if (!v && v !== 0) return "R$ 0";
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(2).replace(".", ",")}M`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`;
  return `R$ ${v.toLocaleString("pt-BR")}`;
}

const SITUACAO_OPTIONS = [
  { key: "", label: "Todas" },
  { key: "em_andamento", label: "Em Andamento" },
  { key: "congelada", label: "Congelada" },
  { key: "desistida", label: "Desistida" },
  { key: "cancelada", label: "Cancelada" },
  { key: "substituida", label: "Substituída" },
  { key: "vendida", label: "Vendida" },
];

const inputStyle = {
  background: "rgba(255,255,255,0.70)",
  border: "1px solid rgba(0,0,0,0.10)",
  color: "#1A1A1A",
  fontFamily: "Inter, sans-serif",
  borderRadius: 12,
  padding: "8px 12px",
  fontSize: 14,
  outline: "none",
};

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [situacaoFilter, setSituacaoFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState(null);
  const [importModal, setImportModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [opps, usrs] = await Promise.all([
      base44.entities.Opportunity.list("-created_date", 500),
      base44.entities.User.list(),
    ]);
    setOpportunities(opps);
    setUsers(usrs);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = useMemo(() => {
    let list = opportunities;
    if (situacaoFilter) list = list.filter(o => o.situacao === situacaoFilter);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(o =>
        String(o.nr || "").includes(q) ||
        (o.client_name || "").toLowerCase().includes(q) ||
        (o.title || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [opportunities, situacaoFilter, debouncedSearch]);

  // KPIs
  const kpis = useMemo(() => {
    const total = opportunities.length;
    const emAndamento = opportunities.filter(o => o.situacao === "em_andamento").length;
    const vendidas = opportunities.filter(o => o.situacao === "vendida").length;
    const pipeline = opportunities
      .filter(o => o.situacao === "em_andamento")
      .reduce((sum, o) => sum + (o.estimated_value || 0), 0);
    return { total, emAndamento, vendidas, pipeline };
  }, [opportunities]);

  const handleEdit = (opp) => {
    setEditingOpp(opp);
    setModalOpen(true);
  };

  const handleNew = () => {
    setEditingOpp(null);
    setModalOpen(true);
  };

  const hasFilters = situacaoFilter || debouncedSearch;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-bold" style={{ color: "#1A1A1A", fontSize: 28 }}>Oportunidades</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard hover={false}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(240,192,0,0.12)" }}>
              <Target className="w-5 h-5" style={{ color: "#F0C000" }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: "#999" }}>Total</p>
              {loading ? (
                <div className="h-6 w-12 rounded animate-pulse mt-0.5" style={{ background: "rgba(0,0,0,0.08)" }} />
              ) : (
                <p className="text-xl font-bold" style={{ color: "#1A1A1A" }}>{kpis.total}</p>
              )}
            </div>
          </div>
        </GlassCard>
        <GlassCard hover={false}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(59,130,246,0.12)" }}>
              <TrendingUp className="w-5 h-5" style={{ color: "#3B82F6" }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: "#999" }}>Em Andamento</p>
              {loading ? (
                <div className="h-6 w-12 rounded animate-pulse mt-0.5" style={{ background: "rgba(0,0,0,0.08)" }} />
              ) : (
                <p className="text-xl font-bold" style={{ color: "#1A1A1A" }}>{kpis.emAndamento}</p>
              )}
            </div>
          </div>
        </GlassCard>
        <GlassCard hover={false}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(34,197,94,0.12)" }}>
              <CheckCircle2 className="w-5 h-5" style={{ color: "#22C55E" }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: "#999" }}>Vendidas</p>
              {loading ? (
                <div className="h-6 w-12 rounded animate-pulse mt-0.5" style={{ background: "rgba(0,0,0,0.08)" }} />
              ) : (
                <p className="text-xl font-bold" style={{ color: "#1A1A1A" }}>{kpis.vendidas}</p>
              )}
            </div>
          </div>
        </GlassCard>
        <GlassCard hover={false}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(240,192,0,0.12)" }}>
              <DollarSign className="w-5 h-5" style={{ color: "#F0C000" }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: "#999" }}>Pipeline</p>
              {loading ? (
                <div className="h-6 w-16 rounded animate-pulse mt-0.5" style={{ background: "rgba(0,0,0,0.08)" }} />
              ) : (
                <p className="text-xl font-bold" style={{ color: "#1A1A1A" }}>{fmtPipeline(kpis.pipeline)}</p>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por Nr, cliente ou título..."
          className="text-sm"
          style={{ ...inputStyle, width: 300 }}
        />
        <select
          value={situacaoFilter}
          onChange={e => setSituacaoFilter(e.target.value)}
          className="text-sm"
          style={inputStyle}
        >
          {SITUACAO_OPTIONS.map(o => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>
        <div className="flex-1" />
        <button
          onClick={() => setImportModal(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium"
          style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(0,0,0,0.10)", color: "#555" }}>
          <Upload className="w-4 h-4" /> Importar CSV
        </button>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold"
          style={{ background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)", color: "#1A1A1A", boxShadow: "0 2px 8px rgba(240,192,0,0.30)" }}>
          <Plus className="w-4 h-4" /> Nova Oportunidade
        </button>
      </div>

      {/* Table */}
      <GlassCard hover={false} className="p-0 overflow-hidden">
        <div className="p-5">
          {loading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: "rgba(0,0,0,0.05)" }} />
              ))}
            </div>
          ) : filtered.length === 0 && hasFilters ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Target className="w-10 h-10" style={{ color: "#999" }} />
              <p className="text-sm" style={{ color: "#999" }}>Nenhum resultado para os filtros aplicados</p>
              <button
                onClick={() => { setSearch(""); setSituacaoFilter(""); }}
                className="px-4 py-2 rounded-xl text-sm font-medium"
                style={{ background: "rgba(240,192,0,0.12)", color: "#8A6E00" }}>
                Limpar filtros
              </button>
            </div>
          ) : (
            <OpportunitiesTable
              opportunities={filtered}
              users={users}
              onEdit={handleEdit}
              onRefresh={load}
            />
          )}
        </div>
      </GlassCard>

      {modalOpen && (
        <OpportunityFormModal
          opportunity={editingOpp}
          onClose={() => { setModalOpen(false); setEditingOpp(null); }}
          onSaved={load}
        />
      )}
      {importModal && (
        <ImportOpportunitiesModal onClose={() => setImportModal(false)} onImported={load} />
      )}
    </div>
  );
}