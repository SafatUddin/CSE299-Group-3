import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Verification from "../models/verification.js";
import {sendEmail} from "../libs/send-email.js";
import aj from "../libs/arcjet.js";

const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        const decision = await aj.protect(req, { email });
        console.log("Arcjet decision", decision.isDenied());


        if (decision.isDenied()) {
                res.writeHead(403, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Invalid email address" }));
        }


        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                 message: "Email address already in use" 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            email,
            password: hashedPassword,
            name,
        });

        // Send verification email
        const verificationToken = jwt.sign(
            { userId: newUser._id, purpose: "email-verification" },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        await Verification.create({
            userId: newUser._id,
            token: verificationToken,
            expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
        });

        // send email
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        const emailBody = `<p>Click <a href="${verificationLink}">here</a> to verify your email</p>`;
        const emailSubject = "Verify your email";

        const isEmailSent = await sendEmail(email, emailSubject, emailBody);

        if (!isEmailSent) {
            return res.status(500).json({
                message: "Failed to send verification email",
            });
        }

        res.status(201).json({
             message: "Verification email sent. Please verify your email to complete registration.", 
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({ message: "Internal Server Error" });
    }

}

const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;
        
        const user = await User.findOne({ email }).select("+password");
        
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Check password FIRST before any other logic
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            const existingVerification = await Verification.findOne({
                userId: user._id, 
            });

            if (existingVerification && existingVerification.expiresAt > new Date()) {
                return res.status(400).json({
                     message:
                      "Email not verified. Please check your email for the verification link." 
                });
            } else {
                // Delete expired verification and create new one
                if (existingVerification) {
                    await Verification.findByIdAndDelete(existingVerification._id);
                }

                const verificationToken = jwt.sign(
                    { userId: user._id, purpose: "email-verification" },
                    process.env.JWT_SECRET,
                    { expiresIn: "1h" }
                );
                 
                await Verification.create({
                    userId: user._id,
                    token: verificationToken,
                    expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
                });

                // send email
                const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
                const emailBody = `<p>Click <a href="${verificationLink}">here</a> to verify your email</p>`;
                const emailSubject = "Verify your email";

                const isEmailSent = await sendEmail(email, emailSubject, emailBody);

                if (!isEmailSent) {
                    return res.status(500).json({
                        message: "Failed to send verification email",
                    });
                }

                return res.status(201).json({
                    message: "Verification email sent. Please verify your email to complete registration.", 
                });
            }
        }

        // Generate login token
        const token = jwt.sign(
            { userId: user._id, purpose: "login" },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        // Return user data without password
        const userData = user.toObject();
        delete userData.password;

        res.status(200).json({
            message: "Login successful",
            token,
            user: userData,
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({ message: "Internal Server Error" });
    }
}

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        
         if (!payload) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        const { userId, purpose } = payload;
        
        if (purpose !== "email-verification") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        const verification = await Verification.findOne({
            userId, token
        });
        
        if (!verification) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        const isTokenExpired = verification.expiresAt < new Date();
        
        if (isTokenExpired) {
            return res.status(401).json({ message: "Token expired" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        user.isEmailVerified = true;
        await user.save();

        await Verification.findByIdAndDelete( verification._id );

        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const resetPasswordRequest = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Email not found." });
        }

        if (!user.isEmailVerified) {
            return res.status(400).json({ message: "Please verify your email first." });
        }

        const existingVerification = await Verification.findOne({ 
            userId: user._id,
        });

        if (existingVerification && existingVerification.expiresAt > new Date()) {
            return res.status(400).json({
                 message: "Reset password request already sent." 
            });
        } 
        
        if (existingVerification && existingVerification.expiresAt <= new Date()) {
            await Verification.findByIdAndDelete(existingVerification._id);
        }

        const resetPasswordToken = jwt.sign(
            { userId: user._id, purpose: "reset-password" },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        await Verification.create({
            userId: user._id,
            token: resetPasswordToken,
            expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
        });
        
        // send email
        const resetPasswordLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}`;
        const emailBody = `<p>Click <a href="${resetPasswordLink}">here</a> to reset your password</p>`;
        const emailSubject = "Reset your password";
        const isEmailSent = await sendEmail(email, emailSubject, emailBody);

        if (!isEmailSent) {
            return res.status(500).json({
                message: "Failed to send reset password email",
            });
        }

        res.status(200).json({
             message: "Reset password email sent." 
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const verifyResetPasswordTokenAndResetPassword = async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        
         if (!payload) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { userId, purpose } = payload;
        
        if (purpose !== "reset-password") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        const verification = await Verification.findOne({
            userId,
            token,
        });
        
        if (!verification) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const isTokenExpired = verification.expiresAt < new Date();
        
        if (isTokenExpired) {
            return res.status(401).json({ message: "Token expired" });
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        await Verification.findByIdAndDelete(verification._id);
        
        res.status(200).json({ message: "Password reset successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export { registerUser, loginUser, verifyEmail, resetPasswordRequest, verifyResetPasswordTokenAndResetPassword };