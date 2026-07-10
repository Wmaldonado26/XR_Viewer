const { Router } = require("express");
const projectsController = require("../controllers/projects.controller");
const {
  requireAuth,
  requireRole,
  ensureProjectAccess,
} = require("../middlewares/auth.middleware");
const { asyncHandler } = require("../utils/errors");

const router = Router();

router.get("/", requireAuth, asyncHandler(projectsController.listProjects));
router.get("/:id", requireAuth, asyncHandler(ensureProjectAccess), asyncHandler(projectsController.getProject));
router.post("/", requireAuth, requireRole("admin", "project_admin"), asyncHandler(projectsController.createProject));
router.put(
  "/:id",
  requireAuth,
  requireRole("admin", "project_admin"),
  asyncHandler(projectsController.updateProject)
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin", "project_admin"),
  asyncHandler(projectsController.deleteProject)
);

module.exports = router;
