import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  PackageCheck,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';
import { Product, StockTransaction } from '../types';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';

interface StockPageProps {
  onRefreshGlobal?: () => void;
  preSelectedProduct?: Product | null;
}

export const StockPage: React.FC<StockPageProps> = ({ onRefreshGlobal, preSelectedProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Restock Form State
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(!!preSelectedProduct);
  const [selectedProductId, setSelectedProductId] = useState<string>(
    preSelectedProduct ? String(preSelectedProduct.product_id) : ''
  );
  const [addedQuantity, setAddedQuantity] = useState<string>('10');
  const [referenceId, setReferenceId] = useState<string>('');
  const [notes, setNotes] = useState<string>('Routine supplier delivery');
  const [submitting, setSubmitting] = useState(false);

  // Filters for Audit Log
  const [transFilter, setTransFilter] = useState<'ALL' | 'STOCK_IN' | 'STOCK_OUT'>('ALL');
  const [searchProduct, setSearchProduct] = useState('');

  const { showToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, transRes] = await Promise.all([
        api.getProducts(),
        api.getStockTransactions()
      ]);
      setProducts(prodRes.data);
      setTransactions(transRes.data);

      if (!selectedProductId && prodRes.data.length > 0) {
        setSelectedProductId(String(prodRes.data[0].product_id));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load stock data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (preSelectedProduct) {
      setSelectedProductId(String(preSelectedProduct.product_id));
      setIsRestockModalOpen(true);
    }
  }, [preSelectedProduct]);

  // Restock calculations
  const targetedProduct = products.find(p => p.product_id === Number(selectedProductId));
  const currentStock = targetedProduct ? targetedProduct.current_stock : 0;
  const numAdded = parseInt(addedQuantity, 10) || 0;
  const projectedStock = currentStock + numAdded;

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      showToast('Please select a product to restock', 'warning');
      return;
    }
    if (numAdded <= 0) {
      showToast('Quantity to restock must be greater than zero', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.restockProduct(
        Number(selectedProductId),
        numAdded,
        notes,
        referenceId
      );

      showToast(res.message, 'success');
      setIsRestockModalOpen(false);
      setAddedQuantity('10');
      setReferenceId('');
      loadData();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      showToast(err.message || 'Failed to restock product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (transFilter !== 'ALL' && t.transaction_type !== transFilter) return false;
    if (searchProduct.trim()) {
      const q = searchProduct.toLowerCase();
      return (
        t.product_name?.toLowerCase().includes(q) ||
        t.reference_id?.toLowerCase().includes(q) ||
        t.notes?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Stock Management & Inbound Restock
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Add inventory batches, audit stock movements, and inspect STOCK_IN / STOCK_OUT ledger
          </p>
        </div>

        <button
          onClick={() => setIsRestockModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Boxes className="w-4 h-4 stroke-[2.5]" />
          Restock Inventory
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Inventory Units
          </span>
          <div className="text-3xl font-black text-slate-900">
            {products.reduce((acc, p) => acc + p.current_stock, 0)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Live aggregated units</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Inbound Restocks (STOCK_IN)
          </span>
          <div className="text-3xl font-black text-emerald-600">
            {transactions.filter(t => t.transaction_type === 'STOCK_IN').length}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Completed supply receipts</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Outbound Sales (STOCK_OUT)
          </span>
          <div className="text-3xl font-black text-amber-700">
            {transactions.filter(t => t.transaction_type === 'STOCK_OUT').length}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Customer order deductions</span>
        </div>
      </div>

      {/* Stock Movement Audit Log */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Stock Transactions Ledger</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable database history maintained in `stock_transactions` table
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter buttons */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                onClick={() => setTransFilter('ALL')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  transFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Movements
              </button>
              <button
                onClick={() => setTransFilter('STOCK_IN')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  transFilter === 'STOCK_IN' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Inbound (+IN)
              </button>
              <button
                onClick={() => setTransFilter('STOCK_OUT')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  transFilter === 'STOCK_OUT' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Outbound (-OUT)
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchProduct}
                onChange={e => setSearchProduct(e.target.value)}
                placeholder="Search audit trail..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium w-48"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Querying stock ledger...</p>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 pl-4">Trans ID</th>
                  <th className="py-3.5 px-3">Product Name</th>
                  <th className="py-3.5 px-3 text-center">Type</th>
                  <th className="py-3.5 px-3 text-center">Quantity</th>
                  <th className="py-3.5 px-3">Reference / Invoice</th>
                  <th className="py-3.5 px-3">Notes</th>
                  <th className="py-3.5 pr-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map(t => {
                  const isIn = t.transaction_type === 'STOCK_IN';
                  return (
                    <tr key={t.transaction_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pl-4 font-mono font-bold text-slate-600">
                        #{t.transaction_id}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-900">
                        {t.product_name}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isIn ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isIn ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {t.transaction_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-black text-sm">
                        <span className={isIn ? 'text-emerald-600' : 'text-amber-700'}>
                          {isIn ? `+${t.quantity}` : `-${t.quantity}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-xs text-slate-600">
                        {t.reference_id || '—'}
                      </td>
                      <td className="py-3.5 px-3 text-xs text-slate-500 max-w-xs truncate">
                        {t.notes || '—'}
                      </td>
                      <td className="py-3.5 pr-4 text-right text-xs text-slate-400 whitespace-nowrap">
                        {new Date(t.transaction_date).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 text-xs">
            No stock movements match the filter criteria.
          </div>
        )}
      </div>

      {/* RESTOCK MODAL */}
      <Modal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        title="Restock Bag Product"
        subtitle="Step 12: Adds inventory units and generates STOCK_IN audit entry"
        maxWidth="md"
      >
        <form onSubmit={handleRestockSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Product *
            </label>
            <select
              required
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="">Select Bag Model</option>
              {products.map(p => (
                <option key={p.product_id} value={p.product_id}>
                  {p.product_name} (Current: {p.current_stock}, Min: {p.minimum_stock})
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Preview Card */}
          {targetedProduct && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Current Stock:</span>
                <span className="font-bold text-slate-900">{currentStock} units</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Units to Add:</span>
                <span className="font-bold text-emerald-600">+{numAdded} units</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-700">New Projected Stock:</span>
                <span className="font-black text-slate-900 text-base">
                  {projectedStock} units
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Quantity to Add *
            </label>
            <input
              type="number"
              min="1"
              required
              value={addedQuantity}
              onChange={e => setAddedQuantity(e.target.value)}
              placeholder="e.g. 25"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                PO / Reference #
              </label>
              <input
                type="text"
                value={referenceId}
                onChange={e => setReferenceId(e.target.value)}
                placeholder="PO-2026-08"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Restock Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Batch shipment arrival"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsRestockModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Committing...</span>
                </>
              ) : (
                <span>Confirm Restock</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
