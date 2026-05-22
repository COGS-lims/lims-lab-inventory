"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

import type { Role } from "@/models/User";

const ROLES: { value: Role; label: string }[] = [
    { value: "PI", label: "Principal Investigator (PI)" },
    { value: "LAB_MANAGER", label: "Lab Manager" },
    { value: "RESEARCHER", label: "Researcher" },
    { value: "VIEWER", label: "Viewer" },
];

/**
 * Split a Google "name" string into first/last. Falls back to using the whole
 * thing as `first` if there's only one word.
 */
function splitName(full: string): { first: string; last: string } {
    const trimmed = full.trim();
    if (!trimmed) return { first: "", last: "" };
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) return { first: parts[0], last: "" };
    return {
        first: parts[0],
        last: parts.slice(1).join(" "),
    };
}

export default function OnboardingPage() {
    const router = useRouter();
    const { data: session, status, update } = useSession();

    const initialNames = useMemo(() => {
        const source = session?.user?.googleName ?? session?.user?.name ?? "";
        return splitName(source);
    }, [session?.user?.googleName, session?.user?.name]);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState<Role | "">("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Warm up the marketplace route so the post-submit navigation feels instant
    useEffect(() => {
        router.prefetch("/marketplace");
    }, [router]);

    // Seed the name fields once the session is available
    useEffect(() => {
        if (status === "authenticated") {
            setFirstName((prev) => prev || initialNames.first);
            setLastName((prev) => prev || initialNames.last);
        }
    }, [status, initialNames.first, initialNames.last]);

    // Redirect already-onboarded users out of this page
    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login");
            return;
        }
        if (
            status === "authenticated" &&
            session?.user?.needsOnboarding === false
        ) {
            router.replace("/");
        }
    }, [status, session?.user?.needsOnboarding, router]);

    if (status === "loading") {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
                <p className="text-gray-500">Loading…</p>
            </main>
        );
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (!session?.user?.email) {
            setError("No session found. Please sign in again.");
            return;
        }
        if (!role) {
            setError("Please select your role.");
            return;
        }
        if (!firstName.trim() || !lastName.trim()) {
            setError("First and last name are required.");
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: session.user.email,
                    name: {
                        first: firstName.trim(),
                        last: lastName.trim(),
                    },
                    role,
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data?.message ?? "Failed to create account.");
            }

            // Refresh the session so needsOnboarding flips to false.
            await update();

            // Show the welcome interstitial briefly, then do a full-page
            // navigation so middleware sees the updated cookie.
            setSuccess(true);
            setTimeout(() => {
                window.location.assign("/marketplace");
            }, 700);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <main className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center font-sans px-4 py-10">
                <div className="bg-white w-full max-w-[480px] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-10 border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full border-2 border-[#ea7032]/30 border-t-[#ea7032] animate-spin mb-5" />
                    <h1 className="text-[22px] font-semibold text-gray-900 mb-2">
                        Welcome, {firstName.trim() || "there"}!
                    </h1>
                    <p className="text-[14px] text-gray-500">
                        Taking you to the marketplace…
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center font-sans px-4 py-10">
            <div className="bg-white w-full max-w-[480px] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 border border-gray-100">
                <h1 className="text-[24px] font-semibold text-center text-gray-900 mb-2">
                    Finish setting up your account
                </h1>
                <p className="text-center text-[14px] text-gray-500 mb-6">
                    {session?.user?.email
                        ? `Signed in as ${session.user.email}`
                        : "Tell us a little about yourself"}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">
                                First name
                            </label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className="block w-full px-3 py-2.5 rounded-md bg-[#f3f4f6] text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#ea7032]/50 outline-none transition-colors sm:text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">
                                Last name
                            </label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className="block w-full px-3 py-2.5 rounded-md bg-[#f3f4f6] text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#ea7032]/50 outline-none transition-colors sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                            Your role in the lab
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as Role)}
                            required
                            className="block w-full px-3 py-2.5 rounded-md bg-[#f3f4f6] text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#ea7032]/50 outline-none transition-colors sm:text-sm"
                        >
                            <option value="" disabled>
                                Select a role
                            </option>
                            {ROLES.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {error ? (
                        <p className="text-sm text-red-600">{error}</p>
                    ) : null}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[#ea7032] hover:bg-[#d8642a] disabled:opacity-60 text-white font-medium py-2.5 rounded-md border border-[#c45a23] transition-colors shadow-sm"
                    >
                        {submitting ? "Creating account…" : "Create account"}
                    </button>

                    <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full bg-white text-gray-600 font-medium py-2 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
                    >
                        Cancel and sign out
                    </button>
                </form>
            </div>
        </main>
    );
}
