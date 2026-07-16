import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserPlus, FaUserEdit, FaTrash, FaKey, FaShieldAlt, FaEnvelope, FaSearch, FaUserCircle, FaChevronDown, FaBars, FaTimes, FaLayerGroup, FaImages, FaSignOutAlt, FaFolderOpen, FaArrowRight, FaLock, FaCog, FaPhone, FaPlus, FaSave, FaUserCog, FaUsers, FaMapMarkerAlt, FaSun, FaMoon, FaUserShield, FaArrowLeft } from 'react-icons/fa';
import "./UserManagement.css";
import "../projects/ProjectManager.css";
import userService from "../../../api/services/userService";
import ConfirmModal from "../../common/Modal/ConfirmModal";
import ProgressBreadcrumb from "../../ui/ProgressBreadcrumb/ProgressBreadcrumb";
import DynamicNavbar from '../../layout/Navbar/DynamicNavbar';
import cotecmarLogo from "../../../assets/images/logo.png";
import authService from "../../../api/services/authService";
import PasswordSettings from "../auth/PasswordSettings";
import SceneCalibrationTool from "../experiences/SceneCalibrationTool";


const emptyForm = {
  id: null,
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "user",
  isActive: true,
  projectIds: [],
};

const UserManagement = ({ onBack, onLogout, darkMode, onToggleDarkMode }) => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const sidebarRef = React.useRef(null);

  const [showSidebar, setShowSidebar] = useState(false);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === "all" || user.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, filterRole]);

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
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
    } catch (err) {
      setError(err.message || "No se pudo cargar la gestión de usuarios");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setError("");
    setMessage("");
  };

  const startEdit = (user) => {
    setForm({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      role: user.role || "user",
      isActive: Boolean(user.isActive),
      projectIds: user.projectIds || [],
    });
    setMessage("");
    setError("");
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "role" && value === "admin" ? { projectIds: [] } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
        isActive: form.isActive,
        projectIds: form.role === "user" ? form.projectIds : [],
      };

      if (form.id) {
        await userService.updateUser(form.id, payload);
        setMessage("Usuario actualizado correctamente.");
      } else {
        await userService.createUser(payload);
        setMessage("Usuario creado correctamente.");
      }

      await loadData();
      resetForm();
    } catch (err) {
      setError(err.message || "No se pudo guardar el usuario");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (user) => {
    setModal({
      isOpen: true,
      title: "Eliminar usuario",
      message: `Se eliminará la cuenta de ${user.name}. Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          await userService.deleteUser(user.id);
          setMessage("Usuario eliminado correctamente.");
          if (form.id === user.id) {
            resetForm();
          }
          await loadData();
        } catch (err) {
          setError(err.message || "No se pudo eliminar el usuario");
        } finally {
          setModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };



  return (

    
    <div className="user-management project-manager">
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
            className="sidebar-item active" 
            style={{ display: currentUser?.role === 'admin' ? 'flex' : 'none' }}
            onClick={() => setShowSidebar(false)}
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
        title="Gestión de Usuarios"
        subtitle="Crea cuentas, controla el acceso y define qué barcos puede ver cada usuario."
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

      <div className="user-management__content">
        <section className="user-management__form-panel">
          <div className="panel-title">
            <FaUserCog />
            <h2>{form.id ? "Editar usuario" : "Nuevo usuario"}</h2>
          </div>

          <form onSubmit={handleSubmit} className="user-form">
            <label>
              Nombre
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </label>

            <label>
              Correo
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </label>

            <label>
              Celular
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="3001234567"
              />
            </label>

            <label>
              {form.id ? "Nueva contraseña (opcional)" : "Contraseña"}
              <input
                type="password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required={!form.id}
              />
            </label>

            <label>
              Rol
              <select
                value={form.role}
                onChange={(e) => handleChange("role", e.target.value)}
              >
                <option value="user">Usuario</option>
                <option value="project_admin">Administrador de Proyectos</option>
                <option value="admin">Administrador Principal</option>
              </select>
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => handleChange("isActive", e.target.checked)}
              />
              Cuenta activa
            </label>

            {message && <div className="feedback success">{message}</div>}
            {error && <div className="feedback error">{error}</div>}

            <div className="user-form__actions">
              <button type="submit" className="primary-btn" disabled={saving}>
                {form.id ? <FaSave /> : <FaPlus />}
                {saving ? "Guardando..." : form.id ? "Actualizar usuario" : "Crear usuario"}
              </button>
              {form.id && (
                <button type="button" className="secondary-btn" onClick={resetForm}>
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="user-management__list-panel">
          <div className="panel-title" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaUsers style={{ color: '#3b82f6', fontSize: '24px' }} />
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Usuarios registrados</h2>
            </div>
            <div className="users-filters" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginLeft: 'auto' }}>
              <div className="search-bar" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '8px 16px', borderRadius: '10px', border: '2px solid #e2e8f0' }}>
                <FaSearch style={{ color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '200px' }}
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                style={{ padding: '8px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '14px', color: '#0f172a', cursor: 'pointer' }}
              >
                <option value="all">Todos los roles</option>
                <option value="admin">Administrador Principal</option>
                <option value="project_admin">Administrador de Proyectos</option>
                <option value="user">Usuario Regular</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Cargando usuarios...</div>
          ) : (
          <div className="users-list">
              {filteredUsers.map((user) => (
                <article key={user.id} className="user-list-item">
                  <div className="user-info-section">
                    <h3 className="user-name">{user.name}</h3>
                    <div className="user-contact-info">
                      <span className="contact-item"><FaEnvelope /> {user.email}</span>
                      <span className="contact-item"><FaPhone /> {user.phone || "Sin celular"}</span>
                    </div>
                  </div>
                  
                  <div className="user-badges-section">
                    <span className={`badge badge--${user.role}`}>
                      {user.role === "admin" || user.role === "project_admin" ? <FaUserShield /> : <FaUsers />}
                      {user.role === "admin" ? "Admin" : user.role === "project_admin" ? "Admin Proy." : "Usuario"}
                    </span>
                    <span className={`badge badge--${user.isActive ? "active" : "inactive"}`}>
                      {user.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                  <div className="user-actions-section">
                    <button className="icon-btn edit-btn" onClick={() => startEdit(user)} title="Editar">
                      <FaUserEdit />
                    </button>
                    <button className="icon-btn delete-btn" onClick={() => handleDelete(user)} title="Eliminar">
                      <FaTrash />
                    </button>
                  </div>
                </article>
              ))}

              {filteredUsers.length === 0 && (
                <div className="empty-state">
                  No se encontraron usuarios con esos filtros.
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <ConfirmModal
        isOpen={modal.isOpen}
        onClose={() => setModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type="danger"
        confirmText="Eliminar"
      />
    </div>
  );
};

export default UserManagement;
