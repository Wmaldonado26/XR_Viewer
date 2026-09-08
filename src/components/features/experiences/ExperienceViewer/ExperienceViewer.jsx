import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { FaArrowLeft, FaMapMarkedAlt, FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import { Pannellum } from "pannellum-react";

import CustomHotspot from "../../hotspots/CustomHotspot";
import HotspotModal from "../../hotspots/HotspotModal";
import InformationBubbleHotspot from "../../hotspots/InformationBubbleHotspot";
import InfoSidebar from "../../../ui/InfoSidebar/InfoSidebar";
import DynamicNavbar from "../../../layout/Navbar/DynamicNavbar";
import DynamicBreadcrumbs from "../../../ui/DynamicBreadcrumbs/DynamicBreadcrumbs";
import TopMapOverlay from "../../maps/TopMapOverlay";

import "../../../../styles/index.css";
import "./ExperienceViewer.css";
import xrlabLogo from "../../../../assets/images/xrlab.png";

export const ExperienceViewerTemplate = ({
  logic,
  selectedExperience,
  onBackToSelector,
  darkMode,
  onToggleDarkMode,
  navigate,
  projectId,
}) => {
  const {
    project,
    allProjects,
    scene,
    scenes,
    sceneKeys,
    activeSceneKeys,
    modalOpen, setModalOpen,
    modalContent, setModalContent,
    infoSidebarOpen, setInfoSidebarOpen,
    currentInfoContent,
    autoRotate,
    userInteracting,
    showCarousel, setShowCarousel,
    currentHfov,
    mapOverlayOpen, setMapOverlayOpen,
    forcedMapZoneId, setForcedMapZoneId,
    activeZoneId,
    setPannellumRef,
    carouselRef,
    isDragging,
    navigateToScenePreserveOrientation,
    getNavPreview,
    getThumbnailFor,
    handleUserInteraction,
    handleMouseDown,
    handleMouseLeave,
    handleMouseUp,
    handleMouseMove,
    zonesNavigationList,
    changeZone,
    handleMiniMapClick,
    mapHeading,
  } = logic;
  const hotspotRoots = useRef(new Map());


  // GESTIÓN DE MEMORIA: Limpiar los roots de React de los hotspots al cambiar de escena o desmontar
  useEffect(() => {
    return () => {
      hotspotRoots.current.forEach(root => {
        try { root.unmount(); } catch (e) {}
      });
      hotspotRoots.current.clear();
    };
  }, [scene?.key]);

  const showZoneButton = !!(zonesNavigationList && zonesNavigationList.length);

  const renderHotspot = (element, i) => {
    const css = element.cssClass;

    if (css === "moveScene") {
      const navPreview = getNavPreview(element);
      return (
        <Pannellum.Hotspot
          key={i}
          type={element.type || "custom"}
          yaw={element.yaw}
          pitch={element.pitch}
          cssClass="moveScene"
          tooltip={(hotSpotDiv) => {
            const root = ReactDOM.createRoot(hotSpotDiv);
            hotspotRoots.current.set(hotSpotDiv, root);
            root.render(
              <CustomHotspot previewImage={navPreview} label={element.label} type="nav" />
            );
          }}
          tooltipArg={element}
          handleClick={() => {
            if (element.scene) navigateToScenePreserveOrientation(element.scene);
          }}
        />
      );
    }

    if (css === "hotSpotElement") {
      return (
        <Pannellum.Hotspot
          key={i}
          type={element.type || "custom"}
          yaw={element.yaw}
          pitch={element.pitch}
          cssClass="hotSpotElement"
          tooltip={(hotSpotDiv) => {
            const root = ReactDOM.createRoot(hotSpotDiv);
            hotspotRoots.current.set(hotSpotDiv, root);
            root.render(
              <CustomHotspot
                previewImage={element.previewImage}
                label={element.label || element.title}
                type="element"
              />
            );
          }}
          tooltipArg={element}
          handleClick={() => {
           setModalContent({
              hotspotType: "element",
              title: element.title || element.label || "Elemento",
              description: element.description || "",
              attachments: Array.isArray(element.attachments) ? element.attachments : [],
            });
            setModalOpen(true); 
          }}
        />
      );
    }

    if (css === "infoHotspot") {
      return (
        <Pannellum.Hotspot
          key={i}
          type="custom"
          yaw={element.yaw}
          pitch={element.pitch}
          cssClass="infoHotspot"
          tooltip={(hotSpotDiv) => {
            const root = ReactDOM.createRoot(hotSpotDiv);
            hotspotRoots.current.set(hotSpotDiv, root);
            root.render(
              <CustomHotspot
                previewImage={element.previewImage}
                label={element.label || element.title}
                type="info"
              />
            );
          }}
          handleClick={() => {
            setModalContent({
              hotspotType: "info",
              title: element.title || element.label || "Información",
              description: element.description || "",
              attachments: Array.isArray(element.attachments) ? element.attachments : [],
              coverImage: element.coverImage || null,
              image: element.image || null,
              previewImage: element.previewImage || null,
              thumbnail: element.thumbnail || null,
            });
            setModalOpen(true);
          }}
        />
      );
    }

    if (css === "information_bubble" || css === "information-label") {
      const currentLang = "es";
      let displayLabel = element.label || element.title;
      if (currentLang === "en") {
        displayLabel = element.label_en || element.title_en || displayLabel;
      } else {
        displayLabel = element.label_es || element.title_es || displayLabel;
      }

      return (
        <Pannellum.Hotspot
          key={i}
          type="custom"
          yaw={element.yaw}
          pitch={element.pitch}
          cssClass={css}
          tooltip={(hotSpotDiv) => {
            const root = ReactDOM.createRoot(hotSpotDiv);
            hotspotRoots.current.set(hotSpotDiv, root);
            root.render(
              <InformationBubbleHotspot text={displayLabel} />
            );
          }}
          handleClick={() => {
            // No action on click for information labels
          }}
        />
      );
    }
    return null;
  };

  if (!project || (project.id && projectId && project.id !== projectId)) return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="loading-screen">
      <div className="flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-transparent border-t-[#2B5398] border-b-[#8fa7d6] mb-4"></div>
        <p className="text-white text-lg">Cargando recorrido...</p>
      </div>
    </div>
  );
  if (!sceneKeys.length) return <div style={{ padding: 20 }}>Este proyecto no tiene escenas configuradas.</div>;
  if (!scene) return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="loading-screen">
      <div className="flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-transparent border-t-[#2B5398] border-b-[#8fa7d6] mb-4"></div>
        <p className="text-white text-lg">Cargando escena...</p>
      </div>
    </div>
  );
  if (!scene.image || !String(scene.image).trim()) {
    return (
      <div style={{ padding: 24, color: '#003d82' }}>
        <p style={{ fontWeight: 600 }}>Imagen de panorama no asignada</p>
        <p style={{ fontSize: 13, opacity: .8 }}>La escena <strong>{scene.title || scene.id || scene.key || ''}</strong> no tiene imagen 360° configurada. Ve a Project Editor para asignarla.</p>
      </div>
    );
  }
  const safeSceneImage = String(scene.image).trim();
  const safePreviewImage = [scene.previewImage, scene.thumbnail].filter(x => x && typeof x === 'string' && x.trim()).map(x => String(x).trim())[0] || null;
  const safePitch = typeof scene.pitch === 'number' ? scene.pitch : 0;
  const safeYaw = typeof scene.yaw === 'number' ? scene.yaw : 0;

  return (
    <>
      <div className="viewer-container" style={{ position: 'absolute', top: '72px', left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        <Pannellum
          width={"100%"}
          height={"100%"}
          title={scene.title || ""}
          image={safeSceneImage}
          pitch={safePitch}
          yaw={safeYaw}
          hfov={currentHfov}
          ref={setPannellumRef}
          minHfov={50}
          maxHfov={150}
          autoLoad
          showFullscreenCtrl={false}
          showZoomCtrl={false}
          hotspotDebug={false}
          minPitch={-90}
          maxPitch={90}
          crossOrigin="anonymous"
          imageLoader={true}
          dynamicUpdate={false}
          compass={false}
          keyboardZoom={false}
          mouseZoom={true}
          doubleClickZoom={false}
          dragMode={1}
          autoRotate={autoRotate && !userInteracting ? 2 : 0}
          autoRotateInactivityDelay={3000}
          autoRotateStopDelay={3000}
          useGPUOverride={true}
          onMouseDown={handleUserInteraction}
          onTouchStart={handleUserInteraction}
          onMouseup={handleUserInteraction}
          onTouchend={handleUserInteraction}
          {...(safePreviewImage ? { preview: safePreviewImage, previewLoad: true } : {})}
        >
          {Object.entries(scene.hotSpots || {}).map(([key, element], i) =>
            renderHotspot({ ...element, key }, i)
          )}
        </Pannellum>

        {/* Left Vertical Thumbnails */}
        <div 
          ref={carouselRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="scenes-carousel-wrapper vertical-left"
        >
          {activeSceneKeys.map((key) => {
            const s = scenes[key];
            if (!s) return null;
            const isActive = scene.key === key;
            const thumbSrc = getThumbnailFor(s);
            return (
              <button
                key={key}
                onDragStart={(e) => e.preventDefault()}
                onClick={(e) => {
                  if (isDragging.current) {
                    e.preventDefault();
                    return;
                  }
                  navigateToScenePreserveOrientation(key);
                }}
                className={`scene-carousel-btn ${isActive ? 'active' : 'inactive'}`}
              >
                <img
                  src={thumbSrc}
                  alt={s.title}
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    if (s?.image && e.currentTarget.src !== s.image) {
                      e.currentTarget.src = s.image;
                    }
                  }}
                />
              </button>
            )
          })}
        </div>

        {/* Bottom Center Playback Controls */}
        <div className="playback-controls-pill">
          <button className="control-btn" onClick={logic.handlePrevious}>
            <FaChevronLeft />
          </button>

          <button className="control-btn" onClick={logic.handleNext}>
            <FaChevronRight />
          </button>
        </div>

        {/* Nombre de la escena actual en la esquina inferior izquierda */}
        <div className="scene-name-indicator" title={scene?.title || scene?.name || "Escena"}>
          {scene?.title || scene?.name || "Escena"}
        </div>

        {/* Right Side Stack (Zones Navigation) */}
        {showZoneButton && (
          <div className="nav-action-stack right-stack">
            <div className="zones-stack">

              {logic.showZonesList && zonesNavigationList && zonesNavigationList.length >= 1 && (
                <div className="zones-list-panel" role="list" aria-label="Navegación por zonas">
                  <div className="zones-list-panel__header">
                    <span className="zones-list-panel__title">Zonas</span>
                    <span className="zones-list-panel__count">{zonesNavigationList.length}</span>
                  </div>
                  <ul className="zones-list-panel__list">
                    {zonesNavigationList.map(z => {
                      const zActive = String(activeZoneId) === String(z.id);
                      const hasMap = !!project?.settings?.mapByZone?.[z.id];
                      return (
                        <li key={String(z.id)} role="listitem">
                          <div className="zone-list-row">
                            <button
                              type="button"
                              className={`zones-list-item ${zActive ? 'active' : ''}`}
                              onClick={() => changeZone(z.id)}
                              title={z.name}
                            >
                              <span className="zones-list-item__thumb" aria-hidden="true">
                                {z.image ? (
                                  <img src={z.image} alt="" draggable={false} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                ) : (
                                  <span className="zones-list-item__noimg">{(z.name || "Z").toString().slice(0, 1).toUpperCase()}</span>
                                )}
                              </span>
                              <span className="zones-list-item__meta">
                                <span className="zones-list-item__name">{z.name}</span>
                                {zActive ? <span className="zones-list-item__status">Actual</span> : null}
                              </span>
                            </button>
                            <button
                              type="button"
                              className={`zone-map-button ${hasMap ? '' : 'disabled'}`}
                              disabled={!hasMap}
                              title={hasMap ? `Ver mapa de ${z.name}` : "Esta zona no tiene mapa disponible"}
                              aria-label={`Ver mapa de la zona ${z.name}`}
                              onClick={() => {
                                if (hasMap) {
                                  setForcedMapZoneId(z.id);
                                  setMapOverlayOpen(true);
                                }
                              }}
                            >
                              <FaMapMarkedAlt />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div className="zones-actions-row">
                <button
                  className={`nav-action-btn map-btn ${logic.showZonesList ? 'active' : 'inactive'}`}
                  onClick={() => logic.setShowZonesList(v => !v)}
                  title={logic.showZonesList ? "Ocultar lista de zonas" : "Mostrar lista de zonas"}
                >
                  <FaMapMarkedAlt />
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Modal para hotspots , elementos e info */}
      <HotspotModal isOpen={modalOpen} onClose={() => setModalOpen(false)} content={modalContent} />

      <InfoSidebar isOpen={infoSidebarOpen} onClose={() => setInfoSidebarOpen(false)} content={currentInfoContent} />

      <DynamicNavbar
        hideProfile={true}
        title={null}
        subtitle={null}
        middleContent={
          <DynamicBreadcrumbs 
            hideHome={false}
            homeRoute={window.location.pathname.startsWith('/public-tour') ? "/" : undefined}
            ignoreSegments={['experience', selectedExperience, 'public-tour', 'project']}
            customMappings={{
              [project?.id]: project?.name || "Proyecto"
            }} 
            customLinks={{}}
            customDropdowns={{
              [project?.id]: allProjects.map(p => ({
                id: p.id,
                label: p.name,
                sublabel: p.vesselType || 'Visualización 360°',
                image: p.thumbnail || p.image || '/images/default_image.png',
                selected: project && p.id === project.id,
                onClick: () => {
                  const isPublicTour = window.location.pathname.startsWith('/public-tour');
                  if (isPublicTour) {
                    if (navigate) {
                      navigate(`/public-tour/${p.id}`);
                    } else {
                      window.location.href = `/public-tour/${p.id}`;
                    }
                  } else {
                    if (navigate) {
                      navigate(`/project/${p.id}`);
                    } else {
                      window.location.href = `/project/${p.id}`;
                    }
                  }
                }
              }))
            }}
          />
        }
        showBackButton={false}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
        scenes={scenes}
        currentScene={scene?.key}
        onSceneSelect={(sceneKey) => {
          if (scenes[sceneKey]) navigateToScenePreserveOrientation(sceneKey);
        }}
      >
      {/* 
      
       logo de Xrlab que esta en el header 
      
      <img src={xrlabLogo} alt="XRLab" className="xrlab-header-logo" />
      
      */}
      </DynamicNavbar>

      {mapOverlayOpen && (
        <TopMapOverlay
          project={project}
          currentSceneKey={scene?.key}
          forcedZoneId={forcedMapZoneId}
          onHotspotClick={(sk) => navigateToScenePreserveOrientation(sk)}
          onClose={() => {
            setMapOverlayOpen(false);
            setForcedMapZoneId(null);
          }}
          mapHeading={mapHeading}
          currentHfov={currentHfov}
        />
      )}
    </>
  );
};
