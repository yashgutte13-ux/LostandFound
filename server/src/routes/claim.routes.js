import { Router } from "express";
import { createClaim, listClaims } from "../controllers/claim.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protect, listClaims);
router.post("/", protect, createClaim);

export default router;
