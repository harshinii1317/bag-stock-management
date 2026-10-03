import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  CreditCard,
  Receipt,
  User,
  Package,
  Search,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { Customer, Product, Sale } from '../types';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';
import { formatINRPlain } from '../utils/format';

interface SalesPageProps {
  onRefreshGlobal?: () => void;
  preSelectedCustomerId?: number;
}

export const SalesPage: React.FC<SalesPageProps> = ({ onRefreshGlobal, preSelectedCustomerId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // Sale Entry Form State
  const [customerId, setCustomerId] = useState<string>(preSelectedCustomerId ? String(preSelectedCustomerId) : '');
  const [productId, setProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Selected product details
  const selectedProduct = products.find(p => p.product_id === Number(productId));

  // Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState<Sale | null>(null);

  // Search in sales table
  const [salesSearch, setSalesSearch] = useState('');

  const { showToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, custRes, salesRes] = await Promise.all([
        api.getProducts(),
        api.getCustomers(),
        api.getSales()
      ]);
      setProducts(prodRes.data);
      setCustomers(custRes.data);
      setSales(salesRes.data);

      if (!customerId && custRes.data.length > 0) {
        setCustomerId(String(custRes.data[0].customer_id));
      }
      if (!productId && prodRes.data.length > 0) {
        setProductId(String(prodRes.data[0].product_id));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load sales information', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Live Calculations
  const numericQty = parseInt(quantity, 10) || 0;
  const unitPrice = selectedProduct ? selectedProduct.price : 0;
  const availableStock = selectedProduct ? selectedProduct.current_stock : 0;
  const totalAmount = Math.round(unitPrice * numericQty * 100) / 100;

  // Validation Flags
  const isOutOfStock = availableStock === 0;
  const isInsufficientStock = numericQty > availableStock;
  const isInvalidQty = numericQty <= 0;
  const canSubmit = !isInsufficientStock && !isInvalidQty && selectedProduct && customerId && !isOutOfStock;

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      showToast('Please select a customer for this order', 'warning');
      return;
    }
    if (!selectedProduct) {
      showToast('Please select a bag product', 'warning');
      return;
    }
    if (numericQty <= 0) {
      showToast('Quantity must be greater than zero', 'error');
      return;
    }
    if (isInsufficientStock) {
      showToast('Insufficient stock available. Transaction prevented.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createSale({
        customer_id: Number(customerId),
        payment_method: paymentMethod,
        notes: notes,
        items: [{ product_id: selectedProduct.product_id, quantity: numericQty }]
      });

      showToast(res.message, 'success');
      setActiveReceipt(res.data);

      // Reset form
      setQuantity('1');
      setNotes('');

      // Refresh data
      loadData();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      showToast(err.message || 'Sale transaction failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSales = sales.filter(s => {
    if (!salesSearch.trim()) return true;
    const q = salesSearch.toLowerCase();
    return (
      s.customer_name?.toLowerCase().includes(q) ||
      String(s.sale_id).includes(q) ||
      s.items_summary?.toLowerCase().includes(q) ||
      s.payment_method.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Sales & Order Billing Terminal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Process customer bag purchases with transactional stock deduction and ACID guarantees
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Point of Sale Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sticky top-20 space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Record New Sale</h3>
                <p className="text-xs text-slate-400">Step 11 & 12 DBMS Transaction</p>
              </div>
            </div>

            <form onSubmit={handleSaleSubmit} className="space-y-4">
              {/* Customer Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Customer *</span>
                  <span className="text-[11px] text-amber-700 font-semibold lowercase">
                    {customers.length} registered
                  </span>
                </label>
                <select
                  required
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
                >
                  <option value="">Select Customer</option>
                  {customers.map(c => (
                    <option key={c.customer_id} value={c.customer_id}>
                      {c.customer_name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bag Model / Product *
                </label>
                <select
                  required
                  value={productId}
                  onChange={e => setProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
                >
                  <option value="">Select Bag Model</option>
                  {products.map(p => (
                    <option key={p.product_id} value={p.product_id}>
                      {p.product_name} - {formatINRPlain(p.price)} ({p.current_stock} in stock)
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Live Spec Card (Stock & Unit Price) */}
              {selectedProduct && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Selected Bag:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[180px]">
                      {selectedProduct.product_name}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Category:</span>
                    <span className="font-medium text-slate-700">{selectedProduct.category_name}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Unit Retail Price:</span>
                    <span className="font-black text-slate-900 text-sm">
                      {formatINRPlain(selectedProduct.price)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Available In Stock:</span>
                    <span
                      className={`font-black px-2 py-0.5 rounded-full text-xs ${
                        availableStock === 0
                          ? 'bg-red-100 text-red-700'
                          : availableStock <= selectedProduct.minimum_stock
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {availableStock} units available
                    </span>
                  </div>
                </div>
              )}

              {/* Quantity Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quantity to Purchase *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={availableStock > 0 ? availableStock : 1}
                    required
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                      isInsufficientStock
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50/50'
                        : 'border-slate-200 focus:ring-amber-500/20 focus:border-amber-500'
                    }`}
                  />
                  <div className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">
                    units
                  </div>
                </div>
              </div>

              {/* Insufficient Stock Warning Alert */}
              {isInsufficientStock && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <div>
                    <span className="font-bold block">Insufficient stock available!</span>
                    Requested {numericQty} units, but only {availableStock} {availableStock === 1 ? 'unit is' : 'units are'} currently in inventory.
                  </div>
                </div>
              )}

              {isOutOfStock && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span className="font-bold">This bag is completely out of stock! Restock before selling.</span>
                </div>
              )}

              {/* Payment Method & Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="UPI / Bank">UPI / Bank Transfer</option>
                    <option value="Online">Online Gateway</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Gift box"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              {/* Live Total Calculation Card */}
              <div className="p-4 bg-[#071322] rounded-2xl text-white space-y-1.5 border border-blue-900/40 shadow-md">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Calculation:</span>
                  <span className="font-mono tabular-nums">{numericQty} × {formatINRPlain(unitPrice)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-1 border-t border-slate-800">
                  <span className="font-bold text-xs uppercase tracking-wider text-emerald-400">Total Due (₹):</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono tabular-nums">
                    {isNaN(totalAmount) ? '₹0.00' : formatINRPlain(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="w-full py-3 bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 hover:from-blue-500 hover:via-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl text-sm shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing Database Commit...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 text-white" />
                    <span>Process Sale & Deduct Stock</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Complete Sales History Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Sales Transaction Register</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete history of sales receipts and audit trails
                </p>
              </div>

              {/* Search bar */}
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={salesSearch}
                  onChange={e => setSalesSearch(e.target.value)}
                  placeholder="Filter by customer, ID..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-400">Loading sales transactions...</p>
              </div>
            ) : filteredSales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 pl-4">Sale ID</th>
                      <th className="py-3.5 px-3">Customer</th>
                      <th className="py-3.5 px-3">Items Sold</th>
                      <th className="py-3.5 px-3 text-right">Amount</th>
                      <th className="py-3.5 px-3">Date</th>
                      <th className="py-3.5 pr-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSales.map(sale => (
                      <tr key={sale.sale_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 pl-4 font-mono font-bold text-slate-700">
                          #{sale.sale_id}
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-900">
                          {sale.customer_name}
                        </td>
                        <td className="py-3.5 px-3 text-xs text-slate-600 max-w-xs truncate">
                          {sale.items_summary || `${sale.total_items_sold || 1} units`}
                        </td>
                        <td className="py-3.5 px-3 text-right font-black text-amber-700">
                          {formatINRPlain(sale.total_amount)}
                        </td>
                        <td className="py-3.5 px-3 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(sale.sale_date).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 pr-4 text-right">
                          <button
                            onClick={() => setActiveReceipt(sale)}
                            className="p-1.5 text-slate-400 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="View Official Invoice"
                          >
                            <Receipt className="w-4 h-4 text-amber-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs">
                No matching sales transactions found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SALES RECEIPT / INVOICE MODAL */}
      {activeReceipt && (
        <Modal
          isOpen={!!activeReceipt}
          onClose={() => setActiveReceipt(null)}
          title={`Bag World Tax Invoice #${activeReceipt.sale_id}`}
          subtitle={`Store Owner: JHH BagTrack · ${new Date(activeReceipt.sale_date).toLocaleString()}`}
          maxWidth="md"
        >
          <div className="space-y-4" id="printable-receipt">
            {/* Header branding on receipt */}
            <div className="text-center pb-2 border-b border-slate-200">
              <h3 className="font-black text-base text-slate-900 font-serif tracking-tight">
                BAG WORLD
              </h3>
              <p className="text-[11px] text-amber-800 font-bold">Owner: JHH BagTrack</p>
              <p className="text-[10px] text-slate-500">Connaught Place Retail Hub, New Delhi, India</p>
              <p className="text-[10px] text-slate-400 font-mono">GSTIN: 07AABCU9603R1ZM · Pos Reg #01</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Billed To:</span>
                <span className="font-bold text-slate-900">{activeReceipt.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Mode:</span>
                <span className="font-semibold text-slate-700">{activeReceipt.payment_method}</span>
              </div>
              {activeReceipt.notes && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Notes:</span>
                  <span className="text-slate-700">{activeReceipt.notes}</span>
                </div>
              )}
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 font-bold text-slate-600">
                  <tr>
                    <th className="py-2.5 px-3">Bag Model</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Rate</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeReceipt.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{it.product_name}</td>
                      <td className="py-2.5 px-3 text-center font-bold">{it.quantity}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{formatINRPlain(it.unit_price)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatINRPlain(it.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-amber-50/60 font-bold border-t border-slate-200">
                  <tr>
                    <td colSpan={3} className="py-3 px-3 text-right text-slate-700">Net Payable:</td>
                    <td className="py-3 px-3 text-right text-amber-700 font-black text-sm">
                      {formatINRPlain(activeReceipt.total_amount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
              <span className="text-[10px] font-mono">Status: TRANSACTION_COMMITTED</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Print Invoice
                </button>
                <button
                  onClick={() => setActiveReceipt(null)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
