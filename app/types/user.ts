// Mirrored from models/User

export type Role = "PI" | "LAB_MANAGER" | "RESEARCHER" | "VIEWER";
export type Status = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type LabMembership = {
    labId: string;
    role: Role;
};

export type User = {
    id: string;
    ucsdId: string;
    email: string;
    name: {
        first: string;
        last: string;
    };
    role: Role;
    labs: LabMembership[];
    notificationPreferences: {
        email: boolean;
        sms: boolean;
        inApp: boolean;
    };
    safety: {
        trainingCompleted: string[];
        clearanceLevel: string;
        lastReviewedAt: string;
    };
    profile: {
        title: string;
        department: string;
        phone: string;
    };
    status: Status;
    createdAt: string;
    lastLoginAt: string;
};
