import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { z } from "zod";
import { getFilteredListings, addListing } from "@/services/listings/listings";
import { ListingInput } from "@/models/Listing";
import { uploadImage } from "@/lib/googleCloud";
import { getSession } from "@/lib/rbac";

const listingValidationSchema = z.object({
    // handle defaults here for the optional fields
    itemName: z.string(),
    itemId: z.string(),
    labName: z.string().optional().default(""),
    labLocation: z.string().optional().default(""),
    labId: z.string(),
    imageUrls: z.array(z.string()).optional().default([]),
    quantityAvailable: z.number(),
    expiryDate: z.date().optional(),
    description: z.string().optional().default(""),
    price: z.number().optional().default(0),
    status: z.enum(["ACTIVE", "INACTIVE"]),
    condition: z.enum(["New", "Good", "Fair", "Poor"]),
    hazardTags: z
        .array(z.enum(["Physical", "Chemical", "Biological", "Other"]))
        .optional()
        .default([]),
});

const paramsValidationSchema = z
    .object({
        labId: z.string().optional(),
        itemId: z.string().optional(),
        page: z.number().int().default(1),
        limit: z.number().int().default(10),
    })
    .strict();

/**
 * Get filtered listings stored in db
 * @param request the request
 * ex req: GET /listings/?labId=3&page=2&limit=5 HTTP/1.1
 * @returns JSON response with the filtered listings as JS objects
 */
async function GET(request: Request) {
    const { allowed, reason } = await getSession("inventory:view");
    if (!allowed) {
        return NextResponse.json(
            {
                success: false,
                message: reason,
            },
            { status: 403 }
        );
    }

    try {
        await connectToDatabase();
    } catch {
        return NextResponse.json(
            { success: false, message: "Error connecting to database." },
            { status: 500 }
        );
    }

    const { searchParams } = new URL(request.url);

    const parsedParams = paramsValidationSchema.safeParse({
        labId: searchParams.get("labId") ?? undefined,
        itemId: searchParams.get("itemId") ?? undefined,
        page: searchParams.get("page") ?? undefined,
        limit: searchParams.get("limit") ?? undefined,
    });

    if (!parsedParams.success) {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid request params.",
            },
            { status: 400 }
        );
    }

    try {
        const { listings, pagination } = await getFilteredListings(
            parsedParams.data
        );

        return NextResponse.json(
            {
                success: true,
                data: listings,
                pagination,
            },
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            {
                success: false,
                message: "Error occurred while retrieving listings.",
            },
            { status: 500 }
        );
    }
}

/**
 * Create a new listing to store in db
 * @param request the request with multipart/form-data data in req body
 * @returns JSON response with success message and req body echoed
 */
async function POST(request: Request) {
    let { allowed, reason } = await getSession("listing:create");
    if (!allowed) {
        return NextResponse.json(
            { success: false, message: reason },
            { status: 403 }
        );
    }

    ({ allowed, reason } = await getSession("listing:create"));
    if (!allowed) {
        return NextResponse.json(
            { success: false, message: reason },
            { status: 403 }
        );
    }

    try {
        await connectToDatabase();
    } catch {
        return NextResponse.json(
            { success: false, message: "Error connecting to database." },
            { status: 500 }
        );
    }
    const formData = await request.formData();
    const entries = Array.from(formData.entries());

    // separate image and hazardTags from other fields
    const textEntries: [string, FormDataEntryValue][] = [];
    const hazardTags: string[] = [];

    for (const [key, value] of entries) {
        if (key === "image") continue;
        if (key === "hazardTags") {
            hazardTags.push(value as string);
        } else {
            textEntries.push([key, value]);
        }
    }

    // create plain JS object
    const result = Object.fromEntries(textEntries) as Partial<ListingInput>;
    result.hazardTags = hazardTags as typeof result.hazardTags;

    // convert types (since formData changed to string)
    result.quantityAvailable = Number(result.quantityAvailable);
    if (result.price) {
        result.price = Number(result.price);
    }
    if (result.expiryDate) {
        result.expiryDate = new Date(result.expiryDate as unknown as string);
    }

    const imageFiles = formData.getAll("images") as File[];

    const parsedBody = listingValidationSchema.safeParse(result);
    if (!parsedBody.success) {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid request body.",
            },
            { status: 400 }
        );
    }

    if (imageFiles.length > 0) {
        const imageUrls: string[] = [];
        for (const imageFile of imageFiles) {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const imageUrl = await uploadImage(buffer, imageFile.name);
            imageUrls.push(imageUrl);
        }
        result.imageUrls = imageUrls;
    }

    try {
        const listingData = {
            ...parsedBody.data,
            createdAt: new Date(),
        } as ListingInput;
        const listing = await addListing(listingData);
        return NextResponse.json(
            {
                success: true,
                message: "Successfully created new listing.",
                data: listing,
            },
            {
                status: 201,
                headers: { Location: `/app/listings/${listing.id}` },
            }
        );
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json(
                // don't send mongo's error - exposes design info
                { success: false, message: "This listing already exists." },
                { status: 409 }
            );
        }
        return NextResponse.json(
            {
                success: false,
                message: "Error occurred while creating new listing.",
            },
            { status: 500 }
        );
    }
}

export { GET, POST };
