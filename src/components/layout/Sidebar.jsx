import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Megaphone, 
  Headphones, 
  BarChart2, 
  Settings, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/sales", label: "Vendas", icon: TrendingUp },
  { path: "/marketing", label: "Marketing", icon: Megaphone },
  { path: "/support", label: "Atendimento", icon: Headphones },
  { path: "/reports", label: "Relatórios", icon: BarChart2 },
];

const bottomItems = [
  { path: "/settings", label: "Configurações", icon: Settings },
];

export default function Sidebar({ collapsed, onToggle }) {
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
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
          ${active 
            ? "text-primary border-l-[3px] border-primary ml-0" 
            : "text-muted-foreground hover:text-foreground border-l-[3px] border-transparent ml-0"
          }
        `}
        style={{
          background: active ? "rgba(240, 192, 0, 0.12)" : undefined,
        }}
        onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
        onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!collapsed && (
          <span className="text-sm font-medium truncate">{item.label}</span>
        )}
        {collapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
            style={{ background: "#1a1a1a", color: "#F5F5F5", border: "1px solid rgba(240,192,0,0.15)" }}>
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
        width: collapsed ? 64 : 240,
        background: "rgba(10, 10, 10, 0.95)",
        borderRight: "1px solid rgba(240, 192, 0, 0.15)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #F0C000, #C49A00)" }}>
          <span className="text-xs font-bold text-black">LL</span>
        </div>
        {!collapsed && (
          <span className="text-base font-semibold text-foreground tracking-tight truncate">
            Log Lab <span className="text-primary">CRM</span>
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(renderItem)}
      </nav>

      {/* Separator + bottom items */}
      <div className="px-4">
        <div className="h-px w-full" style={{ background: "rgba(240, 192, 0, 0.15)" }} />
      </div>
      <div className="px-2 py-3 space-y-1">
        {bottomItems.map(renderItem)}
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="h-12 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        style={{ borderTop: "1px solid rgba(240, 192, 0, 0.08)" }}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}