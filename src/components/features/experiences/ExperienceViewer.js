import React, { useEffect, useMemo, useState, useRef } from "react";
import ReactDOM from "react-dom/client";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaMapMarkedAlt, FaChevronRight } from "react-icons/fa";

// Importe el componente de React Esto solucionará el "Pannellum is not defined"
import { Pannellum } from "pannellum-react"; 

// Deja solo los estilos CSS de Pannellum Elimina el .js y los duplicados
import 'pannellum/build/pannellum.css';

import projectService from "../../../api/services/projectService";
import TopMapOverlay from "../maps/TopMapOverlay";
// el resto quedan igual como antes solo instale la libreria de pannellum-react
import ControlBar from "../../ui/ControlBar/ControlBar";
import HotspotModal from "../hotspots/HotspotModal";
import CustomHotspot from "../hotspots/CustomHotspot";
import InfoSidebar from "../../ui/InfoSidebar/InfoSidebar";
import DynamicNavbar from "../../layout/Navbar/DynamicNavbar";
import DynamicBreadcrumbs from "../../ui/DynamicBreadcrumbs/DynamicBreadcrumbs";
import NavigationHistory from "../maps/NavigationHistory";
import "../../../styles/index.css";
import MiniMapWidget from "../maps/MiniMapWidget";
import { getSceneYawOffsetDeg, normalizeYawDeg } from "../../../helpers/sceneCalibration";

