"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { User } from "@/app/types/user";

type UseCurrentUserReturn = {
    user: User | null;
    isLoading: boolean;
    error: string | null;
};

export function useCurrentUser(): UseCurrentUserReturn {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated" || !session) {
            setIsLoading(false);
            setError("Not authenticated");
            return;
        }

        let cancelled = false;

        async function fetchUser() {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/users/me");
                const json = await res.json();
                if (!res.ok || !json.success) {
                    throw new Error(json.error ?? `Request failed: ${res.status}`);
                }
                if (!cancelled) setUser(json.data as User);
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load user.");
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        fetchUser();
        return () => { cancelled = true; };
    }, [session, status]);

    return { user, isLoading, error };
}
