import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { z } from "zod";
import {
  deleteListing,
  getListing,
  updateListing,
} from "@/services/listings/listings";
import { ListingInput } from "@/models/Listing";
import { uploadImage } from "@/lib/googleCloud";
import { getSession } from "@/lib/rbac";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");
const listingValidationSchema = z
  .object({
    itemName: z.string(),
    itemId: z.string(),
    labName: z.string(),
    labLocation: z.string(),
    labId: z.string(),
    imageUrls: z.array(z.string()),
    quantityAvailable: z.number(),
    expiryDate: z.date(),
    description: z.string(),
    price: z.number(),
    status: z.enum(["ACTIVE", "INACTIVE"]),
    condition: z.enum(["New", "Good", "Fair", "Poor"]),
    hazardTags: z.array(
      z.enum(["Physical", "Chemical", "Biological", "Other"])
    ),
  })
  .partial()
  .strict();

/**
 * Get a listing entry by ID
 * @param id the ID of the listing to get
 * ex req: GET /listings/001 HTTP/1.1
 * @returns the listing as a JS object in a JSON response
 */
async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params;
  const parsedId = objectIdSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid ID format. Must be a valid MongoDB ObjectId.",
      },
      { status: 400 }
    );
  }

  try {
    const listing = await getListing(parsedId.data); // don't need mongo doc features
    if (!listing) {
      return NextResponse.json(
        { success: false, message: "Listing not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: listing }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Error occurred while retrieving listing." },
      { status: 500 }
    );
  }
}

/**
 * Update a listing entry by ID
 * @param id the ID of the listing to get as part of the path params
 * @returns the updated listing as a JS object in a JSON response
 */
async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { allowed, reason } = await getSession("inventory:update");
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

  const { id } = await params;
  const parsedId = objectIdSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid ID format. Must be a valid MongoDB ObjectId.",
      },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const updateData: Partial<ListingInput> = Object.fromEntries(
    Array.from(formData.entries()).filter(([, v]) => !(v instanceof File))
  ) as Partial<ListingInput>;

  // handle array fields
  const hazardTags = formData.getAll("hazardTags");
  if (hazardTags.length > 0) {
    updateData.hazardTags = hazardTags as ListingInput["hazardTags"];
  }

  // type conversions
  if (updateData.quantityAvailable !== undefined) {
    updateData.quantityAvailable = Number(updateData.quantityAvailable);
  }

  if (updateData.price !== undefined) {
    updateData.price = Number(updateData.price);
  }

  if (updateData.expiryDate !== undefined) {
    const raw = updateData.expiryDate as unknown as string;
    if (raw === "") {
      delete updateData.expiryDate;
    } else {
      updateData.expiryDate = new Date(raw);
    }
  }

  // handle image uploads if provided
  const imageFiles = (formData.getAll("images") as File[]).filter(f => f.size > 0);

  const parsedRequest = listingValidationSchema.safeParse(updateData);
  if (!parsedRequest.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request body.",
      },
      { status: 400 }
    );
  }

  const gcsReady = !!(
    process.env.GOOGLE_CLOUD_BUCKET_NAME &&
    process.env.GOOGLE_CLOUD_CLIENT_EMAIL &&
    process.env.GOOGLE_CLOUD_PROJECT_ID
  );
  if (imageFiles.length > 0 && gcsReady) {
    const imageUrls: string[] = [];

    for (const imageFile of imageFiles) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const imageUrl = await uploadImage(buffer, imageFile.name);
      imageUrls.push(imageUrl);
    }

    updateData.imageUrls = imageUrls;
  }

  try {
    const updatedListing = await updateListing(
      parsedId.data,
      parsedRequest.data
    );

    if (!updatedListing) {
      return NextResponse.json(
        {
          success: false,
          message: "Listing not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedListing,
        message: "Listing successfully updated.",
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Error occurred while updating listing.",
      },
      { status: 500 }
    );
  }
}

/**
 * Delete a listing entry by ID
 * @param id the ID of the listing to get as part of the path params
 * @returns JSON response signaling the success of the listing deletion
 */
async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { allowed, user, reason } = await getSession("inventory:delete");
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

  const { id } = await params;
  const parsedId = objectIdSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid ID format. Must be a valid MongoDB ObjectId.",
      },
      { status: 400 }
    );
  }

  try {
    const listing = await getListing(parsedId.data);
    if (!listing) {
      return NextResponse.json(
        { success: false, message: "Listing not found" },
        { status: 404 }
      );
    }

    const userLabIds = new Set((user!.labs ?? []).map((l: any) => String(l.labId)));
    if (!userLabIds.has(listing.labId)) {
      return NextResponse.json(
        { success: false, message: "You can only delete listings from your own lab." },
        { status: 403 }
      );
    }

    await deleteListing(parsedId.data);
    return NextResponse.json(
      {
        success: true,
        message: "Listing successfully deleted.",
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Error occurred while deleting listing.",
      },
      { status: 500 }
    );
  }
}

export { GET, PUT, DELETE };
