import express from "express";
import { savePost, getSavedPosts, deletePostById , getPostAnalytics  } from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/save", protect, savePost);
router.get("/my-posts", protect, getSavedPosts);
router.delete("/:id", protect, deletePostById); 
router.get("/analytics", protect, getPostAnalytics);

export default router;
