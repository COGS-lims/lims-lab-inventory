"use client";

import { Item } from "@/app/types/inventory";
import styles from "./ItemCard.module.css";

type Props = {
    item: Item;
    labOwnerName?: string;
};

type ConditionKey = "new" | "used" | "expired";

const CONDITION_CONFIG: Record<
    ConditionKey,
    { label: string; badgeClass: string }
> = {
    new: { label: "Condition: New", badgeClass: styles["badge--new"] },
    used: { label: "Condition: Used", badgeClass: styles["badge--used"] },
    expired: {
        label: "Condition: Expired",
        badgeClass: styles["badge--expired"],
    },
};

export default function ItemCard({ item, labOwnerName }: Props) {
    // Heuristic until a condition field is added to the schema
    const conditionKey: ConditionKey = item.quantity === 0 ? "expired" : "new";
    const condition = CONDITION_CONFIG[conditionKey];

    return (
        <div className={styles.card}>
            {/* Image placeholder for now */}
            <div className={styles.imageWrapper}>
                <span className={styles.imagePlaceholder}>[image here]</span>
                <span className={`${styles.badge} ${condition.badgeClass}`}>
                    {condition.label}
                </span>
            </div>

            {/* Details */}
            <div className={styles.details}>
                <div>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemMeta}>
                        Qty: {item.quantity} · {item.category}
                    </p>
                </div>

                {labOwnerName && (
                    <div className={styles.labOwner}>
                        <p className={styles.labOwnerLabel}>Lab owner:</p>
                        <p className={styles.labOwnerName}>{labOwnerName}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
