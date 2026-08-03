-- ============================================================
-- DATABASE LATIHAN SQL: STUDI KASUS WEBSITE E-COMMERCE
-- DBMS: MySQL 8.0+
--
-- Tabel inti:
--   1. customers
--   2. products
--   3. orders
--
-- Tabel penghubung:
--   4. order_items
--
-- order_items diperlukan karena:
--   - satu order dapat memiliki banyak produk
--   - satu produk dapat muncul pada banyak order
-- ============================================================

DROP DATABASE IF EXISTS latihan_sql_ecommerce;
CREATE DATABASE latihan_sql_ecommerce
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE latihan_sql_ecommerce;

-- ============================================================
-- 1. TABEL CUSTOMERS
-- ============================================================
CREATE TABLE customers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20),
    city VARCHAR(50) NOT NULL,
    customer_status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. TABEL PRODUCTS
-- ============================================================
CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    stock INT UNSIGNED NOT NULL DEFAULT 0,
    product_status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_product_price CHECK (price >= 0)
);

-- ============================================================
-- 3. TABEL ORDERS
-- Gunakan nama "orders", bukan "order", karena ORDER adalah
-- bagian dari kata kunci SQL: ORDER BY.
-- ============================================================
CREATE TABLE orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(30) NOT NULL UNIQUE,
    customer_id BIGINT UNSIGNED NOT NULL,
    order_date DATETIME NOT NULL,
    order_status ENUM(
        'pending',
        'paid',
        'processed',
        'shipped',
        'completed',
        'cancelled'
    ) NOT NULL DEFAULT 'pending',
    shipping_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
    discount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    shipping_city VARCHAR(50) NOT NULL,
    notes VARCHAR(255),
    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT chk_shipping_cost CHECK (shipping_cost >= 0),
    CONSTRAINT chk_discount CHECK (discount >= 0)
);

-- ============================================================
-- 4. TABEL ORDER_ITEMS
-- Menyimpan produk-produk yang dibeli dalam setiap order.
-- Harga disimpan kembali sebagai unit_price agar histori harga
-- order tidak berubah ketika harga pada tabel products berubah.
-- ============================================================
CREATE TABLE order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    CONSTRAINT uq_order_product UNIQUE (order_id, product_id),
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT chk_quantity CHECK (quantity > 0),
    CONSTRAINT chk_unit_price CHECK (unit_price >= 0)
);

-- Index tambahan untuk mempercepat JOIN dan pencarian.
CREATE INDEX idx_customers_city
    ON customers(city);

CREATE INDEX idx_products_category
    ON products(category);

CREATE INDEX idx_orders_customer_id
    ON orders(customer_id);

CREATE INDEX idx_orders_order_date
    ON orders(order_date);

CREATE INDEX idx_orders_status
    ON orders(order_status);

CREATE INDEX idx_order_items_product_id
    ON order_items(product_id);

-- ============================================================
-- DATA DUMMY CUSTOMERS
-- Customer 11 dan 12 sengaja belum memiliki order agar dapat
-- dipakai untuk latihan LEFT JOIN dan NOT EXISTS.
-- ============================================================
INSERT INTO customers
    (id, full_name, email, phone, city, customer_status, registered_at)
VALUES
    (1,  'Andi Pratama',   'andi@example.com',   '081234000001', 'Surabaya',  'active',   '2026-01-05 09:10:00'),
    (2,  'Budi Santoso',   'budi@example.com',   '081234000002', 'Sidoarjo',  'active',   '2026-01-08 10:20:00'),
    (3,  'Citra Lestari',  'citra@example.com',  '081234000003', 'Malang',    'active',   '2026-01-12 13:30:00'),
    (4,  'Dewi Anggraini', 'dewi@example.com',   '081234000004', 'Surabaya',  'active',   '2026-01-15 08:45:00'),
    (5,  'Eko Saputra',    'eko@example.com',    '081234000005', 'Gresik',    'active',   '2026-01-20 15:00:00'),
    (6,  'Fajar Hidayat',  'fajar@example.com',  '081234000006', 'Surabaya',  'inactive', '2026-02-01 11:15:00'),
    (7,  'Gita Permata',   'gita@example.com',   '081234000007', 'Mojokerto', 'active',   '2026-02-06 12:40:00'),
    (8,  'Hendra Wijaya',  'hendra@example.com', '081234000008', 'Malang',    'active',   '2026-02-10 16:10:00'),
    (9,  'Intan Maharani', 'intan@example.com',  '081234000009', 'Sidoarjo',  'active',   '2026-02-14 09:00:00'),
    (10, 'Joko Susilo',    'joko@example.com',   '081234000010', 'Surabaya',  'active',   '2026-02-20 14:25:00'),
    (11, 'Karin Amelia',   'karin@example.com',  '081234000011', 'Gresik',    'active',   '2026-03-01 10:00:00'),
    (12, 'Lukman Hakim',   'lukman@example.com', '081234000012', 'Surabaya',  'active',   '2026-03-03 11:30:00');

