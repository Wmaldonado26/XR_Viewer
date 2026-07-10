import React, { useEffect, useMemo, useState } from "react";
import "./ExperienceSelector.css";
import "../projects/ProjectManager.css";
import cotecmarLogo from "../../../assets/images/logo.png";
import { FaMapMarkerAlt, FaInfoCircle, FaImage, FaList, FaThLarge, FaSearch, FaFilter, FaArrowRight, FaShip, FaSignOutAlt, FaUserShield, FaChevronRight, FaPlay, FaBars, FaTimes, FaCog, FaLock, FaUsers, FaShieldAlt, FaKey, FaChevronDown, FaUserCircle, FaMoon, FaSun, FaImages, FaArrowLeft, FaAnchor, FaWater, FaLayerGroup, FaFolderOpen } from "react-icons/fa";
import DynamicNavbar from "../../layout/Navbar/DynamicNavbar";
import DynamicBreadcrumbs from "../../ui/DynamicBreadcrumbs/DynamicBreadcrumbs";
import projectService from "../../../api/services/projectService";
import authService from "../../../api/services/authService";
import { useNavigate } from "react-router-dom";
import PasswordSettings from "../auth/PasswordSettings";
import SceneCalibrationTool from "../experiences/SceneCalibrationTool";

const ICONS = { FaShip, FaCog, FaAnchor, FaWater, FaImage, FaMapMarkerAlt };

const ExperienceSelector = ({ onExperienceSelect, onViewDetails, onBackToManager, onAccessAdmin, onLogout, darkMode, onToggleDarkMode }) => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();


  const [project, setProject] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);

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


  return (
    <>
      <div 
        className={`sidebar-overlay ${showSidebar ? "active" : ""}`} 
        onClick={() => setShowSidebar(false)}
      ></div>
      <div className={`sidebar-menu ${showSidebar ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand-title">
            <img src={cotecmarLogo} alt="COTECMAR" className="sidebar-logo" />
            <span>Navegación</span>
          </div>
          <button 
            className="sidebar-close-btn" 
            onClick={() => setShowSidebar(false)} 
            title="Cerrar Menú"
          >
            <FaTimes />
          </button>
        </div>
        <nav className="sidebar-nav">
          <button 
            className="sidebar-item"
            onClick={() => {
              navigate("/admin");
              setShowSidebar(false);
            }}
          >
            <FaFolderOpen className="sidebar-icon" />
            <span>Mis Proyectos</span>
          </button>
          
          <button 
            className="sidebar-item" 
            style={{ display: currentUser?.role === 'admin' ? 'flex' : 'none' }}
            onClick={() => {
              navigate("/admin/users");
              setShowSidebar(false);
            }}
          >
            <FaUsers className="sidebar-icon" />
            <span>Gestión de Usuarios</span>
          </button>
          
          <button 
            className="sidebar-item" 
            style={{ display: currentUser?.role === 'admin' ? 'flex' : 'none' }}
            onClick={() => {
              navigate("/admin/permissions");
              setShowSidebar(false);
            }}
          >
            <FaLock className="sidebar-icon" />
            <span>Permisos y Roles</span>
          </button>

          <button 
            className="sidebar-item" 
            style={{ display: currentUser?.role === 'admin' ? 'flex' : 'none' }}
            onClick={() => {
              navigate("/admin/landing");
              setShowSidebar(false);
            }}
          >
            <FaLayerGroup className="sidebar-icon" />
            <span>Tarjetas Landing</span>
          </button>
          
          <button 
            className="sidebar-item"
            onClick={() => {
              navigate("/gallery");
              setShowSidebar(false);
            }}
          >
            <FaImages className="sidebar-icon" />
            <span>Galería de Proyecto</span>
          </button>
        </nav>
      </div>

      <DynamicNavbar
        showBackButton={false}
        title={null}
        subtitle={null}
        middleContent={
          <DynamicBreadcrumbs
            customMappings={{
              project: "Proyectos",
              [project?.id]: project?.name || "Proyecto",
              admin: "Gestión de Proyecto"
            }}
            customLinks={{
              project: "/admin"
            }} 
            customDropdowns={{
              project: allProjects.map(p => ({
                id: p.id,
                label: p.name,
                sublabel: p.vesselType || 'Visualización 360°',
                image: p.thumbnail || p.image || '/images/default_image.png',
                onClick: () => {
                  window.location.href = `/project/${p.id}`;
                }
              }))
            }}
          />
        }
        leftActions={
          <button 
            className="hamburger-btn" 
            onClick={() => setShowSidebar(!showSidebar)}
            title="Abrir Menú"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'inherit', fontSize: '20px', cursor: 'pointer', padding: '8px', marginRight: '8px' }}
          >
            <FaBars />
          </button>
        }
      />

      <div className="experience-selector experience-selector-container">
        <div style={{ width: '100%', marginBottom: '24px', marginTop: '24px', display: 'flex', justifyContent: 'flex-start' }}>
          <button 
            onClick={onBackToManager ? onBackToManager : () => navigate(-1)} 
            style={{ padding: '10px 20px', borderRadius: '10px', background: '#ffffff', color: '#334155', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
          >
            <FaArrowLeft /> Volver
          </button>
        </div>

      {/* Hero Card Container */}
      <div className="experience-hero-card">
        <div className="hero-image-container">
          {project?.thumbnail || project?.image ? (
            <img 
              src={project.thumbnail || project.image} 
              alt={project.name} 
              className="hero-project-image"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/default_image.png"; }} 
            />
          ) : (
            <div className="hero-logo-fallback">
              <FaImage size={64} color="#cbd5e1" />
            </div>
          )}
        </div>
        <div className="hero-title-container">
          <h1>{project?.name || "PROYECTO"}</h1>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="experience-content-section">
        
        {/* Toolbar */}
        <div className="experience-toolbar">
          <h2 className="section-title">Zonas disponibles</h2>
          
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Buscar zonas..." className="search-input" />
          </div>

          <div className="view-toggle-container">
            <div className="toggle-wrapper">
              <button className="view-toggle-btn active" title="Vista cuadrícula">
                <FaThLarge />
              </button>
              <button className="view-toggle-btn" title="Vista lista">
                <FaList />
              </button>
            </div>
          </div>
        </div>

        {/* Zones Grid */}
        <div className="experience-grid">
          {experiences.map((exp) => {
            const IconComponent = ICONS[exp.iconName] || FaMapMarkerAlt;

            return (
              <div key={exp.id} className="experience-card" onClick={() => handleClick(exp)}>
                <div className="experience-content">
                  <div className="experience-icon">
                    <IconComponent />
                  </div>
                  <h3>{exp.title}</h3>
                </div>
              </div>
            );
          })}

          {project && experiences.length === 0 && (
            <div className="empty-state">
              <p>Este proyecto no tiene zonas ni escenas configuradas.</p>
            </div>
          )}
        </div>

      </div>
      </div>
    </>
  );
};

export default ExperienceSelector;
