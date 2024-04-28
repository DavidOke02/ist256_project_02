import express from 'express';
import * as commentController from '../controller/commentController.js';
const router = express.Router();

router.get("/", commentController.getAllComments);
router.get("/:id", commentController.getComment);
router.put("/:id/like", commentController.likeComment);

export default router;