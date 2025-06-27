"use client";
import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Menu, X } from "lucide-react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "./ui/button";

interface HeaderProps {
  showAuthButtons?: boolean;
}

export default function Header({ showAuthButtons = true }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageCircle size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Podium Chat</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/#features"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/about"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/dashboard/inbox"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Dashboard
            </Link>
          </nav>

          {/* Desktop Auth Buttons with Clerk */}
          {showAuthButtons && (
            <div className="hidden text-black md:flex items-center space-x-4">
              <SignedOut>
                <Button variant="outline">
                  <SignInButton />
                </Button>
                <Button variant="outline">
                  <SignUpButton />
                </Button>
              </SignedOut>
              <SignedIn>
                <div className="ml-33">
                  <UserButton />
                </div>
              </SignedIn>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/#features"
                className="text-gray-600 hover:text-gray-900 transition-colors px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-gray-900 transition-colors px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-gray-900 transition-colors px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>

              {showAuthButtons && (
                <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
                  <SignedOut>
                    <SignInButton />
                    <SignUpButton />
                  </SignedOut>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
