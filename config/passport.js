import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import db from "../db/authQueries.js";
import userDb from "../db/userQueries.js";
import bcrypt from "bcryptjs";

// This strategy only runs if both username and password are
// passed to it, else it doesn't run at all
passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await db.getUser(username);
            console.log(user);

            if (!user) {
                console.log("Incorrect username");
                return done(null, false, { message: "Incorrect username" });
            }

            console.log(typeof password);
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                console.log("incorrect password");
                console.log(user.password_hash);
                console.log(password);
                return done(null, false, { message: "Incorrect password" });
            }
            console.log("success");
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }),
);

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const googleId = profile.id;
                const email = profile.emails?.[0]?.value;
                const avatarUrl = profile.photos?.[0]?.value;

                let user = await userDb.findByGoogleId(googleId);
                if (user) return done(null, user);

                if (email) {
                    user = await userDb.findByEmail(email);
                    if (user) {
                        user = await userDb.linkGoogleId(user.id, googleId, avatarUrl);
                        return done(null, user);
                    }
                }

                const username = email ? email.split("@")[0] : `user_${googleId.slice(0, 8)}`;
                user = await userDb.createGoogleUser({ googleId, email, username, avatarUrl });
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        },
    ),
);

passport.serializeUser((user, done) => {
    // here I'm storing only the id in the session cookie
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await db.getUserById(id);

        done(null, user);
    } catch (err) {
        done(err);
    }
});
