import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getUserByEmail, updateUser } from "@/services/user";

// How will we log users in, and how do we remember them?

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        // Only allow @ucsd.edu emails to sign in
        async signIn({ user }) {
            if (!user.email?.endsWith("@ucsd.edu")) {
                return false;
            }
            return true;
        },

        // Runs on every JWT read. Refresh from the DB on first sign-in, when
        // the client calls `update()` after submitting onboarding, OR whenever
        // the token still says the user needs onboarding (so the very next
        // request after account creation flips the flag even if `update()`
        // didn't propagate the cookie in time).
        async jwt({ token, user, trigger }) {
            const isFirstSignIn = !!user?.email;
            const isClientUpdate = trigger === "update";
            const pendingOnboarding = token.needsOnboarding === true;
            if (!isFirstSignIn && !isClientUpdate && !pendingOnboarding) {
                return token;
            }

            const email = user?.email ?? token.email;
            if (!email) {
                return token;
            }

            const dbUser = await getUserByEmail(email);
            if (dbUser) {
                token.userId = String(dbUser._id);
                token.role = dbUser.role;
                token.needsOnboarding = false;
                if (isFirstSignIn) {
                    await updateUser(String(dbUser._id), {
                        lastLoginAt: new Date(),
                    });
                }
            } else {
                token.needsOnboarding = true;
                if (isFirstSignIn && user) {
                    token.googleName = user.name ?? "";
                    token.picture = user.image ?? "";
                }
            }
            return token;
        },

        // Expose the token data to the client via useSession()
        async session({ session, token }) {
            if (session.user) {
                session.user.userId = token.userId;
                session.user.role = token.role;
                session.user.needsOnboarding = token.needsOnboarding;
                session.user.googleName = token.googleName;
            }
            return session;
        },
    },
});
