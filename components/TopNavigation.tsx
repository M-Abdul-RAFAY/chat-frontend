"use client";

import { Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import GlitchText from "./GlitchText";
import {
  UserButton,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface TopNavigationProps {
  onNavChange?: (id: string) => void;
  activeItem?: string;
}

export default function TopNavigation({
  onNavChange,
  activeItem: controlledActive,
}: TopNavigationProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigationItems = [
    { id: "home", label: "Home" },
    { id: "inbox", label: "Inbox" },
    { id: "marketing", label: "Marketing" },
    { id: "widget", label: "Widget" },
  ];

  const getInitialActiveItem = () => {
    // Try to match the current path to a nav item
    if (pathname && pathname.startsWith("/dashboard/")) {
      const slug = pathname.replace("/dashboard/", "").toLowerCase();
      const found = navigationItems.find(
        (item) =>
          item.id !== "dashboard" &&
          item.label.toLowerCase().replace(/\s+/g, "-") === slug
      );
      return found ? found.id : "inbox";
    }
    return "inbox";
  };
  const [activeItem, setActiveItem] = useState(
    controlledActive || getInitialActiveItem()
  );
  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 });
  const navRef = useRef<HTMLDivElement>(null);

  // Keep local state in sync with controlled prop
  useEffect(() => {
    if (controlledActive && controlledActive !== activeItem) {
      setActiveItem(controlledActive);
    }
  }, [controlledActive, activeItem]);

  // Calculate underline position and width
  useEffect(() => {
    if (navRef.current) {
      const activeButton = navRef.current.querySelector(
        `[data-nav-id="${activeItem}"]`
      ) as HTMLElement;
      if (activeButton) {
        const navRect = navRef.current.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        setUnderlineStyle({
          width: buttonRect.width,
          left: buttonRect.left - navRect.left,
        });
      }
    }
  }, [activeItem]);

  const handleNavClick = (itemId: string) => {
    setActiveItem(itemId);
    setMobileMenuOpen(false);
    if (onNavChange) onNavChange(itemId);
  };

  return (
    <div className="bg-zinc-950 text-white border-b border-gray-700 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <GlitchText
              className="text-sm md:text-xl lg:text-2xl font-bold"
              speed={0.5}
              enableShadows={true}
              enableOnHover={false} // Change this to false to see constant animation
            >
              🗨️ Hi Chat
            </GlitchText>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center relative" ref={navRef}>
          <div className="flex items-center space-x-1 relative">
            {navigationItems
              .filter((item) => item.id !== "dashboard")
              .map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/${item.label
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  onClick={() => handleNavClick(item.id)}
                  data-nav-id={item.id}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors duration-200 relative z-10",
                    activeItem === item.id
                      ? "text-white"
                      : "text-gray-300 hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              ))}

            {/* Sliding Underline */}
            <div
              className="absolute [top:2.875rem] [height:0.2rem] bg-blue-500 transition-all duration-300 ease-in-out"
              style={{
                width: `${underlineStyle.width}px`,
                transform: `translateX(${underlineStyle.left}px)`,
              }}
            />
          </div>
        </nav>

        {/* Right side - Search, Actions, Profile */}
        <div className="flex items-center space-x-2">
          {/* Action buttons */}
          {/* <button className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            <Plus size={20} />
          </button>

          <button className="p-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
            <Unplug size={20} />
          </button> */}

          {/* Profile */}
          <div className="flex items-center space-x-2">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
          </div>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={cn(
          " bg-gray-800 border-t border-gray-700 transition-all duration-300 ease-in-out overflow-hidden",
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 py-2 space-y-1">
          {/* Mobile Navigation Items */}
          {navigationItems
            .filter((item) => item.id !== "dashboard")
            .map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/${item.label
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                  activeItem === item.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
