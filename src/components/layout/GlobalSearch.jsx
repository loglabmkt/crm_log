import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Building2, TrendingUp, Headphones, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const ORG_TYPE_LABELS = { prefeitura: "Prefeitura", secretaria: "Secretaria", autarquia: "Autarquia", fundacao: "Fundação", empresa_publica: "Empresa Pública", outros: "Outros" };
const STAGE_LABELS = { prospeccao: "Prospecção", qualificacao: "Qualificação", proposta: "Proposta", negociacao: "Negociação", licitacao: "Licitação", fechado_ganho: "Ganho", fechado_perdido: "Perdido" };
const STATUS_LABELS = { aberto: "Aberto", em_andamento: "Em andamento", aguardando_cliente: "Aguardando", resolvido: "Resolvido", arquivado: "Arquivado" };

function Highlight({ text, term }) {
  if (!term || !text) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <strong style={{ color: "#C49A00" }}>{text.slice(idx, idx + term.length)}</strong>
      {text.slice(idx + term.length)}
    </span>
  );
}

export default function GlobalSearch({ isMobile }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  // Click outside to close (desktop)
  useEffect(() => {
    if (isMobile) return;
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) close(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMobile]);

  // ESC to close
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const close = () => { setOpen(false); setQuery(""); setResults(null); };

  const search = useCallback(async (term) => {
    if (term.length < 2) { setResults(null); return; }
    setLoading(true);
    setError(false);
    const t = term.toLowerCase();
    const [orgs, opps, tickets] = await Promise.all([
      base44.entities.Organization.list(),
      base44.entities.Opportunity.list(),
      base44.entities.Ticket.list(),
    ]);
    const orgMap = {};
    orgs.forEach(o => { orgMap[o.id] = o; });
    const filteredOrgs = orgs.filter(o => o.name?.toLowerCase().includes(t) || o.city?.toLowerCase().includes(t)).slice(0, 4);
    const filteredOpps = opps.filter(o => o.title?.toLowerCase().includes(t)).slice(0, 4);
    const filteredTickets = tickets.filter(tk => tk.title?.toLowerCase().includes(t)).slice(0, 4);
    setResults({ orgs: filteredOrgs, opps: filteredOpps.map(o => ({ ...o, _orgName: orgMap[o.organization_id]?.name })), tickets: filteredTickets.map(tk => ({ ...tk, _orgName: orgMap[tk.organization_id]?.name })) });
    setLoading(false);
  }, []);

  const handleChange = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 400);
  };

  const handleSelect = (path) => { close(); navigate(path); };

  const hasResults = results && (results.orgs.length > 0 || results.opps.length > 0 || results.tickets.length > 0);
  const noResults = results && !hasResults;

  // Mobile fullscreen
  if (isMobile) {
    return (
      <>
        <button onClick={() => setOpen(true)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)", color: "#555" }}>
          <Search className="w-4 h-4" />
        </button>
        {open && (
          <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(255,255,255,0.98)", backdropFilter: "blur(20px)" }}>
            <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#999" }} />
              <input
                autoFocus
                value={query}
                onChange={e => handleChange(e.target.value)}
                placeholder="Buscar organizações, oportunidades, tickets..."
                className="flex-1 outline-none text-sm bg-transparent"
                style={{ color: "#1A1A1A", fontFamily: "Inter" }}
              />
              {loading && <div className="w-4 h-4 border-2 rounded-full animate-spin flex-shrink-0" style={{ borderColor: "rgba(240,192,0,0.2)", borderTopColor: "#F0C000" }} />}
              <button onClick={close} className="text-sm font-medium flex-shrink-0" style={{ color: "#C49A00" }}>Cancelar</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SearchResults results={results} query={query} noResults={noResults} error={error} onSelect={handleSelect} />
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop
  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center transition-all duration-300" style={{ width: open ? 280 : 36 }}>
        {open ? (
          <div className="flex items-center gap-2 h-9 w-full rounded-xl px-3" style={{ background: "rgba(255,255,255,0.80)", border: "1px solid rgba(240,192,0,0.30)" }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#999" }} />
            <input
              ref={inputRef}
              autoFocus
              value={query}
              onChange={e => handleChange(e.target.value)}
              placeholder="Buscar..."
              className="flex-1 outline-none text-sm bg-transparent"
              style={{ color: "#1A1A1A", fontFamily: "Inter" }}
            />
            {loading
              ? <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin flex-shrink-0" style={{ borderColor: "rgba(240,192,0,0.2)", borderTopColor: "#F0C000" }} />
              : <button onClick={close}><X className="w-3.5 h-3.5" style={{ color: "#999" }} /></button>
            }
          </div>
        ) : (
          <button onClick={() => setOpen(true)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors" style={{ background: "rgba(0,0,0,0.04)", color: "#555" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.07)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.04)"}>
            <Search className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && (query.length >= 2) && (
        <div className="absolute top-full mt-2 right-0 z-50" style={{ width: 280, maxHeight: 400, overflowY: "auto", background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(240,192,0,0.15)", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}>
          <SearchResults results={results} query={query} noResults={noResults} error={error} onSelect={handleSelect} />
        </div>
      )}
    </div>
  );
}

function SearchResults({ results, query, noResults, error, onSelect }) {
  if (error) return <div className="p-4 text-sm text-center" style={{ color: "#999" }}>Erro ao buscar. Tente novamente.</div>;
  if (!results && query?.length >= 2) return null;
  if (noResults) return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <Search className="w-8 h-8" style={{ color: "#DDD" }} />
      <p className="text-sm" style={{ color: "#999" }}>Nenhum resultado para "{query}"</p>
    </div>
  );
  if (!results) return null;

  const ORG_TYPE_LABELS_LOCAL = { prefeitura: "Prefeitura", secretaria: "Secretaria", autarquia: "Autarquia", fundacao: "Fundação", empresa_publica: "Empresa Pública", outros: "Outros" };

  return (
    <div>
      {results.orgs.length > 0 && (
        <Section label="Organizações">
          {results.orgs.map(o => (
            <ResultItem key={o.id} icon={<Building2 className="w-4 h-4" style={{ color: "#3B82F6" }} />} iconBg="rgba(59,130,246,0.10)"
              title={<Highlight text={o.name} term={query} />}
              sub={[ORG_TYPE_LABELS_LOCAL[o.type], o.city, o.state].filter(Boolean).join(" · ")}
              onClick={() => onSelect(`/organizations/${o.id}`)} />
          ))}
        </Section>
      )}
      {results.opps.length > 0 && (
        <Section label="Oportunidades">
          {results.opps.map(o => (
            <ResultItem key={o.id} icon={<TrendingUp className="w-4 h-4" style={{ color: "#F0C000" }} />} iconBg="rgba(240,192,0,0.10)"
              title={<Highlight text={o.title} term={query} />}
              sub={[STAGE_LABELS[o.stage], o._orgName].filter(Boolean).join(" · ")}
              onClick={() => onSelect(`/opportunities/${o.id}`)} />
          ))}
        </Section>
      )}
      {results.tickets.length > 0 && (
        <Section label="Tickets">
          {results.tickets.map(t => (
            <ResultItem key={t.id} icon={<Headphones className="w-4 h-4" style={{ color: "#8B5CF6" }} />} iconBg="rgba(139,92,246,0.10)"
              title={<Highlight text={t.title} term={query} />}
              sub={[STATUS_LABELS[t.status], t._orgName].filter(Boolean).join(" · ")}
              onClick={() => onSelect(`/support/${t.id}`)} />
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <div className="px-4 py-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#999" }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

function ResultItem({ icon, iconBg, title, sub, onClick }) {
  return (
    <button onClick={onClick} className="w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors"
      onMouseEnter={e => e.currentTarget.style.background = "rgba(240,192,0,0.08)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>{icon}</div>
      <div className="min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "#1A1A1A" }}>{title}</p>
        {sub && <p className="text-xs truncate" style={{ color: "#999" }}>{sub}</p>}
      </div>
    </button>
  );
}