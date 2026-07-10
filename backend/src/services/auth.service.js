const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const { DEFAULT_ADMIN } = require("../config/env");
const { normalizeEmail, signToken } = require("../utils/auth");
const { createHttpError } = require("../utils/errors");
const userService = require("./user.service");

async function login(payload) {
  const email = normalizeEmail(payload?.email);
  const password = String(payload?.password || "");

  if (!email || !password) {
    throw createHttpError(400, "Debes enviar correo y contraseña");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw createHttpError(401, "Correo o contraseña incorrectos");
  }

  if (!user.isActive) {
    throw createHttpError(403, "Tu cuenta está desactivada");
  }

  const isValidPassword = bcrypt.compareSync(password, user.passwordHash);
  if (!isValidPassword) {
    throw createHttpError(401, "Correo o contraseña incorrectos");
  }

  return {
    success: true,
    token: signToken(user),
    user: await userService.getUserWithProjects(user.id),
  };
}

async function getCurrentSessionUser(userId) {
  const user = await userService.getUserWithProjects(userId);
  if (!user) {
    throw createHttpError(404, "Usuario no encontrado");
  }

  return {
    success: true,
    user,
  };
}

async function updateMyProfile(userId, payload) {
  const id = Number(userId);
  const currentUser = await prisma.user.findUnique({ where: { id } });

  if (!currentUser) {
    throw createHttpError(404, "Usuario no encontrado");
  }

  const name = String(payload?.name || currentUser.name).trim();
  const email = normalizeEmail(payload?.email || currentUser.email);
  const phone = String(payload?.phone ?? currentUser.phone ?? "").trim();
  const password = String(payload?.password || "");

  if (!name || !email) {
    throw createHttpError(400, "Nombre y correo son obligatorios");
  }

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

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      phone,
      updatedAt: new Date().toISOString(),
      passwordHash: password.trim()
        ? bcrypt.hashSync(password, 10)
        : currentUser.passwordHash,
    },
  });

  return {
    success: true,
    token: signToken(updatedUser),
    user: await userService.getUserWithProjects(id),
  };
}

async function changeMyPassword(userId, payload) {
  const id = Number(userId);
  const currentPassword = String(payload?.currentPassword || "");
  const newPassword = String(payload?.newPassword || "");

  if (!currentPassword || !newPassword) {
    throw createHttpError(400, "Debes enviar la contraseña actual y la nueva");
  }

  if (newPassword.trim().length < 6) {
    throw createHttpError(400, "La nueva contraseña debe tener al menos 6 caracteres");
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw createHttpError(404, "Usuario no encontrado");
  }

  const ok = bcrypt.compareSync(currentPassword, user.passwordHash);
  if (!ok) {
    throw createHttpError(401, "La contraseña actual no es correcta");
  }

  await prisma.user.update({
    where: { id },
    data: {
      passwordHash: bcrypt.hashSync(newPassword, 10),
      updatedAt: new Date().toISOString(),
    },
  });

  return { success: true };
}

async function ensureDefaultAdmin() {
  const adminCount = await prisma.user.count({
    where: { role: "admin" },
  });

  if (adminCount > 0) return;

  const now = new Date().toISOString();

  await prisma.user.create({
    data: {
      name: DEFAULT_ADMIN.name,
      email: DEFAULT_ADMIN.email,
      phone: DEFAULT_ADMIN.phone,
      passwordHash: bcrypt.hashSync(DEFAULT_ADMIN.password, 10),
      role: "admin",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  });

  console.log(`Admin inicial creado: ${DEFAULT_ADMIN.email}`);
}

module.exports = {
  login,
  getCurrentSessionUser,
  updateMyProfile,
  changeMyPassword,
  ensureDefaultAdmin,
};
