import { Router } from "express";
import { createItem, getItem, listItems } from "../controllers/item.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.get("/", protect, listItems);
router.post("/", protect, upload.single("image"), createItem);
router.get("/:id", protect, getItem);

export default router;
