const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;

require('dotenv').config();

// Ensure Cloudinary is configured
if (!process.env.CLOUDINARY_URL) {
  console.error("❌ ERROR: CLOUDINARY_URL no está definido en el archivo .env");
  process.exit(1);
}

// Initialize Prisma (Connects to PostgreSQL based on updated schema)
const prisma = new PrismaClient();

async function uploadToCloudinary(localPath) {
  if (!localPath || localPath.startsWith('http')) return localPath;
  
  try {
    // Convert /uploads/filename.png to absolute path
    const filename = localPath.replace('/uploads/', '');
    const absolutePath = path.join(__dirname, 'uploads', filename);
    
    if (fs.existsSync(absolutePath)) {
      console.log(`Subiendo ${filename} a Cloudinary...`);
      const result = await cloudinary.uploader.upload(absolutePath, {
        folder: 'cotecmar_uploads'
      });
      return result.secure_url;
    } else {
      console.warn(`⚠️ Archivo local no encontrado: ${absolutePath}`);
      return localPath;
    }
  } catch (err) {
    console.error(`Error subiendo ${localPath}:`, err.message);
    return localPath;
  }
}

async function migrate() {
  console.log("🚀 Iniciando migración de datos...");
  const dbPath = path.join(__dirname, 'prisma', 'dev.db');
  
  if (!fs.existsSync(dbPath)) {
    console.error("❌ No se encontró dev.db en prisma/dev.db");
    process.exit(1);
  }

  // Connect to local SQLite directly
  const sqlite = new Database(dbPath);

  try {
    console.log("\n1️⃣ Migrando Usuarios...");
    const users = sqlite.prepare('SELECT * FROM User').all();
    for (const user of users) {
      const exists = await prisma.user.findUnique({ where: { email: user.email } });
      if (!exists) {
        await prisma.user.create({ data: user });
      }
    }
    console.log(`✅ ${users.length} Usuarios procesados.`);

    console.log("\n2️⃣ Migrando Tarjetas de Landing...");
    const cards = sqlite.prepare('SELECT * FROM LandingCard').all();
    for (const card of cards) {
      const exists = await prisma.landingCard.findUnique({ where: { id: card.id } });
      if (!exists) {
        card.image = await uploadToCloudinary(card.image);
        await prisma.landingCard.create({ data: card });
      }
    }
    console.log(`✅ ${cards.length} Tarjetas procesadas.`);

    console.log("\n3️⃣ Migrando Imágenes sueltas...");
    try {
      const images = sqlite.prepare('SELECT * FROM Image').all();
      for (const img of images) {
        const exists = await prisma.image.findUnique({ where: { id: img.id } });
        if (!exists) {
          img.url = await uploadToCloudinary(img.url);
          await prisma.image.create({ data: img });
        }
      }
      console.log(`✅ ${images.length} Imágenes procesadas.`);
    } catch (e) {
      console.log("No se pudo migrar la tabla Image (posiblemente no existe o no tiene datos).");
    }

    try {
      const projects = sqlite.prepare('SELECT * FROM Project').all();
      console.log("\n4️⃣ Migrando Proyectos...");
      for (const proj of projects) {
        const exists = await prisma.project.findUnique({ where: { id: proj.id } });
        if (!exists) {
          proj.image = await uploadToCloudinary(proj.image);
          proj.thumbnail = await uploadToCloudinary(proj.thumbnail);
          await prisma.project.create({ data: proj });
        }
      }
      console.log(`✅ ${projects.length} Proyectos procesados.`);
    } catch (e) {
      console.log("No se encontró tabla Project o no es necesario migrarla separadamente.");
    }

    console.log("\n🎉 Migración completada exitosamente.");
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
  } finally {
    sqlite.close();
    await prisma.$disconnect();
  }
}

migrate();
