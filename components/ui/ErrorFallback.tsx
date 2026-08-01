"use client";

import React from "react";
import Link from "next/link";
import { Home, RotateCcw, AlertTriangle } from "lucide-react";

interface ErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  const [isResetting, setIsResetting] = React.useState(false);

  const handleReset = () => {
    setIsResetting(true);
    reset();
    // Re-enable if reset doesn't trigger navigation
    setTimeout(() => setIsResetting(false), 2000);
  };

  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center overflow-hidden bg-background px-6">
      {/* Ambient glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/8 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-[250px] h-[250px] bg-secondary/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg animate-in fade-in slide-in-from-bottom-6 duration-500">
        {/* Error icon */}
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center mb-8 border border-rose-100 dark:border-rose-900/30">
          <AlertTriangle size={36} className="text-rose-500" />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 text-foreground">
          Something went wrong
        </h1>

        {/* Description */}
        <p className="text-muted font-semibold text-sm sm:text-base leading-relaxed mb-2">
          We encountered an unexpected issue while loading this page.
          Please try again, or head back home.
        </p>

        {/* Error message (collapsible) */}
        {process.env.NODE_ENV === "development" && error?.message && (
          <div className="w-full mt-4 mb-8 p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/20 rounded-2xl">
            <p className="text-xs font-mono text-rose-600 dark:text-rose-400 break-all leading-relaxed">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-[10px] font-mono text-rose-400 dark:text-rose-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold text-[13px] uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RotateCcw
              size={16}
              className={`transition-transform ${isResetting ? "animate-spin" : "group-hover:-rotate-180"}`}
            />
            {isResetting ? "Retrying..." : "Try Again"}
          </button>

          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-surface text-foreground border border-border rounded-full font-bold text-[13px] uppercase tracking-wider transition-all duration-300 hover:bg-border hover:border-border/80 w-full sm:w-auto"
          >
            <Home
              size={16}
              className="transition-transform group-hover:scale-110"
            />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
