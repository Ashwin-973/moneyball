import React from "react";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number; // 0-indexed
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center relative">
        {/* Horizontal connecting lines */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-[2px] bg-gray-200 z-0"></div>
        <div
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-[2px] bg-primary z-0 transition-all duration-300"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>

        {/* Steps */}
        {steps.map((label, idx) => {
          const isComplete = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <div
              key={idx}
              className="relative z-10 flex flex-col items-center group"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  isComplete
                    ? "bg-green-500 text-white"
                    : isActive
                    ? "bg-primary text-white border-4 border-orange-100"
                    : "bg-gray-200 text-gray-500 border-2 border-white"
                }`}
              >
                {isComplete ? (
                  <Check size={16} className="stroke-[3]" />
                ) : (
                  <span className="text-sm font-semibold">{idx + 1}</span>
                )}
              </div>
              
              <div
                className={`absolute top-10 w-32 text-center text-xs hidden md:block transition-colors duration-300 ${
                  isActive ? "text-primary font-bold" : "text-gray-500 font-medium"
                }`}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
