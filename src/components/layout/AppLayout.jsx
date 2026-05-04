import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import NavProgressBar from "./NavProgressBar";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change + scroll to top
  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <div className="min-h-screen font-inter" style={{ background: "transparent" }}>
      <NavProgressBar />

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setMobileOpen(false)} />
          <div className="relative z-10">
            <Sidebar collapsed={false} onToggle={() => {}} isMobileDrawer onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <Header sidebarWidth={sidebarWidth} onMobileMenuClick={() => setMobileOpen(true)} />

      {/* Desktop main — offset by sidebar */}
      <main
        className="hidden md:block pt-16 min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile main — full width */}
      <main className="md:hidden pt-16 min-h-screen">
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}