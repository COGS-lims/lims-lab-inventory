import { NextResponse } from "next/server";
import { z } from "zod";
import { getItem, updateItem, deleteItem } from "@/services/items";
import {
    categoryValues,
    notificationAudienceValues,
    notificationEventValues,
} from "@/models/Item";

const objectIdSchema = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const zEnumFromConst = <T extends readonly [string, ...string[]]>(values: T) =>
    z.enum(values as unknown as [T[number], ...T[number][]]);

// GET: get an item by id
export async function GET(_: Request, { params }: { params: { id: string } }) {
    const parsedId = objectIdSchema.safeParse(params.id);
    if (!parsedId.success) {
        return NextResponse.json(
            { message: parsedId.error.issues[0]?.message ?? "Invalid id" },
            { status: 400 }
        );
    }

    try {
        const item = await getItem(parsedId.data);
        if (!item) {
            return NextResponse.json(
                { message: "Item not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(item, { status: 200 });
    } catch {
        return NextResponse.json(
            { success: false, message: "Error occured while retrieving items" },
            { status: 500 }
        );
    }
}

// PUT: update an item by id
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const parsedId = objectIdSchema.safeParse(params.id);
    if (!parsedId.success) {
        return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }

    const thresholdFullSchema = z.object({
        minQuantity: z.number().min(0),
        enabled: z.boolean(),
        lastAlertSentAt: z.coerce.date(),
    });

    const notificationPolicyFullSchema = z.object({
        event: zEnumFromConst(notificationEventValues),
        audience: zEnumFromConst(notificationAudienceValues),
    });

    const updateSchema = z
        .object({
            name: z.string().trim().min(1).optional(),
            category: zEnumFromConst(categoryValues).optional(),
            quantity: z.number().min(0).optional(),

            threshold: thresholdFullSchema.optional(),
            notificationPolicy: notificationPolicyFullSchema.optional(),
        })
        .strict()
        .refine(obj => Object.keys(obj).length > 0, {
            message: "Body must include at least one field to update",
        });

    // Assuming updateSchema
    const json = await request.json();
    const parsedUpdate = updateSchema.safeParse(json);
    if (!parsedUpdate.success) {
        return NextResponse.json(
            {
                message: "Update doesn't follow schema",
                issues: parsedUpdate.error.flatten(),
            },
            { status: 400 }
        );
    }

    try {
        const updated = await updateItem(parsedId.data, parsedUpdate.data);
        if (!updated) {
            return NextResponse.json(
                { message: "Item not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(updated, { status: 200 });
    } catch {
        return NextResponse.json(
            { success: false, message: "Error while updating data" },
            { status: 500 }
        );
    }
}

// In the future, check for auth before usage to prevent unauthorized deletes
// DELETE: Delete a product by id
export async function DELETE(
    _: Request,
    { params }: { params: { id: string } }
) {
    const parsedId = objectIdSchema.safeParse(params.id);
    if (!parsedId.success) {
        return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }

    try {
        const deleted = await deleteItem(parsedId.data);
        if (!deleted) {
            return NextResponse.json(
                { message: "Item not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(deleted, { status: 200 });
    } catch {
        return NextResponse.json(
            { success: false, message: "Error while deleting data" },
            { status: 500 }
        );
    }
}
