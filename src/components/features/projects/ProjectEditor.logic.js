import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../services/apiConfig";
import projectService from "../../../services/ProjectService";
import authService from "../../../services/AuthService";
import landingService from "../../../services/LandingService";

export default function useProjectEditorLogic({ projectId, onClose, onSave }) {
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [isUploadingMultiple, setIsUploadingMultiple] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [activeTab, setActiveTab] = useState("basic");
  const [selectedScene, setSelectedScene] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [visualEditorSceneKey, setVisualEditorSceneKey] = useState(null);

  const scrollLockOrigRef = useRef(null);
  useEffect(() => {
    if (!visualEditorSceneKey) return;

    if (!scrollLockOrigRef.current) {
      scrollLockOrigRef.current = {
        body: document.body.style.overflow,
        html: document.documentElement.style.overflow,
      };
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      const orig = scrollLockOrigRef.current || { body: "", html: "" };
      document.body.style.overflow = orig.body ? orig.body : "";
      document.documentElement.style.overflow = orig.html ? orig.html : "";
    };
  }, [visualEditorSceneKey]);

  const [showCreateZoneModal, setShowCreateZoneModal] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneFiles, setNewZoneFiles] = useState([]);

  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [zoneSearchQuery, setZoneSearchQuery] = useState("");
  const [sceneFilter, setSceneFilter] = useState("all");
  const [showSceneFilterDropdown, setShowSceneFilterDropdown] = useState(false);

  const [selectedZonesToDelete, setSelectedZonesToDelete] = useState([]);
  const [selectedScenesToDelete, setSelectedScenesToDelete] = useState([]);

  const [mapZoneId, setMapZoneId] = useState("");
  const [mapSelectedSceneKey, setMapSelectedSceneKey] = useState("");
  const [mapPlacingMode, setMapPlacingMode] = useState(false);
  const mapPlanContainerRef = useRef(null);
  const mapImageRef = useRef(null);
  const [mapImageRect, setMapImageRect] = useState({ left: 0, top: 0, width: 0, height: 0 });

  const contentRef = useRef(null);
  const fabRootRef = useRef(null);
  const [showFab, setShowFab] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  const [modal, setModal] = useState({
    isOpen: false,
    type: "confirm",
    title: "",
    message: "",
    onConfirm: null,
    requiresConfirmation: false,
    confirmationText: "",
    showCancelButton: true,
    confirmText: "Aceptar",
    cancelText: "Cancelar",
  });

  const UPLOAD_URL = `${API_BASE_URL}/upload`;

  useEffect(() => {
    if (!projectId) return;

    (async () => {
      const proj = await projectService.getProjectById(projectId);

      const safeSettings = {
        ...(proj.settings || {}),
        mapByZone: proj.settings?.mapByZone || {},
      };

      setProject({
        ...proj,
        experiences: Array.isArray(proj.experiences) ? proj.experiences : [],
        scenes: proj.scenes || {},
        specs: proj.specs || {},
        gallery: Array.isArray(proj.gallery) ? proj.gallery : [],
        attachments: Array.isArray(proj.attachments) ? proj.attachments : [],
        settings: safeSettings,
      });

    })();
  }, [projectId]);

  useEffect(() => {
    if (project?.thumbnail) {
      console.log("🎬 Thumbnail actualizado:", project.thumbnail);
    }
  }, [project?.thumbnail]);

  useEffect(() => {
    setFabOpen(false);
  }, [activeTab, selectedScene]);

  useEffect(() => {
    if (!project) return;

    const el = contentRef.current;
    if (!el) return;

    const onScroll = () => {
      const top = el.scrollTop || 0;
      const shouldShow = top > 180;
      setShowFab(shouldShow);
      if (!shouldShow) setFabOpen(false);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    requestAnimationFrame(onScroll);

    return () => el.removeEventListener("scroll", onScroll);
  }, [project, activeTab]);

  useEffect(() => {
    if (!fabOpen) return;

    const onDocClick = (e) => {
      const root = fabRootRef.current;
      if (root && root.contains(e.target)) return;
      setFabOpen(false);
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [fabOpen]);

  const showError = (title, message) => {
    setModal({
      isOpen: true,
      type: "danger",
      title,
      message,
      onConfirm: () => setModal((m) => ({ ...m, isOpen: false })),
      showCancelButton: false,
      confirmText: "Aceptar",
    });
  };

  const showInfo = (title, message) => {
    setModal({
      isOpen: true,
      type: "alert",
      title,
      message,
      onConfirm: () => setModal((m) => ({ ...m, isOpen: false })),
      showCancelButton: false,
      confirmText: "Listo",
    });
  };

  const scrollToTopOfContent = () => {
    const el = contentRef.current;
    if (!el) return;
    el.scrollTo({ top: 0, behavior: "smooth" });
  };

  const uploadImageToBackend = async ({ file, type }) => {
    console.log("📤 Iniciando carga de imagen:", { file: file.name, type, UPLOAD_URL });
    
    const formData = new FormData();
    formData.append("image", file);
    formData.append("projectId", project.id);
    formData.append("type", type);

    try {
      const res = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: authService.getAuthHeaders(),
        body: formData,
      });
      console.log("📡 Respuesta del servidor:", { status: res.status, ok: res.ok });
      
      if (!res.ok) {
        let msg = "No se pudo subir el archivo.";
        try {
          const data = await res.json();
          console.error("Error del servidor:", data);
          msg = data?.error || data?.message || msg;
        } catch {}
        throw new Error(msg);
      }

      const data = await res.json();
      console.log("Imagen cargada exitosamente:", data);
      return data;
    } catch (error) {
      console.error("Error en uploadImageToBackend:", error);
      throw error;
    }
  };

  const getZoneLabel = (zoneId) =>
    project?.experiences?.find((z) => z.id === zoneId)?.name ||
    zoneId ||
    "Zona";

  const getMapForZone = (zoneId) =>
    project?.settings?.mapByZone?.[zoneId]?.mapUrl || "";

  const isScenePlacedOnZone = (sceneKey, zoneId) => {
    const m = project?.scenes?.[sceneKey]?.map;
    return (
      !!m &&
      m.zoneId === zoneId &&
      m.top !== undefined &&
      m.left !== undefined &&
      m.top !== "" &&
      m.left !== ""
    );
  };

  const handleBasicInfoChange = (field, value) => {
    setProject((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSettingChange = (field, value) => {
    setProject((prev) => ({
      ...prev,
      settings: {
        ...(prev.settings || {}),
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleRemoveThumbnail = () => {
    handleBasicInfoChange("thumbnail", "/images/default_image.png");
  };

  const handleThumbnailUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log("❌ No se seleccionó archivo");
      return;
    }

    console.log("🖼️ Iniciando carga de thumbnail:", file.name);

    try {
      const data = await uploadImageToBackend({ file, type: "thumbnail" });
      console.log("✅ Datos recibidos del servidor:", data);
      
      const urlWithTimestamp = `${data.url}?t=${Date.now()}`;
      console.log("🎯 URL final con timestamp:", urlWithTimestamp);
      
      handleBasicInfoChange("thumbnail", urlWithTimestamp);
      console.log("📝 Estado actualizado con thumbnail");
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      showError(
        "Error al subir la imagen",
        error.message || "No se pudo subir la imagen.",
      );
    } finally {
      event.target.value = "";
    }
  };

  const handleGalleryUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const currentGallery = project.gallery || [];
    if (currentGallery.length >= 4) {
      showError("Límite excedido", "Solo puedes agregar un máximo de 4 imágenes a la galería.");
      event.target.value = "";
      return;
    }

    const file = files[0];
    try {
      const data = await uploadImageToBackend({ file, type: "gallery" });
      const newImg = {
        id: `gallery_${Date.now()}`,
        src: `${data.url}?t=${Date.now()}`,
        title: file.name
      };
      setProject((prev) => ({
        ...prev,
        gallery: [...(prev.gallery || []), newImg]
      }));
      setHasChanges(true);
    } catch (error) {
      showError("Error al subir foto", error.message || "No se pudo subir el archivo.");
    } finally {
      event.target.value = "";
    }
  };

  const handleDeleteGalleryImage = (imgId) => {
    setProject((prev) => ({
      ...prev,
      gallery: (prev.gallery || []).filter((img) => img.id !== imgId)
    }));
    setHasChanges(true);
  };

  const handleDocumentUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    try {
      const data = await uploadImageToBackend({ file, type: "document" });
      const format = file.name.split(".").pop().toUpperCase();
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      const newDoc = {
        id: `doc_${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        category: "Documentos",
        description: "Archivo adjunto del proyecto",
        format,
        size: sizeMB,
        updatedAt: new Date().toISOString().split("T")[0],
        url: data.url
      };
      setProject((prev) => ({
        ...prev,
        attachments: [...(prev.attachments || []), newDoc]
      }));
      setHasChanges(true);
    } catch (error) {
      showError("Error al subir documento", error.message || "No se pudo subir el archivo.");
    } finally {
      event.target.value = "";
    }
  };

  const handleUpdateDocumentTitle = (docId, newTitle) => {
    setProject((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).map((att) =>
        att.id === docId ? { ...att, title: newTitle } : att
      )
    }));
    setHasChanges(true);
  };

  const handleDeleteDocument = (docId) => {
    setProject((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((att) => att.id !== docId)
    }));
    setHasChanges(true);
  };

  const handleAddExperience = () => {
    setShowCreateZoneModal(true);
  };

  const handleCreateZoneSubmit = () => {
    if (!newZoneName.trim()) {
      alert("Por favor ingresa un nombre para la zona.");
      return;
    }

    const newZoneId = `zone_${Date.now()}`;
    const newZone = {
      id: newZoneId,
      name: newZoneName,
      icon: "FaShip",
      startScene: "",
      description: "",
    };

    setProject((prev) => ({
      ...prev,
      experiences: [newZone, ...(prev.experiences || [])],
    }));
    setHasChanges(true);

    if (newZoneFiles && newZoneFiles.length > 0) {
      handleMultipleImagesUpload(newZoneId, newZoneName, newZoneFiles);
    }

    setNewZoneName("");
    setNewZoneFiles([]);
    setShowCreateZoneModal(false);
  };

  const handleUpdateExperience = (index, field, value) => {
    setProject((prev) => {
      const newExperiences = [...(prev.experiences || [])];
      newExperiences[index] = { ...newExperiences[index], [field]: value };
      return { ...prev, experiences: newExperiences };
    });
    setHasChanges(true);
  };

  const handleReorderExperiences = (sourceIndex, destinationIndex) => {
    setProject((prev) => {
      const newExperiences = [...(prev.experiences || [])];
      const [movedItem] = newExperiences.splice(sourceIndex, 1);
      newExperiences.splice(destinationIndex, 0, movedItem);
      return { ...prev, experiences: newExperiences };
    });
    setHasChanges(true);
  };

  const handleDeleteExperience = (index) => {
    const expName = project.experiences?.[index]?.name || "esta zona";
    setModal({
      isOpen: true,
      type: "danger",
      title: "¿Eliminar zona?",
      message: `Vas a eliminar "${expName}". Esta acción no se puede deshacer.`,
      onConfirm: () => {
        const zoneIdToDelete = project.experiences?.[index]?.id;

        setProject((prev) => {
          const nextExperiences = (prev.experiences || []).filter(
            (_, i) => i !== index,
          );

          const nextMapByZone = { ...(prev.settings?.mapByZone || {}) };
          if (zoneIdToDelete) delete nextMapByZone[zoneIdToDelete];

          const nextScenes = { ...(prev.scenes || {}) };
          if (zoneIdToDelete) {
            Object.keys(nextScenes).forEach((k) => {
              const m = nextScenes[k]?.map;
              if (m?.zoneId === zoneIdToDelete) {
                nextScenes[k] = { ...nextScenes[k], map: undefined };
              }
            });
          }

          return {
            ...prev,
            experiences: nextExperiences,
            scenes: nextScenes,
            settings: { ...(prev.settings || {}), mapByZone: nextMapByZone },
          };
        });

        if (mapZoneId === zoneIdToDelete) {
          setMapZoneId("");
          setMapSelectedSceneKey("");
          setMapPlacingMode(false);
        }

        setHasChanges(true);
        setModal((m) => ({ ...m, isOpen: false }));
      },
      showCancelButton: true,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
    });
  };

  const handleBulkDeleteZones = () => {
    if (selectedZonesToDelete.length === 0) return;
    setModal({
      isOpen: true,
      type: "danger",
      title: "¿Eliminar zonas seleccionadas?",
      message: `Vas a eliminar ${selectedZonesToDelete.length} zona(s). Esta acción no se puede deshacer.`,
      onConfirm: () => {
        setProject((prev) => {
          const nextExperiences = (prev.experiences || []).filter(
            (z) => !selectedZonesToDelete.includes(z.id)
          );

          const nextMapByZone = { ...(prev.settings?.mapByZone || {}) };
          selectedZonesToDelete.forEach((id) => {
            delete nextMapByZone[id];
          });

          const nextScenes = { ...(prev.scenes || {}) };
          selectedZonesToDelete.forEach((id) => {
            Object.keys(nextScenes).forEach((k) => {
              const m = nextScenes[k]?.map;
              if (m?.zoneId === id) {
                nextScenes[k] = { ...nextScenes[k], map: undefined };
              }
            });
          });

          return {
            ...prev,
            experiences: nextExperiences,
            scenes: nextScenes,
            settings: { ...(prev.settings || {}), mapByZone: nextMapByZone },
          };
        });

        if (selectedZonesToDelete.includes(mapZoneId)) {
          setMapZoneId("");
          setMapSelectedSceneKey("");
          setMapPlacingMode(false);
        }

        setSelectedZonesToDelete([]);
        setHasChanges(true);
        setModal((m) => ({ ...m, isOpen: false }));
      },
      showCancelButton: true,
      confirmText: "Eliminar seleccionadas",
      cancelText: "Cancelar",
    });
  };

  const handleAddScene = () => {
    const sceneKey = `scene_${Date.now()}`;
    const newScene = {
      title: "Nueva Escena",
      image: "",
      pitch: 0,
      yaw: 0,
      hotSpots: {},
    };

    setProject((prev) => ({
      ...prev,
      scenes: { ...(prev.scenes || {}), [sceneKey]: newScene },
    }));
    setHasChanges(true);
  };

  const handleUpdateScene = (sceneKey, field, value) => {
    setProject((prev) => ({
      ...prev,
      scenes: {
        ...(prev.scenes || {}),
        [sceneKey]: {
          ...(prev.scenes?.[sceneKey] || {}),
          [field]: value,
        },
      },
    }));
    setHasChanges(true);
  };

  const handleDeleteScene = (sceneKey) => {
    const sceneName = project.scenes?.[sceneKey]?.title || sceneKey;
    setModal({
      isOpen: true,
      type: "danger",
      title: "¿Eliminar escena?",
      message: `Vas a eliminar "${sceneName}" y todos sus hotspots. Esta acción no se puede deshacer.`,
      onConfirm: () => {
        setProject((prev) => {
          const newScenes = { ...(prev.scenes || {}) };
          delete newScenes[sceneKey];
          
          let newSettings = { ...(prev.settings || {}) };
          if (newSettings.initialSceneId === sceneKey) {
            newSettings.initialSceneId = "";
          }

          return { ...prev, scenes: newScenes, settings: newSettings };
        });
        setHasChanges(true);
        setModal((m) => ({ ...m, isOpen: false }));
      },
      showCancelButton: true,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
    });
  };

  const handleBulkDeleteScenes = () => {
    if (selectedScenesToDelete.length === 0) return;
    setModal({
      isOpen: true,
      type: "danger",
      title: "¿Eliminar escenas seleccionadas?",
      message: `Vas a eliminar ${selectedScenesToDelete.length} escena(s) y todos sus hotspots. Esta acción no se puede deshacer.`,
      onConfirm: () => {
        setProject((prev) => {
          const newScenes = { ...(prev.scenes || {}) };
          let newSettings = { ...(prev.settings || {}) };

          selectedScenesToDelete.forEach((key) => {
            delete newScenes[key];
            if (newSettings.initialSceneId === key) {
              newSettings.initialSceneId = "";
            }
          });
          
          return { ...prev, scenes: newScenes, settings: newSettings };
        });
        setSelectedScenesToDelete([]);
        setHasChanges(true);
        setModal((m) => ({ ...m, isOpen: false }));
      },
      showCancelButton: true,
      confirmText: "Eliminar seleccionadas",
      cancelText: "Cancelar",
    });
  };

  const handleImageUpload = async (sceneKey, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await uploadImageToBackend({
        file,
        type: `scene_${sceneKey}`,
      });
      const urlWithTimestamp = `${data.url}?t=${Date.now()}`;
      handleUpdateScene(sceneKey, "image", urlWithTimestamp);
    } catch (error) {
      console.error("Error uploading image:", error);
      showError(
        "Error al subir la imagen",
        error.message || "No se pudo subir la imagen.",
      );
    } finally {
      event.target.value = "";
    }
  };

  const handleMapUploadForZone = async (zoneId, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await uploadImageToBackend({
        file,
        type: `map_zone_${zoneId}`,
      });
      const urlWithTimestamp = `${data.url}?t=${Date.now()}`;

      setProject((prev) => ({
        ...prev,
        settings: {
          ...(prev.settings || {}),
          mapByZone: {
            ...(prev.settings?.mapByZone || {}),
            [zoneId]: { mapUrl: urlWithTimestamp },
          },
        },
      }));
      setHasChanges(true);
    } catch (error) {
      console.error("Error uploading map:", error);
      showError("Error al subir el mapa", error.message || "No se pudo subir.");
    } finally {
      event.target.value = "";
    }
  };

  const handleRemoveMapForZone = (zoneId) => {
    setProject((prev) => ({
      ...prev,
      settings: {
        ...(prev.settings || {}),
        mapByZone: {
          ...(prev.settings?.mapByZone || {}),
          [zoneId]: { mapUrl: "" },
        },
      },
    }));
    setHasChanges(true);
  };

  const handleUpdateSceneMap = (sceneKey, partialMap) => {
    setProject((prev) => ({
      ...prev,
      scenes: {
        ...(prev.scenes || {}),
        [sceneKey]: {
          ...(prev.scenes?.[sceneKey] || {}),
          map: {
            ...(prev.scenes?.[sceneKey]?.map || {}),
            ...partialMap,
          },
        },
      },
    }));
    setHasChanges(true);
  };

  const handleClearSceneMap = (sceneKey) => {
    setProject((prev) => ({
      ...prev,
      scenes: {
        ...(prev.scenes || {}),
        [sceneKey]: {
          ...(prev.scenes?.[sceneKey] || {}),
          map: undefined,
        },
      },
    }));
    setHasChanges(true);
  };

  const handleStartPlacing = () => {
    if (!mapZoneId) {
      showInfo(
        "Selecciona una zona",
        "Primero elige la zona para cargar su mapa.",
      );
      return;
    }

    if (!mapSelectedSceneKey) {
      showInfo(
        "Selecciona una escena",
        "Primero elige la escena que quieres ubicar y luego pulsa “Ubicar en el mapa”.",
      );
      return;
    }

    const mapUrl = getMapForZone(mapZoneId);
    if (!mapUrl) {
      showInfo(
        "Falta el mapa",
        `Sube el mapa de la zona "${getZoneLabel(mapZoneId)}" para poder ubicar escenas.`,
      );
      return;
    }

    setMapPlacingMode(true);
  };

  const handleStopPlacing = () => setMapPlacingMode(false);

  const updateMapImageRect = () => {
    const container = mapPlanContainerRef.current;
    const img = mapImageRef.current;
    if (!container || !img) return;

    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    setMapImageRect({
      left: Math.max(0, imgRect.left - containerRect.left),
      top: Math.max(0, imgRect.top - containerRect.top),
      width: Math.max(0, imgRect.width),
      height: Math.max(0, imgRect.height),
    });
  };

  useEffect(() => {
    const mapUrl = getMapForZone(mapZoneId);
    if (!mapZoneId || !mapUrl) return;
    
    requestAnimationFrame(updateMapImageRect);

    const container = mapPlanContainerRef.current;
    let ro = null;

    if (container && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => requestAnimationFrame(updateMapImageRect));
      ro.observe(container);
    }

    const onResize = () => requestAnimationFrame(updateMapImageRect);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (ro) ro.disconnect();
    };
  }, [mapZoneId, project?.settings?.mapByZone]);

  const handlePlanClickPlaceScene = (e) => {
    if (!mapPlacingMode) return;

    const sceneKey = mapSelectedSceneKey;
    if (!sceneKey) {
      showInfo(
        "Selecciona una escena",
        "Elige la escena antes de hacer click.",
      );
      return;
    }

    const mapUrl = getMapForZone(mapZoneId);
    if (!mapUrl) {
      showInfo("Falta el mapa", "Sube el mapa y luego podrás ubicar escenas.");
      return;
    }

    const container = mapPlanContainerRef.current || e.currentTarget;
    
    const imgElement = mapImageRef.current || container.querySelector('.pe-map-image');
    if (!imgElement) {
      showInfo("Error", "No se encontró la imagen del mapa.");
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const imgRect = imgElement.getBoundingClientRect();
    
    const xRelativeToContainer = e.clientX - containerRect.left;
    const yRelativeToContainer = e.clientY - containerRect.top;
    
    const imgLeftInContainer = imgRect.left - containerRect.left;
    const imgTopInContainer = imgRect.top - containerRect.top;
    
    const xVisual = xRelativeToContainer - imgLeftInContainer;
    const yVisual = yRelativeToContainer - imgTopInContainer;
    
    const xNorm = Math.max(0, Math.min(1, xVisual / imgRect.width));
    const yNorm = Math.max(0, Math.min(1, yVisual / imgRect.height));

    const leftPct = Math.max(0, Math.min(100, xNorm * 100));
    const topPct = Math.max(0, Math.min(100, yNorm * 100));

    handleUpdateSceneMap(sceneKey, {
      zoneId: mapZoneId,
      top: Number(topPct.toFixed(2)),
      left: Number(leftPct.toFixed(2)),
      normalizedCoords: true,
    });

    const currentTitle = project?.scenes?.[sceneKey]?.map?.title || "";
    if (!currentTitle) {
      handleUpdateSceneMap(sceneKey, {
        title: project?.scenes?.[sceneKey]?.title || sceneKey,
      });
    }

    setMapPlacingMode(false);
  };

  const handleAddHotspot = (sceneKey) => {
    const hotspotKey = `hotspot_${Date.now()}`;
    const newHotspot = {
      type: "custom",
      pitch: 0,
      yaw: 0,
      cssClass: "moveScene",
      scene: "",
      label: "Nuevo Hotspot",
      title: "",
      description: "",
      attachments: [],
    };

    setProject((prev) => ({
      ...prev,
      scenes: {
        ...(prev.scenes || {}),
        [sceneKey]: {
          ...(prev.scenes?.[sceneKey] || {}),
          hotSpots: {
            ...(prev.scenes?.[sceneKey]?.hotSpots || {}),
            [hotspotKey]: newHotspot,
          },
        },
      },
    }));
    setHasChanges(true);
  };

  const handleUpdateHotspot = (sceneKey, hotspotKey, field, value) => {
    setProject((prev) => ({
      ...prev,
      scenes: {
        ...(prev.scenes || {}),
        [sceneKey]: {
          ...(prev.scenes?.[sceneKey] || {}),
          hotSpots: {
            ...(prev.scenes?.[sceneKey]?.hotSpots || {}),
            [hotspotKey]: {
              ...(prev.scenes?.[sceneKey]?.hotSpots?.[hotspotKey] || {}),
              [field]: value,
            },
          },
        },
      },
    }));
    setHasChanges(true);
  };

  const handleTranslateHotspot = async (sceneKey, hotspotKey) => {
    const hs = project.scenes?.[sceneKey]?.hotSpots?.[hotspotKey];
    if (!hs || !hs.label) return;
    
    // Only auto-translate if it's an information_bubble, or if we want to do it for all hotspots?
    // The requirement says "La burbuja debe mostrar automáticamente el idioma correspondiente", so let's translate.
    try {
      const result = await landingService.translateContent({
        title: hs.label
      });
      if (result && result.title_en && result.title_es) {
        setProject((prev) => {
          const newState = { ...prev };
          if (newState.scenes?.[sceneKey]?.hotSpots?.[hotspotKey]) {
            newState.scenes[sceneKey].hotSpots[hotspotKey].label_en = result.title_en;
            newState.scenes[sceneKey].hotSpots[hotspotKey].label_es = result.title_es;
          }
          return newState;
        });
        showInfo("Traducción generada", "El nombre se ha traducido automáticamente a inglés y español.");
      }
    } catch (e) {
      console.error("Auto-translate failed", e);
    }
  };

  const handleDeleteHotspot = (sceneKey, hotspotKey) => {
    const hotspotLabel =
      project.scenes?.[sceneKey]?.hotSpots?.[hotspotKey]?.label || hotspotKey;

    setModal({
      isOpen: true,
      type: "danger",
      title: "¿Eliminar hotspot?",
      message: `Vas a eliminar "${hotspotLabel}". Esta acción no se puede deshacer.`,
      onConfirm: () => {
        setProject((prev) => {
          const newHotspots = { ...(prev.scenes?.[sceneKey]?.hotSpots || {}) };
          delete newHotspots[hotspotKey];
          return {
            ...prev,
            scenes: {
              ...(prev.scenes || {}),
              [sceneKey]: {
                ...(prev.scenes?.[sceneKey] || {}),
                hotSpots: newHotspots,
              },
            },
          };
        });
        setHasChanges(true);
        setModal((m) => ({ ...m, isOpen: false }));
      },
      showCancelButton: true,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
    });
  };

  const handleHotspotAttachmentUpload = async (sceneKey, hotspotKey, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await uploadImageToBackend({
        file,
        type: `hotspot_${sceneKey}_${hotspotKey}`,
      });
      const urlWithTimestamp = `${data.url}?t=${Date.now()}`;

      const newAtt = {
        url: urlWithTimestamp,
        filename: data.filename,
        originalName: data.originalName || file.name,
        mimetype: data.mimetype || file.type,
        size: data.size || file.size,
        folder: "Adjuntos",
      };

      setProject((prev) => {
        const hs = prev.scenes?.[sceneKey]?.hotSpots?.[hotspotKey] || {};
        const current = Array.isArray(hs.attachments) ? hs.attachments : [];
        return {
          ...prev,
          scenes: {
            ...(prev.scenes || {}),
            [sceneKey]: {
              ...(prev.scenes?.[sceneKey] || {}),
              hotSpots: {
                ...(prev.scenes?.[sceneKey]?.hotSpots || {}),
                [hotspotKey]: {
                  ...hs,
                  attachments: [...current, newAtt],
                },
              },
            },
          },
        };
      });

      setHasChanges(true);
    } catch (error) {
      console.error("Error uploading hotspot attachment:", error);
      showError(
        "Error al subir el adjunto",
        error.message || "No se pudo subir el adjunto.",
      );
    } finally {
      event.target.value = "";
    }
  };

  const handleRemoveHotspotAttachment = (sceneKey, hotspotKey, index) => {
    setProject((prev) => {
      const hs = prev.scenes?.[sceneKey]?.hotSpots?.[hotspotKey] || {};
      const current = Array.isArray(hs.attachments) ? hs.attachments : [];
      const next = current.filter((_, i) => i !== index);
      return {
        ...prev,
        scenes: {
          ...(prev.scenes || {}),
          [sceneKey]: {
            ...(prev.scenes?.[sceneKey] || {}),
            hotSpots: {
              ...(prev.scenes?.[sceneKey]?.hotSpots || {}),
              [hotspotKey]: {
                ...hs,
                attachments: next,
              },
            },
          },
        },
      };
    });
    setHasChanges(true);
  };

  const handleUpdateHotspotAttachmentFolder = (
    sceneKey,
    hotspotKey,
    index,
    folder,
  ) => {
    setProject((prev) => {
      const hs = prev.scenes?.[sceneKey]?.hotSpots?.[hotspotKey] || {};
      const current = Array.isArray(hs.attachments) ? hs.attachments : [];
      const next = current.map((a, i) => (i === index ? { ...a, folder } : a));
      return {
        ...prev,
        scenes: {
          ...(prev.scenes || {}),
          [sceneKey]: {
            ...(prev.scenes?.[sceneKey] || {}),
            hotSpots: {
              ...(prev.scenes?.[sceneKey]?.hotSpots || {}),
              [hotspotKey]: {
                ...hs,
                attachments: next,
              },
            },
          },
        },
      };
    });
    setHasChanges(true);
  };

  const handleSaveProject = async () => {
    setIsSaving(true);
    const result = await projectService.saveProject(project);
    setIsSaving(false);
    if (result.success) {
      setHasChanges(false);
      showInfo(
        "Cambios guardados",
        "Listo Tus cambios se guardaron correctamente.",
      );
    } else {
      showError(
        "No se pudo guardar",
        `Ocurrió un problema al guardar: ${result.error}`,
      );
    }
  };

  const handleClose = () => {
    if (!hasChanges) return onClose?.();

    setModal({
      isOpen: true,
      type: "danger",
      title: "Cambios sin guardar",
      message:
        "Tienes cambios sin guardar. Si cierras ahora, perderás lo que hiciste. ¿Quieres salir de todas formas?",
      onConfirm: () => {
        setModal((m) => ({ ...m, isOpen: false }));
        onClose?.();
      },
      showCancelButton: true,
      confirmText: "Salir",
      cancelText: "Seguir editando",
    });
  };

  const handleDeleteProject = () => {
    setModal({
      isOpen: true,
      type: "delete",
      title: "Eliminar proyecto",
      message: `Vas a eliminar "${project.name}" de forma permanente. Se borrarán escenas, hotspots, zonas y configuraciones.`,
      onConfirm: async () => {
        const result = await projectService.deleteProject(project.id);
        if (result.success) {
          setModal({
            isOpen: true,
            type: "alert",
            title: "Proyecto eliminado",
            message: "Listo El proyecto fue eliminado.",
            onConfirm: () => {
              setModal((m) => ({ ...m, isOpen: false }));
              onSave?.(null);
              onClose?.();
            },
            showCancelButton: false,
            confirmText: "Aceptar",
          });
        } else {
          showError(
            "No se pudo eliminar",
            `Ocurrió un problema: ${result.error}`,
          );
        }
      },
      requiresConfirmation: true,
      confirmationText: "ELIMINAR",
      showCancelButton: true,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
    });
  };

  const iconOptions = [
    "FaShip",
    "FaCog",
    "FaAnchor",
    "FaWater",
    "FaMapMarkerAlt",
    "FaBuilding",
  ];

  const hotspotTypes = [
    { value: "moveScene", label: "Navegación (ir a escena)" },
    { value: "hotSpotElement", label: "Elemento (anexos)" },
    { value: "infoHotspot", label: "Info (texto)" },
    { value: "information_bubble", label: "Burbuja de Información" },
  ];

  const scenesCount = useMemo(
    () => Object.keys(project?.scenes || {}).length,
    [project],
  );

  const scenesForZone = useMemo(() => {
    const zid = mapZoneId;
    if (!zid) return [];
    return Object.entries(project?.scenes || {}).filter(
      ([_, s]) => s?.map?.zoneId === zid,
    );
  }, [project, mapZoneId]);

  const fabConfig = useMemo(() => {
    if (activeTab === "experiences")
      return { label: "+ Zona", primary: "addZone" };
    if (activeTab === "scenes")
      return { label: "+ Escena", primary: "addScene" };
    if (activeTab === "hotspots")
      return { label: "+ Hotspot", primary: "addHotspot" };
    return null;
  }, [activeTab]);

  const runFabPrimary = () => {
    if (!fabConfig) return;
    if (fabConfig.primary === "addZone") return handleAddExperience();
    if (fabConfig.primary === "addScene") return handleAddScene();
    if (fabConfig.primary === "addHotspot") {
      if (!selectedScene) {
        showInfo(
          "Selecciona una escena",
          "Primero selecciona una escena para poder crear hotspots.",
        );
        return;
      }
      return handleAddHotspot(selectedScene);
    }
  };

  const handleMultipleImagesUpload = async (zoneId, zoneName, eventOrFiles) => {
    let files;
    if (eventOrFiles?.target?.files) {
      files = Array.from(eventOrFiles.target.files);
    } else if (Array.isArray(eventOrFiles) || eventOrFiles instanceof FileList) {
      files = Array.from(eventOrFiles);
    } else {
      return;
    }

    if (!files || files.length === 0) return;

    setIsUploadingMultiple(true);

    try {
      const existingScenes = Object.values(project.scenes || {}).filter(s => s.zoneId === zoneId);
      let startIndex = existingScenes.length;
      
      const newScenesToAdd = {};

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const sceneIndex = startIndex + i + 1;
        const sceneTitle = `${zoneName}_${sceneIndex}`;
        const sceneKey = `scene_${Date.now()}_${i}`;

        try {
          const data = await uploadImageToBackend({
            file,
            type: `scene_${sceneKey}`,
          });
          const urlWithTimestamp = `${data.url}?t=${Date.now()}`;

          newScenesToAdd[sceneKey] = {
            title: sceneTitle,
            image: urlWithTimestamp,
            pitch: 0,
            yaw: 0,
            hotSpots: {},
            zoneId: zoneId
          };
        } catch (error) {
          console.error("Error al subir archivo", file.name, error);
        }
      }

      setProject(prev => ({
        ...prev,
        scenes: {
          ...(prev.scenes || {}),
          ...newScenesToAdd
        }
      }));
      setHasChanges(true);
    } catch (error) {
      console.error("Error global en subida multiple", error);
    } finally {
      setIsUploadingMultiple(false);
      if (eventOrFiles?.target) {
        eventOrFiles.target.value = "";
      }
    }
  };

  const totalHotspots = Object.values(project?.scenes || {}).reduce((acc, sc) => acc + Object.keys(sc.hotSpots || {}).length, 0);
  const totalMapas = Object.keys(project?.settings?.mapByZone || {}).length;
  
  const scenesByZone = {};
  const unassignedScenes = [];
  
  Object.entries(project?.scenes || {}).forEach(([sceneKey, scene]) => {
    if (scene.zoneId) {
      if (!scenesByZone[scene.zoneId]) scenesByZone[scene.zoneId] = [];
      scenesByZone[scene.zoneId].push({ sceneKey, scene });
    } else {
      unassignedScenes.push({ sceneKey, scene });
    }
  });

  const handleCloseModal = () => setModal((m) => ({ ...m, isOpen: false }));
  const handleCloseCreateZone = () => {
    setShowCreateZoneModal(false);
    setNewZoneName("");
    setNewZoneFiles([]);
  };
  const handleVisualEditorSave = (updatedScene) => {
    setProject((prev) => ({
      ...prev,
      scenes: {
        ...(prev?.scenes || {}),
        [visualEditorSceneKey]: updatedScene,
      },
    }));
    setHasChanges(true);
    
    showInfo(
      "Hotspots actualizados",
      `Se guardaron los hotspots de "${updatedScene?.title || visualEditorSceneKey}" en memoria. Presiona "Guardar Proyecto" para persistir.`
    );
  };

  return {
    navigate,
    project,
    isUploadingMultiple,
    isSaving,
    hasChanges,
    activeTab,
    setActiveTab,
    selectedScene,
    setSelectedScene,
    visualEditorSceneKey,
    setVisualEditorSceneKey,
    showCreateZoneModal,
    newZoneName,
    setNewZoneName,
    newZoneFiles,
    setNewZoneFiles,
    selectedZoneId,
    setSelectedZoneId,
    zoneSearchQuery,
    setZoneSearchQuery,
    sceneFilter,
    setSceneFilter,
    showSceneFilterDropdown,
    setShowSceneFilterDropdown,
    selectedZonesToDelete,
    setSelectedZonesToDelete,
    selectedScenesToDelete,
    setSelectedScenesToDelete,
    mapZoneId,
    setMapZoneId,
    mapSelectedSceneKey,
    setMapSelectedSceneKey,
    mapPlacingMode,
    setMapPlacingMode,
    mapPlanContainerRef,
    mapImageRef,
    mapImageRect,
    contentRef,
    fabRootRef,
    showFab,
    fabOpen,
    setFabOpen,
    modal,
    setModal,
    iconOptions,
    hotspotTypes,
    scenesCount,
    scenesForZone,
    fabConfig,
    totalHotspots,
    totalMapas,
    scenesByZone,
    unassignedScenes,
    showError,
    showInfo,
    scrollToTopOfContent,
    getZoneLabel,
    getMapForZone,
    isScenePlacedOnZone,
    handleBasicInfoChange,
    handleSettingChange,
    handleRemoveThumbnail,
    handleThumbnailUpload,
    handleGalleryUpload,
    handleDeleteGalleryImage,
    handleDocumentUpload,
    handleUpdateDocumentTitle,
    handleDeleteDocument,
    handleAddExperience,
    handleCreateZoneSubmit,
    handleUpdateExperience,
    handleReorderExperiences,
    handleDeleteExperience,
    handleBulkDeleteZones,
    handleAddScene,
    handleUpdateScene,
    handleDeleteScene,
    handleBulkDeleteScenes,
    handleImageUpload,
    handleMapUploadForZone,
    handleRemoveMapForZone,
    handleUpdateSceneMap,
    handleClearSceneMap,
    handleStartPlacing,
    handleStopPlacing,
    handlePlanClickPlaceScene,
    handleAddHotspot,
    handleUpdateHotspot,
    handleTranslateHotspot,
    handleDeleteHotspot,
    handleHotspotAttachmentUpload,
    handleRemoveHotspotAttachment,
    handleUpdateHotspotAttachmentFolder,
    handleSaveProject,
    handleClose,
    handleDeleteProject,
    runFabPrimary,
    handleMultipleImagesUpload,
    handleCloseModal,
    handleCloseCreateZone,
    handleVisualEditorSave,
  };
}

