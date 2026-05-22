"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

/**
 * Client-side context providers (e.g. NextAuth's SessionProvider).
 * Required for `useSession()` to work in client components.
 */
export default function Providers({ children }: { children: ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>;
}
