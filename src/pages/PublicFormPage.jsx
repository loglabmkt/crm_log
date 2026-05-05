import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { CheckCircle2 } from "lucide-react";

function FieldInput({ field, value, onChange, error, primaryColor }) {
  const base = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: error ? "1.5px solid #EF4444" : "1px solid rgba(0,0,0,0.12)",
    fontSize: 14,
    outline: "none",
    fontFamily: "Inter, sans-serif",
    background: "#fff",
    color: "#1A1A1A",
    transition: "border-color 0.15s",
  };

  const focusStyle = { border: `1.5px solid ${primaryColor}` };

  const [focused, setFocused] = useState(false);

  const style = { ...base, ...(focused ? focusStyle : {}) };

  if (field.type === "textarea") {
    return (
      <textarea rows={3} value={value || ""} onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder || ""}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ ...style, resize: "vertical", minHeight: 80 }} />
    );
  }

  if (field.type === "select") {
    return (
      <select value={value || ""} onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={style}>
        <option value="">Selecionar...</option>
        {(field.options || []).map((opt, i) => (
          <option key={i} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)}
          style={{ accentColor: primaryColor, width: 16, height: 16 }} />
        <span style={{ fontSize: 14, color: "#555" }}>{field.placeholder || field.label}</span>
      </label>
    );
  }

  const typeMap = { email: "email", phone: "tel", number: "number", text: "text" };

  return (
    <input
      type={typeMap[field.type] || "text"}
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={field.placeholder || ""}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={style}
    />
  );
}

export default function PublicFormPage({ previewData }) {
  const { slug } = useParams();
  const [form, setForm] = useState(previewData?.form || null);
  const [loading, setLoading] = useState(!previewData);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (previewData) return;
    const load = async () => {
      const list = await base44.entities.FormBuilder.filter({ slug });
      setForm(list[0] || null);
      setLoading(false);
    };
    load();
  }, [slug, previewData]);

  const lp = form?.landing_page || {};
  const primaryColor = lp.primary_color || "#F0C000";
  const fields = (form?.fields || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));

  const validate = () => {
    const errs = {};
    fields.forEach(f => {
      if (f.required && !values[f.id] && values[f.id] !== false) {
        errs[f.id] = "Campo obrigatório";
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    // Extract mapped fields
    const mappingExtract = (mapKey) => {
      const f = fields.find(fld => fld.mapping === mapKey);
      return f ? values[f.id] : undefined;
    };

    const municipio = mappingExtract("municipio");
    const uf = mappingExtract("uf");
    const email = mappingExtract("email");
    const telefone = mappingExtract("telefone");
    const nome_contato = mappingExtract("nome");
    const orgao = mappingExtract("orgao");

    let status_criado = false;

    // Create FormSubmission
    const submissionData = {
      form_id: form.id,
      data: values,
      municipio,
      uf,
      email,
      telefone,
      nome_contato,
      status_criado: false,
    };

    // Auto-create ContactPanel if municipio + uf mapped
    if (municipio && uf) {
      await base44.entities.ContactPanel.create({
        municipio,
        uf,
        email: email || undefined,
        telefone: telefone || undefined,
        nome_contato: nome_contato || undefined,
        orgao_secretaria: orgao || undefined,
        status: "lead_email",
      });
      status_criado = true;
    }

    submissionData.status_criado = status_criado;
    await base44.entities.FormSubmission.create(submissionData);

    // Increment count
    await base44.entities.FormBuilder.update(form.id, {
      submissions_count: (form.submissions_count || 0) + 1,
    });

    setSubmitting(false);
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #FAF8F3 0%, #F0EBE0 100%)" }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "rgba(240,192,0,0.2)", borderTopColor: "#F0C000" }} />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #FAF8F3 0%, #F0EBE0 100%)" }}>
        <div className="text-center">
          <p className="text-lg font-semibold" style={{ color: "#555" }}>Formulário não encontrado.</p>
        </div>
      </div>
    );
  }

  const bgStyle = {
    minHeight: "100vh",
    background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}05 100%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 16px",
    fontFamily: "Inter, sans-serif",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: 560,
    background: "rgba(255,255,255,0.90)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.90)",
    boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
    padding: "40px 36px",
  };

  if (form.status === "encerrado") {
    return (
      <div style={bgStyle}>
        <div style={cardStyle}>
          <div className="text-center">
            <p className="font-semibold text-lg" style={{ color: "#555" }}>Este formulário foi encerrado e não aceita mais respostas.</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={bgStyle}>
        <div style={{ ...cardStyle, textAlign: "center" }}>
          <CheckCircle2 className="mx-auto mb-4" style={{ width: 48, height: 48, color: primaryColor }} />
          <h2 className="font-bold mb-3" style={{ fontSize: 22, color: "#1A1A1A" }}>Cadastro realizado com sucesso!</h2>
          <p style={{ color: "#555", fontSize: 15 }}>Obrigado pelo interesse. Entraremos em contato em breve.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={bgStyle}>
      <div style={cardStyle}>
        {lp.show_logo && lp.logo_text && (
          <div className="text-center mb-6">
            <span className="font-bold text-xl" style={{ color: primaryColor }}>{lp.logo_text}</span>
          </div>
        )}

        {lp.headline && (
          <h1 className="text-center font-bold mb-3" style={{ fontSize: 28, color: "#1A1A1A" }}>
            {lp.headline}
          </h1>
        )}
        {lp.subheadline && (
          <p className="text-center mb-8" style={{ fontSize: 15, color: "#555", lineHeight: 1.6 }}>
            {lp.subheadline}
          </p>
        )}

        <div className="space-y-5">
          {fields.map(field => (
            <div key={field.id}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#333", marginBottom: 6 }}>
                {field.label}
                {field.required && <span style={{ color: "#EF4444", marginLeft: 3 }}>*</span>}
              </label>
              <FieldInput
                field={field}
                value={values[field.id]}
                onChange={val => setValues(prev => ({ ...prev, [field.id]: val }))}
                error={!!errors[field.id]}
                primaryColor={primaryColor}
              />
              {errors[field.id] && (
                <p style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors[field.id]}</p>
              )}
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: "100%",
              padding: "13px 20px",
              background: primaryColor,
              color: "#1A1A1A",
              fontWeight: 600,
              fontSize: 15,
              borderRadius: 10,
              border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
              marginTop: 8,
              fontFamily: "Inter, sans-serif",
            }}>
            {submitting ? "Enviando..." : (lp.button_text || "Enviar")}
          </button>
        </div>
      </div>
    </div>
  );
}