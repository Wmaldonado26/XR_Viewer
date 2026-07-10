import React from 'react';
import './MapModal.css';
import { FaTimes } from 'react-icons/fa';

const MapModal = ({ isOpen, onClose, scenes, currentScene, onSceneSelect }) => {
  if (!isOpen) return null;

  // Mapeo de escenas a posiciones
  const scenePositions = {
    insideOne: { x: 50, y: 20, name: "Puente de Gobierno", area: "Superestructura" },
    insideTwo: { x: 30, y: 40, name: "Cubierta Bote Crujia Proa", area: "Cubierta" },
    insideThree: { x: 70, y: 40, name: "Cubierta Bote Crujia Proa Babor", area: "Cubierta" },
    insideFour: { x: 20, y: 60, name: "Proa Costado Babor", area: "Proa" },
    insideFive: { x: 80, y: 60, name: "Proa Costado Estribor", area: "Proa" },
    insideSix: { x: 40, y: 50, name: "Cubierta Principal Costado Babor", area: "Cubierta" },
    insideSeven: { x: 60, y: 50, name: "Cubierta Principal Costado Estribor", area: "Cubierta" },
    insideEight: { x: 50, y: 45, name: "Cubierta De Trabajo", area: "Cubierta" },
    insideNine: { x: 30, y: 55, name: "Cabrestante Costado Babor", area: "Equipos" },
    insideTen: { x: 70, y: 55, name: "Cabrestante Costado Estribor", area: "Equipos" },
    insideEleven: { x: 25, y: 35, name: "Cubierta Bote Costado Babor Proa", area: "Cubierta" },
    insideTwelve: { x: 75, y: 35, name: "Cubierta Bote Costado Babor", area: "Cubierta" },
    insideThirteen: { x: 50, y: 80, name: "Cuarto de Maquinas Costado Babor Popa", area: "Maquinaria" },
    insideFourteen: { x: 50, y: 75, name: "Cuarto de Maquinas Costado Babor Proa", area: "Maquinaria" },
    insideFifteen: { x: 50, y: 70, name: "Cubierta Superior Cuarto De Maquinas", area: "Maquinaria" },
    insideSixteen: { x: 50, y: 85, name: "Cuarto De Maquinas Costado Estribor", area: "Maquinaria" },
    insideSeventeen: { x: 45, y: 82, name: "Servo Motor Crujia", area: "Maquinaria" },
    insideEighteen: { x: 40, y: 82, name: "Servo Motor Costado Babor", area: "Maquinaria" },
    insideNineteen: { x: 60, y: 82, name: "Servo Motor Costado Estribor", area: "Maquinaria" },
  };

  const getAreaColor = (area) => {
    const colors = {
      Superestructura: "#3b82f6",
      Cubierta: "#10b981",
      Proa: "#f59e0b",
      Equipos: "#8b5cf6",
      Maquinaria: "#ef4444",
    };
    return colors[area] || "#64748b";
  };

  return (
    <div className="map-modal-backdrop" onClick={onClose}>
      <div className="map-modal" onClick={(e) => e.stopPropagation()}>
        <div className="map-modal-header">
          <h3>🗺️ Navegación del Barco</h3>
          <button className="map-modal-close" onClick={onClose} aria-label="Cerrar">
            <FaTimes />
          </button>
        </div>

        <div className="map-modal-body">
          <div className="map-container-modal">
            <svg viewBox="0 0 100 100" className="ship-map-modal">
              <rect x="10" y="15" width="80" height="70" fill="none" stroke="#64748b" strokeWidth="0.5" rx="5" className="ship-outline" />
              <rect x="15" y="20" width="70" height="15" fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" strokeWidth="0.3" rx="2" />
              <text x="50" y="28" textAnchor="middle" className="area-label">Superestructura</text>
              <rect x="15" y="35" width="70" height="20" fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" strokeWidth="0.3" rx="2" />
              <text x="50" y="45" textAnchor="middle" className="area-label">Cubierta</text>
              <rect x="15" y="55" width="70" height="10" fill="rgba(245, 158, 11, 0.1)" stroke="#f59e0b" strokeWidth="0.3" rx="2" />
              <text x="50" y="62" textAnchor="middle" className="area-label">Proa</text>
              <rect x="15" y="65" width="70" height="20" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" strokeWidth="0.3" rx="2" />
              <text x="50" y="75" textAnchor="middle" className="area-label">Maquinaria</text>

              {Object.entries(scenePositions).map(([sceneId, position]) => (
                <g key={sceneId}>
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r="2.5"
                    fill={currentScene === sceneId ? "#ffffff" : getAreaColor(position.area)}
                    stroke={currentScene === sceneId ? "#3b82f6" : "#ffffff"}
                    strokeWidth={currentScene === sceneId ? "0.6" : "0.3"}
                    className="scene-point-modal"
                    onClick={() => onSceneSelect(sceneId)}
                  />
                  {currentScene === sceneId && (
                    <circle cx={position.x} cy={position.y} r="4" fill="none" stroke="#3b82f6" strokeWidth="0.5" className="current-scene-indicator" />
                  )}
                </g>
              ))}
            </svg>
          </div>

          <div className="map-legend-modal">
            <h4>Leyenda de Áreas</h4>
            {Object.entries({
              Superestructura: "#3b82f6",
              Cubierta: "#10b981",
              Proa: "#f59e0b",
              Equipos: "#8b5cf6",
              Maquinaria: "#ef4444",
            }).map(([area, color]) => (
              <div key={area} className="legend-item-modal">
                <div className="legend-color-modal" style={{ backgroundColor: color }}></div>
                <span>{area}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
