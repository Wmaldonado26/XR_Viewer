import React, { useEffect, useMemo, useState } from "react";
import { Pannellum } from "pannellum-react";
import { FaTimes, FaCopy, FaUndo } from "react-icons/fa";
import dataScene from "../../../helpers/dataScene";
import {
  clearSceneYawOffsetDeg,
  getEffectiveSceneYawOffsets,
  getSceneYawOffsetDeg,
  getStoredSceneYawOffsets,
  normalizeYawDeg,
  setSceneYawOffsetDeg,
} from "../../../helpers/sceneCalibration";
import "./SceneCalibrationTool.css";

const STEP_SMALL = 1;
const STEP_MEDIUM = 5;
const STEP_LARGE = 15;

export default function SceneCalibrationTool({ onClose }) {
  const sceneKeys = useMemo(() => Object.keys(dataScene), []);
  const [sceneKey, setSceneKey] = useState(sceneKeys[0] ?? "insideOne");
  const [pannellumRef, setPannellumRef] = useState(null);

  const [yawLocal, setYawLocal] = useState(0);
  const [pitchLocal, setPitchLocal] = useState(0);
  const [hfov, setHfov] = useState(140);

  const [offsetDeg, setOffsetDeg] = useState(() => getSceneYawOffsetDeg(sceneKey));

  const scene = dataScene[sceneKey];

  useEffect(() => {
    setOffsetDeg(getSceneYawOffsetDeg(sceneKey));
  }, [sceneKey]);

  useEffect(() => {
    let raf = null;

    const tick = () => {
      try {
        const viewer = pannellumRef?.getViewer?.();
        if (viewer) {
          if (typeof viewer.getYaw === "function") setYawLocal(viewer.getYaw());
          if (typeof viewer.getPitch === "function") setPitchLocal(viewer.getPitch());
          if (typeof viewer.getHfov === "function") setHfov(viewer.getHfov());
        }
      } catch {
        // ignore
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pannellumRef]);

  const headingGlobal = useMemo(
    () => normalizeYawDeg((Number(yawLocal) || 0) + (Number(offsetDeg) || 0)),
    [yawLocal, offsetDeg]
  );

  const applyOffsetDelta = (delta) => {
    const next = normalizeYawDeg((Number(offsetDeg) || 0) + delta);
    setOffsetDeg(next);
    setSceneYawOffsetDeg(sceneKey, next);
  };

  const handleOffsetInput = (e) => {
    const v = Number(e.target.value);
    const next = Number.isFinite(v) ? v : 0;
    setOffsetDeg(next);
    setSceneYawOffsetDeg(sceneKey, next);
  };

  const handleResetScene = () => {
    clearSceneYawOffsetDeg(sceneKey);
    setOffsetDeg(getSceneYawOffsetDeg(sceneKey));
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback silencioso
    }
  };

  const copyStoredOnly = () => {
    const stored = getStoredSceneYawOffsets();
    copyToClipboard(JSON.stringify(stored, null, 2));
  };

  const copyAsCode = () => {
    const all = getEffectiveSceneYawOffsets();
    const snippet = `export const SCENE_YAW_OFFSET_DEG = ${JSON.stringify(all, null, 2)};\n`;
    copyToClipboard(snippet);
  };

  if (!scene) return null;

  return (
    <div className="calibration-root">
      <div className="calibration-topbar">
        <div className="calibration-title">Calibración de orientación (admin)</div>
        <button className="calibration-close" onClick={onClose} title="Cerrar">
          <FaTimes />
        </button>
      </div>

      <div className="calibration-body">
        <div className="calibration-panel">
          <div className="calibration-row">
            <label className="calibration-label">Escena</label>
            <select
              className="calibration-select"
              value={sceneKey}
              onChange={(e) => setSceneKey(e.target.value)}
            >
              {sceneKeys.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div className="calibration-hint">
            1) Pon el viewer mirando “arriba del plano”. 2) Ajusta el offset hasta que el minimapa quede alineado.
          </div>

          <div className="calibration-metrics">
            <div><span>yaw local:</span> {Number(yawLocal).toFixed(2)}°</div>
            <div><span>pitch:</span> {Number(pitchLocal).toFixed(2)}°</div>
            <div><span>hfov:</span> {Number(hfov).toFixed(0)}°</div>
            <div><span>offset escena:</span> {Number(offsetDeg).toFixed(0)}°</div>
            <div><span>heading global:</span> {Number(headingGlobal).toFixed(2)}°</div>
          </div>

          <div className="calibration-row">
            <label className="calibration-label">Offset (°)</label>
            <input
              className="calibration-input"
              type="number"
              value={Number(offsetDeg)}
              onChange={handleOffsetInput}
              step={1}
            />
          </div>

          <div className="calibration-buttons">
            <button className="calibration-btn" onClick={() => applyOffsetDelta(-STEP_LARGE)}>-{STEP_LARGE}</button>
            <button className="calibration-btn" onClick={() => applyOffsetDelta(-STEP_MEDIUM)}>-{STEP_MEDIUM}</button>
            <button className="calibration-btn" onClick={() => applyOffsetDelta(-STEP_SMALL)}>-{STEP_SMALL}</button>
            <button className="calibration-btn" onClick={() => applyOffsetDelta(STEP_SMALL)}>+{STEP_SMALL}</button>
            <button className="calibration-btn" onClick={() => applyOffsetDelta(STEP_MEDIUM)}>+{STEP_MEDIUM}</button>
            <button className="calibration-btn" onClick={() => applyOffsetDelta(STEP_LARGE)}>+{STEP_LARGE}</button>
          </div>

          <div className="calibration-actions">
            <button className="calibration-btn secondary" onClick={handleResetScene} title="Quitar override de esta escena">
              <FaUndo /> Reset escena
            </button>
            <button className="calibration-btn secondary" onClick={copyStoredOnly} title="Copia solo los offsets que ajustaste en este navegador">
              <FaCopy /> Copiar JSON (calibrados)
            </button>
            <button className="calibration-btn secondary" onClick={copyAsCode} title="Copia un snippet listo para pegar en sceneCalibration.js">
              <FaCopy /> Copiar como código
            </button>
          </div>

          <div className="calibration-footnote">
            Persistencia: se guarda en localStorage (solo este navegador). Para dejarlo fijo en el repo, pega el snippet en src/helpers/sceneCalibration.js.
          </div>
        </div>

        <div className="calibration-viewer">
          <Pannellum
            width={"100%"}
            height={"100%"}
            image={scene.image}
            pitch={scene.pitch}
            yaw={scene.yaw}
            hfov={140}
            autoLoad
            showFullscreenCtrl={false}
            showZoomCtrl={false}
            compass={false}
            mouseZoom={true}
            doubleClickZoom={false}
            dragMode={1}
            ref={setPannellumRef}
          />
        </div>
      </div>
    </div>
  );
}
