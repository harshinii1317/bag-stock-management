import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit2, Trash2, Phone, Mail, MapPin, Receipt, X, ShoppingBag } from 'lucide-react';
import { api } from '../services/api';
import { Customer, Sale } from '../types';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { formatINRPlain } from '../utils/format';

interface CustomersPageProps {
  onRefreshGlobal?: () => void;
  onRecordSaleForCustomer?: (customerId: number) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({ onRefreshGlobal, onRecordSaleForCustomer }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [historyData, setHistoryData] = useState<{ customer: Customer; sales: Sale[] } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    address: ''
  });

  const { showToast } = useToast();

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.getCustomers(search);
      setCustomers(res.data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name.trim() || !formData.phone.trim()) {
      showToast('Customer name and phone number are required', 'warning');
      return;
    }

    try {
      const res = await api.createCustomer(formData);
      showToast(res.message, 'success');
      setIsAddOpen(false);
      setFormData({ customer_name: '', phone: '', email: '', address: '' });
      loadCustomers();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      showToast(err.message || 'Failed to add customer', 'error');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustomer || !editCustomer.customer_name.trim() || !editCustomer.phone.trim()) return;

    try {
      const res = await api.updateCustomer(editCustomer.customer_id, {
        customer_name: editCustomer.customer_name,
        phone: editCustomer.phone,
        email: editCustomer.email,
        address: editCustomer.address
      });
      showToast(res.message, 'success');
      setEditCustomer(null);
      loadCustomers();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      showToast(err.message || 'Failed to update customer', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      const res = await api.deleteCustomer(deleteTarget.customer_id);
      showToast(res.message, 'success');
      setDeleteTarget(null);
      loadCustomers();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      showToast(err.message || 'Cannot delete customer with sales history', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewHistory = async (id: number) => {
    try {
      const res = await api.getCustomerPurchaseHistory(id);
      setHistoryData(res);
    } catch (err: any) {
      showToast(err.message || 'Failed to load purchase history', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Customer Directory & CRM
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Maintain customer records, track aggregate spend, and inspect detailed purchase history
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({ customer_name: '', phone: '', email: '', address: '' });
            setIsAddOpen(true);
          }}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Register New Customer
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
            placeholder="Search customers by name, phone, email..."
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

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Querying customer database...</p>
          </div>
        ) : customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 pl-6">Customer ID</th>
                  <th className="py-3.5 px-3">Customer Name</th>
                  <th className="py-3.5 px-3">Contact Details</th>
                  <th className="py-3.5 px-3">Address</th>
                  <th className="py-3.5 px-3 text-center">Orders</th>
                  <th className="py-3.5 px-3 text-right">Total Spent</th>
                  <th className="py-3.5 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map(c => (
                  <tr key={c.customer_id} className="hover:bg-slate-50/80 transition-colors">
                    {/* ID */}
                    <td className="py-3.5 pl-6 font-mono text-xs font-bold text-slate-700">
                      #{c.customer_id}
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-3 font-semibold text-slate-900">
                      {c.customer_name}
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-3 text-xs text-slate-600 space-y-0.5">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {c.phone}
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[160px]">{c.email}</span>
                        </div>
                      )}
                    </td>

                    {/* Address */}
                    <td className="py-3.5 px-3 text-xs text-slate-500 max-w-[180px] truncate">
                      {c.address || <span className="text-slate-300 italic">None</span>}
                    </td>

                    {/* Orders count */}
                    <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                      {c.total_orders ?? 0}
                    </td>

                    {/* Total spent */}
                    <td className="py-3.5 px-3 text-right font-black text-amber-700">
                      {formatINRPlain(c.total_spent)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewHistory(c.customer_id)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="View Purchase History"
                        >
                          <Receipt className="w-3.5 h-3.5 text-amber-600" />
                          <span>History</span>
                        </button>
                        <button
                          onClick={() => setEditCustomer(c)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No customers registered</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Add your retail and wholesale customers to record sales.
            </p>
          </div>
        )}
      </div>

      {/* CREATE CUSTOMER MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register New Customer"
        subtitle="Saves a customer record in the MySQL customers table"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Customer Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.customer_name}
              onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
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
                placeholder="+1 (555) 443-2211"
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
                placeholder="customer@gmail.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Delivery / Billing Address
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street, suite, city, postal code..."
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
              Save Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT CUSTOMER MODAL */}
      {editCustomer && (
        <Modal
          isOpen={!!editCustomer}
          onClose={() => setEditCustomer(null)}
          title={`Edit Customer #${editCustomer.customer_id}`}
          maxWidth="md"
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={editCustomer.customer_name}
                onChange={e => setEditCustomer({ ...editCustomer, customer_name: e.target.value })}
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
                  value={editCustomer.phone}
                  onChange={e => setEditCustomer({ ...editCustomer, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editCustomer.email || ''}
                  onChange={e => setEditCustomer({ ...editCustomer, email: e.target.value })}
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
                value={editCustomer.address || ''}
                onChange={e => setEditCustomer({ ...editCustomer, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditCustomer(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md"
              >
                Update Customer
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW PURCHASE HISTORY MODAL */}
      {historyData && (
        <Modal
          isOpen={!!historyData}
          onClose={() => setHistoryData(null)}
          title={`Purchase History: ${historyData.customer.customer_name}`}
          subtitle={`Customer #${historyData.customer.customer_id} · ${historyData.sales.length} Lifetime Purchases`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Phone:</span>
                <span className="font-semibold text-slate-800">{historyData.customer.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Lifetime Orders:</span>
                <span className="font-bold text-slate-900">{historyData.sales.length}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Total Revenue:</span>
                <span className="font-black text-amber-700 text-sm">
                  {formatINRPlain(historyData.customer.total_spent)}
                </span>
              </div>
            </div>

            {historyData.sales.length > 0 ? (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {historyData.sales.map(sale => (
                  <div key={sale.sale_id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800">Sale #{sale.sale_id}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500">{new Date(sale.sale_date).toLocaleDateString()}</span>
                      </div>
                      <span className="font-black text-amber-700 text-sm">
                        {formatINRPlain(sale.total_amount)}
                      </span>
                    </div>

                    <div className="space-y-1 pt-1">
                      {sale.items?.map(it => (
                        <div key={it.sale_item_id} className="flex justify-between text-slate-600">
                          <span>
                            {it.product_name} <strong className="text-slate-900">×{it.quantity}</strong>
                          </span>
                          <span className="font-semibold text-slate-800">{formatINRPlain(it.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No past purchases recorded for this customer.
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setHistoryData(null)}
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
        title="Delete Customer Record"
        message={`Are you sure you want to delete "${deleteTarget?.customer_name}"? If they have completed sales in the sales table, foreign key constraints will protect data integrity.`}
        confirmLabel="Confirm Delete"
        loading={deleteLoading}
      />
    </div>
  );
};
