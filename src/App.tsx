import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './components/Toast';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { CustomersPage } from './pages/CustomersPage';
import { SalesPage } from './pages/SalesPage';
import { StockPage } from './pages/StockPage';
import { LowStockPage } from './pages/LowStockPage';
import { ReportsPage } from './pages/ReportsPage';
import { DbmsHubPage } from './pages/DbmsHubPage';
import { ConfirmModal } from './components/ConfirmModal';
import { api } from './services/api';
import { Product, User } from './types';

function MainApp() {
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Cross-page shortcuts
  const [restockTargetProduct, setRestockTargetProduct] = useState<Product | null>(null);
  const [preSelectedCustomerId, setPreSelectedCustomerId] = useState<number | undefined>(undefined);

  // Modals for database state actions
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);

  const { showToast } = useToast();

  // Load session & low stock count
  const refreshGlobalState = async () => {
    try {
      const lowRes = await api.getLowStock();
      setLowStockCount(lowRes.data.length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    api.getSession()
      .then(res => {
        setActiveUser(res.data);
      })
      .catch(() => {
        setActiveUser(null);
      });

    refreshGlobalState();
  }, []);

  const handleLogout = async () => {
    await api.logout();
    setActiveUser(null);
    showToast('Signed out of store terminal', 'info');
  };

  const handleResetData = () => {
    api.resetSampleData();
    setResetModalOpen(false);
    refreshGlobalState();
    showToast('Reloaded sample bag boutique inventory & master data!', 'success');
  };

  const handleClearData = () => {
    api.clearAllData();
    setClearModalOpen(false);
    refreshGlobalState();
    showToast('Cleared all data. Ready for fresh manual user entry!', 'warning');
  };

  const handleExportSql = () => {
    const dump = api.getSqlDump();
    const blob = new Blob([dump], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bag_management_dump_${new Date().toISOString().slice(0, 10)}.sql`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported active database state as SQL file', 'success');
  };

  const handleQuickRestock = (product?: Product) => {
    if (product) {
      setRestockTargetProduct(product);
    }
    setCurrentTab('stock');
  };

  const handleSwitchUser = async (pin: string) => {
    try {
      const res = await api.loginWithPin(pin);
      setActiveUser(res.data);
      showToast(`Switched account to ${res.data.full_name}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to switch account', 'error');
    }
  };

  const handleRecordSaleForCustomer = (customerId: number) => {
    setPreSelectedCustomerId(customerId);
    setCurrentTab('sales');
  };

  // If user is not authenticated, render Login Page
  if (!activeUser) {
    return (
      <LoginPage
        onLoginSuccess={user => {
          setActiveUser(user);
          refreshGlobalState();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lowStockCount={lowStockCount}
        activeUser={activeUser}
        onLogout={handleLogout}
        isOpenMobile={mobileSidebarOpen}
        setIsOpenMobile={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-68">
        {/* Top Navbar */}
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          lowStockCount={lowStockCount}
          activeUser={activeUser}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onQuickAddProduct={() => setCurrentTab('products')}
          onQuickRecordSale={() => setCurrentTab('sales')}
          onResetData={() => setResetModalOpen(true)}
          onClearData={() => setClearModalOpen(true)}
          onExportSql={handleExportSql}
          onSwitchUser={handleSwitchUser}
        />

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              setCurrentTab={setCurrentTab}
              onQuickAddProduct={() => setCurrentTab('products')}
              onQuickAddCustomer={() => setCurrentTab('customers')}
              onQuickRecordSale={() => setCurrentTab('sales')}
              onQuickRestock={handleQuickRestock}
            />
          )}

          {currentTab === 'products' && (
            <ProductsPage
              onQuickRestock={handleQuickRestock}
              onRefreshGlobal={refreshGlobalState}
            />
          )}

          {currentTab === 'categories' && (
            <CategoriesPage onRefreshGlobal={refreshGlobalState} />
          )}

          {currentTab === 'suppliers' && (
            <SuppliersPage onRefreshGlobal={refreshGlobalState} />
          )}

          {currentTab === 'customers' && (
            <CustomersPage
              onRefreshGlobal={refreshGlobalState}
              onRecordSaleForCustomer={handleRecordSaleForCustomer}
            />
          )}

          {currentTab === 'sales' && (
            <SalesPage
              onRefreshGlobal={refreshGlobalState}
              preSelectedCustomerId={preSelectedCustomerId}
            />
          )}

          {currentTab === 'stock' && (
            <StockPage
              onRefreshGlobal={refreshGlobalState}
              preSelectedProduct={restockTargetProduct}
            />
          )}

          {currentTab === 'low_stock' && (
            <LowStockPage onQuickRestock={handleQuickRestock} />
          )}

          {currentTab === 'reports' && (
            <ReportsPage />
          )}

          {currentTab === 'dbms' && (
            <DbmsHubPage />
          )}
        </main>
      </div>

      {/* Confirmation Modals for DBMS State */}
      <ConfirmModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirm={handleResetData}
        title="Reload Sample Bag Shop Data?"
        message="This will re-seed high-grade bag models, categories (Leather, Laptop, Travel, Evening), sample suppliers, customers, and transactions for demonstration and viva review."
        confirmLabel="Load Demo Data"
        confirmVariant="primary"
      />

      <ConfirmModal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        onConfirm={handleClearData}
        title="Clear All Data (Start Empty)?"
        message="This will remove all products, customers, categories, and sales from the database so you can enter everything manually from scratch as required for strict user-input testing."
        confirmLabel="Clear All Data"
        confirmVariant="danger"
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
