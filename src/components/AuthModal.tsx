import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import { UserRole } from '../types';
import { 
  ShieldCheck, 
  UserCheck, 
  KeyRound, 
  X, 
  AlertCircle, 
  Lock, 
  Crown, 
  Eye, 
  EyeOff 
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    language,
    isAuthModalOpen,
    authModalTargetRole,
    closeAuthModal,
    authenticateUser,
    currentUserRole,
    isAuthenticated,
  } = usePOS();

  const isAr = language === 'ar';
  const [selectedRole, setSelectedRole] = useState<UserRole>('manager');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isAuthModalOpen) {
      setSelectedRole(authModalTargetRole || (currentUserRole === 'manager' ? 'cashier' : 'manager'));
      setPassword('');
      setErrorMsg('');
      setShowPassword(false);
    }
  }, [isAuthModalOpen, authModalTargetRole, currentUserRole]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg(isAr ? 'يرجى إدخال كلمة المرور' : 'Please enter password');
      return;
    }

    const res = authenticateUser(selectedRole, password);
    if (!res.success) {
      setErrorMsg(res.error || (isAr ? 'كلمة المرور غير صحيحة' : 'Invalid password'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-2xl text-stone-100 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-stone-950 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {isAr ? 'تسجيل الدخول / تبديل الحساب' : 'Sign In / Switch Account'}
              </h2>
              <p className="text-[11px] text-stone-400">
                {isAr ? 'اختر الحساب وأدخل كلمة المرور للمتابعة' : 'Select role and enter password to continue'}
              </p>
            </div>
          </div>

          {isAuthenticated ? (
            <button
              onClick={closeAuthModal}
              className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3" />
              <span>{isAr ? 'برجر تيم' : 'Burger Team'}</span>
            </div>
          )}
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-stone-950 rounded-lg border border-stone-800">
            {/* Manager Option */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('manager');
                setPassword('');
                setErrorMsg('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-bold transition-all ${
                selectedRole === 'manager'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>{isAr ? 'المدير' : 'Manager'}</span>
            </button>

            {/* Cashier Option */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('cashier');
                setPassword('');
                setErrorMsg('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-bold transition-all ${
                selectedRole === 'cashier'
                  ? 'bg-emerald-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{isAr ? 'الكاشير' : 'Cashier'}</span>
            </button>
          </div>

          {/* Role Permissions Description Banner */}
          <div className={`p-3 rounded-lg border text-xs leading-relaxed ${
            selectedRole === 'manager'
              ? 'bg-amber-500/10 border-amber-500/25 text-amber-200'
              : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200'
          }`}>
            {selectedRole === 'manager' ? (
              <div className="space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  {isAr ? 'صلاحيات المدير الكاملة:' : 'Full Manager Privileges:'}
                </span>
                <p className="text-[11px] text-stone-300">
                  {isAr 
                    ? 'الوصول لكافة أقسام النظام بما في ذلك شاشة المحاسبة، تقارير الإيرادات اليومية، الأرباح، وتعديل إعدادات المطعم والأسعار.'
                    : 'Access all modules including Accounting, Revenue Reports, Profit analytics, and Store Settings.'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <UserCheck className="w-4 h-4" />
                  {isAr ? 'صلاحيات الكاشير (المبيعات وتعديل السعر فقط):' : 'Cashier Privileges (Sales & Price Edit):'}
                </span>
                <p className="text-[11px] text-stone-300">
                  {isAr 
                    ? 'تسجيل الطلبات، تعديل أسعار الساندوتشات مباشرة، استلام النقدية والشبكة، وشاشة المطبخ. (ممنوع من الوصول لقسم المحاسبة والإيرادات).'
                    : 'Take customer orders, edit unit prices, process payments, and access kitchen. Strictly no access to accounting reports.'}
                </p>
              </div>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-300">
              {isAr ? `كلمة سر ${selectedRole === 'manager' ? 'المدير' : 'الكاشير'}:` : `${selectedRole === 'manager' ? 'Manager' : 'Cashier'} Password:`}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-500 absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder={isAr ? 'أدخل كلمة المرور...' : 'Enter password...'}
                className="w-full ps-9 pe-10 py-2.5 text-xs sm:text-sm bg-stone-950 border border-stone-700 rounded-lg text-white font-mono placeholder-stone-600 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 bg-red-500/15 border border-red-500/30 rounded-lg flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={closeAuthModal}
                className="flex-1 py-2.5 text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg transition-colors"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            )}
            <button
              type="submit"
              className={`py-2.5 text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg transition-all shadow-md shadow-amber-500/20 ${
                !isAuthenticated ? 'w-full py-3' : 'flex-1'
              }`}
            >
              {!isAuthenticated
                ? (isAr ? 'تسجيل الدخول وبدء العمل الآن' : 'Log In & Start Session')
                : (isAr ? 'تسجيل الدخول الآن' : 'Log In Now')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
