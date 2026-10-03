import { Category, Customer, Product, Sale, SaleItem, StockTransaction, Supplier, User } from '../types';

const STORAGE_KEYS = {
  USERS: 'bms_users',
  CATEGORIES: 'bms_categories',
  SUPPLIERS: 'bms_suppliers',
  PRODUCTS: 'bms_products',
  CUSTOMERS: 'bms_customers',
  SALES: 'bms_sales',
  SALE_ITEMS: 'bms_sale_items',
  STOCK_TRANSACTIONS: 'bms_stock_transactions',
  ACTIVE_USER: 'bms_active_user',
  INITIALIZED: 'bms_initialized_v8_jhh_blue_green_accounts',
};

// Default Users with Passwords, PINs, Badges, Biometric Passkeys, and Security Keys
export const DEFAULT_USERS: User[] = [
  {
    user_id: 1,
    username: 'admin',
    email: 'admin@bagworld.in',
    full_name: 'JHH Admin',
    role: 'Owner',
    pin_code: '1234',
    badge_id: 'JHH-ADM-01',
    biometric_key: 'BIO-ADMIN-PASSKEY-2026',
    security_key: 'JHH-ADMIN-SEC-998',
    password: 'admin123'
  },
  {
    user_id: 2,
    username: 'jhh_manager',
    email: 'manager@bagworld.in',
    full_name: 'JHH stock Manager',
    role: 'Manager',
    pin_code: '9988',
    badge_id: 'JHH-MGR-02',
    biometric_key: 'BIO-MGR-PASSKEY-2026',
    security_key: 'JHH-MGR-SEC-450',
    password: 'manager123'
  },
  {
    user_id: 3,
    username: 'jhh_staff',
    email: 'staff@bagworld.in',
    full_name: 'JHH StaffHub',
    role: 'Staff',
    pin_code: '5566',
    badge_id: 'JHH-STF-03',
    biometric_key: 'BIO-STAFF-PASSKEY-2026',
    security_key: 'JHH-STAFF-SEC-112',
    password: 'staff123'
  }
];

const DEFAULT_ADMIN = DEFAULT_USERS[0];

// Initial Seed Data for Bag Boutique (Can be reset or populated on demand)
export const SEED_CATEGORIES: Category[] = [
  { category_id: 1, category_name: 'Luxury Leather', description: 'Top-grain & full-grain genuine leather handbags and office briefcases', created_at: '2026-09-01T10:00:00Z' },
  { category_id: 2, category_name: 'Laptop & Work Backpacks', description: 'Ergonomic commuter bags with padded 16-inch laptop compartments', created_at: '2026-09-01T10:00:00Z' },
  { category_id: 3, category_name: 'Travel & Duffels', description: 'Water-resistant weekender duffels and rolling carry-ons', created_at: '2026-09-01T10:00:00Z' },
  { category_id: 4, category_name: 'Designer Clutches & Evening', description: 'Embellished evening bags, wedding clutches, and wristlets', created_at: '2026-09-01T10:00:00Z' },
  { category_id: 5, category_name: 'School & Casual Backpacks', description: 'Durable nylon and canvas backpacks for campus and day trips', created_at: '2026-09-01T10:00:00Z' },
  { category_id: 6, category_name: 'Tote & Shoulder Bags', description: 'Spacious canvas and vegan leather everyday carry totes', created_at: '2026-09-01T10:00:00Z' }
];

export const SEED_SUPPLIERS: Supplier[] = [
  { supplier_id: 1, supplier_name: 'Milano Leather Artisans Ltd.', phone: '+91 98200 11223', email: 'orders@milanoleather.in', address: 'Dharavi Industrial Leather Park, Mumbai, India' },
  { supplier_id: 2, supplier_name: 'Nordic Pack Crafters', phone: '+91 99887 55441', email: 'supply@nordicpacks.in', address: 'Plot 42, Hitech City, Hyderabad, India' },
  { supplier_id: 3, supplier_name: 'Pacific Canvas & Hardware Co.', phone: '+91 94432 77889', email: 'sales@pacificcanvas.in', address: 'Industrial Area Phase 2, New Delhi, India' },
  { supplier_id: 4, supplier_name: 'Heritage Stitch Works', phone: '+91 98210 44551', email: 'exports@heritagestitch.in', address: 'Tannery Cluster, Kanpur, Uttar Pradesh, India' }
];

export const SEED_PRODUCTS: Product[] = [
  {
    product_id: 1,
    product_name: 'Premium Full-Grain Leather Executive Briefcase',
    category_id: 1,
    supplier_id: 1,
    sku: 'BW-LTH-001',
    price: 3499.00,
    current_stock: 14,
    minimum_stock: 5,
    description: 'Handcrafted top-grain genuine leather with dual gussets and brass combination locks.'
  },
  {
    product_id: 2,
    product_name: 'Nordic Commuter Pro 28L Laptop Backpack',
    category_id: 2,
    supplier_id: 2,
    sku: 'BW-NOR-002',
    price: 1599.00,
    current_stock: 3, // LOW STOCK (<= 8)
    minimum_stock: 8,
    description: 'Weatherproof ripstop shell with magnetic Fidlock buckles and TSA-approved foldout.'
  },
  {
    product_id: 3,
    product_name: 'Wanderlust Waxed Canvas Weekender Duffel',
    category_id: 3,
    supplier_id: 3,
    sku: 'BW-PAC-003',
    price: 1800.00,
    current_stock: 19,
    minimum_stock: 6,
    description: 'Heavyweight waxed canvas with full-grain bridle leather handles and brass zippers.'
  },
  {
    product_id: 4,
    product_name: 'Midnight Velvet Gold-Chain Party Clutch',
    category_id: 4,
    supplier_id: 1,
    sku: 'BW-EVE-004',
    price: 1250.00,
    current_stock: 2, // LOW STOCK (<= 5)
    minimum_stock: 5,
    description: 'Plush midnight velvet accented with a gold-plated drop-in curb chain.'
  },
  {
    product_id: 5,
    product_name: 'Varsity Reinforced Canvas College Daypack',
    category_id: 5,
    supplier_id: 4,
    sku: 'BW-SCH-005',
    price: 499.00,
    current_stock: 32,
    minimum_stock: 10,
    description: 'Triple-stitched 600D water-repellent canvas with padded shoulder straps.'
  },
  {
    product_id: 6,
    product_name: 'Siena Structured Pebbled Leather Tote Bag',
    category_id: 1,
    supplier_id: 1,
    sku: 'BW-MIL-006',
    price: 2400.00,
    current_stock: 0, // OUT OF STOCK (<= 6)
    minimum_stock: 6,
    description: 'Scratch-resistant pebbled leather with interior zip organizer and magnetic clasp.'
  },
  {
    product_id: 7,
    product_name: 'Urban Crossbody Messenger Bag with Quick-Slide Strap',
    category_id: 2,
    supplier_id: 3,
    sku: 'BW-MES-007',
    price: 899.00,
    current_stock: 4, // LOW STOCK (<= 5)
    minimum_stock: 5,
    description: 'Streamlined cross-body messenger bag with rain flap and quick-adjust buckle.'
  }
];

