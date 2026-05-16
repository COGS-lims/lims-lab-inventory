import { NextResponse } from "next/server";
import { z } from "zod";
import {
    categoryValues,
    notificationAudienceValues,
    notificationEventValues,
} from "@/models/Item";
import { addItem, filteredGet } from "@/services/items";

const thresholdSchema = z.object({
    minQuantity: z.number().int().nonnegative(),
    enabled: z.boolean(),
    lastAlertSentAt: z.coerce.date(),
});

const notificationPolicySchema = z.object({
    event: z.enum(notificationEventValues),
    audience: z.enum(notificationAudienceValues),
});

const itemCreateSchema = z.object({
    labId: z.string().min(1),
    name: z.string().min(1),
    category: z.enum(categoryValues),
    quantity: z.number().int().nonnegative(),
    threshold: thresholdSchema,
    notificationPolicy: notificationPolicySchema,
});

// GET: fetch all items
export async function GET() {
    try {
        const items = await filteredGet({
            page: 1,
            limit: 10,
        }); // swap to getItems() if needed
        return NextResponse.json(items, { status: 200 });
    } catch {
        return NextResponse.json(
            { message: "Failed to fetch items" },
            { status: 500 }
        );
    }
}

// POST: add a new item
export async function POST(request: Request) {
    const body = await request.json();
    const parsedBody = itemCreateSchema.safeParse(body);

    if (!parsedBody.success) {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid request body.",
            },
            { status: 400 }
        );
    }

    try {
        const created = await addItem(parsedBody.data);
        return NextResponse.json(created, { status: 201 });
    } catch {
        return NextResponse.json(
            { message: "Error occured while creating item" },
            { status: 500 }
        );
    }
}
