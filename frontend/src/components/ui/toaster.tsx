"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        className:
          "bg-[var(--color-bg-inverse)] text-[var(--color-text-inverse)] border border-[var(--color-border-strong)] rounded-xl shadow-[var(--shadow-3)] text-sm font-medium",
        style: {
          background: "#222222",
          color: "#ffffff",
        },
      }}
    />
  );
}

export { toast } from "sonner";
