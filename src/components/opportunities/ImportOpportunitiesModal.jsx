import React, { useState, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { X, Upload, Download, CheckCircle2, AlertCircle } from "lucide-react";

const FIELDS = [
  { key: "nr", label: "Nr" },
  { key: "title", label: "Oportunidade *", required: true },
  { key: "client_name", label: "Cliente *", required: true },
  { key: "estimated_value", label: "Valor" },
  { key: "situacao", label: "Situação" },
  { key: "etapa", label: "Etapa" },
  { key: "funil", label: "Funil" },
  { key: "chance", label: "Chance" },
  { key: "owner_id", label: "Responsável (texto)" },
  { key: "parceiro", label: "Parceiro" },
  { key: "tipo_negocio", label: "Tipo de Negócio" },
  { key: "nr_contrato_os", label: "Nr Contrato/OS" },
  { key: "ata_anotacoes", label: "Ata / Anotações" },
  { key: "__ignore", label: "(Ignorar)" },
];

const VALID_SITUACOES = ["em_andamento", "congelada", "desistida", "cancelada", "substituida", "vendida"];
const VALID_ETAPAS = ["dimensionando", "elaborando_contrato", "elaborando_os", "executando", "obtendo_aprovacoes", "encerrado"];

function similarity(a, b) {
  a = a.toLowerCase().replace(/[^a-z0-9]/g, "");
  b = b.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.8;
  return 0;
}

function autoMap(headers) {
  const map = {};
  headers.forEach(h => {
    let best = "__ignore";
    let bestScore = 0;
    FIELDS.forEach(f => {
      if (f.key === "__ignore") return;
      const score = similarity(h, f.key) || similarity(h, f.label.replace(" *", ""));
      if (score > bestScore) { bestScore = score; best = f.key; }
    });
    map[h] = bestScore > 0.5 ? best : "__ignore";
  });
  return map;
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  const parse = (line) => {
    const result = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; }
      else if ((ch === "," || ch === ";") && !inQ) { result.push(cur.trim()); cur = ""; }
      else { cur += ch; }
    }
    result.push(cur.trim());
    return result;
  };
  const headers = parse(lines[0]);
  const rows = lines.slice(1).map(l => {
    const vals = parse(l);
    const row = {};
    headers.forEach((h, i) => { row[h] = vals[i] || ""; });
    return row;
  }).filter(r => Object.values(r).some(v => v.trim()));
  return { headers, rows };
}

function parseValue(v) {
  if (!v) return 0;
  return Number(String(v).replace(/[R$\s.]/g, "").replace(",", ".")) || 0;
}

function parseChance(v) {
  const n = Number(v);
  if (!n || isNaN(n)) return 3;
  return Math.min(5, Math.max(1, Math.round(n)));
}

const TEMPLATE_HEADERS = "nr,oportunidade,cliente,valor,situacao,etapa,funil,chance,responsavel,parceiro,tipo_negocio,nr_contrato_os,ata_anotacoes";

const inputStyle = {
  background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.10)",
  color: "#1A1A1A", fontFamily: "Inter, sans-serif", borderRadius: 8,
  padding: "6px 10px", width: "100%", fontSize: 13, outline: "none",
};

