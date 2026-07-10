const fs = require("fs");
const path = require("path");
const prisma = require("../config/prisma");
const { UPLOADS_DIR } = require("../config/env");
const { createHttpError } = require("../utils/errors");
const { hydrateProject, serializeProjectPayload } = require("../utils/project");

async function listProjectsForUser(user) {
  const projects = await prisma.project.findMany({
    where:
      user.role === "admin" || user.role === "project_admin"
        ? undefined
        : {
            userProjects: {
              some: { userId: Number(user.id) },
            },
          },
    orderBy: { dateModified: "desc" },
  });

  return projects.map(hydrateProject);
}

async function getAccessibleProjectById(projectId, user) {
  if (user.role === "admin" || user.role === "project_admin") {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    return hydrateProject(project);
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userProjects: {
        some: { userId: Number(user.id) },
      },
    },
  });

  return hydrateProject(project);
}

async function getProjectById(projectId) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  return hydrateProject(project);
}

async function createProject(project) {
  const now = new Date().toISOString();
  const serialized = serializeProjectPayload(project);

  await prisma.project.create({
    data: {
      id: project.id,
      name: project.name,
      vesselType: project.vesselType || "",
      description: project.description || "",
      thumbnail: project.thumbnail || "",
      status: project.status || "draft",
      dateCreated: now,
      dateModified: now,
      settings: serialized.settings,
      data: serialized.data,
    },
  });

  return {
    success: true,
    project,
  };
}

async function updateProject(projectId, project) {
  const existing = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });

  if (!existing) {
    throw createHttpError(404, "Proyecto no encontrado");
  }

  const serialized = serializeProjectPayload(project);

  await prisma.project.update({
    where: { id: projectId },
    data: {
      name: project.name,
      vesselType: project.vesselType || "",
      description: project.description || "",
      thumbnail: project.thumbnail || "",
      status: project.status || "draft",
      dateModified: new Date().toISOString(),
      settings: serialized.settings,
      data: serialized.data,
    },
  });

  return {
    success: true,
    project,
  };
}

async function deleteProject(projectId) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { images: true },
  });

  if (!project) {
    throw createHttpError(404, "Proyecto no encontrado");
  }

  for (const image of project.images) {
    const filePath = path.join(UPLOADS_DIR, image.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        // Ignora archivos que ya no existan o estén bloqueados momentáneamente.
      }
    }
  }

  await prisma.project.delete({
    where: { id: projectId },
  });

  return {
    success: true,
    message: "Proyecto eliminado exitosamente",
  };
}

module.exports = {
  listProjectsForUser,
  getAccessibleProjectById,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
