import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Mail, MessageCircle, Smartphone, ChevronRight, ChevronLeft } from "lucide-react";

const CHANNELS = [
  { key: "email", label: "Email", icon: Mail, color: "#3B82F6" },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "#22C55E" },
  { key: "sms", label: "SMS", icon: Smartphone, color: "#8B5CF6" },
];
const PLACEHOLDERS = ["[Nome]", "[Órgão]", "[Cidade]", "[Responsável]"];
const PLACEHOLDER_EXAMPLES = { "[Nome]": "Sr(a). Gestor(a)", "[Órgão]": "Prefeitura Municipal", "[Cidade]": "São Paulo", "[Responsável]": "João Silva" };

const inputStyle = { background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.10)", color: "#1A1A1A", fontFamily: "Inter,sans-serif", borderRadius: 10, padding: "8px 12px", width: "100%", fontSize: 14, outline: "none" };

function PreviewMessage({ channel, subject, body }) {
  const preview = Object.entries(PLACEHOLDER_EXAMPLES).reduce((t, [k, v]) => t.replaceAll(k, v), body || "");
  if (channel === "email") return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: "rgba(0,0,0,0.10)" }}>
      <div className="px-4 py-2.5 text-xs" style={{ background: "rgba(0,0,0,0.04)", color: "#555", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <strong>Assunto:</strong> {subject || "—"}
      </div>
      <div className="p-4 text-sm" style={{ color: "#1A1A1A", whiteSpace: "pre-wrap", minHeight: 80 }}>{preview || <span style={{ color: "#999" }}>Digite o conteúdo...</span>}</div>
    </div>
  );
  if (channel === "whatsapp") return (
    <div className="flex justify-end p-4 rounded-xl" style={{ background: "#ECE5DD" }}>
      <div className="rounded-2xl rounded-tr-none px-4 py-2.5 max-w-xs text-sm" style={{ background: "#DCF8C6", color: "#1A1A1A", boxShadow: "0 1px 3px rgba(0,0,0,0.12)", whiteSpace: "pre-wrap" }}>
        {preview || <span style={{ color: "#999" }}>Digite o conteúdo...</span>}
      </div>
    </div>
  );
  return (
    <div className="p-4 rounded-xl" style={{ background: "#F5F5F5" }}>
      <div className="rounded-2xl rounded-tl-none px-4 py-2.5 inline-block text-sm" style={{ background: "#E5E5EA", color: "#1A1A1A", whiteSpace: "pre-wrap" }}>
        {preview || <span style={{ color: "#999" }}>Digite o conteúdo...</span>}
      </div>
    </div>
  );
}

