import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import FieldsList from "@/components/forms/FieldsList";
import LandingPageConfig from "@/components/forms/LandingPageConfig";
import FormPreviewTab from "@/components/forms/FormPreviewTab";
import { ArrowLeft, Save, Zap } from "lucide-react";

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60) + "-" + Date.now().toString(36);
}

const DEFAULT_LANDING = {
  headline: "",
  subheadline: "",
  button_text: "Enviar",
  primary_color: "#F0C000",
  logo_text: "Log Lab",
  show_logo: true,
};

export default function FormEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";

  const [activeTab, setActiveTab] = useState("fields");
  const [title, setTitle] = useState("Novo Formulário");
  const [editingTitle, setEditingTitle] = useState(false);
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([]);
  const [landingPage, setLandingPage] = useState(DEFAULT_LANDING);
  const [status, setStatus] = useState("rascunho");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  const load = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    const list = await base44.entities.FormBuilder.filter({ id });
    const form = list[0];
    if (form) {
      setTitle(form.title);
      setDescription(form.description || "");
      setFields(form.fields || []);
      setLandingPage({ ...DEFAULT_LANDING, ...(form.landing_page || {}) });
      setStatus(form.status);
      setSlug(form.slug || "");
    }
    setLoading(false);
  }, [id, isNew]);

  useEffect(() => { load(); }, [load]);

  const save = async (publish = false) => {
    setSaving(true);
    const newSlug = slug || generateSlug(title);
    const newStatus = publish ? "ativo" : status;
    const payload = {
      title,
      description,
      fields,
      landing_page: landingPage,
      status: newStatus,
      slug: newSlug,
    };
    if (isNew) {
      const created = await base44.entities.FormBuilder.create({ ...payload, submissions_count: 0 });
      setSaving(false);
      navigate(`/forms/${created.id}/edit`, { replace: true });
    } else {
      await base44.entities.FormBuilder.update(id, payload);
      setStatus(newStatus);
      setSlug(newSlug);
      setSaving(false);
    }
  };

  const tabs = ["fields", "landing", "preview"];
  const tabLabels = { fields: "Campos", landing: "Landing Page", preview: "Preview" };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "rgba(240,192,0,0.2)", borderTopColor: "#F0C000" }} />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate("/forms")}
          className="flex items-center gap-1.5 text-sm font-medium flex-shrink-0"
          style={{ color: "#999" }}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        {/* Inline title edit */}
        <div className="flex-1">
          {editingTitle ? (
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={e => { if (e.key === "Enter") setEditingTitle(false); }}
              className="font-bold outline-none bg-transparent border-b-2 w-full"
              style={{ fontSize: 22, color: "#1A1A1A", borderColor: "#F0C000" }}
            />
          ) : (
            <h1 onClick={() => setEditingTitle(true)}
              className="font-bold cursor-text hover:opacity-70 transition-opacity"
              style={{ fontSize: 22, color: "#1A1A1A" }} title="Clique para editar">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => save(false)} disabled={saving}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-medium"
            style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(255,255,255,0.90)", color: "#555", opacity: saving ? 0.7 : 1 }}>
            <Save className="w-4 h-4" /> Salvar Rascunho
          </button>
          <button onClick={() => save(true)} disabled={saving}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-semibold"
            style={{ background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)", color: "#1A1A1A", boxShadow: "0 2px 8px rgba(240,192,0,0.30)", opacity: saving ? 0.7 : 1 }}>
            <Zap className="w-4 h-4" /> Publicar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.90)" }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === tab ? "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)" : "transparent",
              color: activeTab === tab ? "#1A1A1A" : "#555",
              boxShadow: activeTab === tab ? "0 2px 8px rgba(240,192,0,0.30)" : "none",
            }}>
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "fields" && (
        <FieldsList fields={fields} onChange={setFields} />
      )}
      {activeTab === "landing" && (
        <LandingPageConfig config={landingPage} onChange={setLandingPage} />
      )}
      {activeTab === "preview" && (
        <FormPreviewTab fields={fields} landingPage={landingPage} slug={slug} status={status} />
      )}
    </div>
  );
}