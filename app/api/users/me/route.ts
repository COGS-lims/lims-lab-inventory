import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserByEmail } from "@/services/user";

export async function GET() {
    const session = await auth();

    if (!session?.user?.email) {
        return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    try {
        const user = await getUserByEmail(session.user.email);
        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        const doc = user as any;
        return NextResponse.json({
            success: true,
            data: {
                id: String(doc._id),
                ucsdId: doc.ucsdId,
                email: doc.email,
                name: doc.name,
                role: doc.role,
                labs: (doc.labs ?? []).map((l: any) => ({
                    labId: String(l.labId),
                    role: l.role,
                })),
                notificationPreferences: doc.notificationPreferences,
                safety: doc.safety,
                profile: {
                    title: doc.profile?.title,
                    department: doc.profile?.department,
                    phone: doc.profile?.phone,
                    pronouns: doc.profile?.pronouns,
                    description: doc.profile?.description,
                },
                status: doc.status,
                createdAt: doc.createdAt,
                lastLoginAt: doc.lastLoginAt,
            },
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Internal server error";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
