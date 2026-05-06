"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useInventory } from "@/app/hooks/useInventory";
import ItemGrid from "@/components/marketplace/ItemGrid";
import MarketplaceFilters, {
    FilterState,
} from "@/components/marketplace/MarketplaceFilters";
import ProfileSidebar from "@/components/marketplace/ProfileSidebar";
import type { Item } from "@/app/types/inventory";
import type { User } from "@/app/types/user";
import styles from "./page.module.css";

// Mock user, replce with real later
const MOCK_USER: User = {
    id: "mock-user-id",
    ucsdId: "A12345678",
    email: "shengxu@ucsd.edu",
    name: { first: "Dr. Xu", last: "" },
    role: "PI",
    labs: [{ labId: "lab-001", role: "PI" }],
    notificationPreferences: { email: true, sms: false, inApp: true },
    safety: { trainingCompleted: [], clearanceLevel: "", lastReviewedAt: "" },
    profile: { title: "Professor", department: "Chemistry", phone: "" },
    status: "ACTIVE",
    createdAt: "",
    lastLoginAt: "",
};
// ─────────────────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
    const router = useRouter();
    const currentUser = MOCK_USER; // swap with real auth

    const { items, isLoading, error } = useInventory();

    const [filters, setFilters] = useState<FilterState>({
        search: "",
        category: "",
        labId: "",
    });

    // ── Filtered items for the grid ───────────────────────────────────────────
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

    // ── Items belonging to the current user's labs (for sidebar) ─────────────
    const myLabIds = new Set(currentUser.labs.map(l => l.labId));
    const myItems = items.filter(item => myLabIds.has(item.labId));

    // ── Derive lab options for the filter dropdown from available items ───────
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

    // ── Handlers (stubs — wire up to your form/modal later) ──────────────────
    function handleEditItem(item: Item) {
        router.push(`/listings/${item.id}/edit`);
    }

    function handleListNewItem() {
        router.push("/listings/new");
    }

    function handleEditProfile() {
        console.log("Edit profile");
        // TODO: navigate to profile page or open modal
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
