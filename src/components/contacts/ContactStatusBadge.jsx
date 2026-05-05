import React from "react";
import { STATUS_CONFIG } from "@/lib/ufData";

export default function ContactStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: "#F3F4F6", color: "#6B7280" };
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}