"use client";

import { Instagram, Facebook } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

interface PlatformSwitcherProps {
  selectedPlatform: "facebook" | "instagram" | "whatsapp";
  onPlatformChange: (platform: "facebook" | "instagram" | "whatsapp") => void;
  isMobile?: boolean;
  userId?: string;
}

interface PageDetails {
  id: string;
  name: string;
  picture: string | null;
  category: string;
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
  userId,
}: PlatformSwitcherProps) {
  const [pageDetails, setPageDetails] = useState<PageDetails | null>(null);

  // Fetch page details when component mounts
  useEffect(() => {
    const fetchPageDetails = async () => {
      if (!userId) {
        console.log("No userId provided, skipping page details fetch");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:4000/api/v1/meta/page-details?userId=${userId}`
        );
        const data = await response.json();

        if (data.success && data.data) {
          setPageDetails(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch page details:", error);
      }
    };

    fetchPageDetails();
  }, [userId]);
  if (isMobile) {
    return (
      <div className="p-4 bg-white">
        {/* Connected Page Info */}
        {pageDetails && (
          <div className="mb-6 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-3">
              {pageDetails.picture ? (
                <Image
                  src={pageDetails.picture}
                  alt={pageDetails.name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Facebook size={24} className="text-white" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">
                  {pageDetails.name}
                </h3>
                <p className="text-sm text-gray-500">{pageDetails.category}</p>
              </div>
            </div>
          </div>
        )}

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
                      width={50}
                      height={50}
                      className="object-contain"
                    />
                  ) : Icon ? (
                    <Icon size={25} />
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
    <div className="w-20 bg-zinc-900 border-r border-gray-200 flex flex-col items-center py-6">
      {/* Connected Page Logo */}
      {pageDetails && (
        <div className="mb-2">
          {pageDetails.picture ? (
            <Image
              src={pageDetails.picture}
              alt={pageDetails.name}
              width={40}
              height={40}
              className="rounded-full object-cover border-2 border-gray-700"
              title={`Connected as: ${pageDetails.name}`}
            />
          ) : (
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border-2 border-gray-700">
              <Facebook size={20} className="text-white" />
            </div>
          )}
        </div>
      )}

      {/* Vertically centered platform buttons */}
      <div className="flex flex-col flex-grow justify-center items-center space-y-4 w-full">
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
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                ) : Icon ? (
                  <Icon size={24} />
                ) : null}
              </button>

              {/* Active indicator */}
              {isSelected && (
                <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
