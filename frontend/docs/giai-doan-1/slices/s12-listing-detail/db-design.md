# Hợp Đồng Thiết Kế CSDL (FE-to-BE DB Handover Contract) · S12-LISTING-DETAIL

> **Mục tiêu**: Cung cấp kiến trúc CSDL PostgreSQL và mô hình thực thể quan hệ chuẩn xác cho Chi tiết Homestay (P03), Hồ sơ công khai Host (P04), Bảng chính sách hủy (P05) và Động cơ tính báo giá (Pricing Engine Quote).

---

## 1. Biểu Đồ Thực Thể - Quan Hệ (ER Diagram)

```mermaid
erDiagram
    USERS ||--o| HOST_PROFILES : "có hồ sơ Host"
    USERS ||--o{ LISTINGS : "sở hữu"
    CANCELLATION_POLICIES ||--o{ LISTINGS : "áp dụng"
    CANCELLATION_POLICIES ||--o{ POLICY_MILESTONES : "chứa mốc hoàn tiền"

    LISTINGS ||--o{ LISTING_PHOTOS : "chứa ảnh"
    LISTINGS ||--o| STAY_RULES : "quy định lưu trú"
    LISTINGS ||--o{ LISTING_AMENITIES : "có tiện nghi"
    LISTINGS ||--o{ BOOKING_QUOTES : "được tính báo giá"

    LISTINGS {
        varchar(64) id PK
        varchar(64) host_id FK
        varchar(32) cancellation_policy_id FK
        varchar(255) title
        varchar(32) property_type
        text description
        varchar(120) area_label "Ẩn địa chỉ chính xác BR-SRC-04"
        geography location "Toạ độ thật (chỉ cấp sau khi đặt cọc)"
        geography obfuscated_location "Toạ độ xấp xỉ công khai"
        int max_guests
        int standard_guests
        numeric extra_guest_fee
        int bedrooms
        int beds
        int bathrooms
        time check_in_time "14:00"
        time check_out_time "12:00"
        numeric base_nightly_price
        numeric weekend_nightly_price
        numeric cleaning_fee
        numeric weekly_discount_percent
        numeric monthly_discount_percent
        varchar(20) booking_mode "INSTANT | REQUEST"
        varchar(20) status "ACTIVE"
    }

    STAY_RULES {
        varchar(64) listing_id PK, FK
        int min_nights "mặc định 1 hoặc 2"
        int max_nights "tối đa 30-90"
        int min_notice_hours "báo trước tối thiểu (24h)"
        int max_advance_months "đặt trước tối đa (12 tháng)"
    }

    CANCELLATION_POLICIES {
        varchar(32) id PK "FLEXIBLE | MODERATE | STRICT"
        varchar(100) name
        text summary
        text host_cancel_compensation
        text force_majeure_terms
    }

    POLICY_MILESTONES {
        varchar(64) id PK
        varchar(32) policy_id FK
        int window_hours "Số giờ trước checkin (vd: 24, 120)"
        varchar(120) label
        numeric room_refund_percent
        numeric cleaning_refund_percent
        numeric service_fee_refund_percent
    }

    HOST_PROFILES {
        varchar(64) user_id PK, FK
        varchar(120) display_name
        varchar(500) avatar_url
        text bio
        boolean verified
        timestamptz joined_at
        numeric response_rate
        varchar(60) response_time
    }

    BOOKING_QUOTES {
        varchar(64) id PK
        varchar(64) listing_id FK
        date checkin
        date checkout
        int adults
        int children
        numeric room_subtotal
        numeric extra_guest_amount
        numeric cleaning_fee
        numeric discount_amount
        numeric service_fee
        numeric tax_amount
        numeric total_amount
        jsonb nightly_breakdown
        timestamptz expires_at
    }
```

---

## 2. Đặc Tả Bảng CSDL PostgreSQL

```sql
-- 1. Bảng Chính Sách Hủy & Các Mốc Hoàn Tiền
CREATE TABLE cancellation_policies (
    id VARCHAR(32) PRIMARY KEY, -- 'FLEXIBLE', 'MODERATE', 'STRICT'
    name VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    host_cancel_compensation TEXT NOT NULL,
    force_majeure_terms TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE policy_milestones (
    id VARCHAR(64) PRIMARY KEY,
    policy_id VARCHAR(32) NOT NULL REFERENCES cancellation_policies(id) ON DELETE CASCADE,
    window_hours INT NOT NULL, -- 24 (trước 24h), 0 (trong ngày checkin), -1 (sau checkin)
    label VARCHAR(120) NOT NULL,
    room_refund_percent NUMERIC(5, 2) NOT NULL,
    cleaning_refund_percent NUMERIC(5, 2) NOT NULL,
    service_fee_refund_percent NUMERIC(5, 2) NOT NULL
);

-- 2. Quy Định Lưu Trú (Stay Rules)
CREATE TABLE stay_rules (
    listing_id VARCHAR(64) PRIMARY KEY REFERENCES listings(id) ON DELETE CASCADE,
    min_nights INT NOT NULL DEFAULT 1,
    max_nights INT NOT NULL DEFAULT 30,
    min_notice_hours INT NOT NULL DEFAULT 24,
    max_advance_months INT NOT NULL DEFAULT 12
);

-- 3. Snapshots Báo Giá Tạm (Booking Quotes Cache)
CREATE TABLE booking_quotes (
    id VARCHAR(64) PRIMARY KEY,
    listing_id VARCHAR(64) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    checkin DATE NOT NULL,
    checkout DATE NOT NULL,
    adults INT NOT NULL DEFAULT 1,
    children INT NOT NULL DEFAULT 0,
    room_subtotal NUMERIC(15, 2) NOT NULL,
    extra_guest_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    cleaning_fee NUMERIC(15, 2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    service_fee NUMERIC(15, 2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(15, 2) NOT NULL,
    nightly_breakdown JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_booking_quotes_lookup ON booking_quotes(listing_id, checkin, checkout, adults, children);
```

---

## 3. Bất Biến Nghiệp Vụ & Quyền Riêng Tư (Security & Invariants)

1. **Bảo mật toạ độ (BR-SRC-04)**: API công khai chỉ trả về `publicArea.centerLat`, `publicArea.centerLng`, và bán kính `radiusMeters` (500m). Tuyệt đối không bao giờ trả toạ độ chính xác hay số nhà/ngõ trước khi thanh toán thành công.
2. **Bảo mật Host Profile**: API hồ sơ Host công khai không bao giờ để lộ email, số điện thoại, tài khoản ngân hàng hoặc số CCCD/Hộ chiếu.
3. **Tính giá bất biến (Pricing Invariant)**: Bảng giá tổng trên Sticky Booking Box chỉ được chấp nhận khi sinh ra từ `PricingEngine` của Backend (hoặc snapshot `booking_quotes`).
