// src/services/ProjectService.js
import dataScene from "../helpers/dataScene";
import hotspotContent from "../helpers/hotspotContent";
import { HOTSPOTS_PLAN_V1, HOTSPOTS_PLAN_V2 } from "../data/hotspostData";
import { API_BASE_URL, API_HOST } from "./apiConfig";
import authService from "./AuthService";

const USE_BACKEND = true;

const generateUUID = () => "proj_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

// Proyecto base
const createCurrentProject = () => ({
  id: "arc-independiente-001",
  name: "ARC Independiente",
  description: "Patrullero de Costa - Recorrido virtual completo con 19 escenas 360° interactivas",
  vesselType: "Patrullero de Costa",
  dateCreated: new Date("2024-01-15").toISOString(),
  dateModified: new Date().toISOString(),
  thumbnail: "/images/default_image.png",
  status: "active",
  experiences: [
    { id: "bridge", name: "Puente de Gobierno", icon: "FaShip", startScene: "insideOne", description: "Explora el área de control principal del barco" },
    { id: "engine-room", name: "Cuarto de Máquinas", icon: "FaCog", startScene: "insideFourteen", description: "Descubre el corazón mecánico del barco" },
    { id: "deck", name: "Cubierta Principal", icon: "FaAnchor", startScene: "insideSix", description: "Recorre las áreas de trabajo al aire libre" },
    { id: "bow", name: "Proa", icon: "FaWater", startScene: "insideFour", description: "Explora la parte frontal del barco" },
  ],
  scenes: dataScene,
  hotspotContents: hotspotContent,
  maps: {
    planV1: { name: "Plano Superior", hotspots: HOTSPOTS_PLAN_V1 },
    planV2: { name: "Plano Inferior", hotspots: HOTSPOTS_PLAN_V2 },
  },
  statistics: {
    totalScenes: Object.keys(dataScene).length,
    totalHotspots: 0,
    totalContents: Object.keys(hotspotContent).length,
    totalVisits: 0,
  },
  settings: {
    primaryColor: "#003d82",
    secondaryColor: "#0057b8",
    accentColor: "#3b82f6",
    defaultHfov: 140,
    autoRotate: true,
  },
});

// Si tu BD guardó urls con IP vieja, esto las “rehidrata” al host actual.
const normalizeUploadsUrl = (url) => {
  if (!url || typeof url !== "string") return url;

  let cleanUrl = url;
  if (cleanUrl.includes("?")) {
    const parts = cleanUrl.split("?");
    const base = parts[0];
    const queries = parts.slice(1);
    const tQuery = queries.find(q => q.startsWith("t="));
    cleanUrl = tQuery ? `${base}?${tQuery}` : base;
  }

  // si ya es relativa, la convertimos al host actual
  if (cleanUrl.startsWith("/uploads/")) return `${API_HOST}${cleanUrl}`;

  // si es absoluta y contiene /uploads/, reemplazamos origin por API_HOST
  const idx = cleanUrl.indexOf("/uploads/");
  if (idx !== -1) {
    const path = cleanUrl.substring(idx);
    return `${API_HOST}${path}`;
  }

  return cleanUrl;
};

const normalizeProject = (p) => {
  if (!p) return p;
  const scenes = p.scenes || {};
  const fixedScenes = {};

  Object.entries(scenes).forEach(([k, s]) => {
    fixedScenes[k] = {
      ...s,
      image: normalizeUploadsUrl(s?.image),
    };
  });

  // Normalizar URLs de mapas en mapByZone
  const normalizedMapByZone = {};
  if (p.settings?.mapByZone) {
    Object.entries(p.settings.mapByZone).forEach(([zoneId, zoneData]) => {
      normalizedMapByZone[zoneId] = {
        ...zoneData,
        mapUrl: normalizeUploadsUrl(zoneData?.mapUrl),
      };
    });
  }

  // Normalizar URLs de galería y adjuntos
  const normalizedGallery = (p.gallery || []).map((img) => ({
    ...img,
    src: normalizeUploadsUrl(img.src),
  }));

  const normalizedAttachments = (p.attachments || []).map((att) => ({
    ...att,
    url: normalizeUploadsUrl(att.url),
  }));

  return {
    ...p,
    thumbnail: normalizeUploadsUrl(p.thumbnail),
    scenes: fixedScenes,
    gallery: normalizedGallery,
    attachments: normalizedAttachments,
    settings: {
      ...(p.settings || {}),
      mapByZone: normalizedMapByZone,
    },
  };
};

