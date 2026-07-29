import { useEffect, useMemo, useState } from "react";
import projectService from "../../../../api/services/projectService";
import authService from "../../../../api/services/authService";
import { useNavigate } from "react-router-dom";

export const useExperienceSelectorLogic = ({
  onExperienceSelect,
  onViewDetails,
  onBackToManager,
  onAccessAdmin,
  onLogout,
  darkMode,
  onToggleDarkMode
}) => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [project, setProject] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 6;

  useEffect(() => {
    (async () => {
      const active = await projectService.getActiveProject();
      console.log("INFO DE ESCENAS EN EL PROYECTO...", active);
      setProject(active);
    })();
    projectService.getAllProjects().then(setAllProjects).catch(console.error);
  }, []);

  const experiences = useMemo(() => {
    if (!project) return [];

    if (Array.isArray(project.experiences) && project.experiences.length > 0) {
      return project.experiences.map((exp) => ({
        id: exp.id,
        title: exp.name,
        description: exp.description || "",
        iconName: exp.icon || "FaMapMarkerAlt",
        startScene: exp.startScene || "",
        image: exp.image || "",
      }));
    }

    const sceneEntries = Object.entries(project.scenes || {});
    return sceneEntries.map(([sceneKey, scene]) => ({
      id: sceneKey,
      title: scene.title || sceneKey,
      description: "Escena 360°",
      iconName: "FaMapMarkerAlt",
      startScene: sceneKey,
      image: scene.image || "",
    }));
  }, [project]);

  const handleClick = (exp) => {
    const target = exp.startScene || exp.id;
    localStorage.setItem("lastSceneKey", target);
    onExperienceSelect(target);
  };

  const filteredExperiences = useMemo(() => {
    if (!searchQuery.trim()) return experiences;
    return experiences.filter(exp => 
      exp.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [experiences, searchQuery]);

  const paginatedExperiences = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredExperiences.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredExperiences, currentPage]);

  const totalPages = Math.ceil(filteredExperiences.length / itemsPerPage);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return {
    navigate,
    currentUser,
    project,
    allProjects,
    showSidebar, setShowSidebar,
    currentPage, setCurrentPage,
    searchQuery, setSearchQuery,
    experiences,
    filteredExperiences,
    paginatedExperiences,
    totalPages,
    handleClick,
    onBackToManager
  };
};
