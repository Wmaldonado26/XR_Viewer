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

module.exports = router;
