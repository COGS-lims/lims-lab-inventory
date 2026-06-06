import { NextResponse } from "next/server";
import { z } from "zod";
import { Types } from "mongoose";

import { userLabRoleValues } from "@/models/UserLab";
import {
  addUserLab,
  deleteUserLab,
  getUserLab,
  getUserLabs,
  updateUserLab,
} from "@/services/UserLab";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(10).default(10),
  labId: objectIdSchema,
});

const userLabBaseSchema = z.object({
  user: objectIdSchema,
  lab: objectIdSchema,
  role: z.enum(userLabRoleValues).optional(),
});

const userLabUpdateSchema = userLabBaseSchema.partial();

function handleRouteError(error: unknown) {
  if (error instanceof Error && error.message.startsWith("Unauthorized:")) {
    return NextResponse.json(
      { message: error.message.replace("Unauthorized: ", "") },
      { status: 403 }
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { message: error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  console.error(error);
  return NextResponse.json(
    { message: "Internal server error" },
    { status: 500 }
  );
}

/**
 * Get either a single UserLab entry by ID or a paginated list of entries.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const parsedId = objectIdSchema.safeParse(id);
      if (!parsedId.success) {
        return NextResponse.json({ message: "Invalid id" }, { status: 400 });
      }

      const entry = await getUserLab(parsedId.data);
      if (!entry) {
        return NextResponse.json({ message: "UserLab not found" }, { status: 404 });
      }

      return NextResponse.json(entry, { status: 200 });
    }

    const pagination = paginationSchema.parse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      labId: searchParams.get("labId") ?? undefined,
    });
    const entries = await getUserLabs(pagination);
    return NextResponse.json(entries, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}

/**
 * Create a new UserLab entry.
 */
export async function POST(request: Request) {
  try {
    const body = userLabBaseSchema.parse(await request.json());
    const created = await addUserLab({
      user: new Types.ObjectId(body.user),
      lab: new Types.ObjectId(body.lab),
      role: body.role ?? "VIEWER",
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

/**
 * Update an existing UserLab entry by ID.
 */
export async function PUT(request: Request) {
  try {
    const validator = z.object({
      id: objectIdSchema,
      update: userLabUpdateSchema,
    });
    const parsed = validator.parse(await request.json());
    
    // Convert string IDs to ObjectIds if they exist in update
    const updateData: any = { ...parsed.update };
    if (updateData.user) updateData.user = new Types.ObjectId(updateData.user);
    if (updateData.lab) updateData.lab = new Types.ObjectId(updateData.lab);
    
    const updated = await updateUserLab(parsed.id, updateData);

    if (!updated) {
      return NextResponse.json({ message: "UserLab not found" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}

/**
 * Delete a UserLab entry by ID.
 */
export async function DELETE(request: Request) {
  try {
    const validator = z.object({ id: objectIdSchema });
    const { id } = validator.parse(await request.json());
    const deleted = await deleteUserLab(id);

    if (!deleted) {
      return NextResponse.json({ message: "UserLab not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "UserLab deleted" }, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}
