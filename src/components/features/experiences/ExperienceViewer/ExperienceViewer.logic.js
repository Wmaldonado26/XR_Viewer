import { useEffect, useMemo, useState, useRef } from "react";
import projectService from "../../../../api/services/projectService";
import { getSceneYawOffsetDeg, normalizeYawDeg } from "../../../../helpers/sceneCalibration";

export const useExperienceViewerLogic = ({ selectedExperience }) => {
  const [project, setProject] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [scene, setScene] = useState(null);
  const [visitedScenes, setVisitedScenes] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [infoSidebarOpen, setInfoSidebarOpen] = useState(false);
  const [currentInfoContent, setCurrentInfoContent] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [userInteracting, setUserInteracting] = useState(false);
  const [showCarousel, setShowCarousel] = useState(true);
  const [currentHfov, setCurrentHfov] = useState(140);
  const [currentYaw, setCurrentYaw] = useState(0);
  const [currentPitch, setCurrentPitch] = useState(0);
  const [mapOverlayOpen, setMapOverlayOpen] = useState(false);
  const [showZonesList, setShowZonesList] = useState(true);
  const [activeZoneId, setActiveZoneId] = useState(null);
  const [pannellumRef, setPannellumRef] = useState(null);

  const carouselRef = useRef(null);
  const isDown = useRef(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

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

    if (experienceOrSceneKey && scenes[experienceOrSceneKey]) {
      return { ...scenes[experienceOrSceneKey], key: experienceOrSceneKey };
    }

    if (experienceOrSceneKey) {
      const sceneInZoneKey = sceneKeys.find(k => (scenes[k]?.zoneId || scenes[k]?.map?.zoneId) === experienceOrSceneKey);
      if (sceneInZoneKey) {
        return { ...scenes[sceneInZoneKey], key: sceneInZoneKey };
      }
    }

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
  }, [scene, project]);

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

  return {
    project,
    allProjects,
    scene,
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
    currentHfov,
    currentYaw,
    currentPitch,
    mapOverlayOpen, setMapOverlayOpen,
    showZonesList, setShowZonesList,
    activeZoneId, setActiveZoneId,
    pannellumRef, setPannellumRef,
    carouselRef,
    isDragging,
    navigateToScenePreserveOrientation,
    getNavPreview,
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
    handleMouseMove
  };
};
