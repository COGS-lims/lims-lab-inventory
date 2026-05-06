"use client";
import React, { useState } from 'react';
import { signIn } from "next-auth/react";

// --- Custom Icon Components (No installation needed!) ---
const FlaskIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/>
  </svg>
);

const MailIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>
  </svg>
);

const LockIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const EyeIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
// --------------------------------------------------------

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center font-sans px-4 py-10">
      
      {/* Header Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="bg-[#ea7032] text-white p-3.5 rounded-full mb-5 shadow-sm">
          <FlaskIcon size={36} />
        </div>
        <h1 className="text-[28px] font-bold text-gray-900 mb-2 tracking-tight">Lab Marketplace</h1>
        <p className="text-gray-500 text-[15px]">Share and discover excess laboratory resources</p>
      </div>

      {/* Main Card */}
      <div className="bg-white w-full max-w-[440px] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 border border-gray-100">
        <h2 className="text-[22px] font-semibold text-center text-gray-900 mb-6">Sign In</h2>

        <form className="space-y-4">
          
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <MailIcon className="text-gray-400" />
              </div>
              <input
                type="email"
                placeholder="youremail@ucsd.edu"
                className="block w-full pl-11 pr-4 py-2.5 border-none rounded-md bg-[#f3f4f6] text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#ea7032]/50 outline-none transition-colors sm:text-sm"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <LockIcon className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="block w-full pl-11 pr-11 py-2.5 border-none rounded-md bg-[#f3f4f6] text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#ea7032]/50 outline-none transition-colors sm:text-sm"
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <EyeIcon />
                </button>
              </div>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end pt-1">
            <a href="#" className="text-[14px] font-medium text-[#ea7032] hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Primary Sign In Button */}
          <button
            type="submit"
            className="w-full bg-[#ea7032] hover:bg-[#d8642a] text-white font-medium py-2.5 rounded-md border border-[#c45a23] transition-colors shadow-sm mt-2"
          >
            Sign in
          </button>
        </form>

        {/* Divider */}
        <div className="text-center text-[13px] font-medium text-black my-5">
          OR
        </div>

        {/* SSO Sign In Button */}
        <button
          type="button"
          onClick = {() => signIn("google", { callbackUrl: "/"})}
          className="w-full bg-[#5d8cb9] hover:bg-[#4f7ca6] text-white font-medium py-2.5 rounded-md border border-[#3b5e7d] transition-colors shadow-sm"
        >
          Sign in with UCSD SSO
        </button>

        {/* Sign Up Section */}
        <div className="mt-8 text-center">
          <p className="text-[14px] text-gray-500 mb-3">Don't have an account?</p>
          <button
            type="button"
            className="w-full bg-white text-gray-800 font-medium py-2.5 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Create New Account
          </button>
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-8 text-center text-[13px] text-gray-500">
        By signing in, you agree to our{' '}
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