import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import ReactDOM from "react-dom";
import { FaChevronRight, FaMapMarkedAlt } from "react-icons/fa";
import "./MiniMapWidget.css";
/* ===========================
   CONFIG
=========================== */

const HFOV_MODE = "VISUAL"; // VISUAL = mapa rota, foco fijo

/* ===========================
   HELPERS
=========================== */

const getMapForScene = (project, currentSceneKey) => {
  const scene = project?.scenes?.[currentSceneKey];
  let zoneId = scene?.map?.zoneId || scene?.zoneId || scene?.zone;
  
  if (!zoneId && project?.experiences) {
    const exp = project.experiences.find(e => e.startScene === currentSceneKey || e.id === currentSceneKey);
    if (exp) zoneId = exp.id;
  }
  
  return project?.settings?.mapByZone?.[zoneId]?.mapUrl || "";
};

const getScenePoint = (project, currentSceneKey) => {
  const scene = project?.scenes?.[currentSceneKey];
  if (!scene) return null;
  
  const m = scene?.map;
  if (m && m.left !== undefined && m.top !== undefined) {
    return { left: m.left, top: m.top };
  }
  if (scene.left !== undefined && scene.top !== undefined) {
    return { left: scene.left, top: scene.top };
  }
  return null;
};

/* ===========================
   COMPONENT
=========================== */

const Widget = ({
  project,
  currentSceneKey,
  currentYaw = 0,
  currentHfov = 120,
  isMapOpen = false,
  onOpenFullMap,
}) => {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const rafRef = useRef(0);

  const [planImage, setPlanImage] = useState("");
  const [canvasSize, setCanvasSize] = useState(160);
  const [isMinimized, setIsMinimized] = useState(false);

  const scenePoint = useMemo(
    () => getScenePoint(project, currentSceneKey),
    [project, currentSceneKey]
  );

  /* ===========================
     MAP LOAD
  =========================== */

  useEffect(() => {
    setPlanImage(getMapForScene(project, currentSceneKey));
  }, [project, currentSceneKey]);

  useEffect(() => {
    if (!planImage) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = planImage;

    img.onload = () => {
      imgRef.current = img;
      draw();
    };
  }, [planImage]);

  /* ===========================
     RESPONSIVE CANVAS
  =========================== */

  useEffect(() => {
    if (!canvasRef.current) return;
    const parent = canvasRef.current.parentElement;
    if (!parent) return;

    const ro = new ResizeObserver(([entry]) => {
      const size = Math.min(
        entry.contentRect.width,
        entry.contentRect.height
      );
      setCanvasSize(size);
    });

    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  /* ===========================
     DRAW
  =========================== */

  const draw = useCallback(() => {
    cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (!canvas || !img || !scenePoint) return;

      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;

      canvas.width = canvasSize * dpr;
      canvas.height = canvasSize * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvasSize, canvasSize);

      drawCanvas(
        ctx,
        
        img,
        canvasSize,
        scenePoint.left,
        scenePoint.top,
        currentYaw,
        currentHfov
      );
    });
  }, [scenePoint, currentYaw, currentHfov, canvasSize]);

  useEffect(() => {
    draw();
  }, [draw]);

  /* ===========================
     CORE DRAW (CORRECTO)
  =========================== */

  const drawCanvas = (
    ctx,
    img,
    size,
    left,
    top,
    yaw,
    hfov
  ) => {
    const center = size / 2;
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    /* ===== HOTSPOT EN MAPA ===== */
    const hotspotX = (left / 100) * imgW;
    const hotspotY = (top / 100) * imgH;

    /* ===== ZOOM ADAPTATIVO ===== */
    const base = Math.min(imgW, imgH);
    const zoom =
      size < 120 ? 3.8 :
      size < 160 ? 3.2 :
      2.6;

    const cropSize = base / zoom;

    let cropX = hotspotX - cropSize / 2;
    let cropY = hotspotY - cropSize / 2;

    const SAFE_MARGIN =
      size < 140 ? cropSize * 0.3 :
      size < 180 ? cropSize * 0.22 :
      cropSize * 0.15;

    cropX = Math.max(
      SAFE_MARGIN,
      Math.min(cropX, imgW - cropSize - SAFE_MARGIN)
    );

    cropY = Math.max(
      SAFE_MARGIN,
      Math.min(cropY, imgH - cropSize - SAFE_MARGIN)
    );

    /* ===== MAPA (FOCO FIJO) ===== */
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((-yaw * Math.PI) / 180);
    ctx.translate(-center, -center);

    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropSize,
      cropSize,
      0,
      0,
      size,
      size
    );

    ctx.restore();

    /* ===== HFOV (DEBAJO DEL PUNTO) ===== */
    const hfovRad = (hfov * Math.PI) / 180;
    const half = hfovRad / 2;
    const hfovRadius = Math.min(70, 120 / zoom);

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(-Math.PI / 2);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, hfovRadius, -half, half);
    ctx.closePath();
    ctx.fillStyle = "rgba(255,60,60,0.25)";
    ctx.fill();

    ctx.restore();

    /* ===== PUNTO (SIEMPRE ARRIBA) ===== */
    const pointRadius = Math.max(4, 9 / zoom);

    // borde blanco
    ctx.beginPath();
    ctx.arc(center, center, pointRadius + 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // punto rojo
    ctx.beginPath();
    ctx.arc(center, center, pointRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#ff2d2d";
    ctx.fill();
  };

  /* ===========================
     RENDER
  =========================== */

  return ReactDOM.createPortal(
    <div className={`mini-map-portal ${isMapOpen ? "is-hidden" : ""} ${isMinimized ? "minimized" : ""}`}>

      <button
        className="mini-map-widget"
        onClick={onOpenFullMap}
        type="button"
      >
        {planImage ? <canvas ref={canvasRef} /> : <div>Mapa no disponible</div>}
      </button>
    </div>,
    document.body
  );
};

export default Widget;