-- ============================================================
-- DATA DUMMY PRODUCTS
-- Produk 14 dan 15 sengaja belum pernah dibeli agar dapat
-- dipakai untuk latihan RIGHT JOIN, LEFT JOIN, dan NOT EXISTS.
-- ============================================================
INSERT INTO products
    (id, product_name, category, price, stock, product_status, created_at)
VALUES
    (1,  'Laptop Pro 14',          'Laptop',     12500000.00, 10,  'active',   '2026-01-01 08:00:00'),
    (2,  'Laptop Student 13',      'Laptop',      7500000.00, 15,  'active',   '2026-01-01 08:05:00'),
    (3,  'Mechanical Keyboard K1', 'Aksesoris',    850000.00, 30,  'active',   '2026-01-01 08:10:00'),
    (4,  'Wireless Mouse M2',      'Aksesoris',    350000.00, 50,  'active',   '2026-01-01 08:15:00'),
    (5,  'Monitor 24 Inch',        'Monitor',      2100000.00, 20,  'active',   '2026-01-02 09:00:00'),
    (6,  'Monitor 27 Inch',        'Monitor',      3400000.00, 12,  'active',   '2026-01-02 09:05:00'),
    (7,  'USB-C Hub 8 Port',       'Aksesoris',    625000.00, 40,  'active',   '2026-01-02 09:10:00'),
    (8,  'Webcam Full HD',         'Aksesoris',    475000.00, 25,  'active',   '2026-01-02 09:15:00'),
    (9,  'Office Chair Basic',     'Furniture',   1350000.00, 18,  'active',   '2026-01-03 10:00:00'),
    (10, 'Office Chair Ergonomic', 'Furniture',   2850000.00, 9,   'active',   '2026-01-03 10:05:00'),
    (11, 'Standing Desk',          'Furniture',   4200000.00, 7,   'active',   '2026-01-03 10:10:00'),
    (12, 'External SSD 1TB',       'Storage',     1650000.00, 22,  'active',   '2026-01-04 11:00:00'),
    (13, 'Flashdisk 128GB',        'Storage',      225000.00, 60,  'active',   '2026-01-04 11:05:00'),
    (14, 'Laptop Sleeve 14 Inch',  'Aksesoris',    275000.00, 35,  'active',   '2026-01-04 11:10:00'),
    (15, 'Printer Inkjet',         'Printer',     1950000.00, 5,   'inactive', '2026-01-04 11:15:00');

-- ============================================================
-- DATA DUMMY ORDERS
-- Order 25 sengaja tidak mempunyai order_items karena dibatalkan
-- sebelum customer menyelesaikan pemilihan produk.
-- ============================================================
INSERT INTO orders
    (id, invoice_number, customer_id, order_date, order_status,
     shipping_cost, discount, shipping_city, notes)
