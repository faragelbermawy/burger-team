import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { 
  Printer, 
  X, 
  Copy 
} from 'lucide-react';
import { BurgerLogo } from './BurgerLogo';

export const ReceiptModal: React.FC = () => {
  const {
    language,
    settings,
    selectedInvoiceForPrint,
    isReceiptModalOpen,
    closeReceiptModal,
  } = usePOS();

  const [receiptFormat, setReceiptFormat] = useState<'thermal' | 'a4'>('thermal');
  const [copied, setCopied] = useState(false);

  if (!isReceiptModalOpen || !selectedInvoiceForPrint) return null;

  const inv = selectedInvoiceForPrint;
  const isAr = language === 'ar';
  const currency = isAr ? settings.currencySymbolAr : settings.currencySymbolEn;
  const customerName = inv.customer?.name?.trim() ? inv.customer.name : (isAr ? 'عميل نقدي' : 'Walk-in Customer');

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `
🍔 ${isAr ? settings.nameAr : settings.nameEn}
🧾 فاتورة رقم: ${inv.invoiceNumber} (طلب #${inv.dailyOrderNumber})
👤 العميل: ${customerName}
📅 التاريخ: ${new Date(inv.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
👤 الكاشير: ${inv.cashierName}
------------------------
${inv.items.map((i) => `• ${i.quantity}x ${isAr ? i.nameAr : i.nameEn} = ${i.itemTotal} ${currency}`).join('\n')}
------------------------
الإجمالي: ${inv.grandTotal} ${currency}
طريقة الدفع: ${inv.paymentMethod}
شكراً لزيارتكم!
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(inv.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = new Date(inv.createdAt).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md max-h-[92vh] flex flex-col bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-2xl text-stone-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Control Bar (Screen Only - Not Printed) */}
        <div className="no-print flex items-center justify-between px-4 py-3 bg-stone-950 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs sm:text-sm font-bold text-white">
              {isAr ? 'فاتورة الطلب جاهزة' : 'Invoice Ready'}
            </span>
          </div>

          {/* Toggle Thermal / A4 */}
          <div className="flex items-center gap-2">
            <div className="flex bg-stone-800 rounded-md p-0.5 border border-stone-700">
              <button
                type="button"
                onClick={() => setReceiptFormat('thermal')}
                className={`px-2 py-0.5 text-xs font-semibold rounded transition-colors ${
                  receiptFormat === 'thermal'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                {isAr ? 'حراري (مضغوط)' : 'Thermal'}
              </button>
              <button
                type="button"
                onClick={() => setReceiptFormat('a4')}
                className={`px-2 py-0.5 text-xs font-semibold rounded transition-colors ${
                  receiptFormat === 'a4'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                {isAr ? 'A4' : 'A4'}
              </button>
            </div>

            <button
              onClick={closeReceiptModal}
              className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Preview Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-stone-950/70 flex justify-center">
          {/* Printable Receipt Paper Container (Compact Thermal Style) */}
          <div
            id="printable-receipt"
            className={`bg-white text-stone-900 rounded-lg p-3.5 sm:p-4 shadow-xl transition-all ${
              receiptFormat === 'thermal'
                ? 'w-full max-w-[270px] font-mono-numbers text-[11px] leading-tight'
                : 'w-full max-w-[460px] text-xs'
            }`}
          >
            {/* 1. Header & Brand (Compact) */}
            <div className="text-center pb-2 border-b border-dashed border-stone-400 space-y-0.5">
              <div className="flex flex-col items-center justify-center mb-0.5">
                <BurgerLogo size="sm" className="mb-0.5" />
                <span className="text-[9px] font-black tracking-widest text-stone-700 uppercase">
                  BURGER TEAM
                </span>
              </div>
              <h1 className="text-sm font-black text-stone-950 leading-snug">
                {isAr ? settings.nameAr : settings.nameEn}
              </h1>
              <p className="text-[10px] text-stone-600">
                {isAr ? settings.branchAr : settings.branchEn}
              </p>
              <p className="text-[10px] text-stone-600 font-mono">
                {isAr ? 'هاتف:' : 'Tel:'} {settings.phone}
              </p>
            </div>

            {/* 2. Order Call Number (Compact pickup ticket) */}
            <div className="text-center py-1.5 my-1.5 bg-stone-100 rounded border border-stone-300">
              <span className="text-[10px] block font-semibold text-stone-600">
                {isAr ? 'رقم استلام الطلب' : 'Order Pickup #'}
              </span>
              <span className="text-xl font-black text-stone-950 tracking-wider">
                #{inv.dailyOrderNumber}
              </span>
            </div>

            {/* 3. Invoice Metadata & Prominent Customer Name */}
            <div className="py-1.5 border-b border-dashed border-stone-400 space-y-1 text-[10px]">
              {/* Highlighted Customer Name (Explicit user requirement) */}
              <div className="flex justify-between items-center py-1 px-1.5 bg-stone-100 rounded border border-stone-300 font-bold text-[11px]">
                <span className="text-stone-700">{isAr ? 'اسم العميل:' : 'Customer:'}</span>
                <span className="font-black text-stone-950 text-xs">
                  {customerName}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-500">{isAr ? 'رقم الفاتورة:' : 'Invoice:'}</span>
                <span className="font-bold text-stone-900">{inv.invoiceNumber}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-500">{isAr ? 'التاريخ والوقت:' : 'Date & Time:'}</span>
                <span className="text-stone-800">{formattedDate} · {formattedTime}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-500">{isAr ? 'نوع الطلب:' : 'Order Type:'}</span>
                <span className="font-bold text-stone-900">
                  {inv.orderType === 'dine-in'
                    ? (isAr ? `صالة (طاولة ${inv.tableNumber || '-'})` : `Dine-In (T-${inv.tableNumber || '-'})`)
                    : inv.orderType === 'takeaway'
                    ? (isAr ? 'تيك أواي / سفري' : 'Takeaway')
                    : (isAr ? 'توصيل منزلي' : 'Delivery')}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-500">{isAr ? 'الكاشير:' : 'Cashier:'}</span>
                <span className="text-stone-800">{inv.cashierName}</span>
              </div>

              {inv.customer?.phone && (
                <div className="flex justify-between text-stone-600">
                  <span>{isAr ? 'هاتف العميل:' : 'Phone:'}</span>
                  <span className="font-mono">{inv.customer.phone}</span>
                </div>
              )}

              {inv.customer?.address && (
                <div className="pt-0.5 text-[9px] text-stone-700 bg-stone-50 p-1 rounded border border-stone-200">
                  <span className="font-bold">{isAr ? 'عنوان التوصيل: ' : 'Address: '}</span>
                  <span>{inv.customer.address}</span>
                </div>
              )}
            </div>

            {/* 4. Itemized Table (Compact) */}
            <div className="py-1.5 border-b border-dashed border-stone-400">
              <div className="flex justify-between font-bold text-stone-900 pb-1 border-b border-stone-300 text-[10px]">
                <span className="w-1/2">{isAr ? 'الصنف' : 'Item'}</span>
                <span className="w-1/6 text-center">{isAr ? 'الكمية' : 'Qty'}</span>
                <span className="w-1/3 text-end">{isAr ? 'المجموع' : 'Total'}</span>
              </div>

              <div className="divide-y divide-stone-100 py-0.5">
                {inv.items.map((item, idx) => (
                  <div key={idx} className="py-1 text-[10px]">
                    <div className="flex justify-between items-baseline font-medium text-stone-900">
                      <span className="w-1/2 font-semibold">
                        {isAr ? item.nameAr : item.nameEn}
                        {item.selectedSize && (
                          <span className="text-[9px] font-normal text-stone-500 block">
                            ({isAr ? item.selectedSize.nameAr : item.selectedSize.nameEn})
                          </span>
                        )}
                      </span>
                      <span className="w-1/6 text-center font-bold">{item.quantity}</span>
                      <span className="w-1/3 text-end font-bold font-mono-numbers">
                        {item.itemTotal.toFixed(2)} {currency}
                      </span>
                    </div>

                    {/* Extra Toppings */}
                    {item.selectedToppings && item.selectedToppings.length > 0 && (
                      <div className="ps-1.5 text-[9px] text-stone-500 space-y-0.2 mt-0.5">
                        {item.selectedToppings.map((top, tIdx) => (
                          <div key={tIdx} className="flex justify-between">
                            <span>+ {isAr ? top.nameAr : top.nameEn}</span>
                            <span>{top.price} {currency}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Removed items */}
                    {item.removedIngredients && item.removedIngredients.length > 0 && (
                      <div className="ps-1.5 text-[9px] text-red-600 italic mt-0.5">
                        {item.removedIngredients.map((rem) => isAr ? rem.nameAr : rem.nameEn).join(' · ')}
                      </div>
                    )}

                    {/* Special instruction notes */}
                    {item.notes && (
                      <div className="ps-1.5 text-[9px] text-amber-800 italic mt-0.5">
                        * {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Financial Breakdown (Zero VAT, Compact) */}
            <div className="py-1.5 border-b border-dashed border-stone-400 space-y-0.5 text-[10px]">
              <div className="flex justify-between text-stone-600">
                <span>{isAr ? 'المجموع:' : 'Subtotal:'}</span>
                <span className="font-mono-numbers">{inv.subtotal.toFixed(2)} {currency}</span>
              </div>

              {inv.discountAmount > 0 && (
                <div className="flex justify-between text-stone-700 font-semibold">
                  <span>{isAr ? `خصم (${inv.discountPercent}%):` : `Discount (${inv.discountPercent}%):`}</span>
                  <span className="font-mono-numbers">-{inv.discountAmount.toFixed(2)} {currency}</span>
                </div>
              )}

              {inv.deliveryFee > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>{isAr ? 'رسوم التوصيل:' : 'Delivery:'}</span>
                  <span className="font-mono-numbers">{inv.deliveryFee.toFixed(2)} {currency}</span>
                </div>
              )}

              {/* Grand Total */}
              <div className="flex justify-between items-baseline pt-1.5 mt-0.5 border-t border-stone-900 text-xs font-black text-stone-950">
                <span>{isAr ? 'المطلوب سداده:' : 'GRAND TOTAL:'}</span>
                <span className="text-sm font-mono-numbers text-stone-950">
                  {inv.grandTotal.toFixed(2)} {currency}
                </span>
              </div>
            </div>

            {/* 6. Payment Method & Change */}
            <div className="py-1.5 border-b border-dashed border-stone-400 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-stone-600">{isAr ? 'طريقة السداد:' : 'Payment:'}</span>
                <span className="font-bold text-stone-900">
                  {inv.paymentMethod === 'cash'
                    ? (isAr ? 'نقداً (كاش)' : 'Cash')
                    : inv.paymentMethod === 'card'
                    ? (isAr ? 'بطاقة شبكة / مدى' : 'Card')
                    : (isAr ? 'دفع إلكتروني' : 'Online')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">{isAr ? 'المدفوع:' : 'Paid:'}</span>
                <span className="font-mono-numbers">{inv.amountPaid.toFixed(2)} {currency}</span>
              </div>
              {inv.changeDue > 0 && (
                <div className="flex justify-between font-bold text-stone-950">
                  <span>{isAr ? 'الباقي للمشتري:' : 'Change:'}</span>
                  <span className="font-mono-numbers">{inv.changeDue.toFixed(2)} {currency}</span>
                </div>
              )}
            </div>

            {/* 7. Footer: Clean Barcode Line & Greeting (NO QR CODE, NO WIFI) */}
            <div className="pt-2 text-center space-y-1">
              {/* Aesthetic Barcode line */}
              <div className="flex justify-center">
                <div className="h-4 w-36 flex items-stretch gap-0.5 opacity-70">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-black"
                      style={{
                        width: i % 3 === 0 ? '2.5px' : i % 2 === 0 ? '1px' : '1.5px',
                        marginLeft: i % 4 === 0 ? '1.5px' : '0px',
                      }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-[8px] font-mono tracking-widest text-stone-500">
                *{inv.invoiceNumber}*
              </p>

              <p className="text-[10px] font-bold text-stone-900 pt-0.5">
                {isAr ? settings.receiptFooterMsgAr : settings.receiptFooterMsgEn}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Controls (Screen Only) */}
        <div className="no-print p-3.5 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ النص' : 'Copy Text')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeReceiptModal}
              className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 transition-colors"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs transition-colors shadow-lg shadow-amber-500/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isAr ? 'طباعة الفاتورة الآن (Ctrl+P)' : 'Print Receipt'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
