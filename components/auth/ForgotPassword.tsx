"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import HiChatLogo from "@/components/ui/HiChatLogo";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // For demo purposes - in a real app, you'd integrate with Clerk's password reset
    setTimeout(() => {
      setMessage(
        `If an account with email ${email} exists, you will receive password reset instructions.`
      );
      setLoading(false);
    }, 1000);
  };

  if (message) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
        <div className="max-w-md w-full space-y-8 mt-8 mb-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <HiChatLogo size="xl" variant="light" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Check Your Email
            </h2>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-8 backdrop-blur-sm mt-8">
            <div className="text-center space-y-4">
              <div className="bg-green-900/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>

              <div className="pt-4">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center text-white hover:text-gray-300 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
      <div className="max-w-md w-full space-y-8 mt-8 mb-8">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <HiChatLogo size="xl" variant="light" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Reset Your Password
          </h2>
          <p className="text-gray-400 text-sm">
            Enter your email address and we&apos;ll send you instructions to
            reset your password
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-8 backdrop-blur-sm mt-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  "Send Reset Instructions"
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/sign-in"
                className="inline-flex items-center text-sm text-white hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Remember your password?{" "}
            <Link
              href="/sign-in"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
