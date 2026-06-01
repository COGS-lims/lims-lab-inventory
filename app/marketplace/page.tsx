"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useListings } from "@/app/hooks/useListings";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";
import ItemGrid from "@/components/marketplace/ItemGrid";
import MarketplaceFilters, {
    FilterState,
} from "@/components/marketplace/MarketplaceFilters";
import ProfileSidebar from "@/components/marketplace/ProfileSidebar";
import type { Listing } from "@/models/Listing";
import styles from "./page.module.css";

export default function MarketplacePage() {
    const router = useRouter();
    const { user: currentUser, isLoading: userLoading, error: userError } = useCurrentUser();

    const { listings, isLoading, error } = useListings();

    const [filters, setFilters] = useState<FilterState>({
        search: "",
        category: "",
        labId: "",
    });

    // Filtered listings for the grid
    const filteredItems = useMemo(() => {
        return listings.filter(listing => {
            if (
                filters.search &&
                !listing.itemName.toLowerCase().includes(filters.search.toLowerCase())
            ) {
                return false;
            }
            if (filters.labId && listing.labId !== filters.labId) {
                return false;
            }
            return true;
        });
    }, [listings, filters]);

    // Listings belonging to the current user's labs (for sidebar)
    const myLabIds = new Set((currentUser?.labs ?? []).map(l => l.labId));
    const myItems = listings.filter(listing => myLabIds.has(listing.labId));

    // Derive lab options for the filter dropdown from available listings
    const labOptions = useMemo(() => {
        const seen = new Map<string, string>();
        listings.forEach(listing => {
            if (!seen.has(listing.labId)) {
                seen.set(listing.labId, listing.labName || listing.labId);
            }
        });
        return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
    }, [listings]);

    function handleEditItem(listing: Listing) {
        router.push(`/listings/${listing.id}/edit`);
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
