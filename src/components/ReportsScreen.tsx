import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { 
  BarChart3, 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  Banknote, 
  Printer, 
  Lock, 
  Unlock,
  CheckCircle2,
  Calendar,
  Layers,
  Crown,
  Edit2
} from 'lucide-react';

export const ReportsScreen: React.FC = () => {
  const {
    language,
    settings,
    invoices,
    activeShift,
    openOpeningCashModal,
    closeShift,
    startNewShift,
    currentUserRole,
    openAuthModal,
    openShiftClosingModal,
  } = usePOS();

  const isAr = language === 'ar';
  const currency = isAr ? settings.currencySymbolAr : settings.currencySymbolEn;

  // Block Cashier from viewing accounting and revenue
  if (currentUserRole === 'cashier') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-stone-950 text-stone-100 h-[calc(100vh-61px)]">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-4 shadow-lg shadow-amber-500/10 animate-pulse">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">
          {isAr ? 'شاشة المحاسبة والإيرادات مخصصة للمدير فقط' : 'Accounting & Reports Restricted to Manager'}
        </h2>
        <p className="text-xs text-stone-400 max-w-md mb-6 leading-relaxed">
          {isAr
            ? 'حساب الكاشير مخصص لتسجيل الطلبات والمبيعات وتعديل أسعار المنتجات. قسم الإيرادات والمحاسبة محمي ومخصص للمدير فقط.'
            : 'Cashier accounts are restricted to POS ordering and price adjustment. Accounting and revenue analytics are reserved for Manager.'}
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

  const [closingCashInput, setClosingCashInput] = useState<number>(0);
  const [isClosingShiftModal, setIsClosingShiftModal] = useState(false);
  const [newCashierName, setNewCashierName] = useState(settings.defaultCashierName);
  const [newOpeningCash, setNewOpeningCash] = useState<number>(500);

  // Non-cancelled invoices for analytics
  const validInvoices = invoices.filter((i) => i.status !== 'cancelled');

  const totalSales = validInvoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalOrders = validInvoices.length;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const totalTax = validInvoices.reduce((acc, i) => acc + i.taxAmount, 0);

  // Payment Breakdown
  const cashSales = validInvoices
    .filter((i) => i.paymentMethod === 'cash')
    .reduce((acc, i) => acc + i.grandTotal, 0);
  const cardSales = validInvoices
    .filter((i) => i.paymentMethod === 'card')
    .reduce((acc, i) => acc + i.grandTotal, 0);
  const onlineSales = validInvoices
    .filter((i) => i.paymentMethod === 'online')
    .reduce((acc, i) => acc + i.grandTotal, 0);

  // Top Selling Items Aggregation
  const itemCounts: Record<string, { nameAr: string; nameEn: string; qty: number; revenue: number }> = {};
  validInvoices.forEach((inv) => {
    inv.items.forEach((item) => {
      if (!itemCounts[item.itemId]) {
        itemCounts[item.itemId] = {
          nameAr: item.nameAr,
          nameEn: item.nameEn,
          qty: 0,
          revenue: 0,
        };
      }
      itemCounts[item.itemId].qty += item.quantity;
      itemCounts[item.itemId].revenue += item.itemTotal;
    });
  });

  const sortedItems = Object.values(itemCounts).sort((a, b) => b.qty - a.qty);

  // Expected cash in drawer
  const expectedCashInDrawer = activeShift.openingCash + activeShift.totalCashSales;
  const cashVariance = closingCashInput ? closingCashInput - expectedCashInDrawer : 0;

  const handlePrintZReport = () => {
    window.print();
  };

  const handleConfirmCloseShift = () => {
    closeShift(closingCashInput);
    setIsClosingShiftModal(false);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-61px)] overflow-hidden bg-stone-950 text-stone-100">
      {/* Top Header */}
      <div className="px-5 py-4 bg-stone-900 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white">
              {isAr ? 'تقارير المبيعات وإقفال الوردية (Z-Report)' : 'Sales Analytics & Shift Management'}
            </h1>
            <p className="text-[11px] text-stone-400">
              {isAr ? 'متابعة حركة المبيعات، إيرادات اليوم، وجرد الخزينة' : 'Track daily performance, revenue distribution, and register reconciliation'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrintZReport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold rounded-lg border border-stone-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isAr ? 'طباعة تقرير الوردية' : 'Print Shift Report'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* 1. KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
            <span className="text-xs font-semibold text-stone-400 block mb-1">
              {isAr ? 'إجمالي المبيعات' : 'Total Revenue'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-white font-mono-numbers">
                {totalSales.toFixed(2)}
              </span>
              <span className="text-xs text-amber-400 font-bold">{currency}</span>
            </div>
            <span className="text-[10px] text-stone-500 block mt-1">
              {isAr ? 'صافي الإيرادات المسجلة' : 'Net registered sales'}
            </span>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
            <span className="text-xs font-semibold text-stone-400 block mb-1">
              {isAr ? 'عدد الفواتير الصادرة' : 'Invoices Issued'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-white font-mono-numbers">
                {totalOrders}
              </span>
              <span className="text-xs text-stone-400">{isAr ? 'فاتورة' : 'orders'}</span>
            </div>
            <span className="text-[10px] text-stone-500 block mt-1">
              {isAr ? 'طلب ناجح' : 'Completed orders'}
            </span>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
            <span className="text-xs font-semibold text-stone-400 block mb-1">
              {isAr ? 'متوسط قيمة الفاتورة' : 'Average Order'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-white font-mono-numbers">
                {avgOrderValue.toFixed(2)}
              </span>
              <span className="text-xs text-stone-400">{currency}</span>
            </div>
            <span className="text-[10px] text-stone-500 block mt-1">
              {isAr ? 'قيمة السلة المتوسطة' : 'Avg basket value'}
            </span>
          </div>

          {settings.taxRatePercent > 0 ? (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
              <span className="text-xs font-semibold text-stone-400 block mb-1">
                {isAr ? 'ضريبة القيمة المضافة المحصلة' : 'VAT Collected'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-white font-mono-numbers">
                  {totalTax.toFixed(2)}
                </span>
                <span className="text-xs text-stone-400">{currency}</span>
              </div>
              <span className="text-[10px] text-stone-500 block mt-1">
                {settings.taxRatePercent}% {isAr ? 'ضريبة رسمية' : 'tax'}
              </span>
            </div>
          ) : (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
              <span className="text-xs font-semibold text-stone-400 block mb-1">
                {isAr ? 'حالة الضريبة (VAT)' : 'Tax Status'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-bold text-emerald-400">
                  {isAr ? 'بدون ضريبة (0%)' : 'No VAT (0%)'}
                </span>
              </div>
              <span className="text-[10px] text-stone-500 block mt-1">
                {isAr ? 'الأسعار والمبيعات غير خاضعة لـ VAT' : 'Zero VAT'}
              </span>
            </div>
          )}
        </div>

        {/* 2. Shift Status & Drawer Reconciliation Box */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isAr ? 'الوردية الحالية للكاشير' : 'Current Cashier Shift'} ({activeShift.id})
                </h3>
                <p className="text-xs text-stone-400">
                  {isAr ? 'الكاشير المسؤول:' : 'Cashier:'} {activeShift.cashierName} · {isAr ? 'بدأت في:' : 'Opened:'} {new Date(activeShift.openedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {activeShift.status === 'open' ? (
              <button
                type="button"
                onClick={() => {
                  setClosingCashInput(expectedCashInDrawer);
                  setIsClosingShiftModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-300 font-bold text-xs rounded-lg transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isAr ? 'إقفال الوردية وجرد الخزينة (Z-Report)' : 'Close Shift & Reconcile'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => startNewShift(newCashierName, newOpeningCash)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs rounded-lg transition-colors"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>{isAr ? 'فتح وردية جديدة' : 'Open New Shift'}</span>
              </button>
            )}
          </div>

          {/* Drawer cash metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-stone-950 rounded-lg border border-stone-800/80">
              <div className="flex items-center justify-between mb-1">
                <span className="text-stone-400">{isAr ? 'رصيد الافتتاح النقدي' : 'Opening Cash'}</span>
                <button
                  type="button"
                  onClick={openOpeningCashModal}
                  className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 font-bold px-1.5 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                  <span>{isAr ? 'تعديل' : 'Edit'}</span>
                </button>
              </div>
              <span className="text-base font-bold text-amber-300 font-mono-numbers">
                {activeShift.openingCash} {currency}
              </span>
            </div>

            <div className="p-3 bg-stone-950 rounded-lg border border-stone-800/80">
              <span className="text-stone-400 block mb-1">{isAr ? 'مبيعات الكاش النقدية' : 'Cash Sales'}</span>
              <span className="text-base font-bold text-amber-400 font-mono-numbers">
                {activeShift.totalCashSales} {currency}
              </span>
            </div>

            <div className="p-3 bg-stone-950 rounded-lg border border-stone-800/80">
              <span className="text-stone-400 block mb-1">{isAr ? 'مبيعات البطاقات والشبكة' : 'Card / POS Sales'}</span>
              <span className="text-base font-bold text-blue-400 font-mono-numbers">
                {activeShift.totalCardSales} {currency}
              </span>
            </div>

            <div className="p-3 bg-stone-950 rounded-lg border border-stone-800/80">
              <span className="text-stone-400 block mb-1">{isAr ? 'النقد المتوقع بالدرج الآن' : 'Expected in Drawer'}</span>
              <span className="text-base font-bold text-emerald-400 font-mono-numbers">
                {expectedCashInDrawer} {currency}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Two-Column Analytics: Payment Breakdown & Best Selling Burgers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Payment Breakdown Card */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">
              {isAr ? 'توزيع المبيعات حسب طريقة الدفع' : 'Payment Method Distribution'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-stone-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'نقداً (كاش)' : 'Cash'}</span>
                  </span>
                  <span className="font-mono-numbers">{cashSales.toFixed(2)} {currency}</span>
                </div>
                <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${totalSales > 0 ? (cashSales / totalSales) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-stone-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                    <span>{isAr ? 'بطاقات بنكية / شبكة' : 'Card'}</span>
                  </span>
                  <span className="font-mono-numbers">{cardSales.toFixed(2)} {currency}</span>
                </div>
                <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${totalSales > 0 ? (cardSales / totalSales) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-stone-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAr ? 'محافظ إلكترونية / انستاباي' : 'Online / App'}</span>
                  </span>
                  <span className="font-mono-numbers">{onlineSales.toFixed(2)} {currency}</span>
                </div>
                <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${totalSales > 0 ? (onlineSales / totalSales) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Top Selling Burgers & Items */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">
              {isAr ? 'أكثر الأصناف مبيعاً' : 'Best Selling Items'}
            </h3>

            <div className="space-y-2.5">
              {sortedItems.length === 0 ? (
                <p className="text-xs text-stone-500">{isAr ? 'لا توجد بيانات مبيعات بعد' : 'No sales data yet'}</p>
              ) : (
                sortedItems.slice(0, 5).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-stone-950/60 border border-stone-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center font-mono-numbers text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-white">
                        {isAr ? item.nameAr : item.nameEn}
                      </span>
                    </div>

                    <div className="text-end">
                      <span className="font-bold text-stone-300 font-mono-numbers">
                        {item.qty} {isAr ? 'قطعة' : 'sold'}
                      </span>
                      <span className="block text-[10px] text-amber-400 font-mono-numbers">
                        {item.revenue.toFixed(2)} {currency}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Close Shift Confirmation */}
      {isClosingShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4 text-stone-100">
            <h3 className="text-base font-bold text-white">
              {isAr ? 'إقفال الوردية وجرد الخزينة (Z-Report)' : 'Close Shift & Z-Report'}
            </h3>
            <p className="text-xs text-stone-400">
              {isAr ? 'أدخل المبلغ النقدي الفعلي الموجود بالدرج لمقارنته مع المبيعات المسجلة.' : 'Enter the physical cash count in drawer.'}
            </p>

            <div className="p-3 bg-stone-950 rounded-lg border border-stone-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>{isAr ? 'المبلغ المتوقع بالخزينة:' : 'Expected Cash:'}</span>
                <span className="font-bold text-white font-mono-numbers">{expectedCashInDrawer} {currency}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                {isAr ? 'المبلغ الفعلي في الدرج (جرد الكاشير)' : 'Actual Cash Counted in Drawer'}
              </label>
              <input
                type="number"
                step="any"
                value={closingCashInput || ''}
                onChange={(e) => setClosingCashInput(Number(e.target.value))}
                className="w-full px-3 py-2 text-base font-mono-numbers font-bold bg-stone-950 border border-stone-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Variance indicator */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-400">{isAr ? 'الفارق (عجز / زيادة):' : 'Variance:'}</span>
              <span className={`font-mono-numbers font-bold ${
                cashVariance === 0
                  ? 'text-emerald-400'
                  : cashVariance > 0
                  ? 'text-blue-400'
                  : 'text-red-400'
              }`}>
                {cashVariance > 0 ? `+${cashVariance}` : cashVariance} {currency}
                {cashVariance === 0 && ` (${isAr ? 'متطابق تماماً ✓' : 'Balanced'})`}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setIsClosingShiftModal(false)}
                className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmCloseShift}
                className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-stone-950 font-bold text-xs"
              >
                {isAr ? 'تأكيد الإقفال والطباعة' : 'Confirm Close & Print'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
