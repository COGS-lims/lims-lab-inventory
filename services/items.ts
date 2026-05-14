import { connectToDatabase } from "@/lib/mongoose";
import ItemModel, {
    Item,
    ItemCreateInput,
    ItemUpdateInput,
    toItem,
    toItemFromLean,
} from "@/models/Item";
import { getSession } from "@/lib/rbac";

type getItemOptions = {
    page?: number;
    limit?: number;
    labId?: string;
    name?: string;
};

/**
 * Returns all items (Likely unused in favor of filteredGet)
 * @returns all items in the form of a JS Object
 */
export async function getItems(): Promise<Item[]> {
    const { allowed, user, reason } = await getSession("permission:name");

    if (!allowed) {
        throw new Error(`Unauthorized: ${reason}`);
    }
    await connectToDatabase();
    const items = await ItemModel.find().lean().exec();
    return items.map(item => toItemFromLean(item));
}

/**
 * Get items based on filter params
 * @param options options for filtering (page number, entries per page, labId, and name)
 * @returns filtered items in the form of a JS object
 */
export async function filteredGet(options: getItemOptions) {
    const { allowed, user, reason } = await getSession("permission:name");

    if (!allowed) {
        throw new Error(`Unauthorized: ${reason}`);
    }
    await connectToDatabase();
    const page = Math.max(1, Math.floor(options?.page ?? 1));
    const limit = Math.max(1, Math.min(Math.floor(options?.limit ?? 10), 50));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (options?.labId) {
        query.labId = options.labId;
    }

    if (options?.name?.trim()) {
        query.name = { $regex: options.name.trim(), $options: "i" };
    }

    const [items, total] = await Promise.all([
        ItemModel.find(query)
            .sort({ createdAt: -1, _id: -1 }) // sorts by ID if same createdAt
            .skip(skip)
            .limit(limit)
            .lean()
            .exec(),
        ItemModel.countDocuments(query).exec(),
    ]);

    return {
        data: items,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        },
    };
}

/**
 * Returns an item by id
 * @param id the ID of the listing to get
 * @returns the listing in the form of a JS Object
 */
export async function getItem(id: string): Promise<Item | null> {
    const { allowed, user, reason } = await getSession("permission:name");

    if (!allowed) {
        throw new Error(`Unauthorized: ${reason}`);
    }
    await connectToDatabase();
    const item = await ItemModel.findById(id).lean().exec();
    return item ? toItemFromLean(item) : null;
}

/**
 * Adds an item. Should check for perms once RBAC has been implemented
 * @param newItem the new Item to add
 * @returns the added item in the form of a JS Object
 */
export async function addItem(newItem: ItemCreateInput): Promise<Item> {
    const { allowed, user, reason } = await getSession("permission:name");

    if (!allowed) {
        throw new Error(`Unauthorized: ${reason}`);
    }
    await connectToDatabase();
    const created = await ItemModel.create(newItem);
    return toItem(created);
}

/**
 * Update listing item by id. Runs loose item schema validation
 * @param id the ID of the listing to update
 * @param data the data to update the listing with
 * @returns the updated listing or null if not found
 */
// If strict validation is wanted, use an upsert instead
export async function updateItem(
    id: string,
    data: ItemUpdateInput
): Promise<Item | null> {
    const { allowed, user, reason } = await getSession("permission:name");

    if (!allowed) {
        throw new Error(`Unauthorized: ${reason}`);
    }
    await connectToDatabase();
    const updated = await ItemModel.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    }).exec();
    return updated ? toItem(updated) : null;
}

/**
 * Delete an item entry by ID
 * @param id the ID of the item to delete
 * @returns true if the item was deleted, false otherwise
 */
// Don't use this for tables where nothing needs to be deleted
// Could be accidentally or maliciously used to get rid of important data
export async function deleteItem(id: string): Promise<boolean> {
    const { allowed, user, reason } = await getSession("permission:name");

    if (!allowed) {
        throw new Error(`Unauthorized: ${reason}`);
    }
    await connectToDatabase();
    const deleted = await ItemModel.findByIdAndDelete(id).exec();
    return Boolean(deleted);
}
