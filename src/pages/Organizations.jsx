import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import OrganizationModal from "@/components/organizations/OrganizationModal";
import { Plus, Search, SlidersHorizontal, Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";

const ORG_TYPES = [
  { key: "all", label: "Todos" }, { key: "prefeitura", label: "Prefeitura" }, { key: "secretaria", label: "Secretaria" },
  { key: "autarquia", label: "Autarquia" }, { key: "fundacao", label: "Fundação" },
  { key: "empresa_publica", label: "Empresa Pública" }, { key: "outros", label: "Outros" },
];
const TYPE_LABELS = { prefeitura:"Prefeitura", secretaria:"Secretaria", autarquia:"Autarquia", fundacao:"Fundação", empresa_publica:"Emp. Pública", outros:"Outros" };
const PAGE_SIZE = 20;

export default function Organizations() {
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState([]);
  const [opps, setOpps] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editOrg, setEditOrg] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    const [oList, oppList, tList, uList] = await Promise.all([
      base44.entities.Organization.list(),
      base44.entities.Opportunity.list(),
      base44.entities.Ticket.list(),
      base44.entities.User.list(),
    ]);
    setOrgs(oList);
    setOpps(oppList);
    setTickets(tList);
    const um = {}; uList.forEach(u => { um[u.id] = u; });
    setUsersMap(um);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const activeStages = ["prospeccao","qualificacao","proposta","negociacao","licitacao"];
  const activeTicketStatuses = ["aberto","em_andamento"];

  const getOppCount = (orgId) => opps.filter(o => o.organization_id === orgId && activeStages.includes(o.stage)).length;
  const getTicketCount = (orgId) => tickets.filter(t => t.organization_id === orgId && activeTicketStatuses.includes(t.status)).length;

  const filtered = useMemo(() => {
    let list = orgs;
    if (search) list = list.filter(o => o.name?.toLowerCase().includes(search.toLowerCase()) || o.city?.toLowerCase().includes(search.toLowerCase()));
    if (typeFilter !== "all") list = list.filter(o => o.type === typeFilter);
    list = [...list].sort((a, b) => {
      const va = a[sortKey] || ""; const vb = b[sortKey] || "";
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return list;
  }, [orgs, search, typeFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3" style={{ color:"#F0C000" }} /> : <ChevronDown className="w-3 h-3" style={{ color:"#F0C000" }} />;
  };

  const handleDelete = async (org) => {
    await base44.entities.Organization.delete(org.id);
    setDeleteConfirm(null);
    load();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="font-bold flex-1" style={{ color:"#1A1A1A", fontSize:28 }}>Organizações</h1>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background:"rgba(255,255,255,0.70)", border:"1px solid rgba(255,255,255,0.90)", width:240 }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color:"#999" }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por nome, cidade..."
            className="flex-1 text-sm outline-none bg-transparent" style={{ color:"#1A1A1A", fontFamily:"Inter,sans-serif" }} />
        </div>
        <button onClick={() => { setEditOrg(null); setModalOpen(true); }}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold"
          style={{ background:"linear-gradient(135deg,#F0C000 0%,#C49A00 100%)", color:"#1A1A1A", boxShadow:"0 2px 8px rgba(240,192,0,0.30)" }}>
          <Plus className="w-4 h-4" /> Nova Organização
        </button>
      </div>

      {/* Type filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        {ORG_TYPES.map(t => (
          <button key={t.key} onClick={() => { setTypeFilter(t.key); setPage(1); }}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{ background: typeFilter === t.key ? "linear-gradient(135deg,#F0C000 0%,#C49A00 100%)" : "rgba(255,255,255,0.70)", color: typeFilter === t.key ? "#1A1A1A" : "#555555", border: typeFilter === t.key ? "none" : "1px solid rgba(255,255,255,0.90)", boxShadow: typeFilter === t.key ? "0 2px 8px rgba(240,192,0,0.25)" : "0 1px 4px rgba(0,0,0,0.04)" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Desktop table */}
      {loading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background:"rgba(240,192,0,0.06)" }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color:"#999", fontSize:14 }}>Nenhuma organização encontrada</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-2xl overflow-hidden" style={{ background:"rgba(255,255,255,0.70)", border:"1px solid rgba(255,255,255,0.90)", boxShadow:"0 4px 24px rgba(0,0,0,0.05)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(0,0,0,0.08)" }}>
                  {[["name","Organização"],["type","Tipo"],["city","Estado/Cidade"]].map(([k,l]) => (
                    <th key={k} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none" style={{ color:"#999" }} onClick={() => handleSort(k)}>
                      <span className="flex items-center gap-1">{l}<SortIcon col={k} /></span>
                    </th>
                  ))}
                  {["Responsável","Oportunidades","Tickets","Ações"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color:"#999" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((org, i) => (
                  <tr key={org.id} className="cursor-pointer"
                    style={{ background:i%2===0?"rgba(0,0,0,0.015)":"transparent", transition:"background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(240,192,0,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background=i%2===0?"rgba(0,0,0,0.015)":"transparent"}
                    onClick={() => navigate(`/organizations/${org.id}`)}>
                    <td className="py-3 px-4">
                      <p className="font-semibold" style={{ color:"#1A1A1A" }}>{org.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background:"rgba(240,192,0,0.10)", color:"#8A6E00" }}>{TYPE_LABELS[org.type] || org.type || "—"}</span>
                    </td>
                    <td className="py-3 px-4" style={{ color:"#555" }}>{org.city}{org.state ? `/${org.state}` : ""}</td>
                    <td className="py-3 px-4" style={{ color:"#555" }}>{usersMap[org.owner_id]?.full_name || "—"}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold" style={{ color:"#C49A00" }}>{getOppCount(org.id)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold" style={{ color:"#EF4444" }}>{getTicketCount(org.id)}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditOrg(org); setModalOpen(true); }}
                          className="p-1.5 rounded-lg transition-colors" style={{ color:"#999" }}
                          onMouseEnter={e => e.currentTarget.style.color="#F0C000"}
                          onMouseLeave={e => e.currentTarget.style.color="#999"}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteConfirm(org)}
                          className="p-1.5 rounded-lg transition-colors" style={{ color:"#999" }}
                          onMouseEnter={e => e.currentTarget.style.color="#EF4444"}
                          onMouseLeave={e => e.currentTarget.style.color="#999"}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {paginated.map(org => (
              <GlassCard key={org.id} className="cursor-pointer" onClick={() => navigate(`/organizations/${org.id}`)}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm" style={{ color:"#1A1A1A" }}>{org.name}</p>
                    <p className="text-xs mt-0.5" style={{ color:"#555" }}>{org.city}{org.state ? `/${org.state}` : ""}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs flex-shrink-0" style={{ background:"rgba(240,192,0,0.10)", color:"#8A6E00" }}>{TYPE_LABELS[org.type] || "—"}</span>
                </div>
                {usersMap[org.owner_id] && <p className="text-xs mt-2" style={{ color:"#999" }}>Resp.: {usersMap[org.owner_id].full_name}</p>}
                <div className="flex gap-4 mt-2">
                  <span className="text-xs" style={{ color:"#C49A00" }}>{getOppCount(org.id)} oportunidades ativas</span>
                  <span className="text-xs" style={{ color:"#EF4444" }}>{getTicketCount(org.id)} tickets</span>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
                style={{ background:"rgba(255,255,255,0.70)", border:"1px solid rgba(255,255,255,0.90)", color: page===1?"#ccc":"#555" }}>Anterior</button>
              <span className="text-sm" style={{ color:"#555" }}>Página {page} de {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                className="px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
                style={{ background:"rgba(255,255,255,0.70)", border:"1px solid rgba(255,255,255,0.90)", color: page===totalPages?"#ccc":"#555" }}>Próxima</button>
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <OrganizationModal organization={editOrg} onClose={() => { setModalOpen(false); setEditOrg(null); }} onSaved={() => { setModalOpen(false); setEditOrg(null); load(); }} />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.20)", backdropFilter:"blur(4px)" }}>
          <div className="rounded-2xl p-6 w-96 space-y-4" style={{ background:"rgba(255,255,255,0.97)", border:"1px solid rgba(240,192,0,0.20)", boxShadow:"0 16px 48px rgba(0,0,0,0.16)" }}>
            <p className="font-semibold" style={{ color:"#1A1A1A" }}>Excluir organização?</p>
            <p className="text-sm" style={{ color:"#555" }}>
              Esta organização possui <strong>{getOppCount(deleteConfirm.id)}</strong> oportunidades e <strong>{getTicketCount(deleteConfirm.id)}</strong> tickets vinculados. Deseja continuar?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background:"rgba(0,0,0,0.06)", color:"#555" }}>Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background:"#EF4444", color:"#fff" }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}