import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import projectService from "../../../../services/ProjectService";
import authService from "../../../../services/AuthService";

export const useProjectManagerLogic = ({
  onSelectProject,
  onCreateNew,
  onViewDetails,
  onManageUsers,
  onLogout,
  darkMode,
  onToggleDarkMode,
}) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [stats, setStats] = useState({});
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const sidebarRef = useRef(null);
  const currentUser = authService.getCurrentUser();

  const [modal, setModal] = useState({
    isOpen: false,
    type: "confirm",
    title: "",
    message: "",
    onConfirm: null,
    requiresConfirmation: false,
    confirmationText: "",
    projectToDelete: null,
  });

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    const handleSidebarClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        const hamburgerBtn = document.querySelector(".hamburger-btn");
        if (!hamburgerBtn || !hamburgerBtn.contains(event.target)) {
          setShowSidebar(false);
        }
      }
    };
    if (showSidebar) {
      document.addEventListener("mousedown", handleSidebarClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleSidebarClickOutside);
  }, [showSidebar]);

  const loadProjects = async () => {
    const allProjects = await projectService.getAllProjects();
    setProjects(allProjects);

    const active = await projectService.getActiveProject();
    setActiveProjectId(active?.id);

    const globalStats = await projectService.getGlobalStats();
    setStats(globalStats);
  };

  const handleEditProject = (projectId) => {
    navigate(`/admin/edit/${projectId}`);
  };

  const handleSelectProject = (project) => {
    projectService.setActiveProject(project);
    onSelectProject(project);
  };

  const handleDeleteProject = (projectId) => {
    const projectToDelete = projects.find((p) => p.id === projectId);
    if (!projectToDelete) return;

    setModal({
      isOpen: true,
      type: "delete",
      title: "¿Eliminar Proyecto Permanentemente?",
      message: `Estás a punto de eliminar el proyecto "${projectToDelete.name}". Esta acción es irreversible y se perderán todas las escenas, hotspots y configuraciones asociadas.`,
      onConfirm: async () => {
        const result = await projectService.deleteProject(projectId);
        if (result.success) {
          await loadProjects();
          setModal({
            isOpen: true,
            type: "alert",
            title: "Proyecto Eliminado",
            message: "El proyecto ha sido eliminado exitosamente.",
            onConfirm: () => setModal((m) => ({ ...m, isOpen: false })),
            showCancelButton: false,
            confirmText: "Aceptar",
          });
        } else {
          setModal({
            isOpen: true,
            type: "danger",
            title: "Error al Eliminar",
            message: `No se pudo eliminar el proyecto: ${result.error}`,
            onConfirm: () => setModal((m) => ({ ...m, isOpen: false })),
            showCancelButton: false,
            confirmText: "Aceptar",
          });
        }
      },
      requiresConfirmation: true,
      confirmationText: "ELIMINAR",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      projectToDelete: projectId,
    });
  };

  const handleDuplicateProject = async (projectId) => {
    const result = await projectService.duplicateProject(projectId);
    if (result.success) await loadProjects();
  };

  const handleExportProject = async (projectId) => {
    await projectService.exportProject(projectId);
  };

  const handleImportProject = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = e.target.result;
        const result = await projectService.importProject(jsonData);
        if (result.success) {
          await loadProjects();
          setModal({
            isOpen: true,
            type: "alert",
            title: "Proyecto Importado",
            message: "El proyecto se ha importado exitosamente.",
            onConfirm: () => setModal((m) => ({ ...m, isOpen: false })),
            showCancelButton: false,
            confirmText: "Aceptar",
          });
        } else {
          setModal({
            isOpen: true,
            type: "danger",
            title: "Error al Importar",
            message: `No se pudo importar el proyecto: ${result.error}`,
            onConfirm: () => setModal((m) => ({ ...m, isOpen: false })),
            showCancelButton: false,
            confirmText: "Aceptar",
          });
        }
      } catch (error) {
        setModal({
          isOpen: true,
          type: "danger",
          title: "Error al Leer Archivo",
          message: "El archivo seleccionado no es válido o está dañado.",
          onConfirm: () => setModal((m) => ({ ...m, isOpen: false })),
          showCancelButton: false,
          confirmText: "Aceptar",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleViewDetails = (project) => {
    projectService.setActiveProject(project.id);
    if (onViewDetails) {
      onViewDetails();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { label: "Activo", color: "success" },
      draft: { label: "Borrador", color: "warning" },
      archived: { label: "Archivado", color: "secondary" },
    };
    return badges[status] || badges.draft;
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.vesselType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    navigate,
    projects,
    activeProjectId,
    stats,
    showSidebar, setShowSidebar,
    searchTerm, setSearchTerm,
    sidebarRef,
    currentUser,
    modal, setModal,
    handleEditProject,
    handleSelectProject,
    handleDeleteProject,
    handleDuplicateProject,
    handleExportProject,
    handleImportProject,
    handleViewDetails,
    formatDate,
    getStatusBadge,
    filteredProjects,
    onCreateNew,
    onViewDetails
  };
};
