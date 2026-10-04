import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDisclosure } from "@/hooks";

describe("useDisclosure Hook", () => {
  it("should default to closed state", () => {
    const { result } = renderHook(() => useDisclosure());
    expect(result.current.isOpen).toBe(false);
  });

  it("should open and close properly", () => {
    const { result } = renderHook(() => useDisclosure({ defaultIsOpen: false }));

    act(() => {
      result.current.onOpen();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.onClose();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("should toggle state", () => {
    const { result } = renderHook(() => useDisclosure());

    act(() => {
      result.current.onToggle();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.onToggle();
    });
    expect(result.current.isOpen).toBe(false);
  });
});
