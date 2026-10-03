export interface User {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'Owner' | 'Manager' | 'Staff' | 'Admin';
  pin_code?: string;
  badge_id?: string;
  biometric_key?: string;
  security_key?: string;
  password?: string;
}

export interface Category {
  category_id: number;
  category_name: string;
  description?: string;
  created_at?: string;
  product_count?: number;
}

export interface Supplier {
  supplier_id: number;
  supplier_name: string;
  phone: string;
  email?: string;
  address?: string;
  created_at?: string;
  products_supplied?: number;
}

export interface Product {
  product_id: number;
  product_name: string;
  category_id: number;
  supplier_id?: number | null;
  sku?: string;
  price: number;
  current_stock: number;
  minimum_stock: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
  // Computed / joined fields
  category_name?: string;
  supplier_name?: string;
  supplier_phone?: string;
  stock_status?: 'In Stock' | 'Low Stock' | 'Out of Stock';
  deficit_quantity?: number;
}

export interface Customer {
  customer_id: number;
  customer_name: string;
  phone: string;
  email?: string;
  address?: string;
  created_at?: string;
  total_orders?: number;
  total_spent?: number;
}

export interface SaleItem {
  sale_item_id: number;
  sale_id: number;
  product_id: number;
  product_name?: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Sale {
  sale_id: number;
  customer_id: number;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  sale_date: string;
  total_amount: number;
  payment_method: string;
  notes?: string;
  items_summary?: string;
  total_items_sold?: number;
  items?: SaleItem[];
}

export interface StockTransaction {
  transaction_id: number;
  product_id: number;
  product_name?: string;
  sku?: string;
  category_name?: string;
  transaction_type: 'STOCK_IN' | 'STOCK_OUT';
  quantity: number;
  transaction_date: string;
  reference_id?: string;
  notes?: string;
}

export interface DashboardStatistics {
  total_products: number;
  total_stock: number;
  total_inventory_value: number;
  total_customers: number;
  total_suppliers: number;
  total_sales_count: number;
  total_sales_revenue: number;
  low_stock_count: number;
}

export interface DashboardData {
  statistics: DashboardStatistics;
  recent_sales: Sale[];
  recent_transactions: StockTransaction[];
  low_stock_products: Product[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}
