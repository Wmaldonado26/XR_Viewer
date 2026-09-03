import projectService from "../../../../services/ProjectService";
import { useState } from "react";

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
  const [isDeletingZone, setIsDeletingZone] = useState(false);

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
      title: "¿Eliminar zona de forma segura?",
      message: `Vas a eliminar permanentemente "${expName}" y TODAS SUS ESCENAS EXCLUSIVAS (incluyendo imágenes en la nube). Esta acción limpiará todo su rastro y no se puede deshacer.`,
      onConfirm: async () => {
        const zoneIdToDelete = project.experiences?.[index]?.id;
        
        if (!zoneIdToDelete) {
          setModal((m) => ({ ...m, isOpen: false }));
          return;
        }

        if (!project?.id) {
          alert("Error: No hay ID de proyecto");
          return;
        }

        setIsDeletingZone(true);
        setModal((m) => ({ 
          ...m, 
          message: "Eliminando zona y limpiando Cloudinary. Por favor espera...", 
          showCancelButton: false, 
          confirmText: "Procesando..." 
        }));

        const result = await projectService.deleteZoneCascade(project.id, zoneIdToDelete);
        
        if (result.success) {
          // Refetch fresh project state to guarantee consistency
          const updatedProject = await projectService.getProjectById(project.id);
          
          if (updatedProject) {
            setProject(updatedProject);
          }

          // reset UI si estaba en esa zona
          if (mapZoneId === zoneIdToDelete) {
            setMapZoneId("");
            setMapSelectedSceneKey("");
            setMapPlacingMode(false);
          }

          setHasChanges(false); // Refetched project is in sync with DB
        } else {
          alert(`Error al eliminar la zona: ${result.error}`);
        }

        setIsDeletingZone(false);
        setModal((m) => ({ ...m, isOpen: false }));
      },
      showCancelButton: true,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
    });
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

  return {
    handleAddExperience,
    handleUpdateExperience,
    handleDeleteExperience,
    handleReorderExperiences,
    isDeletingZone,
  };
};
