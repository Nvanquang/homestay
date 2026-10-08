"use client";

import React, { useState } from "react";
import { Dialog } from "./dialog";
import { Button } from "./button";
import { TextArea } from "./textarea";
import { AlertTriangle, Info } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void> | void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  isLoading?: boolean;
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  minReasonLength?: number;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Huỷ",
  isDanger = false,
  isLoading = false,
  requireReason = false,
  reasonLabel = "Lý do thực hiện (Bắt buộc)",
  reasonPlaceholder = "Nhập lý do chi tiết (tối thiểu 10 ký tự)...",
  minReasonLength = 10,
}: ConfirmDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (isLoading) return;
    setReason("");
    setError(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (requireReason) {
      const trimmed = reason.trim();
      if (!trimmed) {
        setError("Vui lòng nhập lý do thực hiện.");
        return;
      }
      if (trimmed.length < minReasonLength) {
        setError(`Lý do phải có ít nhất ${minReasonLength} ký tự.`);
        return;
      }
    }

    setError(null);
    await onConfirm(reason.trim());
    setReason("");
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          {isDanger ? (
            <AlertTriangle className="w-5 h-5 text-[var(--color-error-fg)] flex-shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-[var(--color-brand-600)] flex-shrink-0" />
          )}
          <span>{title}</span>
        </div>
      }
      description={description}
      maxWidth="md"
    >
      <div className="space-y-4 pt-2">
        {requireReason && (
          <div>
            <TextArea
              id="confirm-reason"
              label={reasonLabel}
              placeholder={reasonPlaceholder}
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              rows={3}
              errorMessage={error || undefined}
              helperText={
                !error
                  ? `Tối thiểu ${minReasonLength} ký tự để lưu vào nhật ký kiểm toán.`
                  : undefined
              }
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border-subtle)]">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={isDanger ? "danger" : "primary"}
            size="sm"
            onClick={handleConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
