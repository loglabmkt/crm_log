import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import ProfileSettings from "@/components/settings/ProfileSettings";
import CompanySettings from "@/components/settings/CompanySettings";
import UsersSettings from "@/components/settings/UsersSettings";
import PermissionsSettings from "@/components/settings/PermissionsSettings";

const ALL_TABS = [
  { key: "profile", label: "Perfil", adminOnly: false },
  { key: "company", label: "Empresa", adminOnly: false },
  { key: "users", label: "Usuários", adminOnly: true },
  { key: "permissions", label: "Permissões", adminOnly: true },
];

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const isAdmin = currentUser?.role === "admin";
  const tabs = ALL_TABS.filter(t => !t.adminOnly || isAdmin);

  // If current tab becomes hidden (role changed), reset to profile
  const safeTab = tabs.find(t => t.key === activeTab) ? activeTab : "profile";

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <h1 className="font-bold" style={{ color: "#1A1A1A", fontSize: 28 }}>Configurações</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.90)" }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background: safeTab === tab.key ? "linear-gradient(135deg,#F0C000 0%,#C49A00 100%)" : "transparent",
              color: safeTab === tab.key ? "#1A1A1A" : "#555555",
              boxShadow: safeTab === tab.key ? "0 2px 8px rgba(240,192,0,0.30)" : "none",
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {safeTab === "profile" && <ProfileSettings />}
      {safeTab === "company" && <CompanySettings />}
      {safeTab === "users" && isAdmin && <UsersSettings currentUser={currentUser} />}
      {safeTab === "permissions" && isAdmin && <PermissionsSettings />}
    </div>
  );
}