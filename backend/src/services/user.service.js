const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const { normalizeEmail, sanitizeUser } = require("../utils/auth");
const { createHttpError } = require("../utils/errors");
const { ensureArray } = require("../utils/project");

async function getProjectIdsForUser(userId) {
  const rows = await prisma.userProject.findMany({
    where: { userId: Number(userId) },
    orderBy: { createdAt: "desc" },
    select: { projectId: true },
  });

  return rows.map((row) => row.projectId);
}

async function assignProjectsToUser(userId, projectIds, tx = prisma) {
  const normalizedIds = [
    ...new Set(
      ensureArray(projectIds)
        .map((id) => String(id || "").trim())
        .filter(Boolean)
    ),
  ];

  const existingProjects = await tx.project.findMany({
    where: { id: { in: normalizedIds } },
    select: { id: true },
  });

  const validProjectIds = existingProjects.map((project) => project.id);

  await tx.userProject.deleteMany({
    where: { userId: Number(userId) },
  });

  for (const projectId of validProjectIds) {
    await tx.userProject.create({
      data: {
        userId: Number(userId),
        projectId,
        createdAt: new Date().toISOString(),
      },
    });
  }

  return validProjectIds;
}

async function getUserWithProjects(userId) {
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
  });

  if (!user) return null;

  return {
    ...sanitizeUser(user),
    projectIds: (user.role === "admin" || user.role === "project_admin") ? [] : await getProjectIdsForUser(user.id),
  };
}

async function listUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return Promise.all(
    users.map(async (user) => ({
      ...sanitizeUser(user),
      projectIds: (user.role === "admin" || user.role === "project_admin") ? [] : await getProjectIdsForUser(user.id),
    }))
  );
}

async function createUser(payload) {
  const name = String(payload?.name || "").trim();
  const email = normalizeEmail(payload?.email);
  const phone = String(payload?.phone || "").trim();
  const password = String(payload?.password || "");
  const role = payload?.role === "admin" ? "admin" : payload?.role === "project_admin" ? "project_admin" : "user";
  const projectIds = ensureArray(payload?.projectIds);

  if (!name || !email || !password) {
    throw createHttpError(400, "Nombre, correo y contraseña son obligatorios");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw createHttpError(409, "Ya existe un usuario con ese correo");
  }

  const now = new Date().toISOString();

  const createdUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash: bcrypt.hashSync(password, 10),
        role,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    });

    if (role === "user") {
      await assignProjectsToUser(user.id, projectIds, tx);
    }

    return user;
  });

  return getUserWithProjects(createdUser.id);
}

async function updateUser(userId, payload) {
  const id = Number(userId);
  const currentUser = await prisma.user.findUnique({ where: { id } });

  if (!currentUser) {
    throw createHttpError(404, "Usuario no encontrado");
  }

  const name = String(payload?.name || currentUser.name).trim();
  const email = normalizeEmail(payload?.email || currentUser.email);
  const phone = String(payload?.phone ?? currentUser.phone ?? "").trim();
  const role = payload?.role === "admin" ? "admin" : payload?.role === "project_admin" ? "project_admin" : "user";
  const isActive =
    payload?.isActive === undefined ? Boolean(currentUser.isActive) : Boolean(payload.isActive);
  const password = String(payload?.password || "");
  const projectIds = ensureArray(payload?.projectIds);

  const emailOwner = await prisma.user.findFirst({
    where: {
      email,
      id: { not: id },
    },
    select: { id: true },
  });

  if (emailOwner) {
    throw createHttpError(409, "Ya existe otro usuario con ese correo");
  }

  const updatedAt = new Date().toISOString();

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        role,
        isActive,
        updatedAt,
        passwordHash: password.trim()
          ? bcrypt.hashSync(password, 10)
          : currentUser.passwordHash,
      },
    });

    if (role === "user") {
      await assignProjectsToUser(id, projectIds, tx);
    } else {
      await assignProjectsToUser(id, [], tx);
    }
  });

  return getUserWithProjects(id);
}

async function deleteUser(userId, currentUserId) {
  const id = Number(userId);

  if (id === Number(currentUserId)) {
    throw createHttpError(400, "No puedes eliminar tu propia cuenta");
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw createHttpError(404, "Usuario no encontrado");
  }

  await prisma.user.delete({ where: { id } });
}

module.exports = {
  getProjectIdsForUser,
  assignProjectsToUser,
  getUserWithProjects,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
};
