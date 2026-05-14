// shared ts types for client side / frontend
// closely mirrored from models/Item.ts

export const categoryValues = ["consumable"] as const;
export type Category = (typeof categoryValues)[number];

export const notificationEventValues = ["LOW_STOCK"] as const;
export type NotificationEvent = (typeof notificationEventValues)[number];

export const notificationAudienceValues = [
    "PI",
    "LAB_MANAGER",
    "RESEARCHER",
    "VIEWER",
] as const;
export type NotificationAudience = (typeof notificationAudienceValues)[number];

export type Threshold = {
    minQuantity: number;
    enabled: boolean;
    lastAlertSentAt: string;
};

export type NotificationPolicy = {
    event: NotificationEvent;
    audience: NotificationAudience;
};

// Core item type
export type Item = {
    id: string;
    labId: string;
    name: string;
    category: Category;
    quantity: number;
    threshold: Threshold;
    notificationPolicy: NotificationPolicy;
    createdAt: string;
    updatedAt: string;
};

// Input types
export type ItemCreateInput = {
    labId: string;
    name: string;
    category: Category;
    quantity: number;
    threshold: Threshold;
    notificationPolicy: NotificationPolicy;
};

export type ItemUpdateInput = Partial<ItemCreateInput>;

// API response shapes

export type ApiResponse<T> =
    | { success: true; data: T }
    | { success: false; error: string };

export type ItemListResponse = ApiResponse<Item[]>;
export type ItemSingleResponse = ApiResponse<Item>;
