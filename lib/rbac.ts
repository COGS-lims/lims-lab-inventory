import { connectToDatabase } from "@/lib/mongoose";
import { auth } from "@/auth";
import { User, Role, IUser } from "@/models/User";

// establish the role permissions

const ROLE_PERMISSIONS: Record<Role, string[]> = {
    PI: [
        "inventory:create",
        "inventory:update",
        "inventory:delete",
        "inventory:set_threshold",
        "transfer:approve",
        "payment:approve",
        "lab:manage_users",
        "inventory:view"
    ],
    LAB_MANAGER: [
        "inventory:create",
        "inventory:update",
        "inventory:set_threshold",
        "transfer:request",
        "lab:manage_users",
        "inventory:view"
    ],
    RESEARCHER: [
        "inventory:view",
        "transfer:request",
        "listing:create"
    ],
    VIEWER: [
        "inventory:view"
    ]
};

// checks if the user has permission to perform an action

export async function getSession(permission: string) {
    const session = await auth();

    if (!session?.user?.email) {
        return { allowed: false, user: null, reason: "Unauthenticated" };
    }

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email }).lean<IUser>();

    if (!user){
        return { allowed: false, user: null, reason: "User not found" };
    }

    if (user.status !== "ACTIVE") {
        return { allowed: false, user, reason: "Account inactive" };
    }

    const allowed = ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false;
    return { allowed, user, reason: allowed ? undefined : "Insufficient permissions" };
}
