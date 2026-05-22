import "next-auth";
import "next-auth/jwt";
import type { Role } from "@/models/User";

// Extend the built-in Session type so session.user has our custom fields
declare module "next-auth" {
    interface Session {
        user: {
            name?: string | null;
            email?: string | null;
            image?: string | null;
            userId?: string;
            role?: Role;
            needsOnboarding?: boolean;
            googleName?: string;
        };
    }
}

// Extend the built-in JWT type so token.* has our custom fields
declare module "next-auth/jwt" {
    interface JWT {
        userId?: string;
        role?: Role;
        needsOnboarding?: boolean;
        googleName?: string;
    }
}