export default function Scene({
  selectedExperience,
  onBackToSelector,
  darkMode,
  onToggleDarkMode,
}) {
  const navigate = useNavigate();
  const [project, setProject] = useState(null);

  const carouselRef = useRef(null);
  const isDown = useRef(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e) => {
    isDown.current = true;
    isDragging.current = false;
    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grabbing';
      startX.current = e.pageX - carouselRef.current.offsetLeft;
      scrollLeft.current = carouselRef.current.scrollLeft;
    }
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    if (carouselRef.current) carouselRef.current.style.cursor = 'grab';
  };

  const handleMouseUp = () => {
    isDown.current = false;
    if (carouselRef.current) carouselRef.current.style.cursor = 'grab';
  };

  const handleMouseMove = (e) => {
    if (!isDown.current || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    if (Math.abs(walk) > 5) {
      isDragging.current = true;
    }
    carouselRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const [allProjects, setAllProjects] = useState([]);

  useEffect(() => {
    (async () => {
      const active = await projectService.getActiveProject();
      setProject(active);
    })();
    projectService.getAllProjects().then(setAllProjects).catch(console.error);
  }, []);

  const scenes = useMemo(() => project?.scenes || {}, [project]);
  const sceneKeys = useMemo(() => Object.keys(scenes), [scenes]);

  const getInitialScene = (experienceOrSceneKey) => {
    if (!sceneKeys.length) return null;

    // 1. It is a valid scene key
    if (experienceOrSceneKey && scenes[experienceOrSceneKey]) {
      return { ...scenes[experienceOrSceneKey], key: experienceOrSceneKey };
    }

    // 2. Es un ID de zona? Buscar la primera escena que pertenezca a esta zona
    if (experienceOrSceneKey) {
      const sceneInZoneKey = sceneKeys.find(k => (scenes[k]?.zoneId || scenes[k]?.map?.zoneId) === experienceOrSceneKey);
      if (sceneInZoneKey) {
        return { ...scenes[sceneInZoneKey], key: sceneInZoneKey };
      }
    }

    // 3. Buscar en localStorage
    const savedKey = localStorage.getItem("lastSceneKey");
    if (savedKey && scenes[savedKey]) {
      return { ...scenes[savedKey], key: savedKey };
    }
    if (savedKey) {
      const sceneInZoneKey = sceneKeys.find(k => (scenes[k]?.zoneId || scenes[k]?.map?.zoneId) === savedKey);
      if (sceneInZoneKey) {
        return { ...scenes[sceneInZoneKey], key: sceneInZoneKey };
      }
    }

    // 4. Por defecto la primera escena del proyecto
    const firstKey = sceneKeys[0];
    return { ...scenes[firstKey], key: firstKey };
  };

  const [scene, setScene] = useState(null);
  const [visitedScenes, setVisitedScenes] = useState(new Set());

  useEffect(() => {
    if (scene?.key) {
      setVisitedScenes(prev => {
        const next = new Set(prev);
        next.add(scene.key);
        return next;
      });
    }
  }, [scene?.key]);

  useEffect(() => {
    if (!sceneKeys.length) return;
    const initial = getInitialScene(selectedExperience);
    if (initial) {
      setScene(initial);
      localStorage.setItem("lastSceneKey", initial.key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExperience, project, sceneKeys.length]);

  // Modal (para element/info)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({});

  const [infoSidebarOpen, setInfoSidebarOpen] = useState(false);
  const [currentInfoContent, setCurrentInfoContent] = useState(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [userInteracting, setUserInteracting] = useState(false);

  const [currentHfov, setCurrentHfov] = useState(140);
  const [currentYaw, setCurrentYaw] = useState(0);
  const [currentPitch, setCurrentPitch] = useState(0);

  const [mapOverlayOpen, setMapOverlayOpen] = useState(false);
  const [activeZoneId, setActiveZoneId] = useState(null);

  useEffect(() => {
    let newZoneId = scene?.map?.zoneId || scene?.zoneId || scene?.zone;
    
    if (!newZoneId && project?.experiences) {
      const exp = project.experiences.find(e => e.startScene === scene?.key || e.id === scene?.key);
      if (exp) newZoneId = exp.id;
    }

    if (newZoneId) {
      setActiveZoneId(newZoneId);
    } else if (!activeZoneId && project?.experiences?.length > 0) {
      setActiveZoneId(project.experiences[0].id);
    }
  }, [scene, project, activeZoneId]);

  const [pannellumRef, setPannellumRef] = useState(null);

  //  global para mapa (SAFE)
  const sceneKeySafe = scene?.key || null;
  const mapHeading = useMemo(() => {
    if (!sceneKeySafe) return 0;
    return normalizeYawDeg((currentYaw || 0) + getSceneYawOffsetDeg(sceneKeySafe));
  }, [sceneKeySafe, currentYaw]);

  useEffect(() => {
    if (!scene) return;
    setCurrentYaw(scene.yaw || 0);
    setCurrentPitch(scene.pitch || 0);
    setCurrentHfov(project?.settings?.defaultHfov || 140);
  }, [scene, project]);

  useEffect(() => {
    let rafId = null;

    const updateYawHfov = () => {
      if (pannellumRef) {
        try {
          const viewer = pannellumRef.getViewer();
          if (viewer && typeof viewer.getYaw === "function") {
            const yaw = viewer.getYaw();
            const hfov = viewer.getHfov();
            const pitch =
              typeof viewer.getPitch === "function"
                ? viewer.getPitch()
                : currentPitch;

            setCurrentYaw(yaw);
            setCurrentHfov(hfov);
            setCurrentPitch(pitch);
          }
        } catch (e) {
          console.error("Error en RAF:", e);
        }
      }
      rafId = requestAnimationFrame(updateYawHfov);
    };

    rafId = requestAnimationFrame(updateYawHfov);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [pannellumRef, currentPitch]);

  const navigateToScenePreserveOrientation = (nextKey) => {
    const nextScene = scenes[nextKey];
    if (!nextScene) return;

    let yawToKeep = currentYaw || 0;
    let pitchToKeep = currentPitch || 0;

    try {
      const viewer = pannellumRef?.getViewer?.();
      if (viewer) {
        if (typeof viewer.getYaw === "function") yawToKeep = viewer.getYaw();
        if (typeof viewer.getPitch === "function") pitchToKeep = viewer.getPitch();
      }
    } catch {}

    const currentSceneKey = scene?.key;
    const currentOffset = getSceneYawOffsetDeg(currentSceneKey);
    const nextOffset = getSceneYawOffsetDeg(nextKey);

    const globalHeading = normalizeYawDeg(yawToKeep + currentOffset);
    const nextLocalYaw = normalizeYawDeg(globalHeading - nextOffset);

    setCurrentYaw(nextLocalYaw);
    setCurrentPitch(pitchToKeep);

    const newScene = { ...nextScene, key: nextKey, yaw: nextLocalYaw, pitch: pitchToKeep };
    setScene(newScene);
    localStorage.setItem("lastSceneKey", nextKey);
  };

  const getNavPreview = (element) => {
    if (element?.previewImage) return element.previewImage;
    const target = scenes?.[element?.scene];
    if (!target) return null;
    return target.previewImage || target.image || null;
  };

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

  const handleMiniMapClick = (sceneKey) => navigateToScenePreserveOrientation(sceneKey);

  const handleFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
  };

  const handlePlayPause = () => {
    setIsPlaying((v) => !v);
    setAutoRotate((v) => !v);
  };

  const handleZoomIn = () => {
    if (!pannellumRef) return;
    const newHfov = Math.max(currentHfov - 10, 80);
    pannellumRef.getViewer().setHfov(newHfov);
    setCurrentHfov(newHfov);
  };

  const handleZoomOut = () => {
    if (!pannellumRef) return;
    const newHfov = Math.min(currentHfov + 10, 150);
    pannellumRef.getViewer().setHfov(newHfov);
    setCurrentHfov(newHfov);
  };

  const activeSceneKeys = useMemo(() => {
    if (!sceneKeys.length || !scene) return sceneKeys;
    const currentZone = scene?.zoneId || scene?.map?.zoneId;
    if (currentZone) {
      const zoneKeys = sceneKeys.filter(k => (scenes[k]?.zoneId || scenes[k]?.map?.zoneId) === currentZone);
      if (zoneKeys.length > 0) return zoneKeys;
    }
    return sceneKeys;
  }, [sceneKeys, scenes, scene]);

  const handlePrevious = () => {
    if (!activeSceneKeys.length || !scene?.key) return;
    const currentIndex = activeSceneKeys.indexOf(scene.key);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : activeSceneKeys.length - 1;
    navigateToScenePreserveOrientation(activeSceneKeys[previousIndex]);
  };

  const handleNext = () => {
    if (!activeSceneKeys.length || !scene?.key) return;
    const currentIndex = activeSceneKeys.indexOf(scene.key);
    const nextIndex = currentIndex < activeSceneKeys.length - 1 ? currentIndex + 1 : 0;
    navigateToScenePreserveOrientation(activeSceneKeys[nextIndex]);
  };

  const handleMoveUp = () => {
    if (!pannellumRef) return;
    const p = pannellumRef.getViewer().getPitch();
    pannellumRef.getViewer().setPitch(Math.min(p + 15, 180));
  };

  const handleMoveDown = () => {
    if (!pannellumRef) return;
    const p = pannellumRef.getViewer().getPitch();
    pannellumRef.getViewer().setPitch(Math.max(p - 15, -180));
  };

  const handleUserInteraction = () => {
    setUserInteracting(true);
    setAutoRotate(false);
    setTimeout(() => {
      setUserInteracting(false);
      if (isPlaying) setAutoRotate(true);
    }, 3000);
  };

  if (!project) return <div style={{ padding: 20 }}>Cargando proyecto...</div>;
  if (!sceneKeys.length) return <div style={{ padding: 20 }}>Este proyecto no tiene escenas configuradas.</div>;
  if (!scene) return <div style={{ padding: 20 }}>Seleccionando escena...</div>;

  const totalScenes = activeSceneKeys.length;
  const currentSceneNumber = activeSceneKeys.indexOf(scene.key) + 1;

  return (
    <>
      <Pannellum
        width={"100%"}
        height={"100vh"}
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

      <div 
        ref={carouselRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="scenes-carousel hide-scroll" 
        style={{ 
          position: 'fixed', 
          bottom: '32px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          display: 'flex', 
          gap: '16px', 
          background: 'rgba(20, 20, 25, 0.45)', 
          padding: '16px', 
          borderRadius: '24px', 
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          maxWidth: 'min(700px, 92vw)',
          overflowX: 'auto',
          zIndex: 1000,
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
          cursor: 'grab',
          scrollbarWidth: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
      >
        <style>{`.hide-scroll::-webkit-scrollbar { display: none; }`}</style>
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
              style={{
                flexShrink: 0,
                width: '120px',
                height: '80px',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: isActive ? '0 0 0 2px #fff, 0 8px 24px rgba(0,0,0,0.6)' : '0 4px 12px rgba(0,0,0,0.3)',
                opacity: isActive ? 1 : 0.5,
                transform: isActive ? 'scale(1.05) translateY(-4px)' : 'scale(1)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                cursor: 'pointer',
                padding: 0,
                background: '#000',
                border: 'none',
                outline: 'none',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.opacity = '0.9';
                  e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => { 
                if (!isActive) {
                  e.currentTarget.style.opacity = '0.5'; 
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <img src={s.image} alt={s.title} draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
              <div style={{ 
                position: 'absolute', 
                bottom: '6px', 
                left: '6px', 
                right: '6px', 
                background: 'rgba(0,0,0,0.5)', 
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white', 
                fontSize: '10px', 
                padding: '4px 6px', 
                borderRadius: '8px',
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                textAlign: 'center', 
                fontWeight: '600', 
                letterSpacing: '0.2px'
              }}>
                {s.title}
              </div>
            </button>
          )
        })}
      </div>

      {/* Modal para hotspots , elementos e info */}
      <HotspotModal isOpen={modalOpen} onClose={() => setModalOpen(false)} content={modalContent} />

      <InfoSidebar isOpen={infoSidebarOpen} onClose={() => setInfoSidebarOpen(false)} content={currentInfoContent} />

      <DynamicNavbar
        title={null}
        subtitle={null}
        middleContent={
          <DynamicBreadcrumbs 
            customMappings={{
              project: "Proyectos",
              [project?.id]: project?.name || "Proyecto",
              experience: "Zonas disponibles",
              [selectedExperience]: scene?.title ? scene.title.split(/[\s_]+/)[0] : "Visualizador",
              admin: "Gestión de Proyecto"
            }} 
            customLinks={{
              project: "/admin",
              experience: `/project/${project?.id}`
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
              experience: (project?.experiences || []).map(exp => ({
                id: exp.id,
                label: exp.name,
                sublabel: "Zona",
                image: exp.image || '/images/default_image.png',
                onClick: () => {
                  const targetScene = exp.startScene || exp.id;
                  if (scenes[targetScene]) {
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

      <div style={{ position: 'fixed', top: '90px', left: '0', width: '100%', padding: '0 40px', display: 'flex', justifyContent: 'space-between', zIndex: 999, pointerEvents: 'none' }}>
        <button 
          onClick={() => window.history.back()} 
          style={{ pointerEvents: 'auto', padding: '10px 20px', borderRadius: '10px', background: 'transparent', color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.4)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', backdropFilter: 'blur(4px)' }}
        >
          <FaArrowLeft /> Volver
        </button>

        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setMapOverlayOpen(!mapOverlayOpen)}
            style={{ pointerEvents: 'auto', padding: '10px 20px', borderRadius: '10px', background: mapOverlayOpen ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)', color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.4)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', backdropFilter: 'blur(8px)', transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = mapOverlayOpen ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)'}
          >
            <FaMapMarkedAlt /> {mapOverlayOpen ? 'Ocultar Mapa' : 'Ver Mapa'}
          </button>

          {mapOverlayOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '12px',
              width: '400px',
              pointerEvents: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {(() => {


                const zoneName = project?.experiences?.find(e => e.id === activeZoneId)?.name || 'Zona desconocida';
                const planImage = project?.settings?.mapByZone?.[activeZoneId]?.mapUrl;
                const scenesInZone = Object.entries(project?.scenes || {})
                  .filter(([k, s]) => s?.map?.zoneId === activeZoneId || s?.zone === activeZoneId || s?.zoneId === activeZoneId)
                  .map(([k, s]) => ({ ...s, key: k }));

                return (
                  <>
                    <div style={{ width: '100%', maxHeight: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', background: 'transparent', borderRadius: '12px', overflow: 'hidden' }}>
                      {planImage ? (
                        <>
                          <img src={planImage} alt="Plano" style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable={false} />
                          {scenesInZone.map(s => {
                            const isActive = s.key === scene.key;
                            return (
                              <button
                                key={s.key}
                                onClick={() => navigateToScenePreserveOrientation(s.key)}
                                style={{
                                  position: 'absolute',
                                  top: `${s.map?.top || s.top || 0}%`,
                                  left: `${s.map?.left || s.left || 0}%`,
                                  width: isActive ? '20px' : '16px',
                                  height: isActive ? '20px' : '16px',
                                  transform: 'translate(-50%, -50%)',
                                  borderRadius: '50%',
                                  background: isActive ? '#3b82f6' : 'rgba(255,255,255,0.9)',
                                  border: isActive ? '2px solid white' : '2px solid #3b82f6',
                                  cursor: 'pointer',
                                  boxShadow: isActive ? '0 0 10px rgba(59,130,246,0.8)' : '0 2px 4px rgba(0,0,0,0.4)',
                                  transition: 'all 0.2s ease',
                                  zIndex: isActive ? 10 : 1
                                }}
                              />
                            );
                          })}
                        </>
                      ) : (
                        <div style={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '13px' }}>
                          No hay plano cargado para esta zona
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>


      <NavigationHistory
        currentScene={scene.key}
        showBack={false}
        onNavigate={(sceneKey) => {
          if (scenes[sceneKey]) navigateToScenePreserveOrientation(sceneKey);
        }}
        onBack={(sceneKey) => {
          if (scenes[sceneKey]) navigateToScenePreserveOrientation(sceneKey);
        }}
      />
    </>
  );
}
            {/* Master-Detail Layout */}