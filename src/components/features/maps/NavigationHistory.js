import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaHistory, FaTrash, FaCircle } from "react-icons/fa";
import "./NavigationHistory.css";
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const NavigationHistory = ({ currentScene, onNavigate, onBack, showBack = true }) => {
  const [history, setHistory] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const { projectId, experienceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  // Mapeo de escenas a nombres
  const sceneNames = {
    insideOne: "Puente de Gobierno",
    insideTwo: "Cubierta Bote Crujia Proa",
    insideThree: "Cubierta Bote Crujia Proa Babor",
    insideFour: "Proa Costado Babor",
    insideFive: "Proa Costado Estribor",
    insideSix: "Cubierta Principal Costado Babor",
    insideSeven: "Cubierta Principal Costado Estribor",
    insideEight: "Cubierta De Trabajo",
    insideNine: "Cabrestante Costado Babor",
    insideTen: "Cabrestante Costado Estribor",
    insideEleven: "Cubierta Bote Costado Babor Proa",
    insideTwelve: "Cubierta Bote Costado Babor",
    insideThirteen: "Cuarto de Maquinas Costado Babor Popa",
    insideFourteen: "Cuarto de Maquinas Costado Babor Proa",
    insideFifteen: "Cubierta Superior Cuarto De Maquinas",
    insideSixteen: "Cuarto De Maquinas Costado Estribor",
    insideSeventeen: "Servo Motor Crujia",
    insideEighteen: "Servo Motor Costado Babor",
    insideNineteen: "Servo Motor Costado Estribor",
  };

  useEffect(() => {
    if (currentScene && !history.includes(currentScene)) {
      setHistory((prev) => [...prev, currentScene]);
    }
  }, [currentScene, history]);

 const handleBack = () => {
  if (window.history.length > 1) {
    navigate(-1);
  } else if (projectId) {
    navigate(`/project/${projectId}`);
  } else {
    navigate('/gallery');
  }
};

  const canGoBack = history.length > 1;

  return (
    <div className="navigation-history">
      {showBack && (
        <button
          className={`back-button ${canGoBack ? "enabled" : "disabled"}`}
          onClick={handleBack}
          disabled={!canGoBack}
          title={
            canGoBack ? "Volver a la vista anterior" : "No hay vista anterior"
          }
        >
          <span className="back-icon"><FaArrowLeft /></span>
          <span className="back-text">Atrás</span>
        </button>
      )}

      <button
        className="history-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        title="Ver historial de navegación"
      >
        <span className="history-icon"><FaHistory /></span>
      </button>

      {isExpanded && (
        <div className="history-panel">
          <div className="history-header">
            <h4>Historial de Navegación</h4>
            <button
              className="clear-history"
              onClick={() => setHistory([currentScene])}
              title="Limpiar historial"
            >
              <FaTrash />
            </button>
          </div>
          <div className="history-list">
            {history
              .slice()
              .reverse()
              .map((scene, index) => (
                <div
                  key={`${scene}-${index}`}
                  className={`history-item ${
                    scene === currentScene ? "current" : ""
                  }`}
                  onClick={() => onNavigate(scene)}
                >
                  <span className="history-number">
                    {history.length - index}
                  </span>
                  <span className="history-name">
                    {sceneNames[scene] || scene}
                  </span>
                  {scene === currentScene && (
                    <span className="current-indicator"><FaCircle /></span>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationHistory;