VALUES
    (1,  'INV-2026-001', 1,  '2026-01-10 09:15:00', 'completed', 25000, 100000, 'Surabaya',  'Pengiriman reguler'),
    (2,  'INV-2026-002', 2,  '2026-01-14 10:30:00', 'completed', 30000,      0, 'Sidoarjo',  NULL),
    (3,  'INV-2026-003', 3,  '2026-01-18 13:00:00', 'cancelled', 35000,      0, 'Malang',    'Dibatalkan customer'),
    (4,  'INV-2026-004', 1,  '2026-01-25 15:45:00', 'completed', 25000,  50000, 'Surabaya',  NULL),
    (5,  'INV-2026-005', 4,  '2026-02-02 08:30:00', 'completed', 25000,      0, 'Surabaya',  NULL),
    (6,  'INV-2026-006', 5,  '2026-02-06 11:20:00', 'shipped',   30000,  75000, 'Gresik',    'Hubungi sebelum kirim'),
    (7,  'INV-2026-007', 6,  '2026-02-11 14:10:00', 'completed', 25000,      0, 'Surabaya',  NULL),
    (8,  'INV-2026-008', 7,  '2026-02-15 16:00:00', 'processed', 35000,      0, 'Mojokerto', NULL),
    (9,  'INV-2026-009', 8,  '2026-02-20 09:40:00', 'completed', 35000, 125000, 'Malang',    NULL),
    (10, 'INV-2026-010', 9,  '2026-02-25 12:15:00', 'completed', 30000,      0, 'Sidoarjo',  NULL),
    (11, 'INV-2026-011', 10, '2026-03-01 10:05:00', 'paid',      25000,      0, 'Surabaya',  NULL),
    (12, 'INV-2026-012', 2,  '2026-03-04 13:35:00', 'completed', 30000,  50000, 'Sidoarjo',  NULL),
    (13, 'INV-2026-013', 3,  '2026-03-08 15:20:00', 'completed', 35000,      0, 'Malang',    NULL),
    (14, 'INV-2026-014', 4,  '2026-03-12 08:50:00', 'completed', 25000, 100000, 'Surabaya',  NULL),
    (15, 'INV-2026-015', 5,  '2026-03-18 11:45:00', 'cancelled', 30000,      0, 'Gresik',    'Stok tidak tersedia'),
    (16, 'INV-2026-016', 7,  '2026-04-02 09:30:00', 'completed', 35000,      0, 'Mojokerto', NULL),
    (17, 'INV-2026-017', 8,  '2026-04-07 14:25:00', 'completed', 35000,  75000, 'Malang',    NULL),
    (18, 'INV-2026-018', 9,  '2026-04-13 16:10:00', 'shipped',   30000,      0, 'Sidoarjo',  NULL),
    (19, 'INV-2026-019', 10, '2026-04-20 10:45:00', 'completed', 25000,  50000, 'Surabaya',  NULL),
    (20, 'INV-2026-020', 1,  '2026-05-03 13:15:00', 'completed', 25000,      0, 'Surabaya',  NULL),
    (21, 'INV-2026-021', 2,  '2026-05-09 15:40:00', 'pending',   30000,      0, 'Sidoarjo',  NULL),
    (22, 'INV-2026-022', 4,  '2026-05-16 09:10:00', 'completed', 25000, 125000, 'Surabaya',  NULL),
    (23, 'INV-2026-023', 8,  '2026-06-01 11:25:00', 'paid',      35000,      0, 'Malang',    NULL),
    (24, 'INV-2026-024', 10, '2026-06-08 14:55:00', 'completed', 25000,      0, 'Surabaya',  NULL),
    (25, 'INV-2026-025', 3,  '2026-06-12 17:00:00', 'cancelled', 35000,      0, 'Malang',    'Checkout tidak diselesaikan');

-- ============================================================
-- DATA DUMMY ORDER_ITEMS
-- ============================================================
INSERT INTO order_items
    (order_id, product_id, quantity, unit_price)
