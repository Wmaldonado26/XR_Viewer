import React, { useState } from "react";
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

const TopMapOverlayView = ({
  project,
  onHotspotClick,
  currentSceneKey,
  onClose,
  mapHeading = 0,
  currentHfov = 140,
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
  imageRect,
  wrapperSize,
  updateRects,
  mapPoints,
  computePinPosition,
  hasProject,
}) => {
  if (!hasProject) return null;

  return (
    <div className="tm-modal-backdrop" onClick={(e) => {
      if (e.target.classList.contains('tm-modal-backdrop')) {
        if (typeof onClose === 'function') onClose();
      }
    }}>
      <div className="tm-modal-content">
        {!hasPlan ? (
          <div className="tm-warning" style={{ padding: '20px', background: '#fff', borderRadius: '12px', color: '#333' }}>
            No hay plano cargado en el proyecto para la zona <b>{zoneName}</b>.
            <br />
            <button
              onClick={onClose}
              style={{ marginTop: '10px', padding: '6px 12px', cursor: 'pointer' }}
            >
              Cerrar
            </button>
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
            {imageRect.width > 0 && (
              <div className="map-image-container" style={{
                position: 'absolute',
                top: imageRect.top,
                left: imageRect.left,
                width: imageRect.width,
                height: imageRect.height,
                pointerEvents: 'none',
                zIndex: 10
              }}>
                <button
                  className="map-close-button"
                  onClick={onClose}
                  title="Cerrar mapa"
                  aria-label="Cerrar mapa"
                  style={{ pointerEvents: 'auto' }}
                  type="button"
                >
                  <FaTimes />
                </button>
              </div>
            )}
            {mapPoints.map((p) => {
              const { topPx, leftPx } = computePinPosition(p);
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
      </div>
    </div>
  );
};

export default TopMapOverlayView;
