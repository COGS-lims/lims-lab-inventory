"use client";

import { useState } from "react";
import { categoryValues, Category } from "@/app/types/inventory";
import styles from "./MarketplaceFilters.module.css";

export type FilterState = {
    search: string;
    category: Category | "";
    labId: string;
    condition: string | "";
    expiryFilter: "all" | "expired" | "expiring-soon";
};

type Props = {
    labOptions: { id: string; name: string }[];
    onChange: (filters: FilterState) => void;
};

const FILTER_PILLS = ["Category", "Lab", "Condition", "Expiry"] as const;
type FilterPill = (typeof FILTER_PILLS)[number];
const CONDITIONS = ["New", "Good", "Fair", "Poor"];

export default function MarketplaceFilters({ labOptions, onChange }: Props) {
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterPill | null>(null);
    const [category, setCategory] = useState<Category | "">("");
    const [labId, setLabId] = useState("");
    const [condition, setCondition] = useState<string | "">("");
    const [expiryFilter, setExpiryFilter] = useState<"all" | "expired" | "expiring-soon">("all");

    function emit(updates: Partial<FilterState>) {
        onChange({ search, category, labId, condition, expiryFilter, ...updates });
    }

    function handleSearch(value: string) {
        setSearch(value);
        emit({ search: value });
    }

    function handleCategory(value: Category | "") {
        setCategory(value);
        setActiveFilter(null);
        emit({ category: value });
    }

    function handleLab(value: string) {
        setLabId(value);
        setActiveFilter(null);
        emit({ labId: value });
    }

    function handleCondition(value: string | "") {
        setCondition(value);
        setActiveFilter(null);
        emit({ condition: value });
    }

    function handleExpiry(value: "all" | "expired" | "expiring-soon") {
        setExpiryFilter(value);
        setActiveFilter(null);
        emit({ expiryFilter: value });
    }

    return (
        <div className={styles.wrapper}>
            {/* Search bar */}
            <div className={styles.searchBar}>
                <svg
                    className={styles.searchIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                    />
                </svg>

                <input
                    type="text"
                    placeholder="Search items..."
                    value={search}
                    onChange={e => handleSearch(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            {/* Filter pills */}
            <div className={styles.pills}>
                {FILTER_PILLS.map(pill => {
                    const isActive = activeFilter === pill;
                    const hasValue =
                        (pill === "Category" && category !== "") ||
                        (pill === "Lab" && labId !== "") ||
                        (pill === "Condition" && condition !== "") ||
                        (pill === "Expiry" && expiryFilter !== "all");

                    return (
                        <button
                            key={pill}
                            onClick={() =>
                                setActiveFilter(isActive ? null : pill)
                            }
                            className={`${styles.pill} ${isActive || hasValue ? styles["pill--active"] : ""}`}
                        >
                            {pill}
                        </button>
                    );
                })}
            </div>

            {/* Category dropdown */}
            {activeFilter === "Category" && (
                <div className={styles.dropdown}>
                    <button
                        onClick={() => handleCategory("")}
                        className={`${styles.dropdownOption} ${category === "" ? styles["dropdownOption--selected"] : ""}`}
                    >
                        All categories
                    </button>
                    {categoryValues.map(c => (
                        <button
                            key={c}
                            onClick={() => handleCategory(c)}
                            className={`${styles.dropdownOption} ${styles["dropdownOption--capitalize"]} ${category === c ? styles["dropdownOption--selected"] : ""}`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            )}

            {/* Lab dropdown */}
            {activeFilter === "Lab" && (
                <div className={styles.dropdown}>
                    <button
                        onClick={() => handleLab("")}
                        className={`${styles.dropdownOption} ${labId === "" ? styles["dropdownOption--selected"] : ""}`}
                    >
                        All labs
                    </button>
                    {labOptions.map(lab => (
                        <button
                            key={lab.id}
                            onClick={() => handleLab(lab.id)}
                            className={`${styles.dropdownOption} ${labId === lab.id ? styles["dropdownOption--selected"] : ""}`}
                        >
                            {lab.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Condition dropdown */}
            {activeFilter === "Condition" && (
                <div className={styles.dropdown}>
                    <button
                        onClick={() => handleCondition("")}
                        className={`${styles.dropdownOption} ${condition === "" ? styles["dropdownOption--selected"] : ""}`}
                    >
                        All conditions
                    </button>
                    {CONDITIONS.map(c => (
                        <button
                            key={c}
                            onClick={() => handleCondition(c)}
                            className={`${styles.dropdownOption} ${condition === c ? styles["dropdownOption--selected"] : ""}`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            )}

            {/* Expiry dropdown */}
            {activeFilter === "Expiry" && (
                <div className={styles.dropdown}>
                    <button
                        onClick={() => handleExpiry("all")}
                        className={`${styles.dropdownOption} ${expiryFilter === "all" ? styles["dropdownOption--selected"] : ""}`}
                    >
                        All items
                    </button>
                    <button
                        onClick={() => handleExpiry("expiring-soon")}
                        className={`${styles.dropdownOption} ${expiryFilter === "expiring-soon" ? styles["dropdownOption--selected"] : ""}`}
                    >
                        Expiring soon (30 days)
                    </button>
                    <button
                        onClick={() => handleExpiry("expired")}
                        className={`${styles.dropdownOption} ${expiryFilter === "expired" ? styles["dropdownOption--selected"] : ""}`}
                    >
                        Expired items
                    </button>
                </div>
            )}
        </div>
    );
}