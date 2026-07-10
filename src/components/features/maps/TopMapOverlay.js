import React, { useEffect, useMemo, useRef, useState } from "react";
import "./TopMapOverlay.css";
import {
  FaTimes,
  FaSitemap,
  FaMap,
  FaChevronDown,
  FaChevronRight,
  FaCompressAlt,
  FaExpandAlt,
  FaThumbtack,
  FaSearch,
  FaMapMarkerAlt,
} from "react-icons/fa";

/** % parser */
function pct(value) {
  const n =
    typeof value === "number"
      ? value
      : parseFloat(String(value || "0").replace("%", ""));
  return Number.isFinite(n) ? n : 0;
}

/** Normaliza zonas => { [zoneName]: { scenes: [...] } } */
function buildZonesTree(project) {
  const scenes = project?.scenes || {};
  const mapByZone = project?.settings?.mapByZone || {};

  // Armamos lista plana con metadata útil
  const list = Object.entries(scenes).map(([sceneKey, scene]) => {
    const m = scene?.map || {};
    const zone = (m.zone || scene.zone || "Escenas").toString().trim() || "Escenas";

    const title = m.title || scene.title || sceneKey;
    const top = m.top;
    const left = m.left;

    // Hotspots: scene.hotSpots es un objeto {key: {...}}
    const hotSpotsObj = scene?.hotSpots || {};
    const hotSpots = Object.entries(hotSpotsObj).map(([hk, hv]) => ({
      key: hk,
      label: hv?.label || hv?.title || hk,
      type: hv?.cssClass || hv?.type || "hotspot",
      sceneTarget: hv?.scene || "",
    }));

    return {
      sceneKey,
      zone,
      title,
      top,
      left,
      hasCoords: top !== undefined && left !== undefined,
      hotSpots,
      raw: scene,
    };
  });

  // Group by zone (usando mapByZone para asignar mapas por zona)
  const zones = {};
  for (const item of list) {
    if (!zones[item.zone]) zones[item.zone] = { zone: item.zone, scenes: [] };
    zones[item.zone].scenes.push(item);
  }

  // Ordena zonas y escenas
  const zoneKeys = Object.keys(zones).sort((a, b) => a.localeCompare(b, "es"));
  const ordered = {};
  for (const zk of zoneKeys) {
    ordered[zk] = zones[zk];
    ordered[zk].scenes.sort((a, b) => a.title.localeCompare(b.title, "es"));
  }

  return ordered;
}

/** Resuelve la imagen del plano (mapa) en settings.map */
function resolveMapImage(project, zoneName) {
  const mapByZone = project?.settings?.mapByZone || {};

  // Primero busca en mapByZone para ver si existe un mapa específico por zona
  if (mapByZone[zoneName] && mapByZone[zoneName].mapUrl) {
    return mapByZone[zoneName].mapUrl.trim(); // Si hay un mapa para esta zona, lo retorna
  }

  return "";
}

