"use client";

import { Instagram, Facebook } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  PageDetailsSkeleton,
  PlatformButtonSkeleton,
} from "./skeletons/PlatformSkeleton";

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
    icon: null,
    color: "bg-gradient-to-br from-green-500 to-green-600",
    hoverColor: "hover:bg-green-50 hover:border-green-200",
    selectedColor:
      "bg-gradient-to-br from-green-50 to-green-100 border-green-400 text-green-800 shadow-green-100",
    description: "3 unread messages",
  },
  {
    id: "facebook" as const,
    name: "Facebook",
    icon: Facebook,
    color: "bg-gradient-to-br from-blue-600 to-blue-700",
    hoverColor: "hover:bg-blue-50 hover:border-blue-200",
    selectedColor:
      "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-400 text-blue-800 shadow-blue-100",
    description: "1 new message",
  },
  {
    id: "instagram" as const,
    name: "Instagram",
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500",
    hoverColor: "hover:bg-pink-50 hover:border-pink-200",
    selectedColor:
      "bg-gradient-to-br from-pink-50 to-purple-100 border-pink-400 text-pink-800 shadow-pink-100",
    description: "5 unread messages",
  },
];

export default function PlatformSwitcher({
  selectedPlatform,
  onPlatformChange,
  isMobile,
  userId,
}: PlatformSwitcherProps) {
  const [pageDetails, setPageDetails] = useState<PageDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch page details when component mounts
  useEffect(() => {
    const fetchPageDetails = async () => {
      if (!userId) {
        console.log("No userId provided, skipping page details fetch");
        setLoading(false);
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
      } finally {
        setLoading(false);
      }
    };

    fetchPageDetails();
  }, [userId]);

  if (isMobile) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-full">
        {/* Connected Page Info */}
        {loading ? (
          <PageDetailsSkeleton />
        ) : pageDetails ? (
          <div className="mb-8 p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center space-x-4">
              {pageDetails.picture ? (
                <div className="relative">
                  <Image
                    src={pageDetails.picture}
                    alt={pageDetails.name}
                    width={52}
                    height={52}
                    className="rounded-full object-cover ring-2 ring-white shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
              ) : (
                <div className="w-13 h-13 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-md">
                  <Facebook size={26} className="text-white" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  {pageDetails.name}
                </h3>
                <p className="text-sm text-gray-600 font-medium">
                  {pageDetails.category}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Select Platform
          </h2>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <PlatformButtonSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                const isSelected = selectedPlatform === platform.id;

                return (
                  <button
                    key={platform.id}
                    onClick={() => onPlatformChange(platform.id)}
                    className={`group w-full flex items-center space-x-4 p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                      isSelected
                        ? `${platform.selectedColor} shadow-lg`
                        : `border-gray-200 bg-white ${platform.hoverColor} hover:shadow-md`
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform duration-200 group-hover:scale-110 ${platform.color}`}
                    >
                      {platform.id === "whatsapp" ? (
                        <Image
                          src="/whatsapp.png"
                          alt="WhatsApp"
                          width={28}
                          height={28}
                          className="object-contain"
                        />
                      ) : Icon ? (
                        <Icon size={26} />
                      ) : null}
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-900 text-lg">
                        {platform.name}
                      </div>
                      <div
                        className={`text-sm font-medium transition-colors ${
                          isSelected ? "text-gray-700" : "text-gray-500"
                        }`}
                      >
                        {platform.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-sm">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-20 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700/50 flex flex-col items-center py-6 shadow-2xl">
      {/* Connected Page Logo */}
      {loading ? (
        <div className="mb-4 w-10 h-10 rounded-full bg-slate-700 animate-pulse"></div>
      ) : pageDetails ? (
        <div className="mb-4 group">
          {pageDetails.picture ? (
            <div className="relative">
              <Image
                src={pageDetails.picture}
                alt={pageDetails.name}
                width={44}
                height={44}
                className="rounded-full object-cover ring-2 ring-slate-600 hover:ring-slate-400 transition-all duration-200 shadow-lg"
                title={`Connected as: ${pageDetails.name}`}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
            </div>
          ) : (
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center ring-2 ring-slate-600 shadow-lg">
              <Facebook size={22} className="text-white" />
            </div>
          )}
        </div>
      ) : null}

      {/* Vertically centered platform buttons */}
      <div className="flex flex-col flex-grow justify-center items-center space-y-4 w-full px-2">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isSelected = selectedPlatform === platform.id;

          return (
            <div key={platform.id} className="relative group">
              <button
                onClick={() => onPlatformChange(platform.id)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl ${
                  isSelected
                    ? "scale-110 ring-2 ring-white/30"
                    : "hover:scale-105"
                } ${platform.color}`}
                title={platform.name}
              >
                {platform.id === "whatsapp" ? (
                  <Image
                    src="/whatsapp.png"
                    alt="WhatsApp"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                ) : Icon ? (
                  <Icon size={24} />
                ) : null}
              </button>

              {/* Active indicator */}
              {isSelected && (
                <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-sm animate-pulse"></div>
              )}

              {/* Tooltip */}
              <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                {platform.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
