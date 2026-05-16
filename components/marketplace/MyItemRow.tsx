"use client";

import { Item } from "@/app/types/inventory";
import styles from "./MyItemRow.module.css";

type Props = {
    item: Item;
    onEdit: (item: Item) => void;
};

export default function MyItemRow({ item, onEdit }: Props) {
    return (
        <div className={styles.row}>
            <div>
                <p className={styles.itemName}>{item.name}</p>
                <p className={styles.itemId}>
                    ID: {item.id.slice(-7).toUpperCase()}
                </p>
            </div>

            <button onClick={() => onEdit(item)} className={styles.editButton}>
                Edit item
                <svg
                    className={styles.editIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 0 1 2.828 2.828L11.828 15.828a4 4 0 0 1-2.828 1.172H7v-2a4 4 0 0 1 1.172-2.828z"
                    />
                </svg>
            </button>
        </div>
    );
}
