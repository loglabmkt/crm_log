import React, { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Users, Send } from "lucide-react";

const tabs = [
  { key: "segments", label: "Segmentos", icon: Users },
  { key: "campaigns", label: "Campanhas", icon: Send },
];

export default function Marketing() {
  const [activeTab, setActiveTab] = useState("segments");

  return (
    <div className="space-y-6">
      {/* Custom tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.90)" }}>
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: active ? "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)" : "transparent",
                color: active ? "#1A1A1A" : "#555555",
                boxShadow: active ? "0 2px 8px rgba(240,192,0,0.30)" : "none",
              }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "segments" && (
        <GlassCard className="min-h-[400px] flex flex-col items-center justify-center gap-2">
          <Users className="w-10 h-10" style={{ color: "#CCCCCC" }} />
          <p className="font-medium" style={{ color: "#555555", fontSize: 14 }}>Nenhum segmento criado</p>
          <p style={{ color: "#999999", fontSize: 14 }}>Crie segmentos para organizar suas campanhas</p>
        </GlassCard>
      )}

      {activeTab === "campaigns" && (
        <GlassCard className="min-h-[400px] flex flex-col items-center justify-center gap-2">
          <Send className="w-10 h-10" style={{ color: "#CCCCCC" }} />
          <p className="font-medium" style={{ color: "#555555", fontSize: 14 }}>Nenhuma campanha criada</p>
          <p style={{ color: "#999999", fontSize: 14 }}>Campanhas de e-mail, WhatsApp e SMS</p>
        </GlassCard>
      )}
    </div>
  );
}