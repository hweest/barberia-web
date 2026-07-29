// backend/src/routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Rutas públicas
router.post("/login", authController.login);
router.post("/request-reset", authController.requestPasswordReset);
router.post("/reset-password", authController.resetPassword);

// Rutas protegidas
router.post(
  "/change-password",
  authController.verifyToken,
  authController.changePassword,
);
router.get("/verify", authController.verifyToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
