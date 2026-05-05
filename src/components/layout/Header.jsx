import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { LogOut, User, Menu } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationBell from "./NotificationBell";
import GlobalSearch from "./GlobalSearch";

const routeTitles = {
  "/": "Dashboard",
  "/opportunities": "Oportunidades",
  "/marketing": "Marketing",
  "/support": "Atendimento",
  "/reports": "Relatórios",
  "/settings": "Configurações",
  "/contacts": "Painel de Contatos",
  "/forms": "Formulários",
  "/forms/new": "Novo Formulário",
  "/organizations": "Organizações",
};

function getTitle(pathname) {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (pathname.startsWith("/opportunities/")) return "Detalhe da Oportunidade";
  if (pathname.match(/\/forms\/[^/]+\/edit/)) return "Editar Formulário";
  if (pathname.match(/\/forms\/[^/]+\/results/)) return "Respostas";
  if (pathname.startsWith("/support/")) return "Detalhe do Ticket";
  if (pathname.startsWith("/organizations/")) return "Detalhe da Organização";
  return "Log Lab CRM";
}

export default function Header({ sidebarWidth, onMobileMenuClick }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const title = getTitle(location.pathname);
  const initials = user?.full_name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";

  return (
    <header
      className="fixed top-0 right-0 h-16 z-30 flex items-center justify-between px-4 md:px-6 transition-all duration-300"
      style={{
        left: 0,
        background: "rgba(255, 255, 255, 0.70)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
        boxShadow: "0 1px 12px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Desktop: push left by sidebar width */}
      <div className="hidden md:flex items-center flex-1" style={{ paddingLeft: sidebarWidth, transition: "padding 300ms" }}>
        <h1 className="text-lg font-semibold" style={{ color: "#1A1A1A" }}>{title}</h1>
      </div>

      {/* Mobile: hamburger + centered logo */}
      <div className="flex md:hidden items-center gap-3 flex-1">
        <button onClick={onMobileMenuClick} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.04)", color: "#555" }}>
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-base font-semibold" style={{ color: "#1A1A1A" }}>
          Log Lab <span style={{ color: "#F0C000" }}>CRM</span>
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Desktop search */}
        <div className="hidden md:block">
          <GlobalSearch />
        </div>
        {/* Mobile search */}
        <div className="md:hidden">
          <GlobalSearch isMobile />
        </div>

        <NotificationBell />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 h-9 px-2.5 rounded-xl text-sm transition-colors"
              style={{ background: "rgba(0,0,0,0.04)", color: "#1A1A1A" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.07)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.04)"}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)", color: "#1A1A1A" }}>
                {initials}
              </div>
              <span className="hidden sm:block text-sm font-medium truncate max-w-[120px]">
                {user?.full_name || "Usuário"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48"
            style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", border: "1px solid rgba(240,192,0,0.15)", boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}>
            <DropdownMenuItem className="cursor-pointer gap-2 text-sm" style={{ color: "#555555" }}
              onClick={() => window.location.href = "/settings"}>
              <User className="w-4 h-4" /> Perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2 text-sm" style={{ color: "#555555" }}
              onClick={() => base44.auth.logout("/login")}>
              <LogOut className="w-4 h-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}