import React, { useEffect, useState, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import ContactPanelModal from "@/components/contacts/ContactPanelModal";
import ContactPanelViewModal from "@/components/contacts/ContactPanelViewModal";
import ContactStatusBadge from "@/components/contacts/ContactStatusBadge";
import { MapPin, MessageCircle, CheckCircle2, Target, Plus, Eye, Pencil, Trash2, Users, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { UF_LIST, STATUS_LIST } from "@/lib/ufData";

const PAGE_SIZE = 25;

function fmtPop(n) {
  if (!n && n !== 0) return "—";
  return Number(n).toLocaleString("pt-BR");
}

function KpiCard({ label, value, IconComponent, iconColor, loading }) {
  return (
    <GlassCard>
      <div className="flex items-start justify-between">
        <div>
          <p className="uppercase font-medium tracking-widest" style={{ color: "#999", fontSize: 11 }}>{label}</p>
          <div className="mt-2">
            {loading
              ? <div className="h-8 w-16 rounded-lg animate-pulse" style={{ background: "rgba(240,192,0,0.10)" }} />
              : <p className="font-bold" style={{ color: "#1A1A1A", fontSize: 32 }}>{value}</p>
            }
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${iconColor}18` }}>
          <IconComponent className="w-5 h-5" style={{ color: iconColor }} />
        </div>
      </div>
    </GlassCard>
  );
}

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [searchUF, setSearchUF] = useState("");
  const [searchOrgao, setSearchOrgao] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedOrgao, setDebouncedOrgao] = useState("");

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [viewContact, setViewContact] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debounceSearch = useRef(null);
  const debounceOrgao = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await base44.entities.ContactPanel.list();
    setContacts(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Debounce search
  useEffect(() => {
    clearTimeout(debounceSearch.current);
    debounceSearch.current = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 300);
  }, [search]);

  useEffect(() => {
    clearTimeout(debounceOrgao.current);
    debounceOrgao.current = setTimeout(() => { setDebouncedOrgao(searchOrgao); setPage(1); }, 300);
  }, [searchOrgao]);

  useEffect(() => { setPage(1); }, [searchUF, searchStatus]);

  // KPIs
  const kpis = {
    total: contacts.length,
    emContato: contacts.filter(c => ["em_contato", "reuniao_agendada", "proposta_enviada"].includes(c.status)).length,
    clienteAtivo: contacts.filter(c => c.status === "cliente_ativo").length,
    leads: contacts.filter(c => ["lead_email", "lead_telefone"].includes(c.status)).length,
  };

  // Filter
  const filtered = contacts.filter(c => {
    if (debouncedSearch && !c.municipio?.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
    if (searchUF && c.uf !== searchUF) return false;
    if (debouncedOrgao && !c.orgao_secretaria?.toLowerCase().includes(debouncedOrgao.toLowerCase())) return false;
    if (searchStatus && c.status !== searchStatus) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const anyFilter = search || searchUF || searchOrgao || searchStatus;
  const clearFilters = () => { setSearch(""); setSearchUF(""); setSearchOrgao(""); setSearchStatus(""); setPage(1); };

  const handleDelete = async () => {
    setDeleting(true);
    await base44.entities.ContactPanel.delete(deleteConfirm.id);
    setDeleting(false);
    setDeleteConfirm(null);
    load();
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.70)",
    border: "1px solid rgba(255,255,255,0.90)",
    color: "#1A1A1A",
    borderRadius: 10,
    padding: "8px 12px",
    fontSize: 13,
    outline: "none",
    width: "100%",
    fontFamily: "Inter, sans-serif",
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-bold" style={{ color: "#1A1A1A", fontSize: 28 }}>Painel de Contatos</h1>
          <p className="mt-1 text-sm" style={{ color: "#555" }}>Gerencie seus contatos por município</p>
        </div>
        <button onClick={() => setCreateModal(true)}
          className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)", color: "#1A1A1A", boxShadow: "0 2px 8px rgba(240,192,0,0.30)" }}>
          <Plus className="w-4 h-4" /> Novo Contato
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total de Municípios" value={kpis.total} IconComponent={MapPin} iconColor="#F0C000" loading={loading} />
        <KpiCard label="Em Contato" value={kpis.emContato} IconComponent={MessageCircle} iconColor="#3B82F6" loading={loading} />
        <KpiCard label="Clientes Ativos" value={kpis.clienteAtivo} IconComponent={CheckCircle2} iconColor="#22C55E" loading={loading} />
        <KpiCard label="Leads" value={kpis.leads} IconComponent={Target} iconColor="#F59E0B" loading={loading} />
      </div>

      {/* Filtros */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.90)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <button onClick={() => setFiltersOpen(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium"
          style={{ color: "#555" }}>
          <span>▼ Filtros Avançados {anyFilter && <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "#F0C000", color: "#1A1A1A" }}>ativos</span>}</span>
          {filtersOpen ? <ChevronDown className="w-4 h-4 rotate-180 transition-transform" /> : <ChevronDown className="w-4 h-4 transition-transform" />}
        </button>

        {filtersOpen && (
          <div className="px-5 pb-4" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar cidade..." style={inputStyle} />
              <select value={searchUF} onChange={e => setSearchUF(e.target.value)} style={inputStyle}>
                <option value="">Todos os Estados</option>
                {UF_LIST.map(u => <option key={u.uf} value={u.uf}>{u.label}</option>)}
              </select>
              <input value={searchOrgao} onChange={e => setSearchOrgao(e.target.value)}
                placeholder="Ex: Educação, Saúde..." style={inputStyle} />
              <select value={searchStatus} onChange={e => setSearchStatus(e.target.value)} style={inputStyle}>
                <option value="">Todos os Status</option>
                {STATUS_LIST.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            {anyFilter && (
              <button onClick={clearFilters} className="mt-3 text-xs font-medium" style={{ color: "#999" }}>
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabela */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.90)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#1A1A1A" }}>
                <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "rgba(255,255,255,0.80)" }}>Município / Estado</th>
                <th className="text-right px-4 py-3 text-xs font-semibold" style={{ color: "rgba(255,255,255,0.80)", width: 120 }}>População</th>
                <th className="px-4 py-3 text-xs font-semibold" style={{ color: "rgba(255,255,255,0.80)", width: 140 }}>Pontos de Contato</th>
                <th className="px-4 py-3 text-xs font-semibold" style={{ color: "rgba(255,255,255,0.80)", width: 160 }}>Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-center" style={{ color: "rgba(255,255,255,0.80)", width: 100 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded animate-pulse" style={{ background: "rgba(240,192,0,0.08)", width: j === 0 ? "70%" : "50%" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Users className="w-10 h-10 mx-auto mb-3" style={{ color: "#DDD" }} />
                    <p className="text-sm mb-3" style={{ color: "#999" }}>Nenhum contato cadastrado</p>
                    <button onClick={() => setCreateModal(true)}
                      className="flex items-center gap-1.5 mx-auto h-9 px-4 rounded-xl text-sm font-semibold"
                      style={{ background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)", color: "#1A1A1A" }}>
                      <Plus className="w-4 h-4" /> Cadastrar primeiro contato
                    </button>
                  </td>
                </tr>
              ) : (
                paginated.map((c, idx) => (
                  <tr key={c.id}
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", background: idx % 2 === 0 ? "transparent" : "rgba(0,0,0,0.015)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(240,192,0,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "transparent" : "rgba(0,0,0,0.015)"}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: "#999" }} />
                        <span className="font-medium text-sm" style={{ color: "#1A1A1A" }}>{c.municipio} — {c.uf}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right" style={{ color: "#555" }}>{fmtPop(c.populacao_estimada)}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-fit"
                        style={{ background: "rgba(240,192,0,0.10)", color: "#8A6E00" }}>
                        <Users className="w-3 h-3" />
                        {c.orgao_secretaria ? "1 Órgão" : "0 Órgãos"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ContactStatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setViewContact(c)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                          style={{ color: "#999" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.10)"; e.currentTarget.style.color = "#3B82F6"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#999"; }}>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditContact(c)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                          style={{ color: "#999" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(240,192,0,0.10)"; e.currentTarget.style.color = "#C49A00"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#999"; }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteConfirm(c)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                          style={{ color: "#999" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.10)"; e.currentTarget.style.color = "#EF4444"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#999"; }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
              className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-xl"
              style={{ color: safePage === 1 ? "#CCC" : "#555", background: "rgba(0,0,0,0.04)", cursor: safePage === 1 ? "not-allowed" : "pointer" }}>
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <span className="text-sm" style={{ color: "#999" }}>{safePage} de {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
              className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-xl"
              style={{ color: safePage === totalPages ? "#CCC" : "#555", background: "rgba(0,0,0,0.04)", cursor: safePage === totalPages ? "not-allowed" : "pointer" }}>
              Próxima <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {createModal && (
        <ContactPanelModal onClose={() => setCreateModal(false)} onSaved={() => { setCreateModal(false); load(); }} />
      )}
      {editContact && (
        <ContactPanelModal contact={editContact} onClose={() => setEditContact(null)} onSaved={() => { setEditContact(null); load(); }} />
      )}
      {viewContact && (
        <ContactPanelViewModal
          contact={viewContact}
          onClose={() => setViewContact(null)}
          onEdit={() => { setEditContact(viewContact); setViewContact(null); }}
        />
      )}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }}>
          <div className="rounded-2xl p-6 w-80 space-y-4"
            style={{ background: "rgba(255,255,255,0.98)", border: "1px solid rgba(240,192,0,0.20)", boxShadow: "0 16px 48px rgba(0,0,0,0.18)" }}>
            <p className="font-semibold" style={{ color: "#1A1A1A" }}>Excluir contato?</p>
            <p className="text-sm" style={{ color: "#555" }}>
              "{deleteConfirm.municipio} — {deleteConfirm.uf}" será removido permanentemente.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "rgba(0,0,0,0.06)", color: "#555" }}>
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "#EF4444", color: "#fff", opacity: deleting ? 0.7 : 1 }}>
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}