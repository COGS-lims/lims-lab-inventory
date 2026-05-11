import Link from "next/link";
import { ChevronDown } from "lucide-react";

type LabOption = {
    id: string;
    name: string;
};

const fallbackLabs: LabOption[] = [
    { id: "xu-computational-neuroscience-lab", name: "Xu Computational Neuroscience Lab" },
    { id: "cognitive-systems-core", name: "Cognitive Systems Core" },
    { id: "bioengineering-shared-facility", name: "Bioengineering Shared Facility" },
];

export default function AddLabAffiliationPage() {
    const labOptions = fallbackLabs;

    return (
        <main className="min-h-screen bg-[#f7f6f2] text-[#111111]">
            <div className="mx-auto flex min-h-screen max-w-[1512px] items-center justify-center px-6 py-14 sm:px-10">
                <section className="w-full max-w-[760px] rounded-[24px] border border-[#d9dee6] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-12">
                    <div className="mb-10 space-y-3">
                        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#111111]">
                            Add Lab Affiliation
                        </h1>
                        <p className="max-w-[520px] text-sm leading-6 text-[#69707a] sm:text-base">
                            Choose a lab, add your role, and record when you joined so it can
                            appear on your profile page.
                        </p>
                    </div>

                    <form className="space-y-7">
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
                            <input
                                id="labRole"
                                name="labRole"
                                type="text"
                                placeholder="e.g., Research Assistant, Lab Manager"
                                className="h-14 w-full rounded-xl border border-[#d9dee6] bg-white px-4 text-base text-[#111111] outline-none transition placeholder:text-[#98a0aa] focus:border-[#245f86] focus:ring-2 focus:ring-[#245f86]/20"
                            />
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
                                Add Lab
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
}
