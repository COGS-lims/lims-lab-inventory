import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ChevronDown, Database, PlusSquare } from "lucide-react";

import { connectToDatabase } from "@/lib/mongoose";
import LabModel from "@/models/Lab";
import UserLab from "@/models/UserLab";
import { User } from "@/models/User";
import { auth } from "@/auth";
import { getOrCreateDemoProfileUser } from "@/app/profile/profile-data";

const roleOptions = [
    { value: "PI", label: "PI" },
    { value: "LAB_MANAGER", label: "Lab Manager" },
    { value: "RESEARCHER", label: "Researcher" },
    { value: "VIEWER", label: "Viewer" },
] as const;

type LabOption = {
    id: string;
    name: string;
};

const fallbackLabs: LabOption[] = [
    { id: "xu-computational-neuroscience-lab", name: "Xu Computational Neuroscience Lab" },
    { id: "cognitive-systems-core", name: "Cognitive Systems Core" },
    { id: "bioengineering-shared-facility", name: "Bioengineering Shared Facility" },
];

async function loadLabOptions(): Promise<LabOption[]> {
    if (!process.env.DATABASE_URL) {
        return fallbackLabs;
    }

    try {
        await connectToDatabase();
        const labs = await LabModel.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .lean()
            .exec();

        if (labs.length === 0) {
            return fallbackLabs;
        }

        return labs.map((lab) => ({
            id: String(lab._id),
            name: lab.name,
        }));
    } catch {
        return fallbackLabs;
    }
}

async function createLabAction(formData: FormData) {
    "use server";

    const name = String(formData.get("newLabName") ?? "").trim();
    const department = String(formData.get("department") ?? "").trim();

    if (!name || !department) {
        return;
    }

    if (!process.env.DATABASE_URL) {
        return;
    }

    await connectToDatabase();
    await LabModel.create({
        name,
        department,
        createdAt: new Date(),
    });

    revalidatePath("/profile/labs/new");
}

async function addExistingLabAction(formData: FormData) {
    "use server";

    const labId = String(formData.get("labName") ?? "").trim();
    const role = String(formData.get("labRole") ?? "").trim();
    const dateJoinedInput = String(formData.get("dateJoined") ?? "").trim();

    if (!labId || !role) {
        return;
    }

    if (!process.env.DATABASE_URL) {
        redirect("/profile");
    }

    await connectToDatabase();

    const lab = await LabModel.findById(labId).exec();
    if (!lab) {
        return;
    }

    const session = await auth();
    const sessionEmail = session?.user?.email;
    const user = sessionEmail
        ? await User.findOne({ email: sessionEmail.toLowerCase() }).exec() ?? await getOrCreateDemoProfileUser()
        : await getOrCreateDemoProfileUser();

    const joinedAt = dateJoinedInput ? new Date(dateJoinedInput) : new Date();

    await UserLab.findOneAndUpdate(
        { user: user._id, lab: lab._id },
        {
            role,
            joinedAt,
        },
        {
            upsert: true,
            new: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        }
    ).exec();

    await User.findByIdAndUpdate(user._id, {
        $pull: { labs: { labId: lab._id } },
    }).exec();

    await User.findByIdAndUpdate(user._id, {
        $push: {
            labs: {
                labId: lab._id,
                role,
            },
        },
    }).exec();

    revalidatePath("/profile");
    revalidatePath("/profile/labs/new");
    redirect("/profile");
}

function SectionCard({
    icon,
    title,
    description,
    children,
}: Readonly<{
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
}>) {
    return (
        <section className="rounded-[24px] border border-[#d9dee6] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-10">
            <div className="mb-8 flex items-start gap-4">
                <div className="mt-1 text-[#245f86]">{icon}</div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#111111]">
                        {title}
                    </h2>
                    <p className="max-w-[360px] text-sm leading-6 text-[#69707a] sm:text-base">
                        {description}
                    </p>
                </div>
            </div>
            {children}
        </section>
    );
}

