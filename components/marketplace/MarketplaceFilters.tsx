"use client";

import { useState } from "react";
import { categoryValues, Category } from "@/app/types/inventory";
import styles from "./MarketplaceFilters.module.css";

export type FilterState = {
    search: string;
    category: Category | "";
    labId: string;
};

type Props = {
    labOptions: { id: string; name: string }[];
    onChange: (filters: FilterState) => void;
};

const FILTER_PILLS = ["Category", "Lab", "Expiry", "Tags"] as const;
type FilterPill = (typeof FILTER_PILLS)[number];

export default function MarketplaceFilters({ labOptions, onChange }: Props) {
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterPill | null>(null);
    const [category, setCategory] = useState<Category | "">("");
    const [labId, setLabId] = useState("");

    function emit(updates: Partial<FilterState>) {
        onChange({ search, category, labId, ...updates });
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

    return (
        <div className={styles.wrapper}>
            {/* Search bar + pills */}
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

                <div className={styles.pills}>
                    {FILTER_PILLS.map(pill => {
                        const isActive = activeFilter === pill;
                        const hasValue =
                            (pill === "Category" && category !== "") ||
                            (pill === "Lab" && labId !== "");

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

            {/* Coming soon */}
            {(activeFilter === "Expiry" || activeFilter === "Tags") && (
                <div className={styles.dropdown}>
                    <p className={styles.dropdownComingSoon}>Coming soon</p>
                </div>
            )}
        </div>
    );
}