class ProjectService {
  constructor() {
    this.storageKey = "cotecmar_projects";
    this.activeProjectKey = "cotecmar_active_project_id";
    this.activeProjectObjKey = "cotecmar_active_project_object";
    this.initializeProjects();
  }

  async initializeProjects() {
    if (!authService.isAuthenticated() || !authService.hasRole("admin")) {
      return;
    }

    const projects = await this.getAllProjects();
    if (projects.length === 0) {
      const seed = createCurrentProject();
      await this.saveProject(seed);
      this.setActiveProject(seed);
    } else {
      const active = await this.getActiveProject();
      if (!active && projects[0]) this.setActiveProject(projects[0]);
    }
  }

  // ===== Active project =====
  setActiveProject(projectOrId) {
    if (!projectOrId) return;

    if (typeof projectOrId === "string") {
      localStorage.setItem(this.activeProjectKey, projectOrId);
      return;
    }

    const project = projectOrId;
    localStorage.setItem(this.activeProjectKey, project.id);
    localStorage.setItem(this.activeProjectObjKey, JSON.stringify(project));
  }

  getActiveProjectFromCache() {
    try {
      const raw = localStorage.getItem(this.activeProjectObjKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async getActiveProject() {
    const activeId = localStorage.getItem(this.activeProjectKey);
    
    const cached = this.getActiveProjectFromCache();
    if (cached?.id && (!activeId || cached.id === activeId)) {
      return normalizeProject(cached);
    }

    if (activeId) {
      const proj = await this.getProjectById(activeId);
      if (proj) this.setActiveProject(proj);
      return normalizeProject(proj);
    }

    const projects = await this.getAllProjects();
    if (projects[0]) this.setActiveProject(projects[0]);
    return normalizeProject(projects[0] || null);
  }


  
  // ===== CRUD =====
  async getAllProjects() {
    if (!authService.isAuthenticated()) {
      return [];
    }

    if (!USE_BACKEND) {
      try {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: authService.getAuthHeaders(),
      });
      if (response.status === 401 || response.status === 403) return [];
      if (!response.ok) throw new Error("Failed to fetch projects");
      const projects = await response.json();
      return projects.map(normalizeProject);
    } catch (e) {
      console.error("Error loading projects from backend:", e);
      return [];
    }
  }

  async getProjectById(projectId) {
    if (!authService.isAuthenticated()) {
      // Allow public access to the demo project
      if (projectId === "arc-independiente-001" || projectId === "businu") {
        const defaultProj = createCurrentProject();
        defaultProj.name = projectId === "businu" ? "BUSINU" : defaultProj.name;
        defaultProj.id = projectId;
        return defaultProj;
      }
      return null;
    }

    if (!USE_BACKEND) {
      const projects = await this.getAllProjects();
      return projects.find((p) => p.id === projectId);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        headers: authService.getAuthHeaders(),
      });
      if (response.status === 401 || response.status === 403 || response.status === 404) {
        // Fallback for demo
        if (projectId === "arc-independiente-001" || projectId === "businu") {
          const defaultProj = createCurrentProject();
          defaultProj.name = projectId === "businu" ? "BUSINU" : defaultProj.name;
          defaultProj.id = projectId;
          return defaultProj;
        }
        return null;
      }
      if (!response.ok) throw new Error("Project not found");
      const proj = await response.json();
      return normalizeProject(proj);
    } catch (e) {
      console.error("Error loading project from backend:", e);
      if (projectId === "arc-independiente-001" || projectId === "businu") {
        const defaultProj = createCurrentProject();
        defaultProj.name = projectId === "businu" ? "BUSINU" : defaultProj.name;
        defaultProj.id = projectId;
        return defaultProj;
      }
      return null;
    }
  }

