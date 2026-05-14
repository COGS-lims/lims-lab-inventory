// /app/api/users/[id]/route.ts

/**
 * API Route for User Management by ID
 * This file defines the API routes for managing users based on their unique ID.
 * It includes handlers for fetching, updating, and deleting users by ID.
 */

'use server'

import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserById, updateUser, deleteUser } from "@/services/user";

type Params = { id: string };

// Define a Zod schema for validating user updates, allowing for partial updates
const userUpdateSchema = z.object({
    ucsdId: z.string().min(1),
    email: z.string().email().regex(/@ucsd\.edu$/, "Must be a UCSD email"),
    name: z.object({
        first: z.string().min(1),
        last: z.string().min(1),
    }),
    role: z.enum(["PI", "LAB_MANAGER", "RESEARCHER", "VIEWER"]),
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
});

/**
 * Get one user by ID
 * @param request request object
 * @param context context object containing route parameters
 * @return response with user data or error message
 */
export async function GET(request: Request, context: { params: Params }) {
    try {
        const parsedParams = z.object({ id: z.string().min(1) })
            .safeParse(context.params);
        if (!parsedParams.success) {
            return NextResponse.json({ message: "Invalid ID" },
                { status: 400 });
        }
        const user = await getUserById(parsedParams.data.id);
        if (!user) {
            return NextResponse.json({ message: "User not found" },
                { status: 404 });
        }
        return NextResponse.json(user, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Internal server error" },
            { status: 500 });
    }
}

/**
 * Update a user by ID
 * @param request request object
 * @param context context object containing route parameters
 * @return response after updating user
 */
export async function PUT(request: Request, context: { params: Params }) {
    try {
        const parsedParams = z.object({ id: z.string().min(1) })
            .safeParse(context.params);
        if (!parsedParams.success) {
            return NextResponse.json({ message: "Invalid ID" },
                { status: 400 });
        }
        const parsedBody = userUpdateSchema.partial().safeParse(
            await request.json());
        if (!parsedBody.success) {
            return NextResponse.json({ message: "Invalid data" },
                { status: 400 });
        }
        const updatedUser = await updateUser(parsedParams.data.id,
            parsedBody.data);
        if (!updatedUser) {
            return NextResponse.json({ message: "User not found" },
                { status: 404 });
        }
        return NextResponse.json(updatedUser, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Internal server error" },
            { status: 500 });
    }
}

/**
 * Delete a user by ID
 * @param request request object
 * @param context context object containing route parameters
 * @return response after deleting the user
 */
export async function DELETE(request: Request, context: { params: Params }) {
    try {
        const parsedParams = z.object({ id: z.string().min(1) }).safeParse(
            context.params);
        if (!parsedParams.success) {
            return NextResponse.json({ message: "Invalid ID" },
                { status: 400 });
        }
        const deleted = await deleteUser(parsedParams.data.id);
        if (!deleted) {
            return NextResponse.json({ message: "User not found" },
                { status: 404 });
        }
        return NextResponse.json({ message: "User deleted successfully" },
            { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Internal server error" },
            { status: 500 });
    }
}
