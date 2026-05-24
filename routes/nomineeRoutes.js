import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  addNominee,
  getMyNominees,
  updateNominee,
  deleteNominee,
  searchNominees,
  getNotesForMe,
  sendOtp,
  verifyOtp,
} from "../controllers/nomineeController.js";

const router = express.Router();

router.post("/add-nominee", protect, addNominee);

router.get("/my-nominees", protect, getMyNominees);
router.put("/:id", protect, updateNominee);
router.delete("/:id", protect, deleteNominee);
router.get("/search", protect, searchNominees);
router.get("/notes-for-me", protect, getNotesForMe);

router.post("/send-otp", protect, sendOtp);
router.post("/verify-otp", protect, verifyOtp);
export default router;
