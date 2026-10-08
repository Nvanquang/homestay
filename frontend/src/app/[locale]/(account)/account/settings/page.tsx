"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { AccountShell } from "@/components/layouts";
import { Select } from "@/components/ui";
import { toast } from "@/components/ui/toaster";
import {
  PasswordChangeForm,
  HostModeCard,
  NotificationSettingsForm,
  getAccountProfile,
  updateAccountProfile,
  getNotificationSettings,
  UserProfile,
  NotificationSettings,
} from "@/features/account";
import { Globe, Lock, Bell, Home, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AccountSettingsPage() {
  const t = useTranslations("account.settings");
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = (params?.locale as string) || "vi";

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [profData, notifData] = await Promise.all([
          getAccountProfile(),
          getNotificationSettings(),
        ]);
        if (mounted) {
          setProfile(profData);
          setNotifications(notifData);
        }
      } catch (err: unknown) {
        toast.error("Error loading account settings");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLang = e.target.value as "vi" | "en";
    if (!profile) return;

    const previousLang = profile.language;
    try {
      // Optimistic update
      setProfile({ ...profile, language: nextLang });
      await updateAccountProfile({ language: nextLang });

      const langLabel = nextLang === "vi" ? "Tiếng Việt" : "English";
      toast.success(
        t("languageChangedToast", { lang: langLabel })
      );

      // If locale prefix doesn't match, push new path
      if (nextLang !== currentLocale) {
        const newPath = pathname.replace(`/${currentLocale}`, `/${nextLang}`);
        router.push(newPath);
      }
    } catch (err: unknown) {
      // Rollback
      setProfile({ ...profile, language: previousLang });
      toast.error("Error switching language");
    }
  };

  const handleHostModeChanged = (newIsHost: boolean) => {
    if (profile) {
      setProfile({ ...profile, isHost: newIsHost });
    }
  };

  if (isLoading) {
    return (
      <AccountShell activeTab="settings" title={t("title")}>
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--color-text-secondary)]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-600)]" />
          <p className="text-sm font-medium">Loading...</p>
        </div>
      </AccountShell>
    );
  }

  return (
    <AccountShell
      activeTab="settings"
      title={t("title")}
      description={t("description")}
      userName={profile?.fullName}
    >
      <div className="space-y-10">
        {/* Section 1: Ngôn ngữ & Tiền tệ */}
        <section aria-labelledby="heading-language-currency" className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
            <Globe className="w-5 h-5 text-[var(--color-brand-600)]" />
            <h2
              id="heading-language-currency"
              className="text-lg font-bold text-[var(--color-text-primary)]"
            >
              {t("languageSection")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              id="settings-language"
              label={t("languageLabel")}
              options={[
                { value: "vi", label: "Tiếng Việt" },
                { value: "en", label: "English" },
              ]}
              value={profile?.language || "vi"}
              onChange={handleLanguageChange}
              helperText={t("languageHelper")}
            />

            <div>
              <Select
                id="settings-currency"
                label={t("currencyLabel")}
                disabled
                options={[
                  { value: "VND", label: "VND (₫) - Đồng Việt Nam" },
                  { value: "USD", label: "USD ($) - Đô la Mỹ" },
                ]}
                value={profile?.displayCurrency || "VND"}
                helperText={t("currencyHelper")}
              />
            </div>
          </div>
        </section>

        {/* Section 2: Đổi mật khẩu */}
        <section aria-labelledby="heading-password" className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
            <Lock className="w-5 h-5 text-[var(--color-brand-600)]" />
            <h2
              id="heading-password"
              className="text-lg font-bold text-[var(--color-text-primary)]"
            >
              {t("passwordSection")}
            </h2>
          </div>
          <div className="max-w-xl">
            <PasswordChangeForm />
          </div>
        </section>

        {/* Section 3: Cài đặt thông báo */}
        <section aria-labelledby="heading-notifications" className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
            <Bell className="w-5 h-5 text-[var(--color-brand-600)]" />
            <h2
              id="heading-notifications"
              className="text-lg font-bold text-[var(--color-text-primary)]"
            >
              {t("notificationSection")}
            </h2>
          </div>
          <div className="max-w-2xl">
            {notifications && (
              <NotificationSettingsForm initialSettings={notifications} />
            )}
          </div>
        </section>

        {/* Section 4: Chế độ Host */}
        <section aria-labelledby="heading-host-mode" className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
            <Home className="w-5 h-5 text-[var(--color-brand-600)]" />
            <h2
              id="heading-host-mode"
              className="text-lg font-bold text-[var(--color-text-primary)]"
            >
              {t("hostModeSection")}
            </h2>
          </div>
          <div className="max-w-2xl">
            <HostModeCard
              initialIsHost={Boolean(profile?.isHost)}
              verificationStatus={profile?.verificationStatus || "UNVERIFIED"}
              onHostModeChanged={handleHostModeChanged}
            />
          </div>
        </section>
      </div>
    </AccountShell>
  );
}
