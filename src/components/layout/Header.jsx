import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search, Bell, LogOut, User } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const routeTitles = {
  "/": "Dashboard",
  "/sales": "Vendas",
  "/marketing": "Marketing",
  "/support": "Atendimento",
  "/reports": "Relatórios",
  "/settings": "Configurações",
};

export default function Header({ sidebarWidth }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const title = routeTitles[location.pathname] || "Log Lab CRM";
  const initials = user?.full_name?.[0]?.toUpperCase() || "U";

  return (
    <header
      className="fixed top-0 right-0 h-16 z-30 flex items-center justify-between px-6 transition-all duration-300"
      style={{
        left: sidebarWidth,
        background: "rgba(255, 255, 255, 0.70)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
        boxShadow: "0 1px 12px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Page title */}
      <h1
        className="text-lg font-semibold"
        style={{ color: "#1A1A1A" }}
      >
        {title}
      </h1>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          {searchOpen ? (
            <input
              autoFocus
              type="text"
              placeholder="Buscar..."
              onBlur={() => setSearchOpen(false)}
              className="h-9 w-56 rounded-xl px-3 text-sm outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.80)",
                border: "1px solid rgba(240, 192, 0, 0.30)",
                color: "#1A1A1A",
                fontFamily: "Inter, sans-serif",
              }}
            />
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: "rgba(0,0,0,0.04)", color: "#555555" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.07)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Notifications */}
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center relative transition-colors"
          style={{ background: "rgba(0,0,0,0.04)", color: "#555555" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.07)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
        >
          <Bell className="w-4 h-4" />
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
            style={{ background: "#F0C000", color: "#1A1A1A" }}
          >
            0
          </span>
        </button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 h-9 px-2.5 rounded-xl text-sm transition-colors"
              style={{ background: "rgba(0,0,0,0.04)", color: "#1A1A1A" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.07)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #F0C000 0%, #C49A00 100%)",
                  color: "#1A1A1A",
                }}
              >
                {initials}
              </div>
              <span className="hidden sm:block text-sm font-medium truncate max-w-[120px]">
                {user?.full_name || "Usuário"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48"
            style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(240,192,0,0.15)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
            }}
          >
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-sm"
              style={{ color: "#555555" }}
              onClick={() => (window.location.href = "/settings")}
            >
              <User className="w-4 h-4" /> Perfil
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-sm"
              style={{ color: "#555555" }}
              onClick={() => base44.auth.logout()}
            >
              <LogOut className="w-4 h-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}