"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch, Button } from "@/components/ui";
import { toast } from "@/components/ui/toaster";
import {
  notificationSettingsSchema,
  NotificationSettingsInput,
} from "../schemas";
import {
  updateNotificationSettings,
} from "../api/mock-account";
import { Save } from "lucide-react";
import { useTranslations } from "next-intl";

export interface NotificationSettingsFormProps {
  initialSettings: NotificationSettingsInput;
}

export function NotificationSettingsForm({
  initialSettings,
}: NotificationSettingsFormProps) {
  const t = useTranslations("account.settings");

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
    reset,
  } = useForm<NotificationSettingsInput>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: initialSettings,
  });

  const onSubmit = async (data: NotificationSettingsInput) => {
    try {
      await updateNotificationSettings(data);
      reset(data);
      toast.success(t("notifSavedToast"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving notification settings";
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4 divide-y divide-[var(--color-border-subtle)]">
        <Controller
          name="emailNotifications"
          control={control}
          render={({ field }) => (
            <div className="pt-2">
              <Switch
                id="notif-email"
                label={t("emailNotif")}
                description={t("emailNotifDesc")}
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            </div>
          )}
        />

        <Controller
          name="bookingUpdates"
          control={control}
          render={({ field }) => (
            <div className="pt-4">
              <Switch
                id="notif-booking"
                label={t("bookingNotif")}
                description={t("bookingNotifDesc")}
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            </div>
          )}
        />

        <Controller
          name="smsNotifications"
          control={control}
          render={({ field }) => (
            <div className="pt-4">
              <Switch
                id="notif-sms"
                label={t("smsNotif")}
                description={t("smsNotifDesc")}
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            </div>
          )}
        />

        <Controller
          name="promoOffers"
          control={control}
          render={({ field }) => (
            <div className="pt-4">
              <Switch
                id="notif-promo"
                label={t("promoNotif")}
                description={t("promoNotifDesc")}
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            </div>
          )}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="secondary"
          size="md"
          isLoading={isSubmitting}
          disabled={!isDirty}
          leftIcon={<Save className="w-4 h-4" />}
        >
          {t("saveNotifBtn")}
        </Button>
      </div>
    </form>
  );
}
