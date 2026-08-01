import React from "react";

export default function PageLoader({ text = "Loading Experience" }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground">
      <style>{`
        @keyframes loadingLine {
          0% {
            left: -40%;
            width: 30%;
          }
          50% {
            width: 60%;
          }
          100% {
            left: 110%;
            width: 30%;
          }
        }
        .animate-loading-line {
          position: absolute;
          top: 0;
          bottom: 0;
          background-color: var(--secondary, #98c45f);
          border-radius: 9999px;
          animation: loadingLine 1.6s infinite ease-in-out;
        }
      `}</style>

      <div className="flex flex-col items-center space-y-6 max-w-xs text-center">
        {/* Pulsing Logo */}
        <div className="relative w-36 h-16 animate-pulse transition-transform duration-1000 ease-in-out hover:scale-105">
          <img
            src="/assets/Image/nestcraft-logo.svg"
            alt="NestCraft Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Sleek Line Spinner */}
        <div className="w-20 h-[2px] bg-border dark:bg-border/30 overflow-hidden rounded-full relative">
          <div className="animate-loading-line"></div>
        </div>

        {/* Text */}
        <p className="text-[10px] font-black uppercase tracking-[3px] text-secondary animate-pulse">
          {text}
        </p>
      </div>
    </div>
  );
}
