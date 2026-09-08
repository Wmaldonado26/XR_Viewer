const { Router } = require("express");
const uploadController = require("../controllers/upload.controller");
const { requireAuth, requireRole } = require("../middlewares/auth.middleware");
const { runMulter } = require("../middlewares/upload.middleware");
const { asyncHandler } = require("../utils/errors");

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole("admin", "project_admin"),
  runMulter,
  asyncHandler(uploadController.uploadFile)
);

router.delete(
  "/",
  requireAuth,
  requireRole("admin", "project_admin"),
  asyncHandler(uploadController.deleteFile)
);

module.exports = router;
