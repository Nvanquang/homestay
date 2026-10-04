"use client";

import { useCallback, useState } from "react";

export interface UseDisclosureProps {
  defaultIsOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface UseDisclosureReturn {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

export function useDisclosure({
  defaultIsOpen = false,
  onOpen: onOpenProp,
  onClose: onCloseProp,
}: UseDisclosureProps = {}): UseDisclosureReturn {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);

  const onOpen = useCallback(() => {
    setIsOpen(true);
    onOpenProp?.();
  }, [onOpenProp]);

  const onClose = useCallback(() => {
    setIsOpen(false);
    onCloseProp?.();
  }, [onCloseProp]);

  const onToggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        onOpenProp?.();
      } else {
        onCloseProp?.();
      }
      return next;
    });
  }, [onOpenProp, onCloseProp]);

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
    setIsOpen,
  };
}
