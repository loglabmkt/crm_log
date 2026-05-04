import React from "react";

export default function GlassCard({ children, className = "", hover = true, ...props }) {
  return (
    <div
      className={`rounded-2xl p-5 transition-all duration-200 ${hover ? "hover:-translate-y-0.5" : ""} ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.60)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.90)",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
      }}
      onMouseEnter={hover ? (e) => {
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.10)";
      } : undefined}
      onMouseLeave={hover ? (e) => {
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(0, 0, 0, 0.06)";
      } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}