"use client";

import React, { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  AlertCircle,
  Eye,
  RefreshCw,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ListingItem,
  WizardStepId,
  getListingDetail,
  updateListingDraft,
  uploadListingPhoto,
  reorderPhotos,
  deleteListingPhoto,
  basicInfoSchema,
  locationSchema,
  photosStepSchema,
  getBookingRulesSchema,
  getPricingSchema,
  ListingPhotoItem,
  BasicInfoData,
  LocationData,
  BookingRulesData,
  PricingData,
} from "@/features/listing-editor";
import {
  WizardNav,
  WIZARD_STEPS,
} from "@/features/listing-editor/components/WizardNav";
import {
  SaveIndicator,
  SaveStatus,
} from "@/features/listing-editor/components/SaveIndicator";
import { Step1Basic } from "@/features/listing-editor/components/Step1Basic";
import { Step2Location } from "@/features/listing-editor/components/Step2Location";
import { Step3Photos } from "@/features/listing-editor/components/Step3Photos";
import { Step4Amenities } from "@/features/listing-editor/components/Step4Amenities";
import { Step5Rules } from "@/features/listing-editor/components/Step5Rules";
import { Step6Pricing } from "@/features/listing-editor/components/Step6Pricing";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { toast } from "sonner";

const DEFAULT_BOOKING_RULES: BookingRulesData = {
  minNights: 1,
  maxNights: 30,
  prepNights: 0,
  minNoticeHours: 0,
  maxAdvanceMonths: 12,
  houseRules: {
    smoking: false,
    pets: false,
    parties: false,
    quietHoursEnabled: true,
    quietHoursFrom: "22:00",
    quietHoursTo: "07:00",
    notes: "",
  },
};

const DEFAULT_PRICING: PricingData = {
  baseNightlyPrice: 1200000,
  weekendNightlyPrice: 1400000,
  cleaningFee: 200000,
  baseGuests: 2,
  extraGuestFee: 100000,
  weeklyDiscountPct: 10,
  monthlyDiscountPct: 20,
  currency: "VND",
};

