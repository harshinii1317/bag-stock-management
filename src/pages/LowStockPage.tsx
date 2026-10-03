import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Boxes,
  Phone,
  RefreshCw,
  Truck,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { Product } from '../types';
import { useToast } from '../components/Toast';
import { formatINRPlain } from '../utils/format';

interface LowStockPageProps {
  onQuickRestock: (product: Product) => void;
}

export const LowStockPage: React.FC<LowStockPageProps> = ({ onQuickRestock }) => {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  const loadLowStock = async () => {
    try {
      setLoading(true);
      const res = await api.getLowStock();
      setLowStockProducts(res.data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch low stock alerts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLowStock();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Low Stock & Critical Inventory Monitor
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
              Rule: Current ≤ Minimum
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time threshold evaluation to prevent bag stock-outs and delivery delays
          </p>
        </div>

        <button
          onClick={loadLowStock}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Status
        </button>
      </div>

      {/* Alert Summary Box */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-red-400 mb-1">
              Automated Reorder Thresholds
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {lowStockProducts.length === 0
                ? 'All Inventory Healthy'
                : `${lowStockProducts.length} Product Models Require Restocking`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              SQL Evaluates: <code className="bg-white/10 px-2 py-0.5 rounded text-amber-300 font-mono text-xs">WHERE current_stock &lt;= minimum_stock</code> dynamically without redundant storage.
            </p>
          </div>
        </div>

        {lowStockProducts.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/15 text-center shrink-0">
            <div className="text-xs text-slate-300 font-medium">Total Units Deficit:</div>
            <div className="text-3xl font-black text-amber-400 mt-0.5">
              {lowStockProducts.reduce((sum, p) => sum + Math.max(0, p.minimum_stock - p.current_stock), 0)}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Required to reach min</div>
          </div>
        )}
      </div>

      {/* Low Stock Items List */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Scanning inventory thresholds in MySQL...</p>
        </div>
      ) : lowStockProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockProducts.map(p => {
            const isOut = p.current_stock === 0;
            const deficit = Math.max(0, p.minimum_stock - p.current_stock);

            return (
              <div
                key={p.product_id}
                className={`p-5 rounded-3xl border transition-all bg-white shadow-xs flex flex-col justify-between ${
                  isOut ? 'border-red-300 ring-2 ring-red-100' : 'border-amber-200 ring-1 ring-amber-100'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide ${
                          isOut ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950'
                        }`}>
                          {isOut ? 'Out of Stock' : 'Low Stock Alert'}
                        </span>
                        <span className="font-mono text-xs text-slate-400">#{p.product_id}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mt-1.5 truncate">
                        {p.product_name}
                      </h3>
                      <p className="text-xs text-slate-500">{p.category_name} · SKU: {p.sku || 'N/A'}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg font-black text-amber-700">{formatINRPlain(p.price)}</div>
                      <div className="text-[11px] text-slate-400">Retail Price</div>
                    </div>
                  </div>

                  {/* Stock Metrics Progress */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Current Stock:</span>
                      <span className={`font-black text-sm ${isOut ? 'text-red-600' : 'text-amber-800'}`}>
                        {p.current_stock} units
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Minimum Threshold:</span>
                      <span className="font-bold text-slate-700">{p.minimum_stock} units</span>
                    </div>

                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-200">
                      <span className="font-bold text-slate-700">Immediate Deficit:</span>
                      <span className="font-extrabold text-red-600">+{deficit} units needed</span>
                    </div>
                  </div>

                  {/* Supplier info */}
                  {p.supplier_name && (
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-600 px-1">
                      <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                        <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {p.supplier_name}
                      </span>
                      {p.supplier_phone && (
                        <span className="flex items-center gap-1 text-slate-500 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {p.supplier_phone}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Order from supplier</span>
                  <button
                    onClick={() => onQuickRestock(p)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Boxes className="w-3.5 h-3.5 text-emerald-100" />
                    <span>Restock This Bag</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">All Product Levels Adequate!</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Every bag product currently exceeds its minimum inventory threshold.
          </p>
        </div>
      )}
    </div>
  );
};
