import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { RestaurantSettings } from '../types';
import { 
  Settings as SettingsIcon, 
  Save, 
  Building2, 
  FileText, 
  Volume2, 
  Wifi, 
  CheckCircle,
  Percent,
  Coins,
  Lock,
  Crown,
  KeyRound,
  UserCheck
} from 'lucide-react';
import { BurgerLogo } from './BurgerLogo';

export const SettingsScreen: React.FC = () => {
  const {
    language,
    settings,
    updateSettings,
    playAudioChime,
    currentUserRole,
    openAuthModal,
    openPasswordManagerModal,
  } = usePOS();

  const isAr = language === 'ar';

  // Guard settings from cashier
  if (currentUserRole === 'cashier') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-stone-950 text-stone-100 h-[calc(100vh-61px)]">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-4 shadow-lg shadow-amber-500/10 animate-pulse">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">
          {isAr ? 'إعدادات المطعم مخصصة للمدير فقط' : 'Restaurant Settings Restricted to Manager'}
        </h2>
        <p className="text-xs text-stone-400 max-w-md mb-6 leading-relaxed">
          {isAr
            ? 'تعديل هوية المطعم، الرقم الضريبي، العملة، ورقم هاتف المدير محمي ومخصص لحساب المدير.'
            : 'Store identity, tax rate, and settings are reserved for Manager.'}
        </p>
        <button
          onClick={() => openAuthModal('manager')}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <Crown className="w-4 h-4" />
          <span>{isAr ? 'تسجيل دخول المدير' : 'Manager Login'}</span>
        </button>
      </div>
    );
  }

  const [formData, setFormData] = useState<RestaurantSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    playAudioChime();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCurrencyChange = (curr: 'EGP' | 'SAR' | 'AED' | 'USD') => {
    let symbolAr = 'ج.م';
    let symbolEn = 'EGP';
    if (curr === 'SAR') {
      symbolAr = 'ر.س';
      symbolEn = 'SAR';
    } else if (curr === 'AED') {
      symbolAr = 'د.إ';
      symbolEn = 'AED';
    } else if (curr === 'USD') {
      symbolAr = '$';
      symbolEn = 'USD';
    }

    setFormData((prev) => ({
      ...prev,
      currency: curr,
      currencySymbolAr: symbolAr,
      currencySymbolEn: symbolEn,
    }));
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-61px)] overflow-hidden bg-stone-950 text-stone-100">
      {/* Top Header */}
      <div className="px-5 py-4 bg-stone-900 border-b border-stone-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <SettingsIcon className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white">
              {isAr ? 'إعدادات المطعم والفواتير' : 'Restaurant & Receipt Settings'}
            </h1>
            <p className="text-[11px] text-stone-400">
              {isAr ? 'تخصيص بيانات المطعم، الرقم الضريبي، العملة، ورسائل الفاتورة الحرارية' : 'Customize business identity, tax numbers, currency, and receipt layout'}
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg animate-fadeIn">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{isAr ? 'تم حفظ التعديلات بنجاح' : 'Settings saved successfully'}</span>
          </div>
        )}
      </div>

      {/* Settings Form */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-3xl space-y-6">
          {/* 1. Restaurant Identity */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Building2 className="w-4 h-4 text-amber-500" />
                <span>{isAr ? 'هوية المطعم وشعار المحل' : 'Restaurant Identity & Logo'}</span>
              </div>
              <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {isAr ? 'شعار ساندوتش البرجر معتمد' : 'Burger Sandwich Logo Active'}
              </span>
            </div>

            {/* Logo Preview Banner */}
            <div className="flex items-center gap-4 p-3.5 bg-stone-950/80 rounded-xl border border-stone-800">
              <BurgerLogo size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-white">
                    {formData.nameAr || 'برجر تيم'}
                  </h3>
                  <span className="text-xs font-bold text-amber-400">BURGER TEAM</span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  {isAr 
                    ? 'شعار ساندوتش برجر كلاسيكي بالجبن المذاب واللحم المشوي، يظهر في شريط النظام العلوي وعلى إيصالات الفواتير الحرارية.'
                    : 'Classic gourmet burger sandwich emblem with melted cheddar, displayed on navbar and thermal invoices.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  {isAr ? 'اسم المطعم (بالعربية) - يظهر بالفاتورة' : 'Restaurant Name (Arabic)'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.nameAr}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nameAr: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  {isAr ? 'اسم المطعم (بالإنجليزية)' : 'Restaurant Name (English)'}
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nameEn: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  {isAr ? 'اسم الفرع' : 'Branch Name'}
                </label>
                <input
                  type="text"
                  value={formData.branchAr}
                  onChange={(e) => setFormData((prev) => ({ ...prev, branchAr: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  {isAr ? 'رقم الهاتف المطبوع على الفاتورة' : 'Phone Number'}
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1 flex items-center justify-between">
                  <span>{isAr ? 'رقم واتساب المدير (لاستلام الفواتير)' : 'Manager WhatsApp'}</span>
                  <span className="text-[10px] text-emerald-400 font-normal">{isAr ? 'يستلم تقفيل الشفت' : 'Shift Reports'}</span>
                </label>
                <input
                  type="text"
                  value={formData.managerWhatsAppPhone || ''}
                  placeholder="0568888102"
                  onChange={(e) => setFormData((prev) => ({ ...prev, managerWhatsAppPhone: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white font-mono placeholder-stone-600 focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-300 font-semibold mb-1">
                  {isAr ? 'عنوان المحل / الفرع' : 'Address'}
                </label>
                <input
                  type="text"
                  value={formData.addressAr}
                  onChange={(e) => setFormData((prev) => ({ ...prev, addressAr: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          {/* 2. Tax & Currency Settings */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-800 text-sm font-bold text-white">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'الضرائب والعملة الرسمية' : 'Taxes & Currency'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  {isAr ? 'الرقم الضريبي (VAT Registration Number)' : 'VAT Number'}
                </label>
                <input
                  type="text"
                  value={formData.vatNumber}
                  placeholder={isAr ? 'اتركه فارغاً إذا كان المحل غير مسجل بالضريبة' : 'Leave empty if non-VAT'}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vatNumber: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white font-mono placeholder-stone-600"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1 flex items-center justify-between">
                  <span>{isAr ? 'نسبة ضريبة القيمة المضافة (%)' : 'VAT Percentage (%)'}</span>
                  <span className="text-[10px] text-stone-400 font-normal">{isAr ? '(0 = بدون ضريبة)' : '(0 = No VAT)'}</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.taxRatePercent}
                  onChange={(e) => setFormData((prev) => ({ ...prev, taxRatePercent: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white font-mono-numbers"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-300 font-semibold mb-2">
                  {isAr ? 'العملة المعمول بها' : 'Active Currency'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'EGP', labelAr: 'جنيه مصري (ج.م)', labelEn: 'EGP' },
                    { id: 'SAR', labelAr: 'ريال سعودي (ر.س)', labelEn: 'SAR' },
                    { id: 'AED', labelAr: 'درهم إماراتي (د.إ)', labelEn: 'AED' },
                    { id: 'USD', labelAr: 'دولار أمريكي ($)', labelEn: 'USD' },
                  ].map((curr) => {
                    const isSelected = formData.currency === curr.id;
                    return (
                      <button
                        key={curr.id}
                        type="button"
                        onClick={() => handleCurrencyChange(curr.id as 'EGP' | 'SAR' | 'AED' | 'USD')}
                        className={`p-2.5 rounded-lg border text-center transition-all ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-white font-bold'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white'
                        }`}
                      >
                        {isAr ? curr.labelAr : curr.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Receipt Messages & Wi-Fi */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-800 text-sm font-bold text-white">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'نصوص الفاتورة الحرارية وبيانات الضيافة' : 'Receipt Custom Notes & Wi-Fi'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  {isAr ? 'رسالة رأس الفاتورة' : 'Receipt Header Message'}
                </label>
                <input
                  type="text"
                  value={formData.receiptHeaderMsgAr}
                  onChange={(e) => setFormData((prev) => ({ ...prev, receiptHeaderMsgAr: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  {isAr ? 'رسالة تذييل الفاتورة' : 'Receipt Footer Message'}
                </label>
                <input
                  type="text"
                  value={formData.receiptFooterMsgAr}
                  onChange={(e) => setFormData((prev) => ({ ...prev, receiptFooterMsgAr: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          {/* 4. Passwords & Security Management (For Manager) */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>{isAr ? 'إدارة كلمات المرور والأمان (المدير والكاشير)' : 'Security & Passwords Management'}</span>
              </div>
              <button
                type="button"
                onClick={openPasswordManagerModal}
                className="text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isAr ? 'تغيير كلمات السر الآن' : 'Change Passwords'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-stone-950 rounded-lg border border-stone-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'حساب المدير' : 'Manager Account'}</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                    ••••••••
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">
                  {isAr ? 'صلاحيات كاملة للمحاسبة والإيرادات وإدارة الأسعار وقائمة الطعام.' : 'Full access to accounting, revenue, and system settings.'}
                </p>
              </div>

              <div className="p-3 bg-stone-950 rounded-lg border border-stone-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAr ? 'حساب الكاشير' : 'Cashier Account'}</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    ••••••••
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">
                  {isAr ? 'صلاحية لتسجيل الطلبات وتعديل الأسعار بدون الوصول للحسابات.' : 'Sales and price modification access without revenue reports.'}
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs transition-colors shadow-lg shadow-amber-500/20"
            >
              <Save className="w-4 h-4" />
              <span>{isAr ? 'حفظ إعدادات النظام' : 'Save System Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
