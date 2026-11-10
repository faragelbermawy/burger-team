import React from 'react';
import { usePOS } from '../context/POSContext';
import { 
  Flame, 
  UtensilsCrossed, 
  ChefHat, 
  ReceiptText, 
  BarChart3, 
  SlidersHorizontal,
  Settings as SettingsIcon,
  Globe,
  Users,
  Sparkles,
  Crown,
  UserCheck,
  Lock,
  Send,
  KeyRound,
  LogOut,
  Coins
} from 'lucide-react';
import { BurgerLogo } from './BurgerLogo';

export const Navbar: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    activeView, 
    setActiveView, 
    invoices, 
    settings,
    activeShift,
    openOpeningCashModal,
    openCustomBuilder,
    currentUserRole,
    openAuthModal,
    openShiftClosingModal,
    openPasswordManagerModal,
    logout,
  } = usePOS();

  const isAr = language === 'ar';

  // Count active kitchen orders
  const activeKitchenCount = invoices.filter(
    (i) => i.status === 'pending' || i.status === 'preparing'
  ).length;

  const handleNavClick = (view: typeof activeView) => {
    if (currentUserRole === 'cashier' && (view === 'reports' || view === 'settings')) {
      openAuthModal('manager');
      return;
    }
    setActiveView(view);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 sm:gap-6 px-3 sm:px-5 py-3 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100 select-none">
      {/* Zone 1: Brand Wordmark & Sandwich Logo */}
      <div 
        onClick={() => setActiveView('pos')}
        className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0 group"
      >
        <BurgerLogo size="md" />
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-sm sm:text-base font-black tracking-tight text-white whitespace-nowrap group-hover:text-amber-300 transition-colors">
              {isAr ? settings.nameAr : settings.nameEn}
            </span>
            <span className="hidden md:inline-block text-[11px] font-bold text-amber-400/90 whitespace-nowrap">
              BURGER TEAM
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-stone-400 whitespace-nowrap hidden sm:inline-block">
              {isAr ? 'نظام الكاشير ونقاط البيع' : 'POS & Billing System'}
            </span>
            <span className="hidden xl:inline-flex items-center gap-1 text-[9px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isAr ? 'تزامن مباشر' : 'Live Sync'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5">
        <button
          onClick={() => handleNavClick('pos')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'pos'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>{isAr ? 'نقطة البيع' : 'POS'}</span>
        </button>

        <button
          onClick={() => handleNavClick('kitchen')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 relative ${
            activeView === 'kitchen'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
          }`}
        >
          <ChefHat className="w-3.5 h-3.5" />
          <span>{isAr ? 'المطبخ' : 'Kitchen'}</span>
          {activeKitchenCount > 0 && (
            <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded ${
              activeView === 'kitchen' ? 'bg-stone-950 text-amber-400' : 'bg-amber-500 text-stone-950'
            }`}>
              {activeKitchenCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleNavClick('invoices')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'invoices'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
          }`}
        >
          <ReceiptText className="w-3.5 h-3.5" />
          <span>{isAr ? 'الفواتير' : 'Invoices'}</span>
        </button>

        <button
          onClick={() => handleNavClick('customers')}
          className={`hidden lg:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'customers'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{isAr ? 'العملاء' : 'Customers'}</span>
        </button>

        <button
          onClick={() => handleNavClick('menu')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'menu'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{isAr ? 'المنيو' : 'Menu'}</span>
        </button>

        {/* Reports / Accounting Link (Protected from Cashier) */}
        <button
          onClick={() => handleNavClick('reports')}
          title={currentUserRole === 'cashier' ? (isAr ? 'مغلق: المحاسبة مخصصة للمدير فقط' : 'Protected: Manager only') : ''}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'reports'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : currentUserRole === 'cashier'
              ? 'text-stone-500 hover:text-amber-400/80 bg-stone-950/40 border border-dashed border-stone-800'
              : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>{isAr ? 'المحاسبة والتقارير' : 'Accounting & Reports'}</span>
          {currentUserRole === 'cashier' && <Lock className="w-3 h-3 text-amber-500/80" />}
        </button>

        {/* Settings Link (Protected from Cashier) */}
        <button
          onClick={() => handleNavClick('settings')}
          title={currentUserRole === 'cashier' ? (isAr ? 'مغلق: الإعدادات مخصصة للمدير فقط' : 'Protected: Manager only') : ''}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'settings'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : currentUserRole === 'cashier'
              ? 'text-stone-500 hover:text-amber-400/80 bg-stone-950/40 border border-dashed border-stone-800'
              : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
          }`}
        >
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>{isAr ? 'الإعدادات' : 'Settings'}</span>
          {currentUserRole === 'cashier' && <Lock className="w-3 h-3 text-amber-500/80" />}
        </button>
      </nav>

      {/* Zone 3: Actions, Shift WhatsApp, and User Role Switcher */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Shift Opening Cash Balance Button for Cashier & Manager */}
        <button
          onClick={openOpeningCashModal}
          title={isAr ? 'تعديل الرصيد الافتتاحي للشفت' : 'Edit opening shift cash float'}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-stone-800/90 hover:bg-stone-800 text-stone-200 hover:text-amber-300 border border-stone-700/80 hover:border-amber-500/50 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">{isAr ? 'العهدة:' : 'Float:'}</span>
          <span className="font-mono text-amber-300 font-black">{activeShift.openingCash} {isAr ? settings.currencySymbolAr : settings.currencySymbolEn}</span>
        </button>

        {/* End of Shift WhatsApp Export Button (User explicitly requested) */}
        <button
          onClick={openShiftClosingModal}
          title={isAr ? 'تقفيل الشفت وتصدير الفواتير لواتساب المدير' : 'Close shift & export invoices to manager WhatsApp'}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-emerald-950/50"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isAr ? 'تقفيل الشفت (واتساب)' : 'End Shift (WhatsApp)'}</span>
          <span className="sm:hidden">{isAr ? 'الواتساب' : 'WA'}</span>
        </button>

        {/* User Account Role Switcher Badge */}
        <button
          onClick={() => openAuthModal(currentUserRole === 'manager' ? 'cashier' : 'manager')}
          title={isAr ? 'تبديل الحساب' : 'Switch user role'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all whitespace-nowrap shrink-0 ${
            currentUserRole === 'manager'
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
          }`}
        >
          {currentUserRole === 'manager' ? (
            <>
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'المدير' : 'Manager'}</span>
            </>
          ) : (
            <>
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'الكاشير' : 'Cashier'}</span>
            </>
          )}
        </button>

        {/* Manager Password Change Button */}
        {currentUserRole === 'manager' && (
          <button
            onClick={openPasswordManagerModal}
            title={isAr ? 'تغيير كلمات سر المدير والكاشير' : 'Change Passwords'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isAr ? 'تغيير كلمات السر' : 'Passwords'}</span>
          </button>
        )}

        {/* Logout / Lock POS Button */}
        <button
          onClick={logout}
          title={isAr ? 'تسجيل الخروج وقفل النظام' : 'Log out & Lock POS'}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800/80 hover:bg-red-500/20 text-stone-300 hover:text-red-400 border border-stone-700/60 hover:border-red-500/40 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isAr ? 'تسجيل خروج' : 'Logout'}</span>
        </button>

        {/* Custom Burger Builder */}
        <button
          onClick={openCustomBuilder}
          title={isAr ? 'فتح صانع البرجر الديناميكي' : 'Open Custom Burger Builder'}
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isAr ? 'ابتكر برجر' : 'Build Burger'}</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(isAr ? 'en' : 'ar')}
          title={isAr ? 'تبديل للغة الإنجليزية' : 'Switch to Arabic'}
          className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-800/70 hover:bg-stone-800 border border-stone-700/60 rounded-md transition-colors whitespace-nowrap shrink-0"
        >
          <Globe className="w-3.5 h-3.5 text-stone-400" />
          <span className="font-mono">{isAr ? 'EN' : 'عربي'}</span>
        </button>
      </div>
    </header>
  );
};
