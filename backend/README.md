# Bag Company Stock Management System - Flask & MySQL Backend

A production-grade, relational DBMS backend for college mini-projects and bag boutique management.

## 🛠️ Tech Stack
- **Language**: Python 3.10+
- **Framework**: Flask 3.0+
- **Database**: MySQL 8.0+ / MariaDB
- **Database Driver**: PyMySQL (Native dictionary cursor connection)
- **Authentication**: Session-based with Werkzeug PBKDF2:SHA256 password hashing

---

## 🗄️ Database Setup Instructions

1. **Start your MySQL Server** (via MySQL Workbench, XAMPP, or Terminal).
2. **Import the SQL schema**:
   ```bash
   mysql -u root -p < database/bag_management.sql
   ```
   This creates the `bag_management` database and all 8 relational tables:
   - `users`
   - `categories`
   - `suppliers`
   - `products`
   - `customers`
   - `sales`
   - `sale_items`
   - `stock_transactions`

3. **Default Login Credentials**:
   - **Username**: `admin`
   - **Password**: `admin123`

---

## 🚀 Running the Flask Backend

1. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. **Install requirements**:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Configure Database Credentials**:
   Create a `.env` file or export environment variables:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=bag_management
   DB_PORT=3306
   SECRET_KEY=bag_super_secret_key_2026
   ```

4. **Launch the Flask Server**:
   ```bash
   python backend/app.py
   ```
   The backend API will be running at `http://localhost:5000`.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/login` | Authenticate user session |
| `POST` | `/api/logout` | Terminate session |
| `GET` | `/api/session` | Check current user session |
| `GET` | `/api/dashboard` | Dashboard metrics (cards, recent sales, low stock) |
| `GET` | `/api/categories` | List bag categories with product counts |
| `POST` | `/api/categories` | Add new custom category |
| `PUT` | `/api/categories/<id>` | Update category name/description |
| `DELETE` | `/api/categories/<id>` | Delete category (protected against foreign key conflicts) |
| `GET` | `/api/products` | Query products (supports search, category, status filters) |
| `POST` | `/api/products` | Add new bag product with initial stock & min level |
| `PUT` | `/api/products/<id>` | Update product details |
| `DELETE` | `/api/products/<id>` | Delete product |
| `GET` | `/api/suppliers` | List bag suppliers & vendor info |
| `POST` | `/api/suppliers` | Register new supplier |
| `GET` | `/api/customers` | List registered customers with total orders |
| `POST` | `/api/customers` | Register new customer |
| `GET` | `/api/customers/<id>/purchase-history` | Detailed customer purchase receipts |
| `POST` | `/api/sales` | **Transactional Sale**: validates stock, inserts sale, inserts sale_items, deducts stock, logs STOCK_OUT |
| `GET` | `/api/stock/low` | Get products where `current_stock <= minimum_stock` |
| `POST` | `/api/stock/restock` | Restock inventory: updates stock & logs STOCK_IN |
| `GET` | `/api/stock/transactions` | Full audit log of all stock movements |
| `GET` | `/api/reports/inventory` | Inventory valuation and category audit |
| `GET` | `/api/reports/sales` | Sales and revenue reports with date filtering |