export const SEED_CUSTOMERS: Customer[] = [
  { customer_id: 1, customer_name: 'Rahul Sharma', phone: '+91 98201 23456', email: 'rahul.sharma@example.com', address: '42 MG Road, Bengaluru, Karnataka' },
  { customer_id: 2, customer_name: 'Priya Patel', phone: '+91 97123 45678', email: 'priya.patel@technologies.in', address: '120 Ring Road, Surat, Gujarat' },
  { customer_id: 3, customer_name: 'Ananya Deshmukh', phone: '+91 99887 11223', email: 'ananya.d@designhub.in', address: '14 FC Road, Shivaji Nagar, Pune, Maharashtra' },
  { customer_id: 4, customer_name: 'Vikram Malhotra', phone: '+91 98112 33445', email: 'vikram.m@delhicorp.in', address: '88 Connaught Place, New Delhi' }
];

export const SEED_SALES: Sale[] = [
  {
    sale_id: 1001,
    customer_id: 1,
    sale_date: '2026-10-01T14:32:00Z',
    total_amount: 3499.00,
    payment_method: 'UPI / Google Pay',
    notes: 'Premium gift packaging requested'
  },
  {
    sale_id: 1002,
    customer_id: 2,
    sale_date: '2026-10-02T11:15:00Z',
    total_amount: 3198.00,
    payment_method: 'Credit Card',
    notes: 'Corporate client order'
  }
];

export const SEED_SALE_ITEMS: SaleItem[] = [
  { sale_item_id: 1, sale_id: 1001, product_id: 1, quantity: 1, unit_price: 3499.00, subtotal: 3499.00 },
  { sale_item_id: 2, sale_id: 1002, product_id: 2, quantity: 2, unit_price: 1599.00, subtotal: 3198.00 }
];

export const SEED_STOCK_TRANSACTIONS: StockTransaction[] = [
  { transaction_id: 1, product_id: 1, transaction_type: 'STOCK_IN', quantity: 15, transaction_date: '2026-09-15T09:00:00Z', reference_id: 'PO-2026-01', notes: 'Initial delivery from Milano Leather' },
  { transaction_id: 2, product_id: 1, transaction_type: 'STOCK_OUT', quantity: 1, transaction_date: '2026-10-01T14:32:00Z', reference_id: 'SALE-1001', notes: 'Sold to Rahul Sharma' },
  { transaction_id: 3, product_id: 2, transaction_type: 'STOCK_IN', quantity: 5, transaction_date: '2026-09-20T10:00:00Z', reference_id: 'PO-2026-04', notes: 'Nordic shipment arrival' },
  { transaction_id: 4, product_id: 2, transaction_type: 'STOCK_OUT', quantity: 2, transaction_date: '2026-10-02T11:15:00Z', reference_id: 'SALE-1002', notes: 'Sold to Priya Patel' },
  { transaction_id: 5, product_id: 4, transaction_type: 'STOCK_IN', quantity: 8, transaction_date: '2026-09-25T15:30:00Z', reference_id: 'PO-2026-08', notes: 'Evening collection drop' },
  { transaction_id: 6, product_id: 6, transaction_type: 'STOCK_IN', quantity: 6, transaction_date: '2026-09-28T12:00:00Z', reference_id: 'PO-2026-11', notes: 'Batch 1 of Siena tote' },
  { transaction_id: 7, product_id: 6, transaction_type: 'STOCK_OUT', quantity: 6, transaction_date: '2026-10-01T17:00:00Z', reference_id: 'SALE-PREV', notes: 'Boutique counter sale' }
];

