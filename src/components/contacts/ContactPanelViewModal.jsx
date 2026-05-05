import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Edit2, MapPin, Mail, Phone, Users, FileText, Calendar } from "lucide-react";
import ContactStatusBadge from "./ContactStatusBadge";
import { REGIAO_LABELS } from "@/lib/ufData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function Section({ title, children }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)" }}>
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#999" }}>{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value, href }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 text-sm">
      <span className="flex-shrink-0" style={{ color: "#999", minWidth: 130 }}>{label}</span>
      {href
        ? <a href={href} className="font-medium" style={{ color: "#3B82F6" }}>{value}</a>
        : <span className="font-medium" style={{ color: "#1A1A1A" }}>{value}</span>
      }
    </div>
  );
}

function fmtPop(n) {
  if (!n) return null;
  return Number(n).toLocaleString("pt-BR");
}

export default function ContactPanelViewModal({ contact, onClose, onEdit }) {
  const [createdByName, setCreatedByName] = useState(null);

  useEffect(() => {
    if (!contact.created_by) return;
    base44.entities.User.list().then(users => {
      const u = users.find(u => u.email === contact.created_by || u.id === contact.created_by);
      if (u) setCreatedByName(u.full_name);
    }).catch(() => {});
  }, [contact.created_by]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: "rgba(255,255,255,0.98)", border: "1px solid rgba(240,192,0,0.20)", boxShadow: "0 16px 48px rgba(0,0,0,0.18)" }}>

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="font-bold" style={{ color: "#1A1A1A", fontSize: 20 }}>
              {contact.municipio} — {contact.uf}
            </h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <ContactStatusBadge status={contact.status} />
              {contact.pos_id_logistico && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.06)", color: "#555" }}>
                  {contact.pos_id_logistico}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit}
              className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium"
              style={{ background: "rgba(240,192,0,0.10)", color: "#8A6E00", border: "1px solid rgba(240,192,0,0.20)" }}>
              <Edit2 className="w-3.5 h-3.5" /> Editar
            </button>
            <button onClick={onClose}><X className="w-5 h-5" style={{ color: "#999" }} /></button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Localização */}
          <Section title="Localização">
            <Row label="Município" value={contact.municipio} />
            <Row label="UF" value={contact.uf} />
            <Row label="Região" value={contact.regiao ? REGIAO_LABELS[contact.regiao] || contact.regiao : null} />
            <Row label="População" value={fmtPop(contact.populacao_estimada)} />
          </Section>

          {/* Contato */}
          {(contact.orgao_secretaria || contact.nome_contato || contact.email || contact.telefone) && (
            <Section title="Contato">
              <Row label="Órgão / Secretaria" value={contact.orgao_secretaria} />
              <Row label="Nome do Contato" value={contact.nome_contato} />
              <Row label="Email" value={contact.email} href={contact.email ? `mailto:${contact.email}` : null} />
              <Row label="Telefone" value={contact.telefone} />
            </Section>
          )}

          {/* Observações */}
          {contact.observacoes && (
            <Section title="Observações">
              <p className="text-sm whitespace-pre-wrap" style={{ color: "#555", lineHeight: 1.6 }}>
                {contact.observacoes}
              </p>
            </Section>
          )}

          {/* Rodapé */}
          <div className="flex items-center justify-between pt-1 text-xs" style={{ color: "#999" }}>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Cadastrado em {contact.created_date
                ? format(new Date(contact.created_date), "dd/MM/yyyy", { locale: ptBR })
                : "—"}</span>
            </div>
            {createdByName && (
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>{createdByName}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}