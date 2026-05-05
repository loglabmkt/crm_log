import React from "react";
import GlassCard from "@/components/ui/GlassCard";

const PRESET_COLORS = [
  { color: "#F0C000", label: "Dourado" },
  { color: "#3B82F6", label: "Azul" },
  { color: "#22C55E", label: "Verde" },
  { color: "#8B5CF6", label: "Roxo" },
  { color: "#EF4444", label: "Vermelho" },
  { color: "#1A1A1A", label: "Preto" },
];

const inputStyle = {
  background: "rgba(255,255,255,0.70)",
  border: "1px solid rgba(0,0,0,0.10)",
  color: "#1A1A1A",
  borderRadius: 10,
  padding: "8px 12px",
  fontSize: 14,
  outline: "none",
  width: "100%",
  fontFamily: "Inter, sans-serif",
};

export default function LandingPageConfig({ config, onChange }) {
  const set = (key, val) => onChange({ ...config, [key]: val });

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Content section */}
      <GlassCard>
        <h3 className="font-semibold mb-4" style={{ color: "#1A1A1A", fontSize: 15 }}>Conteúdo</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#555" }}>Título principal</label>
            <input
              value={config.headline || ""}
              onChange={e => set("headline", e.target.value)}
              placeholder="Ex: Cadastre seu Município"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#555" }}>Subtítulo</label>
            <textarea
              rows={2}
              value={config.subheadline || ""}
              onChange={e => set("subheadline", e.target.value)}
              placeholder="Descrição da iniciativa..."
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#555" }}>Texto do botão</label>
            <input
              value={config.button_text || ""}
              onChange={e => set("button_text", e.target.value)}
              placeholder="Enviar Cadastro"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#555" }}>Texto do logo</label>
            <input
              value={config.logo_text || ""}
              onChange={e => set("logo_text", e.target.value)}
              placeholder="Log Lab"
              style={inputStyle}
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              onClick={() => set("show_logo", !config.show_logo)}
              className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0"
              style={{ background: config.show_logo ? "#F0C000" : "rgba(0,0,0,0.15)" }}>
              <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all"
                style={{ left: config.show_logo ? "22px" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.20)" }} />
            </button>
            <span className="text-sm" style={{ color: "#555" }}>Mostrar logo?</span>
          </label>
        </div>
      </GlassCard>

      {/* Appearance section */}
      <GlassCard>
        <h3 className="font-semibold mb-4" style={{ color: "#1A1A1A", fontSize: 15 }}>Aparência</h3>
        <div>
          <label className="block text-xs font-medium mb-3" style={{ color: "#555" }}>Cor primária</label>
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map(({ color, label }) => (
              <button
                key={color}
                onClick={() => set("primary_color", color)}
                title={label}
                className="w-10 h-10 rounded-xl transition-all"
                style={{
                  background: color,
                  border: config.primary_color === color
                    ? "3px solid white"
                    : "3px solid transparent",
                  boxShadow: config.primary_color === color
                    ? `0 0 0 2px ${color}, 0 4px 12px rgba(0,0,0,0.20)`
                    : "0 2px 6px rgba(0,0,0,0.10)",
                  transform: config.primary_color === color ? "scale(1.1)" : "scale(1)",
                }}
              />
            ))}
          </div>
          <p className="mt-3 text-xs" style={{ color: "#999" }}>
            Cor selecionada: <span className="font-mono font-medium">{config.primary_color || "#F0C000"}</span>
          </p>
        </div>
      </GlassCard>
    </div>
  );
}