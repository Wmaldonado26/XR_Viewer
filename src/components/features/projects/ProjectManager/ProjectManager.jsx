import React from "react";
import {
  FaPlus, FaShip, FaEye, FaEdit, FaTrash, FaUpload,
  FaFolderOpen, FaCalendar, FaMapMarkerAlt, FaUsers,
  FaSearch, FaBars, FaTimes, FaLock, FaLayerGroup,
  FaImages, FaFileAlt, FaArchive, FaCog
} from "react-icons/fa";
import DynamicNavbar from '../../../layout/Navbar/DynamicNavbar';
import ConfirmModal from "../../../common/Modal/ConfirmModal";
import "./ProjectManager.css";
import cotecmarLogo from "../../../../assets/images/logo.png";

export const ProjectManagerTemplate = ({ logic }) => {
  const {
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
    handleImportProject,
    handleViewDetails,
    formatDate,
    getStatusBadge,
    filteredProjects,
    onCreateNew,
    onViewDetails
  } = logic;

  return (
    <div className="project-manager desktop-mode">
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
            className="sidebar-item active"
            onClick={() => setShowSidebar(false)}
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

      <div className="manager-actions dashboard-content">
        <div className="projects-header" style={{ marginBottom: '16px', marginTop: '0px' }}>
          <div className="projects-header-title">
            <h2>Gestión de Proyecto</h2>
          </div>
          
          <div className="projects-header-actions">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Buscar por nombre, descripción o tipo..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-primary" onClick={onCreateNew}>
              <FaPlus /> Nuevo Proyecto
            </button>
          </div>
        </div>

        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon projects"><FaFolderOpen /></div>
            <div className="stat-content">
              <span className="stat-label">Proyectos Totales</span>
              <span className="stat-number">{stats.totalProjects || 0}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon active"><FaShip /></div>
            <div className="stat-content">
              <span className="stat-label">Proyectos Activos</span>
              <span className="stat-number">{stats.activeProjects || 0}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon drafts"><FaFileAlt /></div>
            <div className="stat-content">
              <span className="stat-label">Borradores</span>
              <span className="stat-number">{stats.draftProjects ?? projects.filter(p => p.status === 'draft').length}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon archived"><FaArchive /></div>
            <div className="stat-content">
              <span className="stat-label">Archivados</span>
              <span className="stat-number">{stats.archivedProjects ?? projects.filter(p => p.status === 'archived').length}</span>
            </div>
          </div>
        </div>

        <div className="projects-section">
          <div className="projects-grid-container">
            {filteredProjects.length > 0 && (
              <div className="projects-grid">
                {filteredProjects.map((project) => {
                  const status = getStatusBadge(project.status);
                  const isActive = project.id === activeProjectId;

                  return (
                    <div key={project.id} className={`project-card ${isActive ? "active-project" : ""}`}>
                      <div className="project-card-image">
                        {project.thumbnail ? (
                          <img 
                            src={project.thumbnail} 
                            alt={project.name} 
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/default_image.png"; }} 
                          />
                        ) : (
                          <div className="thumbnail-placeholder"><FaShip /></div>
                        )}
                        {isActive && <span className="active-badge">Activo</span>}
                        <span className={`status-badge ${status.color}`}>{status.label}</span>
                      </div>

                      <div className="project-card-content">
                        <span className="project-type">{project.vesselType}</span>
                        <h3 className="project-title" title={project.name}>{project.name}</h3>
                        <p className="project-description" title={project.description}>
                          {project.description}
                        </p>
                        
                        <div className="project-meta">
                          <div className="meta-item" title="Escenas 360°">
                            <FaMapMarkerAlt /> <span>{project.statistics?.totalScenes || 0} Escenas</span>
                          </div>
                          <div className="meta-item" title="Última Modificación">
                            <FaCalendar /> <span>{formatDate(project.dateModified)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="project-card-actions">
                        <button className="btn-action primary" onClick={() => handleSelectProject(project)} title="Abrir Proyecto">
                          <FaEye /> Abrir
                        </button>
                        <div className="actions-subgroup">
                          <button className="btn-action icon-only" onClick={() => handleEditProject(project.id)} title="Editar">
                            <FaEdit />
                          </button>
                          <button className="btn-action icon-only" onClick={() => handleViewDetails(project)} title="Detalles">
                            <FaCog />
                          </button>
                          <button className="btn-action icon-only danger" onClick={() => handleDeleteProject(project.id)} title="Eliminar">
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {filteredProjects.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <FaFolderOpen />
                </div>
                <h3>No hay proyectos disponibles</h3>
                <p>Comienza creando tu primer proyecto o importa uno existente para empezar a trabajar.</p>
                <div className="empty-state-actions">
                  <button className="btn-primary" onClick={onCreateNew}>
                    <FaPlus /> Crear Primer Proyecto
                  </button>
                  <label className="btn-secondary">
                    <FaUpload /> Importar Proyecto
                    <input type="file" accept=".json" onChange={handleImportProject} style={{ display: "none" }} />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={modal.isOpen}
        onClose={() => setModal((m) => ({ ...m, isOpen: false }))}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        requiresConfirmation={modal.requiresConfirmation}
        confirmationText={modal.confirmationText}
        showCancelButton={modal.showCancelButton !== false}
      />
    </div>
  );
};
