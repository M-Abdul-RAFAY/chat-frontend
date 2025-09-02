"use client";

import { MessageSquare } from "lucide-react";

interface HiChatLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
  showText?: boolean;
}

export default function HiChatLogo({
  size = "md",
  variant = "light",
  showText = true,
}: HiChatLogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  const iconColor = variant === "light" ? "text-white" : "text-blue-600";
  const textColor = variant === "light" ? "text-white" : "text-gray-900";
  const bgColor = variant === "light" ? "bg-blue-600" : "bg-blue-50";

  return (
    <div className="flex items-center space-x-3">
      <div className={`${bgColor} p-3 rounded-full`}>
        <MessageSquare className={`${sizeClasses[size]} ${iconColor}`} />
      </div>
      {showText && (
        <span className={`${textSizeClasses[size]} font-bold ${textColor}`}>
          HiChat
        </span>
      )}
    </div>
  );
}
