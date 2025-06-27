"use client";
import React, { useState } from "react";
import {
  Building2,
  Megaphone,
  FileText,
  Settings,
  Plug,
  User,
  LogOut,
  Menu,
  X,
  MessageCircle,
  CodeXml,
} from "lucide-react";
import {
  UserButton,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const Navbar = ({ activeTab, onTabChange, onLogout }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "business", label: "Business Info", icon: Building2 },
    { id: "campaigns", label: "Campaigns", icon: Megaphone },
    { id: "templates", label: "Templates", icon: FileText },
    // { id: "rules", label: "Rules", icon: Settings },
    // { id: "integrations", label: "Integrations", icon: Plug },
    { id: "widget", label: "Widget", icon: CodeXml },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <button
            onClick={() => (window.location.href = "/")}
            className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageCircle size={20} className="text-white" />
            </div>
            <span>Podium Chat</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right side items */}
        <div className="flex items-center space-x-4">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton />
            <SignUpButton />
          </SignedOut>
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 border-t border-gray-200 mt-4 pt-4"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