export default function ImportOpportunitiesModal({ onClose, onImported }) {
  const [step, setStep] = useState(1);
  const [csvData, setCsvData] = useState(null); // { headers, rows }
  const [mapping, setMapping] = useState({});
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseCSV(e.target.result);
      setCsvData(parsed);
      setMapping(autoMap(parsed.headers));
      setStep(2);
    };
    reader.readAsText(file, "UTF-8");
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_HEADERS + "\n"], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "modelo_oportunidades.csv";
    a.click();
  };

  const requiredMapped = FIELDS.filter(f => f.required).every(f =>
    Object.values(mapping).includes(f.key)
  );

  const handleImport = async () => {
    setImporting(true);
    setStep(3);
    setProgress(0);

    // Get max nr
    const existing = await base44.entities.Opportunity.list("-nr", 1);
    let maxNr = existing.reduce((m, o) => Math.max(m, o.nr || 0), 0);

    let imported = 0;
    let skipped = 0;
    const rows = csvData.rows;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const get = (fieldKey) => {
        const header = Object.keys(mapping).find(h => mapping[h] === fieldKey);
        return header ? row[header] : "";
      };

      const title = get("title")?.trim();
      const client_name = get("client_name")?.trim();

      if (!title || !client_name) { skipped++; setProgress(Math.round(((i + 1) / rows.length) * 100)); continue; }

      const nrRaw = get("nr");
      const nr = nrRaw ? Number(nrRaw) : ++maxNr;
      if (!nrRaw) maxNr = nr;

      const situacaoRaw = get("situacao")?.toLowerCase().trim().replace(/\s+/g, "_");
      const situacao = VALID_SITUACOES.includes(situacaoRaw) ? situacaoRaw : "em_andamento";

      const etapaRaw = get("etapa")?.toLowerCase().trim().replace(/\s+/g, "_");
      const etapa = VALID_ETAPAS.includes(etapaRaw) ? etapaRaw : "dimensionando";

      await base44.entities.Opportunity.create({
        nr,
        title,
        client_name,
        estimated_value: parseValue(get("estimated_value")),
        situacao,
        etapa,
        funil: get("funil") || undefined,
        chance: parseChance(get("chance")),
        parceiro: get("parceiro") || undefined,
        tipo_negocio: get("tipo_negocio") || undefined,
        nr_contrato_os: get("nr_contrato_os") || undefined,
        ata_anotacoes: get("ata_anotacoes") || undefined,
      });

      imported++;
      setProgress(Math.round(((i + 1) / rows.length) * 100));
    }

    setResult({ imported, skipped });
    setImporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-xl rounded-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: "rgba(255,255,255,0.98)", border: "1px solid rgba(240,192,0,0.20)", boxShadow: "0 16px 48px rgba(0,0,0,0.16)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div>
            <h2 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>Importar Oportunidades (CSV)</h2>
            <div className="flex gap-3 mt-1">
              {[1,2,3].map(s => (
                <span key={s} className="text-xs font-medium"
                  style={{ color: step >= s ? "#C49A00" : "#CCC" }}>
                  {s === 1 ? "Upload" : s === 2 ? "Mapeamento" : "Importação"}
                  {s < 3 && " →"}
                </span>
              ))}
            </div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: "#999" }} /></button>
        </div>

        <div className="p-6">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors"
                style={{ borderColor: dragging ? "#F0C000" : "rgba(0,0,0,0.12)", background: dragging ? "rgba(240,192,0,0.04)" : "transparent" }}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current?.click()}>
                <Upload className="w-10 h-10 mx-auto mb-3" style={{ color: "#F0C000" }} />
                <p className="font-medium" style={{ color: "#1A1A1A" }}>Arraste um arquivo .csv ou clique para selecionar</p>
                <p className="text-sm mt-1" style={{ color: "#999" }}>Arquivos CSV com vírgula ou ponto-e-vírgula</p>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => handleFile(e.target.files[0])} />
              </div>
              <button onClick={downloadTemplate}
                className="flex items-center gap-2 mx-auto px-4 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "rgba(0,0,0,0.05)", color: "#555" }}>
                <Download className="w-4 h-4" /> Baixar modelo CSV
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && csvData && (
            <div className="space-y-4">
              <div className="rounded-xl p-3 text-sm" style={{ background: "rgba(240,192,0,0.06)", border: "1px solid rgba(240,192,0,0.15)" }}>
                <p style={{ color: "#8A6E00" }}><strong>{csvData.rows.length}</strong> linhas detectadas · <strong>{csvData.headers.length}</strong> colunas</p>
              </div>

              {/* Preview */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#999" }}>Primeiras 3 linhas</p>
                <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
                  <table className="text-xs w-full">
                    <thead><tr style={{ background: "#1A1A1A" }}>
                      {csvData.headers.map(h => <th key={h} className="px-3 py-2 text-left font-medium" style={{ color: "rgba(255,255,255,0.80)", whiteSpace: "nowrap" }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {csvData.rows.slice(0, 3).map((row, i) => (
                        <tr key={i} style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                          {csvData.headers.map(h => <td key={h} className="px-3 py-1.5 truncate max-w-[100px]" style={{ color: "#555" }}>{row[h]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mapping */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#999" }}>Mapeamento de colunas</p>
                <div className="space-y-2">
                  {csvData.headers.map(h => {
                    const isRequired = FIELDS.find(f => f.key === mapping[h])?.required;
                    return (
                      <div key={h} className="flex items-center gap-3">
                        <span className="text-sm font-medium flex-shrink-0" style={{ color: "#1A1A1A", minWidth: 120 }}>{h}</span>
                        <span style={{ color: "#999" }}>→</span>
                        <select value={mapping[h] || "__ignore"} onChange={e => setMapping(m => ({ ...m, [h]: e.target.value }))} style={inputStyle}>
                          {FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                        </select>
                      </div>
                    );
                  })}
                </div>
                {!requiredMapped && (
                  <div className="flex items-center gap-2 mt-3 text-sm" style={{ color: "#EF4444" }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Mapeie "Oportunidade" e "Cliente" antes de importar.
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: "rgba(0,0,0,0.06)", color: "#555" }}>Voltar</button>
                <button onClick={handleImport} disabled={!requiredMapped}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: requiredMapped ? "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)" : "rgba(0,0,0,0.08)", color: requiredMapped ? "#1A1A1A" : "#999" }}>
                  Importar {csvData.rows.length} oportunidades
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6">
              {importing ? (
                <>
                  <p className="text-sm text-center font-medium" style={{ color: "#555" }}>Importando... {progress}%</p>
                  <div className="w-full rounded-full h-3" style={{ background: "rgba(0,0,0,0.06)" }}>
                    <div className="h-3 rounded-full transition-all" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #F0C000, #C49A00)" }} />
                  </div>
                </>
              ) : result && (
                <div className="text-center space-y-4">
                  <CheckCircle2 className="w-14 h-14 mx-auto" style={{ color: "#22C55E" }} />
                  <div>
                    <p className="text-lg font-bold" style={{ color: "#1A1A1A" }}>
                      {result.imported} oportunidades importadas!
                    </p>
                    {result.skipped > 0 && (
                      <p className="text-sm mt-1" style={{ color: "#999" }}>{result.skipped} linhas ignoradas (campos obrigatórios vazios)</p>
                    )}
                  </div>
                  <button onClick={() => { onImported(); onClose(); }}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)", color: "#1A1A1A" }}>
                    Concluir
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}