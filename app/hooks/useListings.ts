"use client";

import { useState, useEffect, useCallback } from "react";
import type { Listing } from "@/models/Listing";

type UseListingsReturn = {
    listings: Listing[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
};

export function useListings(): UseListingsReturn {
    const [listings, setListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/listings");
            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.message ?? `Request failed: ${res.status}`);
            }
            setListings(json.data as Listing[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load listings.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { listings, isLoading, error, refresh };
}
