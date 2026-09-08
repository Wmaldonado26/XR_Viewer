import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import projectService from "../../../../services/ProjectService";
import { getSceneYawOffsetDeg, normalizeYawDeg } from "../../../../helpers/sceneCalibration";
import { getOrderedVisibleZones } from "../../../../components/features/experiences/utils/zoneNavigation";

const getOptimalImage = (baseUrl) => {
  if (!baseUrl || typeof baseUrl !== 'string') return baseUrl;
  
  try {
    // Detectar capacidad del dispositivo
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
    const screenWidth = window.innerWidth;
    const connectionType = navigator.connection?.effectiveType || '4g';
    
    // Decidir resolución
    let resolution = 'hd';
    
    if (isMobile || connectionType === '2g' || connectionType === '3g') {
      resolution = 'sd';
    } else if (isTablet || screenWidth < 1024 || connectionType === 'slow-2g') {
      resolution = 'hd';
    } else if (screenWidth >= 2560 && connectionType === '4g') {
      resolution = '8k';
    } else if (screenWidth >= 1440) {
      resolution = '4k';
    }
    
    // Si la URL ya tiene parámetros, no la modifiques
    if (baseUrl.includes('?')) return baseUrl;
    
    // Añadir sufijo de resolución
    const lastDot = baseUrl.lastIndexOf('.');
    if (lastDot === -1) return baseUrl;
    
    const base = baseUrl.substring(0, lastDot);
    const ext = baseUrl.substring(lastDot);
    
    // Si ya tiene resolución, no la modifiques
    if (base.endsWith('-sd') || base.endsWith('-hd') || 
        base.endsWith('-4k') || base.endsWith('-8k')) {
      return baseUrl;
    }
    
    return `${base}-${resolution}${ext}`;
  } catch {
    return baseUrl;
  }
};

