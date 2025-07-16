"use client";

import React, { useState } from "react";
import FuzzyText from "@/components/FuzzyText";

const NotFoundPage = () => {
  const [hoverIntensity] = useState(0.8);
  const [enableHover] = useState(true);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-8">
        {/* Animated 404 Text */}
        <div className="flex justify-center">
          <FuzzyText
            baseIntensity={0.2}
            hoverIntensity={hoverIntensity}
            enableHover={enableHover}
            fontSize="clamp(4rem, 15vw, 12rem)"
            color="#ff4444"
            fontWeight={900}
          >
            404
          </FuzzyText>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <FuzzyText
            baseIntensity={0.2}
            hoverIntensity={hoverIntensity}
            enableHover={enableHover}
            fontSize="clamp(2rem, 7vw, 6rem)"
            color="white"
            fontWeight={900}
          >
            Page Not Found
          </FuzzyText>
        </div>

        {/* Additional Info */}
      </div>
      <FuzzyText
        baseIntensity={0.2}
        hoverIntensity={hoverIntensity}
        enableHover={enableHover}
        fontSize="clamp(1rem, 6vw, 3rem)"
        color="gold"
        fontWeight={900}
      >
        Developed By Abdul Rafay
      </FuzzyText>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500 via-transparent to-transparent"></div>
      </div>
    </div>
  );
};

export default NotFoundPage;
