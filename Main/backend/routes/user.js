import express from "express";
import authenticateUser from "../middleware/auth-middleware.js";
import {
  changePassword,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  deleteProfilePicture,
} from "../controllers/user.js";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import upload from "../middleware/upload-middleware.js";

const router = express.Router();

router.get("/profile", authenticateUser, getUserProfile);
router.put(
  "/profile",
  authenticateUser,
  validateRequest({
    body: z.object({
      name: z.string().min(1),
    }),
  }),
  updateUserProfile
);

router.put(
  "/change-password",
  authenticateUser,
  validateRequest({
    body: z.object({
      currentPassword: z.string(),
      newPassword: z.string(),
      confirmPassword: z.string(),
    }),
  }),
  changePassword
);

router.post(
  "/profile-picture",
  authenticateUser,
  upload.single('profilePicture'),
  uploadProfilePicture
);

router.delete(
  "/profile-picture",
  authenticateUser,
  deleteProfilePicture
);

export default router;