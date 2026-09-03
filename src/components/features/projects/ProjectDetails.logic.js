import { useEffect, useState, useMemo } from "react";
import projectService from "../../../services/ProjectService";
import authService from "../../../services/AuthService";
import { useNavigate, useParams } from "react-router-dom";

export default function useProjectDetailsLogic({ onBack, onLogout, darkMode, onToggleDarkMode }) {
  const [project, setProject] = useState(null);
  const navigate = useNavigate();
  const { projectId } = useParams();

  const handleBack = () => {
    const user = authService.getCurrentUser();
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else if (user?.role === 'admin' || user?.role === 'project_admin') {
      navigate('/admin');
    } else {
      navigate('/gallery');
    }
  };

  useEffect(() => {
    (async () => {
      if (projectId) {
        const proj = await projectService.getProjectById(projectId);
        setProject(proj);
      } else {
        const active = await projectService.getActiveProject();
        setProject(active);
      }
    })();
  }, [projectId]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const galleryImages = useMemo(() => {
    const images = [];
    if (project?.thumbnail) images.push(project.thumbnail);
    if (Array.isArray(project?.gallery)) {
      images.push(...project.gallery.map(img => typeof img === 'string' ? img : img.src || img.url || ''));
    }
    return images;
  }, [project]);

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

  const dynamicNavbarTitle = {
    projectName: project?.name || "",
  };

  const dynamicNavbarSubtitle = project?.vesselType || "Project Details";

  const fileIsPdf = (url) => url && url.toLowerCase().endsWith('.pdf');

  return {
    navigate,
    project,
    projectId,
    activeImageIndex,
    setActiveImageIndex,
    galleryImages,
    handlePrevImage,
    handleNextImage,
    handleBack,
    dynamicNavbarTitle,
    dynamicNavbarSubtitle,
    fileIsPdf,
  };
}
