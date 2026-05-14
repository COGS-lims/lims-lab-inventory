"use client";

import { User } from "@/app/types/user";
import { Item } from "@/app/types/inventory";
import MyItemRow from "./MyItemRow";
import styles from "./ProfileSidebar.module.css";

type Props = {
    user: User;
    myItems: Item[];
    onEditItem: (item: Item) => void;
    onListNewItem: () => void;
    onEditProfile: () => void;
};

export default function ProfileSidebar({
    user,
    myItems,
    onEditItem,
    onListNewItem,
    onEditProfile,
}: Props) {
    const displayName = `${user.name.first} ${user.name.last}`.trim();
    const labLabel = user.labs.length > 0 ? "Lab" : user.role;

    return (
        <aside className={styles.sidebar}>
            {/* Profile header */}
            <div className={styles.profileHeader}>
                <div className={styles.avatar}>
                    <svg
                        className={styles.avatarIcon}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                        />
                    </svg>
                </div>

                <div>
                    <p className={styles.displayName}>{displayName}</p>
                    <p className={styles.labLabel}>{labLabel}</p>
                    <p className={styles.email}>Email: {user.email}</p>
                </div>

                <button
                    onClick={onEditProfile}
                    className={styles.editProfileBtn}
                >
                    Edit profile
                </button>
            </div>

            <hr className={styles.divider} />

            {/* My Items */}
            <div className={styles.myItemsSection}>
                <p className={styles.myItemsLabel}>My Items:</p>

                {myItems.length === 0 ? (
                    <p className={styles.myItemsEmpty}>No items listed yet.</p>
                ) : (
                    <div className={styles.myItemsList}>
                        {myItems.map(item => (
                            <MyItemRow
                                key={item.id}
                                item={item}
                                onEdit={onEditItem}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* List new item */}
            <button onClick={onListNewItem} className={styles.listNewBtn}>
                List new item
                <svg
                    className={styles.listNewIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </button>
        </aside>
    );
}
