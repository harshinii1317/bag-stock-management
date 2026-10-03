import React, { useState, useEffect } from 'react';
import {
  FileBarChart2,
  Calendar,
  Layers,
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  Package,
  Boxes,
  Users,
  Search
} from 'lucide-react';
import { api } from '../services/api';
import { Category, Product, Sale } from '../types';
import { useToast } from '../components/Toast';
import { formatINR, formatINRPlain } from '../utils/format';

export const ReportsPage: React.FC = () => {
  const [activeReportTab, setActiveReportTab] = useState<'inventory' | 'sales' | 'customers' | 'transactions'>('inventory');
  const [categories, setCategories] = useState<Category[]>([]);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Report Data States
  const [inventoryReportData, setInventoryReportData] = useState<any>(null);
  const [salesReportData, setSalesReportData] = useState<any>(null);
  const [customerReportData, setCustomerReportData] = useState<any[]>([]);
  const [transactionData, setTransactionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    api.getCategories().then(res => setCategories(res.data)).catch(() => {});
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      if (activeReportTab === 'inventory') {
        const res = await api.getInventoryReport(selectedCategory ? Number(selectedCategory) : undefined);
        setInventoryReportData(res);
      } else if (activeReportTab === 'sales') {
        const res = await api.getSalesReport(startDate || undefined, endDate || undefined);
        setSalesReportData(res);
      } else if (activeReportTab === 'customers') {
        const res = await api.getCustomers();
        setCustomerReportData(res.data);
      } else if (activeReportTab === 'transactions') {
        const res = await api.getStockTransactions();
        setTransactionData(res.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [activeReportTab, selectedCategory, startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Inventory & Management Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            SQL aggregation metrics for inventory valuation, customer lifetime value, and sales revenue
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveReportTab('inventory')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeReportTab === 'inventory'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          📦 Inventory & Valuation Report
        </button>
        <button
          onClick={() => setActiveReportTab('sales')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeReportTab === 'sales'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          💰 Sales & Revenue Report
        </button>
        <button
          onClick={() => setActiveReportTab('customers')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeReportTab === 'customers'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          👥 Customer Lifetime Analysis
        </button>
        <button
          onClick={() => setActiveReportTab('transactions')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeReportTab === 'transactions'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          📋 Stock Movement Audit
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        {activeReportTab === 'inventory' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Filter Category:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {activeReportTab === 'sales' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-xs text-amber-700 font-semibold hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* REPORT CONTENT: INVENTORY */}
      {activeReportTab === 'inventory' && (
        <div className="space-y-4">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold uppercase">Bag Models In Catalog</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {inventoryReportData?.summary?.total_items ?? 0}
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold uppercase">Total Units In Stock</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {inventoryReportData?.summary?.total_units ?? 0}
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold uppercase">Total Inventory Valuation</span>
              <div className="text-2xl font-black text-amber-700 mt-1">
                {formatINR(inventoryReportData?.summary?.total_valuation)}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
              Inventory Breakdown by Product & Valuation
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-right">Unit Price</th>
                    <th className="py-3 px-3 text-center">Stock</th>
                    <th className="py-3 px-4 text-right">Asset Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventoryReportData?.data?.map((p: any) => (
                    <tr key={p.product_id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-800">{p.product_name}</td>
                      <td className="py-3 px-3 text-slate-600">{p.category_name}</td>
                      <td className="py-3 px-3 text-right text-slate-700">{formatINRPlain(p.price)}</td>
                      <td className="py-3 px-3 text-center font-bold text-slate-900">{p.current_stock}</td>
                      <td className="py-3 px-4 text-right font-black text-amber-700">
                        {formatINRPlain(p.current_stock * p.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: SALES */}
      {activeReportTab === 'sales' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold uppercase">Total Transactions</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {salesReportData?.summary?.total_transactions ?? 0}
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold uppercase">Total Units Sold</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {salesReportData?.summary?.total_units_sold ?? 0}
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold uppercase">Total Sales Revenue</span>
              <div className="text-2xl font-black text-amber-700 mt-1">
                {formatINR(salesReportData?.summary?.total_revenue)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
              Detailed Sales Log
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Sale ID</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Items Sold</th>
                    <th className="py-3 px-3">Payment</th>
                    <th className="py-3 px-4 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salesReportData?.data?.map((s: any) => (
                    <tr key={s.sale_id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">#{s.sale_id}</td>
                      <td className="py-3 px-3 text-slate-500">{new Date(s.sale_date).toLocaleDateString()}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{s.customer_name}</td>
                      <td className="py-3 px-3 text-slate-600">{s.items_summary || `${s.total_items_sold} units`}</td>
                      <td className="py-3 px-3 text-slate-700">{s.payment_method}</td>
                      <td className="py-3 px-4 text-right font-black text-amber-700">{formatINRPlain(s.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: CUSTOMERS */}
      {activeReportTab === 'customers' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
            Customer Lifetime Value & Frequency Analysis
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3 text-center">Lifetime Orders</th>
                  <th className="py-3 px-4 text-right">Aggregate Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerReportData.map((c: any) => (
                  <tr key={c.customer_id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">{c.customer_name}</td>
                    <td className="py-3 px-3 text-slate-600">{c.phone}</td>
                    <td className="py-3 px-3 text-slate-500">{c.email || '—'}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">{c.total_orders ?? 0}</td>
                    <td className="py-3 px-4 text-right font-black text-amber-700">
                      {formatINRPlain(c.total_spent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: AUDIT */}
      {activeReportTab === 'transactions' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
            Complete Stock Movement Audit History (STOCK_IN / STOCK_OUT)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Trans ID</th>
                  <th className="py-3 px-3">Product Name</th>
                  <th className="py-3 px-3 text-center">Type</th>
                  <th className="py-3 px-3 text-center">Quantity</th>
                  <th className="py-3 px-3">Ref ID</th>
                  <th className="py-3 px-3">Notes</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactionData.map((t: any) => (
                  <tr key={t.transaction_id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">#{t.transaction_id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{t.product_name}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.transaction_type === 'STOCK_IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {t.transaction_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold">
                      {t.transaction_type === 'STOCK_IN' ? `+${t.quantity}` : `-${t.quantity}`}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-600">{t.reference_id || '—'}</td>
                    <td className="py-3 px-3 text-slate-500 max-w-xs truncate">{t.notes || '—'}</td>
                    <td className="py-3 px-4 text-right text-slate-400">{new Date(t.transaction_date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
