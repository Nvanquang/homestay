"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AccountShell } from "@/components/layouts";
import {
  TextField,
  TextArea,
  Select,
  Button,
  Badge,
} from "@/components/ui";
import { toast } from "@/components/ui/toaster";
import {
  AvatarUploader,
  IdentityVerificationCard,
  getAccountProfile,
  updateAccountProfile,
  profileSchema,
  ProfileInput,
  UserProfile,
} from "@/features/account";
import { Check, RotateCcw, Save, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AccountProfilePage() {
  const t = useTranslations("account");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      bio: "",
      language: "vi",
      displayCurrency: "VND",
    },
  });

  const watchedBio = watch("bio") || "";

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const data = await getAccountProfile();
        if (mounted) {
          setProfile(data);
          reset({
            fullName: data.fullName,
            phone: data.phone || "",
            bio: data.bio || "",
            language: data.language,
            displayCurrency: data.displayCurrency,
          });
        }
      } catch (err: unknown) {
        toast.error("Error loading profile");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [reset]);

  const onSubmit = async (data: ProfileInput) => {
    try {
      const updated = await updateAccountProfile(data);
      setProfile(updated);
      reset({
        fullName: updated.fullName,
        phone: updated.phone || "",
        bio: updated.bio || "",
        language: updated.language,
        displayCurrency: updated.displayCurrency,
      });
      toast.success(t("saveSuccess"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("saveFailed");
      toast.error(msg);
    }
  };

  const handleCancel = () => {
    if (!profile) return;
    reset({
      fullName: profile.fullName,
      phone: profile.phone || "",
      bio: profile.bio || "",
      language: profile.language,
      displayCurrency: profile.displayCurrency,
    });
    toast.info(t("cancelToast"));
  };

  const handleAvatarChange = (newUrl: string) => {
    if (profile) {
      setProfile({ ...profile, avatarUrl: newUrl });
    }
  };

  const handleAvatarRemove = () => {
    if (profile) {
      setProfile({ ...profile, avatarUrl: "" });
    }
  };

  if (isLoading) {
    return (
      <AccountShell activeTab="profile" title={t("profileTitle")}>
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--color-text-secondary)]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-600)]" />
          <p className="text-sm font-medium">{t("loadingProfile")}</p>
        </div>
      </AccountShell>
    );
  }

  return (
    <AccountShell
      activeTab="profile"
      title={t("profileTitle")}
      description={t("profileDesc")}
      userName={profile?.fullName}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Avatar & Identity Verification */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="p-6 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] flex flex-col items-center text-center">
            <AvatarUploader
              avatarUrl={profile?.avatarUrl}
              userName={profile?.fullName || "Khách"}
              onAvatarChange={handleAvatarChange}
              onAvatarRemove={handleAvatarRemove}
            />
            <div className="mt-4">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                {profile?.fullName}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {profile?.email}
              </p>
            </div>
          </div>

          <IdentityVerificationCard
            status={profile?.verificationStatus || "UNVERIFIED"}
          />
        </div>

        {/* Right Column: Profile Edit Form */}
        <div className="md:col-span-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Họ và tên */}
            <TextField
              id="profile-fullname"
              label={t("fullNameLabel")}
              required
              placeholder={t("fullNamePlaceholder")}
              errorMessage={errors.fullName?.message}
              {...register("fullName")}
            />

            {/* Email (Readonly) */}
            <div className="w-full flex flex-col gap-1.5">
              <label
                htmlFor="profile-email"
                className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center justify-between"
              >
                <span>{t("emailLabel")}</span>
                {profile?.emailVerified && (
                  <Badge variant="success" icon={<Check className="w-3 h-3" />}>
                    {t("emailVerified")}
                  </Badge>
                )}
              </label>
              <input
                id="profile-email"
                type="email"
                value={profile?.email || ""}
                readOnly
                disabled
                className="w-full h-11 px-3.5 text-base sm:text-sm bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] rounded-lg border border-[var(--color-border-default)] cursor-not-allowed select-none"
              />
              <p className="text-xs text-[var(--color-text-secondary)]">
                {t("emailDesc")}
              </p>
            </div>

            {/* Số điện thoại */}
            <TextField
              id="profile-phone"
              label={t("phoneLabel")}
              type="tel"
              placeholder={t("phonePlaceholder")}
              helperText={t("phoneDesc")}
              errorMessage={errors.phone?.message}
              {...register("phone")}
            />

            {/* Ngôn ngữ mặc định */}
            <Controller
              name="language"
              control={control}
              render={({ field }) => (
                <Select
                  id="profile-language"
                  label={t("languageLabel")}
                  options={[
                    { value: "vi", label: "Tiếng Việt (Vietnamese)" },
                    { value: "en", label: "English (Tiếng Anh)" },
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  helperText={t("languageDesc")}
                />
              )}
            />

            {/* Giới thiệu bản thân */}
            <div className="w-full">
              <TextArea
                id="profile-bio"
                label={t("bioLabel")}
                placeholder={t("bioPlaceholder")}
                rows={4}
                maxLength={300}
                showCount
                value={watchedBio}
                helperText={t("bioDesc")}
                errorMessage={errors.bio?.message}
                {...register("bio")}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border-subtle)]">
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={!isDirty || isSubmitting}
                onClick={handleCancel}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                {t("cancelChanges")}
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!isDirty}
                isLoading={isSubmitting}
                leftIcon={<Save className="w-4 h-4" />}
              >
                {t("saveChanges")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AccountShell>
  );
}
