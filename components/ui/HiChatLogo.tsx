"use client";

import Image from "next/image";

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
    sm: 24,
    md: 32,
    lg: 48,
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  const textColor = variant === "light" ? "text-white" : "text-gray-900";

  return (
    <div className="flex items-center space-x-3">
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
        <span className={`${textSizeClasses[size]} font-bold ${textColor}`}>
          Hi Chat
        </span>
      )}
    </div>
  );
}
