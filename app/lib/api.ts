// typed client side api functions
import type {
    Item,
    ItemListResponse,
    ItemSingleResponse,
    ItemCreateInput,
    ItemUpdateInput,
} from "@/app/types/inventory";

const BASE_URL = "/api/inventory";

// Handler helper
async function handleResponse<T>(res: Response): Promise<T> {
    const json = await res.json();
    if (!res.ok || !json.success) {
        throw new Error(json.error ?? `Request failed: ${res.status}`);
    }
    return json.data as T;
}

// API functions
// Fetch all items, optionally filtered by labId
export async function getItems(labId?: string): Promise<Item[]> {
    const url = labId
        ? `${BASE_URL}?labId=${encodeURIComponent(labId)}`
        : BASE_URL;
    const res = await fetch(url);
    return handleResponse<Item[]>(res);
}

// Fetch a single item by id
export async function getItem(id: string): Promise<Item> {
    const res = await fetch(`${BASE_URL}/${id}`);
    return handleResponse<Item>(res);
}

// Create a new item
export async function createItem(input: ItemCreateInput): Promise<Item> {
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });
    return handleResponse<Item>(res);
}

// Partially update existing item
export async function updateItem(
    id: string,
    input: ItemUpdateInput
): Promise<Item> {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });
    return handleResponse<Item>(res);
}

// Delete item by id
export async function deleteItem(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `Delete failed: ${res.status}`);
    }
}
