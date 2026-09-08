const uploadService = require("../services/upload.service");

async function uploadFile(req, res) {
  const payload = await uploadService.saveUpload(req);
  res.json(payload);
}

async function deleteFile(req, res) {
  const { url } = req.body;
  const payload = await uploadService.deleteUpload(url);
  res.json(payload);
}

module.exports = {
  uploadFile,
  deleteFile,
};
