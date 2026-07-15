import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaMoon, FaSun, FaUserShield, FaSignOutAlt, FaUserCircle, FaChevronDown, FaChevronRight, FaImages, FaKey, FaMapMarkerAlt, FaUserEdit } from "react-icons/fa";
import MapModal from "../../features/maps/MapModal";
import "./DynamicNavbar.css";
import cotecmarLogo from "../../../assets/images/logo.png";
import cotecmarLogoColored from "../../../assets/images/cotecmar-logo.png";
import "../../features/projects/ProjectManager.css";
import { useTheme } from "../../../context/ThemeContext";
import authService from "../../../api/services/authService";
import projectService from "../../../api/services/projectService";
import PasswordSettings from "../../features/auth/PasswordSettings";
import ProfileSettings from "../../features/auth/ProfileSettings";
import SceneCalibrationTool from "../../features/experiences/SceneCalibrationTool";
import DynamicBreadcrumbs from "../../ui/DynamicBreadcrumbs/DynamicBreadcrumbs";

const DynamicNavbar = ({
  children,
  leftActions,
  showBackButton = true,
  onBack,
  title = "Portal RV360",
  subtitle = "Sistema de Visualización 360°",
  middleContent,
  scenes,
  currentScene,
  onSceneSelect,
}) => {
  const { isLightMode, toggleLightMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [showMapModal, setShowMapModal] = useState(false);

  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPasswordSettings, setShowPasswordSettings] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showSceneCalibration, setShowSceneCalibration] = useState(false);
  
  const [allProjects, setAllProjects] = useState([]);

  useEffect(() => {
    projectService.getAllProjects().then(setAllProjects).catch(console.error);
  }, []);

  const isExperienceView = location.pathname.includes("/experience/");
  const isProjectView = location.pathname.startsWith("/project/") && !isExperienceView;
  const isAdminView = location.pathname.startsWith("/admin");
  const isGalleryView = location.pathname.startsWith("/gallery");
  const isLandingPage = location.pathname === "/";
  const activeStep = isExperienceView ? "viewer" : isProjectView ? "project" : "home";
  
  const isDarkStyle = isAdminView || isGalleryView || !isLightMode;

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    const role = currentUser?.role;
    if (role === "admin" || role === "project_admin") {
      navigate("/admin");
    } else {
      navigate("/gallery");
    }
  };

  if (isLandingPage) {
    return null;
  }

  return (
    <>
      <header className={`manager-header ${!isDarkStyle ? 'light-navbar' : ''}`} role="banner" style={{position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, margin: 0, height: '80px', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #003d82 0%, #0057b8 100%)', borderBottom: 'none', boxShadow: '0 4px 20px rgba(0, 61, 130, 0.15)'}}>
        <div className="manager-header-inner" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 24px'}}>
          <div className="manager-brand" style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            {leftActions}
            {showBackButton && (
              <button className="back-btn" onClick={handleBack} title="Volver" style={{ margin: 0, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '14px' }}>
                <FaArrowLeft /> Atrás
              </button>
            )}
            
            <img src={cotecmarLogo} alt="COTECMAR" className="manager-logo" onClick={() => navigate('/')} style={{width: '110px', height: 'auto', flexShrink: 0, marginLeft: '-5px', transition: 'all 0.5s', cursor: 'pointer'}} />
          </div>

          <div className="manager-header-middle" style={{flex: 1, display: 'flex', justifyContent: 'center', padding: '0 24px'}}>
            {middleContent || (
              <DynamicBreadcrumbs 
                customMappings={{
                  project: "Proyectos",
                  experience: "Zonas",
                  details: "Detalles",
                  admin: "Gestión de Proyecto",
                  users: "Usuarios",
                  permissions: "Permisos",
                  gallery: "Galería",
                  landing: "Tarjetas"
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
                    onClick: () => navigate(`/project/${p.id}`)
                  }))
                }}
              />
            )}
          </div>

          <div className="manager-header-actions" style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
            {children}
            
            <div className="profile-container" style={{ position: 'relative', marginLeft: '8px' }}>
              <button className="profile-btn" onClick={() => setMenuOpen((v) => !v)}>
                <div className="avatar-wrapper">
                  <FaUserCircle className="user-avatar-icon" />
                </div>
                <span className="avatar-username">{currentUser?.name || 'Perfil'}</span>
                <FaChevronDown style={{ fontSize: '12px', color: 'inherit' }} />
              </button>
              {menuOpen && (
                <div className="profile-dropdown-menu" onMouseLeave={() => setMenuOpen(false)}>
                  <div className="dropdown-user-info">
                    <p className="user-name">{currentUser?.name || 'Usuario'}</p>
                    <p className="user-role">{currentUser?.email || ''}</p>
                  </div>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item" onClick={() => { setMenuOpen(false); navigate('/gallery'); }}>
                    <FaImages className="dropdown-icon" /> Galería de proyectos
                  </button>
                  <button className="dropdown-item" onClick={() => { setMenuOpen(false); setShowProfileSettings(true); }}>
                    <FaUserEdit className="dropdown-icon" /> Editar información
                  </button>
                  <button className="dropdown-item" onClick={() => { setMenuOpen(false); setShowPasswordSettings(true); }}>
                    <FaKey className="dropdown-icon" /> Cambiar contraseña
                  </button>
                  <button className="dropdown-item" onClick={() => { setMenuOpen(false); setShowSceneCalibration(true); }}>
                    <FaMapMarkerAlt className="dropdown-icon" /> Calibrar orientación
                  </button>
                  <button className="dropdown-item" onClick={() => { setMenuOpen(false); toggleLightMode(); }}>
                    {isLightMode ? <FaMoon className="dropdown-icon" /> : <FaSun className="dropdown-icon" />} {isLightMode ? 'Activar modo oscuro' : 'Activar modo claro'}
                  </button>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item logout" onClick={() => { authService.logout(); navigate('/login'); }}>
                    <FaSignOutAlt className="dropdown-icon" /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <div style={{ height: '80px', width: '100%', display: 'flow-root' }} aria-hidden="true" />

      <MapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        scenes={scenes}
        currentScene={currentScene}
        onSceneSelect={(sceneKey) => {
          if (onSceneSelect) onSceneSelect(sceneKey);
          setShowMapModal(false);
        }}
      />

      {showPasswordSettings && (
        <PasswordSettings onClose={() => setShowPasswordSettings(false)} />
      )}
      {showProfileSettings && (
        <ProfileSettings onClose={() => setShowProfileSettings(false)} onProfileUpdated={(user) => setCurrentUser(user)} />
      )}
      {showSceneCalibration && (
        <SceneCalibrationTool onClose={() => setShowSceneCalibration(false)} />
      )}
    </>
  );
};

export default DynamicNavbar;