export default function ListingWizardStepPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; step: string }>;
}) {
  const resolvedParams = use(params);
  const { locale, id, step } = resolvedParams;
  const router = useRouter();
  const t = useTranslations("listingWizard");

  const currentStep = (step as WizardStepId) || "basic";

  const [listing, setListing] = useState<ListingItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Local editing copy
  const [basicInfo, setBasicInfo] = useState<BasicInfoData | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [photos, setPhotos] = useState<ListingPhotoItem[]>([]);
  const [amenityIds, setAmenityIds] = useState<string[]>([]);
  const [bookingRules, setBookingRules] = useState<BookingRulesData>(DEFAULT_BOOKING_RULES);
  const [pricing, setPricing] = useState<PricingData>(DEFAULT_PRICING);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Auto-save debounce timer
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDirtyRef = useRef(false);

  // Load listing detail
  const fetchListing = async () => {
    setIsLoading(true);
    setConflictError(null);
    try {
      const data = await getListingDetail(id);
      setListing(data);
      setBasicInfo(data.basicInfo);
      setLocationData(data.location);
      setPhotos(data.photos);
      setAmenityIds(data.amenityIds || []);
      setBookingRules(data.bookingRules || DEFAULT_BOOKING_RULES);
      setPricing(data.pricing || DEFAULT_PRICING);
      setLastSavedAt(new Date(data.updatedAt));
      setSaveStatus("idle");
    } catch (err: any) {
      toast.error(err?.message || "Không tìm thấy chỗ nghỉ");
      router.push(`/${locale}/host/listings`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [id]);

  const isReadOnly = listing?.status === "PENDING_APPROVAL";

  // Perform save to API
  const persistChanges = async (showToast: boolean = false): Promise<boolean> => {
    if (!listing || isReadOnly) return true;

    setSaveStatus("saving");
    setErrorMessage(null);
    try {
      const updated = await updateListingDraft(
        id,
        {
          basicInfo: basicInfo || undefined,
          location: locationData || undefined,
          photos: photos,
          amenityIds: amenityIds,
          bookingRules: bookingRules,
          pricing: pricing,
          currentStep,
        },
        listing.version
      );

      setListing(updated);
      setLastSavedAt(new Date(updated.updatedAt));
      setSaveStatus("saved");
      isDirtyRef.current = false;
      if (showToast) {
        toast.success(locale === "en" ? "Draft saved successfully" : "Đã lưu thay đổi nháp thành công");
      }
      return true;
    } catch (err: any) {
      const msg = err?.message || "Lỗi lưu dữ liệu";
      if (msg.includes("409 CONFLICT")) {
        setConflictError(
          "Dữ liệu đã bị thay đổi ở một tab khác hoặc phiên làm việc khác. Vui lòng tải lại trang để tránh mất thông tin."
        );
      }
      setSaveStatus("error");
      setErrorMessage(msg);
      toast.error(msg);
      return false;
    }
  };

  // Debounced auto-save when user edits
  const triggerAutoSave = () => {
    if (isReadOnly) return;
    isDirtyRef.current = true;
    setSaveStatus("saving");
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      persistChanges(false);
    }, 1500);
  };

  const handleBasicChange = (partial: Partial<BasicInfoData>) => {
    if (!basicInfo) return;
    setBasicInfo({ ...basicInfo, ...partial });
    setValidationErrors((prev) => {
      const next = { ...prev };
      Object.keys(partial).forEach((k) => delete next[k]);
      return next;
    });
    triggerAutoSave();
  };

  const handleLocationChange = (partial: Partial<LocationData>) => {
    if (!locationData) return;
    setLocationData({ ...locationData, ...partial });
    setValidationErrors((prev) => {
      const next = { ...prev };
      Object.keys(partial).forEach((k) => delete next[k]);
      return next;
    });
    triggerAutoSave();
  };

  // Step 3 Photo actions
  const handlePhotoUpload = async (files: FileList | File[]) => {
    if (isReadOnly) return;
    setSaveStatus("saving");
    try {
      const newItems: ListingPhotoItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploaded = await uploadListingPhoto(id, file);
        newItems.push(uploaded);
      }
      setPhotos((prev) => [...prev, ...newItems]);
      setSaveStatus("saved");
      setLastSavedAt(new Date());
      toast.success(
        locale === "vi"
          ? `Đã tải lên ${newItems.length} hình ảnh`
          : `Uploaded ${newItems.length} photo(s)`
      );
    } catch (err: any) {
      toast.error(
        err?.message || (locale === "vi" ? "Tải ảnh thất bại" : "Upload failed")
      );
      setSaveStatus("error");
    }
  };

  const handlePhotoReorder = async (reordered: ListingPhotoItem[]) => {
    if (isReadOnly) return;
    setPhotos(reordered);
    try {
      await reorderPhotos(
        id,
        reordered.map((p) => p.id)
      );
      setLastSavedAt(new Date());
      setSaveStatus("saved");
    } catch {
      toast.error(
        locale === "vi" ? "Không thể lưu thứ tự ảnh" : "Failed to reorder photos"
      );
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (isReadOnly) return;
    try {
      await deleteListingPhoto(id, photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      setLastSavedAt(new Date());
      setSaveStatus("saved");
      toast.success(
        locale === "vi" ? "Đã xoá ảnh khỏi phòng" : "Photo removed"
      );
    } catch {
      toast.error(
        locale === "vi" ? "Không thể xoá ảnh" : "Failed to remove photo"
      );
    }
  };

  const handleUpdateCaption = (photoId: string, caption: string) => {
    if (isReadOnly) return;
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, caption } : p))
    );
    triggerAutoSave();
  };

  // Quick helper to populate sample photos for easy testing
  const handleAddSamplePhotos = async () => {
    const samples: ListingPhotoItem[] = [
      {
        id: `p-sample-1-${Date.now()}`,
        url: "https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=800&q=80",
        order: 0,
        caption: "Phòng ngủ ấm cúng",
        status: "READY",
      },
      {
        id: `p-sample-2-${Date.now()}`,
        url: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
        order: 1,
        caption: "Góc ban công ngắm hoàng hôn",
        status: "READY",
      },
      {
        id: `p-sample-3-${Date.now()}`,
        url: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
        order: 2,
        caption: "Phòng khách đầy đủ tiện nghi",
        status: "READY",
      },
      {
        id: `p-sample-4-${Date.now()}`,
        url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
        order: 3,
        caption: "Phòng tắm hiện đại",
        status: "READY",
      },
      {
        id: `p-sample-5-${Date.now()}`,
        url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
        order: 4,
        caption: "Bếp nấu gia đình",
        status: "READY",
      },
    ];

    const nextPhotos = [...photos, ...samples];
    setPhotos(nextPhotos);
    await updateListingDraft(id, { photos: nextPhotos }, listing?.version);
    toast.success("Đã thêm 5 ảnh mẫu chất lượng cao!");
  };

  const handleAmenitiesChange = (newIds: string[]) => {
    setAmenityIds(newIds);
    triggerAutoSave();
  };

  const handleRulesChange = (partial: Partial<BookingRulesData>) => {
    setBookingRules((prev) => ({ ...prev, ...partial }));
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next.minNights;
      delete next.maxNights;
      return next;
    });
    triggerAutoSave();
  };

  const handlePricingChange = (partial: Partial<PricingData>) => {
    setPricing((prev) => ({ ...prev, ...partial }));
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next.baseNightlyPrice;
      return next;
    });
    triggerAutoSave();
  };

  // Navigation handlers
  const validateCurrentStep = (): boolean => {
    setValidationErrors({});

    if (currentStep === "basic" && basicInfo) {
      const res = basicInfoSchema.safeParse(basicInfo);
      if (!res.success) {
        const errs: Record<string, string> = {};
        res.error.issues.forEach((iss) => {
          errs[iss.path[0]?.toString() || "form"] = iss.message;
        });
        setValidationErrors(errs);
        toast.error(
          locale === "vi"
            ? "Vui lòng hoàn thành đúng thông tin cơ bản trước khi tiếp tục"
            : "Please complete basic information before proceeding"
        );
        return false;
      }
    }

    if (currentStep === "location" && locationData) {
      const res = locationSchema.safeParse(locationData);
      if (!res.success) {
        const errs: Record<string, string> = {};
        res.error.issues.forEach((iss) => {
          errs[iss.path[0]?.toString() || "form"] = iss.message;
        });
        setValidationErrors(errs);
        toast.error(
          locale === "vi"
            ? "Vui lòng nhập đầy đủ Tỉnh/Thành phố, Quận/Huyện và Địa chỉ chính xác"
            : "Please fill in Province, District and Address"
        );
        return false;
      }
    }

    // Step 5: Booking rules cross validation
    if (currentStep === "rules" && bookingRules) {
      const res = getBookingRulesSchema(locale).safeParse(bookingRules);
      if (!res.success) {
        const errs: Record<string, string> = {};
        res.error.issues.forEach((iss) => {
          errs[iss.path[0]?.toString() || "form"] = iss.message;
        });
        setValidationErrors(errs);
        toast.error(
          bookingRules.minNights > bookingRules.maxNights
            ? (locale === "en"
                ? "Minimum nights cannot be greater than maximum nights"
                : "Đêm tối thiểu không được lớn hơn đêm tối đa")
            : (locale === "en"
                ? "Please check booking rules requirements"
                : "Vui lòng hoàn thiện đúng các quy tắc lưu trú")
        );
        return false;
      }
    }

    // Step 6: Pricing validation
    if (currentStep === "pricing" && pricing) {
      const res = getPricingSchema(locale).safeParse(pricing);
      if (!res.success) {
        const errs: Record<string, string> = {};
        res.error.issues.forEach((iss) => {
          errs[iss.path[0]?.toString() || "form"] = iss.message;
        });
        setValidationErrors(errs);
        toast.error(
          locale === "en"
            ? "Please enter a valid base price per night (at least 10,000 VND)"
            : "Vui lòng nhập giá cơ bản hợp lệ cho chỗ nghỉ (tối thiểu 10.000₫)"
        );
        return false;
      }
    }

    return true;
  };

  const getNextStepId = (): WizardStepId => {
    switch (currentStep) {
      case "basic":
        return "location";
      case "location":
        return "photos";
      case "photos":
        return "amenities";
      case "amenities":
        return "rules";
      case "rules":
        return "pricing";
      case "pricing":
        return "policy";
      default:
        return "basic";
    }
  };

  const getPrevStepId = (): WizardStepId | null => {
    switch (currentStep) {
      case "location":
        return "basic";
      case "photos":
        return "location";
      case "amenities":
        return "photos";
      case "rules":
        return "amenities";
      case "pricing":
        return "rules";
      case "policy":
        return "pricing";
      default:
        return null;
    }
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    const saved = await persistChanges(false);
    if (!saved) return;

    const nextStep = getNextStepId();
    if (nextStep === "policy") {
      toast.info(
        locale === "vi"
          ? "Đã hoàn thành Bước 1-6 của Slice S06! Bước 7 Chính sách sẽ sẵn sàng trong Slice S07."
          : "Steps 1-6 completed! Step 7 Policies will be available in Slice S07."
      );
    }
    router.push(`/${locale}/host/listings/${id}/edit/${nextStep}`);
  };

  const handlePrev = async () => {
    await persistChanges(false);
    const prevStep = getPrevStepId();
    if (prevStep) {
      router.push(`/${locale}/host/listings/${id}/edit/${prevStep}`);
    } else {
      router.push(`/${locale}/host/listings`);
    }
  };

  const handleSaveAndExit = async () => {
    await persistChanges(true);
    router.push(`/${locale}/host/listings`);
  };

  const handleSelectStepFromNav = async (targetStep: WizardStepId) => {
    await persistChanges(false);
    router.push(`/${locale}/host/listings/${id}/edit/${targetStep}`);
  };

  if (isLoading || !listing || !basicInfo || !locationData) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-page)] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2 text-[var(--color-text-secondary)]">
          <RefreshCw className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
          <p className="text-sm font-medium">
            {locale === "vi" ? "Đang nạp dữ liệu chỗ nghỉ..." : "Loading listing data..."}
          </p>
        </div>
      </div>
    );
  }

  const currentStepDef = WIZARD_STEPS.find((s) => s.id === currentStep);

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] text-[var(--color-text-primary)]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-subtle)] shadow-2xs">
        <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          {/* Left: Back button + Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={handleSaveAndExit}
              className="p-1.5 rounded-lg hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] transition-colors cursor-pointer shrink-0"
              title={t("back")}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)] truncate max-w-[170px] xs:max-w-[240px] sm:max-w-sm md:max-w-md lg:max-w-lg">
                {basicInfo.title || (locale === "vi" ? "Chỗ nghỉ chưa đặt tên" : "Untitled Listing")}
              </h1>
              <p className="text-[11px] text-[var(--color-text-tertiary)] truncate">
                {t("stepCounter", { step: currentStepDef?.stepNumber || 1 })} · {t((currentStepDef?.labelKey || "step1Label") as any)}
              </p>
            </div>
          </div>

          {/* Right Actions: SaveIndicator + Locale + SaveAndExit */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <SaveIndicator
              status={saveStatus}
              lastSavedAt={lastSavedAt}
              errorMessage={errorMessage || undefined}
              onRetry={() => persistChanges(true)}
            />
            <div className="hidden sm:block">
              <LocaleSwitcher />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveAndExit}
              className="text-xs px-2.5 sm:px-3.5 py-1.5 font-medium cursor-pointer shrink-0"
            >
              <span className="hidden sm:inline">{t("saveAndExit")}</span>
              <span className="sm:hidden">{locale === "vi" ? "Lưu" : "Save"}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile/Tablet Horizontal Step Tracker (< lg) */}
      <div className="lg:hidden bg-[var(--color-bg-surface)] border-b border-[var(--color-border-subtle)]">
        <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
              {currentStepDef?.stepNumber || 1}
            </span>
            <span className="font-semibold text-[var(--color-text-primary)] truncate">
              {t((currentStepDef?.labelKey || "step1Label") as any)}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-[var(--color-primary)]">
              {listing.draftProgress.completedSteps}/8 {locale === "vi" ? "bước" : "steps"}
            </span>
            <div className="w-16 sm:w-24 h-1.5 bg-[var(--color-bg-subtle)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-300"
                style={{ width: `${(listing.draftProgress.completedSteps / 8) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 409 Conflict Banner */}
      {conflictError && (
        <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{conflictError}</span>
            </div>
            <button
              type="button"
              onClick={fetchListing}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 shrink-0 cursor-pointer"
            >
              Tải lại trang ngay
            </button>
          </div>
        </div>
      )}

      {/* Read-Only Status Banner */}
      {isReadOnly && (
        <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Chỗ nghỉ đang ở trạng thái <strong>Chờ phê duyệt</strong>. Biểu mẫu hiện ở chế độ chỉ đọc.
            </span>
          </div>
        </div>
      )}

      {/* Wizard Body Grid */}
      <main className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Wizard Navigation (3 cols on xl, 4 on lg, hidden on mobile/tablet) */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-20">
            <WizardNav
              currentStep={currentStep}
              completedStepsCount={listing.draftProgress.completedSteps}
              onSelectStep={handleSelectStepFromNav}
            />
          </aside>

          {/* Right Column: Step Content (9 cols on xl, 8 on lg, full width on mobile) */}
          <div className="lg:col-span-8 xl:col-span-9 bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border-subtle)] p-5 sm:p-7 lg:p-9 shadow-sm space-y-8">
            {/* Step Header */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--color-primary)] tracking-wide uppercase">
                  {t("stepCounter", { step: currentStepDef?.stepNumber || 1 })}
                </span>
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  ID: {listing.id}
                </span>
              </div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] mt-1">
                {t((currentStepDef?.labelKey || "step1Label") as any)}
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {t((currentStepDef?.subLabelKey || "step1Sub") as any)}
              </p>
            </div>

            {/* Step Body */}
            <div>
              {currentStep === "basic" && (
                <Step1Basic
                  data={basicInfo}
                  onChange={handleBasicChange}
                  errors={validationErrors}
                  disabled={isReadOnly}
                />
              )}

              {currentStep === "location" && (
                <Step2Location
                  data={locationData}
                  onChange={handleLocationChange}
                  errors={validationErrors}
                  disabled={isReadOnly}
                />
              )}

              {currentStep === "photos" && (
                <Step3Photos
                  photos={photos}
                  onUpload={handlePhotoUpload}
                  onReorder={handlePhotoReorder}
                  onDeletePhoto={handleDeletePhoto}
                  onUpdateCaption={handleUpdateCaption}
                  onAddSamplePhotos={handleAddSamplePhotos}
                  disabled={isReadOnly}
                />
              )}

              {currentStep === "amenities" && (
                <Step4Amenities
                  selectedAmenityIds={amenityIds}
                  onChange={handleAmenitiesChange}
                  isReadOnly={isReadOnly}
                />
              )}

              {currentStep === "rules" && (
                <Step5Rules
                  data={bookingRules}
                  onChange={handleRulesChange}
                  crossFieldError={validationErrors.minNights}
                  isReadOnly={isReadOnly}
                />
              )}

              {currentStep === "pricing" && (
                <Step6Pricing
                  data={pricing}
                  bookingRules={bookingRules}
                  maxGuests={basicInfo?.maxGuests || 4}
                  onChange={handlePricingChange}
                  errors={validationErrors}
                  isReadOnly={isReadOnly}
                />
              )}

              {/* Placeholders for subsequent steps (S07+) */}
              {!["basic", "location", "photos", "amenities", "rules", "pricing"].includes(currentStep) && (
                <div className="py-12 border border-dashed border-[var(--color-border-subtle)] rounded-xl text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                    {t((currentStepDef?.labelKey || "step1Label") as any)}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto">
                    {locale === "vi"
                      ? "Bước này thuộc về Vertical Slice tiếp theo (S07 Chính sách hủy & Gửi duyệt). Bạn có thể quay lại các bước trước bất kỳ lúc nào."
                      : "This step is part of subsequent Vertical Slice (S07 Cancellation Policies & Submit). You can navigate back to earlier steps anytime."}
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/${locale}/host/listings/${id}/edit/pricing`)}
                    className="text-xs cursor-pointer"
                  >
                    ← {locale === "vi" ? "Bước 6: Giá & Phí" : "Step 6: Pricing"}
                  </Button>
                </div>
              )}
            </div>

            {/* Wizard Navigation Footer */}
            <div className="pt-6 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-subtle)] text-xs font-semibold text-[var(--color-text-primary)] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{getPrevStepId() ? t("back") : (locale === "vi" ? "Danh sách" : "Listings")}</span>
              </button>

              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                <span>
                  {currentStep === "photos"
                    ? t("continueToAmenities")
                    : currentStep === "amenities"
                    ? t("continueToRules")
                    : currentStep === "rules"
                    ? t("continueToPricing")
                    : currentStep === "pricing"
                    ? t("continueToPolicies")
                    : t("continue")}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