/** Nodo de escena (con hotspots) */
function SceneNode({ scene, isActive, onGo }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="tm-scene">
      <button
        type="button"
        className={`tm-scene-btn ${isActive ? "active" : ""}`}
        onClick={() => onGo(scene.sceneKey)}
        title={`Ir a: ${scene.title}`}
      >
        <span className="tm-scene-btn__left">
          <span className={`tm-dot ${isActive ? "active" : ""}`} />
          <span className="tm-scene-btn__title">{scene.title}</span>
        </span>

        <span className="tm-scene-btn__right">
          <FaMapMarkerAlt />
        </span>
      </button>

      <button
        type="button"
        className="tm-scene-hotspots-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title={open ? "Ocultar hotspots" : "Ver hotspots"}
      >
        {open ? <FaChevronDown /> : <FaChevronRight />}
        <span>Hotspots</span>
        <span className="tm-badge">{scene.hotSpots?.length || 0}</span>
      </button>

      {open && (
        <div className="tm-hotspots">
          {(scene.hotSpots || []).length ? (
            scene.hotSpots.map((h) => (
              <div key={`${scene.sceneKey}_${h.key}`} className="tm-hotspot-row">
                <span className="tm-hotspot-label" title={h.label}>
                  {h.label}
                </span>
                <span className="tm-hotspot-type" title={h.type}>
                  {h.type}
                </span>
              </div>
            ))
          ) : (
            <div className="tm-empty-small">Esta escena no tiene hotspots.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TopMapOverlay({
  project,
  onHotspotClick,
  currentSceneKey,
  onClose,
  mapHeading = 0,
  currentHfov = 140,
}) {
  // ============ SAFE PROJECT (hooks always) ============
  const safeProject = useMemo(
    () => project || { scenes: {}, settings: { map: {} } },
    [project]
  );

  // ============ DATA ============
  const zonesTree = useMemo(() => buildZonesTree(safeProject), [safeProject]);

  // Obtenemos la zona para la escena actual
  const currentZoneId = useMemo(() => {
    const scene = safeProject?.scenes?.[currentSceneKey];
    return scene?.map?.zoneId || "Sin zona";
  }, [safeProject, currentSceneKey]);

  // Obtenemos el nombre de la zona
  const zoneName = useMemo(() => {
    const experiences = safeProject?.experiences || project?.experiences || [];
    const zone = experiences.find((exp) => exp.id === currentZoneId);
    return zone ? zone.name : "Zona Desconocida";
  }, [safeProject, project, currentZoneId]);

  const planImage = useMemo(() => resolveMapImage(safeProject, currentZoneId), [safeProject, currentZoneId]);
  const hasPlan = !!planImage;

  // ============ UI STATE ============
  const [activeTab, setActiveTab] = useState("map"); // "zones" | "map"
  const [isMinimized, setIsMinimized] = useState(false); // dock closed, rail visible
  const [isPinned, setIsPinned] = useState(true); // fijo (no se auto-minimiza)
  const [query, setQuery] = useState("");

  const [zoneOpen, setZoneOpen] = useState(() => {
    try {
      const raw = localStorage.getItem("tm_zoneOpen");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("tm_zoneOpen", JSON.stringify(zoneOpen));
    } catch {}
  }, [zoneOpen]);

  const dockRef = useRef(null);
  const wrapperRef = useRef(null);
  const imgRef = useRef(null);

  const [isNavigating, setIsNavigating] = useState(false);
  const [lastClicked, setLastClicked] = useState("");

  const handleGoScene = async (sceneKey) => {
    if (!sceneKey || typeof onHotspotClick !== "function") return;

    setIsNavigating(true);
    setLastClicked(sceneKey);

    if (!isPinned) setIsMinimized(true);

    try {
      await onHotspotClick(sceneKey);
    } finally {
      setTimeout(() => setIsNavigating(false), 220);
    }
  };

  const filteredZones = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return zonesTree;

    const out = {};
    for (const [zoneName, z] of Object.entries(zonesTree)) {
      const zoneMatch = zoneName.toLowerCase().includes(q);
      const scenes = (z.scenes || []).filter((s) => {
        const sceneMatch = s.title.toLowerCase().includes(q) || s.sceneKey.toLowerCase().includes(q);

        const hsMatch = (s.hotSpots || []).some((h) => {
          const a = (h.label || "").toLowerCase();
          const b = (h.type || "").toLowerCase();
          const c = (h.sceneTarget || "").toLowerCase();
          return a.includes(q) || b.includes(q) || c.includes(q);
        });

        return zoneMatch || sceneMatch || hsMatch;
      });

      if (scenes.length) out[zoneName] = { ...z, scenes };
    }

    return out;
  }, [zonesTree, query]);

  const [imageRect, setImageRect] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const [wrapperSize, setWrapperSize] = useState({ w: 1, h: 1 });

  const updateRects = () => {
    const w = wrapperRef.current;
    const img = imgRef.current;
    if (!w || !img) return;

    const wRect = w.getBoundingClientRect();
    const iRect = img.getBoundingClientRect();

    setImageRect({
      left: Math.max(0, iRect.left - wRect.left),
      top: Math.max(0, iRect.top - wRect.top),
      width: Math.max(0, iRect.width),
      height: Math.max(0, iRect.height),
    });

    setWrapperSize({
      w: Math.max(1, Math.round(wRect.width)),
      h: Math.max(1, Math.round(wRect.height)),
    });
  };

  useEffect(() => {
    requestAnimationFrame(updateRects);

    const w = wrapperRef.current;
    let ro = null;

    if (w && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => requestAnimationFrame(updateRects));
      ro.observe(w);
    }

    const onResize = () => requestAnimationFrame(updateRects);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (ro) ro.disconnect();
    };
  }, [planImage, activeTab, isMinimized]);

  const mapPoints = useMemo(() => {
    const scenes = safeProject?.scenes || {};
    return Object.entries(scenes)
      .map(([sceneKey, scene]) => {
        const m = scene?.map || {};
        const top = m.top;
        const left = m.left;
        const zoneId = m.zoneId;
        
        // Filtrar por zona: solo mostrar escenas de la zona actual
        if (zoneId !== currentZoneId) return null;
        
        if (top === undefined || left === undefined) return null;

        return {
          id: `map_${sceneKey}`,
          sceneKey,
          top,
          left,
          title: m.title || scene.title || sceneKey,
        };
      })
      .filter(Boolean);
  }, [safeProject, currentZoneId]);

  const currentPoint = useMemo(() => {
    return mapPoints.find((p) => p.sceneKey === currentSceneKey) || null;
  }, [mapPoints, currentSceneKey]);

  const currentPx = useMemo(() => {
    if (!currentPoint) return null;
    if (!imageRect.width || !imageRect.height) return null;

    // Convertir coordenadas del espacio original al espacio rotado (270° horario)
    // En rotación 270° horario: (left_orig, top_orig) -> (top_orig, W - left_orig) en visual
    // imageRect tiene las dimensiones de la imagen rotada visualmente
    // width = altura original, height = ancho original
    const x = imageRect.left + (pct(currentPoint.top) / 100) * imageRect.width;
    const y = imageRect.top + ((100 - pct(currentPoint.left)) / 100) * imageRect.height;

    return { x, y };
  }, [currentPoint, imageRect]);

  const cone = useMemo(() => {
    if (!currentPx) return null;

    const hfov = Number(currentHfov) || 140;
    const fovRad = (hfov * Math.PI) / 180;
    const halfFov = fovRad / 2;

    const base = Math.min(imageRect.width, imageRect.height);
    const radius = Math.max(60, Math.min(210, base * 0.25));

    const upAngle = -Math.PI / 2;
    const rot = ((Number(mapHeading) || 0) * Math.PI) / 180;

    const angL = upAngle - halfFov + rot;
    const angR = upAngle + halfFov + rot;
    const angC = upAngle + rot;

    const p0 = { x: currentPx.x, y: currentPx.y };
    const pL = { x: p0.x + Math.cos(angL) * radius, y: p0.y + Math.sin(angL) * radius };
    const pR = { x: p0.x + Math.cos(angR) * radius, y: p0.y + Math.sin(angR) * radius };
    const pC = { x: p0.x + Math.cos(angC) * radius, y: p0.y + Math.sin(angC) * radius };

    return { p0, pL, pR, pC };
  }, [currentPx, currentHfov, mapHeading, imageRect.width, imageRect.height]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const onDown = (e) => {
      if (isPinned) return;
      if (isMinimized) return;

      const isMobile = window.matchMedia?.("(max-width: 768px)")?.matches;
      if (isMobile) return;

      const dock = dockRef.current;
      if (dock && !dock.contains(e.target)) setIsMinimized(true);
    };

    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [isPinned, isMinimized]);

  useEffect(() => {
    setIsMinimized(false);
  }, []);

  if (!project) return null;

  const toggleZone = (zoneName) => {
    setZoneOpen((prev) => ({ ...prev, [zoneName]: !prev[zoneName] }));
  };

  const openDockAndTab = (tab) => {
    setActiveTab(tab);
    setIsMinimized(false);
  };

  return (
    <div className={`tm-root ${isMinimized ? "is-minimized" : ""}`} aria-label="Mapa y Zonas">
      {/* =================== RAIL (siempre visible) =================== */}
      <div className="tm-rail" aria-hidden={false}>
        <button
          type="button"
          className={`tm-rail-btn ${activeTab === "zones" ? "active" : ""}`}
          onClick={() => openDockAndTab("zones")}
          title="Zonas"
          aria-label="Zonas"
        >
          <FaSitemap />
        </button>

        <button
          type="button"
          className={`tm-rail-btn ${activeTab === "map" ? "active" : ""}`}
          onClick={() => openDockAndTab("map")}
          title="Mapa"
          aria-label="Mapa"
        >
          <FaMap />
        </button>

        <div className="tm-rail-spacer" />

        {isMinimized ? (
          <button
            type="button"
            className="tm-rail-btn"
            onClick={() => setIsMinimized(false)}
            title="Abrir panel"
            aria-label="Abrir panel"
          >
            <FaExpandAlt />
          </button>
        ) : (
          <button
            type="button"
            className="tm-rail-btn"
            onClick={() => setIsMinimized(true)}
            title="Minimizar panel"
            aria-label="Minimizar panel"
          >
            <FaCompressAlt />
          </button>
        )}
      </div>

      {/* =================== DOCK (panel deslizable) =================== */}
      <aside ref={dockRef} className="tm-dock" role="dialog" aria-modal="false" aria-hidden={isMinimized}>
        <div className="tm-dock-header">
          <div className="tm-dock-title">
            <span className="tm-dock-title__main">{activeTab === "zones" ? "Zonas" : "Mapa"}</span>
            <span className="tm-dock-title__sub">
              {activeTab === "zones"
                ? "Árbol de zonas · escenas · hotspots"
                : hasPlan
                ? `Plano de la zona: ${zoneName}`
                : "Sin plano cargado"}
            </span>
          </div>

          <div className="tm-actions">
            <button
              className={`tm-icon ${isPinned ? "active" : ""}`}
              onClick={() => setIsPinned((v) => !v)}
              title={isPinned ? "Panel fijado (clic para liberar)" : "Fijar panel"}
              aria-label="Fijar panel"
              type="button"
            >
              <FaThumbtack />
            </button>

            <button
              className="tm-icon"
              onClick={() => setIsMinimized(true)}
              title="Minimizar"
              aria-label="Minimizar"
              type="button"
            >
              <FaCompressAlt />
            </button>

            <button
              className="tm-close"
              onClick={onClose}
              title="Cerrar"
              aria-label="Cerrar"
              type="button"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* =================== SEARCH (solo en Zonas) =================== */}
        {activeTab === "zones" && (
          <div className="tm-search">
            <FaSearch className="tm-search__icon" />
            <input
              className="tm-search__input"
              placeholder="Buscar zona, escena o hotspot…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              spellCheck={false}
            />
            {query ? (
              <button
                type="button"
                className="tm-search__clear"
                onClick={() => setQuery("")}
                title="Limpiar"
              >
                ×
              </button>
            ) : null}
          </div>
        )}

        {/* =================== CONTENT =================== */}
        <div className="tm-content">
          {/* ---------- TAB: ZONAS ---------- */}
          {activeTab === "zones" && (
            <>
              {Object.keys(filteredZones).length ? (
                Object.entries(filteredZones).map(([zoneName, z]) => {
                  const open = zoneOpen[zoneName] ?? true;
                  const countScenes = z?.scenes?.length || 0;

                  return (
                    <div key={zoneName} className="tm-zone">
                      <button
                        type="button"
                        className="tm-zone-header"
                        onClick={() => toggleZone(zoneName)}
                        aria-expanded={open}
                        title={open ? "Contraer" : "Expandir"}
                      >
                        <span className="tm-zone-header__left">
                          {open ? <FaChevronDown /> : <FaChevronRight />}
                          <span className="tm-zone-header__title">{zoneName}</span>
                          <span className="tm-badge">{countScenes}</span>
                        </span>
                      </button>

                      {open && (
                        <div className="tm-zone-body">
                          {z.scenes.map((s) => (
                            <SceneNode
                              key={s.sceneKey}
                              scene={s}
                              isActive={currentSceneKey === s.sceneKey}
                              onGo={handleGoScene}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="tm-empty">
                  No hay resultados para <b>{query}</b>.
                </div>
              )}

              {isNavigating && (
                <div className="tm-toast" role="status" aria-live="polite">
                  Abriendo escena…{" "}
                  <b>{safeProject?.scenes?.[lastClicked]?.title || lastClicked}</b>
                </div>
              )}
            </>
          )}

          {/* ---------- TAB: MAPA ---------- */}
          {activeTab === "map" && (
            <>
              {!hasPlan ? (
                <div className="tm-warning">
                  No hay plano cargado en <b>el proyecto</b> para la zona <b>{zoneName}</b>.
                  <br />
                </div>
              ) : (
                <div ref={wrapperRef} className="tm-map">
                  <img
                    ref={imgRef}
                    src={planImage}
                    alt="Plano"
                    className="tm-map-img"
                    onLoad={() => requestAnimationFrame(updateRects)}
                    draggable={false}
                  />
                  {/* HFOV cone */}
                  {cone && (
                    <svg
                      className="tm-hfov"
                      width="100%"
                      height="100%"
                      viewBox={`0 0 ${wrapperSize.w} ${wrapperSize.h}`}
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path
                        d={`M ${cone.p0.x} ${cone.p0.y} L ${cone.pL.x} ${cone.pL.y} L ${cone.pR.x} ${cone.pR.y} Z`}
                        fill="rgba(59, 130, 246, 0.14)"
                        stroke="rgba(59, 130, 246, 0.85)"
                        strokeWidth="2"
                      />
                      <line
                        x1={cone.p0.x}
                        y1={cone.p0.y}
                        x2={cone.pC.x}
                        y2={cone.pC.y}
                        stroke="rgba(59, 130, 246, 0.45)"
                        strokeWidth="2"
                        strokeDasharray="6 6"
                      />
                      <circle
                        cx={cone.p0.x}
                        cy={cone.p0.y}
                        r="6"
                        fill="#f97316"
                        stroke="#ffffff"
                        strokeWidth="3"
                      />
                    </svg>
                  )}
                  {/* Pins */}
                  {mapPoints.map((p) => {
                    // Convertir coordenadas del espacio original al espacio rotado (270° horario)
                    // En rotación 270° horario: (left_orig, top_orig) -> (top_orig, W - left_orig) en visual
                    // imageRect tiene las dimensiones de la imagen rotada visualmente
                    // width = altura original, height = ancho original
                    const leftPx = imageRect.left + (pct(p.top) / 100) * imageRect.width;
                    const topPx = imageRect.top + ((100 - pct(p.left)) / 100) * imageRect.height;

                    const isActive = currentSceneKey === p.sceneKey;
                    const isPending = isNavigating && lastClicked === p.sceneKey;

                    return (
                      <button
                        key={p.id}
                        className={`tm-pin ${isActive ? "active" : ""} ${isPending ? "pending" : ""}`}
                        style={{ top: `${topPx}px`, left: `${leftPx}px` }}
                        onClick={() => handleGoScene(p.sceneKey)}
                        title={p.title || p.sceneKey}
                        aria-label={p.title || p.sceneKey}
                        disabled={!p.sceneKey || isNavigating}
                        type="button"
                      />
                    );
                  })}
                </div>
              )}

              {isNavigating && (
                <div className="tm-toast" role="status" aria-live="polite">
                  Abriendo escena…{" "}
                  <b>{safeProject?.scenes?.[lastClicked]?.title || lastClicked}</b>
                </div>
              )}

              <div className="tm-hint">
                Tip: el cono representa el HFOV (hacia dónde “mira” el 360 en el plano).
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
