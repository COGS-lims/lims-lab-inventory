// data fetching logic

"use client";

import { useState, useEffect, useCallback } from "react";
import type {
    Item,
    ItemCreateInput,
    ItemUpdateInput,
} from "@/app/types/inventory";
import { getItems, createItem, updateItem, deleteItem } from "@/app/lib/api";

type useInventoryOptions = {
    labId?: string;
};

type useInventoryReturn = {
    // Data
    items: Item[];
    // Status
    isLoading: boolean;
    error: string | null;
    // Actions
    refresh: () => Promise<void>;
    addItem: (input: ItemCreateInput) => Promise<Item>;
    editItem: (id: string, input: ItemUpdateInput) => Promise<Item>;
    removeItem: (id: string) => Promise<void>;
};

export function useInventory(
    options: useInventoryOptions = {}
): useInventoryReturn {
    const { labId } = options;

    const [items, setItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Mocked fetch
    const refresh = useCallback(async () => {
        setIsLoading(false);
        setItems([
            {
                id: "abc0001",
                labId: "lab-001",
                name: "Nitrile Gloves",
                category: "consumable",
                quantity: 50,
                threshold: {
                    minQuantity: 10,
                    enabled: true,
                    lastAlertSentAt: "",
                },
                notificationPolicy: { event: "LOW_STOCK", audience: "PI" },
                createdAt: "",
                updatedAt: "",
            },
            {
                id: "abc0002",
                labId: "lab-001",
                name: "Centrifuge Tubes",
                category: "consumable",
                quantity: 0, // triggers "Condition: Expired" badge
                threshold: {
                    minQuantity: 5,
                    enabled: true,
                    lastAlertSentAt: "",
                },
                notificationPolicy: {
                    event: "LOW_STOCK",
                    audience: "LAB_MANAGER",
                },
                createdAt: "",
                updatedAt: "",
            },
            {
                id: "abc0003",
                labId: "lab-002",
                name: "DMEM Cell Culture",
                category: "consumable",
                quantity: 12,
                threshold: {
                    minQuantity: 3,
                    enabled: true,
                    lastAlertSentAt: "",
                },
                notificationPolicy: { event: "LOW_STOCK", audience: "PI" },
                createdAt: "",
                updatedAt: "",
            },
        ]);
    }, [labId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // True fetch (uncomment when DB situation is sorted out)
    /*     const refresh = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getItems(labId);
            setItems(data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load items."
            );
        } finally {
            setIsLoading(false);
        }
    }, [labId]); */

    // Mutations

    const addItem = useCallback(
        async (input: ItemCreateInput): Promise<Item> => {
            const newItem = await createItem(input);
            setItems(prev => [newItem, ...prev]);
            return newItem;
        },
        []
    );

    const editItem = useCallback(
        async (id: string, input: ItemUpdateInput): Promise<Item> => {
            const updated = await updateItem(id, input);
            setItems(prev =>
                prev.map(item => (item.id === id ? updated : item))
            );
            return updated;
        },
        []
    );

    const removeItem = useCallback(async (id: string): Promise<void> => {
        await deleteItem(id);
        setItems(prev => prev.filter(item => item.id !== id));
    }, []);

    return {
        items,
        isLoading,
        error,
        refresh,
        addItem,
        editItem,
        removeItem,
    };
}
