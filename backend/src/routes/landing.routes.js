const { Router } = require("express");
const landingController = require("../controllers/landing.controller");
const { requireAuth, requireRole } = require("../middlewares/auth.middleware");
const { runMulter } = require("../middlewares/upload.middleware");
const { asyncHandler } = require("../utils/errors");

const router = Router();

// Public route to fetch cards
router.get("/", asyncHandler(landingController.getCards));

// Admin routes
router.post(
  "/",
  requireAuth,
  requireRole("admin", "project_admin"),
  runMulter,
  asyncHandler(landingController.createCard)
);

router.put(
  "/:id",
  requireAuth,
  requireRole("admin", "project_admin"),
  runMulter,
  asyncHandler(landingController.updateCard)
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("admin", "project_admin"),
  asyncHandler(landingController.deleteCard)
);

module.exports = router;
