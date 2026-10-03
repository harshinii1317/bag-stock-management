import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Boxes,
  Users,
  Truck,
  TrendingUp,
  AlertTriangle,
  Plus,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Receipt,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardData, Product, Sale } from '../types';
import { Modal } from '../components/Modal';
import { formatINR, formatINRPlain } from '../utils/format';

interface DashboardPageProps {
  setCurrentTab: (tab: string) => void;
  onQuickAddProduct: () => void;
  onQuickAddCustomer: () => void;
  onQuickRecordSale: () => void;
  onQuickRestock: (product?: Product) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  setCurrentTab,
  onQuickAddProduct,
  onQuickAddCustomer,
  onQuickRecordSale,
  onQuickRestock
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-700">Loading stock & inventory metrics...</p>
        <p className="text-xs text-slate-400 mt-1">Executing MySQL aggregation queries</p>
      </div>
    );
  }

  const stats = data?.statistics;

  return (
    <div className="space-y-6">
      {/* Top Command Banner with Modern Blue & Green Aurora Aesthetic */}
      <div className="bg-gradient-to-r from-[#071322] via-[#0a233a] to-[#043324] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-500/20">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 via-blue-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bag World Command Center · JHH Store Network · MySQL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
              Inventory & Retail Control Hub
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Managed by <strong className="text-white">JHH Admin</strong>, <strong className="text-emerald-300">JHH stock Manager</strong>, and <strong className="text-teal-300">JHH StaffHub</strong>. Real-time Indian Rupee (₹ INR) stock tracking and POS sales registers.
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onQuickRecordSale}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-blue-200" />
              <span>Record Sale (₹)</span>
            </button>
            <button
              onClick={onQuickAddProduct}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-200" />
              <span>Add Bag Model</span>
            </button>
            <button
              onClick={onQuickAddCustomer}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs backdrop-blur-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4 text-teal-300" />
              <span>Add Customer</span>
            </button>
            <button
              onClick={() => onQuickRestock()}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs backdrop-blur-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Boxes className="w-4 h-4 text-emerald-300" />
              <span>Restock Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Critical Low Stock Warning Banner if any */}
      {stats && stats.low_stock_count > 0 && (
        <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold shadow-md shadow-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-amber-950">
                Low Stock Alert: {stats.low_stock_count} Bag {stats.low_stock_count === 1 ? 'Model' : 'Models'} at or below Minimum Level
              </h3>
              <p className="text-xs text-amber-800/90 mt-0.5 font-medium">
                Current stock ≤ Minimum threshold. JHH stock Manager can restock immediately.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentTab('low_stock')}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Resolve Low Stock</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 6 Statistics Cards with Unified Blue and Green Palette */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Products (Emerald Green) */}
        <div
          onClick={() => setCurrentTab('products')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Products</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 transition-colors">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono tabular-nums">
            {stats?.total_products ?? 0}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            Catalog models
          </div>
        </div>

        {/* Total Stock (Teal) */}
        <div
          onClick={() => setCurrentTab('stock')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Stock</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-100 transition-colors">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono tabular-nums">
            {stats?.total_stock ?? 0}
          </div>
          <div className="text-[11px] text-teal-700 font-semibold mt-1">
            Units across bags
          </div>
        </div>

        {/* Total Sales Revenue (Royal Blue) */}
        <div
          onClick={() => setCurrentTab('sales')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Sales</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-100 transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono tabular-nums">
            {formatINR(stats?.total_sales_revenue)}
          </div>
          <div className="text-[11px] text-blue-700 font-semibold mt-1">
            {stats?.total_sales_count ?? 0} orders registered
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => setCurrentTab('low_stock')}
          className={`p-4 sm:p-5 rounded-2xl border shadow-xs transition-all cursor-pointer group ${
            stats && stats.low_stock_count > 0
              ? 'bg-amber-50/50 border-amber-300 hover:border-amber-400 hover:shadow-md'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Low Stock</span>
            <div className={`p-2 rounded-xl transition-colors ${
              stats && stats.low_stock_count > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black tracking-tight font-mono tabular-nums ${
            stats && stats.low_stock_count > 0 ? 'text-amber-700' : 'text-slate-900'
          }`}>
            {stats?.low_stock_count ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats?.low_stock_count === 0 ? 'All levels healthy' : 'Action required'}
          </div>
        </div>

        {/* Total Customers (Sky/Navy Blue) */}
        <div
          onClick={() => setCurrentTab('customers')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-sky-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Customers</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700 group-hover:bg-sky-100 transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono tabular-nums">
            {stats?.total_customers ?? 0}
          </div>
          <div className="text-[11px] text-sky-700 font-semibold mt-1">
            Registered buyers
          </div>
        </div>

        {/* Total Suppliers (Mint/Forest Jade) */}
        <div
          onClick={() => setCurrentTab('suppliers')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Suppliers</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-100 transition-colors">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono tabular-nums">
            {stats?.total_suppliers ?? 0}
          </div>
          <div className="text-[11px] text-emerald-800 font-semibold mt-1">
            Artisans & vendors
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Sales */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Recent Sales Transactions</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Counter billing entries by JHH StaffHub with immediate stock ledger updates
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('sales')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                <span>View All Sales</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {data?.recent_sales && data.recent_sales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <th className="pb-3 pl-2">Sale ID</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Items Purchased</th>
                      <th className="pb-3 text-right">Total (₹)</th>
                      <th className="pb-3 text-right">Date</th>
                      <th className="pb-3 pr-2 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.recent_sales.map(sale => (
                      <tr key={sale.sale_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 pl-2 font-mono text-xs font-bold text-slate-700 tabular-nums">
                          #{sale.sale_id}
                        </td>
                        <td className="py-3.5 font-medium text-slate-900">
                          {sale.customer_name}
                        </td>
                        <td className="py-3.5 text-xs text-slate-600 max-w-xs truncate">
                          {sale.items_summary || `${sale.total_items_sold || 1} items`}
                        </td>
                        <td className="py-3.5 text-right font-bold text-emerald-700 font-mono tabular-nums">
                          {formatINRPlain(sale.total_amount)}
                        </td>
                        <td className="py-3.5 text-right text-xs text-slate-500 whitespace-nowrap font-mono tabular-nums">
                          {new Date(sale.sale_date).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 pr-2 text-right">
                          <button
                            onClick={() => setSelectedSale(sale)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            title="View Receipt"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                No sales recorded yet. Click &quot;Record Sale&quot; to perform your first transaction!
              </div>
            )}
          </div>

          {/* Recent Stock Movements */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Recent Stock Movements</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ledger of STOCK_IN restocks and STOCK_OUT counter sales
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('stock')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
              >
                <span>Stock Audit</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {data?.recent_transactions && data.recent_transactions.length > 0 ? (
              <div className="space-y-3">
                {data.recent_transactions.map(t => {
                  const isIn = t.transaction_type === 'STOCK_IN';
                  return (
                    <div
                      key={t.transaction_id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs hover:border-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                            isIn ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {isIn ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">
                            {t.product_name}
                          </div>
                          <div className="text-slate-400 text-[11px] truncate flex items-center gap-1.5 mt-0.5">
                            <span>Ref: {t.reference_id || 'N/A'}</span>
                            <span aria-hidden="true">·</span>
                            <span>{t.notes || (isIn ? 'Restock batch' : 'Sold to customer')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div
                          className={`font-black font-mono tabular-nums text-sm ${
                            isIn ? 'text-emerald-700' : 'text-blue-700'
                          }`}
                        >
                          {isIn ? `+${t.quantity}` : `-${t.quantity}`} units
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                          {new Date(t.transaction_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                No inventory transactions logged.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Low Stock Items & Quick Restock */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Low Stock Attention</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Items requiring restock by JHH stock Manager
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('low_stock')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                All Alerts
              </button>
            </div>

            {data?.low_stock_products && data.low_stock_products.length > 0 ? (
              <div className="space-y-3">
                {data.low_stock_products.slice(0, 5).map(prod => {
                  const isOut = prod.current_stock === 0;
                  return (
                    <div
                      key={prod.product_id}
                      className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:border-slate-200 transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-xs truncate">
                            {prod.product_name}
                          </h4>
                          <span className="text-[11px] text-slate-500">
                            {prod.category_name}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            isOut
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isOut ? 'Out of Stock' : `${prod.current_stock} left`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500 text-[11px]">
                          Min: <strong className="font-mono tabular-nums">{prod.minimum_stock}</strong>
                        </span>
                        <button
                          onClick={() => onQuickRestock(prod)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Restock Bag
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500 space-y-1">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-bold text-slate-700">Healthy Stock Levels</p>
                <p className="text-[11px] text-slate-400">All bag models exceed minimum inventory thresholds.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sale Receipt Modal */}
      {selectedSale && (
        <Modal
          isOpen={!!selectedSale}
          onClose={() => setSelectedSale(null)}
          title={`Sale Invoice Receipt #${selectedSale.sale_id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-900">{selectedSale.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment:</span>
                <span className="font-medium text-slate-900">{selectedSale.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-mono tabular-nums text-slate-700">
                  {new Date(selectedSale.sale_date).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-slate-200 pt-2">
                <span>Total Amount:</span>
                <span className="text-emerald-700 font-mono tabular-nums">
                  {formatINRPlain(selectedSale.total_amount)}
                </span>
              </div>
            </div>

            {selectedSale.items && selectedSale.items.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Purchased Bags</h4>
                <div className="space-y-1 divide-y divide-slate-100">
                  {selectedSale.items.map(it => (
                    <div key={it.sale_item_id} className="pt-2 flex justify-between">
                      <div>
                        <div className="font-medium text-slate-800">{it.product_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {it.quantity} × {formatINRPlain(it.unit_price)}
                        </div>
                      </div>
                      <div className="font-bold font-mono tabular-nums text-slate-900">
                        {formatINRPlain(it.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
