import express from 'express';
import * as userController from '../controller/userController.js';
const router = express.Router();

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUser);
router.post("/", userController.createUser);
router.post("/login", userController.login);

export default router;