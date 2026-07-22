import React, { useState } from "react";
import { FaArrowLeft, FaMapMarkedAlt, FaCircle } from "react-icons/fa";
import "./NavigationHistory.css";
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const NavigationHistory = ({ currentScene, onNavigate, onBack, showBack = true, experiences = [], activeZoneId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { projectId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (projectId) {
      navigate(`/project/${projectId}`);
    } else {
      navigate('/gallery');
    }
  };

  return (
    <div className="navigation-history">
      {showBack && (
        <button
          className="back-button enabled"
          onClick={handleBack}
          title="Volver a la vista anterior"
        >
          <span className="back-icon"><FaArrowLeft /></span>
          <span className="back-text">Atrás</span>
        </button>
      )}

      <button
        className="history-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        title="Ver Zonas"
      >
        <span className="history-icon"><FaMapMarkedAlt /></span>
      </button>

      {isExpanded && (
        <div className="history-panel">
          <div className="history-header">
            <h4>Zonas Disponibles</h4>
          </div>
          <div className="history-list">
            {experiences.map((zone, index) => {
              const isCurrent = zone.id === activeZoneId;
              return (
                <div
                  key={`${zone.id}-${index}`}
                  className={`history-item ${isCurrent ? "current" : ""}`}
                  onClick={() => {
                    if (zone.startScene) {
                      onNavigate(zone.startScene);
                    }
                    setIsExpanded(false);
                  }}
                >
                  <FaCircle className={`status-dot ${isCurrent ? "active" : ""}`} />
                  <span className="scene-name">{zone.name}</span>
                </div>
              );
            })}
            {experiences.length === 0 && (
              <div style={{ padding: '16px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center' }}>
                No hay zonas configuradas
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationHistory;
