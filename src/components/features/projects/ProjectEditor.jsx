import React from "react";
import { 
  FaCog, FaUsers, FaArrowLeft, FaPlus, FaCamera, FaImage, 
  FaSave, FaTimes, FaCheck, FaExclamationTriangle, FaInfoCircle,
  FaMapMarkedAlt, FaCompass, FaRegDotCircle, FaVideo,
  FaGripLines, FaUndo, FaRedo, FaCaretDown, FaCaretUp, FaTrash,
  FaFileExport, FaDownload, FaUpload, FaFilePdf, FaPaperclip, FaChevronUp, FaShip, FaSearch, FaMapMarkerAlt, FaMousePointer, FaEye, FaEyeSlash, FaEdit
} from 'react-icons/fa';
import DynamicNavbar from '../../layout/Navbar/DynamicNavbar';
import "./ProjectEditor.css";
import "./ThumbnailUpload.css";
import ConfirmModal from "../../common/Modal/ConfirmModal";
import HotspotVisualEditor from "../hotspots/HotspotVisualEditor";

export default function ProjectEditorView({
  project, isUploadingMultiple, isSaving, hasChanges, activeTab, setActiveTab,
  selectedScene, setSelectedScene, visualEditorSceneKey, setVisualEditorSceneKey,
  showCreateZoneModal, newZoneName, setNewZoneName, newZoneFiles, setNewZoneFiles,
  selectedZoneId, setSelectedZoneId, zoneSearchQuery, setZoneSearchQuery,
  sceneFilter, setSceneFilter, showSceneFilterDropdown, setShowSceneFilterDropdown,
  selectedZonesToDelete, setSelectedZonesToDelete, selectedScenesToDelete, setSelectedScenesToDelete,
  mapZoneId, setMapZoneId, mapSelectedSceneKey, setMapSelectedSceneKey,
  mapPlacingMode, setMapPlacingMode, mapPlanContainerRef, mapImageRef, mapImageRect,
  contentRef, fabRootRef, showFab, fabOpen, setFabOpen, modal, setModal,
  iconOptions, hotspotTypes, scenesCount, scenesForZone, fabConfig,
  totalHotspots, totalMapas, scenesByZone, unassignedScenes,
  navigate, projectId,
  getZoneLabel, getMapForZone, isScenePlacedOnZone,
  handleBasicInfoChange, handleSettingChange, handleRemoveThumbnail, handleThumbnailUpload,
  handleGalleryUpload, handleDeleteGalleryImage, handleDocumentUpload,
  handleUpdateDocumentTitle, handleDeleteDocument, handleAddExperience,
  handleCreateZoneSubmit, handleUpdateExperience, handleDeleteExperience,
  handleBulkDeleteZones, handleAddScene, handleUpdateScene, handleDeleteScene,
  handleBulkDeleteScenes, handleImageUpload, handleMapUploadForZone,
  handleRemoveMapForZone, handleUpdateSceneMap, handleClearSceneMap,
  handleStartPlacing, handleStopPlacing, handlePlanClickPlaceScene,
  handleAddHotspot, handleUpdateHotspot, handleTranslateHotspot, handleDeleteHotspot,
  handleHotspotAttachmentUpload, handleRemoveHotspotAttachment,
  handleUpdateHotspotAttachmentFolder, handleSaveProject, handleClose,
  handleDeleteProject, runFabPrimary, handleMultipleImagesUpload,
  handleCloseModal, handleCloseCreateZone, handleVisualEditorSave,
  handleReorderExperiences,
}) {
  const [draggedZoneIndex, setDraggedZoneIndex] = React.useState(null);

  const dynamicNavbarTitle = (
    <div className="project-editor__nav-title-group">
      <h1 className="project-editor__nav-title">{project?.name || "Cargando..."}</h1>
    </div>
  );

  const dynamicNavbarSubtitle = (
    <p className="project-editor__nav-subtitle">
      Todos los cambios se guardan manualmente
      {hasChanges && <span className="unsaved-dot project-editor__unsaved-dot"></span>}
    </p>
  );

  return (
    <div className="project-editor modern-editor">
      <DynamicNavbar
        showBackButton={false}
        title={dynamicNavbarTitle}
        subtitle={dynamicNavbarSubtitle}
      >
        <div className="project-editor__header-right">
          <button
            className="btn-reload-modern project-editor__btn-reload"
            onClick={() => window.location.reload()}
            title="Recargar"
          >
            Recargar
          </button>
          <button
            className={`btn-save-modern ${hasChanges ? 'project-editor__btn-save--active' : 'project-editor__btn-save--idle'}`}
            onClick={handleSaveProject}
            disabled={isSaving || !hasChanges || !project}
          >
            <FaSave /> {isSaving ? 'Guardando...' : hasChanges ? 'Guardar Cambios' : 'Guardado'}
          </button>
        </div>
      </DynamicNavbar>

      <div className="editor-tabs-modern">
        <button
          className={`tab-modern ${activeTab === "basic" ? "active" : ""}`}
          onClick={() => setActiveTab("basic")}
        >
          <div className="tab-content">
            <span className="tab-icon"><FaInfoCircle /></span>
            <span className="tab-label">Información</span>
          </div>
        </button>
        <button
          className={`tab-modern ${activeTab === "scenes" || activeTab === "experiences" ? "active" : ""}`}
          onClick={() => setActiveTab("scenes")}
        >
          <div className="tab-content">
            <span className="tab-icon"><FaImage /></span>
            <span className="tab-label">Zonas y Escenas</span>
            <span className="tab-badge">{scenesCount}</span>
          </div>
        </button>
        <button
          className={`tab-modern ${activeTab === "hotspots" ? "active" : ""}`}
          onClick={() => setActiveTab("hotspots")}
        >
          <div className="tab-content">
            <span className="tab-icon"><FaMapMarkerAlt /></span>
            <span className="tab-label">Hotspots</span>
            <span className="tab-badge">{totalHotspots}</span>
          </div>
        </button>
        <button
          className={`tab-modern ${activeTab === "map" ? "active" : ""}`}
          onClick={() => setActiveTab("map")}
        >
          <div className="tab-content">
            <span className="tab-icon"><FaMapMarkerAlt /></span>
            <span className="tab-label">Mapas</span>
            <span className="tab-badge">{totalMapas}</span>
          </div>
        </button>
      </div>

      <div className="editor-content-modern" ref={contentRef}>
        {!project ? (
          <div className="loading" style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-transparent border-t-[#2B5398] border-b-[#8fa7d6]"></div>
          </div>
        ) : (
          <>
            <div className="project-editor__back-row">
              <button 
                onClick={() => navigate("/admin")} 
                className="back-btn-cotecmar"
              >
                <FaArrowLeft /> Volver
              </button>
            </div>
        
        {activeTab === "basic" && (
          <div className="tab-pane-modern">
            <div className="stats-panel-modern">
              <div className="stat-card-modern">
                <div className="stat-value">{project.experiences?.length || 0}</div>
                <div className="stat-label">Total Zonas</div>
              </div>
              <div className="stat-card-modern">
                <div className="stat-value">{scenesCount}</div>
                <div className="stat-label">Total Escenas</div>
              </div>
              <div className="stat-card-modern">
                <div className="stat-value">{totalHotspots}</div>
                <div className="stat-label">Total Hotspots</div>
              </div>
              <div className="stat-card-modern">
                <div className="stat-value">{totalMapas}</div>
                <div className="stat-label">Total Mapas</div>
              </div>
            </div>

            <div className="premium-card">
              <div className="premium-card-header">
                <h2>Detalles del Proyecto</h2>
                <p>Configura la información principal y el estado operativo.</p>
              </div>
              <div className="premium-card-body">
                <div className="form-grid-modern">
                  <div className="form-group-modern">
                    <label>Nombre del Proyecto</label>
                    <input type="text" value={project.name || ""} onChange={(e) => handleBasicInfoChange("name", e.target.value)} />
                  </div>
                  <div className="form-group-modern">
                    <label>Tipo de Embarcación</label>
                    <input type="text" value={project.vesselType || ""} onChange={(e) => handleBasicInfoChange("vesselType", e.target.value)} />
                  </div>
                  <div className="form-group-modern">
                    <label>Estado</label>
                    <select value={project.status || "active"} onChange={(e) => handleBasicInfoChange("status", e.target.value)}>
                      <option value="active">Activo</option>
                      <option value="draft">Borrador</option>
                      <option value="archived">Archivado</option>
                    </select>
                  </div>
                  <div className="form-group-modern" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1rem' }}>
                    <input 
                      type="checkbox" 
                      id="showInLandingList" 
                      checked={project.settings?.showInLandingList || false}
                      onChange={(e) => handleSettingChange("showInLandingList", e.target.checked)}
                      style={{ width: '20px', height: '20px' }}
                    />
                    <label htmlFor="showInLandingList" style={{ margin: 0, cursor: 'pointer' }}>
                      Mostrar en Menú de la Landing Page (Público)
                    </label>
                  </div>
                  <div className="form-group-modern full-width">
                    <label>Escena Inicial (Opcional)</label>
                    <select 
                      value={project.settings?.initialSceneId || ""} 
                      onChange={(e) => handleSettingChange("initialSceneId", e.target.value)}
                    >
                      <option value="">Seleccionar escena de inicio...</option>
                      {Object.keys(project.scenes || {}).map(sceneKey => (
                        <option key={sceneKey} value={sceneKey}>
                          {project.scenes[sceneKey].title || sceneKey}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Si no seleccionas ninguna, el recorrido comenzará en la primera escena de la primera zona.</p>
                  </div>
                  <div className="form-group-modern full-width">
                    <label>Descripción General</label>
                    <textarea value={project.description || ""} onChange={(e) => handleBasicInfoChange("description", e.target.value)} rows="3" />
                  </div>
                </div>
              </div>
            </div>

            <div className="assets-grid-modern">
              <div className="premium-card asset-card">
                <div className="premium-card-header">
                  <h3>Portada</h3>
                  <span className="asset-subtitle">Imagen principal</span>
                </div>
                <div className="asset-body">
                  {project.thumbnail && project.thumbnail !== "/images/default_image.png" ? (
                    <div className="asset-preview">
                      <img src={project.thumbnail} alt="Portada" />
                      <button className="btn-asset-remove" onClick={handleRemoveThumbnail} title="Eliminar"><FaTrash /></button>
                    </div>
                  ) : (
                    <div className="asset-empty">Sin portada</div>
                  )}
                </div>
                <div className="asset-footer">
                  <label className="btn-upload-modern">
                    <FaUpload /> Subir portada
                    <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="project-editor__input-hidden" />
                  </label>
                </div>
              </div>

              <div className="premium-card asset-card">
                <div className="premium-card-header">
                  <h3>Galería</h3>
                  <span className="asset-subtitle">{(project.gallery || []).length}/4 Imágenes</span>
                </div>
                <div className="asset-body gallery-body">
                  <div className="gallery-grid-modern">
                    {(project.gallery || []).map((img) => (
                      <div key={img.id} className="gallery-item-modern">
                        <img src={img.src} alt={img.title} />
                        <button className="btn-asset-remove" onClick={() => handleDeleteGalleryImage(img.id)}><FaTrash /></button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="asset-footer">
                  <label className={`btn-upload-modern ${(project.gallery || []).length >= 4 ? "disabled" : ""}`}>
                    <FaPlus /> Agregar foto
                    <input type="file" accept="image/*" onChange={handleGalleryUpload} disabled={(project.gallery || []).length >= 4} className="project-editor__input-hidden" />
                  </label>
                </div>
              </div>

              <div className="premium-card asset-card doc-card">
                <div className="premium-card-header">
                  <h3>Documentos</h3>
                  <span className="asset-subtitle">{(project.attachments || []).length} Archivos</span>
                </div>
                <div className="asset-body doc-body">
                  {(project.attachments || []).map((doc) => (
                    <div key={doc.id} className="doc-item-modern">
                      <FaFilePdf className="doc-icon" />
                      <div className="doc-info">
                        <input type="text" value={doc.title || ""} onChange={(e) => handleUpdateDocumentTitle(doc.id, e.target.value)} className="doc-input" />
                        <span className="doc-meta">{doc.format} • {doc.size}</span>
                      </div>
                      <button className="btn-doc-remove" onClick={() => handleDeleteDocument(doc.id)}><FaTrash /></button>
                    </div>
                  ))}
                </div>
                <div className="asset-footer">
                  <label className="btn-upload-modern">
                    <FaPlus /> Agregar doc
                    <input type="file" accept=".pdf,image/*" onChange={handleDocumentUpload} className="project-editor__input-hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {(activeTab === "scenes" || activeTab === "experiences") && (
          <div className="tab-pane-modern">
            <div className="pane-header">
              <div className="pane-title">
                <h2>Zonas y Escenas 360°</h2>
                <p>Agrupa tus escenas creando Zonas y subiendo múltiples fotos a la vez.</p>
              </div>
              <button className="btn-primary-modern" onClick={handleAddExperience}>
                <FaPlus /> Crear Nueva Zona
              </button>
            </div>

            {isUploadingMultiple && (
              <div className="project-editor__uploading-banner">
                Subiendo imágenes, por favor espera...
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-6 mt-6 min-h-[600px]">
              
              <div className="w-full md:w-80 flex-shrink-0 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col shadow-sm project-editor__panel-zone">
                <div className="p-4 border-b border-slate-200 bg-white rounded-t-2xl">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar Zona..." 
                      className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                      value={zoneSearchQuery}
                      onChange={(e) => setZoneSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2 relative">
                  {selectedZonesToDelete.length > 0 && (
                    <div className="p-2 border-b border-slate-200 bg-red-50 flex justify-between items-center rounded-lg mb-2">
                      <span className="text-sm font-semibold text-red-600">{selectedZonesToDelete.length} seleccionadas</span>
                      <button 
                        onClick={() => handleBulkDeleteZones()}
                        className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                  {(project.experiences || []).filter(z => (z.name || "").toLowerCase().includes(zoneSearchQuery.toLowerCase())).map((zone) => {
                    const originalIndex = project.experiences.findIndex(exp => exp.id === zone.id);
                    const isActive = selectedZoneId === zone.id;
                    const sceneCountZone = (scenesByZone[zone.id] || []).length;
                    const isVisible = zone.visible !== false;
                    return (
                      <div 
                        key={zone.id} 
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = 'move';
                          setDraggedZoneIndex(originalIndex);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedZoneIndex !== null && draggedZoneIndex !== originalIndex) {
                            handleReorderExperiences(draggedZoneIndex, originalIndex);
                          }
                          setDraggedZoneIndex(null);
                        }}
                        onClick={() => setSelectedZoneId(zone.id)}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                          isActive 
                            ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                            : "bg-white text-slate-700 border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                        } ${draggedZoneIndex === originalIndex ? "opacity-50 border-dashed" : ""}`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <FaGripLines 
                            className={`flex-shrink-0 cursor-grab ${isActive ? "text-blue-200 hover:text-white" : "text-slate-400 hover:text-slate-600"}`} 
                            title="Arrastrar para reordenar"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateExperience(originalIndex, "visible", !isVisible);
                            }}
                            className={`flex-shrink-0 focus:outline-none transition-colors ${isVisible ? (isActive ? "text-blue-200 hover:text-white" : "text-blue-500 hover:text-blue-600") : "text-slate-400 hover:text-slate-600"}`}
                            title={isVisible ? "Zona Visible" : "Zona Oculta"}
                          >
                            {isVisible ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
                          </button>
                          <input 
                            type="checkbox" 
                            checked={selectedZonesToDelete.includes(zone.id)}
                            onChange={(e) => {
                               e.stopPropagation();
                               if (e.target.checked) setSelectedZonesToDelete([...selectedZonesToDelete, zone.id]);
                               else setSelectedZonesToDelete(selectedZonesToDelete.filter(id => id !== zone.id));
                            }}
                            className="w-4 h-4 cursor-pointer accent-red-600 rounded"
                            title="Seleccionar para eliminar"
                          />
                          <span className={`font-semibold text-sm truncate ${!isVisible ? "line-through opacity-70" : ""}`}>{zone.name || "Zona sin nombre"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`text-xs font-bold px-2 py-1 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`} title={`${sceneCountZone} escenas`}>
                            {sceneCountZone}
                          </div>
                          {isActive && (
                            <button 
                              className="text-white hover:text-red-200 p-1"
                              onClick={(e) => { e.stopPropagation(); handleDeleteExperience(originalIndex); }}
                              title="Eliminar Zona"
                            >
                              <FaTrash size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {unassignedScenes.length > 0 && (
                     <div 
                        onClick={() => setSelectedZoneId("unassigned")}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border project-editor__unassigned-zone ${
                          selectedZoneId === "unassigned" 
                            ? "bg-red-600 text-white border-red-600 shadow-md" 
                            : "bg-red-50 text-red-700 border-red-100 hover:border-red-300 hover:bg-red-100"
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <FaInfoCircle className={`flex-shrink-0 ${selectedZoneId === "unassigned" ? "text-red-100" : "text-red-400"}`} />
                          <span className="font-semibold text-sm truncate">Sin Zona Asignada</span>
                        </div>
                        <div className={`text-xs font-bold px-2 py-1 rounded-full ${selectedZoneId === "unassigned" ? "bg-white/20 text-white" : "bg-red-200 text-red-700"}`}>
                          {unassignedScenes.length}
                        </div>
                      </div>
                  )}
                </div>
              </div>

              <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm overflow-hidden project-editor__panel-scene">
                {selectedZoneId ? (
                   <>
                     <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                       <div className="flex items-center gap-3">
                         {selectedZoneId === "unassigned" ? (
                           <>
                             <FaInfoCircle className="text-2xl text-red-500" />
                             <div>
                               <h3 className="text-xl font-bold text-slate-800 m-0">Escenas sin Zona (Anteriores)</h3>
                               <p className="text-sm text-slate-500 m-0 mt-1">Escenas no asignadas a ninguna zona específica.</p>
                             </div>
                           </>
                         ) : (
                           <>
                             <FaShip className="text-2xl text-blue-600" />
                             <div className="flex-1">
                               <input 
                                 type="text" 
                                 value={project.experiences?.find(z => z.id === selectedZoneId)?.name || ""} 
                                 onChange={(e) => {
                                   const idx = project.experiences.findIndex(z => z.id === selectedZoneId);
                                   if(idx !== -1) handleUpdateExperience(idx, "name", e.target.value);
                                 }}
                                 className="text-xl font-bold text-slate-800 bg-transparent border-none outline-none focus:ring-0 p-0 m-0 border-b border-dashed border-slate-300 focus:border-blue-500"
                                 placeholder="Nombre de la Zona"
                               />
                               <p className="text-sm text-slate-500 m-0 mt-1">
                                 Gestión de escenas de la zona seleccionada.
                               </p>
                             </div>
                           </>
                         )}
                       </div>
                       
                       <div className="flex items-center gap-3">
                         <div className="relative">
                           <button 
                             onClick={() => setShowSceneFilterDropdown(!showSceneFilterDropdown)}
                             className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
                           >
                             Filtrar
                             <FaChevronUp className={`transition-transform ${showSceneFilterDropdown ? '' : 'rotate-180'}`} size={12} />
                           </button>
                           {showSceneFilterDropdown && (
                             <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
                               <div className="p-2 space-y-1">
                                 <label className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer m-0">
                                   <input type="radio" name="sceneFilter" checked={sceneFilter === "all"} onChange={() => { setSceneFilter("all"); setShowSceneFilterDropdown(false); }} className="text-blue-600" />
                                   <span className="text-sm text-slate-700">Todas las Escenas</span>
                                 </label>
                                 <label className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer m-0">
                                   <input type="radio" name="sceneFilter" checked={sceneFilter === "completed"} onChange={() => { setSceneFilter("completed"); setShowSceneFilterDropdown(false); }} className="text-blue-600" />
                                   <span className="text-sm text-slate-700">Completadas</span>
                                 </label>
                                 <label className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer m-0">
                                   <input type="radio" name="sceneFilter" checked={sceneFilter === "360"} onChange={() => { setSceneFilter("360"); setShowSceneFilterDropdown(false); }} className="text-blue-600" />
                                   <span className="text-sm text-slate-700">Vistas 360</span>
                                 </label>
                               </div>
                             </div>
                           )}
                         </div>

                         {selectedScenesToDelete.length > 0 ? (
                           <button 
                             onClick={() => handleBulkDeleteScenes()}
                             className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all shadow-sm cursor-pointer m-0"
                           >
                             <FaTrash /> Eliminar {selectedScenesToDelete.length}
                           </button>
                         ) : selectedZoneId === "unassigned" ? (
                           <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all shadow-sm" onClick={handleAddScene}>
                             <FaPlus /> Añadir escena
                           </button>
                         ) : (
                           <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm cursor-pointer m-0">
                             <FaUpload /> Subir escenas
                             <input 
                               type="file" 
                               accept="image/*" 
                               multiple
                               onChange={(e) => {
                                 const zName = project.experiences?.find(z => z.id === selectedZoneId)?.name || 'Zona';
                                 handleMultipleImagesUpload(selectedZoneId, zName, e);
                               }} 
                               className="project-editor__input-hidden" 
                             />
                           </label>
                         )}
                       </div>
                     </div>

                     <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                       {(() => {
                         let scenesToRender = selectedZoneId === "unassigned" ? unassignedScenes : (scenesByZone[selectedZoneId] || []);
                         
                         if (sceneFilter === "completed") {
                           scenesToRender = scenesToRender.filter(s => s.scene?.image);
                         } else if (sceneFilter === "360") {
                           scenesToRender = scenesToRender.filter(s => s.scene?.image);
                         }

                         if (scenesToRender.length === 0) {
                           return (
                             <div className="h-full flex flex-col items-center justify-center text-slate-400">
                               <FaImage className="text-6xl text-slate-200 mb-4" />
                               <p className="text-lg font-medium text-slate-500">No hay escenas en esta zona.</p>
                               <p className="text-sm">Usa el botón superior para subir fotos panorámicas.</p>
                             </div>
                           );
                         }

                         return (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                             {scenesToRender.map(({sceneKey, scene}) => (
                               <div key={sceneKey} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col relative">
                                 <div className="absolute top-2 right-2 z-20">
                                   <input 
                                     type="checkbox"
                                     checked={selectedScenesToDelete.includes(sceneKey)}
                                     onChange={(e) => {
                                        if (e.target.checked) setSelectedScenesToDelete([...selectedScenesToDelete, sceneKey]);
                                        else setSelectedScenesToDelete(selectedScenesToDelete.filter(id => id !== sceneKey));
                                     }}
                                     className="w-5 h-5 cursor-pointer accent-red-600 drop-shadow-md rounded"
                                   />
                                 </div>
                                 <div className="relative aspect-video bg-slate-100 overflow-hidden">
                                   <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                                     360°
                                   </div>
                                   {scene.image ? (
                                     <img src={scene.image} alt={scene.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                   ) : (
                                     <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                       <FaImage size={24} className="mb-2 opacity-50" />
                                       <span className="text-xs font-medium">Sin imagen</span>
                                     </div>
                                   )}
                                   <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white cursor-pointer backdrop-blur-[2px] w-full h-full border-0"
  onClick={() => setVisualEditorSceneKey(sceneKey)}
  title="Editar Escena"
>
  <span className="flex items-center gap-2 font-semibold"><FaEdit /> Editar</span>
</button>
                                 </div>
                                 
                                 <div className="p-4 flex-1 flex flex-col gap-3">
                                   <div>
                                     <input 
                                       type="text" 
                                       value={scene.title || ""} 
                                       onChange={(e) => handleUpdateScene(sceneKey, "title", e.target.value)} 
                                       className="w-full text-sm font-semibold text-slate-800 border-none p-0 outline-none focus:ring-0 bg-transparent placeholder-slate-400 border-b border-transparent focus:border-blue-500 transition-colors"
                                       placeholder="Nombre de la Escena"
                                     />
                                   </div>
                                   
                                   <div className="text-xs">
                                     <select 
                                       value={scene.zoneId || ""} 
                                       onChange={(e) => handleUpdateScene(sceneKey, "zoneId", e.target.value)}
                                       className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 outline-none focus:border-blue-500 transition-colors"
                                     >
                                       <option value="">(Sin Zona)</option>
                                       {(project.experiences || []).map(z => (
                                         <option key={z.id} value={z.id}>{z.name || z.id}</option>
                                       ))}
                                     </select>
                                   </div>

                                   <div className="pt-3 mt-auto border-t border-slate-100 grid grid-cols-3 gap-2">
                                       <button
                                         className="project-editor__scene-action project-editor__scene-action--hotspots"
                                         onClick={() => setVisualEditorSceneKey(sceneKey)}
                                         title="Configurar Hotspots"
                                       >
                                         <FaMapMarkerAlt size={14} />
                                         <span className="project-editor__scene-action-label">Hotspots</span>
                                       </button>
                                       <label
                                         className="project-editor__scene-action project-editor__scene-action--editor cursor-pointer m-0 flex items-center justify-center"
                                         title="Cambiar Fondo"
                                       >
                                         <FaUpload size={14} />
                                         <span className="project-editor__scene-action-label">Fondo</span>
                                         <input type="file" accept="image/*" onChange={(e) => handleImageUpload(sceneKey, e)} className="hidden" />
                                       </label>
                                     <button
                                       className="project-editor__scene-action project-editor__scene-action--delete"
                                       onClick={() => handleDeleteScene(sceneKey)}
                                       title="Eliminar Escena"
                                     >
                                       <FaTrash size={14} />
                                       <span className="project-editor__scene-action-label">Eliminar</span>
                                     </button>
                                   </div>
                                 </div>
                               </div>
                             ))}
                           </div>
                         );
                       })()}
                     </div>
                   </>
                ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 bg-slate-50/50">
                     <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center shadow-inner">
                       <FaShip className="text-3xl text-slate-300" />
                     </div>
                     <p className="text-lg font-medium text-slate-500">Selecciona una zona en el panel izquierdo</p>
                   </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "hotspots" && (
          <div className="tab-pane-modern">
            <div className="pane-header">
              <div className="pane-title">
                <h2>Gestión de Hotspots</h2>
                <p>Configura puntos de interacción en las escenas.</p>
              </div>
              <div className="header-filters">
                <select className="scene-filter-select" value={selectedScene || ""} onChange={(e) => setSelectedScene(e.target.value)}>
                  <option value="">Seleccionar escena...</option>
                  {Object.entries(project.scenes || {}).map(([key, sc]) => (
                    <option key={key} value={key}>{sc.title || key}</option>
                  ))}
                </select>
                <button className="btn-primary-modern" onClick={() => handleAddHotspot(selectedScene)} disabled={!selectedScene}>
                  <FaPlus /> Añadir Hotspot
                </button>
              </div>
            </div>

            {selectedScene && project.scenes?.[selectedScene] && (
              <div className="hotspots-grid-modern">
                {Object.entries(project.scenes[selectedScene].hotSpots || {}).map(([hotspotKey, hotspot]) => {
                  const isInfo = hotspot.cssClass === "infoHotspot";
                  const isElement = hotspot.cssClass === "hotSpotElement";
                  const isNav = hotspot.cssClass === "moveScene";
                  const attachments = Array.isArray(hotspot.attachments) ? hotspot.attachments : [];

                  return (
                    <div key={hotspotKey} className="hotspot-card-modern">
                      <div className="hotspot-card-header">
                        <div className="hotspot-type-badge">
                          {isNav ? "Navegación" : isInfo ? "Información" : "Elemento"}
                        </div>
                        <button className="btn-action-icon danger" onClick={() => handleDeleteHotspot(selectedScene, hotspotKey)}>
                          <FaTrash />
                        </button>
                      </div>
                      
                      <div className="hotspot-card-body">
                        <div className="form-group-modern compact full-width">
                          <label>Nombre del espacio / Etiqueta</label>
                          <input 
                            type="text" 
                            value={hotspot.label || hotspot.title || hotspotKey} 
                            onChange={(e) => handleUpdateHotspot(selectedScene, hotspotKey, "label", e.target.value)} 
                            onBlur={() => {
                              if (hotspot.cssClass === "information_bubble" || hotspot.cssClass === "information-label") {
                                handleTranslateHotspot(selectedScene, hotspotKey);
                              }
                            }}
                          />
                        </div>
                        
                        <div className="hotspot-row">
                          <div className="form-group-modern compact">
                            <label>Tipo</label>
                            <select
                              value={hotspot.cssClass || "moveScene"}
                              onChange={(e) => {
                                handleUpdateHotspot(selectedScene, hotspotKey, "cssClass", e.target.value);
                                handleUpdateHotspot(selectedScene, hotspotKey, "type", "custom");
                              }}
                            >
                              {hotspotTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                          </div>
                          <div className="form-group-modern compact coords">
                            <label>P/Y</label>
                            <div className="coords-inputs">
                              <input type="number" step="0.1" value={hotspot.pitch ?? 0} onChange={(e) => handleUpdateHotspot(selectedScene, hotspotKey, "pitch", parseFloat(e.target.value))} />
                              <input type="number" step="0.1" value={hotspot.yaw ?? 0} onChange={(e) => handleUpdateHotspot(selectedScene, hotspotKey, "yaw", parseFloat(e.target.value))} />
                            </div>
                          </div>
                        </div>

                        {isNav && (
                          <div className="form-group-modern compact full-width">
                            <label>Escena Destino</label>
                            <select value={hotspot.scene || ""} onChange={(e) => handleUpdateHotspot(selectedScene, hotspotKey, "scene", e.target.value)}>
                              <option value="">Seleccionar...</option>
                              {Object.keys(project.scenes || {}).map((key) => (
                                <option key={key} value={key}>{project.scenes[key].title || key}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        {isInfo && (
                          <div className="form-group-modern compact full-width">
                            <label>Descripción</label>
                            <textarea rows="2" value={hotspot.description || ""} onChange={(e) => handleUpdateHotspot(selectedScene, hotspotKey, "description", e.target.value)} />
                          </div>
                        )}

                        {isElement && (
                          <div className="hotspot-attachments-modern">
                            <label className="btn-upload-small">
                              <FaPaperclip /> Adjuntar
                              <input type="file" accept="image/*,application/pdf,video/*" onChange={(e) => handleHotspotAttachmentUpload(selectedScene, hotspotKey, e)} className="project-editor__input-hidden" />
                            </label>
                            <span className="attachment-count">{attachments.length} archivos</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "map" && (
          <div className="tab-pane-modern">
            <div className="map-workspace-modern">
              <div className="map-sidebar-modern">
                <div className="sidebar-section">
                  <h3>Configuración de Zona</h3>
                  <div className="form-group-modern compact full-width">
                    <label>Seleccionar Zona</label>
                    <select
                      value={mapZoneId}
                      onChange={(e) => {
                        setMapZoneId(e.target.value);
                        setMapPlacingMode(false);
                        setMapSelectedSceneKey("");
                      }}
                    >
                      <option value="">Selecciona una zona...</option>
                      {(project.experiences || []).map((z) => (
                        <option key={z.id} value={z.id}>{z.name || z.id}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="sidebar-actions">
                    <label className={`btn-sidebar-action ${!mapZoneId ? "disabled" : ""}`}>
                      <FaUpload /> {mapZoneId && getMapForZone(mapZoneId) ? "Cambiar Plano" : "Subir Plano"}
                      <input type="file" accept="image/*" onChange={(e) => mapZoneId && handleMapUploadForZone(mapZoneId, e)} disabled={!mapZoneId} className="project-editor__input-hidden" />
                    </label>
                    <button className="btn-sidebar-action danger" disabled={!mapZoneId || !getMapForZone(mapZoneId)} onClick={() => mapZoneId && handleRemoveMapForZone(mapZoneId)}>
                      <FaTrash /> Quitar Plano
                    </button>
                  </div>
                </div>

                <div className="sidebar-section">
                  <h3>Ubicación de Escenas</h3>
                  <div className="form-group-modern compact full-width">
                    <label>Seleccionar Escena</label>
                    <select value={mapSelectedSceneKey} onChange={(e) => setMapSelectedSceneKey(e.target.value)}>
                      <option value="">Selecciona una escena...</option>
                      {Object.entries(project.scenes || {}).map(([sceneKey, sc]) => {
                        const placed = mapZoneId ? isScenePlacedOnZone(sceneKey, mapZoneId) : false;
                        return (
                          <option key={sceneKey} value={sceneKey}>{sc.title || sceneKey} {placed ? "✓" : ""}</option>
                        );
                      })}
                    </select>
                  </div>
                  
                  <div className="sidebar-actions">
                    {!mapPlacingMode ? (
                      <button className="btn-sidebar-action primary" onClick={handleStartPlacing}>
                        <FaMapMarkerAlt /> Ubicar en Plano
                      </button>
                    ) : (
                      <button className="btn-sidebar-action warning" onClick={handleStopPlacing}>
                        <FaTimes /> Cancelar
                      </button>
                    )}
                    {mapSelectedSceneKey && (
                      <button className="btn-sidebar-action" onClick={() => { handleClearSceneMap(mapSelectedSceneKey); setMapPlacingMode(false); }}>
                        Quitar Pin
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="map-canvas-container-modern">
                {!mapZoneId ? (
                  <div className="map-empty-state">
                    <FaMapMarkerAlt />
                    <p>Selecciona una zona para configurar su plano.</p>
                  </div>
                ) : !getMapForZone(mapZoneId) ? (
                  <div className="map-empty-state">
                    <FaImage />
                    <p>Sube el plano base para esta zona.</p>
                  </div>
                ) : (
                  <div className="map-viewer-modern" ref={mapPlanContainerRef} onClick={handlePlanClickPlaceScene}>
                    <div className="map-controls-modern">
                      <button>+</button><button>-</button><button>⟳</button>
                    </div>
                    <div className="map-image-wrapper-modern">
                      <img 
                        ref={mapImageRef} 
                        src={getMapForZone(mapZoneId)} 
                        alt="Plano" 
                        draggable={false} 
                        onLoad={() => requestAnimationFrame(() => {
                          const container = mapPlanContainerRef.current;
                          const img = mapImageRef.current;
                          if (!container || !img) return;
                          const containerRect = container.getBoundingClientRect();
                          const imgRect = img.getBoundingClientRect();
                        })} 
                      />
                      {scenesForZone.map(([sceneKey, sc]) => {
                        const m = sc?.map;
                        if (!m || m.top === "" || m.left === undefined) return null;
                        const isSelected = mapSelectedSceneKey === sceneKey;
                        const leftPx = mapImageRect.left + (Number(m.left) / 100) * mapImageRect.width;
                        const topPx = mapImageRect.top + (Number(m.top) / 100) * mapImageRect.height;

                        return (
                          <div
                            key={sceneKey}
                            className={`map-pin-modern ${isSelected ? 'active' : ''}`}
                            style={{ top: `${topPx}px`, left: `${leftPx}px` }}
                            onClick={(ev) => { ev.stopPropagation(); setMapSelectedSceneKey(sceneKey); setMapPlacingMode(false); }}
                            title={sc.title}
                          >
                            <div className="pin-dot"></div>
                            <div className="pin-label">{sc.title || sceneKey}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>

      {showCreateZoneModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal project-editor__modal-zone" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear Nueva Zona</h2>
            </div>
            <div className="modal-body">
              <div className="form-group-modern">
                <label>Nombre de la Zona</label>
                <input
                  type="text"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="Ej. Cuarto de Máquinas"
                  className="project-editor__zone-input-name"
                  autoFocus
                />
              </div>
              <div className="form-group-modern project-editor__zone-input-wrap">
                <label>Subir Escenas (Opcional)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setNewZoneFiles(Array.from(e.target.files))}
                  className="project-editor__zone-input-files"
                />
                {newZoneFiles.length > 0 && (
                  <p className="project-editor__zone-files-count">
                    {newZoneFiles.length} imagen(es) seleccionada(s)
                  </p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={handleCloseCreateZone}>
                Cancelar
              </button>
              <button className="modal-btn confirm success" onClick={handleCreateZoneSubmit}>
                Crear y Subir
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={modal.isOpen}
        onClose={handleCloseModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        requiresConfirmation={modal.requiresConfirmation}
        confirmationText={modal.confirmationText}
        showCancelButton={modal.showCancelButton !== false}
      />

      {visualEditorSceneKey && project?.scenes?.[visualEditorSceneKey] && (
        <div className="project-editor__visual-editor-wrap">
          <HotspotVisualEditor
            projectId={projectId}
            sceneKey={visualEditorSceneKey}
            scene={project.scenes[visualEditorSceneKey]}
            allScenes={project.scenes || {}}
            onClose={() => setVisualEditorSceneKey(null)}
            onSave={handleVisualEditorSave}
          />
        </div>
      )}
    </div>
  );
}


