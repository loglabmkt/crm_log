import React, { useState } from "react";
import { Plus } from "lucide-react";
import SegmentsList from "@/components/marketing/SegmentsList";
import CampaignsList from "@/components/marketing/CampaignsList";
import SegmentModal from "@/components/marketing/SegmentModal";
import CampaignModal from "@/components/marketing/CampaignModal";

const TABS = [
  { key: "segments", label: "Segmentos" },
  { key: "campaigns", label: "Campanhas" },
];

export default function Marketing() {
  const [activeTab, setActiveTab] = useState("segments");
  const [segmentModalOpen, setSegmentModalOpen] = useState(false);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="font-bold flex-1" style={{ color: "#1A1A1A", fontSize: 28 }}>Marketing</h1>
        {activeTab === "segments" ? (
          <button onClick={() => setSegmentModalOpen(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold"
            style={{ background: "linear-gradient(135deg,#F0C000 0%,#C49A00 100%)", color: "#1A1A1A", boxShadow: "0 2px 8px rgba(240,192,0,0.30)" }}>
            <Plus className="w-4 h-4" /> Novo Segmento
          </button>
        ) : (
          <button onClick={() => setCampaignModalOpen(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold"
            style={{ background: "linear-gradient(135deg,#F0C000 0%,#C49A00 100%)", color: "#1A1A1A", boxShadow: "0 2px 8px rgba(240,192,0,0.30)" }}>
            <Plus className="w-4 h-4" /> Nova Campanha
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.90)" }}>
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
      {activeTab === "segments" ? (
        <SegmentsList key={refreshKey} />
      ) : (
        <CampaignsList key={refreshKey} />
      )}

      {/* Modals */}
      {segmentModalOpen && (
        <SegmentModal onClose={() => setSegmentModalOpen(false)} onSaved={() => { setRefreshKey(k => k + 1); setSegmentModalOpen(false); }} />
      )}
      {campaignModalOpen && (
        <CampaignModal onClose={() => setCampaignModalOpen(false)} onSaved={() => { setRefreshKey(k => k + 1); setCampaignModalOpen(false); }} />
      )}
    </div>
  );
}