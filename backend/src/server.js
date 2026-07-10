const fs = require("fs");
const app = require("./app");
const prisma = require("./config/prisma");
const { HOST, PORT, DATABASE_FILE, UPLOADS_DIR } = require("./config/env");
const authService = require("./services/auth.service");

async function bootstrap() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  await authService.ensureDefaultAdmin();

  app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
  });
}

bootstrap().catch(async (error) => {
  console.error("No se pudo iniciar el backend:", error);
  await prisma.$disconnect();
  process.exit(1);
});

async function shutdown(signal) {
  try {
    await prisma.$disconnect();
  } finally {
    process.exit(signal ? 0 : 1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
