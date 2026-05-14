// /app/api/lab/route.ts

/**
 * API Route for Lab Management
 * This file defines the API routes for managing lab entries in the inventory 
 * system. It includes handlers for fetching all labs and creating new lab 
 * entries.
 */

'use server'

import { NextResponse } from "next/server";
import { z } from "zod";
import { getLabs, addLab, GetLabOptions } from "@/services/labs/labs";

const labCreateSchema = z.object({
    name: z.string().min(1),
    department: z.string().min(1),
    createdAt: z.coerce.date().optional(),
});

/**
 * Fetch all lab entries
 * @param request request object
 * @return response with lab data
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    try {
        const opts: GetLabOptions = { page, limit };
        const result = await getLabs(opts);
        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

/**
 * Create a new lab entry
 * @param request request object
 * @return response after creating new lab entry
 */
export async function POST(request: Request) {
    try {
        const parsed = labCreateSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json({ message: "Invalid data" }, { status: 400 });
        }
        const newLab = await addLab({
            name: parsed.data.name, 
            department: parsed.data.department, 
            createdAt: parsed.data.createdAt || new Date()
        });
        return NextResponse.json(newLab, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
} 