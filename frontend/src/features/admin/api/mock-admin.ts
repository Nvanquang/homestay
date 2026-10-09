import {
  StaffUser,
  StaffRole,
  StaffStatus,
  StaffActivityLog,
  StaffFilterParams,
  StaffListResponse,
  AdminAuthSession,
} from "../types";
import { AdminLoginFormValues, CreateStaffFormValues } from "../schemas";

// In-memory staff list seed
let staffDatabase: StaffUser[] = [
  {
    id: "staff-1",
    fullName: "Quản trị viên Hệ thống",
    email: "admin@homestay.local",
    staffRole: "ADMIN",
    status: "ACTIVE",
    lastLoginAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    createdAt: "2026-01-01T08:00:00Z",
  },
  {
    id: "staff-2",
    fullName: "Lan CSKH",
    email: "lan.cskh@homestay.local",
    staffRole: "SUPPORT",
    status: "ACTIVE",
    lastLoginAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    createdAt: "2026-01-15T09:30:00Z",
  },
  {
    id: "staff-3",
    fullName: "Minh Kế toán",
    email: "minh.kt@homestay.local",
    staffRole: "ACCOUNTANT",
    status: "LOCKED",
    lastLoginAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "staff-4",
    fullName: "Hoàng CSKH",
    email: "hoang.support@homestay.local",
    staffRole: "SUPPORT",
    status: "INVITED",
    lastLoginAt: null,
    createdAt: "2026-03-01T14:20:00Z",
  },
];

// Activity logs seed
let activityDatabase: StaffActivityLog[] = [
  {
    id: "log-1",
    staffId: "staff-3",
    actorId: "staff-1",
    actorName: "Quản trị viên Hệ thống",
    action: "LOCK",
    reason: "Tạm khoá theo yêu cầu kiểm toán tài chính nội bộ quý 1",
    createdAt: "2026-03-02T11:00:00Z",
  },
  {
    id: "log-2",
    staffId: "staff-4",
    actorId: "staff-1",
    actorName: "Quản trị viên Hệ thống",
    action: "CREATE",
    newValue: "SUPPORT",
    reason: "Tuyển dụng nhân viên hỗ trợ ca tối",
    createdAt: "2026-03-01T14:20:00Z",
  },
];

// Current session
let currentAdminSession: AdminAuthSession | null = {
  id: "staff-1",
  fullName: "Quản trị viên Hệ thống",
  email: "admin@homestay.local",
  staffRole: "ADMIN",
};

export async function adminLogin(
  credentials: AdminLoginFormValues
): Promise<AdminAuthSession> {
  await new Promise((r) => setTimeout(r, 150));

  const trimmedEmail = credentials.email.trim().toLowerCase();

  // Chặn tài khoản khách/host thông thường
  if (
    trimmedEmail.includes("guest") ||
    trimmedEmail.includes("customer") ||
    trimmedEmail === "user@example.com"
  ) {
    throw new Error("FORBIDDEN_ROLE: Tài khoản không có quyền truy cập back-office");
  }

  const staff = staffDatabase.find(
    (s) => s.email.toLowerCase() === trimmedEmail
  );

  if (!staff) {
    // Để bảo mật, thông báo chung cho tài khoản không tồn tại trong danh sách back-office
    throw new Error("FORBIDDEN_ROLE: Tài khoản không có quyền truy cập back-office");
  }

  if (credentials.password === "wrongpassword") {
    throw new Error("UNAUTHORIZED: Email hoặc mật khẩu không chính xác");
  }

  if (staff.status === "LOCKED") {
    throw new Error(
      "ACCOUNT_LOCKED: Tài khoản của bạn đã bị vô hiệu hoá. Vui lòng liên hệ Admin hệ thống."
    );
  }

  staff.lastLoginAt = new Date().toISOString();

  currentAdminSession = {
    id: staff.id,
    fullName: staff.fullName,
    email: staff.email,
    staffRole: staff.staffRole,
  };

  return { ...currentAdminSession };
}

export async function getCurrentAdminSession(): Promise<AdminAuthSession | null> {
  await new Promise((r) => setTimeout(r, 50));
  return currentAdminSession ? { ...currentAdminSession } : null;
}

export async function setCurrentAdminSession(
  session: AdminAuthSession | null
): Promise<void> {
  currentAdminSession = session;
}

export async function adminLogout(): Promise<void> {
  await new Promise((r) => setTimeout(r, 50));
  currentAdminSession = null;
}

