import express from "express";
import {
  loginUser,
  openSession,
  closeSession,
} from "../controllers/authController";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/passwordController";
import { validateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
// Sessions endpoints kept as no-ops to preserve compatibility
router.post("/session/open", openSession);
router.post("/session/close", closeSession);
router.get("/validate", validateToken);

export default router;
