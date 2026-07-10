const { Router } = require("express");
const authRoutes = require("./auth.routes");
const usersRoutes = require("./users.routes");
const projectsRoutes = require("./projects.routes");
const uploadRoutes = require("./upload.routes");
const landingRoutes = require("./landing.routes");

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/projects", projectsRoutes);
router.use("/upload", uploadRoutes);
router.use("/landing", landingRoutes);

module.exports = router;
