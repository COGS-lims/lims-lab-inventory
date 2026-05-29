"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useInventory } from "@/app/hooks/useInventory";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";
import ItemGrid from "@/components/marketplace/ItemGrid";
import MarketplaceFilters, {
    FilterState,
} from "@/components/marketplace/MarketplaceFilters";
import ProfileSidebar from "@/components/marketplace/ProfileSidebar";
import type { Item } from "@/app/types/inventory";
import styles from "./page.module.css";

export default function MarketplacePage() {
    const router = useRouter();
    const { user: currentUser, isLoading: userLoading, error: userError } = useCurrentUser();

    const { items, isLoading, error } = useInventory();

    const [filters, setFilters] = useState<FilterState>({
        search: "",
        category: "",
        labId: "",
    });

    // Filtered items for the grid
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            if (
                filters.search &&
                !item.name.toLowerCase().includes(filters.search.toLowerCase())
            ) {
                return false;
            }
            if (filters.category && item.category !== filters.category) {
                return false;
            }
            if (filters.labId && item.labId !== filters.labId) {
                return false;
            }
            return true;
        });
    }, [items, filters]);

    // Items belonging to the current user's labs (for sidebar)
    const myLabIds = new Set((currentUser?.labs ?? []).map(l => l.labId));
    const myItems = items.filter(item => myLabIds.has(item.labId));

    // Derive lab options for the filter dropdown from available items
    const labOptions = useMemo(() => {
        const seen = new Map<string, string>();
        items.forEach(item => {
            if (!seen.has(item.labId)) {
                // TODO: replace value with resolved lab name once you have a labs API
                seen.set(item.labId, item.labId);
            }
        });
        return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
    }, [items]);

    // Handlers (stubs — wire up to form/modal later)
    function handleEditItem(item: Item) {
        router.push(`/listings/${item.id}/edit`);
    }

    function handleListNewItem() {
        router.push("/listings/new");
    }

    function handleEditProfile() {
        router.push("/profile");
    }

    if (userLoading) {
        return <div className={styles.page}>Loading...</div>;
    }

    if (userError || !currentUser) {
        return <div className={styles.page}>Failed to load user session.</div>;
    }

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <div className={styles.content}>
                    <MarketplaceFilters
                        labOptions={labOptions}
                        onChange={setFilters}
                    />
                    <ItemGrid
                        items={filteredItems}
                        isLoading={isLoading}
                        error={error}
                    />
                </div>

                <ProfileSidebar
                    user={currentUser}
                    myItems={myItems}
                    onEditItem={handleEditItem}
                    onListNewItem={handleListNewItem}
                    onEditProfile={handleEditProfile}
                />
            </main>
        </div>
    );
}
