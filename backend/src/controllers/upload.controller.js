const uploadService = require("../services/upload.service");

async function uploadFile(req, res) {
  const payload = await uploadService.saveUpload(req);
  res.json(payload);
}

module.exports = {
  uploadFile,
};
