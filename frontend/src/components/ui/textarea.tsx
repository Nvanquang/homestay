import React from "react";
import { AlertCircle } from "lucide-react";

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  maxLength?: number;
  showCount?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      maxLength,
      showCount = false,
      value,
      defaultValue,
      id,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const hasError = Boolean(errorMessage);

    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className="w-full flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={inputId}
              className="text-sm font-semibold text-[var(--color-text-primary)]"
            >
              {label}
              {props.required && <span className="text-[var(--color-error-fg)] ml-1">*</span>}
            </label>
          )}

          {showCount && maxLength && (
            <span className="text-xs text-[var(--color-text-secondary)]">
              {charCount}/{maxLength}
            </span>
          )}
        </div>

        <textarea
          id={inputId}
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
          disabled={disabled}
          className={`w-full p-3.5 text-base sm:text-sm bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] rounded-lg transition-all focus:outline-none disabled:bg-[var(--color-bg-subtle)] disabled:text-[var(--color-text-disabled)] disabled:cursor-not-allowed ${
            hasError
              ? "border-2 border-[var(--color-border-error)] focus:ring-2 focus:ring-[var(--color-error-fg)]/20"
              : "border border-[var(--color-border-input)] hover:border-[var(--color-border-strong)] focus:border-2 focus:border-[var(--color-border-strong)]"
          } ${className}`}
          rows={props.rows || 4}
          {...props}
        />

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

TextArea.displayName = "TextArea";
