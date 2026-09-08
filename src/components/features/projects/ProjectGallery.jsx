import React from "react";
import { FaArrowLeft, FaSearch, FaFilter, FaThLarge, FaList, FaSignOutAlt, FaEye, FaLock, FaLayerGroup, FaBars, FaTimes, FaCog, FaUsers, FaShieldAlt, FaUserCircle, FaChevronDown, FaImages, FaTrash, FaCogs, FaArrowRight, FaEnvelope, FaPhone, FaUserEdit, FaKey, FaFolderOpen } from 'react-icons/fa';
import DynamicNavbar from '../../layout/Navbar/DynamicNavbar';
import cotecmarLogo from '../../../assets/images/logo.png';
import fallbackProjectImage from '../../../assets/images/CARD.png';
import './ProjectGallery.css';

export default function ProjectGalleryView({
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
}) {
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'project_admin';
  const isAdminOnly = currentUser?.role !== 'admin';

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
          {isAdmin && (
            <>
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
                onClick={() => {
                  navigate("/admin/permissions");
                  setShowSidebar(false);
                }}
              >
                <FaShieldAlt className="sidebar-icon" />
                <span>Gestión de Permisos</span>
              </button>
            </>
          )}
          
          <button 
            className={`sidebar-item ${!isAdmin ? 'active' : ''}`}
            onClick={() => setShowSidebar(false)}
          >
            <FaImages className="sidebar-icon" />
            <span>Galería de Proyectos</span>
          </button>
        </nav>
      </div>

      <DynamicNavbar
        showBackButton={false}
        title="Galería de Proyectos"
        subtitle="Explora y administra los barcos disponibles en la plataforma."
        leftActions={
          <button 
            className="hamburger-btn gallery-hamburger-btn"
            onClick={() => setShowSidebar(!showSidebar)}
            title="Abrir Menú"
          >
            <FaBars />
          </button>
        }
      />

      <div className="gallery-header-bottom gallery-header-bottom-inline">
        {isAdmin && (
          <div className="gallery-header-bottom__back">
            <button 
              onClick={() => navigate('/admin')} 
              className="back-btn-cotecmar"
            >
              <FaArrowLeft /> Volver
            </button>
          </div>
        )}

        <div className="gallery-controls-copy gallery-controls-copy-inline">
          <div>
            <h2 className="gallery-title-h2">{headerTitle}</h2>
            <p className="gallery-title-copy">
              {currentUser?.role === 'user'
                ? ''
                : 'Explora y administra los barcos disponibles en la plataforma.'}
            </p>
          </div>
        </div>
        
        <div className="search-container search-container-inline">
          <div className="search-box search-box-inline">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-inline"
            />
          </div>
        </div>

        <div className="gallery-header-spacer"></div>
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
                  onError={(e) => handleImgError(e, fallbackProjectImage)}
                />
                <div className="card-overlay"
                  onClick={() => handleProjectClick(project.id)}
                
                >
                  <span>Recorrido 360°</span>
                </div>
              </div>
              
              <div className="card-content">
                <h3>{project.name}</h3>
                <p className="vessel-type">{project.vesselType}</p>
                <p className="description">
                  {truncateText(project.description, 100)}
                </p>
                
                <div className="card-footer gallery-card-footer">
                  <button
                    className="btn-view btn-secondary"
                    onClick={() => handlePagesInformationClick(project.id)}
                  >
                    Más Información
                  </button>
                  <button
                    className="btn-view btn-primary"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    Iniciar Recorrido 360° <FaArrowRight />
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
}
