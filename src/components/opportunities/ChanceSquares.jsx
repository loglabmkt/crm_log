import React, { useState } from "react";

export default function ChanceSquares({ value = 0, size = 14, gap = 3, interactive = false, onChange }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="flex items-center" style={{ gap }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = interactive
          ? (hovered !== null ? n <= hovered : n <= value)
          : n <= value;
        return (
          <div
            key={n}
            onClick={interactive ? () => onChange?.(n) : undefined}
            onMouseEnter={interactive ? () => setHovered(n) : undefined}
            onMouseLeave={interactive ? () => setHovered(null) : undefined}
            style={{
              width: size,
              height: size,
              borderRadius: 2,
              background: filled ? "#F0C000" : "rgba(240,192,0,0.20)",
              cursor: interactive ? "pointer" : "default",
              flexShrink: 0,
              transition: "background 0.1s",
            }}
          />
        );
      })}
    </div>
  );
}