export const useExperienceViewerLogic = ({ selectedExperience, projectId, isPublicTour }) => {
  const [project, setProject] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [scene, setScene] = useState(null);
  const [visitedScenes, setVisitedScenes] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [infoSidebarOpen, setInfoSidebarOpen] = useState(false);
  const [currentInfoContent, setCurrentInfoContent] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [userInteracting, setUserInteracting] = useState(false);

  // States related to zones/maps
  const [showZonesList, setShowZonesList] = useState(true);
  const [mapOverlayOpen, setMapOverlayOpen] = useState(false);
  const [forcedMapZoneId, setForcedMapZoneId] = useState(null);
  const [showCarousel, setShowCarousel] = useState(true);
  const [activeZoneId, setActiveZoneId] = useState(null);
  const [pannellumRef, setPannellumRef] = useState(null);

  const carouselRef = useRef(null);
  const isDown = useRef(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    (async () => {
      let active = null;
      if (projectId) {
        active = await projectService.getProjectById(projectId);
        if (active) {
          projectService.setActiveProject(active);
        }
      }
      
      if (!active) {
        active = await projectService.getActiveProject();
      }
      setProject(active);
      setScene(null); // Clear previous scene to avoid showing old project data
    })();
    
    if (isPublicTour) {
      projectService.getPublicProjects().then(setAllProjects).catch(console.error);
    } else {
      projectService.getAllProjects().then(setAllProjects).catch(console.error);
    }
  }, [projectId, isPublicTour]);

  const scenes = useMemo(() => project?.scenes || {}, [project]);
  const sceneKeys = useMemo(() => Object.keys(scenes), [scenes]);

  const getInitialScene = (experienceOrSceneKey) => {
    if (!sceneKeys.length) return null;

    if (experienceOrSceneKey && scenes[experienceOrSceneKey]) {
      return { ...scenes[experienceOrSceneKey], key: experienceOrSceneKey };
    }
    if (experienceOrSceneKey) {
      const sceneInZoneKey = sceneKeys.find(k => (scenes[k]?.zoneId || scenes[k]?.map?.zoneId) === experienceOrSceneKey);
      if (sceneInZoneKey) {
        return { ...scenes[sceneInZoneKey], key: sceneInZoneKey };
      }
    }

    const initialSceneId = project?.settings?.initialSceneId;
    if (initialSceneId && scenes[initialSceneId]) {
      return { ...scenes[initialSceneId], key: initialSceneId };
    }

    const savedKey = localStorage.getItem(`lastSceneKey_${projectId || project?.id}`);
    if (savedKey && scenes[savedKey]) {
      return { ...scenes[savedKey], key: savedKey };
    }
    if (savedKey) {
      const sceneInZoneKey = sceneKeys.find(k => (scenes[k]?.zoneId || scenes[k]?.map?.zoneId) === savedKey);
      if (sceneInZoneKey) {
        return { ...scenes[sceneInZoneKey], key: sceneInZoneKey };
      }
    }

    const startScene = project?.experiences?.[0]?.startScene || project?.experiences?.[0]?.id;
    if (startScene && scenes[startScene]) {
      return { ...scenes[startScene], key: startScene };
    }
    if (startScene) {
      const sceneInZoneKey = sceneKeys.find(k => (scenes[k]?.zoneId || scenes[k]?.map?.zoneId) === startScene);
      if (sceneInZoneKey) {
        return { ...scenes[sceneInZoneKey], key: sceneInZoneKey };
      }
    }

    const firstKey = sceneKeys[0];
    return { ...scenes[firstKey], key: firstKey };
  };

  useEffect(() => {
    if (scene?.key) {
      setVisitedScenes(prev => {
        const next = new Set(prev);
        next.add(scene.key);
        return next;
      });
      
      // Update URL to match current scene (without reloading page)
      if (project?.id && scene.key) {
        const basePath = isPublicTour ? '/public-tour' : '/project';
        const newUrl = `${basePath}/${project.id}/${isPublicTour ? scene.key : `experience/${scene.key}`}`;
        if (window.location.pathname !== newUrl) {
          window.history.replaceState(null, '', newUrl);
        }
      }
    }
  }, [scene?.key, project?.id, isPublicTour]);

  useEffect(() => {
    if (!sceneKeys.length || !project) return;
    const initial = getInitialScene(selectedExperience);
    if (initial && (!scene || scene.key !== initial.key || (scene && !scenes[scene.key]))) {
      setScene(initial);
      localStorage.setItem(`lastSceneKey_${project.id}`, initial.key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExperience, project, sceneKeys.length]);

  useEffect(() => {
    let newZoneId = scene?.map?.zoneId || scene?.zoneId || scene?.zone;
    
    if (!newZoneId && project?.experiences) {
      const exp = project.experiences.find(e => e.startScene === scene?.key || e.id === scene?.key);
      if (exp) newZoneId = exp.id;
    }

    if (newZoneId) {
      setActiveZoneId(newZoneId);
    } else if (project?.experiences?.length > 0) {
      // Solo hacer fallback al primer experience si no tenemos nada activo
      setActiveZoneId(prev => prev || project.experiences[0].id);
    }

    // GESTIÓN DE MEMORIA: Pre-cargar texturas de hotspots adyacentes limitando la RAM (Caché inteligente)
    if (scene && scene.hotSpots) {
      const MAX_CACHE = 5;
      if (!window.__panoramaCache) window.__panoramaCache = new Map();
      const cache = window.__panoramaCache;

      const adjacentKeys = Object.values(scene.hotSpots)
        .filter(h => h.cssClass === 'moveScene' && h.scene)
        .map(h => h.scene);

      adjacentKeys.slice(0, MAX_CACHE).forEach(key => {
        const targetScene = scenes[key];
        if (targetScene && targetScene.image) {
          const imgUrl = targetScene.image;
          if (!cache.has(imgUrl)) {
            const img = new Image();
            img.src = imgUrl;
            cache.set(imgUrl, img);
            if (cache.size > MAX_CACHE) {
              const firstKey = cache.keys().next().value;
              cache.delete(firstKey);
            }
          }
        }
      });
    }
  }, [scene, project, scenes]);

  // GESTIÓN DE MEMORIA: Forzar la limpieza del WebGLRenderer al desmontar
  useEffect(() => {
    return () => {
      if (pannellumRef) {
        try {
          const viewer = pannellumRef.getViewer();
          if (viewer && typeof viewer.destroy === 'function') {
            viewer.destroy();
          }
        } catch (e) {
          console.warn("Error cleaning up WebGL context", e);
        }
      }
    };
  }, [pannellumRef]);

  const currentYawRef = useRef(0);
  const currentPitchRef = useRef(0);
  const currentHfovRef = useRef(140);

  const sceneKeySafe = scene?.key || null;
  const mapHeading = useMemo(() => {
    if (!sceneKeySafe) return 0;
    return normalizeYawDeg((currentYawRef.current || 0) + getSceneYawOffsetDeg(sceneKeySafe));
  }, [sceneKeySafe]); // Ref removed from deps since it doesn't trigger renders

  useEffect(() => {
    if (!scene) return;
    currentYawRef.current = scene.yaw || 0;
    currentPitchRef.current = scene.pitch || 0;
    currentHfovRef.current = project?.settings?.defaultHfov || 140;
  }, [scene, project]);

  const navigateToScenePreserveOrientation = (nextKey) => {
    const nextScene = scenes[nextKey];
    if (!nextScene) return;

    let yawToKeep = currentYawRef.current || 0;
    let pitchToKeep = currentPitchRef.current || 0;

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

    currentYawRef.current = nextLocalYaw;
    currentPitchRef.current = pitchToKeep;

    const newScene = { ...nextScene, key: nextKey, yaw: nextLocalYaw, pitch: pitchToKeep };
    setScene(newScene);
    localStorage.setItem(`lastSceneKey_${project?.id}`, nextKey);
  };

  const getNavPreview = (element) => {
    if (element?.previewImage) return element.previewImage;
    const target = scenes?.[element?.scene];
    if (!target) return null;
    if (target.thumbnail) return target.thumbnail;
    if (target.previewImage) return target.previewImage;
    const full = target.image || null;
    if (!full) return null;
    try {
      const u = new URL(full, window.location.origin);
      const pathname = u.pathname;
      const m = pathname.match(/\/uploads\/((.+)(\.[^./]+))$/);
      if (m) {
        const [, , base, ext] = m;
        u.pathname = `/uploads/thumbs/${base}.thumb${ext || ".jpg"}`;
        return u.toString();
      }
    } catch {}
    return full;
  };

  const getThumbnailFor = (sceneObj) => {
    if (!sceneObj) return null;
    if (sceneObj.thumbnail) return sceneObj.thumbnail;
    if (sceneObj.previewImage) return sceneObj.previewImage;
    const full = sceneObj.image || null;
    if (!full) return null;
    try {
      const u = new URL(full, window.location.origin);
      const pathname = u.pathname;
      const m = pathname.match(/\/uploads\/((.+)(\.[^./]+))$/);
      if (m) {
        const [, , base, ext] = m;
        u.pathname = `/uploads/thumbs/${base}.thumb${ext || ".jpg"}`;
        return u.toString();
      }
    } catch {}
    return full;
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
    const newHfov = Math.max(currentHfovRef.current - 10, 80);
    pannellumRef.getViewer().setHfov(newHfov);
    currentHfovRef.current = newHfov;
  };

  const handleZoomOut = () => {
    if (!pannellumRef) return;
    const newHfov = Math.min(currentHfovRef.current + 10, 150);
    pannellumRef.getViewer().setHfov(newHfov);
    currentHfovRef.current = newHfov;
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

  const zonesNavigationList = useMemo(() => {
    const visibleZones = getOrderedVisibleZones(project);
    if (visibleZones.length) {
      return visibleZones.map(e => {
        const id = e.id;
        const firstScene =
          (e.startScene && scenes[e.startScene])
            ? e.startScene
            : sceneKeys.find(k => (scenes[k]?.zoneId || scenes[k]?.map?.zoneId || scenes[k]?.zone) === id) || null;
        return {
          id,
          name: e.name || String(id),
          image: e.image || null,
          firstSceneKey: firstScene,
        };
      });
    }

    const byId = new Map();
    for (const k of sceneKeys) {
      const s = scenes[k] || {};
      const zid = s?.zoneId || s?.map?.zoneId || s?.zone;
      if (!zid) continue;
      if (byId.has(String(zid))) {
        const row = byId.get(String(zid));
        if (!row.firstSceneKey) row.firstSceneKey = k;
        continue;
      }
      byId.set(String(zid), {
        id: String(zid),
        name: s?.zoneName || String(zid),
        image: s?.image || null,
        firstSceneKey: k,
      });
    }

    if (byId.size) return [...byId.values()];

    if (sceneKeys.length) {
      return [{
        id: "all",
        name: "Todas las escenas",
        image: scenes[sceneKeys[0]]?.image || null,
        firstSceneKey: sceneKeys[0],
      }];
    }
    return [];
  }, [project, scenes, sceneKeys]);

  const changeZone = useCallback((zoneId) => {
    const target = zonesNavigationList.find(z => String(z.id) === String(zoneId));
    if (!target) return;
    if (target.firstSceneKey && scenes[target.firstSceneKey]) {
      navigateToScenePreserveOrientation(target.firstSceneKey);
    }
    setActiveZoneId(String(zoneId));
    if (target.firstSceneKey && project?.id) localStorage.setItem(`lastSceneKey_${project.id}`, target.firstSceneKey);
  }, [zonesNavigationList, scenes, navigateToScenePreserveOrientation, project]);

  const handlePrevious = () => {
    if (!zonesNavigationList.length || !activeZoneId) return;
    const currentZoneIndex = zonesNavigationList.findIndex(z => String(z.id) === String(activeZoneId));
    if (currentZoneIndex === -1) return;
    const prevZoneIndex = currentZoneIndex > 0 ? currentZoneIndex - 1 : zonesNavigationList.length - 1;
    changeZone(zonesNavigationList[prevZoneIndex].id);
  };

  const handleNext = () => {
    if (!zonesNavigationList.length || !activeZoneId) return;
    const currentZoneIndex = zonesNavigationList.findIndex(z => String(z.id) === String(activeZoneId));
    if (currentZoneIndex === -1) return;
    const nextZoneIndex = currentZoneIndex < zonesNavigationList.length - 1 ? currentZoneIndex + 1 : 0;
    changeZone(zonesNavigationList[nextZoneIndex].id);
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

  const optimizedScene = scene ? { ...scene, image: getOptimalImage(scene.image) } : scene;

  return {
    project,
    allProjects,
    scene: optimizedScene,
    scenes,
    sceneKeys,
    activeSceneKeys,
    visitedScenes,
    modalOpen, setModalOpen,
    modalContent, setModalContent,
    infoSidebarOpen, setInfoSidebarOpen,
    currentInfoContent, setCurrentInfoContent,
    isPlaying,
    autoRotate,
    userInteracting,
    showCarousel, setShowCarousel,
    currentHfov: currentHfovRef.current,
    currentYaw: currentYawRef.current,
    currentPitch: currentPitchRef.current,
    mapOverlayOpen, setMapOverlayOpen,
    forcedMapZoneId, setForcedMapZoneId,
    showZonesList, setShowZonesList,
    activeZoneId, setActiveZoneId,
    pannellumRef, setPannellumRef,
    carouselRef,
    isDragging,
    navigateToScenePreserveOrientation,
    getNavPreview,
    getThumbnailFor,
    handleMiniMapClick,
    handleFullScreen,
    handlePlayPause,
    handleZoomIn,
    handleZoomOut,
    handlePrevious,
    handleNext,
    handleMoveUp,
    handleMoveDown,
    handleUserInteraction,
    handleMouseDown,
    handleMouseLeave,
    handleMouseUp,
    handleMouseMove,
    zonesNavigationList,
    changeZone,
  };
};
