import express from "express";
import {
  editProfile,
  followOrUnFollow,
  getProfile,
  getSuggestUsers,
  login,
  logout,
  register,
} from "../controller/userController.js";
import isAuthenticated from "../middleware/isAuthentication.js";
import upload from "../middleware/muter.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/:id/profile").get(isAuthenticated, getProfile);
router
  .route("/profile/edit")
  .post(isAuthenticated, upload.single("profilePicture"), editProfile);
router.route("/suggested").get(isAuthenticated, getSuggestUsers);
router.route("/followorunfollow/:id").post(isAuthenticated, followOrUnFollow);

export default router;
