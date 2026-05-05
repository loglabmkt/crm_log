import React, { useState, useEffect, useMemo } from "react";
import { Eye, Pencil, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChanceSquares from "./ChanceSquares";
import SituacaoBadge, { ETAPA_LABELS } from "./SituacaoBadge";

function fmtValue(v) {
  if (!v && v !== 0) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}

function fmtNr(nr) {
  if (!nr && nr !== 0) return "—";
  return String(nr).padStart(4, "0");
}

const PAGE_SIZE = 25;

export default function OpportunitiesTable({ opportunities, users, onEdit, onRefresh }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [opportunities]);

  const total = opportunities.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginated = opportunities.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const userMap = useMemo(() => {
    const m = {};
    users.forEach(u => { m[u.id] = u.full_name; });
    return m;
  }, [users]);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Target className="w-10 h-10" style={{ color: "#999999" }} />
        <p className="text-sm font-medium" style={{ color: "#999999" }}>Nenhuma oportunidade encontrada</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr style={{ background: "#1A1A1A" }}>
              {["Nr", "Oportunidade", "Cliente", "Chance", "Situação", "Etapa", "Valor", "Responsável", "Ações"].map((h, i) => (
                <th
                  key={h}
                  className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-left"
                  style={{
                    color: "white",
                    width: h === "Nr" ? 70 : h === "Cliente" ? 180 : h === "Chance" ? 100 : h === "Situação" ? 130 : h === "Etapa" ? 150 : h === "Valor" ? 140 : h === "Responsável" ? 150 : h === "Ações" ? 80 : undefined,
                    textAlign: ["Nr", "Valor", "Ações"].includes(h) ? "center" : "left",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((opp, idx) => (
              <tr
                key={opp.id}
                className="cursor-pointer transition-colors"
                style={{
                  background: idx % 2 === 0 ? "white" : "rgba(0,0,0,0.02)",
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(240,192,0,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "white" : "rgba(0,0,0,0.02)"}
                onClick={() => navigate(`/opportunities/${opp.id}`)}
              >
                {/* Nr */}
                <td className="px-3 py-3 text-center text-xs font-mono" style={{ color: "#555" }}>
                  {fmtNr(opp.nr)}
                </td>

                {/* Oportunidade */}
                <td className="px-3 py-3" style={{ maxWidth: 0 }}>
                  <div className="truncate font-medium" style={{ color: "#1A1A1A" }} title={opp.title}>
                    {opp.title || "—"}
                  </div>
                </td>

                {/* Cliente */}
                <td className="px-3 py-3" style={{ width: 180 }}>
                  <div className="truncate text-sm" style={{ color: "#555" }} title={opp.client_name}>
                    {opp.client_name || "—"}
                  </div>
                </td>

                {/* Chance */}
                <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                  <ChanceSquares value={opp.chance || 0} />
                </td>

                {/* Situação */}
                <td className="px-3 py-3">
                  <SituacaoBadge situacao={opp.situacao} />
                </td>

                {/* Etapa */}
                <td className="px-3 py-3 text-xs" style={{ color: "#555555" }}>
                  {ETAPA_LABELS[opp.etapa] || opp.etapa || "—"}
                </td>

                {/* Valor */}
                <td className="px-3 py-3 text-right font-semibold text-sm" style={{ color: "#1A1A1A" }}>
                  {fmtValue(opp.estimated_value)}
                </td>

                {/* Responsável */}
                <td className="px-3 py-3" style={{ width: 150 }}>
                  <div className="truncate text-sm" style={{ color: "#555" }}>
                    {userMap[opp.owner_id] || opp.owner_id || "—"}
                  </div>
                </td>

                {/* Ações */}
                <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => navigate(`/opportunities/${opp.id}`)}
                      className="transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" style={{ color: "#999" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#F0C000"}
                        onMouseLeave={e => e.currentTarget.style.color = "#999"} />
                    </button>
                    <button
                      onClick={() => onEdit(opp)}
                      className="transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" style={{ color: "#999" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#F0C000"}
                        onMouseLeave={e => e.currentTarget.style.color = "#999"} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4 text-sm" style={{ color: "#555" }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
            style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(0,0,0,0.10)" }}
          >
            ← Anterior
          </button>
          <span>Página {page} de {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
            style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(0,0,0,0.10)" }}
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}