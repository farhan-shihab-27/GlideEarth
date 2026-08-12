-- ============================================================================
-- GLIDEEARTH E-COMMERCE — PRODUCTION POSTGRESQL SCHEMA
-- ============================================================================
-- Version:   1.0.0
-- Engine:    PostgreSQL 15+
-- Standard:  3NF / BCNF Compliant
-- Generated: 2026-08-12
-- ============================================================================
-- DESIGN PHILOSOPHY:
--   • UUIDs for all primary keys (distributed-ready, no sequential leaking)
--   • Soft deletes via `deleted_at` (never lose data, audit-friendly)
--   • ENUM types for all finite-state columns (type-safe, self-documenting)
--   • Order-time snapshots for prices & addresses (BCNF: no transitive deps)
--   • Strategic B-Tree indexes on FKs, slugs, SKUs, and lookup columns
--   • Partial indexes on active records for hot-path query acceleration
--   • CHECK constraints as the last line of defense against bad data
-- ============================================================================


-- ============================================================================
-- 0. EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";        -- gen_random_uuid() fallback & crypto functions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- Trigram similarity for product search


-- ============================================================================
-- 1. ENUM TYPE DEFINITIONS
-- ============================================================================

CREATE TYPE admin_role AS ENUM (
    'super_admin',
    'admin',
    'editor',
    'viewer'
);

CREATE TYPE payment_method AS ENUM (
    'cod',
    'online'
);

CREATE TYPE payment_status AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded',
    'partially_refunded'
);

CREATE TYPE order_status AS ENUM (
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'returned'
);

CREATE TYPE address_type AS ENUM (
    'shipping',
    'billing'
);


-- ============================================================================
-- 2. ADMIN_USERS — Dashboard & CMS Access Control
-- ============================================================================

CREATE TABLE admin_users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(50) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            admin_role  NOT NULL DEFAULT 'editor',
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,

    CONSTRAINT uq_admin_users_username  UNIQUE (username),
    CONSTRAINT uq_admin_users_email     UNIQUE (email)
);

CREATE INDEX idx_admin_users_email    ON admin_users (email) WHERE deleted_at IS NULL;
CREATE INDEX idx_admin_users_role     ON admin_users (role)  WHERE deleted_at IS NULL;


-- ============================================================================
-- 3. CATEGORIES — Product Taxonomy (Self-Referencing for Sub-Categories)
-- ============================================================================

CREATE TABLE categories (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id       UUID,
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(120) NOT NULL,
    description     TEXT,
    image_url       VARCHAR(512),
    sort_order      INTEGER     NOT NULL DEFAULT 0,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,

    CONSTRAINT uq_categories_slug       UNIQUE (slug),
    CONSTRAINT fk_categories_parent     FOREIGN KEY (parent_id)
                                        REFERENCES categories (id)
                                        ON DELETE SET NULL
);

