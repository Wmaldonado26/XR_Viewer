// Detecta la URL del backend respetando variables de entorno del proyecto.
const normalizeBaseUrl = (url) => String(url || "").trim().replace(/\/+$/, "");

const envBase = normalizeBaseUrl(process.env.REACT_APP_API_BASE);
const envHost = normalizeBaseUrl(process.env.REACT_APP_API_HOST);

const guessBackendHost = () => {
  if (envBase) {
    return envBase.endsWith("/api") ? envBase.replace(/\/api$/, "") : envBase;
  }

  if (envHost) {
    return envHost;
  }

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:5001`;
};

export const API_HOST = guessBackendHost();
export const API_BASE_URL = envBase
  ? envBase.endsWith("/api")
    ? envBase
    : `${envBase}/api`
  : `${API_HOST}/api`;
