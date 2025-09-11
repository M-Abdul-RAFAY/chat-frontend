"use client";

import { Instagram, Facebook } from "lucide-react";
import Image from "next/image";

interface PlatformSwitcherProps {
  selectedPlatform: "facebook" | "instagram" | "whatsapp";
  onPlatformChange: (platform: "facebook" | "instagram" | "whatsapp") => void;
  isMobile?: boolean;
}

const platforms = [
  {
    id: "whatsapp" as const,
    name: "WhatsApp",
    icon: null, // Will use custom image
    color: "bg-[#31a122]",
    hoverColor: "hover:bg-green-50",
    selectedColor: "bg-green-50 border-[#31a122] text-[#31a122]",
  },
  {
    id: "facebook" as const,
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-600",
    hoverColor: "hover:bg-blue-50",
    selectedColor: "bg-blue-50 border-blue-500 text-blue-700",
  },
  {
    id: "instagram" as const,
    name: "Instagram",
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-400",
    hoverColor: "hover:bg-pink-50",
    selectedColor: "bg-pink-50 border-pink-500 text-pink-700",
  },
];

export default function PlatformSwitcher({
  selectedPlatform,
  onPlatformChange,
  isMobile,
}: PlatformSwitcherProps) {
  if (isMobile) {
    return (
      <div className="p-4 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Select Platform
        </h2>
        <div className="space-y-3">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            const isSelected = selectedPlatform === platform.id;

            return (
              <button
                key={platform.id}
                onClick={() => onPlatformChange(platform.id)}
                className={`w-full flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? platform.selectedColor
                    : `border-gray-200 ${platform.hoverColor} hover:border-gray-300`
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${platform.color}`}
                >
                  {platform.id === "whatsapp" ? (
                    <Image
                      src="/whatsapp.png"
                      alt="WhatsApp"
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  ) : Icon ? (
                    <Icon size={24} />
                  ) : null}
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">
                    {platform.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {platform.id === "whatsapp" && "3 unread messages"}
                    {platform.id === "facebook" && "1 new message"}
                    {platform.id === "instagram" && "5 unread messages"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 space-y-4">
      {platforms.map((platform) => {
        const Icon = platform.icon;
        const isSelected = selectedPlatform === platform.id;

        return (
          <div key={platform.id} className="relative group">
            <button
              onClick={() => onPlatformChange(platform.id)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-200 ${
                isSelected ? "scale-110" : "hover:scale-105"
              } ${platform.color}`}
              title={platform.name}
            >
              {platform.id === "whatsapp" ? (
                <Image
                  src="/whatsapp.png"
                  alt="WhatsApp"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              ) : Icon ? (
                <Icon size={20} />
              ) : null}
            </button>

            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              {platform.name}
            </div>

            {/* Active indicator */}
            {isSelected && (
              <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-gray-900 rounded-r"></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
