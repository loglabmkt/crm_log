import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Clock, AlertTriangle, AlertOctagon, TrendingDown, CheckCircle2 } from "lucide-react";
import useNotifications from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const ICON_MAP = {
  Clock: Clock,
  AlertTriangle: AlertTriangle,
  AlertOctagon: AlertOctagon,
  TrendingDown: TrendingDown,
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [prevCount, setPrevCount] = useState(0);
  const [pulse, setPulse] = useState(false);
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const ref = useRef(null);
  const navigate = useNavigate();

  // Pulse on new notifications
  useEffect(() => {
    if (unreadCount > prevCount && prevCount !== 0) {
      setPulse(true);
      setTimeout(() => setPulse(false), 1500);
    }
    setPrevCount(unreadCount);
  }, [unreadCount]);

  // Click outside to close
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const urgent = notifications.filter(n => n.group === "urgent");
  const attention = notifications.filter(n => n.group === "attention");

  const handleClick = (n) => {
    markAsRead(n.id);
    setOpen(false);
    navigate(n.link);
  };

  function timeAgo(dt) {
    if (!dt) return "";
    try { return formatDistanceToNow(new Date(dt), { addSuffix: true, locale: ptBR }); }
    catch { return ""; }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-9 h-9 rounded-xl flex items-center justify-center relative transition-colors"
        style={{ background: "rgba(0,0,0,0.04)", color: "#555555" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.07)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.04)"}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 ${pulse ? "animate-pulse" : ""}`}
            style={{ background: "#EF4444", color: "#fff" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed md:absolute right-0 mt-2 z-50 flex flex-col"
          style={{
            top: "calc(100% + 8px)",
            width: "min(360px, calc(100vw - 32px))",
            maxHeight: 480,
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(240,192,0,0.20)",
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm" style={{ color: "#1A1A1A" }}>Notificações</span>
              {unreadCount > 0 && <span className="text-xs font-medium" style={{ color: "#F0C000" }}>({unreadCount} não lidas)</span>}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs" style={{ color: "#999" }}>Marcar todas como lidas</button>
            )}
          </div>

          {/* Body */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <CheckCircle2 className="w-8 h-8" style={{ color: "#22C55E" }} />
                <p className="text-sm" style={{ color: "#999" }}>Tudo em dia! Nenhuma notificação.</p>
              </div>
            ) : (
              <>
                {urgent.length > 0 && (
                  <>
                    <div className="px-4 py-2" style={{ background: "rgba(239,68,68,0.04)" }}>
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#EF4444" }}>Urgente</span>
                    </div>
                    {urgent.map((n, i) => <NotifItem key={n.id} n={n} onClick={handleClick} timeAgo={timeAgo} showDivider={i < urgent.length - 1} />)}
                  </>
                )}
                {attention.length > 0 && (
                  <>
                    <div className="px-4 py-2" style={{ background: "rgba(245,158,11,0.04)" }}>
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#F59E0B" }}>Atenção</span>
                    </div>
                    {attention.map((n, i) => <NotifItem key={n.id} n={n} onClick={handleClick} timeAgo={timeAgo} showDivider={i < attention.length - 1} />)}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotifItem({ n, onClick, timeAgo, showDivider }) {
  const Icon = ICON_MAP[n.icon] || Bell;
  return (
    <>
      <button
        onClick={() => onClick(n)}
        className="w-full text-left px-4 py-3 flex items-start gap-3 transition-colors"
        style={{ background: n.isRead ? "transparent" : "rgba(240,192,0,0.06)" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(240,192,0,0.10)"}
        onMouseLeave={e => e.currentTarget.style.background = n.isRead ? "transparent" : "rgba(240,192,0,0.06)"}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${n.iconColor}18` }}>
          <Icon className="w-4 h-4" style={{ color: n.iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "#1A1A1A" }}>{n.title}</p>
          <p className="text-xs mt-0.5" style={{ color: "#555" }}>{n.label}</p>
          <p className="text-xs mt-0.5" style={{ color: "#bbb" }}>{timeAgo(n.createdAt)}</p>
        </div>
        {!n.isRead && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: "#F0C000" }} />}
      </button>
      {showDivider && <div className="mx-4 h-px" style={{ background: "rgba(0,0,0,0.05)" }} />}
    </>
  );
}