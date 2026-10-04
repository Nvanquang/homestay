"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Check, Circle, AlertCircle } from "lucide-react";

export interface PasswordFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  showCriteria?: boolean;
}

export const PasswordField = React.forwardRef<
  HTMLInputElement,
  PasswordFieldProps
>(
  (
    {
      label,
      helperText,
      errorMessage,
      showCriteria = false,
      disabled,
      readOnly,
      id,
      className = "",
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const hasError = Boolean(errorMessage);

    const currentVal = typeof value === "string" ? value : "";
    const hasMinLength = currentVal.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(currentVal);
    const hasNumber = /[0-9]/.test(currentVal);
    const hasLetterAndNumber = hasLetter && hasNumber;
    const hasSpecial = /[^a-zA-Z0-9]/.test(currentVal);

    // Calculate password strength (0-3)
    let strengthScore = 0;
    if (hasMinLength) strengthScore += 1;
    if (hasLetterAndNumber) strengthScore += 1;
    if (currentVal.length >= 10 && hasSpecial) strengthScore += 1;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-[var(--color-text-primary)]"
          >
            {label}
            {props.required && <span className="text-[var(--color-error-fg)] ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <input
            id={inputId}
            ref={ref}
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={onChange}
            disabled={disabled}
            readOnly={readOnly}
            className={`w-full h-11 pl-3.5 pr-11 text-base sm:text-sm bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] rounded-lg transition-all focus:outline-none disabled:bg-[var(--color-bg-subtle)] disabled:text-[var(--color-text-disabled)] disabled:cursor-not-allowed ${
              hasError
                ? "border-2 border-[var(--color-border-error)] focus:ring-2 focus:ring-[var(--color-error-fg)]/20"
                : "border border-[var(--color-border-input)] hover:border-[var(--color-border-strong)] focus:border-2 focus:border-[var(--color-border-strong)]"
            } ${className}`}
            {...props}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute right-3.5 p-1 rounded hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] focus:outline-none"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Real-time Validation Criteria */}
        {showCriteria && (
          <div className="mt-1 space-y-1.5 text-xs text-[var(--color-text-secondary)]">
            <div className="flex items-center gap-4">
              <span className={`flex items-center gap-1.5 ${hasMinLength ? "text-[var(--color-success-fg)] font-medium" : ""}`}>
                {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5 text-[var(--color-gray-400)]" />}
                ≥ 8 ký tự
              </span>
              <span className={`flex items-center gap-1.5 ${hasLetterAndNumber ? "text-[var(--color-success-fg)] font-medium" : ""}`}>
                {hasLetterAndNumber ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5 text-[var(--color-gray-400)]" />}
                Gồm chữ & số
              </span>
            </div>

            {/* Strength Meter Bar */}
            {currentVal.length > 0 && (
              <div className="flex items-center gap-1.5 pt-1">
                <div className="flex-1 grid grid-cols-3 gap-1">
                  <div className={`h-1 rounded-full ${strengthScore >= 1 ? "bg-[var(--color-error-fg)]" : "bg-[var(--color-gray-200)]"}`} />
                  <div className={`h-1 rounded-full ${strengthScore >= 2 ? "bg-[var(--color-warning-fg)]" : "bg-[var(--color-gray-200)]"}`} />
                  <div className={`h-1 rounded-full ${strengthScore >= 3 ? "bg-[var(--color-success-fg)]" : "bg-[var(--color-gray-200)]"}`} />
                </div>
                <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">
                  {strengthScore === 1 && "Yếu"}
                  {strengthScore === 2 && "Trung bình"}
                  {strengthScore === 3 && "Mạnh"}
                </span>
              </div>
            )}
          </div>
        )}

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

PasswordField.displayName = "PasswordField";
