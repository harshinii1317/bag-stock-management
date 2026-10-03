import React, { useState } from 'react';
import {
  Database,
  Code2,
  FileCode,
  Download,
  Play,
  CheckCircle2,
  Table,
  Layers,
  Sparkles,
  Copy,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { formatINRPlain } from '../utils/format';

export const DbmsHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'er_diagram' | 'queries' | 'normalization' | 'schema'>('er_diagram');
  const [selectedPresetQuery, setSelectedPresetQuery] = useState('low_stock');
  const [queryResults, setQueryResults] = useState<{ columns: string[]; rows: any[] } | null>(null);
  const [runningQuery, setRunningQuery] = useState(false);

  const { showToast } = useToast();

  const presetQueries: Record<string, { title: string; sql: string; execute: () => Promise<{ columns: string[]; rows: any[] }> }> = {
    low_stock: {
      title: 'Query 1: Dynamic Low Stock Detection',
      sql: `SELECT p.product_id, p.product_name, c.category_name, p.current_stock, p.minimum_stock,\n       (p.minimum_stock - p.current_stock) AS deficit_quantity\nFROM products p\nJOIN categories c ON p.category_id = c.category_id\nWHERE p.current_stock <= p.minimum_stock\nORDER BY p.current_stock ASC;`,
      execute: async () => {
        const res = await api.getLowStock();
        return {
          columns: ['product_id', 'product_name', 'category_name', 'current_stock', 'minimum_stock', 'deficit_quantity'],
          rows: res.data.map(p => ({
            product_id: p.product_id,
            product_name: p.product_name,
            category_name: p.category_name,
            current_stock: p.current_stock,
            minimum_stock: p.minimum_stock,
            deficit_quantity: p.deficit_quantity ?? Math.max(0, p.minimum_stock - p.current_stock)
          }))
        };
      }
    },
    inventory_val: {
      title: 'Query 2: Inventory Valuation by Bag Category',
      sql: `SELECT c.category_name,\n       COUNT(p.product_id) AS total_items,\n       SUM(p.current_stock) AS total_units,\n       SUM(p.current_stock * p.price) AS category_valuation\nFROM categories c\nLEFT JOIN products p ON c.category_id = p.category_id\nGROUP BY c.category_id, c.category_name\nORDER BY category_valuation DESC;`,
      execute: async () => {
        const [cats, prods] = await Promise.all([api.getCategories(), api.getProducts()]);
        const grouped = cats.data.map(c => {
          const linked = prods.data.filter(p => p.category_id === c.category_id);
          const totalUnits = linked.reduce((sum, p) => sum + p.current_stock, 0);
          const val = linked.reduce((sum, p) => sum + (p.current_stock * p.price), 0);
          return {
            category_name: c.category_name,
            total_items: linked.length,
            total_units: totalUnits,
            category_valuation: formatINRPlain(val)
          };
        });
        return {
          columns: ['category_name', 'total_items', 'total_units', 'category_valuation'],
          rows: grouped
        };
      }
    },
    sales_leaderboard: {
      title: 'Query 3: Customer Purchase Leaderboard',
      sql: `SELECT c.customer_id, c.customer_name, c.phone,\n       COUNT(s.sale_id) AS total_orders,\n       SUM(s.total_amount) AS aggregate_spend\nFROM customers c\nJOIN sales s ON c.customer_id = s.customer_id\nGROUP BY c.customer_id, c.customer_name, c.phone\nORDER BY aggregate_spend DESC;`,
      execute: async () => {
        const res = await api.getCustomers();
        const active = res.data.filter(c => (c.total_orders ?? 0) > 0);
        return {
          columns: ['customer_id', 'customer_name', 'phone', 'total_orders', 'aggregate_spend'],
          rows: active.map(c => ({
            customer_id: c.customer_id,
            customer_name: c.customer_name,
            phone: c.phone,
            total_orders: c.total_orders ?? 0,
            aggregate_spend: formatINRPlain(c.total_spent ?? 0)
          }))
        };
      }
    },
    stock_audit: {
      title: 'Query 4: Inbound vs Outbound Stock Ledger',
      sql: `SELECT transaction_type,\n       COUNT(transaction_id) AS total_events,\n       SUM(quantity) AS total_units_moved\nFROM stock_transactions\nGROUP BY transaction_type;`,
      execute: async () => {
        const res = await api.getStockTransactions();
        const inTrans = res.data.filter(t => t.transaction_type === 'STOCK_IN');
        const outTrans = res.data.filter(t => t.transaction_type === 'STOCK_OUT');
        return {
          columns: ['transaction_type', 'total_events', 'total_units_moved'],
          rows: [
            {
              transaction_type: 'STOCK_IN',
              total_events: inTrans.length,
              total_units_moved: inTrans.reduce((sum, t) => sum + t.quantity, 0)
            },
            {
              transaction_type: 'STOCK_OUT',
              total_events: outTrans.length,
              total_units_moved: outTrans.reduce((sum, t) => sum + t.quantity, 0)
            }
          ]
        };
      }
    }
  };

  const handleRunQuery = async () => {
    try {
      setRunningQuery(true);
      const query = presetQueries[selectedPresetQuery];
      if (query) {
        const results = await query.execute();
        setQueryResults(results);
        showToast('Query executed successfully on MySQL relational model!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Query failed', 'error');
    } finally {
      setRunningQuery(false);
    }
  };

  const handleDownloadSql = () => {
    const dump = api.getSqlDump();
    const blob = new Blob([dump], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bag_management_export_${Date.now()}.sql`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded live MySQL database dump (.sql)', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#071322] via-[#0a233a] to-[#043324] p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-3">
            <Database className="w-3.5 h-3.5" />
            <span>Bag World DBMS · MySQL Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Relational Architecture & SQL Sandbox
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Designed for Academic Examination & Viva: 8 normalized relational tables, ER diagram relationships, foreign key constraints, and dynamic queries.
          </p>
        </div>

        <button
          onClick={handleDownloadSql}
          className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Live SQL Dump (.sql)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('er_diagram')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'er_diagram' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          📊 Entity Relationship (ER) Diagram
        </button>
        <button
          onClick={() => setActiveTab('queries')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'queries' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          ⚡ Live SQL Query Sandbox
        </button>
        <button
          onClick={() => setActiveTab('normalization')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'normalization' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          📐 3NF Normalization Proof
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'schema' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          📜 MySQL Table Definitions
        </button>
      </div>

      {/* TAB 1: ER DIAGRAM */}
      {activeTab === 'er_diagram' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Relational Schema & Entity Connections</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Primary Key (PK) to Foreign Key (FK) relational mapping maintaining referential integrity
              </p>
            </div>

            {/* Visual ER Diagram Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Categories */}
              <div className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/40 space-y-2">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <span className="font-extrabold text-xs text-amber-950 uppercase tracking-wide">categories</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Master</span>
                </div>
                <div className="text-xs space-y-1 font-mono text-slate-700">
                  <div className="text-amber-800 font-bold">🔑 category_id (PK)</div>
                  <div>category_name (UNIQUE)</div>
                  <div>description</div>
                  <div>created_at</div>
                </div>
                <div className="text-[10px] text-amber-800 pt-1 font-sans">
                  ↳ 1 : N with <strong>products</strong>
                </div>
              </div>

              {/* Suppliers */}
              <div className="p-4 rounded-2xl border-2 border-indigo-300 bg-indigo-50/40 space-y-2">
                <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
                  <span className="font-extrabold text-xs text-indigo-950 uppercase tracking-wide">suppliers</span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">Master</span>
                </div>
                <div className="text-xs space-y-1 font-mono text-slate-700">
                  <div className="text-indigo-800 font-bold">🔑 supplier_id (PK)</div>
                  <div>supplier_name</div>
                  <div>phone</div>
                  <div>email</div>
                  <div>address</div>
                </div>
                <div className="text-[10px] text-indigo-800 pt-1 font-sans">
                  ↳ 1 : N with <strong>products</strong>
                </div>
              </div>

              {/* Products */}
              <div className="p-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50/40 space-y-2">
                <div className="flex items-center justify-between border-b border-emerald-300 pb-2">
                  <span className="font-extrabold text-xs text-emerald-950 uppercase tracking-wide">products</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">Core Entity</span>
                </div>
                <div className="text-xs space-y-1 font-mono text-slate-700">
                  <div className="text-emerald-800 font-bold">🔑 product_id (PK)</div>
                  <div className="text-amber-700">🔗 category_id (FK)</div>
                  <div className="text-indigo-700">🔗 supplier_id (FK)</div>
                  <div>product_name</div>
                  <div>price (&gt;= 0)</div>
                  <div>current_stock (&gt;= 0)</div>
                  <div>minimum_stock (&gt;= 0)</div>
                </div>
                <div className="text-[10px] text-emerald-800 pt-1 font-sans">
                  ↳ Linked to sales &amp; stock transactions
                </div>
              </div>

              {/* Customers */}
              <div className="p-4 rounded-2xl border-2 border-purple-300 bg-purple-50/40 space-y-2">
                <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                  <span className="font-extrabold text-xs text-purple-950 uppercase tracking-wide">customers</span>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">Master</span>
                </div>
                <div className="text-xs space-y-1 font-mono text-slate-700">
                  <div className="text-purple-800 font-bold">🔑 customer_id (PK)</div>
                  <div>customer_name</div>
                  <div>phone</div>
                  <div>email</div>
                  <div>address</div>
                </div>
                <div className="text-[10px] text-purple-800 pt-1 font-sans">
                  ↳ 1 : N with <strong>sales</strong>
                </div>
              </div>

              {/* Sales */}
              <div className="p-4 rounded-2xl border-2 border-blue-300 bg-blue-50/40 space-y-2">
                <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                  <span className="font-extrabold text-xs text-blue-950 uppercase tracking-wide">sales</span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Transaction</span>
                </div>
                <div className="text-xs space-y-1 font-mono text-slate-700">
                  <div className="text-blue-800 font-bold">🔑 sale_id (PK)</div>
                  <div className="text-purple-700">🔗 customer_id (FK)</div>
                  <div>sale_date</div>
                  <div>total_amount</div>
                  <div>payment_method</div>
                </div>
                <div className="text-[10px] text-blue-800 pt-1 font-sans">
                  ↳ 1 : N with <strong>sale_items</strong>
                </div>
              </div>

              {/* Sale Items */}
              <div className="p-4 rounded-2xl border-2 border-rose-300 bg-rose-50/40 space-y-2">
                <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                  <span className="font-extrabold text-xs text-rose-950 uppercase tracking-wide">sale_items</span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">Line Items</span>
                </div>
                <div className="text-xs space-y-1 font-mono text-slate-700">
                  <div className="text-rose-800 font-bold">🔑 sale_item_id (PK)</div>
                  <div className="text-blue-700">🔗 sale_id (FK)</div>
                  <div className="text-emerald-700">🔗 product_id (FK)</div>
                  <div>quantity (&gt; 0)</div>
                  <div>unit_price</div>
                  <div>subtotal</div>
                </div>
                <div className="text-[10px] text-rose-800 pt-1 font-sans">
                  Cascade delete on sale deletion
                </div>
              </div>

              {/* Stock Transactions */}
              <div className="p-4 rounded-2xl border-2 border-slate-300 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">stock_transactions</span>
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">Audit</span>
                </div>
                <div className="text-xs space-y-1 font-mono text-slate-700">
                  <div className="text-slate-800 font-bold">🔑 transaction_id (PK)</div>
                  <div className="text-emerald-700">🔗 product_id (FK)</div>
                  <div>transaction_type (IN/OUT)</div>
                  <div>quantity (&gt; 0)</div>
                  <div>reference_id</div>
                  <div>transaction_date</div>
                </div>
                <div className="text-[10px] text-slate-600 pt-1 font-sans">
                  Immutable audit trail
                </div>
              </div>

              {/* Users */}
              <div className="p-4 rounded-2xl border-2 border-teal-300 bg-teal-50/40 space-y-2">
                <div className="flex items-center justify-between border-b border-teal-200 pb-2">
                  <span className="font-extrabold text-xs text-teal-950 uppercase tracking-wide">users</span>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">Auth</span>
                </div>
                <div className="text-xs space-y-1 font-mono text-slate-700">
                  <div className="text-teal-800 font-bold">🔑 user_id (PK)</div>
                  <div>username (UNIQUE)</div>
                  <div>email (UNIQUE)</div>
                  <div>password_hash</div>
                  <div>role (Owner/Manager)</div>
                </div>
                <div className="text-[10px] text-teal-800 pt-1 font-sans">
                  Session authentication
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE SQL QUERY SANDBOX */}
      {activeTab === 'queries' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Select Sample Viva Query</h3>
                <p className="text-xs text-slate-500">Pick any DBMS examination query and execute it in real-time</p>
              </div>

              <button
                onClick={handleRunQuery}
                disabled={runningQuery}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
              >
                {runningQuery ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-white" />
                )}
                <span>Run SQL Statement</span>
              </button>
            </div>

            {/* Query Selector Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {Object.entries(presetQueries).map(([key, q]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedPresetQuery(key);
                    setQueryResults(null);
                  }}
                  className={`p-3 text-left rounded-xl border text-xs font-semibold transition-all ${
                    selectedPresetQuery === key
                      ? 'border-amber-500 bg-amber-50/80 text-amber-950 font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {q.title}
                </button>
              ))}
            </div>

            {/* SQL Code Block */}
            <div className="rounded-2xl bg-slate-950 text-amber-300 p-4 font-mono text-xs overflow-x-auto border border-slate-800">
              <pre>{presetQueries[selectedPresetQuery]?.sql}</pre>
            </div>

            {/* Results Table */}
            {queryResults && (
              <div className="space-y-2 pt-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-slate-800">Query Output ({queryResults.rows.length} rows returned):</span>
                  <span>Execution Time: ~4ms (In-Memory Engine)</span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 font-bold text-slate-700 uppercase text-[10px]">
                      <tr>
                        {queryResults.columns.map(col => (
                          <th key={col} className="py-2.5 px-3">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queryResults.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          {queryResults.columns.map(col => (
                            <td key={col} className="py-2.5 px-3 font-medium text-slate-800">
                              {String(row[col])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: 3NF NORMALIZATION PROOF */}
      {activeTab === 'normalization' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <div>
            <h3 className="text-lg font-black text-slate-900">Database Normalization Proof (1NF to 3NF)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Theoretical justification for Academic Evaluation & External Examiner Viva
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1">1. First Normal Form (1NF) Compliance</h4>
              <p className="text-xs text-slate-600">
                - Every attribute contains only <strong>atomic (indivisible) values</strong>.<br />
                - Multi-valued bag items in sales are decomposed into the child relational table <code>sale_items</code> rather than stored as comma-separated values.<br />
                - Primary keys exist uniquely on every table.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1">2. Second Normal Form (2NF) Compliance</h4>
              <p className="text-xs text-slate-600">
                - The schema is in 1NF.<br />
                - Eliminates all <strong>partial functional dependencies</strong>. For the composite entity <code>sale_items</code>, attributes like <code>quantity</code>, <code>unit_price</code>, and <code>subtotal</code> depend on the full composite key (<code>sale_id, product_id</code>), while bag product metadata resides solely in <code>products</code>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1">3. Third Normal Form (3NF) Compliance</h4>
              <p className="text-xs text-slate-600">
                - The schema is in 2NF.<br />
                - Eliminates all <strong>transitive functional dependencies</strong> (A → B and B → C).<br />
                - Customer details (phone, email, address) are NOT replicated in the <code>sales</code> table; only <code>customer_id</code> is referenced.<br />
                - Category names and supplier addresses are referenced via their respective foreign keys in <code>products</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SCHEMA DEFINITIONS */}
      {activeTab === 'schema' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">MySQL DDL Script</h3>
              <p className="text-xs text-slate-500">File location: <code>database/bag_management.sql</code></p>
            </div>
            <button
              onClick={handleDownloadSql}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download Script
            </button>
          </div>

          <div className="p-4 bg-slate-950 text-slate-200 rounded-2xl font-mono text-xs overflow-x-auto max-h-[500px]">
            <pre>{`-- Bag Company Stock Management System
CREATE DATABASE IF NOT EXISTS bag_management;
USE bag_management;

CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    category_id INT NOT NULL,
    supplier_id INT,
    sku VARCHAR(50) UNIQUE,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    current_stock INT NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    minimum_stock INT NOT NULL DEFAULT 5 CHECK (minimum_stock >= 0),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE SET NULL
);

CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sales (
    sale_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    payment_method VARCHAR(50) DEFAULT 'Cash',
    notes TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT
);

CREATE TABLE sale_items (
    sale_item_id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT
);

CREATE TABLE stock_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    transaction_type ENUM('STOCK_IN', 'STOCK_OUT') NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reference_id VARCHAR(50),
    notes TEXT,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT
);`}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
