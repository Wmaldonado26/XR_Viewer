const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/features/projects/ProjectEditor.js');
let content = fs.readFileSync(filePath, 'utf8');

const splitMarker = '  if (!project) return <div className="loading">Cargando proyecto...</div>;';
const parts = content.split(splitMarker);

if (parts.length !== 2) {
    console.error('Could not find split marker!');
    process.exit(1);
}

const injectedCode = `
  const [isUploadingMultiple, setIsUploadingMultiple] = useState(false);

  const handleMultipleImagesUpload = async (zoneId, zoneName, event) => {
    const files = Array.from(event.target.files);
    if (!files || files.length === 0) return;

    setIsUploadingMultiple(true);

    try {
      // Find current scenes in this zone to determine start index
      const existingScenes = Object.values(project.scenes || {}).filter(s => s.zoneId === zoneId);
      let startIndex = existingScenes.length;
      
      const newScenesToAdd = {};

      // Sequential upload logic for multiple files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const sceneIndex = startIndex + i + 1;
        const sceneTitle = \`\${zoneName}_\${sceneIndex}\`;
        const sceneKey = \`scene_\${Date.now()}_\${i}\`;

        try {
          // Utilizar la función existente uploadImageToBackend
          const data = await uploadImageToBackend({
            file,
            type: \`scene_\${sceneKey}\`,
          });
          const urlWithTimestamp = \`\${data.url}?t=\${Date.now()}\`;

          newScenesToAdd[sceneKey] = {
            title: sceneTitle,
            image: urlWithTimestamp,
            pitch: 0,
            yaw: 0,
            hotSpots: {},
            zoneId: zoneId
          };
        } catch (error) {
          console.error("Error al subir archivo", file.name, error);
        }
      }

      // Append new scenes to state
      setProject(prev => ({
        ...prev,
        scenes: {
          ...(prev.scenes || {}),
          ...newScenesToAdd
        }
      }));
      setHasChanges(true);
    } catch (error) {
      console.error("Error global en subida multiple", error);
    } finally {
      setIsUploadingMultiple(false);
      event.target.value = "";
    }
  };

  if (!project) return <div className="loading">Cargando proyecto...</div>;

  const totalHotspots = Object.values(project.scenes || {}).reduce((acc, sc) => acc + Object.keys(sc.hotSpots || {}).length, 0);
  const totalMapas = Object.keys(project.settings?.mapByZone || {}).length;
  const scenesCount = Object.keys(project.scenes || {}).length;
  
  // Agrupar escenas por zona para la pestaña Zonas y Escenas
  const scenesByZone = {};
  const unassignedScenes = [];
  
  Object.entries(project.scenes || {}).forEach(([sceneKey, scene]) => {
    if (scene.zoneId) {
      if (!scenesByZone[scene.zoneId]) scenesByZone[scene.zoneId] = [];
      scenesByZone[scene.zoneId].push({ sceneKey, scene });
    } else {
      unassignedScenes.push({ sceneKey, scene });
    }
  });

  return (
    <div className="project-editor modern-editor">
      {/* HEADER PREMIUM */}
      <div className="editor-header-modern">
        <div className="header-left-modern">
          <button className="btn-back-modern" onClick={handleClose} title="Volver">
            ← Volver
          </button>
          <div className="header-title-group">
            <h1>{project.name}</h1>
            <span className={\`status-badge \${project.status}\`}>
              {project.status === 'active' ? 'Activo' : project.status === 'draft' ? 'Borrador' : 'Archivado'}
            </span>
          </div>
        </div>
        <div className="header-center-modern">
          <span className="save-notice">Todos los cambios se guardan manualmente</span>
          {hasChanges && <span className="unsaved-dot"></span>}
        </div>
        <div className="header-actions-modern">
          <button
            className="btn-reload-modern"
            onClick={() => window.location.reload()}
            title="Recargar"
          >
            Recargar
          </button>
          <button
            className="btn-save-modern"
            onClick={handleSave}
            disabled={!hasChanges}
          >
            <FaSave /> Guardar cambios
          </button>
        </div>
      </div>

      {/* DASHBOARD TABS */}
      <div className="editor-tabs-modern">
        <button
          className={\`tab-modern \${activeTab === "basic" ? "active" : ""}\`}
          onClick={() => setActiveTab("basic")}
        >
          <div className="tab-content">
            <span className="tab-icon"><FaInfoCircle /></span>
            <span className="tab-label">Información</span>
          </div>
        </button>
        <button
          className={\`tab-modern \${activeTab === "scenes" || activeTab === "experiences" ? "active" : ""}\`}
          onClick={() => setActiveTab("scenes")}
        >
          <div className="tab-content">
            <span className="tab-icon"><FaImage /></span>
            <span className="tab-label">Zonas y Escenas</span>
            <span className="tab-badge">{scenesCount}</span>
          </div>
        </button>
        <button
          className={\`tab-modern \${activeTab === "hotspots" ? "active" : ""}\`}
          onClick={() => setActiveTab("hotspots")}
        >
          <div className="tab-content">
            <span className="tab-icon"><FaMapMarkerAlt /></span>
            <span className="tab-label">Hotspots</span>
            <span className="tab-badge">{totalHotspots}</span>
          </div>
        </button>
        <button
          className={\`tab-modern \${activeTab === "map" ? "active" : ""}\`}
          onClick={() => setActiveTab("map")}
        >
          <div className="tab-content">
            <span className="tab-icon"><FaMapMarkerAlt /></span>
            <span className="tab-label">Mapas GIS</span>
            <span className="tab-badge">{totalMapas}</span>
          </div>
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="editor-content-modern" ref={contentRef}>
        
        {/* BASIC TAB */}
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
                    <input type="file" accept="image/*" onChange={handleThumbnailUpload} style={{ display: "none" }} />
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
                  <label className={\`btn-upload-modern \${(project.gallery || []).length >= 4 ? "disabled" : ""}\`}>
                    <FaPlus /> Agregar foto
                    <input type="file" accept="image/*" onChange={handleGalleryUpload} disabled={(project.gallery || []).length >= 4} style={{ display: "none" }} />
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
                    <input type="file" accept=".pdf,image/*" onChange={handleDocumentUpload} style={{ display: "none" }} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ZONAS Y ESCENAS TAB (Unified) */}
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
              <div style={{ padding: '1rem', background: '#dbeafe', color: '#1e3a8a', borderRadius: '8px', marginBottom: '1rem', fontWeight: 'bold' }}>
                Subiendo imágenes, por favor espera...
              </div>
            )}

            {/* Iterar sobre las Zonas creadas */}
            {(project.experiences || []).map((zone, index) => (
              <div key={zone.id} className="zone-group-modern">
                <div className="zone-group-header">
                  <div className="zone-group-title">
                    <FaShip style={{color: '#0033a0'}} />
                    <input 
                      type="text" 
                      value={zone.name || ""} 
                      onChange={(e) => handleUpdateExperience(index, "name", e.target.value)}
                      style={{ border: 'none', background: 'transparent', fontSize: '1.1rem', fontWeight: '700', outline: 'none', color: '#0f172a', borderBottom: '1px dashed #cbd5e1' }}
                      placeholder="Nombre de la Zona (ej. Popa)"
                    />
                    <span className="zone-group-badge">
                      {(scenesByZone[zone.id] || []).length} escenas
                    </span>
                  </div>
                  <div className="zone-group-actions">
                    <label className="btn-upload-multiple">
                      <FaUpload /> Subir múltiples panoramas
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple
                        onChange={(e) => handleMultipleImagesUpload(zone.id, zone.name || 'Zona', e)} 
                        style={{ display: "none" }} 
                      />
                    </label>
                    <button className="btn-action-icon danger" onClick={() => handleDeleteExperience(index)} title="Eliminar Zona">
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="zone-scenes-grid">
                  {(scenesByZone[zone.id] || []).length === 0 ? (
                    <p style={{ color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                      No hay escenas en esta zona. Usa el botón superior para subir fotos.
                    </p>
                  ) : (
                    (scenesByZone[zone.id] || []).map(({sceneKey, scene}) => (
                      <div key={sceneKey} className="scene-card-modern">
                        <div className="scene-card-image">
                          <div className="scene-badge-360">360°</div>
                          {scene.image ? (
                            <img src={scene.image} alt={scene.title} />
                          ) : (
                            <div className="scene-no-image"><FaImage /><span>Sin imagen</span></div>
                          )}
                          <label className="scene-upload-overlay">
                            <FaUpload /> Cambiar
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(sceneKey, e)} style={{ display: "none" }} />
                          </label>
                        </div>
                        <div className="scene-card-content">
                          <div className="form-group-modern compact full-width">
                            <label>Nombre de Escena</label>
                            <input type="text" value={scene.title || ""} onChange={(e) => handleUpdateScene(sceneKey, "title", e.target.value)} />
                          </div>
                        </div>
                        <div className="scene-card-footer">
                          <button className="btn-scene-action primary" onClick={() => navigate(\`/admin/edit/\${projectId}/scene/\${sceneKey}\`)}>
                            <FaMousePointer /> Editor
                          </button>
                          <button className="btn-scene-action secondary" onClick={() => setSelectedScene(sceneKey)}>
                            <FaMapMarkerAlt /> Hotspots
                          </button>
                          <button className="btn-scene-action danger-icon" onClick={() => handleDeleteScene(sceneKey)}>
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}

            {/* Escenas Sin Zona (Antiguas) */}
            {unassignedScenes.length > 0 && (
              <div className="zone-group-modern" style={{ borderColor: '#fca5a5' }}>
                <div className="zone-group-header" style={{ background: '#fef2f2', borderBottomColor: '#fca5a5' }}>
                  <div className="zone-group-title">
                    <FaInfoCircle style={{color: '#ef4444'}} />
                    <h3 style={{color: '#991b1b'}}>Escenas sin Zona (Anteriores)</h3>
                    <span className="zone-group-badge" style={{background: '#fecaca', color: '#991b1b'}}>
                      {unassignedScenes.length} escenas
                    </span>
                  </div>
                  <div className="zone-group-actions">
                    {/* Botón para añadir una escena manual a este grupo */}
                    <button className="btn-upload-multiple" onClick={handleAddScene} style={{borderColor: '#ef4444', color: '#ef4444'}}>
                      <FaPlus /> Añadir escena individual
                    </button>
                  </div>
                </div>
                <div className="zone-scenes-grid">
                  {unassignedScenes.map(({sceneKey, scene}) => (
                    <div key={sceneKey} className="scene-card-modern">
                      <div className="scene-card-image">
                        <div className="scene-badge-360">360°</div>
                        {scene.image ? (
                          <img src={scene.image} alt={scene.title} />
                        ) : (
                          <div className="scene-no-image"><FaImage /><span>Sin imagen</span></div>
                        )}
                        <label className="scene-upload-overlay">
                          <FaUpload /> Cambiar
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(sceneKey, e)} style={{ display: "none" }} />
                        </label>
                      </div>
                      <div className="scene-card-content">
                        <div className="form-group-modern compact full-width">
                          <label>Nombre de Escena</label>
                          <input type="text" value={scene.title || ""} onChange={(e) => handleUpdateScene(sceneKey, "title", e.target.value)} />
                        </div>
                        {/* Selector para mover la escena a una zona */}
                        <div className="form-group-modern compact full-width">
                          <label>Asignar a Zona</label>
                          <select 
                            value="" 
                            onChange={(e) => handleUpdateScene(sceneKey, "zoneId", e.target.value)}
                          >
                            <option value="">Selecciona zona...</option>
                            {(project.experiences || []).map(z => (
                              <option key={z.id} value={z.id}>{z.name || z.id}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="scene-card-footer">
                        <button className="btn-scene-action primary" onClick={() => navigate(\`/admin/edit/\${projectId}/scene/\${sceneKey}\`)}>
                          <FaMousePointer /> Editor
                        </button>
                        <button className="btn-scene-action secondary" onClick={() => setSelectedScene(sceneKey)}>
                          <FaMapMarkerAlt /> Hotspots
                        </button>
                        <button className="btn-scene-action danger-icon" onClick={() => handleDeleteScene(sceneKey)}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* HOTSPOTS TAB */}
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
                          <label>Nombre / Etiqueta</label>
                          <input type="text" value={hotspot.label || hotspot.title || hotspotKey} onChange={(e) => handleUpdateHotspot(selectedScene, hotspotKey, "label", e.target.value)} />
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

                        {/* TYPE SPECIFIC FIELDS */}
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
                              <input type="file" accept="image/*,application/pdf,video/*" onChange={(e) => handleHotspotAttachmentUpload(selectedScene, hotspotKey, e)} style={{ display: "none" }} />
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

        {/* MAP TAB */}
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
                    <label className={\`btn-sidebar-action \${!mapZoneId ? "disabled" : ""}\`}>
                      <FaUpload /> {mapZoneId && getMapForZone(mapZoneId) ? "Cambiar Plano" : "Subir Plano"}
                      <input type="file" accept="image/*" onChange={(e) => mapZoneId && handleMapUploadForZone(mapZoneId, e)} disabled={!mapZoneId} style={{ display: "none" }} />
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
                        onLoad={() => requestAnimationFrame(updateMapImageRect)} 
                      />
                      {scenesForZone.map(([sceneKey, sc]) => {
                        const m = sc?.map;
                        if (!m || m.top === "" || m.left === undefined) return null;
                        const isSelected = mapSelectedSceneKey === sceneKey;
                        
                        const leftPx = mapImageRect.left + (Number(m.top) / 100) * mapImageRect.width;
                        const topPx = mapImageRect.top + ((100 - Number(m.left)) / 100) * mapImageRect.height;

                        return (
                          <div
                            key={sceneKey}
                            className={\`map-pin-modern \${isSelected ? 'active' : ''}\`}
                            style={{ top: \`\${topPx}px\`, left: \`\${leftPx}px\` }}
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
      </div>

      <ConfirmModal
        isOpen={modal.isOpen}
        onClose={() => setModal((m) => ({ ...m, isOpen: false }))}
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
    </div>
  );
};

export default ProjectEditor;
`;

fs.writeFileSync(filePath, parts[0] + injectedCode);
console.log('ProjectEditor.js logic injected successfully!');
