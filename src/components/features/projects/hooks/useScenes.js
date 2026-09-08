export const useScenes = ({
  project,
  setProject,
  setModal,
  setHasChanges,
  uploadImageToBackend,
  showError,
}) => {
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

  return {
    handleAddScene,
    handleUpdateScene,
    handleDeleteScene,
    handleImageUpload,
  };
};
