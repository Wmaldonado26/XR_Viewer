export const useHotspots = ({
  project,
  setProject,
  setModal,
  setHasChanges,
  uploadImageToBackend,
  showError,
}) => {
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

  return {
    handleAddHotspot,
    handleUpdateHotspot,
    handleDeleteHotspot,
    handleHotspotAttachmentUpload,
    handleRemoveHotspotAttachment,
    handleUpdateHotspotAttachmentFolder,
  };
};
