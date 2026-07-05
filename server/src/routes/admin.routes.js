import { Router } from "express";
import { dashboard } from "../controllers/admin.controller.js";
import { reviewClaim } from "../controllers/claim.controller.js";
import { verifyItem } from "../controllers/item.controller.js";
import { protect, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect, requireAdmin);
router.get("/dashboard", dashboard);
router.patch("/items/:id/verify", verifyItem);
router.patch("/claims/:id/review", reviewClaim);

export default router;
