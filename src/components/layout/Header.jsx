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

  return (
    <header
      className="fixed top-0 right-0 h-16 z-30 flex items-center justify-between px-6 transition-all duration-300"
      style={{
        left: sidebarWidth,
        background: "rgba(10, 10, 10, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(240, 192, 0, 0.08)",
      }}
    >
      {/* Title */}
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          {searchOpen ? (
            <input
              autoFocus
              type="text"
              placeholder="Buscar..."
              onBlur={() => setSearchOpen(false)}
              className="h-9 w-56 rounded-lg px-3 pr-9 text-sm font-inter text-foreground placeholder:text-muted-foreground outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(240, 192, 0, 0.15)",
              }}
            />
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Notifications */}
        <button
          className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
            style={{ background: "#F0C000", color: "#0A0A0A" }}>
            0
          </span>
        </button>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 h-9 px-2 rounded-lg text-sm text-foreground hover:opacity-80 transition-opacity"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "linear-gradient(135deg, #F0C000, #C49A00)", color: "#0A0A0A" }}>
                {user?.full_name?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="hidden sm:block text-sm font-medium truncate max-w-[120px]">
                {user?.full_name || "Usuário"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48"
            style={{ background: "#111111", border: "1px solid rgba(240,192,0,0.15)" }}>
            <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer gap-2"
              onClick={() => window.location.href = "/settings"}>
              <User className="w-4 h-4" /> Perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer gap-2"
              onClick={() => base44.auth.logout()}>
              <LogOut className="w-4 h-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}