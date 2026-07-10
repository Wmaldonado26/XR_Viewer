import { useEffect } from "react";

export const useMapEditor = ({
  project,
  setProject,
  setHasChanges,
  mapZoneId,
  setMapZoneId,
  mapSelectedSceneKey,
  setMapSelectedSceneKey,
  mapPlacingMode,
  setMapPlacingMode,
  setMapImageRect,
  mapPlanContainerRef,
  mapImageRef,
  uploadImageToBackend,
  showError,
  showInfo,
}) => {
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
    const img = imgElementRef();
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

  const imgElementRef = () => {
    return mapImageRef.current || (mapPlanContainerRef.current && mapPlanContainerRef.current.querySelector('.pe-map-image'));
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
    const imgElement = imgElementRef();
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
    
    // La imagen está rotada 270° horario (o -90°), así que:
    // - imgRect.width = altura original (después de rotar)
    // - imgRect.height = ancho original (después de rotar)
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

  return {
    getZoneLabel,
    getMapForZone,
    isScenePlacedOnZone,
    handleMapUploadForZone,
    handleRemoveMapForZone,
    handleUpdateSceneMap,
    handleClearSceneMap,
    handleStartPlacing,
    handleStopPlacing,
    updateMapImageRect,
    handlePlanClickPlaceScene,
  };
};
