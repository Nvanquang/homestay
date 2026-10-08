export type StaffRole = "ADMIN" | "SUPPORT" | "ACCOUNTANT";

export type StaffStatus = "ACTIVE" | "INVITED" | "LOCKED";

export interface StaffUser {
  id: string;
  fullName: string;
  email: string;
  staffRole: StaffRole;
  status: StaffStatus;
  lastLoginAt?: string | null;
  createdAt: string;
  avatarUrl?: string;
}

export type StaffActivityAction = "CREATE" | "CHANGE_ROLE" | "LOCK" | "UNLOCK";

export interface StaffActivityLog {
  id: string;
  staffId: string;
  actorId: string;
  actorName: string;
  action: StaffActivityAction;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  createdAt: string;
}

export interface StaffFilterParams {
  query?: string;
  role?: StaffRole | "ALL";
  status?: StaffStatus | "ALL";
  page?: number;
  pageSize?: number;
}

export interface StaffListResponse {
  items: StaffUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminAuthSession {
  id: string;
  fullName: string;
  email: string;
  staffRole: StaffRole;
}
