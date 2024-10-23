import express from "express";
import isAuthenticated from "../middleware/isAuthentication.js";
import { getMessage, sendMessage } from "../controller/messageController.js";

const router = express.Router();

router.route("/send/:id").post(isAuthenticated, sendMessage);
router.route("/all/:id").post(isAuthenticated, getMessage);

export default router;
