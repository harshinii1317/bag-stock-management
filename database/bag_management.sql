-- ============================================================================
-- BAG WORLD - STOCK MANAGEMENT SYSTEM (DATABASE SCHEMA)
-- Store Owner: JHH BagTrack
-- Currency: Indian Rupees (INR - ₹)
-- Target Database: MySQL 8.0+ / MariaDB
-- Database Name: bag_management
-- Designed for: DBMS Mini Project / Academic Viva & Production Retail Management
-- ============================================================================

CREATE DATABASE IF NOT EXISTS bag_management;
USE bag_management;

-- Disable foreign key checks during initialization
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS stock_transactions;
DROP TABLE IF EXISTS sale_items;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. USERS TABLE (Authentication & Role Management)
-- ============================================================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    pin_code VARCHAR(10) DEFAULT NULL,
    badge_id VARCHAR(50) DEFAULT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('Owner', 'Manager', 'Staff') NOT NULL DEFAULT 'Owner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. CATEGORIES TABLE (User-defined Bag Categories)
-- ============================================================================
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. SUPPLIERS TABLE (Bag Vendors & Artisans)
-- ============================================================================
CREATE TABLE suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. PRODUCTS TABLE (Inventory Catalog & Live Stock)
-- ============================================================================
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    category_id INT NOT NULL,
    supplier_id INT,
    sku VARCHAR(50) UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    current_stock INT NOT NULL DEFAULT 0,
    minimum_stock INT NOT NULL DEFAULT 5,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_product_price CHECK (price >= 0),
    CONSTRAINT chk_product_current_stock CHECK (current_stock >= 0),
    CONSTRAINT chk_product_min_stock CHECK (minimum_stock >= 0),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) 
        REFERENCES categories(category_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_id) 
        REFERENCES suppliers(supplier_id) 
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. CUSTOMERS TABLE (Client Master & CRM)
-- ============================================================================
CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. SALES TABLE (Master Sales Records)
-- ============================================================================
CREATE TABLE sales (
    sale_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Cash',
    notes TEXT,
    
    -- Constraints
    CONSTRAINT chk_sales_total CHECK (total_amount >= 0),
    CONSTRAINT fk_sales_customer FOREIGN KEY (customer_id) 
        REFERENCES customers(customer_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. SALE_ITEMS TABLE (Line Items for Each Transaction)
-- ============================================================================
CREATE TABLE sale_items (
    sale_item_id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    
    -- Constraints
    CONSTRAINT chk_item_quantity CHECK (quantity > 0),
    CONSTRAINT chk_item_unit_price CHECK (unit_price >= 0),
    CONSTRAINT chk_item_subtotal CHECK (subtotal >= 0),
    CONSTRAINT fk_sale_items_sale FOREIGN KEY (sale_id) 
        REFERENCES sales(sale_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sale_items_product FOREIGN KEY (product_id) 
        REFERENCES products(product_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. STOCK_TRANSACTIONS TABLE (Audit Trail for Inbound/Outbound Stock)
-- ============================================================================
CREATE TABLE stock_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    transaction_type ENUM('STOCK_IN', 'STOCK_OUT') NOT NULL,
    quantity INT NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reference_id VARCHAR(50),
    notes TEXT,
    
    -- Constraints
    CONSTRAINT chk_trans_quantity CHECK (quantity > 0),
    CONSTRAINT fk_stock_trans_product FOREIGN KEY (product_id) 
        REFERENCES products(product_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INDEXES FOR HIGH QUERY PERFORMANCE & SEARCH OPTIMIZATION
-- ============================================================================
CREATE INDEX idx_products_name ON products(product_name);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_stock ON products(current_stock, minimum_stock);
CREATE INDEX idx_customers_name ON customers(customer_name);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_transactions_product ON stock_transactions(product_id);
CREATE INDEX idx_transactions_date ON stock_transactions(transaction_date);

-- ============================================================================
-- DEFAULT INITIAL USER (Owner Account: admin / admin123)
-- Hash generated using pbkdf2:sha256 (compatible with Werkzeug)
-- ============================================================================
INSERT INTO users (username, email, password_hash, pin_code, badge_id, full_name, role)
VALUES 
(
    'admin',
    'admin@bagworld.in',
    'pbkdf2:sha256:600000$f8vL1A9P$16e1c4dfa8b093f4be8d1f2b4bb13d4b68e9282361b7fcf2e36b8e3ef4a1122a',
    '1234',
    'JHH-ADM-01',
    'JHH Admin',
    'Owner'
),
(
    'jhh_manager',
    'manager@bagworld.in',
    'pbkdf2:sha256:600000$f8vL1A9P$16e1c4dfa8b093f4be8d1f2b4bb13d4b68e9282361b7fcf2e36b8e3ef4a1122a',
    '9988',
    'JHH-MGR-02',
    'JHH stock Manager',
    'Manager'
),
(
    'jhh_staff',
    'staff@bagworld.in',
    'pbkdf2:sha256:600000$f8vL1A9P$16e1c4dfa8b093f4be8d1f2b4bb13d4b68e9282361b7fcf2e36b8e3ef4a1122a',
    '5566',
    'JHH-STF-03',
    'JHH StaffHub',
    'Staff'
) ON DUPLICATE KEY UPDATE username=username;

-- ============================================================================
-- USEFUL DBMS QUERIES FOR VIVA / EXAMINATION & SYSTEM LOGIC
-- ============================================================================

-- Query 1: Low Stock Alert Query (Dynamic Calculation, no duplication)
-- SELECT p.product_id, p.product_name, c.category_name, p.current_stock, p.minimum_stock,
--        (p.minimum_stock - p.current_stock) AS deficit_quantity
-- FROM products p
-- JOIN categories c ON p.category_id = c.category_id
-- WHERE p.current_stock <= p.minimum_stock
-- ORDER BY p.current_stock ASC;

-- Query 2: Current Inventory Value & Stock Summary
-- SELECT c.category_name,
--        COUNT(p.product_id) AS total_items,
--        SUM(p.current_stock) AS total_units_in_stock,
--        SUM(p.current_stock * p.price) AS total_valuation
-- FROM products p
-- JOIN categories c ON p.category_id = c.category_id
-- GROUP BY c.category_id, c.category_name;

-- Query 3: Customer Purchase History (Relational Joins)
-- SELECT s.sale_id, s.sale_date, p.product_name, si.quantity, si.unit_price, si.subtotal, s.total_amount
-- FROM sales s
-- JOIN sale_items si ON s.sale_id = si.sale_id
-- JOIN products p ON si.product_id = p.product_id
-- WHERE s.customer_id = 1
-- ORDER BY s.sale_date DESC;

-- Query 4: Daily Sales Revenue
-- SELECT DATE(sale_date) AS sale_day,
--        COUNT(sale_id) AS total_orders,
--        SUM(total_amount) AS revenue
-- FROM sales
-- GROUP BY DATE(sale_date)
-- ORDER BY sale_day DESC;
