import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Boxes,
  AlertTriangle,
  RefreshCw,
  X,
  PackageCheck,
  Tag
} from 'lucide-react';
import { api } from '../services/api';
import { Category, Product, Supplier } from '../types';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { formatINRPlain } from '../utils/format';

interface ProductsPageProps {
  onQuickRestock: (product: Product) => void;
  onRefreshGlobal?: () => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ onQuickRestock, onRefreshGlobal }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [stockStatus, setStockStatus] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    product_name: '',
    category_id: '',
    supplier_id: '',
    sku: '',
    price: '',
    current_stock: '10',
    minimum_stock: '5',
    description: ''
  });

  const { showToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, suppRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getSuppliers()
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setSuppliers(suppRes.data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = p.product_name.toLowerCase().includes(q);
        const matchesSku = p.sku?.toLowerCase().includes(q);
        const matchesCat = p.category_name?.toLowerCase().includes(q);
        const matchesSupp = p.supplier_name?.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesCat && !matchesSupp) return false;
      }

      // Category filter
      if (selectedCategory && p.category_id !== Number(selectedCategory)) {
        return false;
      }

      // Supplier filter
      if (selectedSupplier && p.supplier_id !== Number(selectedSupplier)) {
        return false;
      }

      // Stock status filter
      if (stockStatus !== 'all') {
        if (stockStatus === 'low' && (p.current_stock > p.minimum_stock || p.current_stock === 0)) return false;
        if (stockStatus === 'out' && p.current_stock !== 0) return false;
        if (stockStatus === 'in_stock' && p.current_stock <= p.minimum_stock) return false;
      }

      return true;
    });
  }, [products, search, selectedCategory, selectedSupplier, stockStatus]);

  // Form Reset
  const resetForm = () => {
    setFormData({
      product_name: '',
      category_id: categories.length > 0 ? String(categories[0].category_id) : '',
      supplier_id: '',
      sku: '',
      price: '',
      current_stock: '10',
      minimum_stock: '5',
      description: ''
    });
  };

  // Open Add Product
  const handleOpenAdd = () => {
    resetForm();
    if (categories.length > 0) {
      setFormData(prev => ({ ...prev, category_id: String(categories[0].category_id) }));
    }
    setIsAddModalOpen(true);
  };

  // Submit Add Product
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product_name.trim()) {
      showToast('Product name is required', 'warning');
      return;
    }
    if (!formData.category_id) {
      showToast('Please select a bag category', 'warning');
      return;
    }

    const price = parseFloat(formData.price);
    const stock = parseInt(formData.current_stock, 10);
    const minStock = parseInt(formData.minimum_stock, 10);

    if (isNaN(price) || price < 0) {
      showToast('Price must be a valid positive number', 'error');
      return;
    }
    if (isNaN(stock) || stock < 0) {
      showToast('Current stock must be non-negative', 'error');
      return;
    }
    if (isNaN(minStock) || minStock < 0) {
      showToast('Minimum stock must be non-negative', 'error');
      return;
    }

    try {
      const res = await api.createProduct({
        product_name: formData.product_name,
        category_id: Number(formData.category_id),
        supplier_id: formData.supplier_id ? Number(formData.supplier_id) : null,
        sku: formData.sku,
        price,
        current_stock: stock,
        minimum_stock: minStock,
        description: formData.description
      });

      showToast(res.message, 'success');
      setIsAddModalOpen(false);
      resetForm();
      loadData();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      showToast(err.message || 'Failed to create product', 'error');
    }
  };

  // Submit Edit Product
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;

    if (!editProduct.product_name.trim()) {
      showToast('Product name is required', 'warning');
      return;
    }
    if (editProduct.price < 0) {
      showToast('Price cannot be negative', 'error');
      return;
    }
    if (editProduct.minimum_stock < 0) {
      showToast('Minimum stock cannot be negative', 'error');
      return;
    }

    try {
      const res = await api.updateProduct(editProduct.product_id, {
        product_name: editProduct.product_name,
        category_id: editProduct.category_id,
        supplier_id: editProduct.supplier_id,
        sku: editProduct.sku,
        price: editProduct.price,
        minimum_stock: editProduct.minimum_stock,
        description: editProduct.description
      });

      showToast(res.message, 'success');
      setEditProduct(null);
      loadData();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      showToast(err.message || 'Failed to update product', 'error');
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deleteProductTarget) return;
    try {
      setDeleteLoading(true);
      const res = await api.deleteProduct(deleteProductTarget.product_id);
      showToast(res.message, 'success');
      setDeleteProductTarget(null);
      loadData();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Bag Product Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage inventory items, pricing, minimum stock thresholds, and suppliers
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add New Bag Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by bag name, SKU..."
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

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
          >
            <option value="">All Bag Categories</option>
            {categories.map(c => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </select>

          {/* Supplier Filter */}
          <select
            value={selectedSupplier}
            onChange={e => setSelectedSupplier(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
          >
            <option value="">All Suppliers</option>
            {suppliers.map(s => (
              <option key={s.supplier_id} value={s.supplier_id}>
                {s.supplier_name}
              </option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select
            value={stockStatus}
            onChange={e => setStockStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">In Stock (Healthy)</option>
            <option value="low">Low Stock (≤ Minimum)</option>
            <option value="out">Out of Stock (0 units)</option>
          </select>
        </div>

        {/* Results counter & active filters clear */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-800">{filteredProducts.length}</strong> of{' '}
            <strong className="text-slate-800">{products.length}</strong> total products
          </span>

          {(search || selectedCategory || selectedSupplier || stockStatus !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
                setSelectedSupplier('');
                setStockStatus('all');
              }}
              className="text-amber-700 hover:text-amber-800 font-bold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Loading catalog from database...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 pl-6">ID & SKU</th>
                  <th className="py-3.5 px-3">Product Name</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Supplier</th>
                  <th className="py-3.5 px-3 text-right">Price</th>
                  <th className="py-3.5 px-3 text-center">Stock / Min</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(p => {
                  const isOutOfStock = p.current_stock === 0;
                  const isLow = p.current_stock <= p.minimum_stock;

                  return (
                    <tr key={p.product_id} className="hover:bg-slate-50/80 transition-colors">
                      {/* ID & SKU */}
                      <td className="py-3.5 pl-6">
                        <div className="font-mono text-xs font-bold text-slate-700">
                          #{p.product_id}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">
                          {p.sku || 'NO-SKU'}
                        </div>
                      </td>

                      {/* Product Name */}
                      <td className="py-3.5 px-3 font-semibold text-slate-900 max-w-[200px]">
                        <div className="truncate" title={p.product_name}>
                          {p.product_name}
                        </div>
                        {p.description && (
                          <div className="text-[11px] font-normal text-slate-400 truncate max-w-[180px]">
                            {p.description}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                          {p.category_name}
                        </span>
                      </td>

                      {/* Supplier */}
                      <td className="py-3.5 px-3 text-xs text-slate-600">
                        {p.supplier_name || <span className="text-slate-300 italic">None</span>}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-3 text-right font-black text-slate-900">
                        {formatINRPlain(p.price)}
                      </td>

                      {/* Stock / Min */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-black text-slate-900 text-sm">{p.current_stock}</span>
                        <span className="text-slate-400 text-xs font-medium"> / {p.minimum_stock}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewProduct(p)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onQuickRestock(p)}
                            className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Restock this product"
                          >
                            <Boxes className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditProduct(p)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteProductTarget(p)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No products found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Try adjusting your search query, or add your first bag product using the button above.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl"
            >
              Add Product Now
            </button>
          </div>
        )}
      </div>

      {/* ADD PRODUCT MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Bag to Inventory"
        subtitle="Registers a new product record in the MySQL products table"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.product_name}
              onChange={e => setFormData({ ...formData, product_name: e.target.value })}
              placeholder="e.g. Italian Hand-Stitched Leather Tote"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                required
                value={formData.category_id}
                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Supplier
              </label>
              <select
                value={formData.supplier_id}
                onChange={e => setFormData({ ...formData, supplier_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="">None / In-house</option>
                {suppliers.map(s => (
                  <option key={s.supplier_id} value={s.supplier_id}>
                    {s.supplier_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Unit Price (₹ INR) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                placeholder="1800.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Initial Stock *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.current_stock}
                onChange={e => setFormData({ ...formData, current_stock: e.target.value })}
                placeholder="10"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Min Stock Alert *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.minimum_stock}
                onChange={e => setFormData({ ...formData, minimum_stock: e.target.value })}
                placeholder="5"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              SKU (Stock Keeping Unit)
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={e => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g. BAG-LTH-001 (auto-generated if empty)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description / Materials
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Specifications, leather grade, dimensions, strap details..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-700/20 cursor-pointer"
            >
              Save Product & Add Stock
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT PRODUCT MODAL */}
      {editProduct && (
        <Modal
          isOpen={!!editProduct}
          onClose={() => setEditProduct(null)}
          title={`Edit Product #${editProduct.product_id}`}
          subtitle="Update product catalog details and thresholds"
          maxWidth="lg"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={editProduct.product_name}
                onChange={e => setEditProduct({ ...editProduct, product_name: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  required
                  value={editProduct.category_id}
                  onChange={e => setEditProduct({ ...editProduct, category_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
                >
                  {categories.map(c => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Supplier
                </label>
                <select
                  value={editProduct.supplier_id || ''}
                  onChange={e => setEditProduct({ ...editProduct, supplier_id: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
                >
                  <option value="">None / In-house</option>
                  {suppliers.map(s => (
                    <option key={s.supplier_id} value={s.supplier_id}>
                      {s.supplier_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Price (₹ INR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={editProduct.price}
                  onChange={e => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Current Stock
                </label>
                <input
                  type="number"
                  disabled
                  value={editProduct.current_stock}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-600 cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Use Restock/Sales to adjust</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Min Stock Alert *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editProduct.minimum_stock}
                  onChange={e => setEditProduct({ ...editProduct, minimum_stock: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={editProduct.description || ''}
                onChange={e => setEditProduct({ ...editProduct, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditProduct(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md"
              >
                Update Product
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW PRODUCT MODAL */}
      {viewProduct && (
        <Modal
          isOpen={!!viewProduct}
          onClose={() => setViewProduct(null)}
          title={viewProduct.product_name}
          subtitle={`SKU: ${viewProduct.sku || 'N/A'} · Category: ${viewProduct.category_name}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Unit Price</span>
                <span className="text-base font-black text-slate-900">{formatINRPlain(viewProduct.price)}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Current Stock Level</span>
                <span className="text-base font-black text-slate-900">{viewProduct.current_stock} units</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Minimum Stock Threshold</span>
                <span className="font-bold text-slate-800">{viewProduct.minimum_stock} units</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Supplier</span>
                <span className="font-bold text-slate-800">{viewProduct.supplier_name || 'In-House'}</span>
              </div>
            </div>

            {viewProduct.description && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Product Description
                </h4>
                <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {viewProduct.description}
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  const p = viewProduct;
                  setViewProduct(null);
                  onQuickRestock(p);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Boxes className="w-3.5 h-3.5" />
                Restock Now
              </button>
              <button
                onClick={() => setViewProduct(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRM MODAL */}
      <ConfirmModal
        isOpen={!!deleteProductTarget}
        onClose={() => setDeleteProductTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Bag Product"
        message={`Are you sure you want to delete "${deleteProductTarget?.product_name}"? If it has linked sales records, the database foreign-key constraint will safely prevent deletion.`}
        confirmLabel="Confirm Delete"
        loading={deleteLoading}
      />
    </div>
  );
};