  async saveProject(project) {
    project.dateModified = new Date().toISOString();

    try {
      const existingResponse = await fetch(`${API_BASE_URL}/projects/${project.id}`, {
        headers: authService.getAuthHeaders(),
      });
      const isUpdate = existingResponse.ok;

      const response = await fetch(isUpdate ? `${API_BASE_URL}/projects/${project.id}` : `${API_BASE_URL}/projects`, {
        method: isUpdate ? "PUT" : "POST",
        headers: authService.getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.error || errorData?.message || `${response.status} ${response.statusText}`.trim() || "Error al guardar el proyecto";
        throw new Error(message);
      }

      const payload = await response.json().catch(() => ({}));
      const savedProject = normalizeProject(payload?.project ?? payload);

      const activeId = localStorage.getItem(this.activeProjectKey);
      if (activeId && savedProject?.id === activeId) this.setActiveProject(savedProject);

      return { success: true, project: savedProject };
    } catch (e) {
      console.error("Error guardando proyecto:", e);
      const msg = (e?.message || "").trim();
      const friendly =
        msg.toLowerCase() === "failed to fetch"
          ? `No se pudo conectar al backend (${API_HOST}). Verifica que el backend esté ejecutándose y accesible en la red.`
          : msg || "Error al guardar el proyecto";
      return { success: false, error: friendly };
    }
  }

  async createProject(projectData) {
    const newProject = {
      id: generateUUID(),
      name: projectData.name || "Nuevo Proyecto",
      description: projectData.description || "",
      vesselType: projectData.vesselType || "Embarcación",
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      thumbnail: projectData.thumbnail || "",
      status: "draft",
      experiences: projectData.experiences || [],
      scenes: projectData.scenes || {},
      hotspotContents: projectData.hotspotContents || {},
      maps: projectData.maps || {},
      statistics: { totalScenes: 0, totalHotspots: 0, totalContents: 0, totalVisits: 0 },
      settings: {
        primaryColor: "#003d82",
        secondaryColor: "#0057b8",
        accentColor: "#3b82f6",
        defaultHfov: 140,
        autoRotate: true,
      },
    };

    return await this.saveProject(newProject);
  }

  async deleteProject(projectId) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: "DELETE",
        headers: authService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to delete project");

      const activeId = localStorage.getItem(this.activeProjectKey);
      if (activeId === projectId) {
        localStorage.removeItem(this.activeProjectObjKey);
        const projects = await this.getAllProjects();
        if (projects[0]) this.setActiveProject(projects[0]);
      }

      return { success: true };
    } catch (e) {
      console.error("Error deleting project:", e);
      return { success: false, error: e.message };
    }
  }

  async duplicateProject(projectId) {
    const original = await this.getProjectById(projectId);
    if (!original) return { success: false, error: "Project not found" };

    const duplicate = {
      ...original,
      id: generateUUID(),
      name: `${original.name} (Copia)`,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      status: "draft",
    };

    return await this.saveProject(duplicate);
  }

  async getGlobalStats() {
    const projects = await this.getAllProjects();
    return {
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => p.status === "active").length,
      draftProjects: projects.filter((p) => p.status === "draft").length,
      totalScenes: projects.reduce((sum, p) => sum + (p.statistics?.totalScenes || 0), 0),
      totalHotspots: projects.reduce((sum, p) => sum + (p.statistics?.totalHotspots || 0), 0),
    };
  }
}

const projectService = new ProjectService();
export default projectService;
