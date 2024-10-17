import express from "express";
import {
  getProfile,
  login,
  logout,
  register,
} from "../controller/userController.js";
import isAuthenticated from "../middleware/isAuthentication.js";
const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/:id/profile").get(isAuthenticated, getProfile);
router.route("/profile/edit").post(isAuthenticated);