export default async function AddLabAffiliationPage() {
    const labOptions = await loadLabOptions();

    return (
        <main className="min-h-screen bg-[#f7f6f2] text-[#111111]">
            <div className="mx-auto flex min-h-screen max-w-[1512px] items-center justify-center px-6 py-14 sm:px-10 lg:px-[87px]">
                <div className="w-full max-w-[1240px] space-y-8">
                    <div className="space-y-3">
                        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#111111]">
                            Add Lab Affiliation
                        </h1>
                        <p className="max-w-[700px] text-sm leading-6 text-[#69707a] sm:text-base">
                            Choose an existing lab from the database or create a new lab record
                            for testing. The affiliation form stays frontend-only for now, while
                            the create-lab form can write to MongoDB when `DATABASE_URL` is set.
                        </p>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-2">
                        <SectionCard
                            icon={<Database className="h-7 w-7" strokeWidth={1.8} />}
                            title="Add Existing Lab"
                            description="Pick a lab from the database, choose your role, and record your join date."
                        >
                            <form action={addExistingLabAction} className="space-y-7">
                                <div className="space-y-3">
                                    <label
                                        htmlFor="labName"
                                        className="block text-sm font-semibold text-[#222222]"
                                    >
                                        Lab Name
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="labName"
                                            name="labName"
                                            defaultValue=""
                                            className="h-14 w-full appearance-none rounded-xl border border-[#d9dee6] bg-white px-4 text-base text-[#111111] outline-none transition focus:border-[#245f86] focus:ring-2 focus:ring-[#245f86]/20"
                                        >
                                            <option value="" disabled>
                                                Select a lab from the database
                                            </option>
                                            {labOptions.map((lab) => (
                                                <option key={lab.id} value={lab.id}>
                                                    {lab.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7f8a95]" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label
                                        htmlFor="labRole"
                                        className="block text-sm font-semibold text-[#222222]"
                                    >
                                        Lab Role
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="labRole"
                                            name="labRole"
                                            defaultValue=""
                                            className="h-14 w-full appearance-none rounded-xl border border-[#d9dee6] bg-white px-4 text-base text-[#111111] outline-none transition focus:border-[#245f86] focus:ring-2 focus:ring-[#245f86]/20"
                                        >
                                            <option value="" disabled>
                                                Select a role
                                            </option>
                                            {roleOptions.map((role) => (
                                                <option key={role.value} value={role.value}>
                                                    {role.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7f8a95]" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label
                                        htmlFor="dateJoined"
                                        className="block text-sm font-semibold text-[#222222]"
                                    >
                                        Date Joined
                                    </label>
                                    <input
                                        id="dateJoined"
                                        name="dateJoined"
                                        type="date"
                                        className="h-14 w-full rounded-xl border border-[#d9dee6] bg-white px-4 text-base text-[#111111] outline-none transition focus:border-[#245f86] focus:ring-2 focus:ring-[#245f86]/20"
                                    />
                                </div>

                                <div className="rounded-xl border border-dashed border-[#d4dce5] bg-[#f8fbfd] px-4 py-3 text-sm leading-6 text-[#5d6773]">
                                    When `DATABASE_URL` is configured, this saves a `UserLab`
                                    affiliation for the demo profile user and redirects back to
                                    the profile page.
                                </div>

                                <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                                    <Link
                                        href="/profile?labs=empty"
                                        className="inline-flex h-12 items-center justify-center rounded-xl border border-[#d9dee6] bg-white px-6 text-sm font-semibold text-[#222222] transition hover:bg-[#f7f9fb]"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        className="inline-flex h-12 items-center justify-center rounded-xl bg-[#245f86] px-6 text-sm font-semibold text-white transition hover:bg-[#1d4d6d]"
                                    >
                                        Add Existing Lab
                                    </button>
                                </div>
                            </form>
                        </SectionCard>

                        <SectionCard
                            icon={<PlusSquare className="h-7 w-7" strokeWidth={1.8} />}
                            title="Create New Lab"
                            description="If the lab is not in the database yet, create a new lab record for testing and then select it from the list."
                        >
                            <form action={createLabAction} className="space-y-7">
                                <div className="space-y-3">
                                    <label
                                        htmlFor="newLabName"
                                        className="block text-sm font-semibold text-[#222222]"
                                    >
                                        Lab Name
                                    </label>
                                    <input
                                        id="newLabName"
                                        name="newLabName"
                                        type="text"
                                        placeholder="Enter new lab name"
                                        className="h-14 w-full rounded-xl border border-[#d9dee6] bg-white px-4 text-base text-[#111111] outline-none transition placeholder:text-[#98a0aa] focus:border-[#245f86] focus:ring-2 focus:ring-[#245f86]/20"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label
                                        htmlFor="department"
                                        className="block text-sm font-semibold text-[#222222]"
                                    >
                                        Department
                                    </label>
                                    <input
                                        id="department"
                                        name="department"
                                        type="text"
                                        placeholder="Enter department name"
                                        className="h-14 w-full rounded-xl border border-[#d9dee6] bg-white px-4 text-base text-[#111111] outline-none transition placeholder:text-[#98a0aa] focus:border-[#245f86] focus:ring-2 focus:ring-[#245f86]/20"
                                    />
                                </div>

                                <div className="rounded-xl border border-dashed border-[#d4dce5] bg-[#f8fbfd] px-4 py-3 text-sm leading-6 text-[#5d6773]">
                                    This form uses the repo&apos;s `DATABASE_URL` connection when
                                    available. It creates a lab in the `Lab` collection so it can
                                    appear in the existing-lab dropdown.
                                </div>

                                <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                                    <Link
                                        href="/profile?labs=empty"
                                        className="inline-flex h-12 items-center justify-center rounded-xl border border-[#d9dee6] bg-white px-6 text-sm font-semibold text-[#222222] transition hover:bg-[#f7f9fb]"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        className="inline-flex h-12 items-center justify-center rounded-xl bg-[#245f86] px-6 text-sm font-semibold text-white transition hover:bg-[#1d4d6d]"
                                    >
                                        Create New Lab
                                    </button>
                                </div>
                            </form>
                        </SectionCard>
                    </div>
                </div>
            </div>
        </main>
    );
}
