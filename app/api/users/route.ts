// /app/api/users/route.ts

/**
 * API Route for User Management
 * This file defines the API routes for managing users in the system.
 * It includes handlers for fetching all users and creating new users.
 */

'use server'

import { NextResponse} from "next/server";
import { z } from "zod";
import { getUsers, createUser } from "@/services/user";

// Define a Zod schema for validating new user creation requests
const userCreateSchema = z.object({
    ucsdId: z.string().min(1),
    email: z.string().email().regex(/@ucsd\.edu$/, "Must be a UCSD email"),
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
export async function GET(){
    try {
        const users = await getUsers();
        return NextResponse.json(users, { status: 200 });
    }
    catch (err){
        console.error(err);
        return NextResponse.json({ message: "Internal server error" }, {status: 500});
    }
}

/**
 * Create a new user
 * @param request request object
 * @return response after creating new user
 */
export async function POST(request: Request) {
    try {
        const parsed = userCreateSchema.safeParse(await request.json());
        if (parsed.success === false){
            return NextResponse.json({ message: "Invalid data "}, {status: 400});
        }
        const newUser = await createUser(parsed.data);
        return NextResponse.json(newUser, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Internal server error " }, {status: 500});
    }
}