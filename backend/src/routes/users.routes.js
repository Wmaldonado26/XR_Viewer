const { Router } = require("express");
const usersController = require("../controllers/users.controller");
const authController = require("../controllers/auth.controller");
const { requireAuth, requireRole } = require("../middlewares/auth.middleware");
const { asyncHandler } = require("../utils/errors");

const router = Router();

router.put("/me", requireAuth, asyncHandler(authController.updateMyProfile));
router.get("/", requireAuth, requireRole("admin"), asyncHandler(usersController.listUsers));
router.post("/", requireAuth, requireRole("admin"), asyncHandler(usersController.createUser));
router.put("/:id", requireAuth, requireRole("admin"), asyncHandler(usersController.updateUser));
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(usersController.deleteUser)
);

module.exports = router;
