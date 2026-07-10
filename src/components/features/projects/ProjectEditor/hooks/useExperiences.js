export const useExperiences = ({
  project,
  setProject,
  setModal,
  setHasChanges,
  mapZoneId,
  setMapZoneId,
  setMapSelectedSceneKey,
  setMapPlacingMode,
}) => {
  const handleAddExperience = () => {
    const newExp = {
      id: `zone_${Date.now()}`,
      name: "Nueva Zona",
      icon: "FaShip",
      startScene: "",
      description: "",
    };

    setProject((prev) => ({
      ...prev,
      experiences: [...(prev.experiences || []), newExp],
    }));
    setHasChanges(true);
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

  return {
    handleAddExperience,
    handleUpdateExperience,
    handleDeleteExperience,
  };
};
