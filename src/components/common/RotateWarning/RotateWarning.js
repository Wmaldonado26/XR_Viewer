import React, { useState, useEffect } from 'react';
import rotateAnim from '../../../assets/images/rotate.png';
import './RotateWarning.css';

function RotateWarning() {
  const [isPortrait, setIsPortrait] = useState(window.matchMedia("(orientation: portrait)").matches);

  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.matchMedia("(orientation: portrait)").matches);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return (
    <div className={`rotate-warning ${isPortrait ? 'show' : 'hide'}`}>
      <div className="rotate-content">
        <img src={rotateAnim} alt="Gira tu dispositivo" className="rotate-icon" />
        <h1 className="rotate-title">Gira tu dispositivo</h1>
        <p className="rotate-text">Para disfrutar mejor del recorrido 360° del barco</p>
        <div className="cotecmar-brand">COTECMAR</div>
      </div>
    </div>
  );
}

export default RotateWarning;


