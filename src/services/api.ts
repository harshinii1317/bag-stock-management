import { db } from './db';
import { Category, Customer, DashboardData, Product, Sale, StockTransaction, Supplier, User } from '../types';

/**
 * High-Level API client conforming to the Flask REST API specification.
 * Operates client-side with full ACID relational simulation & persistence,
 * allowing live interactive demonstration in AI Studio while guaranteeing
 * exact parameter & response parity with the Python Flask routes.
 */
export const api = {
  // ---------------- AUTH ----------------
  async login(username: string, password: string): Promise<{ success: boolean; message: string; data: User }> {
    await simulateNetworkDelay();
    try {
      const user = db.login(username, password);
      return { success: true, message: 'Login successful', data: user };
    } catch (e: any) {
      throw new Error(e.message || 'Login failed');
    }
  },

  async loginWithPin(pin: string): Promise<{ success: boolean; message: string; data: User }> {
    await simulateNetworkDelay(120);
    try {
      const user = db.loginWithPin(pin);
      return { success: true, message: `Access granted! Welcome, ${user.full_name}`, data: user };
    } catch (e: any) {
      throw new Error(e.message || 'PIN Authentication failed');
    }
  },

  async loginWithBadge(badgeId: string): Promise<{ success: boolean; message: string; data: User }> {
    await simulateNetworkDelay(120);
    try {
      const user = db.loginWithBadge(badgeId);
      return { success: true, message: `Badge scan verified: ${user.full_name}`, data: user };
    } catch (e: any) {
      throw new Error(e.message || 'Badge verification failed');
    }
  },

  async loginWithBiometric(biometricKey?: string): Promise<{ success: boolean; message: string; data: User }> {
    await simulateNetworkDelay(250);
    try {
      const user = db.loginWithBiometric(biometricKey);
      return {
        success: true,
        message: `Biometric passkey verified! Welcome, ${user.full_name}`,
        data: user
      };
    } catch (e: any) {
      throw new Error(e.message || 'Biometric authentication failed');
    }
  },

  async loginWithSecurityKey(securityKey: string): Promise<{ success: boolean; message: string; data: User }> {
    await simulateNetworkDelay(180);
    try {
      const user = db.loginWithSecurityKey(securityKey);
      return {
        success: true,
        message: `Master Fast-Pass accepted! Welcome, ${user.full_name}`,
        data: user
      };
    } catch (e: any) {
      throw new Error(e.message || 'Security Key verification failed');
    }
  },

  async requestOtp(email: string): Promise<{ success: boolean; message: string; code: string }> {
    await simulateNetworkDelay(150);
    try {
      const code = db.requestOtp(email);
      return { success: true, message: `One-Time Access Code sent to ${email}`, code };
    } catch (e: any) {
      throw new Error(e.message || 'Failed to generate access code');
    }
  },

  async loginWithOtp(email: string, otp: string): Promise<{ success: boolean; message: string; data: User }> {
    await simulateNetworkDelay(150);
    try {
      const user = db.loginWithOtp(email, otp);
      return { success: true, message: `Verified! Welcome, ${user.full_name}`, data: user };
    } catch (e: any) {
      throw new Error(e.message || 'Invalid code');
    }
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    await simulateNetworkDelay(100);
    db.logout();
    return { success: true, message: 'Logged out successfully' };
  },

  async getSession(): Promise<{ success: boolean; data: User }> {
    await simulateNetworkDelay(100);
    const user = db.getActiveUser();
    if (!user) throw new Error('No active session');
    return { success: true, data: user };
  },

  // ---------------- DASHBOARD ----------------
  async getDashboard(): Promise<{ success: boolean; data: DashboardData }> {
    await simulateNetworkDelay();
    const data = db.getDashboardData();
    return { success: true, data };
  },

  // ---------------- CATEGORIES ----------------
  async getCategories(): Promise<{ success: boolean; data: Category[] }> {
    await simulateNetworkDelay(100);
    return { success: true, data: db.getCategories() };
  },

  async createCategory(category_name: string, description?: string): Promise<{ success: boolean; message: string; data: Category }> {
    await simulateNetworkDelay();
    const data = db.createCategory(category_name, description);
    return { success: true, message: `Category '${data.category_name}' created successfully`, data };
  },

  async updateCategory(id: number, category_name: string, description?: string): Promise<{ success: boolean; message: string; data: Category }> {
    await simulateNetworkDelay();
    const data = db.updateCategory(id, category_name, description);
    return { success: true, message: 'Category updated successfully', data };
  },

  async deleteCategory(id: number): Promise<{ success: boolean; message: string }> {
    await simulateNetworkDelay();
    db.deleteCategory(id);
    return { success: true, message: 'Category deleted successfully' };
  },

  // ---------------- PRODUCTS ----------------
  async getProducts(params?: {
    search?: string;
    category_id?: number;
    supplier_id?: number;
    stock_status?: 'low' | 'in_stock' | 'out_of_stock' | 'all';
  }): Promise<{ success: boolean; data: Product[] }> {
    await simulateNetworkDelay(150);
    return { success: true, data: db.getProducts(params) };
  },

  async getProduct(id: number): Promise<{ success: boolean; data: Product }> {
    await simulateNetworkDelay(100);
    return { success: true, data: db.getProduct(id) };
  },

  async createProduct(productData: {
    product_name: string;
    category_id: number;
    supplier_id?: number | null;
    sku?: string;
    price: number;
    current_stock: number;
    minimum_stock: number;
    description?: string;
  }): Promise<{ success: boolean; message: string; data: Product }> {
    await simulateNetworkDelay();
    const data = db.createProduct(productData);
    return { success: true, message: `Product '${data.product_name}' registered with initial stock of ${data.current_stock}`, data };
  },

  async updateProduct(id: number, productData: {
    product_name: string;
    category_id: number;
    supplier_id?: number | null;
    sku?: string;
    price: number;
    minimum_stock: number;
    description?: string;
  }): Promise<{ success: boolean; message: string; data: Product }> {
    await simulateNetworkDelay();
    const data = db.updateProduct(id, productData);
    return { success: true, message: 'Product updated successfully', data };
  },

  async deleteProduct(id: number): Promise<{ success: boolean; message: string }> {
    await simulateNetworkDelay();
    db.deleteProduct(id);
    return { success: true, message: 'Product deleted successfully' };
  },

  // ---------------- SUPPLIERS ----------------
  async getSuppliers(search?: string): Promise<{ success: boolean; data: Supplier[] }> {
    await simulateNetworkDelay(100);
    return { success: true, data: db.getSuppliers(search) };
  },

  async getSupplier(id: number): Promise<{ success: boolean; data: { supplier: Supplier; products: Product[] } }> {
    await simulateNetworkDelay(100);
    return { success: true, data: db.getSupplier(id) };
  },

  async createSupplier(data: { supplier_name: string; phone: string; email?: string; address?: string }): Promise<{ success: boolean; message: string; data: Supplier }> {
    await simulateNetworkDelay();
    const supplier = db.createSupplier(data);
    return { success: true, message: 'Supplier registered successfully', data: supplier };
  },

  async updateSupplier(id: number, data: { supplier_name: string; phone: string; email?: string; address?: string }): Promise<{ success: boolean; message: string; data: Supplier }> {
    await simulateNetworkDelay();
    const supplier = db.updateSupplier(id, data);
    return { success: true, message: 'Supplier details updated successfully', data: supplier };
  },

  async deleteSupplier(id: number): Promise<{ success: boolean; message: string }> {
    await simulateNetworkDelay();
    db.deleteSupplier(id);
    return { success: true, message: 'Supplier removed successfully' };
  },

  // ---------------- CUSTOMERS ----------------
  async getCustomers(search?: string): Promise<{ success: boolean; data: Customer[] }> {
    await simulateNetworkDelay(100);
    return { success: true, data: db.getCustomers(search) };
  },

  async getCustomerPurchaseHistory(customerId: number): Promise<{ success: boolean; customer: Customer; sales: Sale[] }> {
    await simulateNetworkDelay(150);
    const result = db.getCustomerPurchaseHistory(customerId);
    return { success: true, customer: result.customer, sales: result.sales };
  },

  async createCustomer(data: { customer_name: string; phone: string; email?: string; address?: string }): Promise<{ success: boolean; message: string; data: Customer }> {
    await simulateNetworkDelay();
    const customer = db.createCustomer(data);
    return { success: true, message: 'Customer registered successfully', data: customer };
  },

  async updateCustomer(id: number, data: { customer_name: string; phone: string; email?: string; address?: string }): Promise<{ success: boolean; message: string; data: Customer }> {
    await simulateNetworkDelay();
    const customer = db.updateCustomer(id, data);
    return { success: true, message: 'Customer record updated successfully', data: customer };
  },

  async deleteCustomer(id: number): Promise<{ success: boolean; message: string }> {
    await simulateNetworkDelay();
    db.deleteCustomer(id);
    return { success: true, message: 'Customer record deleted successfully' };
  },

  // ---------------- SALES (TRANSACTIONAL) ----------------
  async createSale(saleData: {
    customer_id: number;
    payment_method?: string;
    notes?: string;
    items: Array<{ product_id: number; quantity: number }>;
  }): Promise<{ success: boolean; message: string; data: Sale }> {
    await simulateNetworkDelay(250);
    const sale = db.createSale(saleData);
    return {
      success: true,
      message: `Sale #${sale.sale_id} successfully processed! Stock automatically updated.`,
      data: sale
    };
  },

  async getSales(params?: { customer_id?: number; start_date?: string; end_date?: string }): Promise<{ success: boolean; data: Sale[] }> {
    await simulateNetworkDelay(120);
    return { success: true, data: db.getSales(params) };
  },

  async getSaleDetail(id: number): Promise<{ success: boolean; data: Sale }> {
    await simulateNetworkDelay(100);
    return { success: true, data: db.getSaleDetail(id) };
  },

  // ---------------- STOCK & RESTOCK ----------------
  async restockProduct(productId: number, quantity: number, notes?: string, referenceId?: string): Promise<{
    success: boolean;
    message: string;
    data: { product: Product; newStock: number };
  }> {
    await simulateNetworkDelay(200);
    const result = db.restockProduct(productId, quantity, notes, referenceId);
    return {
      success: true,
      message: `Restocked ${quantity} units of '${result.product.product_name}'. New stock level: ${result.newStock}`,
      data: result
    };
  },

  async getLowStock(): Promise<{ success: boolean; data: Product[] }> {
    await simulateNetworkDelay(100);
    return { success: true, data: db.getLowStockProducts() };
  },

  async getStockTransactions(params?: { product_id?: number; type?: 'STOCK_IN' | 'STOCK_OUT'; limit?: number }): Promise<{ success: boolean; data: StockTransaction[] }> {
    await simulateNetworkDelay(120);
    return { success: true, data: db.getStockTransactions(params) };
  },

  // ---------------- REPORTS ----------------
  async getInventoryReport(categoryId?: number) {
    await simulateNetworkDelay(150);
    return { success: true, ...db.getInventoryReport(categoryId) };
  },

  async getSalesReport(startDate?: string, endDate?: string) {
    await simulateNetworkDelay(150);
    return { success: true, ...db.getSalesReport(startDate, endDate) };
  },

  // ---------------- UTILITIES ----------------
  resetSampleData(): void {
    db.initDatabase(true);
  },

  clearAllData(): void {
    db.clearAllData();
  },

  getSqlDump(): string {
    return db.generateSqlDump();
  }
};

function simulateNetworkDelay(ms = 180): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
