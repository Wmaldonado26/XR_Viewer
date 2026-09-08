import React from "react";

export default function InformationBubbleHotspot({ text }) {
  return (
    <div style={{
      background: "rgba(0,0,0,0.7)",
      color: "#fff",
      padding: "8px 12px",
      borderRadius: "6px",
      fontSize: "14px",
      whiteSpace: "nowrap",
      pointerEvents: "none",
      boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
    }}>
      {text}
    </div>
  );
}