export async function getStaffList(
  params: StaffFilterParams = {}
): Promise<StaffListResponse> {
  await new Promise((r) => setTimeout(r, 100));

  let filtered = [...staffDatabase];

  if (params.query && params.query.trim()) {
    const q = params.query.trim().toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }

  if (params.role && params.role !== "ALL") {
    filtered = filtered.filter((s) => s.staffRole === params.role);
  }

  if (params.status && params.status !== "ALL") {
    filtered = filtered.filter((s) => s.status === params.status);
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function createStaff(
  data: CreateStaffFormValues
): Promise<StaffUser> {
  await new Promise((r) => setTimeout(r, 150));

  const existing = staffDatabase.find(
    (s) => s.email.toLowerCase() === data.email.trim().toLowerCase()
  );
  if (existing) {
    throw new Error("EMAIL_EXISTS: Email này đã tồn tại trong hệ thống nhân sự");
  }

  const newStaff: StaffUser = {
    id: `staff-${Date.now()}`,
    fullName: data.fullName.trim(),
    email: data.email.trim().toLowerCase(),
    staffRole: data.staffRole,
    status: "INVITED",
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
  };

  staffDatabase.unshift(newStaff);

  // Log activity
  activityDatabase.unshift({
    id: `log-${Date.now()}`,
    staffId: newStaff.id,
    actorId: currentAdminSession?.id || "system",
    actorName: currentAdminSession?.fullName || "Quản trị viên",
    action: "CREATE",
    newValue: newStaff.staffRole,
    reason: "Thêm mới nhân sự và gửi lời mời kích hoạt",
    createdAt: new Date().toISOString(),
  });

  return { ...newStaff };
}

export async function updateStaffRole(
  id: string,
  newRole: StaffRole,
  reason: string
): Promise<StaffUser> {
  await new Promise((r) => setTimeout(r, 150));

  const target = staffDatabase.find((s) => s.id === id);
  if (!target) {
    throw new Error("NOT_FOUND: Không tìm thấy nhân sự");
  }

  // Chặn tự hạ quyền chính mình
  if (currentAdminSession && currentAdminSession.id === id && newRole !== "ADMIN") {
    throw new Error("409 SELF_ACTION: Không thể tự hạ quyền quản trị của chính mình");
  }

  // Chặn hạ quyền Admin cuối cùng
  if (target.staffRole === "ADMIN" && newRole !== "ADMIN") {
    const adminCount = staffDatabase.filter(
      (s) => s.staffRole === "ADMIN" && s.status !== "LOCKED"
    ).length;
    if (adminCount <= 1) {
      throw new Error("409 LAST_ADMIN: Không thể hạ quyền Admin cuối cùng của hệ thống");
    }
  }

  const oldRole = target.staffRole;
  target.staffRole = newRole;

  activityDatabase.unshift({
    id: `log-${Date.now()}`,
    staffId: target.id,
    actorId: currentAdminSession?.id || "system",
    actorName: currentAdminSession?.fullName || "Quản trị viên",
    action: "CHANGE_ROLE",
    oldValue: oldRole,
    newValue: newRole,
    reason: reason.trim(),
    createdAt: new Date().toISOString(),
  });

  return { ...target };
}

export async function toggleStaffLock(
  id: string,
  lock: boolean,
  reason: string
): Promise<StaffUser> {
  await new Promise((r) => setTimeout(r, 150));

  const target = staffDatabase.find((s) => s.id === id);
  if (!target) {
    throw new Error("NOT_FOUND: Không tìm thấy nhân sự");
  }

  // Chặn tự khoá chính mình
  if (currentAdminSession && currentAdminSession.id === id && lock) {
    throw new Error("409 SELF_ACTION: Không thể tự vô hiệu hoá tài khoản của chính mình");
  }

  // Chặn khoá Admin cuối cùng
  if (target.staffRole === "ADMIN" && lock) {
    const activeAdminCount = staffDatabase.filter(
      (s) => s.staffRole === "ADMIN" && s.status !== "LOCKED"
    ).length;
    if (activeAdminCount <= 1) {
      throw new Error("409 LAST_ADMIN: Không thể khoá tài khoản Admin cuối cùng đang hoạt động");
    }
  }

  target.status = lock ? "LOCKED" : "ACTIVE";

  activityDatabase.unshift({
    id: `log-${Date.now()}`,
    staffId: target.id,
    actorId: currentAdminSession?.id || "system",
    actorName: currentAdminSession?.fullName || "Quản trị viên",
    action: lock ? "LOCK" : "UNLOCK",
    reason: reason.trim(),
    createdAt: new Date().toISOString(),
  });

  return { ...target };
}

export async function getStaffActivityLogs(
  staffId: string
): Promise<StaffActivityLog[]> {
  await new Promise((r) => setTimeout(r, 100));
  return activityDatabase
    .filter((log) => log.staffId === staffId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

// Reset data helper cho tests
export function _resetStaffDatabase(): void {
  staffDatabase = [
    {
      id: "staff-1",
      fullName: "Quản trị viên Hệ thống",
      email: "admin@homestay.local",
      staffRole: "ADMIN",
      status: "ACTIVE",
      lastLoginAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      createdAt: "2026-01-01T08:00:00Z",
    },
    {
      id: "staff-2",
      fullName: "Lan CSKH",
      email: "lan.cskh@homestay.local",
      staffRole: "SUPPORT",
      status: "ACTIVE",
      lastLoginAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      createdAt: "2026-01-15T09:30:00Z",
    },
    {
      id: "staff-3",
      fullName: "Minh Kế toán",
      email: "minh.kt@homestay.local",
      staffRole: "ACCOUNTANT",
      status: "LOCKED",
      lastLoginAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: "2026-02-01T10:00:00Z",
    },
    {
      id: "staff-4",
      fullName: "Hoàng CSKH",
      email: "hoang.support@homestay.local",
      staffRole: "SUPPORT",
      status: "INVITED",
      lastLoginAt: null,
      createdAt: "2026-03-01T14:20:00Z",
    },
  ];
  currentAdminSession = {
    id: "staff-1",
    fullName: "Quản trị viên Hệ thống",
    email: "admin@homestay.local",
    staffRole: "ADMIN",
  };
}
