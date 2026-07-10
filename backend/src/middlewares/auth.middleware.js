const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { JWT_SECRET } = require("../config/env");
const { sanitizeUser } = require("../utils/auth");
const { createHttpError } = require("../utils/errors");
const projectService = require("../services/project.service");

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      throw createHttpError(401, "Debes iniciar sesión");
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
    });

    if (!user || !user.isActive) {
      throw createHttpError(401, "Sesión inválida o usuario inactivo");
    }

    req.user = sanitizeUser(user);
    next();
  } catch (error) {
    if (error.status) {
      next(error);
      return;
    }

    next(createHttpError(401, "Token inválido o expirado"));
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      next(createHttpError(401, "Debes iniciar sesión"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(createHttpError(403, "No tienes permisos para esta acción"));
      return;
    }

    next();
  };
}

async function ensureProjectAccess(req, res, next) {
  try {
    if (!req.user) {
      throw createHttpError(401, "No autenticado");
    }

    const projectId = req.params.id || req.params.projectId;
    const project = await projectService.getAccessibleProjectById(projectId, req.user);

    if (!project) {
      const existingProject = await projectService.getProjectById(projectId);

      if (!existingProject) {
        throw createHttpError(404, "Proyecto no encontrado");
      }

      throw createHttpError(403, "No tienes permiso para ver este barco");
    }

    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  requireAuth,
  requireRole,
  ensureProjectAccess,
};
