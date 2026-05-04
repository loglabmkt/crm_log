import React, { useState } from "react";
import { Download } from "lucide-react";
import PeriodFilter, { getPeriodRange } from "@/components/dashboard/PeriodFilter";
import SalesReport from "@/components/reports/SalesReport";
import MarketingReport from "@/components/reports/MarketingReport";
import SupportReport from "@/components/reports/SupportReport";

const TABS = [
  { key: "sales", label: "Vendas" },
  { key: "marketing", label: "Marketing" },
  { key: "support", label: "Atendimento" },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("sales");
  const [periodState, setPeriodState] = useState({ period: "month", customRange: {} });
  const periodRange = getPeriodRange(periodState.period, periodState.customRange);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="font-bold" style={{ color:"#1A1A1A", fontSize:28 }}>Relatórios</h1>
        <div className="flex-1" />
        <PeriodFilter value={periodState} onChange={setPeriodState} />
        <button className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ background:"rgba(255,255,255,0.70)", border:"1px solid rgba(255,255,255,0.90)", color:"#999" }}
          title="Exportar (em breve)">
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background:"rgba(255,255,255,0.60)", border:"1px solid rgba(255,255,255,0.90)" }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background: activeTab === tab.key ? "linear-gradient(135deg,#F0C000 0%,#C49A00 100%)" : "transparent",
              color: activeTab === tab.key ? "#1A1A1A" : "#555555",
              boxShadow: activeTab === tab.key ? "0 2px 8px rgba(240,192,0,0.30)" : "none",
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "sales" && <SalesReport periodRange={periodRange} />}
      {activeTab === "marketing" && <MarketingReport periodRange={periodRange} />}
      {activeTab === "support" && <SupportReport periodRange={periodRange} />}
    </div>
  );
}