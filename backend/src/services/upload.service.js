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

module.exports = {
  saveUpload,
};