CREATE INDEX idx_categories_parent_id   ON categories (parent_id);
CREATE INDEX idx_categories_slug        ON categories (slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_categories_active      ON categories (is_active, sort_order) WHERE deleted_at IS NULL;


-- ============================================================================
-- 4. PRODUCTS — Core Product Catalog
-- ============================================================================

CREATE TABLE products (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id     UUID            NOT NULL,
    name            VARCHAR(255)    NOT NULL,
    slug            VARCHAR(280)    NOT NULL,
    sku             VARCHAR(100)    NOT NULL,
    short_description VARCHAR(500),
    description     TEXT,
    regular_price   NUMERIC(12, 2)  NOT NULL,
    discount_price  NUMERIC(12, 2),
    stock_quantity  INTEGER         NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER     NOT NULL DEFAULT 5,
    weight_grams    INTEGER,
    is_featured     BOOLEAN         NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    meta_title      VARCHAR(255),
    meta_description VARCHAR(500),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,

    CONSTRAINT uq_products_slug         UNIQUE (slug),
    CONSTRAINT uq_products_sku          UNIQUE (sku),
    CONSTRAINT fk_products_category     FOREIGN KEY (category_id)
                                        REFERENCES categories (id)
                                        ON DELETE RESTRICT,
    CONSTRAINT chk_products_regular_price   CHECK (regular_price >= 0),
    CONSTRAINT chk_products_discount_price  CHECK (discount_price IS NULL OR discount_price >= 0),
    CONSTRAINT chk_products_discount_lt_regular CHECK (
        discount_price IS NULL OR discount_price < regular_price
    ),
    CONSTRAINT chk_products_stock_quantity  CHECK (stock_quantity >= 0)
);

-- Hot-path: storefront product listing by category
CREATE INDEX idx_products_category_id       ON products (category_id);
CREATE INDEX idx_products_slug              ON products (slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_sku               ON products (sku) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_active_featured   ON products (is_active, is_featured, sort_order)
                                            WHERE deleted_at IS NULL;
-- Low stock alert query
CREATE INDEX idx_products_low_stock         ON products (stock_quantity)
                                            WHERE stock_quantity <= 5 AND deleted_at IS NULL AND is_active = TRUE;
-- Trigram index for product search autocomplete
CREATE INDEX idx_products_name_trgm         ON products USING GIN (name gin_trgm_ops);


-- ============================================================================
-- 5. PRODUCT_IMAGES — Multi-Angle Visual Gallery
-- ============================================================================

CREATE TABLE product_images (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID        NOT NULL,
    image_url       VARCHAR(512) NOT NULL,
    alt_text        VARCHAR(255),
    is_primary      BOOLEAN     NOT NULL DEFAULT FALSE,
    sort_order      INTEGER     NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_product_images_product    FOREIGN KEY (product_id)
                                            REFERENCES products (id)
                                            ON DELETE CASCADE
);

CREATE INDEX idx_product_images_product_id  ON product_images (product_id, sort_order);
-- Enforce at most one primary image per product at the application layer;
-- a partial unique index guarantees it at the DB level.
CREATE UNIQUE INDEX uq_product_images_primary
    ON product_images (product_id) WHERE is_primary = TRUE;


-- ============================================================================
-- 6. CUSTOMERS — Storefront User Accounts
-- ============================================================================

CREATE TABLE customers (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR(150) NOT NULL,
    phone_number    VARCHAR(20) NOT NULL,
    email           VARCHAR(255),
    is_verified     BOOLEAN     NOT NULL DEFAULT FALSE,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,

    CONSTRAINT uq_customers_phone_number    UNIQUE (phone_number),
    CONSTRAINT uq_customers_email           UNIQUE (email)
);

CREATE INDEX idx_customers_phone_number ON customers (phone_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_customers_email        ON customers (email) WHERE deleted_at IS NULL AND email IS NOT NULL;


-- ============================================================================
-- 7. CUSTOMER_ADDRESSES — Normalized Address Book (3NF Compliant)
-- ============================================================================
-- Separating addresses from customers avoids repeating groups and satisfies
-- 3NF. Customers can store multiple shipping/billing addresses.

CREATE TABLE customer_addresses (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID            NOT NULL,
    label           VARCHAR(50),
    address_type    address_type    NOT NULL DEFAULT 'shipping',
    recipient_name  VARCHAR(150)    NOT NULL,
    phone_number    VARCHAR(20)     NOT NULL,
    address_line_1  VARCHAR(255)    NOT NULL,
    address_line_2  VARCHAR(255),
    city            VARCHAR(100)    NOT NULL,
    state_province  VARCHAR(100),
    postal_code     VARCHAR(20),
    country         VARCHAR(100)    NOT NULL DEFAULT 'Bangladesh',
    is_default      BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_customer_addresses_customer   FOREIGN KEY (customer_id)
                                                REFERENCES customers (id)
                                                ON DELETE CASCADE
);

CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses (customer_id);
-- One default address per type per customer
CREATE UNIQUE INDEX uq_customer_addresses_default
    ON customer_addresses (customer_id, address_type) WHERE is_default = TRUE;


-- ============================================================================
-- 8. ORDERS — Transaction Ledger
-- ============================================================================
-- The shipping address is SNAPSHOTTED into the order row at placement time.
-- This is a deliberate BCNF decision: the order's address must never change
-- if the customer later edits or deletes their address book entry.

CREATE TABLE orders (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number            VARCHAR(30)     NOT NULL,
    customer_id             UUID            NOT NULL,
    subtotal                NUMERIC(12, 2)  NOT NULL,
    discount_amount         NUMERIC(12, 2)  NOT NULL DEFAULT 0.00,
    shipping_charge         NUMERIC(12, 2)  NOT NULL DEFAULT 0.00,
    total_amount            NUMERIC(12, 2)  NOT NULL,
    payment_method          payment_method  NOT NULL,
    payment_status          payment_status  NOT NULL DEFAULT 'pending',
    order_status            order_status    NOT NULL DEFAULT 'pending',
    -- Snapshotted shipping address (BCNF: no dependency on mutable address rows)
    shipping_name           VARCHAR(150)    NOT NULL,
    shipping_phone          VARCHAR(20)     NOT NULL,
    shipping_address_line_1 VARCHAR(255)    NOT NULL,
    shipping_address_line_2 VARCHAR(255),
    shipping_city           VARCHAR(100)    NOT NULL,
    shipping_state_province VARCHAR(100),
    shipping_postal_code    VARCHAR(20),
    shipping_country        VARCHAR(100)    NOT NULL DEFAULT 'Bangladesh',
    -- Tracking & fulfillment
    tracking_number         VARCHAR(100),
    admin_notes             TEXT,
    customer_notes          TEXT,
    placed_at               TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    confirmed_at            TIMESTAMPTZ,
    shipped_at              TIMESTAMPTZ,
    delivered_at            TIMESTAMPTZ,
    cancelled_at            TIMESTAMPTZ,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_orders_order_number       UNIQUE (order_number),
    CONSTRAINT fk_orders_customer           FOREIGN KEY (customer_id)
                                            REFERENCES customers (id)
                                            ON DELETE RESTRICT,
    CONSTRAINT chk_orders_subtotal          CHECK (subtotal >= 0),
    CONSTRAINT chk_orders_discount_amount   CHECK (discount_amount >= 0),
    CONSTRAINT chk_orders_shipping_charge   CHECK (shipping_charge >= 0),
    CONSTRAINT chk_orders_total_amount      CHECK (total_amount >= 0)
);

CREATE INDEX idx_orders_customer_id     ON orders (customer_id);
CREATE INDEX idx_orders_order_number    ON orders (order_number);
CREATE INDEX idx_orders_order_status    ON orders (order_status);
CREATE INDEX idx_orders_payment_status  ON orders (payment_status);
CREATE INDEX idx_orders_placed_at       ON orders (placed_at DESC);
-- Composite for admin dashboard: "show me all pending COD orders"
CREATE INDEX idx_orders_status_payment  ON orders (order_status, payment_method, placed_at DESC);


-- ============================================================================
-- 9. ORDER_ITEMS — Line Items with Price Snapshots (BCNF)
-- ============================================================================
-- `unit_price_at_purchase` freezes the price at the moment of sale.
-- Even if the product price changes tomorrow, invoices remain accurate.

CREATE TABLE order_items (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id                UUID            NOT NULL,
    product_id              UUID            NOT NULL,
    product_name_snapshot   VARCHAR(255)    NOT NULL,
    product_sku_snapshot    VARCHAR(100)    NOT NULL,
    quantity                INTEGER         NOT NULL,
    unit_price_at_purchase  NUMERIC(12, 2)  NOT NULL,
    subtotal                NUMERIC(12, 2)  NOT NULL,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_order_items_order     FOREIGN KEY (order_id)
                                        REFERENCES orders (id)
                                        ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product   FOREIGN KEY (product_id)
                                        REFERENCES products (id)
                                        ON DELETE RESTRICT,
    CONSTRAINT chk_order_items_quantity              CHECK (quantity > 0),
    CONSTRAINT chk_order_items_unit_price_at_purchase CHECK (unit_price_at_purchase >= 0),
    CONSTRAINT chk_order_items_subtotal              CHECK (subtotal >= 0)
);

CREATE INDEX idx_order_items_order_id   ON order_items (order_id);
CREATE INDEX idx_order_items_product_id ON order_items (product_id);


-- ============================================================================
-- 10. COUPONS — Promotional Discount Engine
-- ============================================================================

CREATE TYPE coupon_type AS ENUM (
    'percentage',
    'fixed_amount'
);

CREATE TABLE coupons (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    code                VARCHAR(50)     NOT NULL,
    coupon_type         coupon_type     NOT NULL,
    value               NUMERIC(12, 2)  NOT NULL,
    min_order_amount    NUMERIC(12, 2),
    max_discount_amount NUMERIC(12, 2),
    usage_limit         INTEGER,
    times_used          INTEGER         NOT NULL DEFAULT 0,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    valid_from          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    valid_until         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,

    CONSTRAINT uq_coupons_code              UNIQUE (code),
    CONSTRAINT chk_coupons_value            CHECK (value > 0),
    CONSTRAINT chk_coupons_min_order_amount CHECK (min_order_amount IS NULL OR min_order_amount >= 0),
    CONSTRAINT chk_coupons_usage            CHECK (usage_limit IS NULL OR times_used <= usage_limit)
);

CREATE INDEX idx_coupons_code       ON coupons (code) WHERE deleted_at IS NULL AND is_active = TRUE;
CREATE INDEX idx_coupons_validity   ON coupons (valid_from, valid_until) WHERE deleted_at IS NULL AND is_active = TRUE;


-- ============================================================================
-- 11. ORDER_COUPONS — Junction Table (Which coupon was applied to which order)
-- ============================================================================

CREATE TABLE order_coupons (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID            NOT NULL,
    coupon_id           UUID            NOT NULL,
    code_snapshot       VARCHAR(50)     NOT NULL,
    discount_applied    NUMERIC(12, 2)  NOT NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_order_coupons_order   FOREIGN KEY (order_id)
                                        REFERENCES orders (id)
                                        ON DELETE CASCADE,
    CONSTRAINT fk_order_coupons_coupon  FOREIGN KEY (coupon_id)
                                        REFERENCES coupons (id)
                                        ON DELETE RESTRICT,
    CONSTRAINT uq_order_coupons_order   UNIQUE (order_id),
    CONSTRAINT chk_order_coupons_discount CHECK (discount_applied >= 0)
);

CREATE INDEX idx_order_coupons_order_id  ON order_coupons (order_id);
CREATE INDEX idx_order_coupons_coupon_id ON order_coupons (coupon_id);


-- ============================================================================
-- 12. AUTO-UPDATE TRIGGER — `updated_at` Timestamp Management
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to every table with an `updated_at` column
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT table_name
        FROM information_schema.columns
        WHERE column_name = 'updated_at'
          AND table_schema = 'public'
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%s_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW
             EXECUTE FUNCTION fn_set_updated_at();',
            tbl, tbl
        );
    END LOOP;
END;
$$;


-- ============================================================================
-- 13. ORDER NUMBER GENERATOR — Sequential, Human-Readable Order IDs
-- ============================================================================
-- Format: GE-20260812-00001 (prefix-date-sequence)
-- Uses a dedicated sequence to avoid gaps under high concurrency.

CREATE SEQUENCE order_number_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION fn_generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'GE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                       LPAD(NEXTVAL('order_number_seq')::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_generate_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
    EXECUTE FUNCTION fn_generate_order_number();


-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
