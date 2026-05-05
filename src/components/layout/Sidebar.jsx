import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Target, Megaphone, Headphones,
  BarChart2, Settings, ChevronLeft, ChevronRight, Building2, X,
} from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/opportunities", label: "Oportunidades", icon: Target },
  { path: "/organizations", label: "Organizações", icon: Building2 },
  { path: "/marketing", label: "Marketing", icon: Megaphone },
  { path: "/support", label: "Atendimento", icon: Headphones },
  { path: "/reports", label: "Relatórios", icon: BarChart2 },
];

const bottomItems = [
  { path: "/settings", label: "Configurações", icon: Settings },
];

export default function Sidebar({ collapsed, onToggle, isMobileDrawer, onClose }) {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const renderItem = (item) => {
    const active = isActive(item.path);
    const Icon = item.icon;
    return (
      <Link
        key={item.path}
        to={item.path}
        title={collapsed && !isMobileDrawer ? item.label : undefined}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative border-l-[3px]"
        style={{
          background: active ? "rgba(240, 192, 0, 0.12)" : "transparent",
          borderLeftColor: active ? "#F0C000" : "transparent",
          color: active ? "#8A6E00" : "#555555",
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(0,0,0,0.04)"; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
      >
        <Icon className="w-5 h-5 flex-shrink-0" style={{ color: active ? "#F0C000" : "currentColor" }} />
        {(!collapsed || isMobileDrawer) && <span className="text-sm font-medium truncate">{item.label}</span>}
        {collapsed && !isMobileDrawer && (
          <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
            style={{ background: "rgba(255,255,255,0.95)", color: "#1A1A1A", border: "1px solid rgba(240,192,0,0.20)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            {item.label}
          </div>
        )}
      </Link>
    );
  };

  return (
    <aside
      className="fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out"
      style={{
        width: isMobileDrawer ? 260 : (collapsed ? 64 : 240),
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(240, 192, 0, 0.15)",
      }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 gap-3 flex-shrink-0 justify-between">
        <div className="flex items-center justify-center flex-1">
          {(!collapsed || isMobileDrawer) ? (
            <img
              src="https://media.base44.com/images/public/69f8ee9615d3f5128d9c0f57/8fcc0078f_fb3797ffe_logotipo_loglab.png"
              alt="Log Lab"
              className="h-10 w-auto object-contain"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs"
              style={{ background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)", color: "#1A1A1A" }}>
              LL
            </div>
          )}
        </div>
        {isMobileDrawer && (
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ color: "#999" }}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(renderItem)}
      </nav>

      {/* Separator */}
      <div className="px-4">
        <div className="h-px w-full" style={{ background: "rgba(240, 192, 0, 0.15)" }} />
      </div>

      {/* Bottom items */}
      <div className="px-2 py-3 space-y-0.5">
        {bottomItems.map(renderItem)}
      </div>

      {/* Toggle button (desktop only) */}
      {!isMobileDrawer && (
        <button onClick={onToggle}
          className="h-12 flex items-center justify-center transition-colors flex-shrink-0"
          style={{ borderTop: "1px solid rgba(0, 0, 0, 0.06)", color: "#999999" }}
          onMouseEnter={e => e.currentTarget.style.color = "#1A1A1A"}
          onMouseLeave={e => e.currentTarget.style.color = "#999999"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      )}
    </aside>
  );
}