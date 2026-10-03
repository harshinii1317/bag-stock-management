import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Layers,
  Boxes,
  Users,
  ShoppingCart,
  Truck,
  AlertTriangle,
  FileBarChart2,
  Database,
  LogOut,
  Sparkles,
  Shield,
  UserCheck
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lowStockCount: number;
  activeUser: User | null;
  onLogout: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  lowStockCount,
  activeUser,
  onLogout,
  isOpenMobile,
  setIsOpenMobile
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Briefcase },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'stock', label: 'Stock Management', icon: Boxes },
    { id: 'sales', label: 'Sales & Billing', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    {
      id: 'low_stock',
      label: 'Low Stock Alerts',
      icon: AlertTriangle,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-emerald-500 text-slate-950 font-black animate-pulse'
    },
    { id: 'reports', label: 'Reports', icon: FileBarChart2 },
    { id: 'dbms', label: 'DBMS Viva & Schema', icon: Database, highlight: true }
  ];

  const handleSelect = (id: string) => {
    setCurrentTab(id);
    setIsOpenMobile(false);
  };

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'Owner':
      case 'Admin':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'Manager':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
      case 'Staff':
        return 'bg-teal-500/20 text-teal-300 border-teal-400/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-68 bg-[#071322] text-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-blue-900/30 shadow-2xl ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header with BAG WORLD & Blue-Green Styling */}
        <div className="p-5 border-b border-blue-900/40 flex items-center gap-3 bg-gradient-to-b from-[#0a1b30] to-[#071322]">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-teal-500 to-emerald-500 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20 border border-emerald-400/30 shrink-0">
            <span className="text-xl">👜</span>
          </div>
          <div className="min-w-0">
            <h1 className="font-black text-base tracking-tight text-white flex items-center gap-1.5 font-sans">
              BAG WORLD
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                ₹ INR
              </span>
            </h1>
            <p className="text-xs text-emerald-400/90 font-semibold truncate">
              {activeUser?.full_name || 'JHH Stock Terminal'}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
          <div className="text-[10px] font-extrabold tracking-wider uppercase text-blue-400/80 px-3 pb-1">
            Store Operations
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 group text-left cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 text-white font-bold shadow-md shadow-emerald-950/40'
                    : item.highlight
                    ? 'text-emerald-300 hover:bg-emerald-950/30 border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-[#0c1f36] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-white stroke-[2.5]'
                        : item.highlight
                        ? 'text-emerald-400'
                        : 'text-blue-400 group-hover:text-emerald-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-slate-950 text-emerald-300' : item.badgeColor || 'bg-emerald-900/80 text-emerald-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.highlight && !item.badge && (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 opacity-70 group-hover:opacity-100" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3.5 border-t border-blue-900/40 bg-[#050e18]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-600 border border-emerald-400/40 flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-xs">
                {activeUser?.full_name ? activeUser.full_name[0] : 'J'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {activeUser?.full_name || 'JHH Terminal'}
                </div>
                <div className="text-[10px] text-emerald-400/90 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold ${getRoleBadgeStyle(activeUser?.role)}`}>
                    {activeUser?.role || 'Staff'}
                  </span>
                  <span className="text-slate-500">· MySQL</span>
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Sign out of terminal"
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
