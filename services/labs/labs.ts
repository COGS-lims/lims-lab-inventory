import type { HydratedDocument }from "mongoose";

import { connectToDatabase } from "@/lib/mongoose";
import { getSession } from "@/lib/rbac";
import LabModel, { Lab, LabInput, toLab, toLabFromLean } from "@/models/Lab";

export type GetLabOptions = { page?: number; limit?: number };
export type LabPayload = Pick<Lab, "name" | "department" | "createdAt">;

/**
 * Get all lab entries
 * @returns an array of labs
 */
export async function getLabs(options?: GetLabOptions) {
    const { allowed, user, reason } = await getSession("inventory:view");
    if (!allowed) {
        throw new Error(`Unauthorized: ${reason}`);
    }

    await connectToDatabase();
    const page = Math.max(options?.page ?? 1, 1);
    const limit = Math.max(options?.limit ?? 10, 1);
    const skip = (page - 1) * limit;

    const [labs, total] = await Promise.all([
        LabModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
        LabModel.countDocuments().exec(),
    ]);

    return {data: labs.map(lab => toLabFromLean(lab)), pagination: {page, limit, total, totalPages: Math.ceil(total / limit)}};
};


/**
 * Get a lab entry by ID
 * @param id the ID of the lab to fetch
 * @returns the lab
 */
export async function getLab(id: string): Promise<Lab | null> {
    const { allowed, user, reason } = await getSession("inventory:view");
    if (!allowed) {
        throw new Error(`Unauthorized: ${reason}`);
    }

    await connectToDatabase();
    const lab = await LabModel.findById(id).lean().exec();
    return lab ? toLabFromLean(lab) : null;
}

/**
 * Add a new lab entry
 * @param newLab the lab data to add
 * @returns the created lab
 */
export async function addLab(newLab: LabInput | Omit<Lab, 'id'>): Promise<Lab> {
    const { allowed, user, reason } = await getSession("inventory:create");
    if (!allowed) {
        throw new Error(`Unauthorized: ${reason}`);
    }

    await connectToDatabase();
    const createdLab = await LabModel.create(newLab);
    return toLab(createdLab);
}

/**
 * Update a lab entry by ID
 * @param id the ID of the lab to update
 * @param data the data to update
 * @returns the updated lab or null if not found
 */
export async function updateLab(
    id: string,
    data: Partial<Lab>,
): Promise<Lab | null> {
    const { allowed, user, reason } = await getSession("inventory:update");
    if (!allowed) {
        throw new Error(`Unauthorized: ${reason}`);
    }

    await connectToDatabase();
    const updatedLab = await LabModel.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    }).exec();
    return updatedLab ? toLab(updatedLab) : null;
}

/**
 * Delete a lab entry by ID
 * @param id the ID of the lab to delete
 * @returns true if the lab was deleted, false otherwise
 */
// DON'T use this for tables that you don't actually need to potentially delete things from
// Could be used accidentally or misused maliciously to get rid of important data
export async function deleteLab(id: string): Promise<boolean> {
    const { allowed, user, reason } = await getSession("inventory:delete");
    if (!allowed) {
        throw new Error(`Unauthorized: ${reason}`);
    }

    await connectToDatabase();
    const lab = await LabModel.findById(id).exec();
    if (!lab) {
        return false;
    }
    const deleted = await lab.deleteOne();
    return Boolean(deleted);
}