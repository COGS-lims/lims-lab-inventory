// /app/api/lab/[id]/route.ts

/**
 * API Route for Lab Management by ID
 * This file defines the API routes for managing lab entries in the inventory 
 * system based on their unique ID. It includes handlers for fetching, 
 * updating, and deleting lab entries by ID.
 */

'use server'

import { NextResponse } from "next/server";
import { z } from "zod";
import { getLab, updateLab, deleteLab } from "@/services/labs/labs";

type Params = { id: string };

// Define a Zod schema for validating lab updates, allowing for partial updates
const labUpdateSchema = z
    .object({
        name: z.string().min(1),
        department: z.string().min(1),
        createdAt: z.coerce.date(),
    });

/**
 * Get one lab entry by ID
 * @param request request object
 * @param context context object containing route parameters
 * @return response with lab data or error message
 */
export async function GET(request: Request,  context : { params:  Params }) {
    try {
        const parsedParams = z.object({ id: z.string().min(1) })
            .safeParse(context.params);
        if (!parsedParams.success) {
            return NextResponse.json({ message: "Invalid ID" }, 
                { status: 400 });
        }
        const item = await getLab(parsedParams.data.id);
        if (!item) {
            return NextResponse.json({ message: "Lab not found" }, 
                { status: 404 });
        }
        return NextResponse.json(item, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Internal server error" }, 
            { status: 500 });
    }
}

/**
 * Update a lab entry by ID
 * @param request request object
 * @param context context object containing route parameters
 * @return response after updating lab entry
 */
export async function PUT(request: Request,  context : { params:  Params }) {
    try {
        // Validate the ID parameter and request body, then attempt to update 
        // the lab entry
        const parsedParams = z.object({ id: z.string().min(1) })
            .safeParse(context.params);
        if (!parsedParams.success) {
            return NextResponse.json({ message: "Invalid ID" }, 
                { status: 400 });
        }
        // Validate the request body against the lab update schema, allowing 
        // for partial updates
        const parsedBody = labUpdateSchema.partial().safeParse(
            await request.json());
        if (!parsedBody.success) {
            return NextResponse.json({ message: "Invalid data" }, 
                { status: 400 });
        }
        // Attempt to update the lab entry and return appropriate response 
        // based on the result
        const updatedLab = await updateLab(parsedParams.data.id, 
            parsedBody.data);
        if (!updatedLab) {
            return NextResponse.json({ message: "Lab not found" }, 
                { status: 404 });
        }
        // Return the updated lab entry if the update was successful
        return NextResponse.json(updatedLab, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Internal server error" }, 
            { status: 500 });
    }
}

/**
 * Delete a lab entry by ID
 * @param request request object
 * @param context context object containing route parameters
 * @return response after deleting the lab entry
 */
export async function DELETE(request: Request,  context : { params:  Params }) {
    try {
        // Validate the ID parameter and attempt to delete the lab entry
        const parsedParams = z.object({ id: z.string().min(1) }).safeParse(
            context.params);
        if (!parsedParams.success) {
            return NextResponse.json({ message: "Invalid ID" }, 
                { status: 400 });
        }
        // Attempt to delete the lab entry and return appropriate response 
        // based on the result
        const deleted = await deleteLab(parsedParams.data.id);
        if (!deleted) {
            return NextResponse.json({ message: "Lab not found" }, 
                { status: 404 });
        }
        // Return a success message if the lab entry was deleted successfully
        return NextResponse.json({ message: "Lab deleted successfully" }, 
            { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Internal server error" }, 
            { status: 500 });
    }
}