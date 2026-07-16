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
    const user = authService.getCurrentUser();
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else if (user?.role === 'admin' || user?.role === 'project_admin') {
      navigate('/admin');
    } else {
      navigate('/gallery');
    }
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

      <div className="project-details-container bg-slate-50 min-h-screen pt-0 pb-10">
        
        {/* Full-width container for the back button to sit on the far left */}
        <div style={{ width: '100%', padding: '0 40px', marginTop: '-64px', marginBottom: '16px', display: 'flex', justifyContent: 'flex-start', position: 'relative', zIndex: 10 }}>
          <button 
            onClick={handleBack}
            style={{ padding: '10px 20px', borderRadius: '10px', background: '#ffffff', color: '#334155', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
          >
            <FaArrowLeft /> Volver
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Main Info Card */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100/80 p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 relative overflow-hidden">
            {/* Decorative subtle background glow */}
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-b from-blue-50/80 to-transparent rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>
            
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
                <div className="flex items-center justify-center flex-wrap gap-3 pb-2 mt-4">
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImageIndex === idx ? 'border-blue-500 shadow-md scale-110 z-10' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'
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
              
              <div className="mt-8 text-slate-600 text-base sm:text-[1.05rem] font-medium leading-[1.85] whitespace-pre-line">
                {project.description ? (
                  <p>{project.description}</p>
                ) : (
                  <p className="italic opacity-80">No hay descripción comercial disponible para este proyecto.</p>
                )}
              </div>

            </div>
          </div>

          {/* Secondary Card: Specs / Attachments */}
          <div className="bg-white rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100 p-8 lg:p-10 mt-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10 opacity-60 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 flex items-center justify-center text-2xl shadow-inner border border-blue-100">
                <FaFileAlt />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">Documentación Técnica</h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">Archivos, planos y manuales adjuntos del proyecto</p>
              </div>
            </div>
            
            <div className="bg-slate-50/70 rounded-3xl p-6 sm:p-8 border border-slate-200/60 shadow-inner">
              {Array.isArray(project.attachments) && project.attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {project.attachments.map((file, idx) => (
                    <a
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex flex-col p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                    >
                      {/* Decorative top border */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="flex items-start justify-between mb-5">
                        <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-blue-500/30">
                          {file.url && file.url.toLowerCase().endsWith('.pdf') ? <FaFilePdf /> : <FaFileAlt />}
                        </div>
                        <div className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-full group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors tracking-wider">
                           {file.url && file.url.toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOC'}
                        </div>
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-end">
                        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors" title={file.title || file.name}>
                          {file.title || file.name || `Documento ${idx + 1}`}
                        </h3>
                        <div className="overflow-hidden mt-3">
                          <p className="text-xs text-blue-600 font-bold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                            Ver documento <span className="text-[10px]">&rarr;</span>
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 text-4xl mb-5 shadow-sm border border-slate-100">
                    <FaFileAlt />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">Sin documentos</h3>
                  <p className="text-slate-500 max-w-sm text-sm leading-relaxed">Este proyecto no tiene documentación técnica ni manuales cargados por el momento.</p>
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
