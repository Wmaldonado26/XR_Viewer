import { useEffect, useMemo, useRef, useState, useCallback } from "react";

function pct(value) {
  const n =
    typeof value === "number"
      ? value
      : parseFloat(String(value || "0").replace("%", ""));
  return Number.isFinite(n) ? n : 0;
}

function buildZonesTree(project) {
  const scenes = project?.scenes || {};
  const mapByZone = project?.settings?.mapByZone || {};

  const list = Object.entries(scenes).map(([sceneKey, scene]) => {
    const m = scene?.map || {};
    const zone = (m.zone || scene.zone || "Escenas").toString().trim() || "Escenas";

    const title = m.title || scene.title || sceneKey;
    const top = m.top;
    const left = m.left;

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

  const zones = {};
  for (const item of list) {
    if (!zones[item.zone]) zones[item.zone] = { zone: item.zone, scenes: [] };
    zones[item.zone].scenes.push(item);
  }

  const zoneKeys = Object.keys(zones).sort((a, b) => a.localeCompare(b, "es"));
  const ordered = {};
  for (const zk of zoneKeys) {
    ordered[zk] = zones[zk];
    ordered[zk].scenes.sort((a, b) => a.title.localeCompare(b.title, "es"));
  }

  return ordered;
}

function resolveMapImage(project, zoneName) {
  const mapByZone = project?.settings?.mapByZone || {};

  if (mapByZone[zoneName] && mapByZone[zoneName].mapUrl) {
    return mapByZone[zoneName].mapUrl.trim();
  }

  return "";
}

function buildAllZones(safeProject, zonesTree) {
  const scenes = safeProject?.scenes || {};
  const experiences = safeProject?.experiences || [];
  const mapByZone = safeProject?.settings?.mapByZone || {};

  if (experiences.length) {
    return experiences.map(exp => {
      const expId = exp.id;
      const expName = exp.name || expId;

      let countScenes = 0;
      let firstSceneKey = null;
      for (const [k, s] of Object.entries(scenes)) {
        const zid = s?.map?.zoneId || s?.zoneId || s?.zone;
        if (zid !== expId) continue;
        countScenes += 1;
        if (!firstSceneKey) firstSceneKey = k;
      }

      if (countScenes === 0) {
        for (const [zName, zData] of Object.entries(zonesTree)) {
          if (zName === expName || zName === expId) {
            countScenes = zData.scenes.length;
            if (zData.scenes[0]) firstSceneKey = zData.scenes[0].sceneKey;
            break;
          }
        }
      }

      if (countScenes === 0) {
        const ks = Object.keys(scenes);
        if (exp.startScene && scenes[exp.startScene]) {
          firstSceneKey = exp.startScene;
          countScenes = 1;
        } else if (ks.length) {
          firstSceneKey = ks[0];
          countScenes = ks.length;
        }
      }

      return {
        id: expId,
        name: expName,
        countScenes,
        firstSceneKey,
        hasMap: !!(mapByZone[expId]?.mapUrl || exp.mapUrl),
      };
    });
  }

  return Object.entries(zonesTree).map(([zName, zData]) => ({
    id: zName,
    name: zName,
    countScenes: zData?.scenes?.length || 0,
    firstSceneKey: zData?.scenes?.[0]?.sceneKey || null,
    hasMap: !!mapByZone[zName]?.mapUrl,
  }));
}

export default function useTopMapOverlayLogic({
  project,
  onHotspotClick,
  currentSceneKey,
  onClose,
  mapHeading = 0,
  currentHfov = 140,
  forcedZoneId,
}) {
  const safeProject = useMemo(
    () => project || { scenes: {}, settings: { map: {} } },
    [project]
  );

  const zonesTree = useMemo(() => buildZonesTree(safeProject), [safeProject]);

  const currentZoneId = useMemo(() => {
    const scene = safeProject?.scenes?.[currentSceneKey];
    return scene?.map?.zoneId || scene?.zoneId || scene?.zone || "Sin zona";
  }, [safeProject, currentSceneKey]);

  const allZones = useMemo(() => buildAllZones(safeProject, zonesTree), [safeProject, zonesTree]);

  const [selectedZoneId, setSelectedZoneId] = useState(forcedZoneId || currentZoneId);

  useEffect(() => {
    if (forcedZoneId) {
      setSelectedZoneId(forcedZoneId);
    }
  }, [forcedZoneId]);

  useEffect(() => {
    if (!forcedZoneId) {
      setSelectedZoneId(prev => {
        if (prev && currentZoneId && prev !== currentZoneId) {
          return currentZoneId;
        }
        if (!prev && currentZoneId) return currentZoneId;
        if (!prev && allZones.length) return allZones[0].id;
        return prev;
      });
    }
  }, [currentZoneId, allZones, forcedZoneId]);

  const selectedZone = useMemo(() => {
    const direct = allZones.find(z => z.id === selectedZoneId);
    if (direct) return direct;
    const byName = allZones.find(z => z.name === selectedZoneId);
    return byName || (allZones[0] || null);
  }, [allZones, selectedZoneId]);

  const effectiveZoneId = selectedZone?.id || selectedZoneId || currentZoneId;

  const zoneName = useMemo(() => {
    if (selectedZone?.name) return selectedZone.name;
    const experiences = safeProject?.experiences || project?.experiences || [];
    const zone = experiences.find((exp) => exp.id === effectiveZoneId);
    return zone ? zone.name : (effectiveZoneId || "Zona Desconocida");
  }, [safeProject, project, effectiveZoneId, selectedZone]);

  const planImage = useMemo(() => resolveMapImage(safeProject, effectiveZoneId), [safeProject, effectiveZoneId]);
  const hasPlan = !!planImage;

  const [activeTab, setActiveTab] = useState("map");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPinned, setIsPinned] = useState(true);
  const [query, setQuery] = useState("");

  const selectZoneId = useCallback((zid) => {
    if (!zid) return;
    setSelectedZoneId(String(zid));
  }, []);

  const handleGoFirstSceneOfZone = useCallback(async (zid) => {
    const target = allZones.find(z => z.id === zid || z.name === zid);
    const key = target?.firstSceneKey;
    if (!key || typeof onHotspotClick !== "function") return;
    setSelectedZoneId(target.id);
    setIsNavigating(true);
    setLastClicked(key);
    if (!isPinned) setIsMinimized(true);
    try {
      await onHotspotClick(key);
    } finally {
      setTimeout(() => setIsNavigating(false), 220);
    }
  }, [allZones, onHotspotClick, isPinned]);

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

  const handleGoScene = useCallback(async (sceneKey) => {
    if (!sceneKey || typeof onHotspotClick !== "function") return;

    setIsNavigating(true);
    setLastClicked(sceneKey);

    if (!isPinned) setIsMinimized(true);

    try {
      await onHotspotClick(sceneKey);
    } finally {
      setTimeout(() => setIsNavigating(false), 220);
    }
  }, [onHotspotClick, isPinned]);

  const filteredZones = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return zonesTree;

    const out = {};
    for (const [zName, z] of Object.entries(zonesTree)) {
      const zoneMatch = zName.toLowerCase().includes(q);
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

      if (scenes.length) out[zName] = { ...z, scenes };
    }

    return out;
  }, [zonesTree, query]);

  const [imageRect, setImageRect] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const [wrapperSize, setWrapperSize] = useState({ w: 1, h: 1 });

  const updateRects = useCallback(() => {
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
  }, []);

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
  }, [planImage, activeTab, isMinimized, updateRects]);

  const mapPoints = useMemo(() => {
    const scenes = safeProject?.scenes || {};
    return Object.entries(scenes)
      .map(([sceneKey, scene]) => {
        const m = scene?.map || {};
        const top = m.top;
        const left = m.left;
        const zoneId = m.zoneId;

        if (zoneId !== effectiveZoneId) {
          const zName = scene?.zone || scene?.map?.zone;
          if (zName !== effectiveZoneId) return null;
        }

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
  }, [safeProject, effectiveZoneId]);

  const currentPoint = useMemo(() => {
    return mapPoints.find((p) => p.sceneKey === currentSceneKey) || null;
  }, [mapPoints, currentSceneKey]);

  const currentPx = useMemo(() => {
    if (!currentPoint) return null;
    if (!imageRect.width || !imageRect.height) return null;

    const x = imageRect.left + (pct(currentPoint.left) / 100) * imageRect.width;
    const y = imageRect.top + (pct(currentPoint.top) / 100) * imageRect.height;

    return { x, y };
  }, [currentPoint, imageRect]);


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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (typeof onClose === "function") {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const toggleZone = (zName) => {
    setZoneOpen((prev) => ({ ...prev, [zName]: !prev[zName] }));
  };

  const openDockAndTab = (tab) => {
    setActiveTab(tab);
    setIsMinimized(false);
  };

  const computePinPosition = (p) => {
    const leftPx = imageRect.left + (pct(p.left) / 100) * imageRect.width;
    const topPx = imageRect.top + (pct(p.top) / 100) * imageRect.height;
    return { topPx, leftPx };
  };

  const hasProject = !!project;

  return {
    safeProject,
    zonesTree,
    currentZoneId,
    allZones,
    selectedZoneId,
    effectiveZoneId,
    selectedZone,
    zoneName,
    planImage,
    hasPlan,
    activeTab,
    setActiveTab,
    isMinimized,
    setIsMinimized,
    isPinned,
    setIsPinned,
    query,
    setQuery,
    zoneOpen,
    dockRef,
    wrapperRef,
    imgRef,
    isNavigating,
    lastClicked,
    handleGoScene,
    selectZoneId,
    handleGoFirstSceneOfZone,
    filteredZones,
    imageRect,
    wrapperSize,
    updateRects,
    mapPoints,
    currentPoint,
    currentPx,
    toggleZone,
    openDockAndTab,
    computePinPosition,
    hasProject,
  };
}
