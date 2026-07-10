import React from "react";
import { FaTimes, FaFileDownload } from "react-icons/fa";
import "./InfoSidebar.css";

const InfoSidebar = ({ isOpen, onClose, content }) => {
  if (!isOpen || !content) return null;

  const handleDownloadPDF = () => {
    const link = document.createElement("a");
    link.href = content.pdfUrl;
    link.download = content.pdfName || "documento.pdf";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="info-sidebar-overlay" onClick={onClose}>
      <aside className="info-sidebar" onClick={(e) => e.stopPropagation()}>
        <header className="info-sidebar-header">
          <h3>{content.title}</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </header>

        <div className="info-sidebar-content">
          {content.image && (
            <div className="info-image-container">
              <img
                src={content.image}
                alt={content.title}
                className="info-image"
              />
            </div>
          )}

          {content.description && (
            <div className="info-description">
              <p>{content.description}</p>
            </div>
          )}

          {content.specifications && (
            <div className="info-specifications">
              <h4>Especificaciones Técnicas</h4>
              <ul>
                {content.specifications.map((spec, index) => (
                  <li key={index}>{spec}</li>
                ))}
              </ul>
            </div>
          )}

          {content.pdfUrl && (
            <div className="info-download">
              <button className="download-btn" onClick={handleDownloadPDF}>
                <FaFileDownload /> Descargar PDF
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default InfoSidebar;
