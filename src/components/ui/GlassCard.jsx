import React from "react";

export default function GlassCard({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.04)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(240, 192, 0, 0.15)",
        boxShadow: "0 4px 24px rgba(240, 192, 0, 0.08)",
      }}
      {...props}
    >
      {children}
    </div>
  );
}