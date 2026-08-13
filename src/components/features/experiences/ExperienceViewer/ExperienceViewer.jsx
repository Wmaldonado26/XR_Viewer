import React from "react";
import ReactDOM from "react-dom/client";
import { FaArrowLeft, FaMapMarkedAlt, FaChevronLeft, FaChevronRight, FaPause, FaPlay, FaTimes } from "react-icons/fa";
import { Pannellum } from "pannellum-react";
import CustomHotspot from "../../hotspots/CustomHotspot";
import HotspotModal from "../../hotspots/HotspotModal";
import InfoSidebar from "../../../ui/InfoSidebar/InfoSidebar";
import DynamicNavbar from "../../../layout/Navbar/DynamicNavbar";
import DynamicBreadcrumbs from "../../../ui/DynamicBreadcrumbs/DynamicBreadcrumbs";

import "../../../../styles/index.css";
import "./ExperienceViewer.css";

export const ExperienceViewerTemplate = ({
  logic,
  selectedExperience,
  onBackToSelector,
  darkMode,
  onToggleDarkMode,
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
    activeZoneId,
    setPannellumRef,
    carouselRef,
    isDragging,
    navigateToScenePreserveOrientation,
    getNavPreview,
    handleUserInteraction,
    handleMouseDown,
    handleMouseLeave,
    handleMouseUp,
    handleMouseMove
  } = logic;

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
              attachments: [],
            });
            setModalOpen(true);
          }}
        />
      );
    }

    return null;
  };

  if (!project) return <div style={{ padding: 20 }}>Cargando proyecto...</div>;
  if (!sceneKeys.length) return <div style={{ padding: 20 }}>Este proyecto no tiene escenas configuradas.</div>;
  if (!scene) return <div style={{ padding: 20 }}>Seleccionando escena...</div>;

  return (
    <>
      <div className="viewer-container" style={{ position: 'absolute', top: '72px', left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        <Pannellum
          width={"100%"}
          height={"100%"}
          title={scene.title}
          image={scene.image}
          pitch={scene.pitch}
          yaw={scene.yaw}
          hfov={currentHfov}
          ref={setPannellumRef}
          minHfov={80}
          maxHfov={150}
          autoLoad
          showFullscreenCtrl={false}
          showZoomCtrl={false}
          hotspotDebug={false}
          minPitch={-140}
          maxPitch={140}
          crossOrigin="anonymous"
          imageLoader={true}
          dynamicUpdate={true}
          compass={false}
          keyboardZoom={false}
          mouseZoom={true}
          doubleClickZoom={false}
          dragMode={1}
          autoRotate={autoRotate && !userInteracting ? 2 : 0}
          autoRotateInactivityDelay={3000}
          autoRotateStopDelay={3000}
          onMouseDown={handleUserInteraction}
          onTouchStart={handleUserInteraction}
          onMouseup={handleUserInteraction}
          onTouchend={handleUserInteraction}
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
                <img src={s.image} alt={s.title} draggable={false} />
              </button>
            )
          })}
        </div>

        {/* Bottom Center Playback Controls */}
        <div className="playback-controls-pill">
          <button className="control-btn" onClick={logic.handlePrevious}>
            <FaChevronLeft />
          </button>
          <button className={`control-btn ${!autoRotate ? 'active' : ''}`} onClick={logic.handlePlayPause}>
            {!autoRotate ? <FaPause /> : <FaPlay />}
          </button>
          <button className="control-btn" onClick={logic.handleNext}>
            <FaChevronRight />
          </button>
        </div>

        {/* Right Side Stack (Zones + Map) */}
        {(() => {
          const hasAnyMap = project?.settings?.mapByZone && Object.values(project.settings.mapByZone).some(m => m && m.mapUrl);
          
          if (!hasAnyMap) return null;

          return (
            <div className="zones-stack">
              {logic.showZonesList && (
                <div className="zones-buttons">
                  {(project?.experiences || []).map(exp => (
                    <button 
                      key={exp.id}
                      className={`zone-btn ${logic.activeZoneId === exp.id ? 'active' : ''}`}
                      onClick={() => {
                        logic.setActiveZoneId(exp.id);
                        logic.setMapOverlayOpen(true);
                      }}
                    >
                      {exp.name}
                    </button>
                  ))}
                </div>
              )}
              
              <button 
                className={`nav-action-btn map-btn ${logic.showZonesList ? 'active' : 'inactive'}`}
                onClick={() => logic.setShowZonesList(!logic.showZonesList)}
                title="Mostrar/Ocultar zonas"
              >
                <FaMapMarkedAlt />
              </button>
            </div>
          );
        })()}
        {/* Map Overlay Modal */}
        {logic.mapOverlayOpen && (
          <div className="map-overlay-container">
            <button 
              className="close-map-btn" 
              onClick={() => logic.setMapOverlayOpen(false)}
            >
              <FaTimes />
            </button>
            {(() => {
              const zoneName = project?.experiences?.find(e => e.id === logic.activeZoneId)?.name || 'Plano';
              const planImage = project?.settings?.mapByZone?.[logic.activeZoneId]?.mapUrl;
              const scenesInZone = Object.entries(project?.scenes || {})
                .filter(([k, s]) => s?.map?.zoneId === logic.activeZoneId || s?.zone === logic.activeZoneId || s?.zoneId === logic.activeZoneId)
                .map(([k, s]) => ({ ...s, key: k }));

              return (
                <>
                  <div className="map-header">
                    <h3 className="map-zone-title">{zoneName}</h3>
                  </div>
                  <div className="map-image-wrapper">
                    {planImage ? (
                      <>
                        <img src={planImage} alt="Plano" draggable={false} />
                        {scenesInZone.map(s => {
                          const isActive = s.key === scene.key;
                          return (
                            <button
                              key={s.key}
                              onClick={() => navigateToScenePreserveOrientation(s.key)}
                              className={`map-hotspot-btn ${isActive ? 'active' : 'inactive'}`}
                              style={{
                                top: `${s.map?.top || s.top || 0}%`,
                                left: `${s.map?.left || s.left || 0}%`,
                              }}
                            />
                          );
                        })}
                      </>
                    ) : (
                      <div className="map-no-image">
                        <FaMapMarkedAlt size={54} style={{ marginBottom: '15px', opacity: 0.5 }} />
                        <p>No hay mapas disponibles</p>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Modal para hotspots , elementos e info */}
      <HotspotModal isOpen={modalOpen} onClose={() => setModalOpen(false)} content={modalContent} />

      <InfoSidebar isOpen={infoSidebarOpen} onClose={() => setInfoSidebarOpen(false)} content={currentInfoContent} />

      <DynamicNavbar
        title={null}
        subtitle={null}
        middleContent={
          <DynamicBreadcrumbs 
            ignoreSegments={['experience', selectedExperience]}
            customMappings={{
              project: "Proyectos",
              [project?.id]: "Zonas"
            }} 
            customLinks={{
              project: "/gallery"
            }}
            customDropdowns={{
              project: allProjects.map(p => ({
                id: p.id,
                label: p.name,
                sublabel: p.vesselType || 'Visualización 360°',
                image: p.thumbnail || p.image || '/images/default_image.png',
                onClick: () => {
                  window.location.href = `/project/${p.id}`;
                }
              })),
              [project?.id]: (project?.experiences || []).map(exp => ({
                id: exp.id,
                label: exp.name,
                sublabel: "Zona",
                image: exp.image || '/images/default_image.png',
                onClick: () => {
                  logic.setActiveZoneId(exp.id);
                  const scenesInZone = Object.entries(project?.scenes || {})
                    .filter(([k, s]) => s?.map?.zoneId === exp.id || s?.zone === exp.id || s?.zoneId === exp.id);
                  
                  let targetScene = exp.startScene;
                  if (!targetScene && scenesInZone.length > 0) {
                    targetScene = scenesInZone[0][0];
                  }

                  if (targetScene && scenes[targetScene]) {
                    navigateToScenePreserveOrientation(targetScene);
                  }
                }
              })),
              [selectedExperience]: sceneKeys.map(k => ({
                id: k,
                label: scenes[k]?.title || k,
                sublabel: "Escena 360°",
                image: scenes[k]?.image || '/images/default_image.png',
                onClick: () => {
                  if (scenes[k]) navigateToScenePreserveOrientation(k);
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
      />
    </>
  );
};
