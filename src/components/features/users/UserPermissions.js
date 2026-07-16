import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserPlus, FaUserEdit, FaTrash, FaKey, FaShieldAlt, FaEnvelope, FaSearch, FaUserCircle, FaChevronDown, FaBars, FaTimes, FaLayerGroup, FaImages, FaSignOutAlt, FaFolderOpen, FaArrowRight, FaLock, FaCheckCircle, FaProjectDiagram,
  FaSave,
  FaShip,
  FaUserShield,
  FaUsers,
  FaMapMarkerAlt,
  FaSun,
  FaMoon, FaArrowLeft
} from "react-icons/fa";
import "./UserPermissions.css";
import "../projects/ProjectManager.css";
import DynamicNavbar from '../../layout/Navbar/DynamicNavbar';
import userService from "../../../api/services/userService";
import projectService from "../../../api/services/projectService";
import authService from "../../../api/services/authService";
import cotecmarLogo from "../../../assets/images/logo.png";
import PasswordSettings from "../auth/PasswordSettings";
import SceneCalibrationTool from "../experiences/SceneCalibrationTool";

const UserPermissions = ({ onBack, onLogout, darkMode, onToggleDarkMode }) => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const sidebarRef = useRef(null);

  const [showSidebar, setShowSidebar] = useState(false);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [usersData, projectsData] = await Promise.all([
        userService.getAllUsers(),
        projectService.getAllProjects(),
      ]);
      setUsers(usersData);
      setProjects(projectsData);
      
      // Seleccionar por defecto el primer usuario no administrador, o el primero de la lista
      if (usersData.length > 0) {
        const defaultUser = usersData.find(u => u.role !== "admin") || usersData[0];
        handleSelectUser(defaultUser);
      }
    } catch (err) {
      setError(err.message || "Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSelectedProjectIds(user ? user.projectIds || [] : []);
    setMessage("");
    setError("");
  };

  const handleProjectToggle = (projectId) => {
    setSelectedProjectIds((prev) => {
      const exists = prev.includes(projectId);
      if (exists) {
        return prev.filter((id) => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const payload = {
        name: selectedUser.name,
        email: selectedUser.email,
        phone: selectedUser.phone,
        role: selectedUser.role,
        isActive: selectedUser.isActive,
        projectIds: selectedUser.role === "user" ? selectedProjectIds : [],
      };

      const updatedUser = await userService.updateUser(selectedUser.id, payload);
      setMessage(`Permisos actualizados correctamente para ${selectedUser.name}.`);
      
      // Actualizar la lista local
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? updatedUser : u))
      );
      setSelectedUser(updatedUser);
    } catch (err) {
      setError(err.message || "No se pudieron guardar los permisos.");
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchString = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchString) ||
      user.email?.toLowerCase().includes(searchString)
    );
  });



  return (
    <div className="user-permissions project-manager">
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
            className="sidebar-item active" 
            style={{ display: currentUser?.role === 'admin' ? 'flex' : 'none' }}
            onClick={() => setShowSidebar(false)}
          >
            <FaShieldAlt className="sidebar-icon" />
            <span>Gestión de Permisos</span>
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
        title="Gestión de Permisos"
        subtitle="Controla a qué embarcaciones o proyectos tiene acceso cada usuario del sistema."
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

      <div style={{ width: '100%', padding: '0 40px', marginTop: '-64px', marginBottom: '16px', display: 'flex', justifyContent: 'flex-start', position: 'relative', zIndex: 10 }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ padding: '10px 20px', borderRadius: '10px', background: '#ffffff', color: '# 334155', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
        >
          <FaArrowLeft /> Volver
        </button>
      </div>

      {error && !selectedUser && <div className="feedback error global">{error}</div>}

      {loading ? (
        <div className="loading-state">Cargando usuarios y proyectos...</div>
      ) : (
        <div className="user-permissions__content">
          {/* Panel Izquierdo: Lista de Usuarios con Buscador */}
          <aside className="user-permissions__sidebar">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar usuario por nombre o correo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="users-list-container">
              {filteredUsers.map((user) => {
                const isSelected = selectedUser && selectedUser.id === user.id;
                return (
                  <div
                    key={user.id}
                    className={`user-item-card ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="user-item-info">
                      <h4>{user.name}</h4>
                      <span>{user.email}</span>
                    </div>
                    <div className="user-item-badges">
                      <span className={`role-badge ${user.role}`}>
                        {user.role === "admin" || user.role === "project_admin" ? <FaUserShield /> : <FaUsers />}
                        {user.role === "admin" ? "Admin" : user.role === "project_admin" ? "Admin Proy." : "Usuario"}
                      </span>
                    </div>
                  </div>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="empty-results">No se encontraron usuarios.</div>
              )}
            </div>
          </aside>

          {/* Panel Derecho: Matriz de Permisos */}
          <main className="user-permissions__main-panel">
            {selectedUser ? (
              <div className="permissions-editor">
                <div className="selected-user-header">
                  <h2>Permisos de {selectedUser.name}</h2>
                  <p>Correo electrónico: {selectedUser.email}</p>
                </div>

                {selectedUser.role === "admin" ? (
                  <div className="admin-permission-notice">
                    <FaUserShield className="notice-icon" />
                    <div>
                      <h3>Acceso total de Administrador</h3>
                      <p>
                        Este usuario tiene el rol de administrador. Los administradores tienen
                        acceso ilimitado a todos los barcos del sistema por defecto. No es necesario
                        asignar permisos específicos.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="vessels-selector-card">
                    <h3>Selecciona los barcos permitidos:</h3>
                    <p className="description-text">
                      Marque las casillas correspondientes para otorgar acceso a las embarcaciones.
                      El usuario solo podrá visualizar los proyectos que tenga seleccionados aquí.
                    </p>

                    <div className="vessels-grid">
                      {projects.map((project) => {
                        const isChecked = selectedProjectIds.includes(project.id);
                        return (
                          <label
                            key={project.id}
                            className={`vessel-checkbox-card ${isChecked ? "checked" : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleProjectToggle(project.id)}
                            />
                            <div className="vessel-card-content">
                              <FaShip className="vessel-icon" />
                              <div className="vessel-details">
                                <span className="vessel-name">{project.name}</span>
                                <span className="vessel-type">{project.vesselType || "Embarcación"}</span>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                      {projects.length === 0 && (
                        <div className="no-projects">No hay barcos creados en el sistema.</div>
                      )}
                    </div>

                    {message && <div className="feedback success">{message}</div>}
                    {error && <div className="feedback error">{error}</div>}

                    <div className="actions-footer">
                      <button
                        className="save-permissions-btn"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        <FaSave /> {saving ? "Guardando..." : "Guardar Permisos"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-user-selected">
                <FaUsers className="big-icon" />
                <p>Selecciona un usuario de la lista de la izquierda para ver y gestionar sus permisos.</p>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default UserPermissions;
