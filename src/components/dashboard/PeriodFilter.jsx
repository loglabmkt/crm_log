import React, { useState } from "react";

const PERIODS = [
  { key: "today", label: "Hoje" },
  { key: "week", label: "Semana" },
  { key: "month", label: "Mês" },
  { key: "custom", label: "Personalizado" },
];

export function getPeriodRange(period, customRange) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "today") return { start: startOfDay, end: now };
  if (period === "week") {
    const start = new Date(startOfDay);
    start.setDate(start.getDate() - 7);
    return { start, end: now };
  }
  if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end: now };
  }
  if (period === "custom" && customRange.start && customRange.end) {
    return customRange;
  }
  return { start: null, end: null };
}

export default function PeriodFilter({ value, onChange }) {
  const [showCustom, setShowCustom] = useState(false);
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  const handleSelect = (key) => {
    if (key === "custom") { setShowCustom(true); return; }
    onChange({ period: key, customRange: {} });
  };

  const applyCustom = () => {
    if (!customRange.start || !customRange.end) return;
    onChange({ period: "custom", customRange: { start: new Date(customRange.start), end: new Date(customRange.end) } });
    setShowCustom(false);
  };

  return (
    <>
      <div className="flex gap-1.5 flex-wrap">
        {PERIODS.map((p) => {
          const active = value.period === p.key;
          return (
            <button
              key={p.key}
              onClick={() => handleSelect(p.key)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                background: active ? "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)" : "rgba(255,255,255,0.60)",
                border: active ? "none" : "1px solid rgba(255,255,255,0.90)",
                color: active ? "#1A1A1A" : "#555555",
                boxShadow: active ? "0 2px 8px rgba(240,192,0,0.30)" : "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Custom date modal */}
      {showCustom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.20)", backdropFilter: "blur(4px)" }}>
          <div className="rounded-2xl p-6 w-80 space-y-4" style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(240,192,0,0.25)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
            <h3 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>Período personalizado</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#999999" }}>De</label>
                <input type="date" value={customRange.start} onChange={(e) => setCustomRange((p) => ({ ...p, start: e.target.value }))}
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(240,192,0,0.20)", color: "#1A1A1A", fontFamily: "Inter, sans-serif" }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#999999" }}>Até</label>
                <input type="date" value={customRange.end} onChange={(e) => setCustomRange((p) => ({ ...p, end: e.target.value }))}
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(240,192,0,0.20)", color: "#1A1A1A", fontFamily: "Inter, sans-serif" }} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowCustom(false)}
                className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ background: "rgba(0,0,0,0.06)", color: "#555555" }}>Cancelar</button>
              <button onClick={applyCustom}
                className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)", color: "#1A1A1A", boxShadow: "0 2px 8px rgba(240,192,0,0.30)" }}>Aplicar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}