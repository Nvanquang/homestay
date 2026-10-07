-- ==============================================================================
-- V1__init_baseline_and_extensions.sql
-- Khởi tạo extensions PostgreSQL, bảng nền tảng idempotency, audit và shedlock
-- ==============================================================================

-- 1. Kích hoạt PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Bảng lưu trữ Idempotency Key (Chống lặp yêu cầu thanh toán / đặt phòng)
CREATE TABLE IF NOT EXISTS idempotency_key (
    key VARCHAR(128) NOT NULL,
    principal_id VARCHAR(64),
    method VARCHAR(10),
    path VARCHAR(255),
    request_hash VARCHAR(64),
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    response_status INT,
    response_payload TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_idempotency_key PRIMARY KEY (key),
    CONSTRAINT ck_idempotency_status CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'FAILED'))
);

CREATE INDEX IF NOT EXISTS idx_idempotency_expires_at ON idempotency_key (expires_at);

-- 3. Bảng Activity Log (Nhật ký kiểm toán audit bất biến)
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID NOT NULL,
    actor_id VARCHAR(64) NOT NULL,
    actor_role VARCHAR(32) NOT NULL,
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_activity_log PRIMARY KEY (id),
    CONSTRAINT ck_activity_log_actor_role CHECK (actor_role IN ('GUEST', 'HOST', 'ADMIN', 'SYSTEM', 'SUPPORT', 'FINANCE'))
);

CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log (entity_type, entity_id, created_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_actor ON activity_log (actor_id, created_at);

-- Trigger phòng thủ chiều sâu: Bảng activity_log chỉ cho phép INSERT và SELECT, cấm UPDATE và DELETE
CREATE OR REPLACE FUNCTION prevent_modification_activity_log()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Bảng activity_log là nhật ký bất biến: Không cho phép UPDATE hoặc DELETE!';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_activity_log_immutable ON activity_log;
CREATE TRIGGER trg_activity_log_immutable
BEFORE UPDATE OR DELETE ON activity_log
FOR EACH ROW
EXECUTE FUNCTION prevent_modification_activity_log();

-- 4. Bảng ShedLock (Phục vụ khóa phân tán cho các Scheduled Tasks)
CREATE TABLE IF NOT EXISTS shedlock (
    name VARCHAR(64) NOT NULL,
    lock_until TIMESTAMPTZ NOT NULL,
    locked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    locked_by VARCHAR(255) NOT NULL,
    CONSTRAINT pk_shedlock PRIMARY KEY (name)
);
