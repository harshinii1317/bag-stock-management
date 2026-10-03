import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  CreditCard,
  Mail,
  Sparkles,
  CheckCircle2,
  Fingerprint,
  QrCode,
  Zap,
  Key,
  Shield,
  Briefcase,
  Users,
  Copy,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { User as UserType } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserType) => void;
}

type RoleTab = 'admin' | 'manager' | 'staff';
type AuthMethod = 'credentials' | 'pin' | 'biometric' | 'badge' | 'fastpass';

interface RoleConfig {
  id: RoleTab;
  title: string;
  name: string;
  roleBadge: string;
  loginId: string;
  defaultPass: string;
  pin: string;
  badgeId: string;
  bioKey: string;
  secKey: string;
  icon: React.ElementType;
  permissions: string;
  accentGradient: string;
  badgeColor: string;
}

const ROLES_INFO: Record<RoleTab, RoleConfig> = {
  admin: {
    id: 'admin',
    title: 'Admin Portal',
    name: 'JHH Admin',
    roleBadge: 'System Administrator & Owner',
    loginId: 'admin',
    defaultPass: 'admin123',
    pin: '1234',
    badgeId: 'JHH-ADM-01',
    bioKey: 'BIO-ADMIN-PASSKEY-2026',
    secKey: 'JHH-ADMIN-SEC-998',
    icon: Shield,
    permissions: 'Full DBMS Schema, ACID Ledger, User Access & Master Settings',
    accentGradient: 'from-blue-600 via-teal-600 to-emerald-600',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/40'
  },
  manager: {
    id: 'manager',
    title: 'Manager Portal',
    name: 'JHH stock Manager',
    roleBadge: 'Inventory & Stock Lead',
    loginId: 'jhh_manager',
    defaultPass: 'manager123',
    pin: '9988',
    badgeId: 'JHH-MGR-02',
    bioKey: 'BIO-MGR-PASSKEY-2026',
    secKey: 'JHH-MGR-SEC-450',
    icon: Briefcase,
    permissions: 'Stock Restock Operations, Catalog Pricing, Supplier Orders & Deficits',
    accentGradient: 'from-teal-600 via-emerald-600 to-green-600',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
  },
  staff: {
    id: 'staff',
    title: 'StaffHub Portal',
    name: 'JHH StaffHub',
    roleBadge: 'Store Terminal & POS Operations',
    loginId: 'jhh_staff',
    defaultPass: 'staff123',
    pin: '5566',
    badgeId: 'JHH-STF-03',
    bioKey: 'BIO-STAFF-PASSKEY-2026',
    secKey: 'JHH-STAFF-SEC-112',
    icon: Users,
    permissions: 'POS Billing, Customer Directory, Stock Inquiries & Sale Receipts',
    accentGradient: 'from-emerald-600 via-teal-600 to-blue-600',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/40'
  }
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [activeRole, setActiveRole] = useState<RoleTab>('admin');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('credentials');

  // Credentials State initialized to active role
  const [userId, setUserId] = useState(ROLES_INFO.admin.loginId);
  const [password, setPassword] = useState(ROLES_INFO.admin.defaultPass);
  const [showPassword, setShowPassword] = useState(false);

  // Alternative Auth States
  const [pin, setPin] = useState(ROLES_INFO.admin.pin);
  const [badgeId, setBadgeId] = useState(ROLES_INFO.admin.badgeId);
  const [securityKey, setSecurityKey] = useState(ROLES_INFO.admin.secKey);

  // Biometric state
  const [isScanningFingerprint, setIsScanningFingerprint] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { showToast } = useToast();

  const currentRole = ROLES_INFO[activeRole];

  // When changing role tab, update form defaults to that role
  const handleRoleChange = (role: RoleTab) => {
    setActiveRole(role);
    const info = ROLES_INFO[role];
    setUserId(info.loginId);
    setPassword(info.defaultPass);
    setPin(info.pin);
    setBadgeId(info.badgeId);
    setSecurityKey(info.secKey);
    setError(null);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(label);
    showToast(`Copied ${label} to clipboard: ${text}`, 'info');
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Submit Password / Credentials Login
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(userId, password);
      showToast(`Welcome back, ${res.data.full_name}! (${res.data.role})`, 'success');
      onLoginSuccess(res.data);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Direct 1-Click Instant Login for specific role
  const handleQuickLoginRole = async (role: RoleTab) => {
    const info = ROLES_INFO[role];
    handleRoleChange(role);
    setLoading(true);
    setError(null);

    try {
      const res = await api.login(info.loginId, info.defaultPass);
      showToast(`Signed in as ${info.name}!`, 'success');
      onLoginSuccess(res.data);
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
      showToast(err.message || 'Quick login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit PIN Login
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.loginWithPin(pin);
      showToast(res.message, 'success');
      onLoginSuccess(res.data);
    } catch (err: any) {
      setError(err.message || 'Invalid PIN code');
      showToast(err.message || 'Invalid PIN code', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Biometric Sensor Scan
  const handleBiometricScan = async () => {
    setError(null);
    setIsScanningFingerprint(true);
    setBiometricSuccess(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 750));
      setBiometricSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 250));

      const res = await api.loginWithBiometric(currentRole.bioKey);
      showToast(`Biometric Verified! Welcome, ${res.data.full_name}`, 'success');
      onLoginSuccess(res.data);
    } catch (err: any) {
      setError(err.message || 'Biometric authentication failed');
      showToast(err.message || 'Biometric scan failed', 'error');
    } finally {
      setIsScanningFingerprint(false);
    }
  };

  // Submit Badge Login
  const handleBadgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.loginWithBadge(badgeId);
      showToast(res.message, 'success');
      onLoginSuccess(res.data);
    } catch (err: any) {
      setError(err.message || 'Badge not recognized');
      showToast(err.message || 'Badge not recognized', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit Fast-Pass Token
  const handleFastPassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.loginWithSecurityKey(securityKey);
      showToast(res.message, 'success');
      onLoginSuccess(res.data);
    } catch (err: any) {
      setError(err.message || 'Security Key verification failed');
      showToast(err.message || 'Security Key invalid', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePinPadClick = (digit: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
    }
  };

  return (
    <div className="min-h-screen bg-[#07111e] text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Blue & Green Ambient Radial Orbs */}
      <div className="absolute -top-40 -left-40 w-[34rem] h-[34rem] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[36rem] h-[36rem] bg-emerald-500/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[44rem] h-[44rem] bg-teal-500/10 rounded-full blur-[170px] pointer-events-none" />

      {/* Subtle Blue/Green Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />

      <div className="w-full max-w-xl z-10 my-4">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-teal-500 to-emerald-500 text-white shadow-xl shadow-emerald-500/20 mb-3 border border-emerald-300/30 transform hover:scale-105 transition-all">
            <span className="text-3xl filter drop-shadow">👜</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-sans">
              BAG WORLD
            </h1>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              ₹ INR
            </span>
          </div>

          <p className="text-xs text-slate-300 font-medium">
            DBMS Inventory & Stock Management System · MySQL Relational Terminal
          </p>

          <div className="inline-flex items-center gap-2 mt-2.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-md shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Multi-Portal Authentication Terminal</span>
          </div>
        </div>

        {/* Main Terminal Card */}
        <div className="bg-[#0b1728]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-blue-500/20 p-5 sm:p-7 space-y-5">
          {/* SEPARATE ROLE SELECTOR TABS (Admin, Manager, Staff) */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Select Access Portal:</span>
              <span className="text-emerald-400 font-semibold">Separate Role Portals</span>
            </div>

            <div className="grid grid-cols-3 p-1.5 bg-[#050c17] rounded-2xl border border-blue-950/80 gap-1.5">
              {/* Admin Tab */}
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`py-2.5 px-2 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer text-xs font-black ${
                  activeRole === 'admin'
                    ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Shield className="w-4 h-4 text-blue-300 shrink-0" />
                <span className="truncate">Admin</span>
              </button>

              {/* Manager Tab */}
              <button
                type="button"
                onClick={() => handleRoleChange('manager')}
                className={`py-2.5 px-2 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer text-xs font-black ${
                  activeRole === 'manager'
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Briefcase className="w-4 h-4 text-emerald-300 shrink-0" />
                <span className="truncate">Manager</span>
              </button>

              {/* Staff Tab */}
              <button
                type="button"
                onClick={() => handleRoleChange('staff')}
                className={`py-2.5 px-2 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer text-xs font-black ${
                  activeRole === 'staff'
                    ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-lg shadow-teal-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Users className="w-4 h-4 text-teal-300 shrink-0" />
                <span className="truncate">StaffHub</span>
              </button>
            </div>
          </div>

          {/* ACTIVE ROLE CREDENTIALS BANNER (Gives ID and Password clearly) */}
          <div className="p-4 rounded-2xl bg-[#09182d] border border-blue-400/30 shadow-inner space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-white">{currentRole.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentRole.badgeColor}`}>
                    {currentRole.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {currentRole.permissions}
                </p>
              </div>

              {/* Instant 1-Click Fast Unlock */}
              <button
                type="button"
                onClick={() => handleQuickLoginRole(activeRole)}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/25 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                title={`Instant 1-Click Sign In as ${currentRole.name}`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>1-Click Sign In</span>
              </button>
            </div>

            {/* Clear ID and Password Display Cards */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* ID Box */}
              <div className="p-2.5 rounded-xl bg-[#061120] border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Login ID</span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-emerald-300 select-all">
                    {currentRole.loginId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUserId(currentRole.loginId);
                    handleCopy(currentRole.loginId, 'ID');
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Copy ID & fill"
                >
                  {copiedKey === 'ID' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Password Box */}
              <div className="p-2.5 rounded-xl bg-[#061120] border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Password</span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-blue-300 select-all">
                    {currentRole.defaultPass}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPassword(currentRole.defaultPass);
                    handleCopy(currentRole.defaultPass, 'Password');
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Copy Password & fill"
                >
                  {copiedKey === 'Password' ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Sub-Methods Tabs (Credentials / PIN / Biometric / RFID Badge / FastPass) */}
          <div className="flex items-center gap-1 p-1 bg-[#061120] rounded-xl border border-slate-800 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => { setAuthMethod('credentials'); setError(null); }}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                authMethod === 'credentials'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>ID & Password</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMethod('pin'); setError(null); }}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                authMethod === 'pin'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>PIN Pad</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMethod('biometric'); setError(null); }}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                authMethod === 'biometric'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Touch ID</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMethod('badge'); setError(null); }}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                authMethod === 'badge'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Badge</span>
            </button>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div className="font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {/* AUTH METHOD 1: ID & PASSWORD LOGIN (PRIMARY) */}
          {authMethod === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>{currentRole.title} ID / Username</span>
                  <span className="text-[11px] text-emerald-400 font-mono normal-case">
                    Expected: {currentRole.loginId}
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                    placeholder={`e.g. ${currentRole.loginId}`}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#050d18] border border-blue-900/60 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 placeholder:text-slate-600 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Password</span>
                  <span className="text-[11px] text-blue-400 font-mono normal-case">
                    Expected: {currentRole.defaultPass}
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={`e.g. ${currentRole.defaultPass}`}
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-[#050d18] border border-blue-900/60 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 placeholder:text-slate-600 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 hover:from-blue-500 hover:via-teal-500 hover:to-emerald-500 text-white font-black rounded-xl text-xs sm:text-sm shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {loading
                    ? `Authenticating ${currentRole.title}...`
                    : `Sign In to ${currentRole.title} (${currentRole.name})`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* AUTH METHOD 2: PIN PAD */}
          {authMethod === 'pin' && (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="text-center">
                <h3 className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  4-Digit Terminal PIN for {currentRole.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Role Preset: <span className="font-mono text-emerald-300 font-bold">{currentRole.pin}</span>
                </p>
              </div>

              <div className="flex justify-center my-2">
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="••••"
                  autoFocus
                  required
                  className="w-48 text-center tracking-[0.5em] text-2xl font-black py-2 bg-[#050c18] border border-emerald-500/40 rounded-2xl text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-mono"
                />
              </div>

              {/* Tactile Keypad */}
              <div className="max-w-[240px] mx-auto grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handlePinPadClick(d)}
                    className="py-2.5 rounded-xl bg-[#09192f] hover:bg-[#11274a] active:bg-emerald-600 font-bold text-white text-base border border-blue-950 transition-all cursor-pointer shadow-xs"
                  >
                    {d}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPin('')}
                  className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-400 border border-slate-800 transition-colors cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handlePinPadClick('0')}
                  className="py-2.5 rounded-xl bg-[#09192f] hover:bg-[#11274a] active:bg-emerald-600 font-bold text-white text-base border border-blue-950 transition-all cursor-pointer shadow-xs"
                >
                  0
                </button>
                <button
                  type="submit"
                  disabled={loading || !pin}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition-all cursor-pointer shadow-md"
                >
                  Unlock →
                </button>
              </div>

              {/* Fast Presets */}
              <div className="pt-2 border-t border-slate-800/80 flex justify-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => { handleRoleChange('admin'); setPin('1234'); }}
                  className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20 font-semibold cursor-pointer"
                >
                  🛡️ Admin (1234)
                </button>
                <button
                  type="button"
                  onClick={() => { handleRoleChange('manager'); setPin('9988'); }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 font-semibold cursor-pointer"
                >
                  💼 Manager (9988)
                </button>
                <button
                  type="button"
                  onClick={() => { handleRoleChange('staff'); setPin('5566'); }}
                  className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/30 hover:bg-teal-500/20 font-semibold cursor-pointer"
                >
                  🧾 StaffHub (5566)
                </button>
              </div>
            </form>
          )}

          {/* AUTH METHOD 3: BIOMETRIC TOUCH ID */}
          {authMethod === 'biometric' && (
            <div className="space-y-4 text-center">
              <div>
                <h3 className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-emerald-400" />
                  Hardware Touch ID Biometric Terminal
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Authenticating profile: <strong className="text-emerald-300">{currentRole.name}</strong>
                </p>
              </div>

              {/* Interactive Biometric Sensor Touch Pad */}
              <div className="relative py-2 flex flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={handleBiometricScan}
                  disabled={isScanningFingerprint}
                  className={`relative group w-32 h-32 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                    biometricSuccess
                      ? 'bg-emerald-950 border-2 border-emerald-400 text-emerald-300 shadow-2xl shadow-emerald-500/30'
                      : isScanningFingerprint
                      ? 'bg-blue-950/60 border-2 border-emerald-400 text-emerald-300 shadow-2xl shadow-emerald-500/40 scale-95'
                      : 'bg-[#091a32] hover:bg-[#0e274c] border-2 border-blue-500/40 hover:border-emerald-400 text-emerald-400 hover:scale-105 shadow-xl shadow-blue-950'
                  }`}
                >
                  {isScanningFingerprint && (
                    <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent rounded-full animate-scan pointer-events-none" />
                  )}

                  <Fingerprint
                    className={`w-16 h-16 transition-all ${
                      isScanningFingerprint
                        ? 'animate-pulse text-emerald-300 scale-110'
                        : biometricSuccess
                        ? 'text-emerald-400 scale-110'
                        : 'group-hover:text-emerald-300'
                    }`}
                  />

                  <span className="text-[10px] font-black uppercase tracking-wider mt-1 text-slate-300">
                    {isScanningFingerprint ? 'Scanning...' : biometricSuccess ? 'Verified!' : 'Tap Sensor'}
                  </span>
                </button>

                <p className="text-[11px] text-slate-400 mt-2 font-medium">
                  {isScanningFingerprint
                    ? 'Verifying biometric signature against database...'
                    : 'Click sensor to verify cryptographic passkey'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleBiometricScan}
                className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Instant Touch ID Unlock: {currentRole.name}</span>
              </button>
            </div>
          )}

          {/* AUTH METHOD 4: RFID SMART BADGE */}
          {authMethod === 'badge' && (
            <form onSubmit={handleBadgeSubmit} className="space-y-4">
              <div className="text-center">
                <h3 className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-teal-400" />
                  Staff RFID Smart Badge Reader
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Current Badge: <span className="font-mono text-emerald-300 font-bold">{currentRole.badgeId}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Badge RFID Serial ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={badgeId}
                    onChange={e => setBadgeId(e.target.value)}
                    placeholder="e.g. JHH-ADM-01"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#050d18] border border-blue-900/60 rounded-xl text-xs sm:text-sm font-mono font-bold text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all uppercase"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? 'Verifying Badge...' : `Scan Badge (${currentRole.badgeId})`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex justify-center gap-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => { handleRoleChange('admin'); setBadgeId('JHH-ADM-01'); }}
                  className="text-blue-300 hover:underline"
                >
                  Admin Badge
                </button>
                <span className="text-slate-600">·</span>
                <button
                  type="button"
                  onClick={() => { handleRoleChange('manager'); setBadgeId('JHH-MGR-02'); }}
                  className="text-emerald-300 hover:underline"
                >
                  Manager Badge
                </button>
                <span className="text-slate-600">·</span>
                <button
                  type="button"
                  onClick={() => { handleRoleChange('staff'); setBadgeId('JHH-STF-03'); }}
                  className="text-teal-300 hover:underline"
                >
                  StaffHub Badge
                </button>
              </div>
            </form>
          )}

          {/* QUICK ACCOUNT CARDS FOOTER (Always Visible Credentials Reference) */}
          <div className="pt-4 border-t border-blue-950/80">
            <div className="flex items-center justify-between text-slate-400 mb-2.5">
              <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Store Account Credentials Reference
              </span>
              <span className="text-[11px] text-slate-500 font-mono">₹ INR Store</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
              {/* Admin Card */}
              <div
                onClick={() => handleRoleChange('admin')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  activeRole === 'admin'
                    ? 'bg-blue-950/50 border-blue-400 shadow-md shadow-blue-950'
                    : 'bg-[#061120] border-slate-800 hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-blue-300 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Admin
                  </span>
                  <span className="text-[9px] px-1 py-0.5 rounded bg-blue-900/60 text-blue-200">Owner</span>
                </div>
                <div className="text-white text-xs font-bold mt-1 truncate">JHH Admin</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  ID: <span className="text-blue-300 font-semibold">admin</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Pass: <span className="text-emerald-300 font-semibold">admin123</span>
                </div>
              </div>

              {/* Manager Card */}
              <div
                onClick={() => handleRoleChange('manager')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  activeRole === 'manager'
                    ? 'bg-emerald-950/50 border-emerald-400 shadow-md shadow-emerald-950'
                    : 'bg-[#061120] border-slate-800 hover:border-emerald-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-emerald-300 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    Manager
                  </span>
                  <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-900/60 text-emerald-200">Stock</span>
                </div>
                <div className="text-white text-xs font-bold mt-1 truncate">JHH stock Manager</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  ID: <span className="text-emerald-300 font-semibold">jhh_manager</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Pass: <span className="text-blue-300 font-semibold">manager123</span>
                </div>
              </div>

              {/* Staff Card */}
              <div
                onClick={() => handleRoleChange('staff')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  activeRole === 'staff'
                    ? 'bg-teal-950/50 border-teal-400 shadow-md shadow-teal-950'
                    : 'bg-[#061120] border-slate-800 hover:border-teal-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-teal-300 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Staff
                  </span>
                  <span className="text-[9px] px-1 py-0.5 rounded bg-teal-900/60 text-teal-200">POS</span>
                </div>
                <div className="text-white text-xs font-bold mt-1 truncate">JHH StaffHub</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  ID: <span className="text-teal-300 font-semibold">jhh_staff</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Pass: <span className="text-emerald-300 font-semibold">staff123</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
