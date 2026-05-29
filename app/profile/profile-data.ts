import { connectToDatabase } from "@/lib/mongoose";
import UserLab from "@/models/UserLab";
import { User } from "@/models/User";

export type Affiliation = {
    id: string;
    labName: string;
    role: string;
    joined: string;
};

export const profileSeed = {
    name: "Dr. Xu",
    pronouns: "He/him",
    bio: "Experienced principal investigator at a lab specializing in computational neuroscience. Our lab focuses on developing innovative techniques for analysis in computational neuroscience.",
    email: "xu@ucsd.edu",
    phone: "(xxx) xxx-xxxx",
    status: "Active",
};

export const sampleAffiliations: Affiliation[] = [
    {
        id: "xu-comp-neuro",
        labName: "Xu Computational Neuroscience Lab",
        role: "Principal Investigator (PI)",
        joined: "March 2026",
    },
    {
        id: "cognitive-systems-core",
        labName: "Cognitive Systems Core",
        role: "Lab Advisor",
        joined: "January 2025",
    },
];

const roleLabels: Record<string, string> = {
    PI: "PI",
    LAB_MANAGER: "Lab Manager",
    RESEARCHER: "Researcher",
    VIEWER: "Viewer",
};

function formatJoined(date: Date | string | undefined) {
    if (!date) {
        return "Unknown";
    }

    const parsed = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(parsed.getTime())) {
        return "Unknown";
    }

    return parsed.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
    });
}

export async function getOrCreateDemoProfileUser() {
    await connectToDatabase();

    const existing = await User.findOne({ email: profileSeed.email }).exec();
    if (existing) {
        return existing;
    }

    return User.create({
        ucsdId: "A12345678",
        email: profileSeed.email,
        name: { first: "Dr.", last: "Xu" },
        role: "PI",
        labs: [],
        profile: {
            title: "Professor",
            department: "Computational Neuroscience",
            phone: profileSeed.phone,
        },
    });
}

export async function loadProfileAffiliations(userEmail?: string) {
    if (!process.env.DATABASE_URL) {
        return sampleAffiliations;
    }

    try {
        let user;
        if (userEmail) {
            await connectToDatabase();
            user = await User.findOne({ email: userEmail.toLowerCase() }).exec();
        }
        if (!user) {
            user = await getOrCreateDemoProfileUser();
        }
        const rows = await UserLab.find({ user: user._id })
            .populate("lab")
            .sort({ joinedAt: -1 })
            .lean()
            .exec();

        if (rows.length === 0) {
            return [] as Affiliation[];
        }

        return rows.map((row: any) => ({
            id: String(row._id),
            labName: row.lab?.name ?? "Unknown Lab",
            role: roleLabels[row.role] ?? row.role,
            joined: formatJoined(row.joinedAt),
        }));
    } catch {
        return sampleAffiliations;
    }
}
