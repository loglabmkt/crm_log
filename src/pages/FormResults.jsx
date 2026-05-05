import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import { ArrowLeft, Download, FileText, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_MAP = {
  rascunho: { label: "Rascunho", color: "#6B7280" },
  ativo: { label: "Ativo", color: "#22C55E" },
  encerrado: { label: "Encerrado", color: "#EF4444" },
};

const PAGE_SIZE = 25;

function KpiCard({ label, value, IconComponent, iconColor, loading }) {
  return (
    <GlassCard>
      <div className="flex items-start justify-between">
        <div>
          <p className="uppercase font-medium tracking-widest" style={{ color: "#999", fontSize: 11 }}>{label}</p>
          <div className="mt-2">
            {loading
              ? <div className="h-8 w-12 rounded animate-pulse" style={{ background: "rgba(240,192,0,0.10)" }} />
              : <p className="font-bold" style={{ color: "#1A1A1A", fontSize: 32 }}>{value}</p>}
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

export default function FormResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    const [formList, subs] = await Promise.all([
      base44.entities.FormBuilder.filter({ id }),
      base44.entities.FormSubmission.filter({ form_id: id }),
    ]);
    setForm(formList[0] || null);
    setSubmissions(subs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const exportCSV = () => {
    if (!form || submissions.length === 0) return;
    const fields = form.fields || [];
    const headers = [...fields.map(f => f.label), "Data", "Contato Criado"];
    const rows = submissions.map(s => [
      ...fields.map(f => {
        const val = s.data?.[f.id] ?? "";
        return Array.isArray(val) ? val.join(", ") : val;
      }),
      s.created_date ? format(new Date(s.created_date), "dd/MM/yyyy HH:mm") : "",
      s.status_criado ? "Sim" : "Não",
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `respostas-${form.slug || form.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const today = new Date().toDateString();
  const kpis = {
    total: submissions.length,
    hoje: submissions.filter(s => s.created_date && new Date(s.created_date).toDateString() === today).length,
    criados: submissions.filter(s => s.status_criado).length,
  };

  const fields = form?.fields || [];
  const totalPages = Math.max(1, Math.ceil(submissions.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = submissions.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const cfg = form ? (STATUS_MAP[form.status] || STATUS_MAP.rascunho) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "rgba(240,192,0,0.2)", borderTopColor: "#F0C000" }} />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <button onClick={() => navigate("/forms")}
          className="flex items-center gap-1.5 text-sm font-medium mt-1 flex-shrink-0" style={{ color: "#999" }}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-bold" style={{ color: "#1A1A1A", fontSize: 24 }}>{form?.title}</h1>
            {cfg && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ background: `${cfg.color}18`, color: cfg.color }}>{cfg.label}</span>
            )}
          </div>
        </div>
        <button onClick={exportCSV} disabled={submissions.length === 0}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(255,255,255,0.90)", color: "#555", opacity: submissions.length === 0 ? 0.5 : 1 }}>
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Total de Respostas" value={kpis.total} IconComponent={FileText} iconColor="#F0C000" loading={loading} />
        <KpiCard label="Respostas Hoje" value={kpis.hoje} IconComponent={FileText} iconColor="#3B82F6" loading={loading} />
        <KpiCard label="Contatos Criados" value={kpis.criados} IconComponent={CheckCircle2} iconColor="#22C55E" loading={loading} />
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.90)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ background: "#1A1A1A" }}>
                {fields.map(f => (
                  <th key={f.id} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap"
                    style={{ color: "rgba(255,255,255,0.80)" }}>{f.label}</th>
                ))}
                <th className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap"
                  style={{ color: "rgba(255,255,255,0.80)" }}>Data</th>
                <th className="text-center px-4 py-3 text-xs font-semibold whitespace-nowrap"
                  style={{ color: "rgba(255,255,255,0.80)" }}>Contato Criado</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={fields.length + 2} className="py-16 text-center">
                    <FileText className="w-10 h-10 mx-auto mb-2" style={{ color: "#DDD" }} />
                    <p className="text-sm" style={{ color: "#999" }}>Nenhuma resposta ainda</p>
                  </td>
                </tr>
              ) : paginated.map((s, idx) => (
                <tr key={s.id}
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", background: idx % 2 === 0 ? "transparent" : "rgba(0,0,0,0.015)" }}>
                  {fields.map(f => {
                    const val = s.data?.[f.id] ?? "—";
                    return (
                      <td key={f.id} className="px-4 py-3 text-sm" style={{ color: "#555" }}>
                        {Array.isArray(val) ? val.join(", ") : String(val)}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: "#999" }}>
                    {s.created_date ? format(new Date(s.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.status_criado
                      ? <CheckCircle2 className="w-4 h-4 mx-auto" style={{ color: "#22C55E" }} />
                      : <span style={{ color: "#DDD" }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {submissions.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
              className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-xl"
              style={{ color: safePage === 1 ? "#CCC" : "#555", background: "rgba(0,0,0,0.04)" }}>
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <span className="text-sm" style={{ color: "#999" }}>{safePage} de {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
              className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-xl"
              style={{ color: safePage === totalPages ? "#CCC" : "#555", background: "rgba(0,0,0,0.04)" }}>
              Próxima <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}