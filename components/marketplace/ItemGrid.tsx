"use client";

import type { Listing } from "@/models/Listing";
import ItemCard from "./ItemCard";
import styles from "./ItemGrid.module.css";

type Props = {
    items: Listing[];
    isLoading: boolean;
    error: string | null;
    labNames?: Record<string, string>;
};

export default function ItemGrid({
    items,
    isLoading,
    error,
    labNames = {},
}: Props) {
    if (isLoading) {
        return (
            <div className={styles.grid}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={styles.skeleton} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className={`${styles.stateBox} ${styles["stateBox--error"]}`}>
                {error}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className={`${styles.stateBox} ${styles["stateBox--empty"]}`}>
                No items found.
            </div>
        );
    }

    return (
        <div className={styles.grid}>
            {items.map(item => (
                <ItemCard
                    key={item.id}
                    item={item}
                    labOwnerName={labNames[item.labId]}
                />
            ))}
        </div>
    );
}