VALUES
    (1,  2, 1, 7500000.00),
    (1,  3, 1,  850000.00),
    (1,  4, 2,  350000.00),

    (2,  5, 1, 2100000.00),
    (2,  8, 1,  475000.00),

    (3,  1, 1, 12500000.00),

    (4,  7, 1,  625000.00),
    (4, 12, 1, 1650000.00),
    (4, 13, 2,  225000.00),

    (5,  6, 1, 3400000.00),
    (5,  3, 1,  850000.00),

    (6, 10, 1, 2850000.00),
    (6,  4, 1,  350000.00),

    (7,  9, 1, 1350000.00),
    (7,  8, 2,  475000.00),

    (8, 11, 1, 4200000.00),
    (8,  7, 1,  625000.00),

    (9,  1, 1, 12500000.00),
    (9, 12, 1, 1650000.00),

    (10, 3, 1,  850000.00),
    (10, 4, 1,  350000.00),
    (10, 7, 1,  625000.00),

    (11, 2, 1, 7500000.00),
    (11, 8, 1,  475000.00),

    (12, 5, 2, 2100000.00),
    (12, 13, 3, 225000.00),

    (13, 10, 1, 2850000.00),
    (13, 12, 1, 1650000.00),

    (14, 1, 1, 12500000.00),
    (14, 6, 1, 3400000.00),

    (15, 9, 1, 1350000.00),

    (16, 4, 2, 350000.00),
    (16, 8, 1, 475000.00),
    (16, 13, 2, 225000.00),

    (17, 2, 1, 7500000.00),
    (17, 3, 1,  850000.00),

    (18, 11, 1, 4200000.00),
    (18, 12, 2, 1650000.00),

    (19, 5, 1, 2100000.00),
    (19, 7, 2,  625000.00),

    (20, 1, 1, 12500000.00),
    (20, 4, 1,  350000.00),
    (20, 8, 1,  475000.00),

    (21, 6, 1, 3400000.00),

    (22, 10, 1, 2850000.00),
    (22, 11, 1, 4200000.00),

    (23, 2, 1, 7500000.00),
    (23, 12, 1, 1650000.00),
    (23, 13, 2,  225000.00),

    (24, 3, 2,  850000.00),
    (24, 4, 2,  350000.00),
    (24, 7, 1,  625000.00);

-- ============================================================
-- VIEW: RINGKASAN TOTAL ORDER
-- Subtotal = jumlah quantity * unit_price
-- Grand total = subtotal + ongkir - diskon
-- ============================================================
CREATE VIEW order_summaries AS
SELECT
    o.id AS order_id,
    o.invoice_number,
    o.customer_id,
    o.order_date,
    o.order_status,
    COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS subtotal,
    o.shipping_cost,
    o.discount,
    COALESCE(SUM(oi.quantity * oi.unit_price), 0)
        + o.shipping_cost
        - o.discount AS grand_total
FROM orders AS o
LEFT JOIN order_items AS oi
    ON oi.order_id = o.id
GROUP BY
    o.id,
    o.invoice_number,
    o.customer_id,
    o.order_date,
    o.order_status,
    o.shipping_cost,
    o.discount;

-- ============================================================
-- CONTOH QUERY LATIHAN
-- Jalankan satu per satu setelah database berhasil dibuat.
-- ============================================================

-- ------------------------------------------------------------
-- A. SELECT DASAR, WHERE, ORDER BY, LIMIT
-- ------------------------------------------------------------

-- 1. Menampilkan semua customer.
SELECT * FROM customers;

-- 2. Menampilkan produk aktif dengan harga di atas Rp1.000.000.
SELECT
    id,
    product_name,
    category,
    price,
    stock
FROM products
WHERE product_status = 'active'
  AND price > 1000000
ORDER BY price DESC;

-- 3. Lima produk dengan harga tertinggi.
SELECT
    product_name,
    category,
    price
FROM products
ORDER BY price DESC
LIMIT 5;

-- 4. Customer dari Surabaya atau Sidoarjo.
SELECT
    full_name,
    email,
    city
FROM customers
WHERE city IN ('Surabaya', 'Sidoarjo')
ORDER BY city, full_name;

-- 5. Pencarian produk yang namanya mengandung kata "Laptop".
SELECT *
FROM products
WHERE product_name LIKE '%Laptop%';

-- ------------------------------------------------------------
-- B. INNER JOIN / JOIN
-- ------------------------------------------------------------

-- 6. Daftar order beserta nama customer.
SELECT
    o.invoice_number,
    o.order_date,
    c.full_name,
    c.city,
    o.order_status
FROM orders AS o
INNER JOIN customers AS c
    ON c.id = o.customer_id
ORDER BY o.order_date;

-- 7. Detail produk pada setiap order.
SELECT
    o.invoice_number,
    c.full_name,
    p.product_name,
    oi.quantity,
    oi.unit_price,
    oi.quantity * oi.unit_price AS line_total
FROM orders AS o
INNER JOIN customers AS c
    ON c.id = o.customer_id
