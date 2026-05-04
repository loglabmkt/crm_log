import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function NavProgressBar() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setProgress(0);
    const t1 = setTimeout(() => setProgress(70), 50);
    const t2 = setTimeout(() => setProgress(100), 400);
    const t3 = setTimeout(() => setVisible(false), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[999] h-[3px]" style={{ background: "rgba(240,192,0,0.15)" }}>
      <div
        className="h-full transition-all"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #F0C000, #C49A00)",
          transition: progress === 0 ? "none" : "width 350ms ease",
          boxShadow: "0 0 8px rgba(240,192,0,0.6)",
        }}
      />
    </div>
  );
}