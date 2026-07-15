// ProjectEditor.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaCog, FaUsers, FaArrowLeft, FaPlus, FaCamera, FaImage, 
  FaSave, FaTimes, FaCheck, FaExclamationTriangle, FaInfoCircle,
  FaMapMarkedAlt, FaCompass, FaRegDotCircle, FaVideo,
  FaGripLines, FaUndo, FaRedo, FaCaretDown, FaCaretUp, FaTrash,
  FaFileExport, FaDownload, FaUpload, FaFilePdf, FaPaperclip, FaChevronUp, FaShip, FaSearch, FaMapMarkerAlt, FaMousePointer, FaEye, FaEdit
} from 'react-icons/fa';
import DynamicNavbar from '../../layout/Navbar/DynamicNavbar';
import "./ProjectEditor.css";
import "./ThumbnailUpload.css";
import cotecmarLogo from "../../../assets/images/logo.png";
import projectService from "../../../api/services/projectService";
import authService from "../../../api/services/authService";
import ConfirmModal from "../../common/Modal/ConfirmModal";
import { API_BASE_URL } from "../../../api/endpoints";

const ProjectEditor = ({ projectId, onClose, onSave }) => {
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [isUploadingMultiple, setIsUploadingMultiple] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedScene, setSelectedScene] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Create Zone Modal
  const [showCreateZoneModal, setShowCreateZoneModal] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneFiles, setNewZoneFiles] = useState([]);

  // Zonas y Escenas (Master-Detail)
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [zoneSearchQuery, setZoneSearchQuery] = useState("");
  const [sceneFilter, setSceneFilter] = useState("all"); 
  const [showSceneFilterDropdown, setShowSceneFilterDropdown] = useState(false);

  // Bulk Delete States
  const [selectedZonesToDelete, setSelectedZonesToDelete] = useState([]);
  const [selectedScenesToDelete, setSelectedScenesToDelete] = useState([]);

  // =========================
  // MAP TAB (MAPA POR ZONA)
  // =========================
  const [mapZoneId, setMapZoneId] = useState(""); 
  const [mapSelectedSceneKey, setMapSelectedSceneKey] = useState("");
  const [mapPlacingMode, setMapPlacingMode] = useState(false);
  const mapPlanContainerRef = useRef(null);
  const mapImageRef = useRef(null);
  const [mapImageRect, setMapImageRect] = useState({ left: 0, top: 0, width: 0, height: 0 });


  // Scroll + FAB
  const contentRef = useRef(null);
  const fabRootRef = useRef(null);
  const [showFab, setShowFab] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  // Modal
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

      // Estructura segura + NUEVO: mapByZone
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

  // Monitor de cambios en thumbnail (DEBUG)
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

  // HELPERS
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

  // Upload genérico (tu backend ya lo soporta)
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



  // =========================
  // MAPA POR ZONA - HELPERS
  // =========================
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

  

  // HANDLERS - Basic
  const handleBasicInfoChange = (field, value) => {
    setProject((prev) => ({ ...prev, [field]: value }));
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
      
      // Agregar timestamp para evitar caché del navegador
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



  // Gallery Handlers
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

  // Document Handlers
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

    // Agregar la zona al estado inmediatamente (al principio de la lista)
    setProject((prev) => ({
      ...prev,
      experiences: [newZone, ...(prev.experiences || [])],
    }));
    setHasChanges(true);

    // Subir imágenes si se seleccionaron
    if (newZoneFiles && newZoneFiles.length > 0) {
      handleMultipleImagesUpload(newZoneId, newZoneName, newZoneFiles);
    }

    // Reset y cerrar modal
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
          // 1) borrar zona
          const nextExperiences = (prev.experiences || []).filter(
            (_, i) => i !== index,
          );

          // 2) limpiar mapByZone
          const nextMapByZone = { ...(prev.settings?.mapByZone || {}) };
          if (zoneIdToDelete) delete nextMapByZone[zoneIdToDelete];

          // 3) opcional: limpiar escenas ubicadas en esa zona
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

        // reset UI si estaba en esa zona
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

  // HANDLERS - Scenes
  const handleAddScene = () => {
    const sceneKey = `scene_${Date.now()}`;
    const newScene = {
      title: "Nueva Escena",
      image: "",
      pitch: 0,
      yaw: 0,
      hotSpots: {},
      // Si quieres amarrar escena a una zona desde el inicio, puedes guardar zoneId aquí:
      // zoneId: mapZoneId || ""
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
          return { ...prev, scenes: newScenes };
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
          selectedScenesToDelete.forEach((key) => {
            delete newScenes[key];
          });
          return { ...prev, scenes: newScenes };
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
      // Agregar timestamp para evitar caché del navegador
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

  // =========================
  // MAPA POR ZONA - HANDLERS
  // =========================
  const handleMapUploadForZone = async (zoneId, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await uploadImageToBackend({
        file,
        type: `map_zone_${zoneId}`,
      });
      // Agregar timestamp para evitar caché del navegador
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

  // Calcular posición de la imagen dentro del contenedor (igual que TopMapOverlay)
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
    
    // Buscar la imagen real dentro del contenedor
    const imgElement = mapImageRef.current || container.querySelector('.pe-map-image');
    if (!imgElement) {
      showInfo("Error", "No se encontró la imagen del mapa.");
      return;
    }

    // Obtener el rectángulo del contenedor y de la imagen
    const containerRect = container.getBoundingClientRect();
    const imgRect = imgElement.getBoundingClientRect();
    
    // Calcular la posición relativa al contenedor (igual que mapImageRect)
    const xRelativeToContainer = e.clientX - containerRect.left;
    const yRelativeToContainer = e.clientY - containerRect.top;
    
    // Calcular la posición relativa a la imagen dentro del contenedor
    const imgLeftInContainer = imgRect.left - containerRect.left;
    const imgTopInContainer = imgRect.top - containerRect.top;
    
    // Posición relativa a la imagen visual (rotada)
    const xVisual = xRelativeToContainer - imgLeftInContainer;
    const yVisual = yRelativeToContainer - imgTopInContainer;
    
    // Normalizar coordenadas visuales (0-1) dentro de la imagen rotada
    const xNorm = Math.max(0, Math.min(1, xVisual / imgRect.width));
    const yNorm = Math.max(0, Math.min(1, yVisual / imgRect.height));

    // Convertir a espacio original (rotación 270° horario)
    const leftPct = Math.max(0, Math.min(100, (1 - yNorm) * 100));
    const topPct = Math.max(0, Math.min(100, xNorm * 100));

    handleUpdateSceneMap(sceneKey, {
      zoneId: mapZoneId,
      top: Number(topPct.toFixed(2)),
      left: Number(leftPct.toFixed(2)),
    });

    const currentTitle = project?.scenes?.[sceneKey]?.map?.title || "";
    if (!currentTitle) {
      handleUpdateSceneMap(sceneKey, {
        title: project?.scenes?.[sceneKey]?.title || sceneKey,
      });
    }

    setMapPlacingMode(false);
  };

  // HANDLERS - Hotspots
  const handleAddHotspot = (sceneKey) => {
    const hotspotKey = `hotspot_${Date.now()}`;
    const newHotspot = {
      type: "custom",
      pitch: 0,
      yaw: 0,
      cssClass: "moveScene", // moveScene | hotSpotElement | infoHotspot
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
      // Agregar timestamp para evitar caché del navegador
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

  // SAVE / CLOSE / DELETE
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
  ];

  const scenesCount = useMemo(
    () => Object.keys(project?.scenes || {}).length,
    [project],
  );

  // Pines SOLO de la zona seleccionada (map.zoneId)
  const scenesForZone = useMemo(() => {
    const zid = mapZoneId;
    if (!zid) return [];
    return Object.entries(project?.scenes || {}).filter(
      ([_, s]) => s?.map?.zoneId === zid,
    );
  }, [project, mapZoneId]);

  // FAB ICON
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
      // Find current scenes in this zone to determine start index
      const existingScenes = Object.values(project.scenes || {}).filter(s => s.zoneId === zoneId);
      let startIndex = existingScenes.length;
      
      const newScenesToAdd = {};

      // Sequential upload logic for multiple files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const sceneIndex = startIndex + i + 1;
        const sceneTitle = `${zoneName}_${sceneIndex}`;
        const sceneKey = `scene_${Date.now()}_${i}`;

        try {
          // Utilizar la función existente uploadImageToBackend
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

      // Append new scenes to state
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

  if (!project) return <div className="loading">Cargando proyecto...</div>;

  const totalHotspots = Object.values(project.scenes || {}).reduce((acc, sc) => acc + Object.keys(sc.hotSpots || {}).length, 0);
  const totalMapas = Object.keys(project.settings?.mapByZone || {}).length;
  
  // Agrupar escenas por zona para la pestaña Zonas y Escenas
  const scenesByZone = {};
  const unassignedScenes = [];
  
  Object.entries(project.scenes || {}).forEach(([sceneKey, scene]) => {
    if (scene.zoneId) {
      if (!scenesByZone[scene.zoneId]) scenesByZone[scene.zoneId] = [];
      scenesByZone[scene.zoneId].push({ sceneKey, scene });
    } else {
      unassignedScenes.push({ sceneKey, scene });
    }
  });

  return (
    <div className="project-editor modern-editor">
      {/* HEADER PREMIUM */}
      <DynamicNavbar
        showBackButton={false}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '18px', margin: 0 }}>{project.name}</h1>
          </div>
        }
        subtitle={
          <p style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, opacity: 0.8 }}>
            Todos los cambios se guardan manualmente
            {hasChanges && <span className="unsaved-dot" style={{ display: 'inline-block', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span>}
          </p>
        }
      >
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            className="btn-reload-modern"
            onClick={() => window.location.reload()}
            title="Recargar"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'background 0.2s' }}
          >
            Recargar
          </button>
          <button
            className="btn-save-modern"
            onClick={handleSaveProject}
            disabled={isSaving || !hasChanges}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: hasChanges ? '#10b981' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: hasChanges ? 'pointer' : 'not-allowed', fontSize: '14px', fontWeight: '600', opacity: hasChanges ? 1 : 0.6, transition: 'all 0.2s' }}
          >
            <FaSave /> {isSaving ? 'Guardando...' : hasChanges ? 'Guardar Cambios' : 'Guardado'}
          </button>
        </div>
      </DynamicNavbar>



      {/* DASHBOARD TABS */}
      <div className="editor-tabs-modern">
        <button
          className={`tab-modern ${activeTab === "basic" ? "active" : ""}`}
          onClick={() => setActiveTab("basic")}
        >
          <div className="tab-content">
            <span className="tab-icon"><FaInfoCircle /></span>
            <span className="tab-label">Información</span>
          </div>
        </button>
        <button
          className={`tab-modern ${activeTab === "scenes" || activeTab === "experiences" ? "active" : ""}`}
          onClick={() => setActiveTab("scenes")}
        >
          <div className="tab-content">
            <span className="tab-icon"><FaImage /></span>
            <span className="tab-label">Zonas y Escenas</span>
            <span className="tab-badge">{scenesCount}</span>
          </div>
        </button>
        <button
          className={`tab-modern ${activeTab === "hotspots" ? "active" : ""}`}
          onClick={() => setActiveTab("hotspots")}
        >
          <div className="tab-content">
            <span className="tab-icon"><FaMapMarkerAlt /></span>
            <span className="tab-label">Hotspots</span>
            <span className="tab-badge">{totalHotspots}</span>
          </div>
        </button>
        <button
          className={`tab-modern ${activeTab === "map" ? "active" : ""}`}
          onClick={() => setActiveTab("map")}
        >
          <div className="tab-content">
            <span className="tab-icon"><FaMapMarkerAlt /></span>
            <span className="tab-label">Mapas</span>
            <span className="tab-badge">{totalMapas}</span>
          </div>
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="editor-content-modern" ref={contentRef}>
        <div style={{ width: '100%', marginBottom: '24px', display: 'flex', justifyContent: 'flex-start' }}>
          <button 
            onClick={() => navigate("/admin")} 
            style={{ padding: '10px 20px', borderRadius: '10px', background: '#ffffff', color: '#334155', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
          >
            <FaArrowLeft /> Volver
          </button>
        </div>
        
        {/* BASIC TAB */}
        {activeTab === "basic" && (
          <div className="tab-pane-modern">
            <div className="stats-panel-modern">
              <div className="stat-card-modern">
                <div className="stat-value">{project.experiences?.length || 0}</div>
                <div className="stat-label">Total Zonas</div>
              </div>
              <div className="stat-card-modern">
                <div className="stat-value">{scenesCount}</div>
                <div className="stat-label">Total Escenas</div>
              </div>
              <div className="stat-card-modern">
                <div className="stat-value">{totalHotspots}</div>
                <div className="stat-label">Total Hotspots</div>
              </div>
              <div className="stat-card-modern">
                <div className="stat-value">{totalMapas}</div>
                <div className="stat-label">Total Mapas</div>
              </div>
            </div>

            <div className="premium-card">
              <div className="premium-card-header">
                <h2>Detalles del Proyecto</h2>
                <p>Configura la información principal y el estado operativo.</p>
              </div>
              <div className="premium-card-body">
                <div className="form-grid-modern">
                  <div className="form-group-modern">
                    <label>Nombre del Proyecto</label>
                    <input type="text" value={project.name || ""} onChange={(e) => handleBasicInfoChange("name", e.target.value)} />
                  </div>
                  <div className="form-group-modern">
                    <label>Tipo de Embarcación</label>
                    <input type="text" value={project.vesselType || ""} onChange={(e) => handleBasicInfoChange("vesselType", e.target.value)} />
                  </div>
                  <div className="form-group-modern">
                    <label>Estado</label>
                    <select value={project.status || "active"} onChange={(e) => handleBasicInfoChange("status", e.target.value)}>
                      <option value="active">Activo</option>
                      <option value="draft">Borrador</option>
                      <option value="archived">Archivado</option>
                    </select>
                  </div>
                  <div className="form-group-modern full-width">
                    <label>Descripción General</label>
                    <textarea value={project.description || ""} onChange={(e) => handleBasicInfoChange("description", e.target.value)} rows="3" />
                  </div>
                </div>
              </div>
            </div>

            <div className="assets-grid-modern">
              <div className="premium-card asset-card">
                <div className="premium-card-header">
                  <h3>Portada</h3>
                  <span className="asset-subtitle">Imagen principal</span>
                </div>
                <div className="asset-body">
                  {project.thumbnail && project.thumbnail !== "/images/default_image.png" ? (
                    <div className="asset-preview">
                      <img src={project.thumbnail} alt="Portada" />
                      <button className="btn-asset-remove" onClick={handleRemoveThumbnail} title="Eliminar"><FaTrash /></button>
                    </div>
                  ) : (
                    <div className="asset-empty">Sin portada</div>
                  )}
                </div>
                <div className="asset-footer">
                  <label className="btn-upload-modern">
                    <FaUpload /> Subir portada
                    <input type="file" accept="image/*" onChange={handleThumbnailUpload} style={{ display: "none" }} />
                  </label>
                </div>
              </div>

              <div className="premium-card asset-card">
                <div className="premium-card-header">
                  <h3>Galería</h3>
                  <span className="asset-subtitle">{(project.gallery || []).length}/4 Imágenes</span>
                </div>
                <div className="asset-body gallery-body">
                  <div className="gallery-grid-modern">
                    {(project.gallery || []).map((img) => (
                      <div key={img.id} className="gallery-item-modern">
                        <img src={img.src} alt={img.title} />
                        <button className="btn-asset-remove" onClick={() => handleDeleteGalleryImage(img.id)}><FaTrash /></button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="asset-footer">
                  <label className={`btn-upload-modern ${(project.gallery || []).length >= 4 ? "disabled" : ""}`}>
                    <FaPlus /> Agregar foto
                    <input type="file" accept="image/*" onChange={handleGalleryUpload} disabled={(project.gallery || []).length >= 4} style={{ display: "none" }} />
                  </label>
                </div>
              </div>

              <div className="premium-card asset-card doc-card">
                <div className="premium-card-header">
                  <h3>Documentos</h3>
                  <span className="asset-subtitle">{(project.attachments || []).length} Archivos</span>
                </div>
                <div className="asset-body doc-body">
                  {(project.attachments || []).map((doc) => (
                    <div key={doc.id} className="doc-item-modern">
                      <FaFilePdf className="doc-icon" />
                      <div className="doc-info">
                        <input type="text" value={doc.title || ""} onChange={(e) => handleUpdateDocumentTitle(doc.id, e.target.value)} className="doc-input" />
                        <span className="doc-meta">{doc.format} • {doc.size}</span>
                      </div>
                      <button className="btn-doc-remove" onClick={() => handleDeleteDocument(doc.id)}><FaTrash /></button>
                    </div>
                  ))}
                </div>
                <div className="asset-footer">
                  <label className="btn-upload-modern">
                    <FaPlus /> Agregar doc
                    <input type="file" accept=".pdf,image/*" onChange={handleDocumentUpload} style={{ display: "none" }} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ZONAS Y ESCENAS TAB (Unified) */}
        {(activeTab === "scenes" || activeTab === "experiences") && (
          <div className="tab-pane-modern">
            <div className="pane-header">
              <div className="pane-title">
                <h2>Zonas y Escenas 360°</h2>
                <p>Agrupa tus escenas creando Zonas y subiendo múltiples fotos a la vez.</p>
              </div>
              <button className="btn-primary-modern" onClick={handleAddExperience}>
                <FaPlus /> Crear Nueva Zona
              </button>
            </div>

            {isUploadingMultiple && (
              <div style={{ padding: '1rem', background: '#dbeafe', color: '#1e3a8a', borderRadius: '8px', marginBottom: '1rem', fontWeight: 'bold' }}>
                Subiendo imágenes, por favor espera...
              </div>
            )}

            {/* Master-Detail Layout */}
            <div className="flex flex-col md:flex-row gap-6 mt-6 min-h-[600px]">
              
              {/* PANEL IZQUIERDO: Listado de Zonas */}
              <div className="w-full md:w-80 flex-shrink-0 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col shadow-sm" style={{ maxHeight: '800px' }}>
                {/* Header Buscador */}
                <div className="p-4 border-b border-slate-200 bg-white rounded-t-2xl">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar Zona..." 
                      className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                      value={zoneSearchQuery}
                      onChange={(e) => setZoneSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Lista de zonas */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 relative">
                  {selectedZonesToDelete.length > 0 && (
                    <div className="p-2 border-b border-slate-200 bg-red-50 flex justify-between items-center rounded-lg mb-2">
                      <span className="text-sm font-semibold text-red-600">{selectedZonesToDelete.length} seleccionadas</span>
                      <button 
                        onClick={() => handleBulkDeleteZones()}
                        className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                  {(project.experiences || []).filter(z => (z.name || "").toLowerCase().includes(zoneSearchQuery.toLowerCase())).map((zone, index) => {
                    const isActive = selectedZoneId === zone.id;
                    const scenesCount = (scenesByZone[zone.id] || []).length;
                    return (
                      <div 
                        key={zone.id} 
                        onClick={() => setSelectedZoneId(zone.id)}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                          isActive 
                            ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                            : "bg-white text-slate-700 border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <input 
                            type="checkbox" 
                            checked={selectedZonesToDelete.includes(zone.id)}
                            onChange={(e) => {
                               e.stopPropagation();
                               if (e.target.checked) setSelectedZonesToDelete([...selectedZonesToDelete, zone.id]);
                               else setSelectedZonesToDelete(selectedZonesToDelete.filter(id => id !== zone.id));
                            }}
                            className="w-4 h-4 cursor-pointer accent-red-600 rounded"
                          />
                          <FaShip className={`flex-shrink-0 ${isActive ? "text-blue-100" : "text-slate-400"}`} />
                          <span className="font-semibold text-sm truncate">{zone.name || "Zona sin nombre"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`text-xs font-bold px-2 py-1 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                            {scenesCount}
                          </div>
                          {isActive && (
                            <button 
                              className="text-white hover:text-red-200 p-1"
                              onClick={(e) => { e.stopPropagation(); handleDeleteExperience(index); }}
                              title="Eliminar Zona"
                            >
                              <FaTrash size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Opción para "Escenas sin Zona" */}
                  {unassignedScenes.length > 0 && (
                     <div 
                        onClick={() => setSelectedZoneId("unassigned")}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                          selectedZoneId === "unassigned" 
                            ? "bg-red-600 text-white border-red-600 shadow-md" 
                            : "bg-red-50 text-red-700 border-red-100 hover:border-red-300 hover:bg-red-100"
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <FaInfoCircle className={`flex-shrink-0 ${selectedZoneId === "unassigned" ? "text-red-100" : "text-red-400"}`} />
                          <span className="font-semibold text-sm truncate">Sin Zona Asignada</span>
                        </div>
                        <div className={`text-xs font-bold px-2 py-1 rounded-full ${selectedZoneId === "unassigned" ? "bg-white/20 text-white" : "bg-red-200 text-red-700"}`}>
                          {unassignedScenes.length}
                        </div>
                      </div>
                  )}
                </div>
              </div>

              {/* PANEL DERECHO: Escenas de la Zona */}
              <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm overflow-hidden" style={{ maxHeight: '800px' }}>
                {selectedZoneId ? (
                   <>
                     {/* Encabezado Panel Derecho */}
                     <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                       <div className="flex items-center gap-3">
                         {selectedZoneId === "unassigned" ? (
                           <>
                             <FaInfoCircle className="text-2xl text-red-500" />
                             <div>
                               <h3 className="text-xl font-bold text-slate-800 m-0">Escenas sin Zona (Anteriores)</h3>
                               <p className="text-sm text-slate-500 m-0 mt-1">Escenas no asignadas a ninguna zona específica.</p>
                             </div>
                           </>
                         ) : (
                           <>
                             <FaShip className="text-2xl text-blue-600" />
                             <div className="flex-1">
                               <input 
                                 type="text" 
                                 value={project.experiences?.find(z => z.id === selectedZoneId)?.name || ""} 
                                 onChange={(e) => {
                                   const idx = project.experiences.findIndex(z => z.id === selectedZoneId);
                                   if(idx !== -1) handleUpdateExperience(idx, "name", e.target.value);
                                 }}
                                 className="text-xl font-bold text-slate-800 bg-transparent border-none outline-none focus:ring-0 p-0 m-0 border-b border-dashed border-slate-300 focus:border-blue-500"
                                 placeholder="Nombre de la Zona"
                               />
                               <p className="text-sm text-slate-500 m-0 mt-1">
                                 Gestión de escenas de la zona seleccionada.
                               </p>
                             </div>
                           </>
                         )}
                       </div>
                       
                       <div className="flex items-center gap-3">
                         {/* Botón de Filtro Dropdown */}
                         <div className="relative">
                           <button 
                             onClick={() => setShowSceneFilterDropdown(!showSceneFilterDropdown)}
                             className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
                           >
                             Filtrar
                             <FaChevronUp className={`transition-transform ${showSceneFilterDropdown ? '' : 'rotate-180'}`} size={12} />
                           </button>
                           {showSceneFilterDropdown && (
                             <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
                               <div className="p-2 space-y-1">
                                 <label className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer m-0">
                                   <input type="radio" name="sceneFilter" checked={sceneFilter === "all"} onChange={() => { setSceneFilter("all"); setShowSceneFilterDropdown(false); }} className="text-blue-600" />
                                   <span className="text-sm text-slate-700">Todas las Escenas</span>
                                 </label>
                                 <label className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer m-0">
                                   <input type="radio" name="sceneFilter" checked={sceneFilter === "completed"} onChange={() => { setSceneFilter("completed"); setShowSceneFilterDropdown(false); }} className="text-blue-600" />
                                   <span className="text-sm text-slate-700">Completadas</span>
                                 </label>
                                 <label className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer m-0">
                                   <input type="radio" name="sceneFilter" checked={sceneFilter === "360"} onChange={() => { setSceneFilter("360"); setShowSceneFilterDropdown(false); }} className="text-blue-600" />
                                   <span className="text-sm text-slate-700">Vistas 360</span>
                                 </label>
                               </div>
                             </div>
                           )}
                         </div>

                         {/* Acción Principal */}
                         {selectedScenesToDelete.length > 0 ? (
                           <button 
                             onClick={() => handleBulkDeleteScenes()}
                             className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all shadow-sm cursor-pointer m-0"
                           >
                             <FaTrash /> Eliminar {selectedScenesToDelete.length}
                           </button>
                         ) : selectedZoneId === "unassigned" ? (
                           <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all shadow-sm" onClick={handleAddScene}>
                             <FaPlus /> Añadir escena
                           </button>
                         ) : (
                           <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm cursor-pointer m-0">
                             <FaUpload /> Subir escenas
                             <input 
                               type="file" 
                               accept="image/*" 
                               multiple
                               onChange={(e) => {
                                 const zName = project.experiences?.find(z => z.id === selectedZoneId)?.name || 'Zona';
                                 handleMultipleImagesUpload(selectedZoneId, zName, e);
                               }} 
                               style={{ display: "none" }} 
                             />
                           </label>
                         )}
                       </div>
                     </div>

                     {/* Grid de Escenas */}
                     <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                       {(() => {
                         let scenesToRender = selectedZoneId === "unassigned" ? unassignedScenes : (scenesByZone[selectedZoneId] || []);
                         
                         // Aplicar filtro
                         if (sceneFilter === "completed") {
                           scenesToRender = scenesToRender.filter(s => s.scene?.image); // Solo las que tienen imagen
                         } else if (sceneFilter === "360") {
                           scenesToRender = scenesToRender.filter(s => s.scene?.image); // (Mismo comportamiento temporal)
                         }

                         if (scenesToRender.length === 0) {
                           return (
                             <div className="h-full flex flex-col items-center justify-center text-slate-400">
                               <FaImage className="text-6xl text-slate-200 mb-4" />
                               <p className="text-lg font-medium text-slate-500">No hay escenas en esta zona.</p>
                               <p className="text-sm">Usa el botón superior para subir fotos panorámicas.</p>
                             </div>
                           );
                         }

                         return (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                             {scenesToRender.map(({sceneKey, scene}) => (
                               <div key={sceneKey} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col relative">
                                 {/* Checkbox for bulk delete */}
                                 <div className="absolute top-2 right-2 z-20">
                                   <input 
                                     type="checkbox"
                                     checked={selectedScenesToDelete.includes(sceneKey)}
                                     onChange={(e) => {
                                        if (e.target.checked) setSelectedScenesToDelete([...selectedScenesToDelete, sceneKey]);
                                        else setSelectedScenesToDelete(selectedScenesToDelete.filter(id => id !== sceneKey));
                                     }}
                                     className="w-5 h-5 cursor-pointer accent-red-600 drop-shadow-md rounded"
                                   />
                                 </div>
                                 {/* Miniatura */}
                                 <div className="relative aspect-video bg-slate-100 overflow-hidden">
                                   <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                                     360°
                                   </div>
                                   {scene.image ? (
                                     <img src={scene.image} alt={scene.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                   ) : (
                                     <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                       <FaImage size={24} className="mb-2 opacity-50" />
                                       <span className="text-xs font-medium">Sin imagen</span>
                                     </div>
                                   )}
                                   <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white cursor-pointer backdrop-blur-[2px]">
                                     <span className="flex items-center gap-2 font-semibold"><FaUpload /> Cambiar Fondo</span>
                                     <input type="file" accept="image/*" onChange={(e) => handleImageUpload(sceneKey, e)} style={{ display: "none" }} />
                                   </label>
                                 </div>
                                 
                                 {/* Contenido / Footer */}
                                 <div className="p-4 flex-1 flex flex-col gap-3">
                                   <div>
                                     <input 
                                       type="text" 
                                       value={scene.title || ""} 
                                       onChange={(e) => handleUpdateScene(sceneKey, "title", e.target.value)} 
                                       className="w-full text-sm font-semibold text-slate-800 border-none p-0 outline-none focus:ring-0 bg-transparent placeholder-slate-400 border-b border-transparent focus:border-blue-500 transition-colors"
                                       placeholder="Nombre de la Escena"
                                     />
                                   </div>
                                   
                                   {/* Select para mover de zona */}
                                   <div className="text-xs">
                                     <select 
                                       value={scene.zoneId || ""} 
                                       onChange={(e) => handleUpdateScene(sceneKey, "zoneId", e.target.value)}
                                       className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 outline-none focus:border-blue-500 transition-colors"
                                     >
                                       <option value="">(Sin Zona)</option>
                                       {(project.experiences || []).map(z => (
                                         <option key={z.id} value={z.id}>{z.name || z.id}</option>
                                       ))}
                                     </select>
                                   </div>

                                   {/* Acciones */}
                                   <div className="pt-3 mt-auto border-t border-slate-100 grid grid-cols-3 gap-2">
                                     <button className="flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => navigate(`/admin/edit/${projectId}/scene/${sceneKey}`)} title="Editar en Vista 360">
                                       <FaMousePointer size={14} />
                                       <span className="text-[10px] font-medium">Editor</span>
                                     </button>
                                     <button className="flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" onClick={() => setSelectedScene(sceneKey)} title="Configurar Hotspots">
                                       <FaMapMarkerAlt size={14} />
                                       <span className="text-[10px] font-medium">Hotspots</span>
                                     </button>
                                     <button className="flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" onClick={() => handleDeleteScene(sceneKey)} title="Eliminar Escena">
                                       <FaTrash size={14} />
                                       <span className="text-[10px] font-medium">Eliminar</span>
                                     </button>
                                   </div>
                                 </div>
                               </div>
                             ))}
                           </div>
                         );
                       })()}
                     </div>
                   </>
                ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 bg-slate-50/50">
                     <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center shadow-inner">
                       <FaShip className="text-3xl text-slate-300" />
                     </div>
                     <p className="text-lg font-medium text-slate-500">Selecciona una zona en el panel izquierdo</p>
                   </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* HOTSPOTS TAB */}
        {activeTab === "hotspots" && (
          <div className="tab-pane-modern">
            <div className="pane-header">
              <div className="pane-title">
                <h2>Gestión de Hotspots</h2>
                <p>Configura puntos de interacción en las escenas.</p>
              </div>
              <div className="header-filters">
                <select className="scene-filter-select" value={selectedScene || ""} onChange={(e) => setSelectedScene(e.target.value)}>
                  <option value="">Seleccionar escena...</option>
                  {Object.entries(project.scenes || {}).map(([key, sc]) => (
                    <option key={key} value={key}>{sc.title || key}</option>
                  ))}
                </select>
                <button className="btn-primary-modern" onClick={() => handleAddHotspot(selectedScene)} disabled={!selectedScene}>
                  <FaPlus /> Añadir Hotspot
                </button>
              </div>
            </div>

            {selectedScene && project.scenes?.[selectedScene] && (
              <div className="hotspots-grid-modern">
                {Object.entries(project.scenes[selectedScene].hotSpots || {}).map(([hotspotKey, hotspot]) => {
                  const isInfo = hotspot.cssClass === "infoHotspot";
                  const isElement = hotspot.cssClass === "hotSpotElement";
                  const isNav = hotspot.cssClass === "moveScene";
                  const attachments = Array.isArray(hotspot.attachments) ? hotspot.attachments : [];

                  return (
                    <div key={hotspotKey} className="hotspot-card-modern">
                      <div className="hotspot-card-header">
                        <div className="hotspot-type-badge">
                          {isNav ? "Navegación" : isInfo ? "Información" : "Elemento"}
                        </div>
                        <button className="btn-action-icon danger" onClick={() => handleDeleteHotspot(selectedScene, hotspotKey)}>
                          <FaTrash />
                        </button>
                      </div>
                      
                      <div className="hotspot-card-body">
                        <div className="form-group-modern compact full-width">
                          <label>Nombre / Etiqueta</label>
                          <input type="text" value={hotspot.label || hotspot.title || hotspotKey} onChange={(e) => handleUpdateHotspot(selectedScene, hotspotKey, "label", e.target.value)} />
                        </div>
                        
                        <div className="hotspot-row">
                          <div className="form-group-modern compact">
                            <label>Tipo</label>
                            <select
                              value={hotspot.cssClass || "moveScene"}
                              onChange={(e) => {
                                handleUpdateHotspot(selectedScene, hotspotKey, "cssClass", e.target.value);
                                handleUpdateHotspot(selectedScene, hotspotKey, "type", "custom");
                              }}
                            >
                              {hotspotTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                          </div>
                          <div className="form-group-modern compact coords">
                            <label>P/Y</label>
                            <div className="coords-inputs">
                              <input type="number" step="0.1" value={hotspot.pitch ?? 0} onChange={(e) => handleUpdateHotspot(selectedScene, hotspotKey, "pitch", parseFloat(e.target.value))} />
                              <input type="number" step="0.1" value={hotspot.yaw ?? 0} onChange={(e) => handleUpdateHotspot(selectedScene, hotspotKey, "yaw", parseFloat(e.target.value))} />
                            </div>
                          </div>
                        </div>

                        {/* TYPE SPECIFIC FIELDS */}
                        {isNav && (
                          <div className="form-group-modern compact full-width">
                            <label>Escena Destino</label>
                            <select value={hotspot.scene || ""} onChange={(e) => handleUpdateHotspot(selectedScene, hotspotKey, "scene", e.target.value)}>
                              <option value="">Seleccionar...</option>
                              {Object.keys(project.scenes || {}).map((key) => (
                                <option key={key} value={key}>{project.scenes[key].title || key}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        {isInfo && (
                          <div className="form-group-modern compact full-width">
                            <label>Descripción</label>
                            <textarea rows="2" value={hotspot.description || ""} onChange={(e) => handleUpdateHotspot(selectedScene, hotspotKey, "description", e.target.value)} />
                          </div>
                        )}

                        {isElement && (
                          <div className="hotspot-attachments-modern">
                            <label className="btn-upload-small">
                              <FaPaperclip /> Adjuntar
                              <input type="file" accept="image/*,application/pdf,video/*" onChange={(e) => handleHotspotAttachmentUpload(selectedScene, hotspotKey, e)} style={{ display: "none" }} />
                            </label>
                            <span className="attachment-count">{attachments.length} archivos</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MAP TAB */}
        {activeTab === "map" && (
          <div className="tab-pane-modern">
            <div className="map-workspace-modern">
              <div className="map-sidebar-modern">
                <div className="sidebar-section">
                  <h3>Configuración de Zona</h3>
                  <div className="form-group-modern compact full-width">
                    <label>Seleccionar Zona</label>
                    <select
                      value={mapZoneId}
                      onChange={(e) => {
                        setMapZoneId(e.target.value);
                        setMapPlacingMode(false);
                        setMapSelectedSceneKey("");
                      }}
                    >
                      <option value="">Selecciona una zona...</option>
                      {(project.experiences || []).map((z) => (
                        <option key={z.id} value={z.id}>{z.name || z.id}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="sidebar-actions">
                    <label className={`btn-sidebar-action ${!mapZoneId ? "disabled" : ""}`}>
                      <FaUpload /> {mapZoneId && getMapForZone(mapZoneId) ? "Cambiar Plano" : "Subir Plano"}
                      <input type="file" accept="image/*" onChange={(e) => mapZoneId && handleMapUploadForZone(mapZoneId, e)} disabled={!mapZoneId} style={{ display: "none" }} />
                    </label>
                    <button className="btn-sidebar-action danger" disabled={!mapZoneId || !getMapForZone(mapZoneId)} onClick={() => mapZoneId && handleRemoveMapForZone(mapZoneId)}>
                      <FaTrash /> Quitar Plano
                    </button>
                  </div>
                </div>

                <div className="sidebar-section">
                  <h3>Ubicación de Escenas</h3>
                  <div className="form-group-modern compact full-width">
                    <label>Seleccionar Escena</label>
                    <select value={mapSelectedSceneKey} onChange={(e) => setMapSelectedSceneKey(e.target.value)}>
                      <option value="">Selecciona una escena...</option>
                      {Object.entries(project.scenes || {}).map(([sceneKey, sc]) => {
                        const placed = mapZoneId ? isScenePlacedOnZone(sceneKey, mapZoneId) : false;
                        return (
                          <option key={sceneKey} value={sceneKey}>{sc.title || sceneKey} {placed ? "✓" : ""}</option>
                        );
                      })}
                    </select>
                  </div>
                  
                  <div className="sidebar-actions">
                    {!mapPlacingMode ? (
                      <button className="btn-sidebar-action primary" onClick={handleStartPlacing}>
                        <FaMapMarkerAlt /> Ubicar en Plano
                      </button>
                    ) : (
                      <button className="btn-sidebar-action warning" onClick={handleStopPlacing}>
                        <FaTimes /> Cancelar
                      </button>
                    )}
                    {mapSelectedSceneKey && (
                      <button className="btn-sidebar-action" onClick={() => { handleClearSceneMap(mapSelectedSceneKey); setMapPlacingMode(false); }}>
                        Quitar Pin
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="map-canvas-container-modern">
                {!mapZoneId ? (
                  <div className="map-empty-state">
                    <FaMapMarkerAlt />
                    <p>Selecciona una zona para configurar su plano.</p>
                  </div>
                ) : !getMapForZone(mapZoneId) ? (
                  <div className="map-empty-state">
                    <FaImage />
                    <p>Sube el plano base para esta zona.</p>
                  </div>
                ) : (
                  <div className="map-viewer-modern" ref={mapPlanContainerRef} onClick={handlePlanClickPlaceScene}>
                    <div className="map-controls-modern">
                      <button>+</button><button>-</button><button>⟳</button>
                    </div>
                    <div className="map-image-wrapper-modern">
                      <img 
                        ref={mapImageRef} 
                        src={getMapForZone(mapZoneId)} 
                        alt="Plano" 
                        draggable={false} 
                        onLoad={() => requestAnimationFrame(updateMapImageRect)} 
                      />
                      {scenesForZone.map(([sceneKey, sc]) => {
                        const m = sc?.map;
                        if (!m || m.top === "" || m.left === undefined) return null;
                        const isSelected = mapSelectedSceneKey === sceneKey;
                        
                        const leftPx = mapImageRect.left + (Number(m.top) / 100) * mapImageRect.width;
                        const topPx = mapImageRect.top + ((100 - Number(m.left)) / 100) * mapImageRect.height;

                        return (
                          <div
                            key={sceneKey}
                            className={`map-pin-modern ${isSelected ? 'active' : ''}`}
                            style={{ top: `${topPx}px`, left: `${leftPx}px` }}
                            onClick={(ev) => { ev.stopPropagation(); setMapSelectedSceneKey(sceneKey); setMapPlacingMode(false); }}
                            title={sc.title}
                          >
                            <div className="pin-dot"></div>
                            <div className="pin-label">{sc.title || sceneKey}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreateZoneModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear Nueva Zona</h2>
            </div>
            <div className="modal-body">
              <div className="form-group-modern">
                <label>Nombre de la Zona</label>
                <input
                  type="text"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="Ej. Cuarto de Máquinas"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  autoFocus
                />
              </div>
              <div className="form-group-modern" style={{ marginTop: '1rem' }}>
                <label>Subir Escenas (Opcional)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setNewZoneFiles(Array.from(e.target.files))}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px dashed #ccc', background: '#f8fafc' }}
                />
                {newZoneFiles.length > 0 && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#16a34a' }}>
                    {newZoneFiles.length} imagen(es) seleccionada(s)
                  </p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={() => { setShowCreateZoneModal(false); setNewZoneName(""); setNewZoneFiles([]); }}>
                Cancelar
              </button>
              <button className="modal-btn confirm success" onClick={handleCreateZoneSubmit}>
                Crear y Subir
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={modal.isOpen}
        onClose={() => setModal((m) => ({ ...m, isOpen: false }))}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        requiresConfirmation={modal.requiresConfirmation}
        confirmationText={modal.confirmationText}
        showCancelButton={modal.showCancelButton !== false}
      />
    </div>
  );
};

export default ProjectEditor;
