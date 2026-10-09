import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  basicInfoSchema,
  locationSchema,
  photosStepSchema,
  createDraftListing,
  updateListingDraft,
  reorderPhotos,
} from "../index";
import { SaveIndicator } from "../components/SaveIndicator";
import { WizardNav } from "../components/WizardNav";
import { ListingCardHost } from "../components/ListingCardHost";
import { SortablePhotoGrid } from "../components/SortablePhotoGrid";

describe("Slice FE-S05: Host Listing Draft (Step 1-3)", () => {
  describe("Zod Validation Schemas", () => {
    it("validates Step 1 Basic Info successfully for valid data", () => {
      const validData = {
        propertyType: "ENTIRE_PLACE" as const,
        title: "Homestay ấm cúng ngắm đồi thông Đà Lạt",
        description:
          "Chào mừng bạn đến với căn nhà gỗ xinh xắn giữa lòng Đà Lạt mộng mơ. Không gian yên tĩnh, đầy đủ tiện nghi bếp và lò sưởi ấm áp cho mùa đông.",
        maxGuests: 4,
        bedrooms: 2,
        beds: 2,
        bathrooms: 1.5,
        checkInTime: "14:00",
        checkOutTime: "12:00",
        currency: "VND",
      };

      const result = basicInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects Step 1 when title is shorter than 10 characters", () => {
      const invalidData = {
        propertyType: "ENTIRE_PLACE" as const,
        title: "Ngắn",
        description: "Mô tả đủ dài hơn 50 ký tự cho homestay xinh xắn tại thành phố ngàn hoa Đà Lạt mộng mơ...",
        maxGuests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        checkInTime: "14:00",
        checkOutTime: "12:00",
        currency: "VND",
      };

      const result = basicInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("10 ký tự");
      }
    });

    it("rejects Step 1 when description is shorter than 50 characters", () => {
      const invalidData = {
        propertyType: "ENTIRE_PLACE" as const,
        title: "Homestay ấm cúng tại Đà Lạt",
        description: "Mô tả quá ngắn chưa tới năm mươi ký tự",
        maxGuests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        checkInTime: "14:00",
        checkOutTime: "12:00",
        currency: "VND",
      };

      const result = basicInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("50 ký tự");
      }
    });

    it("validates Step 2 Location schema and enforces privacy fields", () => {
      const validLocation = {
        province: "Lâm Đồng",
        district: "Thành phố Đà Lạt",
        exactAddress: "12/4 Đường Khởi Nghĩa Bắc Sơn, Phường 10",
        exactLat: 11.9404,
        exactLng: 108.4583,
      };

      const result = locationSchema.safeParse(validLocation);
      expect(result.success).toBe(true);
    });

    it("rejects Step 2 when exact address is empty", () => {
      const invalidLocation = {
        province: "Lâm Đồng",
        district: "Thành phố Đà Lạt",
        exactAddress: "",
        exactLat: 11.9404,
        exactLng: 108.4583,
      };

      const result = locationSchema.safeParse(invalidLocation);
      expect(result.success).toBe(false);
    });
  });

  describe("UI Components", () => {
    it("renders SaveIndicator with saving and saved states", () => {
      const { rerender } = render(<SaveIndicator status="saving" />);
      expect(screen.getByText("Đang lưu...")).toBeDefined();

      const savedTime = new Date("2026-10-09T10:42:00");
      rerender(<SaveIndicator status="saved" lastSavedAt={savedTime} />);
      expect(screen.getByTestId("save-indicator")).toBeDefined();
    });

    it("renders WizardNav with 8 steps and progress calculation", () => {
      const onSelect = vi.fn();
      render(
        <WizardNav
          currentStep="basic"
          completedStepsCount={2}
          onSelectStep={onSelect}
        />
      );

      expect(screen.getByText("2/8")).toBeDefined();
      expect(screen.getByText("Thông tin cơ bản")).toBeDefined();
      expect(screen.getByText("Vị trí trên bản đồ")).toBeDefined();
      expect(screen.getByText("Hình ảnh chỗ ở")).toBeDefined();
    });

    it("renders ListingCardHost with draft progress and resume button", () => {
      const mockListing: any = {
        id: "lst-test-1",
        hostId: "user-host-1",
        status: "DRAFT",
        version: 1,
        basicInfo: {
          propertyType: "ENTIRE_PLACE",
          title: "Biệt thự view hồ Tuyền Lâm",
          description: "Mô tả biệt thự tuyệt đẹp...",
          maxGuests: 6,
          bedrooms: 3,
          beds: 4,
          bathrooms: 3,
          checkInTime: "14:00",
          checkOutTime: "12:00",
          currency: "VND",
        },
        location: {
          province: "Lâm Đồng",
          district: "Đà Lạt",
          exactAddress: "Khu du lịch Hồ Tuyền Lâm",
          exactLat: 11.9,
          exactLng: 108.4,
        },
        photos: [],
        draftProgress: {
          completedSteps: 2,
          totalSteps: 8,
          resumeStep: "photos",
        },
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        capabilities: {
          canEdit: true,
          canPreview: true,
          canViewStatus: false,
          canOpenCalendar: false,
          canOpenPricing: false,
          canDelete: true,
        },
      };

      render(<ListingCardHost listing={mockListing} locale="vi" />);

      expect(screen.getByText("Biệt thự view hồ Tuyền Lâm")).toBeDefined();
      expect(screen.getAllByText("Nháp · 2/8 bước").length).toBeGreaterThan(0);
      expect(screen.getByText("Tiếp tục chỉnh sửa")).toBeDefined();
    });

    it("renders SortablePhotoGrid with photo cards and minimum counter", () => {
      const mockPhotos: any[] = [
        {
          id: "p1",
          url: "https://example.com/photo1.jpg",
          order: 0,
          caption: "Ảnh phòng khách",
          status: "READY",
        },
        {
          id: "p2",
          url: "https://example.com/photo2.jpg",
          order: 1,
          caption: "Ảnh phòng ngủ",
          status: "READY",
        },
      ];

      render(
        <SortablePhotoGrid
          photos={mockPhotos}
          onUpload={vi.fn()}
          onReorder={vi.fn()}
          onDeletePhoto={vi.fn()}
        />
      );

      expect(screen.getByText("Ảnh bìa")).toBeDefined();
      expect(screen.getByText("Đã tải: 2/30 ảnh")).toBeDefined();
    });
  });

  describe("API & Concurrency Management", () => {
    it("creates draft listing starting from step 1", async () => {
      const newDraft = await createDraftListing({
        propertyType: "ENTIRE_PLACE",
        title: "Căn hộ lãng mạn trung tâm phố cổ",
        description: "Căn hộ ấm cúng đầy đủ tiện nghi, cách hồ Gươm 200m đi bộ...",
        maxGuests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        checkInTime: "14:00",
        checkOutTime: "12:00",
        currency: "VND",
      });

      expect(newDraft.id).toBeDefined();
      expect(newDraft.status).toBe("DRAFT");
      expect(newDraft.version).toBe(1);
      expect(newDraft.draftProgress.resumeStep).toBe("location");
    });

    it("detects 409 CONFLICT when two tabs edit concurrently with mismatched version", async () => {
      const draft = await createDraftListing({
        propertyType: "PRIVATE_ROOM",
        title: "Phòng riêng tiện nghi gần biển",
        description: "Phòng nghỉ thoáng mát có ban công ngắm bình minh biển Nha Trang...",
        maxGuests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        checkInTime: "14:00",
        checkOutTime: "12:00",
        currency: "VND",
      });

      // Update once -> version increases to 2
      const updated = await updateListingDraft(draft.id, {
        basicInfo: { title: "Phòng riêng tiện nghi biển (đã sửa lần 1)" },
      }, 1);

      expect(updated.version).toBe(2);

      // Attempting to update with stale version 1 from another tab should throw 409
      await expect(
        updateListingDraft(draft.id, {
          basicInfo: { title: "Cố tình ghi đè bằng version cũ" },
        }, 1)
      ).rejects.toThrow("409 CONFLICT");
    });

    it("reorders photos and automatically assigns first photo as cover", async () => {
      const draft = await createDraftListing({
        propertyType: "ENTIRE_PLACE",
        title: "Nhà vườn sinh thái ngoại ô",
        description: "Không gian xanh mát, vườn cây ăn trái và ao sen trong lành...",
        maxGuests: 6,
        bedrooms: 3,
        beds: 3,
        bathrooms: 2,
        checkInTime: "14:00",
        checkOutTime: "12:00",
        currency: "VND",
      });

      // Add 2 photos
      const updatedWithPhotos = await updateListingDraft(draft.id, {
        photos: [
          {
            id: "photo-A",
            url: "https://example.com/a.jpg",
            order: 0,
            status: "READY",
          },
          {
            id: "photo-B",
            url: "https://example.com/b.jpg",
            order: 1,
            status: "READY",
          },
        ],
      });

      expect(updatedWithPhotos.coverPhotoUrl).toBe("https://example.com/a.jpg");

      // Reorder photos: photo-B becomes first
      const reordered = await reorderPhotos(draft.id, ["photo-B", "photo-A"]);
      expect(reordered[0].id).toBe("photo-B");
      expect(reordered[0].order).toBe(0);
      expect(reordered[1].id).toBe("photo-A");
      expect(reordered[1].order).toBe(1);
    });
  });
});
