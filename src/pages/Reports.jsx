import React, { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { TrendingUp, Megaphone, Headphones } from "lucide-react";

const tabs = [
  { key: "sales", label: "Vendas", icon: TrendingUp },
  { key: "marketing", label: "Marketing", icon: Megaphone },
  { key: "support", label: "Atendimento", icon: Headphones },
];

const reportSections = {
  sales: [
    { title: "Oportunidades por Estágio" },
    { title: "Receita por Período" },
  ],
  marketing: [
    { title: "Performance de Campanhas" },
    { title: "Segmentos Ativos" },
  ],
  support: [
    { title: "Tickets por Status" },
    { title: "Tempo Médio de Resolução" },
  ],
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState("sales");

  return (
    <div className="space-y-6">
      {/* Tabs */}
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

      {/* Report cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {reportSections[activeTab].map((section) => (
          <GlassCard key={section.title} className="min-h-[300px] flex flex-col">
            <h2 className="font-semibold mb-4" style={{ color: "#1A1A1A", fontSize: 18 }}>
              {section.title}
            </h2>
            <div className="flex-1 flex items-center justify-center" style={{ color: "#999999", fontSize: 14 }}>
              Dados disponíveis na próxima fase
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}