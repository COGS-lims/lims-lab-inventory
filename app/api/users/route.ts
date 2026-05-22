// /app/api/users/route.ts

/**
 * API Route for User Management
 * This file defines the API routes for managing users in the system.
 * It includes handlers for fetching all users and creating new users.
 */

"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { createUser, getUserByEmail, getUsers } from "@/services/user";

// Validation for new-user creation. ucsdId is optional because Google OAuth
// can't give us a real PID — users can fill it in later from their profile.
const userCreateSchema = z.object({
    ucsdId: z.string().min(1).optional(),
    email: z
        .string()
        .email()
        .regex(/@ucsd\.edu$/, "Must be a UCSD email"),
    name: z.object({
        first: z.string().min(1),
        last: z.string().min(1),
    }),
    role: z.enum(["PI", "LAB_MANAGER", "RESEARCHER", "VIEWER"]),
});

/**
 * Fetch all users
 * @return response with user data
 */
export async function GET() {
    try {
        const users = await getUsers();
        return NextResponse.json(users, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
        );
    }
}

/**
 * Create a new user.
 *
 * Used by the onboarding flow after Google sign-in: takes the Google email
 * from the authenticated session, the role the user selected from the enum
 * (PI / LAB_MANAGER / RESEARCHER / VIEWER), and the name (pre-filled from
 * Google but editable).
 */
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 },
            );
        }

        const parsed = userCreateSchema.safeParse(await request.json());
        if (parsed.success === false) {
            return NextResponse.json(
                { message: "Invalid data", issues: parsed.error.flatten() },
                { status: 400 },
            );
        }

        // Users can only create an account for themselves
        if (
            parsed.data.email.toLowerCase() !==
            session.user.email.toLowerCase()
        ) {
            return NextResponse.json(
                { message: "Email does not match signed-in user" },
                { status: 403 },
            );
        }

        // Prevent duplicate user docs if onboarding is submitted twice
        const existing = await getUserByEmail(parsed.data.email);
        if (existing) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 409 },
            );
        }

        const newUser = await createUser({
            ...parsed.data,
            lastLoginAt: new Date(),
        });
        return NextResponse.json(newUser, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
        );
    }
}