INNER JOIN order_items AS oi
    ON oi.order_id = o.id
INNER JOIN products AS p
    ON p.id = oi.product_id
ORDER BY o.invoice_number, p.product_name;

-- 8. Order yang statusnya completed beserta grand total.
SELECT
    os.invoice_number,
    c.full_name,
    os.order_date,
    os.grand_total
FROM order_summaries AS os
INNER JOIN customers AS c
    ON c.id = os.customer_id
WHERE os.order_status = 'completed'
ORDER BY os.grand_total DESC;

-- ------------------------------------------------------------
-- C. LEFT JOIN
-- ------------------------------------------------------------

-- 9. Semua customer beserta jumlah ordernya.
-- Customer yang belum pernah order tetap muncul.
SELECT
    c.id,
    c.full_name,
    c.city,
    COUNT(o.id) AS total_orders
FROM customers AS c
LEFT JOIN orders AS o
    ON o.customer_id = c.id
GROUP BY c.id, c.full_name, c.city
ORDER BY total_orders DESC, c.full_name;

-- 10. Customer yang belum pernah melakukan order.
SELECT
    c.id,
    c.full_name,
    c.email
FROM customers AS c
LEFT JOIN orders AS o
    ON o.customer_id = c.id
WHERE o.id IS NULL;

-- 11. Semua order beserta jumlah jenis produk.
-- Order tanpa item tetap muncul.
SELECT
    o.invoice_number,
    o.order_status,
    COUNT(oi.id) AS total_product_types
FROM orders AS o
LEFT JOIN order_items AS oi
    ON oi.order_id = o.id
GROUP BY o.id, o.invoice_number, o.order_status
ORDER BY o.id;

-- ------------------------------------------------------------
-- D. RIGHT JOIN
-- ------------------------------------------------------------

-- 12. Semua produk beserta total unit yang pernah terjual.
-- Produk yang belum pernah dipesan tetap muncul.
SELECT
    p.id,
    p.product_name,
    COALESCE(SUM(oi.quantity), 0) AS total_units_ordered
FROM order_items AS oi
RIGHT JOIN products AS p
    ON p.id = oi.product_id
GROUP BY p.id, p.product_name
ORDER BY total_units_ordered DESC, p.product_name;

-- Catatan:
-- Query RIGHT JOIN di atas dapat ditulis ulang sebagai LEFT JOIN:
SELECT
    p.id,
    p.product_name,
    COALESCE(SUM(oi.quantity), 0) AS total_units_ordered
FROM products AS p
LEFT JOIN order_items AS oi
    ON oi.product_id = p.id
GROUP BY p.id, p.product_name
ORDER BY total_units_ordered DESC, p.product_name;

-- ------------------------------------------------------------
-- E. AGGREGATE, GROUP BY, HAVING
-- ------------------------------------------------------------

-- 13. Jumlah customer per kota.
SELECT
    city,
    COUNT(*) AS total_customers
FROM customers
GROUP BY city
ORDER BY total_customers DESC, city;

-- 14. Rata-rata harga produk per kategori.
SELECT
    category,
    COUNT(*) AS total_products,
    AVG(price) AS average_price,
    MIN(price) AS cheapest_price,
    MAX(price) AS most_expensive_price
FROM products
GROUP BY category
ORDER BY average_price DESC;

-- 15. Customer yang memiliki lebih dari dua order.
SELECT
    c.id,
    c.full_name,
    COUNT(o.id) AS total_orders
FROM customers AS c
INNER JOIN orders AS o
    ON o.customer_id = c.id
GROUP BY c.id, c.full_name
HAVING COUNT(o.id) > 2
ORDER BY total_orders DESC;

-- 16. Kategori dengan rata-rata harga di atas Rp2.000.000.
SELECT
    category,
    AVG(price) AS average_price
FROM products
GROUP BY category
HAVING AVG(price) > 2000000
ORDER BY average_price DESC;

-- ------------------------------------------------------------
-- F. SUBQUERY
-- ------------------------------------------------------------

-- 17. Produk dengan harga di atas rata-rata seluruh produk.
SELECT
    product_name,
    category,
    price
FROM products
WHERE price > (
    SELECT AVG(price)
    FROM products
)
ORDER BY price DESC;

