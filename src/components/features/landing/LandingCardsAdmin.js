import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaHome, FaUsers, FaLock, FaLayerGroup, FaBars, FaArrowLeft } from 'react-icons/fa';
import DynamicNavbar from '../../layout/Navbar/DynamicNavbar';
import landingService from "../../../api/services/landingService";
import authService from "../../../api/services/authService";
import "../projects/ProjectManager.css";
import "../users/UserManagement.css";
import "../../common/Modal/ConfirmModal.css";
import "./LandingCardsAdmin.css";
import cotecmarLogo from "../../../assets/images/logo.png";

const LandingCardsAdmin = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [error, setError] = useState(null);

  // Edit/Create state
  const [isEditing, setIsEditing] = useState(false);
  const [currentCard, setCurrentCard] = useState(null);
  const [formData, setFormData] = useState({ layer: "", title: "", description: "", orderIndex: 0 });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (!authService.hasRole("admin", "project_admin")) {
      navigate("/");
      return;
    }
    fetchCards();
  }, [navigate]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const data = await landingService.getCards();
      setCards(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar las tarjetas.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (card = null) => {
    if (card) {
      setCurrentCard(card);
      setFormData({
        layer: card.layer,
        title: card.title,
        description: card.description,
        orderIndex: card.orderIndex
      });
    } else {
      setCurrentCard(null);
      setFormData({ layer: "", title: "", description: "", orderIndex: cards.length });
    }
    setSelectedFile(null);
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
    setCurrentCard(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("layer", formData.layer);
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("orderIndex", formData.orderIndex);
      if (selectedFile) {
        data.append("image", selectedFile);
      }

      if (currentCard) {
        await landingService.updateCard(currentCard.id, data);
      } else {
        await landingService.createCard(data);
      }

      handleCloseEdit();
      fetchCards();
    } catch (err) {
      setError("Error al guardar la tarjeta.");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta tarjeta?")) return;
    try {
      await landingService.deleteCard(id);
      fetchCards();
    } catch (err) {
      setError("Error al eliminar la tarjeta.");
    }
  };

  return (
    <div className="project-manager desktop-mode">
      {/* OVERLAY */}
      <div 
        className={`sidebar-overlay ${showSidebar ? "active" : ""}`} 
        onClick={() => setShowSidebar(false)}
      ></div>

      {/* SIDEBAR */}
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
          <button className="sidebar-item" onClick={() => navigate("/admin")}>
            <FaHome className="sidebar-icon" />
            <span>Mis Proyectos</span>
          </button>
          
          <button className="sidebar-item" onClick={() => navigate("/admin/users")}>
            <FaUsers className="sidebar-icon" />
            <span>Gestión de Usuarios</span>
          </button>
          
          <button className="sidebar-item" onClick={() => navigate("/admin/permissions")}>
            <FaLock className="sidebar-icon" />
            <span>Permisos y Roles</span>
          </button>

          <button className="sidebar-item active">
            <FaLayerGroup className="sidebar-icon" />
            <span>Tarjetas Landing</span>
          </button>
        </nav>
      </div>

      <DynamicNavbar
        showBackButton={false}
        title="Gestión de Tarjetas"
        subtitle="Landing Page - XR Lab"
        leftActions={
          <button 
            className="hamburger-btn" 
            onClick={() => setShowSidebar(true)}
            title="Abrir Menú"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'inherit', fontSize: '20px', cursor: 'pointer', padding: '8px', marginRight: '8px' }}
          >
            <FaBars />
          </button>
        }
      />

      <div style={{ width: '100%', padding: '0 40px', marginTop: '24px', display: 'flex', justifyContent: 'flex-start' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ padding: '10px 20px', borderRadius: '10px', background: '#ffffff', color: '#334155', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
        >
          <FaArrowLeft /> Volver
        </button>
      </div>

      <main className="dashboard-content" role="main" style={{ marginTop: '100px' }}>
        <div className="projects-section" style={{ marginTop: '32px' }}>
          <div className="projects-header">
            <div className="projects-header-title">
              <h2>Tarjetas de Presentación</h2>
            </div>
            <div className="projects-header-actions">
              <button className="btn-primary" onClick={() => handleOpenEdit()}>
                <FaPlus /> Nueva Tarjeta
              </button>
            </div>
          </div>

          {error && <div className="error-message" style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
          
          {loading ? (
            <div className="loading-state">Cargando tarjetas...</div>
          ) : (
            <div className="landing-cards-grid">
              {cards.map((card) => (
                <div key={card.id} className="landing-card-item">
                  <div className="project-card-image" style={{ backgroundImage: `url(${card.image || '/images/default_image.png'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className="status-badge">Capa {card.layer}</div>
                  </div>
                  <div className="project-card-content">
                    <span className="project-type">Orden: {card.orderIndex}</span>
                    <h3 className="project-title" title={card.title}>{card.title}</h3>
                    <p className="project-description" title={card.description}>{card.description}</p>
                  </div>
                  <div className="project-card-actions">
                    <button className="btn-action primary" onClick={() => handleOpenEdit(card)}>
                      <FaEdit /> Editar
                    </button>
                    <button className="btn-action danger" onClick={() => handleDelete(card.id)}>
                      <FaTrash /> Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL EDIT/CREATE */}
      {isEditing && (
        <div className="confirm-modal-overlay" onClick={handleCloseEdit}>
          <div className="confirm-modal" style={{ maxWidth: '600px', padding: '32px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseEdit}>
              <FaTimes />
            </button>
            <div className="modal-header" style={{ borderBottom: 'none', padding: '0 0 24px 0', textAlign: 'left' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {currentCard ? "Editar Tarjeta" : "Nueva Tarjeta"}
              </h2>
            </div>
            
            <form onSubmit={handleSave} className="user-form">
              <label>
                Capa (Ej. 01)
                <input 
                  type="text" 
                  value={formData.layer} 
                  onChange={(e) => setFormData({...formData, layer: e.target.value})} 
                  required
                  placeholder="01"
                />
              </label>
              <label>
                Título
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  required
                  placeholder="Título de la tarjeta"
                />
              </label>
              <label>
                Descripción
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  required
                  placeholder="Describe el contenido..."
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', color: '#0f172a', outline: 'none', resize: 'vertical', minHeight: '100px', fontFamily: 'inherit' }}
                />
              </label>
              <label>
                Orden (Número)
                <input 
                  type="number" 
                  value={formData.orderIndex} 
                  onChange={(e) => setFormData({...formData, orderIndex: parseInt(e.target.value) || 0})} 
                  placeholder="0"
                />
              </label>
              <label>
                Imagen (jpg, png)
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    style={{ flex: 1, padding: '8px', border: '2px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', background: '#f8fafc' }}
                  />
                  {selectedFile && <span style={{ color: '#16a34a', fontWeight: 'bold' }}>¡Archivo seleccionado!</span>}
                </div>
              </label>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                <button type="button" className="secondary-btn" onClick={handleCloseEdit}>
                  Cancelar
                </button>
                <button type="submit" className="primary-btn">
                  <FaSave style={{ marginRight: '8px' }} /> Guardar Tarjeta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingCardsAdmin;
