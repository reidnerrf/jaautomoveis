import express from "express";
import { body } from "express-validator";
import { handleValidationErrors } from "../middleware/validation";
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

router.post(
  "/login",
  [
    body("username").isString().trim().isLength({ min: 3, max: 100 }),
    body("password").isString().isLength({ min: 6, max: 200 }),
    handleValidationErrors,
  ],
  loginUser,
);
router.post(
  "/forgot-password",
  [body("email").isEmail().normalizeEmail(), handleValidationErrors],
  forgotPassword,
);
router.post(
  "/reset-password",
  [
    body("token").isString().isLength({ min: 10 }),
    body("password").isString().isLength({ min: 8, max: 200 }),
    handleValidationErrors,
  ],
  resetPassword,
);
// Sessions endpoints kept as no-ops to preserve compatibility
router.post("/session/open", openSession);
router.post("/session/close", closeSession);
router.get("/validate", validateToken);

export default router;
