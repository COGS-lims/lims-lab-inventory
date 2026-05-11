import Link from "next/link";
import {
    ArrowLeft,
    CalendarDays,
    FlaskConical,
    Mail,
    Plus,
    UserRound,
} from "lucide-react";

type Affiliation = {
    id: string;
    labName: string;
    role: string;
    joined: string;
};

const profile = {
    name: "Dr. Xu",
    pronouns: "He/him",
    bio: "Experienced principal investigator at a lab specializing in computational neuroscience. Our lab focuses on developing innovative techniques for analysis in computational neuroscience.",
    email: "Xu@ucsd.edu",
    phone: "(xxx) xxx-xxxx",
    status: "Active",
};

const sampleAffiliations: Affiliation[] = [
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

function InfoCard({
    icon,
    title,
    children,
}: Readonly<{
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}>) {
    return (
        <section className="rounded-[28px] border-2 border-[#222222] bg-[#f8f8fb] p-8 shadow-[0_8px_18px_rgba(15,23,42,0.08)] sm:p-10">
            <div className="mb-10 flex items-center gap-4">
                <div className="text-[#ff5a00]">{icon}</div>
                <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#111111]">{title}</h2>
            </div>
            {children}
        </section>
    );
}

function InfoRow({
    label,
    value,
}: Readonly<{
    label: string;
    value: string;
}>) {
    return (
        <div className="space-y-2">
            <p className="text-sm font-medium text-[#8b8b8f] sm:text-base">{label}</p>
            <p className="text-xl font-medium leading-snug text-[#111111]">{value}</p>
        </div>
    );
}

function LabAffiliationsCard({
    affiliations,
}: Readonly<{
    affiliations: Affiliation[];
}>) {
    if (affiliations.length === 0) {
        return (
            <InfoCard
                icon={<FlaskConical className="h-10 w-10" strokeWidth={1.8} />}
                title="Lab and Affiliation"
            >
                <div className="flex min-h-[220px] flex-col items-center justify-center gap-6 text-center">
                    <p className="max-w-[280px] text-sm leading-6 text-[#444444]">
                        You don&apos;t have a lab listed yet. Add your affiliation to connect
                        with other researchers and manage your equipment listings.
                    </p>
                    <Link
                        href="/profile/labs/new"
                        className="inline-flex items-center justify-center rounded-xl bg-[#245f86] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1d4d6d]"
                    >
                        Add Lab
                    </Link>
                </div>
            </InfoCard>
        );
    }

    return (
        <InfoCard
            icon={<FlaskConical className="h-10 w-10" strokeWidth={1.8} />}
            title="Lab and Affiliation"
        >
            <div className="space-y-7">
                {affiliations.map((affiliation, index) => (
                    <div
                        key={affiliation.id}
                        className={index === affiliations.length - 1 ? "" : "border-b border-[#d7dbe1] pb-7"}
                    >
                        <div className="space-y-6">
                            <InfoRow label="Laboratory name" value={affiliation.labName} />
                            <InfoRow label="Role at lab" value={affiliation.role} />
                            <div className="flex items-center gap-4 pt-1 text-[#111111]">
                                <CalendarDays className="h-8 w-8 text-[#2d2d2d]" strokeWidth={1.8} />
                                <p className="text-xl font-medium">Joined {affiliation.joined}.</p>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="pt-1">
                    <Link
                        href="/profile/labs/new"
                        className="inline-flex items-center gap-2 rounded-xl border border-[#cdd7df] bg-white px-4 py-2 text-sm font-semibold text-[#245f86] transition-colors hover:bg-[#f4f9fc]"
                    >
                        <Plus className="h-4 w-4" />
                        Add another lab
                    </Link>
                </div>
            </div>
        </InfoCard>
    );
}

export default async function ProfilePage({
    searchParams,
}: Readonly<{
    searchParams?: Promise<{ labs?: string }>;
}>) {
    const resolvedParams = searchParams ? await searchParams : undefined;
    const affiliations =
        resolvedParams?.labs === "empty" ? [] : sampleAffiliations;

    return (
        <main className="min-h-screen bg-[#f7f6f2] text-[#111111]">
            <div className="border-b border-[#ece4bd] bg-gradient-to-r from-[#f9f2c5] via-[#f7f3d5] to-[#f8f1c9]">
                <div className="mx-auto flex h-[70px] w-full max-w-[1512px] items-center px-7 sm:px-10">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-6 text-lg font-semibold transition-transform hover:-translate-x-0.5 sm:text-[22px]"
                    >
                        <ArrowLeft className="h-7 w-7" />
                        <span>Back to Market Place</span>
                    </Link>
                </div>
            </div>

            <div className="mx-auto flex w-full max-w-[1512px] flex-col gap-[76px] px-6 py-[58px] sm:px-10 lg:px-[87px] lg:py-[58px]">
                <section className="min-h-[446px] overflow-hidden rounded-[25px] border-2 border-[#202020] bg-[#fbfbfd] shadow-[0_12px_24px_rgba(15,23,42,0.10)]">
                    <div className="h-24 bg-[#245f86] sm:h-32" />
                    <div className="px-6 pb-8 pt-0 sm:px-10 sm:pb-10 lg:px-[52px] lg:pb-[54px]">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-[48px]">
                            <div className="-mt-16 flex justify-center sm:-mt-20 lg:justify-start">
                                <div className="relative h-40 w-40 rounded-full border-4 border-white bg-[#245f86] shadow-lg sm:h-48 sm:w-48">
                                    <div className="flex h-full items-center justify-center text-white">
                                        <UserRound className="h-20 w-20 sm:h-24 sm:w-24" strokeWidth={1.5} />
                                    </div>
                                    <span className="absolute bottom-3 right-4 h-10 w-10 rounded-full border-4 border-[#245f86] bg-[#25d839] sm:h-12 sm:w-12" />
                                </div>
                            </div>

                            <div className="max-w-4xl pt-2 sm:pt-4 lg:pt-[18px]">
                                <h1 className="text-5xl font-semibold tracking-[-0.03em] text-[#101010] sm:text-6xl lg:text-[58px]">
                                    {profile.name}
                                </h1>
                                <p className="mt-3 text-2xl font-semibold text-[#9b9b9f]">{profile.pronouns}</p>
                                <p className="mt-8 max-w-[820px] text-lg leading-8 text-[#202020] sm:text-xl">
                                    {profile.bio}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid gap-8 lg:grid-cols-[603px_600px] lg:justify-between lg:gap-0">
                    <InfoCard
                        icon={<Mail className="h-10 w-10" strokeWidth={1.8} />}
                        title="Contact Information"
                    >
                        <div className="space-y-8">
                            <InfoRow label="Email address" value={profile.email} />
                            <InfoRow label="Phone number" value={profile.phone} />
                        </div>
                    </InfoCard>

                    <LabAffiliationsCard affiliations={affiliations} />
                </div>

                <div className="flex justify-end">
                    <div className="rounded-full border border-[#d2d8de] bg-white px-4 py-2 text-sm font-medium uppercase tracking-[0.18em] text-[#245f86] shadow-sm">
                        {profile.status}
                    </div>
                </div>
            </div>
        </main>
    );
}
