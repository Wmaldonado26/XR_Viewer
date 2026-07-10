// src/helpers/sceneCalibration.js
//
// Calibración de orientación por escena.
// Idea: cada panorama puede estar "girado" respecto a una referencia global (p. ej. Norte/Proa).
// Este offset permite convertir entre:
// - yaw local del viewer (pannellum) para esa escena
// - heading global consistente entre escenas
//
// Convención:
// globalHeadingDeg = localYawDeg + SCENE_YAW_OFFSET_DEG[sceneKey]
// localYawDeg = globalHeadingDeg - SCENE_YAW_OFFSET_DEG[sceneKey]
//
// Ajusta estos valores para alinear todas las escenas a una misma referencia.

export const SCENE_YAW_OFFSET_DEG = {
  // Ejemplos (rellena/ajusta según calibración real):
  // insideOne: 0,
  // insideTwo: 15,
};

const STORAGE_KEY = "sceneYawOffsets";

function safeParseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function getStoredSceneYawOffsets() {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage?.getItem?.(STORAGE_KEY);
  if (!raw) return {};
  const parsed = safeParseJson(raw, {});
  return parsed && typeof parsed === "object" ? parsed : {};
}

export function setStoredSceneYawOffsets(offsets) {
  if (typeof window === "undefined") return;
  window.localStorage?.setItem?.(STORAGE_KEY, JSON.stringify(offsets ?? {}));
}

export function setSceneYawOffsetDeg(sceneKey, offsetDeg) {
  if (!sceneKey) return;
  const numeric = Number(offsetDeg);
  const nextOffset = Number.isFinite(numeric) ? numeric : 0;
  const current = getStoredSceneYawOffsets();
  const next = { ...current, [sceneKey]: nextOffset };
  setStoredSceneYawOffsets(next);
}

export function clearSceneYawOffsetDeg(sceneKey) {
  if (!sceneKey) return;
  const current = getStoredSceneYawOffsets();
  if (!(sceneKey in current)) return;
  const { [sceneKey]: _, ...rest } = current;
  setStoredSceneYawOffsets(rest);
}

export function getEffectiveSceneYawOffsets() {
  return { ...SCENE_YAW_OFFSET_DEG, ...getStoredSceneYawOffsets() };
}

export function getSceneYawOffsetDeg(sceneKey) {
  const stored = getStoredSceneYawOffsets();
  if (sceneKey && Object.prototype.hasOwnProperty.call(stored, sceneKey)) {
    const v = Number(stored[sceneKey]);
    return Number.isFinite(v) ? v : 0;
  }
  return SCENE_YAW_OFFSET_DEG[sceneKey] ?? 0;
}

export function normalizeYawDeg(deg) {
  // Normaliza a [-180, 180)
  let v = deg;
  while (v >= 180) v -= 360;
  while (v < -180) v += 360;
  return v;
}
