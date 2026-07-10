import React, { useEffect, useState, useMemo } from "react";
import { 
  FaArrowLeft, FaUserCircle, FaChevronDown, FaImages, 
  FaKey, FaSun, FaMoon, FaSignOutAlt, FaMapMarkerAlt,
  FaChevronLeft, FaChevronRight, FaDownload, FaFilePdf, FaFileAlt
} from "react-icons/fa";
import "./ProjectDetails.css";
import "./ProjectManager.css";
import projectService from "../../../api/services/projectService";
import authService from "../../../api/services/authService";
import { useNavigate, useParams } from "react-router-dom";
import DynamicNavbar from '../../layout/Navbar/DynamicNavbar';

import cotecmarLogo from "../../../assets/images/logo.png";
import PasswordSettings from "../auth/PasswordSettings";
import SceneCalibrationTool from "../experiences/SceneCalibrationTool";


const ProjectDetails = ({ onBack, onLogout, darkMode, onToggleDarkMode }) => {
  const [project, setProject] = useState(null);
  const navigate = useNavigate();
  const { projectId } = useParams();



  // Volver a la vista del proyecto
  const handleBack = () => {
    navigate('/gallery');
  };


  useEffect(() => {
    (async () => {
      if (projectId) {
        const proj = await projectService.getProjectById(projectId);
        setProject(proj);
      } else {
        const active = await projectService.getActiveProject();
        setProject(active);
      }
    })();
  }, [projectId]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Derivar la lista de imágenes para la galería
  const galleryImages = useMemo(() => {
    const images = [];
    if (project?.thumbnail) images.push(project.thumbnail);
    if (Array.isArray(project?.gallery)) {
      images.push(...project.gallery.map(img => typeof img === 'string' ? img : img.src || img.url || ''));
    }
    return images;
  }, [project]);

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

  if (!project) return <div className="loading-screen">Cargando proyecto...</div>;



  return (
    <>
      <DynamicNavbar
        showBackButton={false}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '18px', margin: 0 }}>{project.name}</h1>
          </div>
        }
        subtitle={project.vesselType || "Project Details"}
      />

      <div style={{ width: '100%', padding: '0 40px', marginTop: '-12px', display: 'flex', justifyContent: 'flex-start' }}>
        <button 
          onClick={handleBack}
          style={{ padding: '10px 20px', borderRadius: '10px', background: '#ffffff', color: '# 334155', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
        >
          <FaArrowLeft /> Volver
        </button>
      </div>

      <div className="project-details-container bg-slate-50 min-h-screen py-10">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Main Info Card */}
          <div className="bg-white rounded-[2rem] shadow-sm p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Left Column: Gallery */}
            <div className="flex flex-col space-y-4">
              <div className="relative aspect-[16/9] w-full bg-slate-100 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center group">
                {galleryImages.length > 0 ? (
                  <>
                    <img 
                      src={galleryImages[activeImageIndex]} 
                      alt="Project preview" 
                      className="w-full h-full object-contain bg-slate-200"
                    />
                    {galleryImages.length > 1 && (
                      <>
                        <button 
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md text-slate-700 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <FaChevronLeft />
                        </button>
                        <button 
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md text-slate-700 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <FaChevronRight />
                        </button>
                      </>
                    )}
                    <a 
                      href={galleryImages[activeImageIndex]} 
                      download 
                      target="_blank" 
                      rel="noreferrer"
                      className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm text-slate-600 transition-all"
                      title="Descargar imagen"
                    >
                      <FaDownload />
                    </a>
                  </>
                ) : (
                  <div className="text-slate-400 flex flex-col items-center">
                    <FaImages className="text-4xl mb-2 opacity-50" />
                    <p>No hay imágenes disponibles</p>
                  </div>
                )}
              </div>

              {/* Thumbnails row */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImageIndex === idx ? 'border-blue-500 shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Commercial Info */}
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 uppercase tracking-tight leading-tight">
                {project.name || "Proyecto Sin Nombre"}
              </h1>
              <p className="text-blue-600 font-bold tracking-widest mt-2 uppercase text-sm">
                {project.vesselType || "TIPO DE EMBARCACIÓN"}
              </p>
              
              <div className="mt-8 text-slate-600 leading-relaxed text-lg">
                {project.description ? (
                  <p>{project.description}</p>
                ) : (
                  <p className="italic opacity-80">No hay descripción comercial disponible para este proyecto.</p>
                )}
              </div>

              <div className="mt-10">
                <button 
                  onClick={() => navigate(`/viewer/${projectId}`)}
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-blue-600 text-white rounded-full font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-600/50 hover:-translate-y-0.5 transition-all w-fit"
                >
                  Iniciar recorrido 360°
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Card: Specs / Attachments */}
          <div className="bg-white rounded-[2rem] shadow-sm p-6 lg:p-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               Documentación
            </h2>
            
            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 bg-slate-50/50">
              {Array.isArray(project.attachments) && project.attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {project.attachments.map((file, idx) => (
                    <a
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group"
                    >
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {file.url.endsWith('.pdf') ? <FaFilePdf /> : <FaFileAlt />}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold text-slate-700 truncate" title={file.name}>
                          {file.name || `Documento ${idx + 1}`}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">Haga clic para ver</p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-500 py-6">
                  <p>Este proyecto no tiene documentación cargada.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ProjectDetails;
