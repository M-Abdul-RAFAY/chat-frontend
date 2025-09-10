"use client";

import Image from "next/image";

interface HiChatLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
  showText?: boolean;
}

export default function HiChatLogo({
  size = "md",
  variant = "light",
  showText = false,
}: HiChatLogoProps) {
  const sizeClasses = {
    sm: 40,
    md: 56,
    lg: 80,
    xl: 120,
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-5xl",
  };

  const textColor = variant === "light" ? "text-white" : "text-gray-900";

  return (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <Image
          src="/assets/hichat-logo.png"
          alt="Hi Chat Logo"
          width={sizeClasses[size]}
          height={sizeClasses[size]}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span
          className={`${textSizeClasses[size]} font-bold ${textColor} ml-3`}
        >
          Hi Chat
        </span>
      )}
    </div>
  );
}
