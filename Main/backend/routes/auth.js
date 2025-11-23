import express from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import { emailSchema, loginSchema, registerSchema, resetPasswordSchema } from "../libs/validate-schema.js";
import { loginUser, registerUser, resetPassword, googleAuthCallback } from "../controllers/auth-controller.js";
import passport from "passport";

const router = express.Router();

router.post(
    "/register",
    validateRequest({
        body: registerSchema,
    }),
    registerUser
);

router.post(
    "/login",
    validateRequest({
        body: loginSchema,
    }),
    loginUser
);

router.post(
    "/reset-password",
    validateRequest({
        body: resetPasswordSchema,
    }),
    resetPassword
);

// Google OAuth routes
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    (req, res, next) => {
        passport.authenticate("google", { session: false }, (err, user, info) => {
            if (err) {
                return res.redirect(`${process.env.FRONTEND_URL}/sign-in?error=server_error`);
            }
            
            if (!user) {
                // Check if it's an email conflict
                if (info && info.message && info.message.includes("Email already in use")) {
                    return res.redirect(`${process.env.FRONTEND_URL}/sign-up?error=email_in_use`);
                }
                return res.redirect(`${process.env.FRONTEND_URL}/sign-in?error=authentication_failed`);
            }
            
            req.user = user;
            next();
        })(req, res, next);
    },
    googleAuthCallback
);

export default router;