-- 18. Customer yang pernah melakukan order.
SELECT
    id,
    full_name,
    email
FROM customers
WHERE id IN (
    SELECT DISTINCT customer_id
    FROM orders
)
ORDER BY full_name;

-- 19. Produk yang belum pernah dipesan menggunakan NOT IN.
SELECT
    id,
    product_name
FROM products
WHERE id NOT IN (
    SELECT product_id
    FROM order_items
)
ORDER BY product_name;

-- 20. Produk yang belum pernah dipesan menggunakan NOT EXISTS.
-- Biasanya lebih aman daripada NOT IN jika subquery mungkin berisi NULL.
SELECT
    p.id,
    p.product_name
FROM products AS p
WHERE NOT EXISTS (
    SELECT 1
    FROM order_items AS oi
    WHERE oi.product_id = p.id
)
ORDER BY p.product_name;

-- 21. Order dengan grand total di atas rata-rata grand total order.
SELECT
    invoice_number,
    order_status,
    grand_total
FROM order_summaries
WHERE grand_total > (
    SELECT AVG(grand_total)
    FROM order_summaries
)
ORDER BY grand_total DESC;

-- 22. Correlated subquery:
-- Menampilkan setiap customer dan tanggal order terakhirnya.
SELECT
    c.id,
    c.full_name,
    (
        SELECT MAX(o.order_date)
        FROM orders AS o
        WHERE o.customer_id = c.id
    ) AS latest_order_date
FROM customers AS c
ORDER BY latest_order_date DESC;

-- ------------------------------------------------------------
-- G. EXISTS
-- ------------------------------------------------------------

-- 23. Customer yang mempunyai minimal satu order completed.
SELECT
    c.id,
    c.full_name
FROM customers AS c
WHERE EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.id
      AND o.order_status = 'completed'
)
ORDER BY c.full_name;

-- 24. Customer yang tidak mempunyai order completed.
SELECT
    c.id,
    c.full_name
FROM customers AS c
WHERE NOT EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.id
      AND o.order_status = 'completed'
)
ORDER BY c.full_name;

-- ------------------------------------------------------------
-- H. CASE WHEN
-- ------------------------------------------------------------

-- 25. Memberi label rentang harga produk.
SELECT
    product_name,
    price,
    CASE
        WHEN price < 500000 THEN 'Murah'
        WHEN price < 2000000 THEN 'Menengah'
        ELSE 'Mahal'
    END AS price_level
FROM products
ORDER BY price DESC;

-- 26. Memberi label nilai transaksi.
SELECT
    invoice_number,
    grand_total,
    CASE
        WHEN grand_total >= 10000000 THEN 'Transaksi Besar'
        WHEN grand_total >= 3000000 THEN 'Transaksi Menengah'
        ELSE 'Transaksi Kecil'
    END AS transaction_level
FROM order_summaries
ORDER BY grand_total DESC;

-- ------------------------------------------------------------
-- I. FUNGSI TANGGAL
-- ------------------------------------------------------------

-- 27. Jumlah order per bulan.
SELECT
    DATE_FORMAT(order_date, '%Y-%m') AS order_month,
    COUNT(*) AS total_orders
FROM orders
GROUP BY DATE_FORMAT(order_date, '%Y-%m')
ORDER BY order_month;

-- 28. Omzet completed per bulan.
SELECT
    DATE_FORMAT(order_date, '%Y-%m') AS order_month,
    SUM(grand_total) AS completed_revenue
FROM order_summaries
WHERE order_status = 'completed'
GROUP BY DATE_FORMAT(order_date, '%Y-%m')
ORDER BY order_month;

-- ------------------------------------------------------------
-- J. COMMON TABLE EXPRESSION (CTE) - MYSQL 8+
-- ------------------------------------------------------------

-- 29. Menghitung total belanja completed setiap customer.
WITH customer_spending AS (
    SELECT
        c.id AS customer_id,
        c.full_name,
        COALESCE(SUM(os.grand_total), 0) AS total_spending
    FROM customers AS c
    LEFT JOIN order_summaries AS os
        ON os.customer_id = c.id
       AND os.order_status = 'completed'
    GROUP BY c.id, c.full_name
)
SELECT *
FROM customer_spending
ORDER BY total_spending DESC;

