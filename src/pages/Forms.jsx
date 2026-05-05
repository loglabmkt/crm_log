import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import QRCodeModal from "@/components/forms/QRCodeModal";
import {
  FileText, Plus, Zap, Inbox, Calendar, MoreVertical,
  Edit2, BarChart2, Link2, QrCode, Copy, PowerOff, Trash2, ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PUBLIC_BASE = window.location.origin;

const STATUS_MAP = {
  rascunho: { label: "Rascunho", color: "#6B7280" },
  ativo: { label: "Ativo", color: "#22C55E" },
  encerrado: { label: "Encerrado", color: "#EF4444" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || STATUS_MAP.rascunho;
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: `${cfg.color}18`, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

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

function FormCard({ form, onRefresh }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const publicUrl = `${PUBLIC_BASE}/f/${form.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setMenuOpen(false);
  };

  const handleDelete = async () => {
    await base44.entities.FormBuilder.delete(form.id);
    setDeleteConfirm(false);
    onRefresh();
  };

  const toggleStatus = async () => {
    const next = form.status === "ativo" ? "encerrado" : "ativo";
    await base44.entities.FormBuilder.update(form.id, { status: next });
    setMenuOpen(false);
    onRefresh();
  };

  const duplicate = async () => {
    const newSlug = `${form.slug || "form"}-copia-${Date.now()}`;
    await base44.entities.FormBuilder.create({
      title: `${form.title} (Cópia)`,
      description: form.description,
      slug: newSlug,
      status: "rascunho",
      fields: form.fields || [],
      landing_page: form.landing_page || {},
      submissions_count: 0,
    });
    setMenuOpen(false);
    onRefresh();
  };

  return (
    <>
      <GlassCard className="flex flex-col gap-3 relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base truncate" style={{ color: "#1A1A1A" }}>{form.title}</h3>
              <StatusBadge status={form.status} />
            </div>
            {form.description && (
              <p className="text-sm mt-1 line-clamp-2" style={{ color: "#555" }}>{form.description}</p>
            )}
          </div>
          <div className="relative flex-shrink-0">
            <button onClick={() => setMenuOpen(v => !v)}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ color: "#999" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 z-30 rounded-xl overflow-hidden w-48"
                style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(240,192,0,0.15)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                {[
                  { label: "Editar formulário", icon: Edit2, action: () => navigate(`/forms/${form.id}/edit`) },
                  { label: "Ver respostas", icon: BarChart2, action: () => navigate(`/forms/${form.id}/results`) },
                  { label: "Copiar link", icon: Link2, action: copyLink },
                  { label: "Ver QR Code", icon: QrCode, action: () => { setQrOpen(true); setMenuOpen(false); } },
                  { label: "Duplicar", icon: Copy, action: duplicate },
                  { label: form.status === "ativo" ? "Encerrar" : "Ativar", icon: PowerOff, action: toggleStatus },
                  { label: "Excluir", icon: Trash2, action: () => { setDeleteConfirm(true); setMenuOpen(false); }, danger: true },
                ].map(({ label, icon: Icon, action, danger }) => (
                  <button key={label} onClick={action}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors"
                    style={{ color: danger ? "#EF4444" : "#333" }}
                    onMouseEnter={e => e.currentTarget.style.background = danger ? "rgba(239,68,68,0.06)" : "rgba(0,0,0,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-4 text-xs" style={{ color: "#999" }}>
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> {form.submissions_count || 0} respostas
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {format(new Date(form.created_date), "dd/MM/yyyy", { locale: ptBR })}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          {form.slug ? (
            <span className="text-xs truncate flex-1 mr-2" style={{ color: "#bbb" }}>{publicUrl}</span>
          ) : (
            <span className="text-xs" style={{ color: "#bbb" }}>Sem link público (rascunho)</span>
          )}
          {form.slug && (
            <button onClick={() => window.open(publicUrl, "_blank")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0"
              style={{ background: "transparent", border: "1px solid rgba(0,0,0,0.12)", color: "#555" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.04)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <ExternalLink className="w-3 h-3" /> Abrir
            </button>
          )}
        </div>
      </GlassCard>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }}>
          <div className="rounded-2xl p-6 w-80 space-y-4"
            style={{ background: "rgba(255,255,255,0.98)", border: "1px solid rgba(240,192,0,0.20)", boxShadow: "0 16px 48px rgba(0,0,0,0.18)" }}>
            <p className="font-semibold" style={{ color: "#1A1A1A" }}>Excluir formulário?</p>
            <p className="text-sm" style={{ color: "#555" }}>"{form.title}" será removido permanentemente.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "rgba(0,0,0,0.06)", color: "#555" }}>Cancelar</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "#EF4444", color: "#fff" }}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {qrOpen && <QRCodeModal form={form} onClose={() => setQrOpen(false)} />}

      {/* Click outside menu */}
      {menuOpen && <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />}
    </>
  );
}

export default function Forms() {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await base44.entities.FormBuilder.list("-created_date");
    setForms(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const kpis = {
    total: forms.length,
    ativos: forms.filter(f => f.status === "ativo").length,
    respostas: forms.reduce((s, f) => s + (f.submissions_count || 0), 0),
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-bold" style={{ color: "#1A1A1A", fontSize: 28 }}>Formulários</h1>
          <p className="mt-1 text-sm" style={{ color: "#555" }}>
            Crie formulários e landing pages para captura de contatos
          </p>
        </div>
        <button onClick={() => navigate("/forms/new")}
          className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)", color: "#1A1A1A", boxShadow: "0 2px 8px rgba(240,192,0,0.30)" }}>
          <Plus className="w-4 h-4" /> Novo Formulário
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Total de Formulários" value={kpis.total} IconComponent={FileText} iconColor="#F0C000" loading={loading} />
        <KpiCard label="Formulários Ativos" value={kpis.ativos} IconComponent={Zap} iconColor="#22C55E" loading={loading} />
        <KpiCard label="Total de Respostas" value={kpis.respostas} IconComponent={Inbox} iconColor="#3B82F6" loading={loading} />
      </div>

      {/* List */}
      {!loading && forms.length === 0 ? (
        <GlassCard>
          <div className="flex flex-col items-center py-16 gap-3">
            <FileText className="w-12 h-12" style={{ color: "#DDD" }} />
            <p className="text-sm" style={{ color: "#999" }}>Nenhum formulário criado ainda</p>
            <button onClick={() => navigate("/forms/new")}
              className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold"
              style={{ background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)", color: "#1A1A1A" }}>
              <Plus className="w-4 h-4" /> Criar primeiro formulário
            </button>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
              <GlassCard key={i}>
                <div className="space-y-3">
                  <div className="h-5 w-48 rounded animate-pulse" style={{ background: "rgba(240,192,0,0.08)" }} />
                  <div className="h-3 w-full rounded animate-pulse" style={{ background: "rgba(0,0,0,0.04)" }} />
                </div>
              </GlassCard>
            ))
            : forms.map(f => <FormCard key={f.id} form={f} onRefresh={load} />)
          }
        </div>
      )}
    </div>
  );
}