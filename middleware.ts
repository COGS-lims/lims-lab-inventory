import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Route guard:
 * - Signed-in users with `needsOnboarding === true` must go to /onboarding
 *   before they can use the rest of the app.
 * - Signed-in users who've finished onboarding shouldn't see /onboarding.
 *
 * Public routes (login, signup, NextAuth endpoints, static assets) are skipped
 * via the matcher below.
 */
export async function middleware(req: NextRequest) {
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = req.nextUrl;

    // Not signed in → let the page handle it (most pages will redirect to /login on their own)
    if (!token) {
        return NextResponse.next();
    }

    const needsOnboarding = token.needsOnboarding === true;

    if (needsOnboarding && pathname !== "/onboarding") {
        const url = req.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
    }

    if (!needsOnboarding && pathname === "/onboarding") {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    // Run on everything except API routes, NextAuth endpoints, login/signup,
    // Next.js internals, and static files.
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|login|signup|.*\\..*).*)",
    ],
};
