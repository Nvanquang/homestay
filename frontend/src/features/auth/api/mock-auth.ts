import { AppApiError } from "@/lib/errors";
import { LoginInput, RegisterInput } from "../schemas";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  isHost: boolean;
  staffRole: "ADMIN" | "SUPPORT" | "ACCOUNTANT" | null;
  status: "ACTIVE" | "LOCKED";
  createdAt: string;
}

const STORAGE_SESSION_KEY = "homestay_mock_session";

// Demo Seed Users
export const SEED_USERS: Record<string, { user: AuthUser; passwordHash: string }> = {
  "guest@demo.test": {
    user: {
      id: "usr_guest_01",
      fullName: "Nguyễn Văn Khách",
      email: "guest@demo.test",
      emailVerified: true,
      isHost: false,
      staffRole: null,
      status: "ACTIVE",
      createdAt: "2026-01-01T00:00:00Z",
    },
    passwordHash: "Password123",
  },
  "host@demo.test": {
    user: {
      id: "usr_host_01",
      fullName: "Trần Chủ Nhà",
      email: "host@demo.test",
      emailVerified: true,
      isHost: true,
      staffRole: null,
      status: "ACTIVE",
      createdAt: "2026-01-02T00:00:00Z",
    },
    passwordHash: "Password123",
  },
  "admin@demo.test": {
    user: {
      id: "usr_admin_01",
      fullName: "Lê Quản Trị",
      email: "admin@demo.test",
      emailVerified: true,
      isHost: false,
      staffRole: "ADMIN",
      status: "ACTIVE",
      createdAt: "2026-01-03T00:00:00Z",
    },
    passwordHash: "Password123",
  },
  "unverified@demo.test": {
    user: {
      id: "usr_unverified_01",
      fullName: "Hoàng Chưa Xác Minh",
      email: "unverified@demo.test",
      emailVerified: false,
      isHost: false,
      staffRole: null,
      status: "ACTIVE",
      createdAt: "2026-01-04T00:00:00Z",
    },
    passwordHash: "Password123",
  },
  "locked@demo.test": {
    user: {
      id: "usr_locked_01",
      fullName: "Phạm Tạm Khoá",
      email: "locked@demo.test",
      emailVerified: true,
      isHost: false,
      staffRole: null,
      status: "LOCKED",
      createdAt: "2026-01-05T00:00:00Z",
    },
    passwordHash: "Password123",
  },
};

/**
 * Mask an email for display: an***@mail.com
 */
export function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const name = parts[0] || "";
  const domain = parts[1] || "";
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}***@${domain}`;
}

/**
 * Mock login call.
 */
export async function mockLogin(credentials: LoginInput): Promise<AuthUser> {
  // Simulate network latency
  await new Promise((res) => setTimeout(res, 200));

  const target = SEED_USERS[credentials.email.toLowerCase()];

  // Wrong email or password
  if (!target || target.passwordHash !== credentials.password) {
    throw new AppApiError({
      status: 401,
      code: "generic",
      title: "Đăng nhập thất bại",
      detail: "Email hoặc mật khẩu không chính xác.",
    });
  }

  // Account locked
  if (target.user.status === "LOCKED" || credentials.email === "locked@demo.test") {
    const lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    throw new AppApiError({
      status: 423,
      code: "locked",
      title: "Tài khoản bị tạm khoá",
      detail: "Tài khoản đang bị tạm khoá. Vui lòng thử lại sau.",
      lockedUntil,
    });
  }

  // Email unverified
  if (!target.user.emailVerified) {
    throw new AppApiError({
      status: 403,
      code: "auth.unauthenticated",
      title: "Chưa xác minh email",
      detail: "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để xác minh.",
    });
  }

  // Save session to localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(target.user));
  }

  return target.user;
}

/**
 * Mock registration call.
 */
export async function mockRegister(
  data: RegisterInput
): Promise<{ emailMasked: string; resendAvailableIn: number }> {
  await new Promise((res) => setTimeout(res, 200));

  // Email already exists check
  if (SEED_USERS[data.email.toLowerCase()]) {
    throw new AppApiError({
      status: 409,
      code: "conflict",
      title: "Email đã tồn tại",
      detail: "Địa chỉ email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.",
      fieldErrors: [
        {
          field: "email",
          code: "conflict",
          message: "Email này đã được đăng ký. Bạn có thể đăng nhập ngay.",
        },
      ],
    });
  }

  return {
    emailMasked: maskEmail(data.email),
    resendAvailableIn: 60,
  };
}

export type VerifyEmailStatus = "VERIFIED" | "EXPIRED" | "USED" | "INVALID";

/**
 * Mock verify email call (called once on mount).
 */
export async function mockVerifyEmail(
  token: string
): Promise<VerifyEmailStatus> {
  await new Promise((res) => setTimeout(res, 300));

  if (token === "expired") return "EXPIRED";
  if (token === "used") return "USED";
  if (!token || token === "invalid") return "INVALID";

  return "VERIFIED";
}

/**
 * Mock resend verification email call.
 */
export async function mockResendVerification(
  email: string
): Promise<{ success: boolean; resendAvailableIn: number }> {
  await new Promise((res) => setTimeout(res, 200));
  if (!email) {
    throw new AppApiError({
      status: 400,
      code: "VALIDATION",
      detail: "Vui lòng cung cấp địa chỉ email hợp lệ.",
    });
  }
  return { success: true, resendAvailableIn: 60 };
}

/**
 * Mock forgot password request (always neutral 202).
 */
export async function mockForgotPassword(
  email: string
): Promise<{ success: boolean }> {
  await new Promise((res) => setTimeout(res, 200));
  return { success: Boolean(email) };
}

/**
 * Mock reset password call.
 */
export async function mockResetPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean }> {
  await new Promise((res) => setTimeout(res, 300));

  if (!token || token === "invalid" || token === "expired") {
    throw new AppApiError({
      status: 410,
      code: "conflict",
      title: "Liên kết hết hạn",
      detail: "Liên kết đặt lại mật khẩu đã hết hạn hoặc đã được sử dụng.",
    });
  }

  return { success: Boolean(newPassword) };
}

/**
 * Mock get current user session.
 */
export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

/**
 * Mock logout call.
 */
export async function mockLogout(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  }
}
