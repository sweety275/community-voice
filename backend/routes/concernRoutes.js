import express from "express";
import {
  createConcern,
  getMyConcerns,
  updateConcernStatus,
  deleteMyConcern,
  trackAnonymousConcern,
  deleteAnonymousConcern,
  assignConcern,
  getAssignedConcerns
} from "../controllers/concernController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, createConcern);
router.get("/my-concerns", protect, getMyConcerns);
router.post("/anonymous/track", trackAnonymousConcern);
router.post("/anonymous/delete", deleteAnonymousConcern);
router.delete("/:id", protect, deleteMyConcern);

// Only authorized staff can update concern status
router.patch("/:id/status", protect, allowRoles("Handler", "Associate", "SuperAdmin"), updateConcernStatus);


// Handler dashboard: only the logged-in Handler's assigned concerns
router.get("/assigned", protect, allowRoles("Handler"), getAssignedConcerns);

// Only Associate and SuperAdmin can assign concerns
router.patch("/:id/assign", protect, allowRoles("Associate", "SuperAdmin"), assignConcern);

export default router;
