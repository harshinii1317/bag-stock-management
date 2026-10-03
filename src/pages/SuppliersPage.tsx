import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Edit2, Trash2, Phone, Mail, MapPin, Package, Eye, X } from 'lucide-react';
import { api } from '../services/api';
import { Supplier, Product } from '../types';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';

interface SuppliersPageProps {
  onRefreshGlobal?: () => void;
}

export const SuppliersPage: React.FC<SuppliersPageProps> = ({ onRefreshGlobal }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [viewSupplierData, setViewSupplierData] = useState<{ supplier: Supplier; products: Product[] } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    supplier_name: '',
    phone: '',
    email: '',
    address: ''
  });

  const { showToast } = useToast();

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.getSuppliers(search);
      setSuppliers(res.data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load suppliers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplier_name.trim() || !formData.phone.trim()) {
      showToast('Supplier name and phone are required', 'warning');
      return;
    }

    try {
      const res = await api.createSupplier(formData);
      showToast(res.message, 'success');
      setIsAddOpen(false);
      setFormData({ supplier_name: '', phone: '', email: '', address: '' });
      loadSuppliers();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      showToast(err.message || 'Failed to register supplier', 'error');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSupplier || !editSupplier.supplier_name.trim() || !editSupplier.phone.trim()) return;

    try {
      const res = await api.updateSupplier(editSupplier.supplier_id, {
        supplier_name: editSupplier.supplier_name,
        phone: editSupplier.phone,
        email: editSupplier.email,
        address: editSupplier.address
      });
      showToast(res.message, 'success');
      setEditSupplier(null);
      loadSuppliers();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      showToast(err.message || 'Failed to update supplier', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      const res = await api.deleteSupplier(deleteTarget.supplier_id);
      showToast(res.message, 'success');
      setDeleteTarget(null);
      loadSuppliers();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete supplier', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleView = async (id: number) => {
    try {
      const res = await api.getSupplier(id);
      setViewSupplierData(res.data);
    } catch (err: any) {
      showToast(err.message || 'Failed to view supplier details', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Suppliers & Artisan Network
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage tanneries, hardware distributors, and manufacturing partners
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({ supplier_name: '', phone: '', email: '', address: '' });
            setIsAddOpen(true);
          }}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Register New Supplier
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search suppliers by name, phone, email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center">
            <div className="w-8 h-8 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Querying suppliers from database...</p>
          </div>
        ) : suppliers.length > 0 ? (
          suppliers.map(s => (
            <div
              key={s.supplier_id}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{s.supplier_name}</h3>
                      <span className="text-[10px] font-mono text-slate-400">Vendor #{s.supplier_id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleView(s.supplier_id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="View Products Supplied"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditSupplier(s)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(s)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mt-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800">{s.phone}</span>
                  </div>
                  {s.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{s.email}</span>
                    </div>
                  )}
                  {s.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-slate-500 line-clamp-1">{s.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Products supplied:</span>
                <button
                  onClick={() => handleView(s.supplier_id)}
                  className="font-bold px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 text-[11px] flex items-center gap-1.5 transition-colors"
                >
                  <Package className="w-3 h-3 text-amber-600" />
                  {s.products_supplied ?? 0} Models
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No suppliers registered</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Add your manufacturing suppliers, leather tanners, and accessory vendors.
            </p>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register New Supplier"
        subtitle="Add vendor details to the MySQL suppliers table"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Supplier / Company Name *
            </label>
            <input
              type="text"
              required
              value={formData.supplier_name}
              onChange={e => setFormData({ ...formData, supplier_name: e.target.value })}
              placeholder="e.g. Milano Leather Artisans Ltd."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 019-2831"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="vendor@company.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Office / Tannery Address
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full address, city, country..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20"
            >
              Save Supplier
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      {editSupplier && (
        <Modal
          isOpen={!!editSupplier}
          onClose={() => setEditSupplier(null)}
          title={`Edit Supplier #${editSupplier.supplier_id}`}
          maxWidth="md"
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Supplier Name *
              </label>
              <input
                type="text"
                required
                value={editSupplier.supplier_name}
                onChange={e => setEditSupplier({ ...editSupplier, supplier_name: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={editSupplier.phone}
                  onChange={e => setEditSupplier({ ...editSupplier, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editSupplier.email || ''}
                  onChange={e => setEditSupplier({ ...editSupplier, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Address
              </label>
              <textarea
                rows={2}
                value={editSupplier.address || ''}
                onChange={e => setEditSupplier({ ...editSupplier, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditSupplier(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md"
              >
                Update Supplier
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW SUPPLIER & PRODUCTS MODAL */}
      {viewSupplierData && (
        <Modal
          isOpen={!!viewSupplierData}
          onClose={() => setViewSupplierData(null)}
          title={viewSupplierData.supplier.supplier_name}
          subtitle={`Vendor #${viewSupplierData.supplier.supplier_id} · Phone: ${viewSupplierData.supplier.phone}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
              <div><strong>Email:</strong> {viewSupplierData.supplier.email || 'None'}</div>
              <div><strong>Address:</strong> {viewSupplierData.supplier.address || 'None'}</div>
            </div>

            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Products Supplied ({viewSupplierData.products.length})
            </h4>

            {viewSupplierData.products.length > 0 ? (
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-bold text-slate-600">
                    <tr>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                      <th className="py-2.5 px-3 text-center">Current Stock</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewSupplierData.products.map(p => (
                      <tr key={p.product_id}>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{p.product_name}</td>
                        <td className="py-2.5 px-3 text-right font-bold">${p.price.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-center font-bold">{p.current_stock}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.current_stock === 0 ? 'bg-red-100 text-red-700' : p.current_stock <= p.minimum_stock ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {p.stock_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No products are currently mapped to this supplier.
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewSupplierData(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRM */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Supplier"
        message={`Are you sure you want to remove supplier "${deleteTarget?.supplier_name}"?`}
        confirmLabel="Confirm Delete"
        loading={deleteLoading}
      />
    </div>
  );
};
