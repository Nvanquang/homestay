# Database Design Specification · Slice FE-S13: Multi-Currency & Exchange Rates

> **Module**: Core Banking & Currency Exchange (C02, P02, P03 Mở Rộng)  
> **Database Engine**: PostgreSQL 16 with PostGIS & UUIDv7  
> **Clean Architecture Boundary**: `com.homestay.pricing` / `com.homestay.currency`

---

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    CURRENCY_CONFIG ||--o{ EXCHANGE_RATE_SNAPSHOT : has_rates
    CURRENCY_CONFIG ||--o{ USER_CURRENCY_PREFERENCE : preferred_by
    EXCHANGE_RATE_SNAPSHOT ||--o{ EXCHANGE_RATE_ITEM : contains

    CURRENCY_CONFIG {
        varchar(3) code PK "ISO 4217: VND, USD, EUR, JPY, GBP"
        varchar(8) symbol "₫, $, €, ¥, £"
        varchar(50) name_vi "Tên tiếng Việt"
        varchar(50) name_en "Tên tiếng Anh"
        smallint decimal_places "0 (VND, JPY) hoặc 2 (USD, EUR, GBP)"
        boolean is_active "Cho phép quy đổi hiển thị"
        boolean is_settlement "Được chấp nhận thanh toán cổng (VND)"
        timestamptz created_at
        timestamptz updated_at
    }

    EXCHANGE_RATE_SNAPSHOT {
        uuid id PK "UUIDv7"
        varchar(3) base_currency "Mặc định VND"
        varchar(20) status "OK, STALE, UNAVAILABLE"
        date rate_date "Ngày hiệu lực của tỷ giá"
        varchar(100) provider_source "State Bank of Vietnam / Vietcombank"
        timestamptz fetched_at "Thời điểm đồng bộ"
        timestamptz expires_at "Thời điểm hết hạn hiệu lực"
        timestamptz created_at
    }

    EXCHANGE_RATE_ITEM {
        uuid id PK "UUIDv7"
        uuid snapshot_id FK "Tham chiếu EXCHANGE_RATE_SNAPSHOT"
        varchar(3) target_currency FK "Tham chiếu CURRENCY_CONFIG"
        numeric(18,8) rate_to_base "Tỷ lệ: 1 target = X VND"
        numeric(18,8) rate_from_base "Tỷ lệ: 1 VND = X target"
    }

    USER_CURRENCY_PREFERENCE {
        uuid user_id PK "Tham chiếu USERS"
        varchar(3) display_currency FK "Tham chiếu CURRENCY_CONFIG"
        timestamptz updated_at
    }
```

---

## 2. Table Definitions & DDL Constraints

```sql
-- 1. Cấu hình tiền tệ
CREATE TABLE currency_configs (
    code VARCHAR(3) PRIMARY KEY,
    symbol VARCHAR(8) NOT NULL,
    name_vi VARCHAR(50) NOT NULL,
    name_en VARCHAR(50) NOT NULL,
    decimal_places SMALLINT NOT NULL DEFAULT 2 CHECK (decimal_places IN (0, 2)),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_settlement BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed tiền tệ cơ sở
INSERT INTO currency_configs (code, symbol, name_vi, name_en, decimal_places, is_active, is_settlement)
VALUES 
  ('VND', '₫', 'Đồng Việt Nam', 'Vietnamese Dong', 0, TRUE, TRUE),
  ('USD', '$', 'Đô la Mỹ', 'US Dollar', 2, TRUE, FALSE),
  ('EUR', '€', 'Euro', 'Euro', 2, TRUE, FALSE),
  ('JPY', '¥', 'Yên Nhật', 'Japanese Yen', 0, TRUE, FALSE),
  ('GBP', '£', 'Bảng Anh', 'British Pound', 2, TRUE, FALSE)
ON CONFLICT (code) DO NOTHING;

-- 2. Snapshot tỷ giá hối đoái
CREATE TABLE exchange_rate_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency VARCHAR(3) NOT NULL REFERENCES currency_configs(code),
    status VARCHAR(20) NOT NULL CHECK (status IN ('OK', 'STALE', 'UNAVAILABLE')),
    rate_date DATE NOT NULL,
    provider_source VARCHAR(100) NOT NULL,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exchange_rates_date ON exchange_rate_snapshots (rate_date DESC, status);

-- 3. Chi tiết tỷ giá từng đồng tiền
CREATE TABLE exchange_rate_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID NOT NULL REFERENCES exchange_rate_snapshots(id) ON DELETE CASCADE,
    target_currency VARCHAR(3) NOT NULL REFERENCES currency_configs(code),
    rate_to_base NUMERIC(18, 8) NOT NULL,
    rate_from_base NUMERIC(18, 8) NOT NULL,
    CONSTRAINT uq_snapshot_target UNIQUE (snapshot_id, target_currency)
);

-- 4. Sở thích tiền tệ người dùng
CREATE TABLE user_currency_preferences (
    user_id UUID PRIMARY KEY,
    display_currency VARCHAR(3) NOT NULL REFERENCES currency_configs(code),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 3. Business Invariants & Financial Rules (BR-PRC-08, BR-SRC-05)

1. **Settlement Invariant**: Mọi giao dịch đặt phòng và thanh toán thực tế bắt buộc hạch toán bằng đồng tiền yết giá gốc của chỗ nghỉ (`VND`). Tiền tệ khác hoàn toàn mang tính quy đổi tham khảo hiển thị.
2. **Rounding Invariant**: Làm tròn số tiền quy đổi theo `decimal_places` cấu hình:
   - `VND` và `JPY`: 0 chữ số thập phân (`ROUND(val)`).
   - `USD`, `EUR`, `GBP`: 2 chữ số thập phân (`ROUND(val, 2)`).
3. **Stale Fallback Invariant**: Khi snapshot tỷ giá vượt quá `expires_at` (24h) hoặc có cờ `UNAVAILABLE`, hệ thống tự động fallback về đồng tiền cơ sở (`VND`), đồng thời hiển thị cảnh báo minh bạch trên giao diện khách hàng.
