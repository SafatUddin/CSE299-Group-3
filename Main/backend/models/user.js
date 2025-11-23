import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    email: { 
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: { type: String, select: false },
    name: { type: String, required: true, trim: true },
    profilePicture: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    isEmailVerified: { type: Boolean, default: true },
    lastLogin: { type: Date },
    is2FAEnabled: { type: Boolean, default: false },
    twoFAOtp: { type: String, select: false },
    twoFAOtpExpires: { type: Date, select: false },
},
{ timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;

