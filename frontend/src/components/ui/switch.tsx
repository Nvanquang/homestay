import React from "react";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  description?: string;
  size?: "sm" | "md";
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      description,
      size = "md",
      checked,
      disabled,
      onChange,
      id,
      className = "",
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const trackSize = size === "sm" ? "w-9 h-5" : "w-11 h-6";
    const thumbSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
    const thumbTranslate =
      size === "sm"
        ? checked
          ? "translate-x-4"
          : "translate-x-1"
        : checked
        ? "translate-x-5"
        : "translate-x-1";

    return (
      <label
        htmlFor={inputId}
        className={`flex items-start justify-between gap-4 select-none ${
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        } ${className}`}
      >
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {description}
              </span>
            )}
          </div>
        )}

        <div className="relative inline-flex items-center flex-shrink-0 pt-0.5">
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            role="switch"
            aria-checked={checked}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="sr-only"
            {...props}
          />
          <div
            className={`${trackSize} rounded-full transition-colors duration-200 ease-in-out ${
              checked
                ? "bg-[var(--color-brand-600)]"
                : "bg-[var(--color-gray-300)] dark:bg-[var(--color-gray-700)]"
            } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div
              className={`${thumbSize} rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out mt-1 ${thumbTranslate}`}
            />
          </div>
        </div>
      </label>
    );
  }
);

Switch.displayName = "Switch";
