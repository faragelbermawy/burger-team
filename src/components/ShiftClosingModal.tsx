import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { Invoice } from '../types';
import { 
  X, 
  Send, 
  Copy, 
  Printer, 
  Check, 
  Clock, 
  Receipt, 
  Wallet, 
  CreditCard, 
  Building2, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Phone,
  Coins,
  Edit2
} from 'lucide-react';

export const ShiftClosingModal: React.FC = () => {
  const {
    language,
    settings,
    activeShift,
    invoices,
    closeShift,
    startNewShift,
    updateOpeningCash,
    isShiftClosingModalOpen,
    closeShiftClosingModal,
    generateWhatsAppShiftText,
    sendShiftToWhatsApp,
    playAudioChime,
  } = usePOS();

  const isAr = language === 'ar';
  const currency = isAr ? settings.currencySymbolAr : settings.currencySymbolEn;

  // Filter invoices belonging to this shift (created on or after activeShift.openedAt)
  const shiftInvoices = useMemo(() => {
    const shiftStart = new Date(activeShift.openedAt).getTime();
    return invoices.filter((inv) => {
      const invTime = new Date(inv.createdAt).getTime();
      return invTime >= shiftStart && inv.status !== 'cancelled';
    });
  }, [invoices, activeShift]);

  const totalSales = shiftInvoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const cashSales = shiftInvoices
    .filter((inv) => inv.paymentMethod === 'cash')
    .reduce((acc, inv) => acc + inv.grandTotal, 0);
  const cardSales = shiftInvoices
    .filter((inv) => inv.paymentMethod === 'card')
    .reduce((acc, inv) => acc + inv.grandTotal, 0);
  const onlineSales = shiftInvoices
    .filter((inv) => inv.paymentMethod === 'online')
    .reduce((acc, inv) => acc + inv.grandTotal, 0);

  const expectedCashInDrawer = activeShift.openingCash + cashSales;
  const [actualCashInput, setActualCashInput] = useState<number>(expectedCashInDrawer);
  const [managerPhoneInput, setManagerPhoneInput] = useState<string>(
    settings.managerWhatsAppPhone || '0568888102'
  );

  const [isEditingOpeningCash, setIsEditingOpeningCash] = useState(false);
  const [openingCashInput, setOpeningCashInput] = useState<number>(activeShift.openingCash);

  React.useEffect(() => {
    if (isShiftClosingModalOpen) {
      setManagerPhoneInput(settings.managerWhatsAppPhone || '0568888102');
      setActualCashInput(expectedCashInDrawer);
      setOpeningCashInput(activeShift.openingCash);
    }
  }, [isShiftClosingModalOpen, settings.managerWhatsAppPhone, expectedCashInDrawer, activeShift.openingCash]);

  const handleSaveOpeningCash = () => {
    updateOpeningCash(openingCashInput);
    setIsEditingOpeningCash(false);
    playAudioChime();
  };

  const [copied, setCopied] = useState(false);
  const [isClosingConfirm, setIsClosingConfirm] = useState(false);
  const [nextCashierName, setNextCashierName] = useState(settings.defaultCashierName);
  const [nextOpeningCash, setNextOpeningCash] = useState<number>(200);

  if (!isShiftClosingModalOpen) return null;

  const cashDiff = actualCashInput - expectedCashInDrawer;

  const handleSendWhatsApp = () => {
    playAudioChime();
    const updatedShift = {
      ...activeShift,
      closingCashActual: actualCashInput,
      totalSales,
      totalCashSales: cashSales,
      totalCardSales: cardSales,
      totalOnlineSales: onlineSales,
      totalOrders: shiftInvoices.length,
    };
    sendShiftToWhatsApp(updatedShift, shiftInvoices, managerPhoneInput);
  };

  const handleCopyText = () => {
    const updatedShift = {
      ...activeShift,
      closingCashActual: actualCashInput,
      totalSales,
      totalCashSales: cashSales,
      totalCardSales: cardSales,
      totalOnlineSales: onlineSales,
      totalOrders: shiftInvoices.length,
    };
    const text = generateWhatsAppShiftText(updatedShift, shiftInvoices);
    navigator.clipboard.writeText(text);
    setCopied(true);
    playAudioChime();
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintZReport = () => {
    window.print();
  };

  const handleFinalCloseShift = () => {
    closeShift(actualCashInput);
    startNewShift(nextCashierName || 'كاشير برجر تيم', nextOpeningCash);
    playAudioChime();
    closeShiftClosingModal();
  };

  const openTimeStr = new Date(activeShift.openedAt).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const openDateStr = new Date(activeShift.openedAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-2xl text-stone-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-stone-950 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{isAr ? 'إغلاق الشفت وتصدير الفواتير للمدير' : 'Close Shift & WhatsApp Export'}</span>
                <span className="text-[10px] font-mono bg-stone-800 px-2 py-0.5 rounded text-amber-400 border border-stone-700">
                  {activeShift.id}
                </span>
              </h2>
              <p className="text-[11px] text-stone-400">
                {isAr ? 'إرسال ملخص الوردية والفواتير الصادرة مباشرة إلى واتساب المدير' : 'Send shift summary and invoices directly to Manager WhatsApp'}
              </p>
            </div>
          </div>

          <button
            onClick={closeShiftClosingModal}
            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Shift Meta Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-stone-950/70 border border-stone-800 rounded-lg">
              <span className="text-[10px] text-stone-400 block">{isAr ? 'الكاشير المسؤول' : 'Cashier'}</span>
              <span className="text-xs font-bold text-white truncate block">{activeShift.cashierName}</span>
            </div>
            <div className="p-3 bg-stone-950/70 border border-stone-800 rounded-lg">
              <span className="text-[10px] text-stone-400 block">{isAr ? 'وقت بدء الشفت' : 'Opened At'}</span>
              <span className="text-xs font-bold text-stone-300 block font-mono">{openDateStr} · {openTimeStr}</span>
            </div>
            <div className="p-3 bg-stone-950/70 border border-stone-800 rounded-lg">
              <span className="text-[10px] text-stone-400 block">{isAr ? 'عدد الفواتير' : 'Invoices Count'}</span>
              <span className="text-sm font-black text-amber-400 block font-mono-numbers">{shiftInvoices.length} {isAr ? 'طلب' : 'orders'}</span>
            </div>
            <div className="p-3 bg-stone-950/70 border border-stone-800 rounded-lg">
              <span className="text-[10px] text-stone-400 block">{isAr ? 'إجمالي المبيعات' : 'Total Revenue'}</span>
              <span className="text-sm font-black text-emerald-400 block font-mono-numbers">{totalSales.toFixed(2)} {currency}</span>
            </div>
          </div>

          {/* Payment Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-stone-950/90 border border-stone-800 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  {isAr ? 'مبيعات الكاش' : 'Cash Sales'}
                </span>
                <span className="font-mono text-[10px] text-stone-500">
                  {shiftInvoices.filter((i) => i.paymentMethod === 'cash').length} {isAr ? 'طلب' : ''}
                </span>
              </div>
              <div className="text-base font-extrabold text-white font-mono-numbers">
                {cashSales.toFixed(2)} {currency}
              </div>
            </div>

            <div className="p-3 bg-stone-950/90 border border-stone-800 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="flex items-center gap-1.5 font-semibold">
                  <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                  {isAr ? 'مبيعات الشبكة (مدى)' : 'Card Sales'}
                </span>
                <span className="font-mono text-[10px] text-stone-500">
                  {shiftInvoices.filter((i) => i.paymentMethod === 'card').length} {isAr ? 'طلب' : ''}
                </span>
              </div>
              <div className="text-base font-extrabold text-white font-mono-numbers">
                {cardSales.toFixed(2)} {currency}
              </div>
            </div>

            <div className="p-3 bg-stone-950/90 border border-stone-800 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  {isAr ? 'عهدة الدرج الافتتاحية' : 'Opening Cash'}
                </span>
                {!isEditingOpeningCash && (
                  <button
                    type="button"
                    onClick={() => setIsEditingOpeningCash(true)}
                    className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 font-bold px-1.5 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
                    title={isAr ? 'تعديل الرصيد الافتتاحي للشفت' : 'Edit opening cash'}
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                    <span>{isAr ? 'تعديل' : 'Edit'}</span>
                  </button>
                )}
              </div>

              {!isEditingOpeningCash ? (
                <div className="text-base font-extrabold text-amber-300 font-mono-numbers">
                  {activeShift.openingCash.toFixed(2)} {currency}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 pt-0.5 animate-fadeIn">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    autoFocus
                    value={openingCashInput}
                    onChange={(e) => setOpeningCashInput(Math.max(0, Number(e.target.value) || 0))}
                    className="w-24 px-2 py-1 bg-stone-900 border border-amber-500/60 rounded text-xs font-mono font-bold text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveOpeningCash}
                    className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[10px] rounded transition-colors"
                  >
                    {isAr ? 'حفظ' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpeningCashInput(activeShift.openingCash);
                      setIsEditingOpeningCash(false);
                    }}
                    className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-400 text-[10px] rounded transition-colors"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Cash Drawer Reconciliation */}
          <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center justify-between">
              <span>{isAr ? 'مطابقة درج النقدية (الكاش الفعلي)' : 'Cash Drawer Reconciliation'}</span>
              <span className="text-[11px] text-stone-400">
                {isAr ? 'العهدة الافتتاحية + مبيعات الكاش' : 'Opening + Cash Sales'} = <strong className="text-amber-400 font-mono-numbers">{expectedCashInDrawer.toFixed(2)} {currency}</strong>
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">
                  {isAr ? 'المبلغ الفعلي الموجود بالدرج حالياً:' : 'Actual Cash Count in Drawer:'}
                </label>
                <input
                  type="number"
                  step="any"
                  value={actualCashInput}
                  onChange={(e) => setActualCashInput(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono font-bold text-base focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className={`p-3 rounded-lg border flex items-center gap-2.5 ${
                cashDiff === 0
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : cashDiff > 0
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {cashDiff === 0 ? (
                  <Check className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                )}
                <div>
                  <span className="text-xs font-bold block">
                    {cashDiff === 0 
                      ? (isAr ? 'الدرج متطابق تماماً بدون عجز' : 'Balanced - No Discrepancy') 
                      : cashDiff > 0 
                      ? (isAr ? `يوجد زيادة في الدرج: +${cashDiff.toFixed(2)} ${currency}` : `Over by +${cashDiff.toFixed(2)} ${currency}`) 
                      : (isAr ? `يوجد عجز في الدرج: ${cashDiff.toFixed(2)} ${currency}` : `Short by ${cashDiff.toFixed(2)} ${currency}`)}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {isAr ? 'سيتم تضمين هذا البيان في تقرير الواتساب المرسل للمدير' : 'This will be included in the WhatsApp report'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoices List of Shift */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-stone-900/80 border-b border-stone-800 flex items-center justify-between text-xs">
              <span className="font-bold text-white">
                {isAr ? 'فواتير هذا الشفت' : 'Shift Invoices'} ({shiftInvoices.length})
              </span>
              <span className="text-[11px] text-stone-400">
                {isAr ? 'مرتبة من الأحدث إلى الأقدم' : 'Newest to oldest'}
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto divide-y divide-stone-800/60 text-xs">
              {shiftInvoices.length === 0 ? (
                <div className="py-6 text-center text-stone-500">
                  {isAr ? 'لم يتم إصدار فواتير بعد خلال هذا الشفت' : 'No invoices issued in this shift yet'}
                </div>
              ) : (
                shiftInvoices.map((inv) => (
                  <div key={inv.id} className="p-3 flex items-center justify-between gap-2 hover:bg-stone-900/40">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded bg-stone-800 flex items-center justify-center font-bold text-amber-400 font-mono-numbers">
                        #{inv.dailyOrderNumber}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-stone-300 font-semibold">{inv.invoiceNumber}</span>
                          <span className="text-[10px] text-stone-500">
                            {new Date(inv.createdAt).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {inv.orderType === 'dine-in' ? (isAr ? `صالة (طاولة ${inv.tableNumber || '-'})` : 'Dine-In') : inv.orderType === 'takeaway' ? (isAr ? 'سفري' : 'Takeaway') : (isAr ? 'توصيل' : 'Delivery')}
                          {inv.customer?.name && ` · ${inv.customer.name}`}
                        </div>
                      </div>
                    </div>

                    <div className="text-end">
                      <span className="font-bold text-white font-mono-numbers block">
                        {inv.grandTotal.toFixed(2)} {currency}
                      </span>
                      <span className="text-[10px] text-stone-400 uppercase font-mono">
                        {inv.paymentMethod === 'cash' ? (isAr ? 'كاش' : 'Cash') : inv.paymentMethod === 'card' ? (isAr ? 'شبكة' : 'Card') : 'Online'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* WhatsApp Export Action Box (PRIMARY USER REQUEST) */}
          <div className="p-4 bg-emerald-950/20 border-2 border-emerald-500/40 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isAr ? 'تصدير التقرير والفواتير لواتساب المدير (WhatsApp)' : 'Export Invoices & Shift to WhatsApp'}</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono font-bold">
                WhatsApp Ready
              </span>
            </div>

            {/* Manager Phone Input */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Phone className="w-3.5 h-3.5 text-stone-500 absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={managerPhoneInput}
                  onChange={(e) => setManagerPhoneInput(e.target.value)}
                  placeholder="0568888102"
                  className="w-full ps-9 pe-3 py-2 text-xs bg-stone-950 border border-stone-700 rounded-lg text-white font-mono placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <span className="text-[11px] text-stone-400 shrink-0">
                {isAr ? 'رقم هاتف المدير' : 'Manager WhatsApp'}
              </span>
            </div>

            {/* Big Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <Send className="w-4 h-4" />
                <span>{isAr ? '📲 إرسال التقرير والفواتير لواتساب المدير الآن' : 'Send Report & Invoices to WhatsApp'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className="py-3 px-3.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ النص' : 'Copy Text')}</span>
              </button>

              <button
                type="button"
                onClick={handlePrintZReport}
                className="py-3 px-3.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>{isAr ? 'طباعة Z-Report' : 'Print Z'}</span>
              </button>
            </div>
          </div>

          {/* Close Shift & Open New Shift Section */}
          <div className="pt-2 border-t border-stone-800">
            {!isClosingConfirm ? (
              <button
                type="button"
                onClick={() => setIsClosingConfirm(true)}
                className="w-full py-2.5 text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isAr ? 'إغلاق الوردية الحالية وبدء شفت جديد' : 'Close Current Shift & Start New Shift'}</span>
              </button>
            ) : (
              <div className="p-4 bg-stone-950 border border-amber-500/40 rounded-xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400">
                    {isAr ? 'تأكيد إغلاق الشفت وبدء شفت جديد:' : 'Confirm Shift Closing & New Shift:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsClosingConfirm(false)}
                    className="text-stone-400 hover:text-white"
                  >
                    {isAr ? 'تراجع' : 'Back'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-400 mb-1">{isAr ? 'اسم الكاشير للشفت الجديد' : 'New Cashier Name'}</label>
                    <input
                      type="text"
                      value={nextCashierName}
                      onChange={(e) => setNextCashierName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 mb-1">{isAr ? 'العهدة الافتتاحية الجديدة' : 'Opening Cash'} ({currency})</label>
                    <input
                      type="number"
                      value={nextOpeningCash}
                      onChange={(e) => setNextOpeningCash(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono-numbers"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFinalCloseShift}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-colors shadow-sm"
                >
                  {isAr ? 'تأكيد الإغلاق وبدء الشفت الآن' : 'Confirm Close & Start New Shift'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
