import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import { 
  KeyRound, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Crown, 
  UserCheck, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Save, 
  Lock 
} from 'lucide-react';

export const PasswordManagerModal: React.FC = () => {
  const {
    language,
    currentUserRole,
    managerPassword,
    cashierPassword,
    updatePasswords,
    isPasswordManagerModalOpen,
    closePasswordManagerModal,
    playAudioChime,
  } = usePOS();

  const isAr = language === 'ar';

  const [newManagerPass, setNewManagerPass] = useState(managerPassword);
  const [newCashierPass, setNewCashierPass] = useState(cashierPassword);
  const [showManagerPass, setShowManagerPass] = useState(false);
  const [showCashierPass, setShowCashierPass] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isPasswordManagerModalOpen) {
      setNewManagerPass(managerPassword);
      setNewCashierPass(cashierPassword);
      setSuccessMsg('');
      setErrorMsg('');
      setShowManagerPass(false);
      setShowCashierPass(false);
    }
  }, [isPasswordManagerModalOpen, managerPassword, cashierPassword]);

  if (!isPasswordManagerModalOpen) return null;

  // Protect from non-manager
  if (currentUserRole !== 'manager') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-6 text-center text-stone-100 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-white mb-1">
            {isAr ? 'صلاحية مخصصة للمدير فقط' : 'Manager Privileges Only'}
          </h2>
          <p className="text-xs text-stone-400 mb-5">
            {isAr ? 'يجب تسجيل الدخول بحساب المدير لتتمكن من تغيير كلمات المرور.' : 'Please log in as Manager to change system passwords.'}
          </p>
          <button
            onClick={closePasswordManagerModal}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded-xl"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManagerPass.trim()) {
      setErrorMsg(isAr ? 'يرجى إدخال كلمة سر للمدير' : 'Please enter manager password');
      return;
    }
    if (!newCashierPass.trim()) {
      setErrorMsg(isAr ? 'يرجى إدخال كلمة سر للكاشير' : 'Please enter cashier password');
      return;
    }

    const res = updatePasswords(newManagerPass, newCashierPass);
    if (res.success) {
      setSuccessMsg(isAr ? 'تم تحديث كلمات المرور بنجاح وحفظها!' : 'Passwords updated successfully!');
      setErrorMsg('');
      playAudioChime();
      setTimeout(() => {
        closePasswordManagerModal();
      }, 1500);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl text-stone-100 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-stone-950 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{isAr ? 'تغيير كلمات المرور (المدير والكاشير)' : 'Change System Passwords'}</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                  {isAr ? 'خاص بالمدير' : 'Manager Only'}
                </span>
              </h2>
              <p className="text-[11px] text-stone-400">
                {isAr ? 'تعديل وتعيين كلمات السر الخاصة بحساب المدير وحساب الكاشير' : 'Manage access passwords for Manager and Cashier accounts'}
              </p>
            </div>
          </div>

          <button
            onClick={closePasswordManagerModal}
            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Security Notice */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-stone-300">
              {isAr 
                ? 'أنت الآن تقوم بتعديل كلمات السر بصلاحية المدير. سيتم تفعيل كلمات المرور الجديدة فوراً وتطبيقها عند تسجيل الدخول أو التبديل بين الحسابات.'
                : 'You are updating system credentials with Manager authority. New passwords take effect immediately.'}
            </p>
          </div>

          {/* 1. Manager Password */}
          <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>{isAr ? 'كلمة سر حساب المدير:' : 'Manager Account Password:'}</span>
              </label>
              <span className="text-[10px] text-amber-400 font-mono">
                {isAr ? 'الصلاحيات الكاملة' : 'Full Access'}
              </span>
            </div>

            <div className="relative">
              <input
                type={showManagerPass ? 'text' : 'password'}
                required
                value={newManagerPass}
                onChange={(e) => setNewManagerPass(e.target.value)}
                placeholder={isAr ? 'أدخل كلمة سر المدير الجديدة' : 'New manager password'}
                className="w-full ps-3.5 pe-10 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowManagerPass(!showManagerPass)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
              >
                {showManagerPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-stone-500">
              {isAr ? 'تُستخدم للوصول لقسم المحاسبة، الإيرادات، وتعديل إعدادات المطعم.' : 'Used to access accounting, reports, and store settings.'}
            </p>
          </div>

          {/* 2. Cashier Password */}
          <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'كلمة سر حساب الكاشير:' : 'Cashier Account Password:'}</span>
              </label>
              <span className="text-[10px] text-emerald-400 font-mono">
                {isAr ? 'مبيعات فقط' : 'POS Sales Only'}
              </span>
            </div>

            <div className="relative">
              <input
                type={showCashierPass ? 'text' : 'password'}
                required
                value={newCashierPass}
                onChange={(e) => setNewCashierPass(e.target.value)}
                placeholder={isAr ? 'أدخل كلمة سر الكاشير الجديدة' : 'New cashier password'}
                className="w-full ps-3.5 pe-10 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowCashierPass(!showCashierPass)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
              >
                {showCashierPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-stone-500">
              {isAr ? 'تُعطى للكاشير لتسجيل الطلبات وتعديل الأسعار بدون الوصول للحسابات.' : 'Given to cashier for POS orders and price modification.'}
            </p>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-400 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-400 animate-fadeIn">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={closePasswordManagerModal}
              className="flex-1 py-2.5 text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition-colors"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isAr ? 'حفظ كلمات السر الجديدة' : 'Save New Passwords'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
