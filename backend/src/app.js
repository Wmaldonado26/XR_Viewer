const express = require("express");
const cors = require("cors");
const path = require("path");
const apiRoutes = require("./routes");
const { CORS_ORIGIN, UPLOADS_DIR } = require("./config/env");
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true, limit: "200mb" }));
app.use("/uploads", express.static(path.resolve(UPLOADS_DIR)));

app.get("/", (req, res) => {
  res.json({
    message: "API COTECMAR - Sistema de Visualización 360°",
    version: "3.0.0",
    architecture: "MVC + Prisma",
    endpoints: {
      "POST /api/auth/login": "Iniciar sesión con correo y contraseña",
      "GET /api/auth/me": "Obtener usuario autenticado",
      "POST /api/auth/change-password": "Cambiar contraseña del usuario autenticado",
      "PUT /api/users/me": "Actualizar perfil propio",
      "GET /api/users": "Listar usuarios (admin)",
      "POST /api/users": "Crear usuario (admin)",
      "PUT /api/users/:id": "Actualizar usuario (admin)",
      "DELETE /api/users/:id": "Eliminar usuario (admin)",
      "GET /api/projects": "Obtener proyectos permitidos",
      "GET /api/projects/:id": "Obtener un proyecto permitido",
      "POST /api/projects": "Crear proyecto (admin)",
      "PUT /api/projects/:id": "Actualizar proyecto (admin)",
      "DELETE /api/projects/:id": "Eliminar proyecto (admin)",
      "POST /api/upload": "Subir imagen o PDF (admin)",
      "GET /uploads/<file>": "Servir archivo",
    },
  });
});

app.use("/api", apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
