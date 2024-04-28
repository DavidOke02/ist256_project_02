import express from 'express';
import * as blogController from '../controller/blogController.js';
const router = express.Router();

router.get("/", blogController.getAllPosts);
router.get("/:id", blogController.getPost);
router.post("/", blogController.createPost);
router.put("/:id/like", blogController.likePost);
router.post("/:id/comment", blogController.addComment);
router.delete("/:id", blogController.deletePost);

export default router;