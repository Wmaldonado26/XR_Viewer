const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { asyncHandler } = require("../utils/errors");

const router = Router();

router.post("/login", asyncHandler(authController.login));
router.get("/me", requireAuth, asyncHandler(authController.me));
router.post(
  "/change-password",
  requireAuth,
  asyncHandler(authController.changePassword)
);

module.exports = router;