-- 30. Customer dengan pengeluaran di atas rata-rata customer.
WITH customer_spending AS (
    SELECT
        c.id AS customer_id,
        c.full_name,
        COALESCE(SUM(os.grand_total), 0) AS total_spending
    FROM customers AS c
    LEFT JOIN order_summaries AS os
        ON os.customer_id = c.id
       AND os.order_status = 'completed'
    GROUP BY c.id, c.full_name
)
SELECT
    customer_id,
    full_name,
    total_spending
FROM customer_spending
WHERE total_spending > (
    SELECT AVG(total_spending)
    FROM customer_spending
)
ORDER BY total_spending DESC;

-- ------------------------------------------------------------
-- K. WINDOW FUNCTION - MYSQL 8+
-- ------------------------------------------------------------

-- 31. Ranking customer berdasarkan total belanja completed.
WITH customer_spending AS (
    SELECT
        c.id,
        c.full_name,
        COALESCE(SUM(os.grand_total), 0) AS total_spending
    FROM customers AS c
    LEFT JOIN order_summaries AS os
        ON os.customer_id = c.id
       AND os.order_status = 'completed'
    GROUP BY c.id, c.full_name
)
SELECT
    id,
    full_name,
    total_spending,
    DENSE_RANK() OVER (
        ORDER BY total_spending DESC
    ) AS spending_rank
FROM customer_spending
ORDER BY spending_rank, full_name;

-- 32. Ranking harga produk di dalam setiap kategori.
SELECT
    product_name,
    category,
    price,
    ROW_NUMBER() OVER (
        PARTITION BY category
        ORDER BY price DESC
    ) AS price_rank_in_category
FROM products
ORDER BY category, price_rank_in_category;

-- 33. Omzet bulanan dan omzet kumulatif.
WITH monthly_revenue AS (
    SELECT
        DATE_FORMAT(order_date, '%Y-%m') AS order_month,
        SUM(grand_total) AS revenue
    FROM order_summaries
    WHERE order_status = 'completed'
    GROUP BY DATE_FORMAT(order_date, '%Y-%m')
)
SELECT
    order_month,
    revenue,
    SUM(revenue) OVER (
        ORDER BY order_month
    ) AS cumulative_revenue
FROM monthly_revenue
ORDER BY order_month;

-- ------------------------------------------------------------
-- L. UNION
-- ------------------------------------------------------------

-- 34. Menggabungkan nama customer dan nama produk dalam satu hasil.
SELECT
    full_name AS name,
    'Customer' AS data_type
FROM customers

UNION ALL

SELECT
    product_name AS name,
    'Product' AS data_type
FROM products
ORDER BY data_type, name;

-- ------------------------------------------------------------
-- M. SELF JOIN
-- ------------------------------------------------------------

-- 35. Mencari pasangan customer yang berasal dari kota yang sama.
SELECT
    c1.full_name AS customer_1,
    c2.full_name AS customer_2,
    c1.city
FROM customers AS c1
INNER JOIN customers AS c2
    ON c1.city = c2.city
   AND c1.id < c2.id
ORDER BY c1.city, c1.full_name, c2.full_name;

-- ------------------------------------------------------------
-- N. UPDATE, DELETE, DAN TRANSACTION
-- Jalankan bagian ini hanya jika ingin berlatih mengubah data.
-- Gunakan ROLLBACK agar data dummy kembali seperti semula.
-- ------------------------------------------------------------

START TRANSACTION;

UPDATE products
SET stock = stock - 1
WHERE id = 1
  AND stock >= 1;

SELECT id, product_name, stock
FROM products
WHERE id = 1;

ROLLBACK;

-- Contoh DELETE yang aman untuk latihan:
START TRANSACTION;

DELETE FROM orders
WHERE id = 25;

SELECT *
FROM orders
WHERE id = 25;

ROLLBACK;

-- ============================================================
-- QUERY PENGECEKAN DATA
-- ============================================================
SELECT COUNT(*) AS total_customers FROM customers;
SELECT COUNT(*) AS total_products FROM products;
SELECT COUNT(*) AS total_orders FROM orders;
SELECT COUNT(*) AS total_order_items FROM order_items;
