const prisma = require("../config/prisma");
const { createHttpError } = require("../utils/errors");
const { getBaseUrl } = require("../utils/upload");

function getUploadedFile(req) {
  return (
    (req.files?.file && req.files.file[0]) ||
    (req.files?.image && req.files.image[0]) ||
    null
  );
}

async function saveUpload(req) {
  const fileObj = getUploadedFile(req);

  if (!fileObj) {
    throw createHttpError(400, 'No se recibió ningún archivo. Envía "file" o "image".');
  }

  const projectId = String(req.body?.projectId || "unknown");
  const type = String(req.body?.type || "file");
  const publicUrl = fileObj.path && fileObj.path.startsWith('http') 
    ? fileObj.path 
    : `${getBaseUrl(req)}/uploads/${fileObj.filename}?t=${Date.now()}`;

  await prisma.image.create({
    data: {
      projectId,
      filename: fileObj.filename,
      url: publicUrl,
      type,
      dateUploaded: new Date().toISOString(),
    },
  });

  return {
    success: true,
    url: publicUrl,
    filename: fileObj.filename,
    originalName: fileObj.originalname,
    mimetype: fileObj.mimetype,
    size: fileObj.size,
  };
}

async function deleteCloudinaryImage(filename) {
  if (process.env.CLOUDINARY_URL) {
    try {
      const cloudinary = require("cloudinary").v2;
      console.log(`[UploadService] Eliminando de Cloudinary: ${filename}`);
      await cloudinary.uploader.destroy(filename);
    } catch (error) {
      console.error(`[UploadService] Error eliminando ${filename} de Cloudinary:`, error);
    }
  } else {
    // Si no usa Cloudinary, borrado local
    const fs = require("fs");
    const path = require("path");
    const { UPLOADS_DIR } = require("../config/env");
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error(`[UploadService] Error eliminando ${filePath}:`, e);
      }
    }
  }
}

async function deleteUpload(url) {
  if (!url) {
    throw createHttpError(400, "URL requerida para eliminar");
  }

  const cleanUrl = url.split("?")[0];
  
  // Buscar la imagen en Prisma por su URL
  const image = await prisma.image.findFirst({
    where: { url: { startsWith: cleanUrl } },
  });

  if (image) {
    await deleteCloudinaryImage(image.filename);
    await prisma.image.delete({ where: { id: image.id } });
    return { success: true, message: "Imagen eliminada de Cloudinary y Prisma" };
  } else {
    // A veces la imagen no está en Prisma o se perdió el registro, intentamos borrar en base a la URL de todos modos
    const match = cleanUrl.match(/(cotecmar_uploads\/[^/.]+)/);
    if (match) {
      await deleteCloudinaryImage(match[1]);
      return { success: true, message: "Imagen eliminada de Cloudinary (registro huérfano)" };
    }
  }

  return { success: false, message: "Imagen no encontrada" };
}

module.exports = {
  saveUpload,
  deleteUpload,
  deleteCloudinaryImage,
};