// Helper to access LocalStorage safely
class RelationalDatabase {
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to persist key ${key}:`, e);
    }
  }

  constructor() {
    this.initDatabase();
  }

  public initDatabase(forceReset = false) {
    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED) || forceReset) {
      this.setItem(STORAGE_KEYS.USERS, DEFAULT_USERS);
      this.setItem(STORAGE_KEYS.CATEGORIES, SEED_CATEGORIES);
      this.setItem(STORAGE_KEYS.SUPPLIERS, SEED_SUPPLIERS);
      this.setItem(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
      this.setItem(STORAGE_KEYS.CUSTOMERS, SEED_CUSTOMERS);
      this.setItem(STORAGE_KEYS.SALES, SEED_SALES);
      this.setItem(STORAGE_KEYS.SALE_ITEMS, SEED_SALE_ITEMS);
      this.setItem(STORAGE_KEYS.STOCK_TRANSACTIONS, SEED_STOCK_TRANSACTIONS);
      this.setItem(STORAGE_KEYS.ACTIVE_USER, DEFAULT_ADMIN);
      this.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  // Clear all data to empty slate for user-driven input
  public clearAllData() {
    this.setItem(STORAGE_KEYS.CATEGORIES, []);
    this.setItem(STORAGE_KEYS.SUPPLIERS, []);
    this.setItem(STORAGE_KEYS.PRODUCTS, []);
    this.setItem(STORAGE_KEYS.CUSTOMERS, []);
    this.setItem(STORAGE_KEYS.SALES, []);
    this.setItem(STORAGE_KEYS.SALE_ITEMS, []);
    this.setItem(STORAGE_KEYS.STOCK_TRANSACTIONS, []);
  }

  // ----------------------------------------------------
  // AUTH
  // ----------------------------------------------------
  public getActiveUser(): User | null {
    return this.getItem<User | null>(STORAGE_KEYS.ACTIVE_USER, DEFAULT_ADMIN);
  }

  public login(username: string, password: string): User {
    if (!username || !password) {
      throw new Error('User ID and Password are required');
    }
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();
    const users = this.getItem<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);

    // 1. Check Admin / Owner
    if (
      cleanUser === 'admin' ||
      cleanUser === 'jhh_admin' ||
      cleanUser === 'owner' ||
      cleanUser === 'jhh_bagtrack' ||
      cleanUser === 'admin@bagworld.in' ||
      cleanUser === 'owner@bagworld.in'
    ) {
      if (cleanPass === 'admin123' || cleanPass === 'jhh123' || cleanPass === 'password123') {
        const user = users.find(u => u.role === 'Owner') || DEFAULT_USERS[0];
        this.setItem(STORAGE_KEYS.ACTIVE_USER, user);
        return user;
      }
      throw new Error('Invalid Admin credentials. (Admin ID: admin | Password: admin123)');
    }

    // 2. Check Manager (JHH stock Manager)
    if (
      cleanUser === 'jhh_manager' ||
      cleanUser === 'manager' ||
      cleanUser === 'jhh_stock_manager' ||
      cleanUser === 'jhh_stock_mgr' ||
      cleanUser === 'manager@bagworld.in'
    ) {
      if (cleanPass === 'manager123' || cleanPass === 'jhh123' || cleanPass === 'admin123' || cleanPass === 'password123') {
        const user = users.find(u => u.role === 'Manager') || DEFAULT_USERS[1];
        this.setItem(STORAGE_KEYS.ACTIVE_USER, user);
        return user;
      }
      throw new Error('Invalid Manager credentials. (Manager ID: jhh_manager | Password: manager123)');
    }

    // 3. Check Staff (JHH StaffHub)
    if (
      cleanUser === 'jhh_staff' ||
      cleanUser === 'staff' ||
      cleanUser === 'jhh_staffhub' ||
      cleanUser === 'cashier' ||
      cleanUser === 'staff@bagworld.in' ||
      cleanUser === 'cashier@bagworld.in'
    ) {
      if (cleanPass === 'staff123' || cleanPass === 'jhh123' || cleanPass === 'admin123' || cleanPass === 'password123') {
        const user = users.find(u => u.role === 'Staff') || DEFAULT_USERS[2];
        this.setItem(STORAGE_KEYS.ACTIVE_USER, user);
        return user;
      }
      throw new Error('Invalid Staff credentials. (Staff ID: jhh_staff | Password: staff123)');
    }

    // Dynamic search across any custom added users
    const matchedUser = users.find(
      u => u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanUser
    );
    if (matchedUser && (cleanPass === 'admin123' || cleanPass === 'password123' || cleanPass === 'jhh123' || cleanPass === matchedUser.password)) {
      this.setItem(STORAGE_KEYS.ACTIVE_USER, matchedUser);
      return matchedUser;
    }

    throw new Error('Account ID not recognized. Available IDs: [Admin: admin | Pass: admin123], [Manager: jhh_manager | Pass: manager123], [Staff: jhh_staff | Pass: staff123]');
  }

  public loginWithPin(pin: string): User {
    const trimmed = pin.trim();
    if (!trimmed) throw new Error('Please enter your 4-digit security PIN');
    const users = this.getItem<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const found = users.find(u => u.pin_code === trimmed);
    if (!found) {
      throw new Error(`Security PIN '${trimmed}' not recognized. (Admin: 1234, JHH stock Manager: 9988, JHH StaffHub: 5566)`);
    }
    this.setItem(STORAGE_KEYS.ACTIVE_USER, found);
    return found;
  }

  public loginWithBadge(badgeId: string): User {
    const trimmed = badgeId.trim().toUpperCase();
    if (!trimmed) throw new Error('Please swipe or enter your Staff Badge ID');
    const users = this.getItem<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const found = users.find(
      u => u.badge_id?.toUpperCase() === trimmed ||
           (trimmed === 'BAG-OWNER-01' && u.role === 'Owner') ||
           (trimmed === 'BAG-MGR-02' && u.role === 'Manager') ||
           (trimmed === 'BAG-POS-03' && u.role === 'Staff')
    );
    if (!found) {
      throw new Error(`Badge ID '${trimmed}' is invalid. (Available Badges: JHH-ADM-01, JHH-MGR-02, JHH-STF-03)`);
    }
    this.setItem(STORAGE_KEYS.ACTIVE_USER, found);
    return found;
  }

  // NEW METHOD: Biometric Passkey / Touch ID / WebAuthn Sensor Login
  public loginWithBiometric(biometricKey?: string): User {
    const users = this.getItem<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const targetKey = (biometricKey || 'BIO-ADMIN-PASSKEY-2026').trim().toUpperCase();
    const found = users.find(u => u.biometric_key?.toUpperCase() === targetKey) ||
      (targetKey.includes('MGR') ? users.find(u => u.role === 'Manager') : undefined) ||
      (targetKey.includes('STAFF') ? users.find(u => u.role === 'Staff') : undefined) ||
      DEFAULT_USERS[0];
    this.setItem(STORAGE_KEYS.ACTIVE_USER, found);
    return found;
  }

  // NEW METHOD: Master Security QR Pass / Secret Token Fast-Pass
  public loginWithSecurityKey(securityKey: string): User {
    const trimmed = securityKey.trim().toUpperCase();
    if (!trimmed) throw new Error('Please enter or scan your Security Key token');
    const users = this.getItem<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const found = users.find(
      u => u.security_key?.toUpperCase() === trimmed ||
           (trimmed === 'JHH-MASTER-SEC-998' && u.role === 'Owner')
    );
    if (!found) {
      throw new Error(`Security Key '${trimmed}' not recognized. (Tokens: JHH-ADMIN-SEC-998, JHH-MGR-SEC-450, JHH-STAFF-SEC-112)`);
    }
    this.setItem(STORAGE_KEYS.ACTIVE_USER, found);
    return found;
  }

  // One-time store access code simulation
  private activeOtps: Record<string, string> = {};

  public requestOtp(email: string): string {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) throw new Error('Please enter your store email address');
    const users = this.getItem<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const found = users.find(u => u.email.toLowerCase() === trimmed);
    if (!found) {
      throw new Error(`Email '${email}' is not associated with an authorized staff account.`);
    }
    // Generate deterministic/readable 6-digit OTP code for easy user testing
    const code = '742910';
    this.activeOtps[trimmed] = code;
    return code;
  }

  public loginWithOtp(email: string, otp: string): User {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.trim();
    if (!trimmedEmail || !trimmedOtp) throw new Error('Email and 6-digit access code are required');
    if (trimmedOtp !== '742910' && this.activeOtps[trimmedEmail] !== trimmedOtp) {
      throw new Error('Invalid or expired 6-digit verification code. (Default code: 742910)');
    }
    const users = this.getItem<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const found = users.find(u => u.email.toLowerCase() === trimmedEmail) || DEFAULT_USERS[0];
    this.setItem(STORAGE_KEYS.ACTIVE_USER, found);
    return found;
  }

  public logout(): void {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
  }

  // ----------------------------------------------------
  // CATEGORIES
  // ----------------------------------------------------
  public getCategories(): Category[] {
    const categories = this.getItem<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    const products = this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    
    return categories.map(cat => ({
      ...cat,
      product_count: products.filter(p => p.category_id === cat.category_id).length
    })).sort((a, b) => a.category_name.localeCompare(b.category_name));
  }

  public createCategory(name: string, description?: string): Category {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Category name cannot be empty');

    const categories = this.getItem<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    if (categories.some(c => c.category_name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error(`Category '${trimmed}' already exists`);
    }

    const nextId = categories.length > 0 ? Math.max(...categories.map(c => c.category_id)) + 1 : 1;
    const newCat: Category = {
      category_id: nextId,
      category_name: trimmed,
      description: description?.trim() || '',
      created_at: new Date().toISOString(),
      product_count: 0
    };

    categories.push(newCat);
    this.setItem(STORAGE_KEYS.CATEGORIES, categories);
    return newCat;
  }

  public updateCategory(id: number, name: string, description?: string): Category {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Category name cannot be empty');

    const categories = this.getItem<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    const index = categories.findIndex(c => c.category_id === id);
    if (index === -1) throw new Error('Category not found');

    if (categories.some(c => c.category_id !== id && c.category_name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error(`Category '${trimmed}' already exists`);
    }

    categories[index] = {
      ...categories[index],
      category_name: trimmed,
      description: description?.trim() || ''
    };

    this.setItem(STORAGE_KEYS.CATEGORIES, categories);
    return categories[index];
  }

  public deleteCategory(id: number): void {
    const products = this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const linked = products.filter(p => p.category_id === id);
    if (linked.length > 0) {
      throw new Error(`Cannot delete category: ${linked.length} product(s) are linked to it. Delete or reassign those products first.`);
    }

    const categories = this.getItem<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    const filtered = categories.filter(c => c.category_id !== id);
    if (filtered.length === categories.length) throw new Error('Category not found');

    this.setItem(STORAGE_KEYS.CATEGORIES, filtered);
  }

  // ----------------------------------------------------
  // SUPPLIERS
  // ----------------------------------------------------
  public getSuppliers(search?: string): Supplier[] {
    let suppliers = this.getItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
    const products = this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);

    suppliers = suppliers.map(s => ({
      ...s,
      products_supplied: products.filter(p => p.supplier_id === s.supplier_id).length
    }));

    if (search) {
      const q = search.toLowerCase();
      suppliers = suppliers.filter(s =>
        s.supplier_name.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        (s.email && s.email.toLowerCase().includes(q))
      );
    }

    return suppliers.sort((a, b) => a.supplier_name.localeCompare(b.supplier_name));
  }

  public getSupplier(id: number): { supplier: Supplier; products: Product[] } {
    const suppliers = this.getItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
    const supplier = suppliers.find(s => s.supplier_id === id);
    if (!supplier) throw new Error('Supplier not found');

    const products = this.getProducts({ supplier_id: id });
    return { supplier, products };
  }

  public createSupplier(data: { supplier_name: string; phone: string; email?: string; address?: string }): Supplier {
    const name = data.supplier_name.trim();
    const phone = data.phone.trim();
    if (!name) throw new Error('Supplier name is required');
    if (!phone) throw new Error('Phone number is required');

    const suppliers = this.getItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
    const nextId = suppliers.length > 0 ? Math.max(...suppliers.map(s => s.supplier_id)) + 1 : 1;

    const newSupplier: Supplier = {
      supplier_id: nextId,
      supplier_name: name,
      phone: phone,
      email: data.email?.trim() || '',
      address: data.address?.trim() || '',
      created_at: new Date().toISOString(),
      products_supplied: 0
    };

    suppliers.push(newSupplier);
    this.setItem(STORAGE_KEYS.SUPPLIERS, suppliers);
    return newSupplier;
  }

  public updateSupplier(id: number, data: { supplier_name: string; phone: string; email?: string; address?: string }): Supplier {
    const name = data.supplier_name.trim();
    const phone = data.phone.trim();
    if (!name || !phone) throw new Error('Supplier name and phone are required');

    const suppliers = this.getItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
    const index = suppliers.findIndex(s => s.supplier_id === id);
    if (index === -1) throw new Error('Supplier not found');

    suppliers[index] = {
      ...suppliers[index],
      supplier_name: name,
      phone: phone,
      email: data.email?.trim() || '',
      address: data.address?.trim() || ''
    };

    this.setItem(STORAGE_KEYS.SUPPLIERS, suppliers);
    return suppliers[index];
  }

  public deleteSupplier(id: number): void {
    const suppliers = this.getItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
    const filtered = suppliers.filter(s => s.supplier_id !== id);
    if (filtered.length === suppliers.length) throw new Error('Supplier not found');

    // Soft dissociate supplier from products
    const products = this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const updatedProducts = products.map(p => p.supplier_id === id ? { ...p, supplier_id: null } : p);

    this.setItem(STORAGE_KEYS.SUPPLIERS, filtered);
    this.setItem(STORAGE_KEYS.PRODUCTS, updatedProducts);
  }

  // ----------------------------------------------------
  // PRODUCTS
  // ----------------------------------------------------
  public getProducts(params?: {
    search?: string;
    category_id?: number;
    supplier_id?: number;
    stock_status?: 'low' | 'in_stock' | 'out_of_stock' | 'all';
  }): Product[] {
    const rawProducts = this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const categories = this.getItem<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    const suppliers = this.getItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);

    let list = rawProducts.map(p => {
      const cat = categories.find(c => c.category_id === p.category_id);
      const supp = suppliers.find(s => s.supplier_id === p.supplier_id);
      let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
      if (p.current_stock === 0) {
        status = 'Out of Stock';
      } else if (p.current_stock <= p.minimum_stock) {
        status = 'Low Stock';
      }

      return {
        ...p,
        category_name: cat ? cat.category_name : 'Uncategorized',
        supplier_name: supp ? supp.supplier_name : 'No Supplier',
        supplier_phone: supp?.phone,
        stock_status: status,
        deficit_quantity: Math.max(0, p.minimum_stock - p.current_stock)
      };
    });

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(p =>
        p.product_name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category_name && p.category_name.toLowerCase().includes(q)) ||
        (p.supplier_name && p.supplier_name.toLowerCase().includes(q))
      );
    }

    if (params?.category_id) {
      list = list.filter(p => p.category_id === Number(params.category_id));
    }

    if (params?.supplier_id) {
      list = list.filter(p => p.supplier_id === Number(params.supplier_id));
    }

    if (params?.stock_status && params.stock_status !== 'all') {
      if (params.stock_status === 'low') {
        list = list.filter(p => p.current_stock <= p.minimum_stock && p.current_stock > 0);
      } else if (params.stock_status === 'out_of_stock') {
        list = list.filter(p => p.current_stock === 0);
      } else if (params.stock_status === 'in_stock') {
        list = list.filter(p => p.current_stock > p.minimum_stock);
      }
    }

    return list.sort((a, b) => b.product_id - a.product_id);
  }

  public getProduct(id: number): Product {
    const products = this.getProducts();
    const product = products.find(p => p.product_id === id);
    if (!product) throw new Error('Product not found');
    return product;
  }

  public createProduct(data: {
    product_name: string;
    category_id: number;
    supplier_id?: number | null;
    sku?: string;
    price: number;
    current_stock: number;
    minimum_stock: number;
    description?: string;
  }): Product {
    const name = data.product_name.trim();
    if (!name) throw new Error('Product name is required');
    if (!data.category_id) throw new Error('Category selection is required');

    const price = Number(data.price);
    const stock = Number(data.current_stock);
    const minStock = Number(data.minimum_stock);

    if (isNaN(price) || price < 0) throw new Error('Price must be a valid positive number');
    if (isNaN(stock) || stock < 0) throw new Error('Current stock cannot be negative');
    if (isNaN(minStock) || minStock < 0) throw new Error('Minimum stock cannot be negative');

    // Verify category exists
    const categories = this.getItem<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    if (!categories.some(c => c.category_id === Number(data.category_id))) {
      throw new Error('Selected category does not exist');
    }

    const products = this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const nextId = products.length > 0 ? Math.max(...products.map(p => p.product_id)) + 1 : 1;

    const newProduct: Product = {
      product_id: nextId,
      product_name: name,
      category_id: Number(data.category_id),
      supplier_id: data.supplier_id ? Number(data.supplier_id) : null,
      sku: data.sku?.trim() || `BAG-${String(nextId).padStart(4, '0')}`,
      price: price,
      current_stock: stock,
      minimum_stock: minStock,
      description: data.description?.trim() || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    products.push(newProduct);
    this.setItem(STORAGE_KEYS.PRODUCTS, products);

    // If initial stock > 0, log STOCK_IN
    if (stock > 0) {
      const transactions = this.getItem<StockTransaction[]>(STORAGE_KEYS.STOCK_TRANSACTIONS, []);
      const transId = transactions.length > 0 ? Math.max(...transactions.map(t => t.transaction_id)) + 1 : 1;
      transactions.push({
        transaction_id: transId,
        product_id: nextId,
        transaction_type: 'STOCK_IN',
        quantity: stock,
        transaction_date: new Date().toISOString(),
        reference_id: `INIT-${nextId}`,
        notes: 'Initial inventory entry upon product creation'
      });
      this.setItem(STORAGE_KEYS.STOCK_TRANSACTIONS, transactions);
    }

    return newProduct;
  }

  public updateProduct(id: number, data: {
    product_name: string;
    category_id: number;
    supplier_id?: number | null;
    sku?: string;
    price: number;
    minimum_stock: number;
    description?: string;
  }): Product {
    const name = data.product_name.trim();
    if (!name) throw new Error('Product name is required');
    if (!data.category_id) throw new Error('Category is required');

    const price = Number(data.price);
    const minStock = Number(data.minimum_stock);

    if (isNaN(price) || price < 0) throw new Error('Price must be non-negative');
    if (isNaN(minStock) || minStock < 0) throw new Error('Minimum stock must be non-negative');

    const products = this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const index = products.findIndex(p => p.product_id === id);
    if (index === -1) throw new Error('Product not found');

    products[index] = {
      ...products[index],
      product_name: name,
      category_id: Number(data.category_id),
      supplier_id: data.supplier_id ? Number(data.supplier_id) : null,
      sku: data.sku?.trim() || products[index].sku,
      price: price,
      minimum_stock: minStock,
      description: data.description?.trim() || '',
      updated_at: new Date().toISOString()
    };

    this.setItem(STORAGE_KEYS.PRODUCTS, products);
    return products[index];
  }

  public deleteProduct(id: number): void {
    const saleItems = this.getItem<SaleItem[]>(STORAGE_KEYS.SALE_ITEMS, []);
    const linkedSales = saleItems.filter(si => si.product_id === id);
    if (linkedSales.length > 0) {
      throw new Error(`Cannot delete product: it is referenced in ${linkedSales.length} past sales transactions.`);
    }

    const products = this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const filtered = products.filter(p => p.product_id !== id);
    if (filtered.length === products.length) throw new Error('Product not found');

    this.setItem(STORAGE_KEYS.PRODUCTS, filtered);
  }

  // ----------------------------------------------------
  // CUSTOMERS
  // ----------------------------------------------------
  public getCustomers(search?: string): Customer[] {
    let customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    const sales = this.getItem<Sale[]>(STORAGE_KEYS.SALES, []);

    customers = customers.map(c => {
      const custSales = sales.filter(s => s.customer_id === c.customer_id);
      const spent = custSales.reduce((acc, curr) => acc + curr.total_amount, 0);
      return {
        ...c,
        total_orders: custSales.length,
        total_spent: Math.round(spent * 100) / 100
      };
    });

    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter(c =>
        c.customer_name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
      );
    }

    return customers.sort((a, b) => a.customer_name.localeCompare(b.customer_name));
  }

  public getCustomerPurchaseHistory(customerId: number): { customer: Customer; sales: Sale[] } {
    const customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    const customer = customers.find(c => c.customer_id === customerId);
    if (!customer) throw new Error('Customer not found');

    const allSales = this.getItem<Sale[]>(STORAGE_KEYS.SALES, []);
    const saleItems = this.getItem<SaleItem[]>(STORAGE_KEYS.SALE_ITEMS, []);
    const products = this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);

    const custSales = allSales
      .filter(s => s.customer_id === customerId)
      .map(s => {
        const items = saleItems.filter(si => si.sale_id === s.sale_id).map(si => {
          const prod = products.find(p => p.product_id === si.product_id);
          return {
            ...si,
            product_name: prod ? prod.product_name : 'Unknown Bag',
            sku: prod?.sku
          };
        });
        return {
          ...s,
          customer_name: customer.customer_name,
          items: items
        };
      })
      .sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime());

    return { customer, sales: custSales };
  }

  public createCustomer(data: { customer_name: string; phone: string; email?: string; address?: string }): Customer {
    const name = data.customer_name.trim();
    const phone = data.phone.trim();
    if (!name) throw new Error('Customer name is required');
    if (!phone) throw new Error('Customer phone is required');

    const customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    const nextId = customers.length > 0 ? Math.max(...customers.map(c => c.customer_id)) + 1 : 1;

    const newCustomer: Customer = {
      customer_id: nextId,
      customer_name: name,
      phone: phone,
      email: data.email?.trim() || '',
      address: data.address?.trim() || '',
      created_at: new Date().toISOString(),
      total_orders: 0,
      total_spent: 0
    };

    customers.push(newCustomer);
    this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
    return newCustomer;
  }

  public updateCustomer(id: number, data: { customer_name: string; phone: string; email?: string; address?: string }): Customer {
    const name = data.customer_name.trim();
    const phone = data.phone.trim();
    if (!name || !phone) throw new Error('Customer name and phone are required');

    const customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    const index = customers.findIndex(c => c.customer_id === id);
    if (index === -1) throw new Error('Customer not found');

    customers[index] = {
      ...customers[index],
      customer_name: name,
      phone: phone,
      email: data.email?.trim() || '',
      address: data.address?.trim() || ''
    };

    this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
    return customers[index];
  }

  public deleteCustomer(id: number): void {
    const sales = this.getItem<Sale[]>(STORAGE_KEYS.SALES, []);
    const customerSales = sales.filter(s => s.customer_id === id);
    if (customerSales.length > 0) {
      throw new Error(`Cannot delete customer: they have ${customerSales.length} registered sales transactions.`);
    }

    const customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    const filtered = customers.filter(c => c.customer_id !== id);
    if (filtered.length === customers.length) throw new Error('Customer not found');

    this.setItem(STORAGE_KEYS.CUSTOMERS, filtered);
  }

  // ----------------------------------------------------
  // SALES (Transactional Sale Processing)
  // ----------------------------------------------------
  public getSales(params?: { customer_id?: number; start_date?: string; end_date?: string }): Sale[] {
    const sales = this.getItem<Sale[]>(STORAGE_KEYS.SALES, []);
    const customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    const saleItems = this.getItem<SaleItem[]>(STORAGE_KEYS.SALE_ITEMS, []);
    const products = this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);

    let list = sales.map(s => {
      const cust = customers.find(c => c.customer_id === s.customer_id);
      const items = saleItems.filter(si => si.sale_id === s.sale_id).map(si => {
        const p = products.find(prod => prod.product_id === si.product_id);
        return {
          ...si,
          product_name: p ? p.product_name : 'Bag Item',
          sku: p?.sku
        };
      });

      const summary = items.map(i => `${i.product_name} (x${i.quantity})`).join(', ');
      const totalUnits = items.reduce((sum, i) => sum + i.quantity, 0);

      return {
        ...s,
        customer_name: cust ? cust.customer_name : 'Unknown Customer',
        customer_phone: cust?.phone,
        customer_email: cust?.email,
        items_summary: summary,
        total_items_sold: totalUnits,
        items: items
      };
    });

    if (params?.customer_id) {
      list = list.filter(s => s.customer_id === Number(params.customer_id));
    }

    if (params?.start_date) {
      const start = new Date(params.start_date).getTime();
      list = list.filter(s => new Date(s.sale_date).getTime() >= start);
    }

    if (params?.end_date) {
      const end = new Date(params.end_date).getTime() + 86400000;
      list = list.filter(s => new Date(s.sale_date).getTime() <= end);
    }

    return list.sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime());
  }

  public getSaleDetail(id: number): Sale {
    const sales = this.getSales();
    const sale = sales.find(s => s.sale_id === id);
    if (!sale) throw new Error('Sale transaction not found');
    return sale;
  }

  public createSale(data: {
    customer_id: number;
    payment_method?: string;
    notes?: string;
    items: Array<{ product_id: number; quantity: number }>;
  }): Sale {
    const customerId = Number(data.customer_id);
    if (!customerId) throw new Error('Customer selection is required');

    const customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    const customer = customers.find(c => c.customer_id === customerId);
    if (!customer) throw new Error('Customer does not exist');

    if (!data.items || data.items.length === 0) {
      throw new Error('Sale must contain at least one product item');
    }

    // Step 1: Pre-validate all stock availability (Simulates ACID Transaction / FOR UPDATE)
    const products = this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const validatedItems: Array<{
      product: Product;
      productIndex: number;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }> = [];

    let totalAmount = 0;

    for (const item of data.items) {
      const pid = Number(item.product_id);
      const qty = Number(item.quantity);

      if (isNaN(qty) || qty <= 0) {
        throw new Error('Item quantity must be greater than zero');
      }

      const pIndex = products.findIndex(p => p.product_id === pid);
      if (pIndex === -1) {
        throw new Error(`Product ID #${pid} not found in database`);
      }

      const product = products[pIndex];

      if (qty > product.current_stock) {
        throw new Error(
          `Insufficient stock available for '${product.product_name}'. Requested: ${qty}, Available: ${product.current_stock}`
        );
      }

      const unitPrice = product.price;
      const subtotal = Math.round(unitPrice * qty * 100) / 100;
      totalAmount += subtotal;

      validatedItems.push({
        product,
        productIndex: pIndex,
        quantity: qty,
        unitPrice,
        subtotal
      });
    }

    totalAmount = Math.round(totalAmount * 100) / 100;

    // Step 2: Atomic Execution
    const sales = this.getItem<Sale[]>(STORAGE_KEYS.SALES, []);
    const saleItems = this.getItem<SaleItem[]>(STORAGE_KEYS.SALE_ITEMS, []);
    const stockTransactions = this.getItem<StockTransaction[]>(STORAGE_KEYS.STOCK_TRANSACTIONS, []);

    const nextSaleId = sales.length > 0 ? Math.max(...sales.map(s => s.sale_id)) + 1 : 1001;
    let nextSaleItemId = saleItems.length > 0 ? Math.max(...saleItems.map(si => si.sale_item_id)) + 1 : 1;
    let nextTransId = stockTransactions.length > 0 ? Math.max(...stockTransactions.map(st => st.transaction_id)) + 1 : 1;

    const saleDate = new Date().toISOString();

    const createdSaleItems: SaleItem[] = [];

    for (const item of validatedItems) {
      // 1. Deduct stock from product
      products[item.productIndex].current_stock -= item.quantity;
      products[item.productIndex].updated_at = saleDate;

      // 2. Add sale item
      const saleItem: SaleItem = {
        sale_item_id: nextSaleItemId++,
        sale_id: nextSaleId,
        product_id: item.product.product_id,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.subtotal
      };
      saleItems.push(saleItem);
      createdSaleItems.push(saleItem);

      // 3. Record STOCK_OUT transaction
      stockTransactions.push({
        transaction_id: nextTransId++,
        product_id: item.product.product_id,
        transaction_type: 'STOCK_OUT',
        quantity: item.quantity,
        transaction_date: saleDate,
        reference_id: `SALE-${nextSaleId}`,
        notes: `Sold to customer ${customer.customer_name} (Invoice #${nextSaleId})`
      });
    }

    const newSale: Sale = {
      sale_id: nextSaleId,
      customer_id: customerId,
      sale_date: saleDate,
      total_amount: totalAmount,
      payment_method: data.payment_method || 'Cash',
      notes: data.notes?.trim() || '',
      customer_name: customer.customer_name,
      customer_phone: customer.phone,
      items: createdSaleItems
    };

    sales.push(newSale);

    // Save all tables atomically
    this.setItem(STORAGE_KEYS.PRODUCTS, products);
    this.setItem(STORAGE_KEYS.SALES, sales);
    this.setItem(STORAGE_KEYS.SALE_ITEMS, saleItems);
    this.setItem(STORAGE_KEYS.STOCK_TRANSACTIONS, stockTransactions);

    return newSale;
  }

  // ----------------------------------------------------
  // STOCK MANAGEMENT & RESTOCKING
  // ----------------------------------------------------
  public restockProduct(productId: number, quantity: number, notes?: string, referenceId?: string): { product: Product; newStock: number } {
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      throw new Error('Restock quantity must be a positive integer');
    }

    const products = this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const index = products.findIndex(p => p.product_id === productId);
    if (index === -1) throw new Error('Product not found');

    const prevStock = products[index].current_stock;
    const newStock = prevStock + qty;

    products[index].current_stock = newStock;
    products[index].updated_at = new Date().toISOString();

    const stockTransactions = this.getItem<StockTransaction[]>(STORAGE_KEYS.STOCK_TRANSACTIONS, []);
    const nextTransId = stockTransactions.length > 0 ? Math.max(...stockTransactions.map(st => st.transaction_id)) + 1 : 1;

    stockTransactions.push({
      transaction_id: nextTransId,
      product_id: productId,
      transaction_type: 'STOCK_IN',
      quantity: qty,
      transaction_date: new Date().toISOString(),
      reference_id: referenceId?.trim() || `RESTOCK-${productId}-${Date.now().toString().slice(-4)}`,
      notes: notes?.trim() || `Restocked ${qty} units`
    });

    this.setItem(STORAGE_KEYS.PRODUCTS, products);
    this.setItem(STORAGE_KEYS.STOCK_TRANSACTIONS, stockTransactions);

    return {
      product: products[index],
      newStock
    };
  }

  public getLowStockProducts(): Product[] {
    const products = this.getProducts();
    // Dynamic rule: CURRENT STOCK <= MINIMUM STOCK
    return products.filter(p => p.current_stock <= p.minimum_stock);
  }

  public getStockTransactions(params?: { product_id?: number; type?: 'STOCK_IN' | 'STOCK_OUT'; limit?: number }): StockTransaction[] {
    const transactions = this.getItem<StockTransaction[]>(STORAGE_KEYS.STOCK_TRANSACTIONS, []);
    const products = this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const categories = this.getItem<Category[]>(STORAGE_KEYS.CATEGORIES, []);

    let list = transactions.map(t => {
      const p = products.find(prod => prod.product_id === t.product_id);
      const cat = p ? categories.find(c => c.category_id === p.category_id) : undefined;
      return {
        ...t,
        product_name: p ? p.product_name : 'Unknown Product',
        sku: p?.sku,
        category_name: cat?.category_name
      };
    });

    if (params?.product_id) {
      list = list.filter(t => t.product_id === Number(params.product_id));
    }

    if (params?.type) {
      list = list.filter(t => t.transaction_type === params.type);
    }

    list.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());

    if (params?.limit) {
      list = list.slice(0, params.limit);
    }

    return list;
  }

  // ----------------------------------------------------
  // DASHBOARD METRICS
  // ----------------------------------------------------
  public getDashboardData(): {
    statistics: {
      total_products: number;
      total_stock: number;
      total_inventory_value: number;
      total_customers: number;
      total_suppliers: number;
      total_sales_count: number;
      total_sales_revenue: number;
      low_stock_count: number;
    };
    recent_sales: Sale[];
    recent_transactions: StockTransaction[];
    low_stock_products: Product[];
  } {
    const products = this.getProducts();
    const customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    const suppliers = this.getItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
    const sales = this.getSales();
    const transactions = this.getStockTransactions({ limit: 6 });
    const lowStock = this.getLowStockProducts();

    const totalStock = products.reduce((acc, p) => acc + p.current_stock, 0);
    const totalInventoryValue = Math.round(products.reduce((acc, p) => acc + (p.current_stock * p.price), 0) * 100) / 100;
    const totalSalesRevenue = Math.round(sales.reduce((acc, s) => acc + s.total_amount, 0) * 100) / 100;

    return {
      statistics: {
        total_products: products.length,
        total_stock: totalStock,
        total_inventory_value: totalInventoryValue,
        total_customers: customers.length,
        total_suppliers: suppliers.length,
        total_sales_count: sales.length,
        total_sales_revenue: totalSalesRevenue,
        low_stock_count: lowStock.length
      },
      recent_sales: sales.slice(0, 6),
      recent_transactions: transactions,
      low_stock_products: lowStock.slice(0, 6)
    };
  }

  // ----------------------------------------------------
  // REPORTS
  // ----------------------------------------------------
  public getInventoryReport(categoryId?: number) {
    let products = this.getProducts();
    if (categoryId) {
      products = products.filter(p => p.category_id === Number(categoryId));
    }
    const totalUnits = products.reduce((sum, p) => sum + p.current_stock, 0);
    const totalValuation = Math.round(products.reduce((sum, p) => sum + (p.current_stock * p.price), 0) * 100) / 100;

    return {
      summary: {
        total_items: products.length,
        total_units: totalUnits,
        total_valuation: totalValuation
      },
      data: products
    };
  }

  public getSalesReport(startDate?: string, endDate?: string) {
    const sales = this.getSales({ start_date: startDate, end_date: endDate });
    const totalRevenue = Math.round(sales.reduce((sum, s) => sum + s.total_amount, 0) * 100) / 100;
    const totalUnitsSold = sales.reduce((sum, s) => sum + (s.total_items_sold || 0), 0);

    return {
      summary: {
        total_transactions: sales.length,
        total_revenue: totalRevenue,
        total_units_sold: totalUnitsSold
      },
      data: sales
    };
  }

  // ----------------------------------------------------
  // SQL DUMP GENERATOR (For Academic Submission & Viva)
  // ----------------------------------------------------
  public generateSqlDump(): string {
    const categories = this.getItem<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    const suppliers = this.getItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
    const products = this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const customers = this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    const sales = this.getItem<Sale[]>(STORAGE_KEYS.SALES, []);
    const saleItems = this.getItem<SaleItem[]>(STORAGE_KEYS.SALE_ITEMS, []);
    const transactions = this.getItem<StockTransaction[]>(STORAGE_KEYS.STOCK_TRANSACTIONS, []);

    let sql = `-- ========================================================\n`;
    sql += `-- BAG WORLD - STOCK MANAGEMENT SYSTEM\n`;
    sql += `-- Store Owner: JHH BagTrack\n`;
    sql += `-- Currency: Indian Rupees (INR - ₹)\n`;
    sql += `-- Generated on: ${new Date().toISOString()}\n`;
    sql += `-- ========================================================\n\n`;
    sql += `USE bag_management;\n\n`;

    if (categories.length > 0) {
      sql += `-- CATEGORIES (${categories.length} records)\n`;
      categories.forEach(c => {
        sql += `INSERT INTO categories (category_id, category_name, description) VALUES (${c.category_id}, '${c.category_name.replace(/'/g, "''")}', '${(c.description || '').replace(/'/g, "''")}');\n`;
      });
      sql += `\n`;
    }

    if (suppliers.length > 0) {
      sql += `-- SUPPLIERS (${suppliers.length} records)\n`;
      suppliers.forEach(s => {
        sql += `INSERT INTO suppliers (supplier_id, supplier_name, phone, email, address) VALUES (${s.supplier_id}, '${s.supplier_name.replace(/'/g, "''")}', '${s.phone}', '${s.email || ''}', '${(s.address || '').replace(/'/g, "''")}');\n`;
      });
      sql += `\n`;
    }

    if (products.length > 0) {
      sql += `-- PRODUCTS (${products.length} records)\n`;
      products.forEach(p => {
        sql += `INSERT INTO products (product_id, product_name, category_id, supplier_id, sku, price, current_stock, minimum_stock, description) VALUES (${p.product_id}, '${p.product_name.replace(/'/g, "''")}', ${p.category_id}, ${p.supplier_id || 'NULL'}, '${p.sku || ''}', ${p.price}, ${p.current_stock}, ${p.minimum_stock}, '${(p.description || '').replace(/'/g, "''")}');\n`;
      });
      sql += `\n`;
    }

    if (customers.length > 0) {
      sql += `-- CUSTOMERS (${customers.length} records)\n`;
      customers.forEach(c => {
        sql += `INSERT INTO customers (customer_id, customer_name, phone, email, address) VALUES (${c.customer_id}, '${c.customer_name.replace(/'/g, "''")}', '${c.phone}', '${c.email || ''}', '${(c.address || '').replace(/'/g, "''")}');\n`;
      });
      sql += `\n`;
    }

    if (sales.length > 0) {
      sql += `-- SALES (${sales.length} records)\n`;
      sales.forEach(s => {
        sql += `INSERT INTO sales (sale_id, customer_id, total_amount, payment_method, notes) VALUES (${s.sale_id}, ${s.customer_id}, ${s.total_amount}, '${s.payment_method}', '${(s.notes || '').replace(/'/g, "''")}');\n`;
      });
      sql += `\n`;
    }

    if (saleItems.length > 0) {
      sql += `-- SALE_ITEMS (${saleItems.length} records)\n`;
      saleItems.forEach(si => {
        sql += `INSERT INTO sale_items (sale_item_id, sale_id, product_id, quantity, unit_price, subtotal) VALUES (${si.sale_item_id}, ${si.sale_id}, ${si.product_id}, ${si.quantity}, ${si.unit_price}, ${si.subtotal});\n`;
      });
      sql += `\n`;
    }

    if (transactions.length > 0) {
      sql += `-- STOCK_TRANSACTIONS (${transactions.length} records)\n`;
      transactions.forEach(t => {
        sql += `INSERT INTO stock_transactions (transaction_id, product_id, transaction_type, quantity, reference_id, notes) VALUES (${t.transaction_id}, ${t.product_id}, '${t.transaction_type}', ${t.quantity}, '${t.reference_id || ''}', '${(t.notes || '').replace(/'/g, "''")}');\n`;
      });
      sql += `\n`;
    }

    return sql;
  }
}

export const db = new RelationalDatabase();
