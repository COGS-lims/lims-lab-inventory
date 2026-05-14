"use client";

import { Item } from "@/app/types/inventory";
import ItemCard from "./ItemCard";
import styles from "./ItemGrid.module.css";

type Props = {
    items: Item[];
    isLoading: boolean;
    error: string | null;
    /** Optional map of labId -> display name for the "Lab owner" label */
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
