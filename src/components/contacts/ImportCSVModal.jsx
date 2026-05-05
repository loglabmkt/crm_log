import React, { useState, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { X, Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";

const CONTACT_FIELDS = [
  { key: "municipio", label: "Município" },
  { key: "uf", label: "UF" },
  { key: "populacao_estimada", label: "População Estimada" },
  { key: "orgao_secretaria", label: "Órgão/Secretaria" },
  { key: "nome_contato", label: "Nome do Contato" },
  { key: "email", label: "Email" },
  { key: "telefone", label: "Telefone" },
  { key: "status", label: "Status" },
  { key: "pos_id_logistico", label: "ID Logístico" },
  { key: "observacoes", label: "Observações" },
  { key: "__ignore__", label: "(ignorar)" },
];

const SIMILARITY_MAP = {
  municipio: ["municipio", "município", "cidade", "city", "municipality"],
  uf: ["uf", "estado", "state", "sigla"],
  populacao_estimada: ["populacao", "população", "pop", "habitantes"],
  orgao_secretaria: ["orgao", "órgão", "secretaria", "organ"],
  nome_contato: ["nome", "name", "contato", "contact", "responsavel"],
  email: ["email", "e-mail", "mail"],
  telefone: ["telefone", "phone", "tel", "fone", "celular"],
  status: ["status"],
  pos_id_logistico: ["pos", "id", "logistico", "codigo"],
  observacoes: ["observacao", "observações", "obs", "notes"],
};

function guessMapping(header) {
  const h = header.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [field, synonyms] of Object.entries(SIMILARITY_MAP)) {
    if (synonyms.some(s => h.includes(s))) return field;
  }
  return "__ignore__";
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const sep = lines[0].includes(";") ? ";" : ",";
  const parseRow = (line) => {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === sep && !inQuotes) { result.push(current.trim()); current = ""; }
      else current += ch;
    }
    result.push(current.trim());
    return result;
  };
  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map(l => parseRow(l));
  return { headers, rows };
}

export default function ImportCSVModal({ onClose, onImported }) {
  const [step, setStep] = useState(1); // 1=upload, 2=mapping, 3=done
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const processFile = (file) => {
    if (!file || !file.name.endsWith(".csv")) {
      alert("Por favor, selecione um arquivo .csv");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const { headers: h, rows: r } = parseCSV(text);
      setHeaders(h);
      setRows(r);
      const auto = {};
      h.forEach(hdr => { auto[hdr] = guessMapping(hdr); });
      setMapping(auto);
      setStep(2);
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const doImport = async () => {
    setImporting(true);
    let imported = 0, skipped = 0;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const obj = {};
      headers.forEach((h, idx) => {
        const field = mapping[h];
        if (field && field !== "__ignore__") {
          obj[field] = row[idx] || undefined;
        }
      });
      if (!obj.municipio || !obj.uf) { skipped++; continue; }
      if (obj.populacao_estimada) obj.populacao_estimada = Number(obj.populacao_estimada) || undefined;
      if (!obj.status) obj.status = "lead_email";
      await base44.entities.ContactPanel.create(obj);
      imported++;
      setProgress(Math.round(((i + 1) / rows.length) * 100));
    }
    setResult({ imported, skipped });
    setStep(3);
    setImporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: "rgba(255,255,255,0.98)", border: "1px solid rgba(240,192,0,0.20)", boxShadow: "0 16px 48px rgba(0,0,0,0.18)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>Importar CSV</h2>
          <button onClick={onClose} style={{ color: "#999" }}><X className="w-5 h-5" /></button>
        </div>

        {/* Step 1 — Upload */}
        {step === 1 && (
          <div className="p-6 space-y-4">
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors"
              style={{ borderColor: dragging ? "#F0C000" : "rgba(0,0,0,0.12)", background: dragging ? "rgba(240,192,0,0.04)" : "transparent" }}>
              <Upload className="w-10 h-10" style={{ color: dragging ? "#F0C000" : "#CCC" }} />
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: "#555" }}>Arraste um arquivo .csv ou clique para selecionar</p>
                <p className="text-xs mt-1" style={{ color: "#999" }}>Apenas arquivos .csv</p>
              </div>
              <input ref={fileRef} type="file" accept=".csv" className="hidden"
                onChange={e => processFile(e.target.files[0])} />
            </div>
          </div>
        )}

        {/* Step 2 — Mapping */}
        {step === 2 && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(240,192,0,0.08)", border: "1px solid rgba(240,192,0,0.20)" }}>
              <FileText className="w-4 h-4 flex-shrink-0" style={{ color: "#C49A00" }} />
              <p className="text-sm" style={{ color: "#8A6E00" }}>
                <strong>{rows.length} linhas</strong> detectadas. Mapeie as colunas:
              </p>
            </div>

            {/* Preview */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "rgba(0,0,0,0.04)" }}>
                      {headers.slice(0, 5).map(h => (
                        <th key={h} className="px-3 py-2 text-left font-medium" style={{ color: "#555" }}>{h}</th>
                      ))}
                      {headers.length > 5 && <th className="px-3 py-2 text-left" style={{ color: "#999" }}>+{headers.length - 5} mais</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 3).map((row, i) => (
                      <tr key={i} style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                        {row.slice(0, 5).map((cell, j) => (
                          <td key={j} className="px-3 py-2 truncate max-w-[100px]" style={{ color: "#777" }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mapping fields */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {headers.map(h => (
                <div key={h} className="flex items-center gap-3">
                  <span className="text-xs font-medium flex-1 truncate" style={{ color: "#333" }}>{h}</span>
                  <select
                    value={mapping[h] || "__ignore__"}
                    onChange={e => setMapping(prev => ({ ...prev, [h]: e.target.value }))}
                    className="text-xs rounded-lg px-2 py-1.5 outline-none flex-shrink-0"
                    style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.10)", color: "#333", width: 160 }}>
                    {CONTACT_FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                  </select>
                </div>
              ))}
            </div>

            {importing && (
              <div>
                <div className="flex items-center justify-between text-xs mb-1" style={{ color: "#555" }}>
                  <span>Importando...</span><span>{progress}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "rgba(0,0,0,0.06)" }}>
                  <div className="h-2 rounded-full transition-all" style={{ background: "#F0C000", width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "rgba(0,0,0,0.06)", color: "#555" }}>Voltar</button>
              <button onClick={doImport} disabled={importing} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)", color: "#1A1A1A", opacity: importing ? 0.7 : 1 }}>
                {importing ? `Importando... ${progress}%` : `Importar ${rows.length} registros`}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Done */}
        {step === 3 && result && (
          <div className="p-6 flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="w-14 h-14" style={{ color: "#22C55E" }} />
            <div>
              <p className="font-bold text-lg" style={{ color: "#1A1A1A" }}>
                {result.imported} contatos importados com sucesso.
              </p>
              {result.skipped > 0 && (
                <p className="text-sm mt-1 flex items-center justify-center gap-1" style={{ color: "#F59E0B" }}>
                  <AlertCircle className="w-4 h-4" />
                  {result.skipped} linhas ignoradas por dados inválidos.
                </p>
              )}
            </div>
            <button onClick={() => { onClose(); onImported?.(); }}
              className="w-full py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)", color: "#1A1A1A" }}>
              Fechar e atualizar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}