export default function CampaignModal({ campaign, defaultSegment, onClose, onSaved }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: campaign?.name || "", segment_id: defaultSegment?.id || campaign?.segment_id || "",
    channel: campaign?.channel || "email", status: campaign?.status || "rascunho",
    scheduled_at: campaign?.scheduled_at || "", subject: campaign?.subject || "",
    body: campaign?.body || "",
    stats: campaign?.stats || { sent: 0, opened: 0, clicked: 0, replied: 0, opportunities_generated: 0 },
  });
  const [segments, setSegments] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => { base44.entities.Segment.list().then(setSegments); }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const insertPlaceholder = (ph) => {
    const ta = textareaRef.current;
    if (!ta) { set("body", (form.body || "") + ph); return; }
    const start = ta.selectionStart, end = ta.selectionEnd;
    const newVal = form.body.slice(0, start) + ph + form.body.slice(end);
    set("body", newVal);
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + ph.length; ta.focus(); }, 0);
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Obrigatório";
    if (!form.segment_id) e.segment_id = "Obrigatório";
    if (!form.channel) e.channel = "Obrigatório";
    if (form.status === "programada" && !form.scheduled_at) e.scheduled_at = "Obrigatório";
    if (form.status === "programada" && form.scheduled_at && new Date(form.scheduled_at) <= new Date()) e.scheduled_at = "Deve ser data futura";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.body.trim()) e.body = "Obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep1()) setStep(2); };

  const handleSave = async () => {
    if (!validateStep2()) return;
    setSaving(true);
    if (campaign?.id) await base44.entities.Campaign.update(campaign.id, form);
    else await base44.entities.Campaign.create(form);
    setSaving(false);
    onSaved();
    onClose();
  };

  const channelInfo = CHANNELS.find(c => c.key === form.channel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.20)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(240,192,0,0.20)", boxShadow: "0 16px 48px rgba(0,0,0,0.16)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>{campaign?.id ? "Editar Campanha" : "Nova Campanha"}</h2>
            <div className="flex items-center gap-1">
              {[1,2].map(s => (
                <div key={s} className="flex items-center gap-1">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: step >= s ? "linear-gradient(135deg,#F0C000,#C49A00)" : "rgba(0,0,0,0.08)", color: step >= s ? "#1A1A1A" : "#999" }}>{s}</div>
                  {s < 2 && <div className="w-8 h-0.5" style={{ background: step > s ? "#F0C000" : "rgba(0,0,0,0.10)" }} />}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: "#999" }} /></button>
        </div>

        <div className="p-6 space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Nome da campanha *</label>
                <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ex: Campanha Prefeituras Nordeste" style={inputStyle} />
                {errors.name && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Segmento-alvo *</label>
                <select value={form.segment_id} onChange={e => set("segment_id", e.target.value)} style={inputStyle}>
                  <option value="">Selecionar segmento...</option>
                  {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {errors.segment_id && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.segment_id}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: "#555" }}>Canal *</label>
                <div className="flex gap-2">
                  {CHANNELS.map(ch => (
                    <button key={ch.key} onClick={() => set("channel", ch.key)}
                      className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all text-sm font-medium"
                      style={{ background: form.channel === ch.key ? `${ch.color}15` : "rgba(0,0,0,0.04)", border: `1px solid ${form.channel === ch.key ? ch.color : "transparent"}`, color: form.channel === ch.key ? ch.color : "#555" }}>
                      <ch.icon className="w-5 h-5" />
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Status inicial</label>
                  <select value={form.status} onChange={e => set("status", e.target.value)} style={inputStyle}>
                    <option value="rascunho">Rascunho</option>
                    <option value="programada">Programada</option>
                  </select>
                </div>
                {form.status === "programada" && (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Data/hora agendada *</label>
                    <input type="datetime-local" value={form.scheduled_at} onChange={e => set("scheduled_at", e.target.value)} style={inputStyle} />
                    {errors.scheduled_at && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.scheduled_at}</p>}
                  </div>
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {form.channel === "email" && (
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Assunto</label>
                  <input value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="Assunto do e-mail" style={inputStyle} />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#555" }}>Mensagem *</label>
                <div className="flex gap-1.5 mb-2 flex-wrap">
                  {PLACEHOLDERS.map(ph => (
                    <button key={ph} onClick={() => insertPlaceholder(ph)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                      style={{ background: "rgba(240,192,0,0.10)", color: "#8A6E00", border: "1px solid rgba(240,192,0,0.20)" }}>{ph}</button>
                  ))}
                </div>
                <textarea ref={textareaRef} rows={5} value={form.body} onChange={e => set("body", e.target.value)}
                  placeholder="Digite sua mensagem aqui..." style={{ ...inputStyle, resize: "vertical" }} />
                {errors.body && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.body}</p>}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#999" }}>Pré-visualização</p>
                <PreviewMessage channel={form.channel} subject={form.subject} body={form.body} />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2 px-6 py-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          {step === 2 && (
            <button onClick={() => setStep(1)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium" style={{ background: "rgba(0,0,0,0.06)", color: "#555" }}>
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
          )}
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium" style={{ background: "rgba(0,0,0,0.06)", color: "#555" }}>Cancelar</button>
          <div className="flex-1" />
          {step === 1 ? (
            <button onClick={handleNext} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "linear-gradient(135deg,#F0C000 0%,#C49A00 100%)", color: "#1A1A1A" }}>
              Próximo <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "linear-gradient(135deg,#F0C000 0%,#C49A00 100%)", color: "#1A1A1A", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Salvando..." : "Salvar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}