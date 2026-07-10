// HotspotVisualEditor.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  FaTimes,
  FaSave,
  FaTrash,
  FaPlus,
  FaEdit,
  FaCrosshairs,
  FaCheck,
  FaPaperclip,
  FaFilePdf,
  FaImage,
} from "react-icons/fa";
import "./HotspotVisualEditor.css";
import { API_BASE_URL } from "../../../api/endpoints";
import authService from "../../../api/services/authService";

const HotspotVisualEditor = ({
  projectId,
  scene,
  sceneKey,
  allScenes,
  onSave,
  onClose,
}) => {
  const viewerRef = useRef(null);
  const pannellumRef = useRef(null);

  const [hotspots, setHotspots] = useState(scene.hotSpots || {});
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [editingHotspot, setEditingHotspot] = useState(null);
  const [placementMode, setPlacementMode] = useState(false);

  const [viewerReady, setViewerReady] = useState(false);

  // =========================
  // UPLOAD CONFIG (igual que ProjectEditor)
  // =========================
  const UPLOAD_URL = `${API_BASE_URL}/upload`;

  // Upload (igual que ProjectEditor)
  const uploadImageToBackend = async ({ file, type }) => {
    if (!projectId) {
      throw new Error("No hay projectId. Cierra y vuelve a abrir el editor.");
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("projectId", projectId);
    formData.append("type", type);

    for (const [k, v] of formData.entries()) {
      console.log("FormData ->", k, v);
    }

    const res = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: formData,
    });

    if (!res.ok) {
      let msg = "No se pudo subir el archivo.";
      try {
        const data = await res.json();
        msg = data?.error || data?.message || msg;
      } catch {}
      throw new Error(msg);
    }

    return await res.json();
  };

  // =========================
  // INIT PANNELLUM
  // =========================
  useEffect(() => {
    if (!viewerRef.current || !scene.image || pannellumRef.current) return;

    const viewer = window.pannellum.viewer(viewerRef.current, {
      type: "equirectangular",
      panorama: scene.image,
      autoLoad: true,
      showControls: false,
      mouseZoom: true,
      draggable: true,
      pitch: scene.pitch || 0,
      yaw: scene.yaw || 0,
      hfov: 100,
    });

    viewer.on("load", () => {
      pannellumRef.current = viewer;
      setViewerReady(true);
      console.log("✅ Pannellum cargado y listo");
    });

    return () => {
      if (pannellumRef.current && pannellumRef.current.destroy) {
        pannellumRef.current.destroy();
        pannellumRef.current = null;
      }
    };
  }, [scene.image]);

  // =========================
  // RENDER HOTSPOTS ON VIEWER
  // =========================
  useEffect(() => {
    if (!pannellumRef.current || !viewerReady) return;

    const viewer = pannellumRef.current;

    const renderHotspots = () => {
      // limpiar hotspots existentes
      Object.keys(hotspots).forEach((key) => {
        try {
          viewer.removeHotSpot(key);
        } catch (e) {}
      });

      // agregar hotspots
      Object.entries(hotspots).forEach(([key, hotspot]) => {
        try {
          viewer.addHotSpot({
            id: key,
            pitch: hotspot.pitch,
            yaw: hotspot.yaw,
            type: "custom",
            cssClass: `visual-editor-marker ${
              selectedHotspot === key ? "selected" : ""
            }`,
            createTooltipFunc: (hotSpotDiv) => {
              hotSpotDiv.innerHTML = "";
              hotSpotDiv.style.display = "block";
              hotSpotDiv.style.position = "absolute";
              hotSpotDiv.style.transform = "translate(-50%, -50%)";

              hotSpotDiv.classList.add("visual-editor-marker");
              if (selectedHotspot === key) hotSpotDiv.classList.add("selected");

              const container = document.createElement("div");
              container.style.display = "flex";
              container.style.flexDirection = "column";
              container.style.alignItems = "center";
              container.style.pointerEvents = "auto";

              const dot = document.createElement("div");
              dot.className = "marker-dot";
              dot.style.width = "24px";
              dot.style.height = "24px";
              dot.style.backgroundColor =
                selectedHotspot === key ? "#f59e0b" : "#3b82f6";
              dot.style.border = "3px solid white";
              dot.style.borderRadius = "50%";
              dot.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
              dot.style.cursor = "pointer";
              dot.style.transition = "all 0.2s";
              container.appendChild(dot);

              const label = document.createElement("div");
              label.className = "marker-label";
              label.textContent = hotspot.label || hotspot.title || "Hotspot";
              label.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
              label.style.color = "white";
              label.style.padding = "6px 10px";
              label.style.borderRadius = "6px";
              label.style.fontSize = "12px";
              label.style.fontWeight = "600";
              label.style.whiteSpace = "nowrap";
              label.style.marginTop = "8px";
              label.style.textAlign = "center";
              label.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
              container.appendChild(label);

              hotSpotDiv.appendChild(container);

              hotSpotDiv.onclick = (e) => {
                e.stopPropagation();
                handleSelectHotspot(key);
              };
            },
          });
        } catch (e) {
          console.error("❌ Error adding hotspot:", key, e);
        }
      });
    };

    renderHotspots();
    const t = setTimeout(renderHotspots, 100);
    return () => clearTimeout(t);
  }, [hotspots, selectedHotspot, viewerReady]);

  // =========================
  // PLACEMENT MODE CLICK
  // =========================
  useEffect(() => {
    if (!viewerRef.current) return;
    const container = viewerRef.current;

    const handleClick = (event) => {
      if (!placementMode || !pannellumRef.current) return;

      // no colocar si clic en sidebar o controles
      if (
        event.target.closest(".hotspot-sidebar") ||
        event.target.closest(".visual-editor-controls")
      ) {
        return;
      }

      const coords = pannellumRef.current.mouseEventToCoords(event);
      if (!coords) return;

      const hotspotKey = `hotspot_${Date.now()}`;

      // ✅ estructura completa
      const newHotspot = {
        type: "custom",
        pitch: coords[0],
        yaw: coords[1],

        // 3 tipos: moveScene | hotSpotElement | infoHotspot
        cssClass: "moveScene",

        // navegación
        scene: "",

        // texto general (siempre)
        label: "Nuevo Hotspot",

        // info / element
        title: "",
        description: "",

        // element
        attachments: [],
      };

      setHotspots((prev) => ({
        ...prev,
        [hotspotKey]: newHotspot,
      }));

      setSelectedHotspot(hotspotKey);
      setEditingHotspot(hotspotKey);
      setPlacementMode(false);
    };

    if (placementMode) {
      container.addEventListener("click", handleClick);
      container.style.cursor = "crosshair";
    } else {
      container.style.cursor = "grab";
    }

    return () => container.removeEventListener("click", handleClick);
  }, [placementMode]);

  // =========================
  // HELPERS
  // =========================
  const handleSelectHotspot = (key) => {
    setSelectedHotspot(key);
    setEditingHotspot(key);

    if (pannellumRef.current && hotspots[key]) {
      pannellumRef.current.setPitch(hotspots[key].pitch);
      pannellumRef.current.setYaw(hotspots[key].yaw);
    }
  };

  const handleDeleteHotspot = (key) => {
    const hotspotLabel = hotspots[key]?.label || hotspots[key]?.title || key;

    const ok = window.confirm(
      `¿Eliminar hotspot?\n\nVas a eliminar "${hotspotLabel}". Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    setHotspots((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    if (selectedHotspot === key) {
      setSelectedHotspot(null);
      setEditingHotspot(null);
    }
  };

  const handleUpdateHotspot = (key, field, value) => {
    setHotspots((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    const updatedScene = {
      ...scene,
      hotSpots: hotspots,
    };
    onSave(updatedScene);
  };

  // =========================
  // ATTACHMENTS (UPLOAD MODE) ✅ IGUAL QUE ProjectEditor
  // =========================
  const handleHotspotAttachmentUpload = async (hotspotKey, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await uploadImageToBackend({
        file,
        type: `hotspot_${sceneKey}_${hotspotKey}`,
      });
      // Agregar timestamp para evitar caché del navegador
      const urlWithTimestamp = `${data.url}?t=${Date.now()}`;

      const newAtt = {
        url: urlWithTimestamp,
        filename: data.filename,
        originalName: data.originalName || file.name,
        mimetype: data.mimetype || file.type,
        size: data.size || file.size,
        folder: "Adjuntos",
      };

      setHotspots((prev) => {
        const hs = prev?.[hotspotKey] || {};
        const current = Array.isArray(hs.attachments) ? hs.attachments : [];
        return {
          ...prev,
          [hotspotKey]: {
            ...hs,
            attachments: [...current, newAtt],
          },
        };
      });
    } catch (error) {
      console.error("Error uploading hotspot attachment:", error);
      alert(error.message || "No se pudo subir el adjunto.");
    } finally {
      event.target.value = "";
    }
  };

  const handleRemoveHotspotAttachment = (hotspotKey, index) => {
    setHotspots((prev) => {
      const hs = prev?.[hotspotKey] || {};
      const current = Array.isArray(hs.attachments) ? hs.attachments : [];
      const next = current.filter((_, i) => i !== index);
      return {
        ...prev,
        [hotspotKey]: {
          ...hs,
          attachments: next,
        },
      };
    });
  };

  const handleUpdateHotspotAttachmentFolder = (hotspotKey, index, folder) => {
    setHotspots((prev) => {
      const hs = prev?.[hotspotKey] || {};
      const current = Array.isArray(hs.attachments) ? hs.attachments : [];
      const next = current.map((a, i) => (i === index ? { ...a, folder } : a));
      return {
        ...prev,
        [hotspotKey]: {
          ...hs,
          attachments: next,
        },
      };
    });
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="hotspot-visual-editor">
      {/* Help Banner */}
      <div className="visual-editor-help-banner">
        <div className="help-content">
          <strong>💡 Cómo usar el editor:</strong>
          <ul>
            <li>
              <strong>Agregar hotspot:</strong> Haz clic en "Agregar Hotspot" y
              luego en la imagen donde quieres colocarlo
            </li>
            <li>
              <strong>Mover vista:</strong> Arrastra la imagen 360° para navegar
            </li>
            <li>
              <strong>Editar hotspot:</strong> Haz clic en el ícono de edición
              en la lista lateral
            </li>
            <li>
              <strong>Pitch/Yaw:</strong> Coordenadas automáticas de posición
              (vertical/horizontal)
            </li>
          </ul>
        </div>
      </div>

      {/* Placement Mode Banner */}
      {placementMode && (
        <div className="placement-mode-banner">
          <FaCrosshairs />
          <span>Haz clic en la imagen para colocar el hotspot</span>
          <button
            className="btn-cancel-placement"
            onClick={() => setPlacementMode(false)}
          >
            <FaTimes /> Cancelar
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="visual-editor-controls">
        <div className="controls-left">
          <h2>Editor Visual</h2>
          <span className="scene-name">{scene.title || sceneKey}</span>
        </div>

        <div className="controls-center">
          <button
            className={`btn-add-hotspot ${placementMode ? "active" : ""}`}
            onClick={() => setPlacementMode(true)}
            disabled={placementMode}
          >
            <FaPlus />{" "}
            {placementMode ? "Selecciona ubicación" : "Agregar Hotspot"}
          </button>
        </div>

        <div className="controls-right">
          <button className="btn-save" onClick={handleSave}>
            <FaSave /> Guardar
          </button>
          <button className="btn-close" onClick={onClose}>
            <FaTimes /> Cerrar
          </button>
        </div>
      </div>

      {/* Viewer */}
      <div className="viewer-container">
        <div ref={viewerRef} className="pannellum-viewer" />
      </div>

      {/* Sidebar */}
      <div className="hotspot-sidebar">
        <div className="sidebar-header">
          <h3>Hotspots ({Object.keys(hotspots).length})</h3>
        </div>

        <div className="hotspot-list">
          {Object.entries(hotspots).map(([key, hotspot]) => {
            const isNav = hotspot.cssClass === "moveScene";
            const isInfo = hotspot.cssClass === "infoHotspot";
            const isElement = hotspot.cssClass === "hotSpotElement";
            const attachments = Array.isArray(hotspot.attachments)
              ? hotspot.attachments
              : [];

            return (
              <div
                key={key}
                className={`hotspot-list-item ${
                  selectedHotspot === key ? "selected" : ""
                }`}
              >
                <div
                  className="item-header"
                  onClick={() => handleSelectHotspot(key)}
                  style={{ cursor: "pointer" }}
                >
                  <span className="item-label">
                    {hotspot.label || hotspot.title || "Sin etiqueta"}
                  </span>

                  <div
                    className="item-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="btn-edit-inline"
                      onClick={() =>
                        setEditingHotspot(editingHotspot === key ? null : key)
                      }
                      title="Editar"
                    >
                      <FaEdit />
                    </button>

                    <button
                      className="btn-delete-inline"
                      onClick={() => handleDeleteHotspot(key)}
                      title="Eliminar"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {editingHotspot === key && (
                  <div className="item-editor">
                    {/* Label general */}
                    <div className="form-group">
                      <label>Etiqueta</label>
                      <input
                        type="text"
                        value={hotspot.label || ""}
                        onChange={(e) =>
                          handleUpdateHotspot(key, "label", e.target.value)
                        }
                        placeholder="Texto del hotspot"
                      />
                    </div>

                    {/* Tipo */}
                    <div className="form-group">
                      <label>Tipo</label>
                      <select
                        value={hotspot.cssClass || "moveScene"}
                        onChange={(e) => {
                          const newCss = e.target.value;
                          handleUpdateHotspot(key, "cssClass", newCss);

                          if (newCss === "hotSpotElement") {
                            const current = Array.isArray(hotspot.attachments)
                              ? hotspot.attachments
                              : [];
                            if (!Array.isArray(hotspot.attachments)) {
                              handleUpdateHotspot(key, "attachments", current);
                            }
                          }
                        }}
                      >
                        <option value="moveScene">Navegación</option>
                        <option value="hotSpotElement">
                          Elemento (anexos)
                        </option>
                        <option value="infoHotspot">Información (texto)</option>
                      </select>
                    </div>

                    {/* NAV */}
                    {isNav && (
                      <div className="form-group">
                        <label>Escena Destino</label>
                        <select
                          value={hotspot.scene || ""}
                          onChange={(e) =>
                            handleUpdateHotspot(key, "scene", e.target.value)
                          }
                        >
                          <option value="">Seleccionar...</option>
                          {Object.entries(allScenes).map(([sk, sc]) => (
                            <option key={sk} value={sk}>
                              {sc.title || sk}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* INFO */}
                    {isInfo && (
                      <>
                        <div className="form-group">
                          <label>Título (Info)</label>
                          <input
                            type="text"
                            value={hotspot.title || ""}
                            onChange={(e) =>
                              handleUpdateHotspot(key, "title", e.target.value)
                            }
                            placeholder="Ej: Información del área..."
                          />
                        </div>

                        <div className="form-group">
                          <label>Descripción (Info)</label>
                          <textarea
                            value={hotspot.description || ""}
                            onChange={(e) =>
                              handleUpdateHotspot(
                                key,
                                "description",
                                e.target.value
                              )
                            }
                            rows={4}
                            placeholder="Describe la información a mostrar..."
                          />
                        </div>
                      </>
                    )}

                    {/* ELEMENT */}
                    {isElement && (
                      <>
                        <div className="form-group">
                          <label>Título (Elemento)</label>
                          <input
                            type="text"
                            value={hotspot.title || ""}
                            onChange={(e) =>
                              handleUpdateHotspot(key, "title", e.target.value)
                            }
                            placeholder="Ej: Manuales / Planos / Evidencias..."
                          />
                        </div>

                        <div className="form-group">
                          <label>
                            Anexos (PDF / Imagen / Video)
                            <span
                              className="tooltip-hint"
                              title="Estos archivos se mostrarán en una modal tipo árbol."
                              style={{ marginLeft: 6 }}
                            >
                              ⓘ
                            </span>
                          </label>

                          <label
                            className="btn-upload-thumbnail"
                            style={{ width: "fit-content" }}
                          >
                            <FaPaperclip /> Subir anexo
                            <input
                              type="file"
                              accept="image/*,application/pdf,video/*"
                              onChange={(e) =>
                                handleHotspotAttachmentUpload(key, e)
                              }
                              style={{ display: "none" }}
                            />
                          </label>

                          {attachments.length > 0 && (
                            <div className="attachments-list">
                              {attachments.map((att, idx) => {
                                const isPdf =
                                  String(att.mimetype || "").includes("pdf") ||
                                  String(att.originalName || "")
                                    .toLowerCase()
                                    .endsWith(".pdf");

                                return (
                                  <div
                                    key={`${att.url}_${idx}`}
                                    className="attachment-card"
                                  >
                                    <div className="attachment-top">
                                      <div className="attachment-meta">
                                        <span className="attachment-icon">
                                          {isPdf ? <FaFilePdf /> : <FaImage />}
                                        </span>

                                        <div className="attachment-text">
                                          <div className="attachment-name">
                                            {att.originalName ||
                                              att.filename ||
                                              "Adjunto"}
                                          </div>
                                          <div className="attachment-sub">
                                            {att.mimetype || "archivo"}
                                            {att.size
                                              ? ` · ${Math.round(
                                                  att.size / 1024
                                                )} KB`
                                              : ""}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="attachment-actions">
                                        <a
                                          href={att.url}
                                          target="_blank"
                                          rel="noreferrer"
                                        >
                                          Ver
                                        </a>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleRemoveHotspotAttachment(
                                              key,
                                              idx
                                            )
                                          }
                                        >
                                          Quitar
                                        </button>
                                      </div>
                                    </div>

                                    <div className="attachment-folder">
                                      <label>
                                        Carpeta (para el árbol). Ej:
                                        Motor/Manuales
                                      </label>
                                      <input
                                        type="text"
                                        value={att.folder || ""} // 👈 importante: que sea controlado
                                        onChange={(e) =>
                                          handleUpdateHotspotAttachmentFolder(
                                            key,
                                            idx,
                                            e.target.value
                                          )
                                        }
                                        placeholder="Adjuntos"
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Pitch/Yaw */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>
                          Pitch (Vertical)
                          <span
                            className="tooltip-hint"
                            title="Ángulo vertical: -90° (abajo) a +90° (arriba)"
                          >
                            ⓘ
                          </span>
                        </label>
                        <input
                          type="number"
                          value={hotspot.pitch}
                          onChange={(e) =>
                            handleUpdateHotspot(
                              key,
                              "pitch",
                              parseFloat(e.target.value)
                            )
                          }
                          step="0.1"
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Yaw (Horizontal)
                          <span
                            className="tooltip-hint"
                            title="Ángulo horizontal: -180° a +180°"
                          >
                            ⓘ
                          </span>
                        </label>
                        <input
                          type="number"
                          value={hotspot.yaw}
                          onChange={(e) =>
                            handleUpdateHotspot(
                              key,
                              "yaw",
                              parseFloat(e.target.value)
                            )
                          }
                          step="0.1"
                        />
                      </div>
                    </div>

                    <button
                      className="btn-done-editing"
                      onClick={() => setEditingHotspot(null)}
                    >
                      <FaCheck /> Listo
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {Object.keys(hotspots).length === 0 && (
            <div className="empty-state">
              <FaCrosshairs size={48} />
              <p>No hay hotspots</p>
              <button
                className="btn-add-first"
                onClick={() => setPlacementMode(true)}
              >
                <FaPlus /> Agregar el primero
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotspotVisualEditor;
