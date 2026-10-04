"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      toastOptions={{
        className:
          "rounded-xl border shadow-[var(--shadow-3)] text-sm font-medium",
        style: {
          background: "#059669",
          color: "#ffffff",
          borderColor: "#047857",
        },
        classNames: {
          toast: "rounded-xl text-sm font-medium shadow-[var(--shadow-3)]",
          success: "!bg-emerald-600 !text-white !border-emerald-700",
          error: "!bg-rose-600 !text-white !border-rose-700",
          warning: "!bg-amber-600 !text-white !border-amber-700",
          info: "!bg-blue-600 !text-white !border-blue-700",
        },
      }}
    />
  );
}

export { toast } from "sonner";
