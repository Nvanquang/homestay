import React from "react";
import { ChevronDown, AlertCircle } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  errorMessage?: string;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      helperText,
      errorMessage,
      placeholder,
      id,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const hasError = Boolean(errorMessage);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-semibold text-[var(--color-text-primary)]"
          >
            {label}
            {props.required && <span className="text-[var(--color-error-fg)] ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={`w-full h-11 pl-3.5 pr-10 text-base sm:text-sm bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] rounded-lg appearance-none cursor-pointer transition-all focus:outline-none disabled:bg-[var(--color-bg-subtle)] disabled:text-[var(--color-text-disabled)] disabled:cursor-not-allowed ${
              hasError
                ? "border-2 border-[var(--color-border-error)]"
                : "border border-[var(--color-border-input)] hover:border-[var(--color-border-strong)] focus:border-2 focus:border-[var(--color-border-strong)]"
            } ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown className="w-4 h-4 absolute right-3.5 pointer-events-none text-[var(--color-text-secondary)]" />
        </div>

        {hasError && (
          <p className="flex items-center gap-1.5 text-xs text-[var(--color-text-error)] font-medium">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </p>
        )}

        {!hasError && helperText && (
          <p className="text-xs text-[var(--color-text-secondary)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
