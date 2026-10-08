import { AppApiError } from "@/lib/errors";
import { getCurrentUser } from "@/features/auth/api/mock-auth";
import {
  UserProfile,
  NotificationSettings,
  ChangePasswordResult,
  HostModeResult,
} from "../types";
import { ProfileInput, ChangePasswordInput, NotificationSettingsInput } from "../schemas";

const STORAGE_PROFILE_KEY = "homestay_mock_profile";
const STORAGE_NOTIF_KEY = "homestay_mock_notifications";

const DEFAULT_PROFILE: UserProfile = {
  id: "usr_guest_01",
  fullName: "Nguyễn Văn Khách",
  email: "guest@demo.test",
  emailVerified: true,
  phone: "0901234567",
  bio: "Xin chào! Tôi yêu thích khám phá các điểm homestay mộc mạc và trải nghiệm văn hoá địa phương.",
  avatarUrl: "",
  language: "vi",
  displayCurrency: "VND",
  verificationStatus: "UNVERIFIED",
  isHost: false,
  createdAt: "2026-01-01T00:00:00Z",
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  bookingUpdates: true,
  promoOffers: false,
};

/**
 * Get the current account profile.
 */
export async function getAccountProfile(): Promise<UserProfile> {
  await new Promise((res) => setTimeout(res, 150));

  if (typeof window === "undefined") {
    return DEFAULT_PROFILE;
  }

  const stored = localStorage.getItem(STORAGE_PROFILE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as UserProfile;
    } catch {
      // fallback
    }
  }

  // If session exists from auth, seed with session info
  const sessionUser = getCurrentUser();
  if (sessionUser) {
    const profileFromSession: UserProfile = {
      ...DEFAULT_PROFILE,
      id: sessionUser.id,
      fullName: sessionUser.fullName,
      email: sessionUser.email,
      emailVerified: sessionUser.emailVerified,
      isHost: sessionUser.isHost,
    };
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profileFromSession));
    return profileFromSession;
  }

  localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(DEFAULT_PROFILE));
  return DEFAULT_PROFILE;
}

/**
 * Update the user profile (PATCH /me).
 */
export async function updateAccountProfile(
  data: Partial<ProfileInput> & { avatarUrl?: string }
): Promise<UserProfile> {
  await new Promise((res) => setTimeout(res, 200));

  const current = await getAccountProfile();
  const updated: UserProfile = {
    ...current,
    fullName: data.fullName !== undefined ? data.fullName : current.fullName,
    phone: data.phone !== undefined ? data.phone : current.phone,
    bio: data.bio !== undefined ? data.bio : current.bio,
    language: data.language !== undefined ? data.language : current.language,
    displayCurrency:
      data.displayCurrency !== undefined
        ? data.displayCurrency
        : current.displayCurrency,
    avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : current.avatarUrl,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(updated));
  }

  return updated;
}

/**
 * Upload new avatar (POST /me/avatar).
 * Enforces file size <= 5MB and format check.
 */
export async function uploadAvatar(
  file: File | string
): Promise<{ avatarUrl: string }> {
  await new Promise((res) => setTimeout(res, 300));

  if (typeof file !== "string") {
    if (file.size > 5 * 1024 * 1024) {
      throw new AppApiError({
        status: 400,
        code: "validation",
        title: "Tệp quá lớn",
        detail: "Dung lượng ảnh không được vượt quá 5MB.",
      });
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      throw new AppApiError({
        status: 400,
        code: "validation",
        title: "Định dạng không hỗ trợ",
        detail: "Chỉ hỗ trợ tệp định dạng JPG, PNG hoặc WebP.",
      });
    }

    // Convert file to object URL or data URL
    const previewUrl = URL.createObjectURL(file);
    await updateAccountProfile({ avatarUrl: previewUrl });
    return { avatarUrl: previewUrl };
  }

  await updateAccountProfile({ avatarUrl: file });
  return { avatarUrl: file };
}

/**
 * Delete avatar (DELETE /me/avatar).
 */
export async function deleteAvatar(): Promise<{ success: boolean }> {
  await new Promise((res) => setTimeout(res, 150));
  await updateAccountProfile({ avatarUrl: "" });
  return { success: true };
}

/**
 * Change account password (POST /me/password).
 * Returns 204 or throws 422 WRONG_CURRENT.
 */
export async function changePassword(
  data: ChangePasswordInput
): Promise<ChangePasswordResult> {
  await new Promise((res) => setTimeout(res, 250));

  // Check wrong current password mock case
  if (
    data.currentPassword === "wrong" ||
    data.currentPassword === "WrongPassword123" ||
    data.currentPassword === "incorrect"
  ) {
    throw new AppApiError({
      status: 422,
      code: "WRONG_CURRENT",
      title: "Mật khẩu hiện tại không chính xác",
      detail: "Mật khẩu hiện tại bạn cung cấp không đúng.",
      fieldErrors: [
        {
          field: "currentPassword",
          code: "WRONG_CURRENT",
          message: "Mật khẩu hiện tại không chính xác.",
        },
      ],
    });
  }

  return {
    success: true,
    loggedOutOtherSessions: true,
  };
}

/**
 * Enable Host mode (POST /me/host-mode).
 * Stage 1 one-way toggle.
 */
export async function toggleHostMode(
  enable: boolean = true
): Promise<HostModeResult> {
  await new Promise((res) => setTimeout(res, 200));

  const current = await getAccountProfile();
  const updated: UserProfile = {
    ...current,
    isHost: enable,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(updated));
  }

  return {
    isHost: enable,
    hostVerification: {
      status: current.verificationStatus,
    },
  };
}

/**
 * Get notification settings.
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  await new Promise((res) => setTimeout(res, 100));

  if (typeof window === "undefined") {
    return DEFAULT_NOTIFICATIONS;
  }

  const stored = localStorage.getItem(STORAGE_NOTIF_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as NotificationSettings;
    } catch {
      // fallback
    }
  }

  return DEFAULT_NOTIFICATIONS;
}

/**
 * Update notification settings.
 */
export async function updateNotificationSettings(
  data: NotificationSettingsInput
): Promise<NotificationSettings> {
  await new Promise((res) => setTimeout(res, 150));

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_NOTIF_KEY, JSON.stringify(data));
  }

  return data;
}
