import express from "express";

import {
  googleLogin,
  registerUser,
  loginUser,
  getMe,
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";
// import { addNominee } from "../controllers/nomineeController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/google", googleLogin);
// router.post("/add-nominee", protect, addNominee);

router.post("/login", loginUser);
router.post("/", loginUser);

// PROTECTED ROUTE
router.get("/me", protect, getMe);

export default router;
