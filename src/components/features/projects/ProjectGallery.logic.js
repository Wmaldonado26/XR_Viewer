import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import projectService from '../../../services/ProjectService';
import authService from '../../../services/AuthService';

export default function useProjectGalleryLogic() {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const filterStatus = 'all';
  const [currentUserState, setCurrentUserState] = useState(() => authService.getCurrentUser());

  const [showSidebar, setShowSidebar] = useState(false);
  const sidebarRef = useRef(null);

  const currentUser = useMemo(() => currentUserState || authService.getCurrentUser(), [currentUserState]);

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

  useEffect(() => {
    const loadProjects = async () => {
      const allProjects = isAuthenticated 
        ? await projectService.getAllProjects() 
        : await projectService.getPublicProjects();
      setProjects(allProjects);
      setFilteredProjects(allProjects);
    };
    loadProjects();
  }, [isAuthenticated]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) return;
    setCurrentUserState(user);
  }, []);

  useEffect(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.vesselType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    setFilteredProjects(filtered);
  }, [searchTerm, filterStatus, projects]);

  const handleProjectClick = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    let firstSceneId = null;
    
    if (project) {
      if (project.experiences && project.experiences.length > 0) {
        firstSceneId = project.experiences[0].startScene || project.experiences[0].id;
      } else if (project.scenes && Object.keys(project.scenes).length > 0) {
        firstSceneId = Object.keys(project.scenes)[0];
      }
    }
    
    if (firstSceneId) {
      navigate(`/project/${projectId}/experience/${firstSceneId}`);
    } else {
      navigate(`/project/${projectId}`);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handlePagesInformationClick = (projectId) => {
    navigate(`/project/${projectId}/details`);
  };

  const handleSidebarNav = (target, requireAdmin = false) => {
    if (requireAdmin && !(currentUser?.role === 'admin')) {
      setShowSidebar(false);
      return;
    }
    if (target) {
      navigate(target);
    }
    setShowSidebar(false);
  };

  const headerTitle = currentUser?.role === 'user' ? 'Galería de Proyectos' : 'Galería de Proyectos';

  const handleImgError = (e, fallback) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = fallback;
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return {
    navigate,
    isAuthenticated,
    projects,
    filteredProjects,
    searchTerm,
    setSearchTerm,
    currentUser,
    showSidebar,
    setShowSidebar,
    sidebarRef,
    headerTitle,
    handleProjectClick,
    handleLogout,
    handlePagesInformationClick,
    handleSidebarNav,
    handleImgError,
    truncateText,
  };
}
