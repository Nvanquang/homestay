export type IdentityVerificationStatus =
  | "UNVERIFIED"
  | "PENDING"
  | "VERIFIED"
  | "REJECTED";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  language: "vi" | "en";
  displayCurrency: "VND" | "USD";
  verificationStatus: IdentityVerificationStatus;
  isHost: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  bookingUpdates: boolean;
  promoOffers: boolean;
}

export interface ChangePasswordResult {
  success: boolean;
  loggedOutOtherSessions: boolean;
}

export interface HostModeResult {
  isHost: boolean;
  hostVerification: {
    status: IdentityVerificationStatus;
  };
}
