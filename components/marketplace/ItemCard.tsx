"use client";

import Link from "next/link";
import type { Listing } from "@/models/Listing";
import styles from "./ItemCard.module.css";

type Props = {
    item: Listing;
    labOwnerName?: string;
};

const CONDITION_CONFIG: Record<
    string,
    { label: string; badgeClass: string }
> = {
    New:  { label: "Condition: New",  badgeClass: styles["badge--new"] },
    Good: { label: "Condition: Good", badgeClass: styles["badge--new"] },
    Fair: { label: "Condition: Fair", badgeClass: styles["badge--used"] },
    Poor: { label: "Condition: Poor", badgeClass: styles["badge--expired"] },
};

export default function ItemCard({ item, labOwnerName }: Props) {
    const condition = CONDITION_CONFIG[item.condition] ?? CONDITION_CONFIG["Good"];
    const labDisplay = labOwnerName ?? item.labName ?? item.labId;

    return (
        <Link href={`/listings/${item.id}`} className={styles.card} style={{ textDecoration: "none", color: "inherit" }}>
            <div className={styles.imageWrapper}>
                <span className={styles.imagePlaceholder}>[image here]</span>
                <span className={`${styles.badge} ${condition.badgeClass}`}>
                    {condition.label}
                </span>
            </div>

            <div className={styles.details}>
                <div>
                    <p className={styles.itemName}>{item.itemName}</p>
                    <p className={styles.itemMeta}>
                        Qty: {item.quantityAvailable}
                        {item.price != null && item.price > 0 ? ` · $${item.price.toFixed(2)}` : ""}
                    </p>
                </div>

                {labDisplay && (
                    <div className={styles.labOwner}>
                        <p className={styles.labOwnerLabel}>Lab:</p>
                        <p className={styles.labOwnerName}>{labDisplay}</p>
                    </div>
                )}
            </div>
        </Link>
    );
}
