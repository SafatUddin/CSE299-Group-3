import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.js";

const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api-v1/auth/google/callback`,
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        
        // Check if user exists with this email
        let user = await User.findOne({ email });

        if (user) {
          // User exists - check if they registered with email/password
          if (user.authProvider === 'local' && !user.googleId) {
            // User registered with email/password, trying to use Google
            return done(null, false, { message: "Email already in use. Please sign in with your email and password." });
          }
          
          // Update googleId if not set
          if (!user.googleId) {
            user.googleId = profile.id;
            user.authProvider = 'google';
            await user.save();
          }
          
          // Update last login
          user.lastLogin = new Date();
          await user.save();
          
          return done(null, user);
        }

        // Create new user with Google account
        user = await User.create({
          email,
          name: profile.displayName,
          googleId: profile.id,
          authProvider: 'google',
          profilePicture: profile.photos?.[0]?.value,
          isEmailVerified: true,
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  return passport;
};

export default configurePassport;
