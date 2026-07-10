import React, { useState } from "react";
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaPlay, 
  FaPause, 
  FaChevronUp, 
  FaChevronDown, 
  FaSearchPlus, 
  FaSearchMinus, 
  FaExpand,
  FaVrCardboard
} from "react-icons/fa";
import "./ControlBar.css";

const ControlBar = ({
  currentScene,
  totalScenes,
  onPrevious,
  onNext,
  onPlayPause,
  onMoveUp,
  onMoveDown,
  onZoomIn,
  onZoomOut,
  onVR,
  onFullscreen,
  isPlaying = false,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <nav className={`control-bar ${isMinimized ? 'minimized' : ''}`}>
      <button 
        className="control-toggle-btn" 
        onClick={() => setIsMinimized(!isMinimized)}
        title={isMinimized ? "Mostrar controles" : "Ocultar controles"}
      >
        {isMinimized ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      <div className="control-left">
        <span className="floor-plan-label">FLOOR PLAN</span>
      </div>

      <div className="control-center">
        <button className="control-btn" onClick={onPrevious} title="Anterior">
          <FaChevronLeft />
        </button>

        <button
          className={`control-btn ${isPlaying ? "playing" : ""}`}
          onClick={onPlayPause}
          title={isPlaying ? "Pausar" : "Reproducir"}
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>

        <button className="control-btn" onClick={onNext} title="Siguiente">
          <FaChevronRight />
        </button>

        <div className="control-divider"></div>

        <button className="control-btn" onClick={onMoveUp} title="Arriba">
          <FaChevronUp />
        </button>

        <button className="control-btn" onClick={onMoveDown} title="Abajo">
          <FaChevronDown />
        </button>

        <div className="control-divider"></div>

        <button className="control-btn" onClick={onZoomIn} title="Acercar">
          <FaSearchPlus />
        </button>

        <button className="control-btn" onClick={onZoomOut} title="Alejar">
          <FaSearchMinus />
        </button>

        <div className="control-divider"></div>

        <button className="control-btn" onClick={onVR} title="Modo VR">
          <FaVrCardboard />
        </button>

        <button
          className="control-btn"
          onClick={onFullscreen}
          title="Pantalla completa"
        >
          <FaExpand />
        </button>
      </div>

      <div className="control-right">
        <span className="scene-counter">
          {currentScene}/{totalScenes}
        </span>
      </div>
    </nav>
  );
};

export default ControlBar;
