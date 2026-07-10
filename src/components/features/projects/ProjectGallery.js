import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaFilter, FaThLarge, FaList, FaSignOutAlt, FaEye, FaLock, FaLayerGroup, FaBars, FaTimes, FaCog, FaUsers, FaShieldAlt, FaUserCircle, FaChevronDown, FaImages, FaTrash, FaCogs, FaArrowRight, FaEnvelope, FaPhone, FaUserEdit, FaKey, FaFolderOpen } from 'react-icons/fa';
import projectService from '../../../api/services/projectService';
import authService from '../../../api/services/authService';
import DynamicNavbar from '../../layout/Navbar/DynamicNavbar';
import cotecmarLogo from '../../../assets/images/logo.png';
import fallbackProjectImage from '../../../assets/images/360.png';
import './ProjectGallery.css';

const ProjectGallery = () => {
  const navigate = useNavigate();
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
      const allProjects = await projectService.getAllProjects();
      setProjects(allProjects);
      setFilteredProjects(allProjects);
    };
    loadProjects();
  }, []);

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
    navigate(`/project/${projectId}`);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handlePagesInformationClick = (projectId) => {
    navigate(`/project/${projectId}/details`);
  };



  const headerTitle = currentUser?.role === 'user' ? 'Galería de Proyectos' : 'Galería de Proyectos';

  return (
    <div className="project-gallery">
     
      <div 
        className={`sidebar-overlay ${showSidebar ? "active" : ""}`} 
        onClick={() => setShowSidebar(false)}
      ></div>
      <div className={`sidebar-menu ${showSidebar ? "open" : ""}`} ref={sidebarRef}>
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
            className={`sidebar-item ${(currentUser?.role === 'admin' || currentUser?.role === 'project_admin') ? '' : 'active'}`}
            onClick={() => {
              if (currentUser?.role === 'admin' || currentUser?.role === 'project_admin') {
                navigate("/admin");
              }
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
            <FaShieldAlt className="sidebar-icon" />
            <span>Gestión de Permisos</span>
          </button>
          
          <button 
            className={`sidebar-item ${(currentUser?.role === 'admin' || currentUser?.role === 'project_admin') ? 'active' : ''}`}
            onClick={() => setShowSidebar(false)}
          >
            <FaImages className="sidebar-icon" />
            <span>Galería de Proyecto</span>
          </button>
        </nav>
      </div>

      <DynamicNavbar
        showBackButton={false}
        title="Galería de Proyectos"
        subtitle="Explora y administra los barcos disponibles en la plataforma."
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

      <div style={{ width: '100%', padding: '0 40px', marginTop: '-12px', display: 'flex', justifyContent: 'flex-start' }}>
        {(currentUser?.role === 'admin' || currentUser?.role === 'project_admin') && (
          <button 
            onClick={() => navigate('/admin')} 
            style={{ padding: '10px 20px', borderRadius: '10px', background: '#ffffff', color: '# 334155', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
          >
            <FaArrowLeft /> Volver
          </button>
        )}
      </div>

      <div className="gallery-header-bottom" style={{ 
        maxWidth: '1400px', 
        margin: '0 auto 48px auto', 
        padding: '0 40px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <div className="gallery-controls-copy" style={{ flex: 1, textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{headerTitle}</h2>
            <p style={{ marginTop: '8px', opacity: 0.8 }}>
              {currentUser?.role === 'user'
                ? ''
                : 'Explora y administra los barcos disponibles en la plataforma.'}
            </p>
          </div>
        </div>
        
        <div className="search-container" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div className="search-box" style={{ width: '100%', maxWidth: '500px' }}>
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div style={{ flex: 1 }}></div>
      </div>

      <div className="projects-grid">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <div 
              key={project.id} 
              className="project-card"
            >
              <div className="card-image">
                <img 
                  src={project.thumbnail || fallbackProjectImage} 
                  alt={project.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = fallbackProjectImage;
                  }}
                />
                <div className="card-overlay"
                  onClick={() => handleProjectClick(project.id)}
                
                >
                 {/* <FaSyncAlt className='view-icon'/>  */}
                 
                
                  <span>Recorrido 360°</span>
                </div>
              </div>
              
              <div className="card-content">
                <h3>{project.name}</h3>
                <p className="vessel-type">{project.vesselType}</p>
                <p className="description">
                  {project.description?.substring(0, 100)}
                  {project.description?.length > 100 ? '...' : ''}
                </p>
                
                <div className="card-footer">
                  {/* <div className="card-stats">
                    <span className="stat">
                      <FaEye /> {project.experiences?.length || 0} zonas
                    </span>
                    <span className="stat">
                      {Object.keys(project.scenes || {}).length} escenas
                    </span>
                  </div> */}
                  <button
                  className="btn-view"
                  onClick={() => handlePagesInformationClick(project.id)}
                   >
                    Mas Información <FaArrowRight />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <FaSearch className="no-results-icon" />
            <h3>No se encontraron proyectos</h3>
            <p>Intenta con otros términos de búsqueda</p>
          </div>
        )}
      </div>

      <footer className="gallery-footer">
        <p>&copy; 2024 Sistema de Visualización 360°. Todos los derechos reservados.</p>
      </footer>

    </div>
  );
};

export default ProjectGallery;

