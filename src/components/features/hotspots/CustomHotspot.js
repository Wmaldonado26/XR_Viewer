// src/components/CustomHotspot.jsx
import React, { useMemo, useState } from "react";
import { LuArrowRight, LuPaperclip, LuInfo } from "react-icons/lu";
import "./CustomHotspot.css";

/**
 * type:
 * - "nav"     => navegación (moveScene)
 * - "element" => elemento con anexos (hotSpotElement)
 * - "info"    => info (infoHotspot)
 */
export default function CustomHotspot({ previewImage, label, type = "nav" }) {
  const [isActive, setActive] = useState(false);

  const meta = useMemo(() => {
    if (type === "element")
      return { cls: "hs--element", Icon: LuPaperclip, aria: "Elemento" };
    if (type === "info") return { cls: "hs--info", Icon: LuInfo, aria: "Info" };
    return { cls: "hs--nav", Icon: LuArrowRight, aria: "Navegación" };
  }, [type]);

  const Icon = meta.Icon;

  return (
    <div
      className={`hs-root ${meta.cls} ${isActive ? "active" : ""}`}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onTouchStart={() => setActive(true)}
      onTouchEnd={() => setActive(false)}
      aria-label={meta.aria}
      title={label || meta.aria}
    >
      {/* Anillo externo */}
      <div className="hs-ring" />

      {/* Botón central */}
      <div className="hs-core">
        <Icon className="hs-ico" />
      </div>

      {/* Preview */}
      {previewImage ? (
        <img
          className="hs-preview"
          src={previewImage}
          alt={label || "Preview"}
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      ) : null}

      {/* Label */}
      {label ? <div className="hs-label">{label}</div> : null}
    </div>
  );
}
