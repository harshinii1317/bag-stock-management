import React, { useState } from 'react';
import {
  Menu,
  AlertTriangle,
  Plus,
  ShoppingCart,
  Database,
  RefreshCw,
  Trash2,
  FileCode,
  CheckCircle2,
  ChevronDown,
  KeyRound,
  Shield,
  Briefcase,
  Users
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lowStockCount: number;
  activeUser: User | null;
  onOpenMobileSidebar: () => void;
  onQuickAddProduct: () => void;
  onQuickRecordSale: () => void;
  onResetData: () => void;
  onClearData: () => void;
  onExportSql: () => void;
  onSwitchUser?: (pin: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  lowStockCount,
  activeUser,
  onOpenMobileSidebar,
  onQuickAddProduct,
  onQuickRecordSale,
  onResetData,
  onClearData,
  onExportSql,
  onSwitchUser
}) => {
  const [dataDropdownOpen, setDataDropdownOpen] = useState(false);
  const [accessMenuOpen, setAccessMenuOpen] = useState(false);

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'products': return 'Product & Bag Inventory';
      case 'categories': return 'Bag Categories Management';
      case 'stock': return 'Stock Operations & Restock';
      case 'sales': return 'Sales Register & Billing';
      case 'customers': return 'Customer Directory & CRM';
      case 'suppliers': return 'Supplier & Artisan Network';
      case 'low_stock': return 'Low Stock Alerts & Deficits';
      case 'reports': return 'Business Reports & Analytics';
      case 'dbms': return 'DBMS Architecture & SQL Engine';
      default: return 'Store Management';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              {getPageTitle(currentTab)}
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Bag World · ₹ INR
            </span>
          </div>
          <div className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5 mt-0.5">
            <span>Terminal:</span>
            <strong className="text-emerald-700 font-bold">{activeUser?.full_name || 'JHH Terminal'}</strong>
            <span className="text-slate-400">({activeUser?.role || 'Staff'})</span>
            <span aria-hidden="true">·</span>
            <span>MySQL Relational Engine</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Access / Staff Switcher */}
        {onSwitchUser && (
          <div className="relative">
            <button
              onClick={() => setAccessMenuOpen(!accessMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 bg-blue-50/80 hover:bg-blue-100/80 rounded-xl border border-blue-200 transition-colors cursor-pointer"
              title="Switch between Admin, Manager, and Staff"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">{activeUser?.role || 'Staff'} Account</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {accessMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setAccessMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Role Account
                  </div>

                  {/* 1. Admin */}
                  <button
                    onClick={() => { setAccessMenuOpen(false); onSwitchUser('1234'); }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-blue-50 text-xs flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">JHH Admin (Owner)</div>
                        <div className="text-[10px] text-slate-500">ID: admin · PIN: 1234</div>
                      </div>
                    </div>
                    {(activeUser?.role === 'Owner' || activeUser?.role === 'Admin') && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    )}
                  </button>

                  {/* 2. Manager */}
                  <button
                    onClick={() => { setAccessMenuOpen(false); onSwitchUser('9988'); }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-emerald-50 text-xs flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">JHH stock Manager</div>
                        <div className="text-[10px] text-slate-500">ID: jhh_manager · PIN: 9988</div>
                      </div>
                    </div>
                    {activeUser?.role === 'Manager' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>

                  {/* 3. Staff */}
                  <button
                    onClick={() => { setAccessMenuOpen(false); onSwitchUser('5566'); }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-teal-50 text-xs flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">JHH StaffHub</div>
                        <div className="text-[10px] text-slate-500">ID: jhh_staff · PIN: 5566</div>
                      </div>
                    </div>
                    {activeUser?.role === 'Staff' && (
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Low Stock Warning Pill */}
        {lowStockCount > 0 && (
          <button
            onClick={() => setCurrentTab('low_stock')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-300 transition-all shadow-xs cursor-pointer"
            title={`${lowStockCount} items need restocking`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce" />
            <span>
              {lowStockCount} <span className="hidden md:inline">Low Stock</span>
            </span>
          </button>
        )}

        {/* Database Quick Menu */}
        <div className="relative">
          <button
            onClick={() => setDataDropdownOpen(!dataDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">DBMS Actions</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dataDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDataDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Database Controls
                </div>

                <button
                  onClick={() => {
                    setDataDropdownOpen(false);
                    onResetData();
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-600" />
                  Reload Sample Bag World Data
                </button>

                <button
                  onClick={() => {
                    setDataDropdownOpen(false);
                    onClearData();
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  Clear All (Start Empty Slate)
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => {
                    setDataDropdownOpen(false);
                    onExportSql();
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileCode className="w-4 h-4 text-blue-600" />
                  Export Data as SQL (.sql)
                </button>

                <button
                  onClick={() => {
                    setDataDropdownOpen(false);
                    setCurrentTab('dbms');
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-teal-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Database className="w-4 h-4 text-teal-600" />
                  View ER Diagram & Schema
                </button>
              </div>
            </>
          )}
        </div>

        {/* Quick Action: New Sale in Royal Blue */}
        <button
          onClick={onQuickRecordSale}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <ShoppingCart className="w-3.5 h-3.5 text-blue-200" />
          <span className="hidden sm:inline">Record</span> Sale
        </button>

        {/* Quick Action: Add Product in Vibrant Emerald Green */}
        <button
          onClick={onQuickAddProduct}
          className="flex items-center gap-1 px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Add</span> Product
        </button>
      </div>
    </header>
  );
};
