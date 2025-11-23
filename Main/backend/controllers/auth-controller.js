import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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
            isEmailVerified: true,
        });

        // Generate login token immediately
        const token = jwt.sign(
            { userId: newUser._id, purpose: "login" },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Return user data without password
        const userData = newUser.toObject();
        delete userData.password;

        res.status(201).json({
            message: "Registration successful",
            token,
            user: userData,
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

const resetPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(400).json({ message: "Email not found." });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();
        
        res.status(200).json({ message: "Password reset successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const googleAuthCallback = async (req, res) => {
    try {
        const user = req.user;
        
        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/sign-in?error=authentication_failed`);
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, purpose: "login" },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Redirect to frontend with token and user data
        const userData = encodeURIComponent(JSON.stringify({
            _id: user._id,
            email: user.email,
            name: user.name,
            profilePicture: user.profilePicture,
        }));
        
        res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?token=${token}&user=${userData}`);
    } catch (error) {
        console.log(error);
        res.redirect(`${process.env.FRONTEND_URL}/sign-in?error=server_error`);
    }
};

export { registerUser, loginUser, resetPassword, googleAuthCallback };