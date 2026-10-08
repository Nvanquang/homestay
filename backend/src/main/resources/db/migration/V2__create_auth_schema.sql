-- ==============================================================================
-- FLYWAY MIGRATION V2: AUTH & AUTHORIZATION SCHEMA
-- Slice: FE-S01 / BE-M01 (Authentication & RBAC)
-- Target Database: PostgreSQL 16+
-- ==============================================================================

-- 1. EXTENSIONS & HELPER FUNCTIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Hàm tự động cập nhật timestamp updated_at
CREATE OR REPLACE FUNCTION set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = clock_timestamp();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. TABLE: users
-- Lưu trữ thông tin tài khoản người dùng, email chuẩn hoá chữ thường, mật khẩu băm Argon2
-- ==============================================================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(254) NOT NULL,
    full_name VARCHAR(80) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UNVERIFIED',
    email_verified_at TIMESTAMPTZ,
    locked_until TIMESTAMPTZ,
    phone VARCHAR(20),
    avatar_url VARCHAR(512),
    bio VARCHAR(300),
    language VARCHAR(5) NOT NULL DEFAULT 'vi',
    display_currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_status CHECK (status IN ('UNVERIFIED', 'ACTIVE', 'LOCKED', 'SUSPENDED')),
    CONSTRAINT chk_users_email_lowercase CHECK (email = LOWER(email))
);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_column();

-- Chỉ mục hỗ trợ tìm kiếm nhanh theo email khi đăng nhập
CREATE INDEX idx_users_email ON users(email);
-- Chỉ mục hỗ trợ lọc người dùng theo trạng thái
CREATE INDEX idx_users_status ON users(status);

-- ==============================================================================
-- 3. TABLE: roles & user_roles
-- Phân quyền hệ thống: GUEST, HOST, ADMIN, CSKH, ACCOUNTANT
-- ==============================================================================
CREATE TABLE roles (
    id SMALLSERIAL PRIMARY KEY,
    name VARCHAR(32) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT uq_roles_name UNIQUE (name)
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id SMALLINT NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- ==============================================================================
-- 4. TABLE: verification_tokens
-- Token xác minh email (EMAIL_VERIFY) và đặt lại mật khẩu (PASSWORD_RESET).
-- Cơ chế Concurrency Safe: dùng cột consumed_at để đảm bảo token dùng 1 lần duy nhất.
-- ==============================================================================
CREATE TABLE verification_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(64) NOT NULL, -- Băm SHA-256 của token thô
    token_type VARCHAR(30) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT fk_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_token_type CHECK (token_type IN ('EMAIL_VERIFY', 'PASSWORD_RESET'))
);

-- Chỉ mục tìm kiếm token nhanh theo giá trị băm và loại token
CREATE INDEX idx_verification_tokens_lookup ON verification_tokens(token_hash, token_type);
-- Chỉ mục phục vụ tra cứu token của một user
CREATE INDEX idx_tokens_user_id ON verification_tokens(user_id, token_type);

-- ==============================================================================
-- 5. TABLE: login_attempts
-- Ghi nhận lịch sử đăng nhập để phát hiện tấn công brute-force và áp dụng rate limit/khóa tạm.
-- ==============================================================================
CREATE TABLE login_attempts (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(254) NOT NULL,
    ip_address VARCHAR(45) NOT NULL, -- Hỗ trợ IPv4 (15 ký tự) & IPv6 (45 ký tự)
    user_agent VARCHAR(512),
    success BOOLEAN NOT NULL DEFAULT FALSE,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Chỉ mục tổng hợp phục vụ đếm số lần sai theo email và thành công trong cửa sổ thời gian
CREATE INDEX idx_login_attempts_email_success ON login_attempts(email, success, attempted_at DESC);
CREATE INDEX idx_login_attempts_ip_time ON login_attempts(ip_address, attempted_at DESC);
CREATE INDEX idx_login_attempts_email_recent ON login_attempts(email, attempted_at DESC);

-- ==============================================================================
-- 6. TABLE: user_consents
-- Lưu trữ chấp thuận Điều khoản dịch vụ và Chính sách quyền riêng tư (P07 acceptTerms).
-- ==============================================================================
CREATE TABLE user_consents (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    consent_type VARCHAR(50) NOT NULL,
    document_version VARCHAR(20) NOT NULL DEFAULT '1.0',
    ip_address VARCHAR(45),
    user_agent VARCHAR(512),
    agreed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT fk_user_consents_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_consent_type CHECK (consent_type IN ('TERMS_OF_SERVICE', 'PRIVACY_POLICY'))
);

CREATE INDEX idx_user_consents_user_id ON user_consents(user_id);

-- ==============================================================================
-- 7. SEED DATA CƠ BẢN: Roles mặc định
-- ==============================================================================
INSERT INTO roles (name, description) VALUES
    ('GUEST', 'Khách thuê phòng cơ bản'),
    ('HOST', 'Chủ nhà cho thuê homestay'),
    ('ADMIN', 'Quản trị viên toàn quyền hệ thống'),
    ('CSKH', 'Nhân viên chăm sóc khách hàng và hỗ trợ tranh chấp'),
    ('ACCOUNTANT', 'Nhân viên kế toán đối soát doanh thu và thanh toán')
ON CONFLICT (name) DO NOTHING;
