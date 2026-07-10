const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { UPLOADS_DIR } = require("../config/env");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = process.env.CLOUDINARY_URL 
  ? new (require("multer-storage-cloudinary").CloudinaryStorage)({
      cloudinary: require("cloudinary").v2,
      params: async (req, file) => {
        return {
          folder: "cotecmar_uploads",
          allowed_formats: ["jpg", "jpeg", "png", "gif", "pdf"],
          public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
        };
      },
    })
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, UPLOADS_DIR),
      filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
      },
    });

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extOk = /\.(jpe?g|png|gif|pdf)$/i.test(file.originalname);
    const mimeOk = /^(image\/(jpeg|jpg|png|gif)|application\/pdf)$/i.test(file.mimetype);

    if (extOk && mimeOk) {
      cb(null, true);
      return;
    }

    cb(new Error(`Archivo no permitido. mimetype=${file.mimetype} name=${file.originalname}`));
  },
});

function runMulter(req, res, next) {
  const handler = upload.fields([
    { name: "file", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]);

  handler(req, res, (err) => {
    if (!err) {
      next();
      return;
    }

    if (err.name === "MulterError") {
      next({ status: 400, message: err.message });
      return;
    }

    next({ status: 400, message: err.message || "Error subiendo archivo" });
  });
}

module.exports = {
  runMulter,
};
