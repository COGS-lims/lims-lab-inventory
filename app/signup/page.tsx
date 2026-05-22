"use client";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const FlaskIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/>
  </svg>
);

export default function SignUpPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center font-sans px-4 py-10">

      {/* header */}
      <div className="flex flex-col items-center mb-8">
        <div className="bg-[#ea7032] text-white p-3.5 rounded-full mb-5 shadow-sm">
          <FlaskIcon size={36} />
        </div>
        <h1 className="text-[28px] font-bold text-gray-900 mb-2 tracking-tight">Lab Marketplace</h1>
        <p className="text-gray-500 text-[15px]">Share and discover excess laboratory resources</p>
      </div>

      <div className="bg-white w-full max-w-[440px] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 border border-gray-100">
        <h2 className="text-[22px] font-semibold text-center text-gray-900 mb-6">Create Account</h2>

        <p className="text-center text-[14px] text-gray-500 mb-6">
          Use your UCSD email to create an account.
        </p>

        {/* sign in */}
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
          className="w-full bg-[#5d8cb9] hover:bg-[#4f7ca6] text-white font-medium py-2.5 rounded-md border border-[#3b5e7d] transition-colors shadow-sm"
        >
          Sign up with UCSD SSO
        </button>

        <div className="mt-8 text-center">
          <p className="text-[14px] text-gray-500 mb-3">Already have an account?</p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full bg-white text-gray-800 font-medium py-2.5 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-8 text-center text-[13px] text-gray-500">
        By creating an account, you agree to our{' '}
        <a href="#" className="text-[#ea7032] underline hover:text-[#d8642a]">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="text-[#ea7032] underline hover:text-[#d8642a]">
          Privacy Policy
        </a>
      </div>

    </div>
  );
}
