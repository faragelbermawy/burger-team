import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import { PaymentMethod } from '../types';
import { 
  X, 
  Banknote, 
  CreditCard, 
  Smartphone, 
  Printer, 
  Receipt,
  User,
  Phone,
  MapPin,
  Percent,
  Coins,
  Gift,
  Award,
  Check,
  Users,
  UserCheck
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    language,
    settings,
    isCheckoutModalOpen,
    closeCheckoutModal,
    orderType,
    tableNumber,
    customer,
    setCustomer,
    customers,
    selectedCustomer,
    selectCustomer,
    loyaltyRewards,
    activeLoyaltyReward,
    applyLoyaltyReward,
    removeLoyaltyReward,
    loyaltyDiscountAmount,
    discountPercent,
    setDiscountPercent,
    cartGrandTotal,
    cartSubtotal,
    cartDiscountAmount,
    cartTaxAmount,
    cartDeliveryFee,
    deliveryFee,
    setDeliveryFee,
    processCheckout,
  } = usePOS();

  const isAr = language === 'ar';
  const currency = isAr ? settings.currencySymbolAr : settings.currencySymbolEn;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [tenderedCash, setTenderedCash] = useState<number>(cartGrandTotal);
  const [orderNotes, setOrderNotes] = useState('');
  const [phoneSearch, setPhoneSearch] = useState('');

  // Sync tendered cash whenever grand total changes
  useEffect(() => {
    setTenderedCash(cartGrandTotal);
  }, [cartGrandTotal]);

  if (!isCheckoutModalOpen) return null;

  const changeDue = Math.max(0, Number((tenderedCash - cartGrandTotal).toFixed(2)));
  const estimatedPointsEarned = Math.floor(cartGrandTotal / 10);

  const handleQuickCash = (amount: number) => {
    setTenderedCash(amount);
  };

  const handleCompletePayment = () => {
    processCheckout(paymentMethod, tenderedCash, orderNotes.trim());
  };

  // Keyboard shortcut listener (Enter = Pay)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCompletePayment();
    }
  };

  const handleCustomerPhoneChange = (val: string) => {
    setPhoneSearch(val);
    setCustomer((prev) => ({ ...prev, phone: val }));
    // Try to auto match existing registered customer
    const match = customers.find((c) => c.phone === val.trim());
    if (match) {
      selectCustomer(match);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn"
      onKeyDown={handleKeyDown}
    >
      <div 
        className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl text-stone-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-stone-950 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isAr ? 'الدفع وإصدار الفاتورة' : 'Payment & Checkout'}
              </h2>
              <p className="text-xs text-stone-400">
                {orderType === 'dine-in' 
                  ? (isAr ? `طلب صالة · طاولة رقم ${tableNumber}` : `Dine-In · Table ${tableNumber}`)
                  : orderType === 'takeaway'
                  ? (isAr ? 'طلب سفري / تيك أواي' : 'Takeaway Order')
                  : (isAr ? 'طلب دليفري / توصيل منزلي' : 'Home Delivery Order')}
              </p>
            </div>
          </div>
          <button
            onClick={closeCheckoutModal}
            className="w-8 h-8 rounded-lg bg-stone-800/80 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* 1. Customer Name & Details (Simple: Customer name is enough) */}
          <div className="p-3.5 bg-stone-950/70 border border-stone-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-500" />
                <span>{isAr ? 'بيانات العميل (اختياري)' : 'Customer Info (Optional)'}</span>
              </span>

              {customer.name && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomer((prev) => ({ ...prev, name: '', phone: '' }));
                    selectCustomer(null);
                  }}
                  className="text-[11px] text-stone-400 hover:text-red-400"
                >
                  {isAr ? 'مسح بيانات العميل' : 'Clear'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                  {isAr ? 'اسم العميل:' : 'Customer Name:'}
                </label>
                <div className="relative">
                  <UserCheck className="w-3.5 h-3.5 text-stone-500 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customer.name}
                    onChange={(e) => setCustomer((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder={isAr ? 'أدخل اسم العميل...' : 'Enter customer name...'}
                    className="w-full ps-9 pe-3 py-2 text-xs bg-stone-900 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                  {isAr ? 'رقم الهاتف (اختياري):' : 'Phone (Optional):'}
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-stone-500 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={customer.phone || ''}
                    onChange={(e) => setCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder={isAr ? '05XXXXXXXX' : 'Phone number'}
                    className="w-full ps-9 pe-3 py-2 text-xs bg-stone-900 border border-stone-700 rounded-lg text-white font-mono placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {customers.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                <span className="text-[10px] text-stone-500 shrink-0">{isAr ? 'عملاء سابقين:' : 'Recent:'}</span>
                {customers.slice(0, 4).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCustomer((prev) => ({ ...prev, name: c.name, phone: c.phone }));
                      selectCustomer(c);
                    }}
                    className="px-2 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 rounded text-[11px] text-stone-300 hover:text-white transition-colors"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Payment Method Tabs */}
          <div>
            <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block mb-2">
              {isAr ? 'طريقة السداد' : 'Payment Method'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-amber-500/15 border-amber-500 text-white'
                    : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:text-stone-200 hover:border-stone-600'
                }`}
              >
                <Banknote className="w-5 h-5 mb-1.5 text-amber-400" />
                <span className="text-xs font-bold">{isAr ? 'نقداً (كاش)' : 'Cash'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-amber-500/15 border-amber-500 text-white'
                    : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:text-stone-200 hover:border-stone-600'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1.5 text-blue-400" />
                <span className="text-xs font-bold">{isAr ? 'شبكة / فيزا - مدى' : 'Card / POS'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all ${
                  paymentMethod === 'online'
                    ? 'bg-amber-500/15 border-amber-500 text-white'
                    : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:text-stone-200 hover:border-stone-600'
                }`}
              >
                <Smartphone className="w-5 h-5 mb-1.5 text-emerald-400" />
                <span className="text-xs font-bold">{isAr ? 'محفظة / انستاباي' : 'Wallet / Online'}</span>
              </button>
            </div>
          </div>

          {/* 3. Cash Keypad & Presets if Cash */}
          {paymentMethod === 'cash' && (
            <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-300">
                  {isAr ? 'المبلغ المستلم من العميل' : 'Cash Tendered'}
                </span>
                <span className="text-xs text-stone-400">
                  {isAr ? 'المطلوب:' : 'Required:'}{' '}
                  <strong className="text-amber-400 font-mono-numbers">{cartGrandTotal} {currency}</strong>
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  value={tenderedCash || ''}
                  onChange={(e) => setTenderedCash(Number(e.target.value))}
                  className="flex-1 px-4 py-2 text-lg font-bold font-mono-numbers bg-stone-900 border border-stone-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handleQuickCash(cartGrandTotal)}
                  className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-xs font-semibold rounded-lg text-stone-300 border border-stone-700"
                >
                  {isAr ? 'المبلغ بالضبط' : 'Exact'}
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[10, 20, 50, 100, 200, 500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleQuickCash(preset)}
                    className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700/80 rounded text-xs font-mono-numbers text-stone-300 hover:text-white"
                  >
                    {preset} {currency}
                  </button>
                ))}
              </div>

              {/* Change calculation */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                <span className="text-xs font-medium text-stone-400">
                  {isAr ? 'الباقي المستحق للعميل:' : 'Change Due:'}
                </span>
                <span className={`text-base font-bold font-mono-numbers ${changeDue > 0 ? 'text-emerald-400' : 'text-stone-300'}`}>
                  {changeDue} {currency}
                </span>
              </div>
            </div>
          )}

          {/* 4. Manual Percentage Discount */}
          <div className="flex items-center gap-3 bg-stone-800/40 border border-stone-800 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 shrink-0">
              <Percent className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'خصم إضافي (%)' : 'Discount (%)'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[0, 5, 10, 15, 20].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDiscountPercent(pct)}
                  className={`px-2.5 py-1 text-xs font-mono-numbers rounded transition-colors ${
                    discountPercent === pct
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'bg-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* 5. Customer Info for Delivery/Takeaway if not pre-linked */}
          {!selectedCustomer && (orderType === 'delivery' || orderType === 'takeaway') && (
            <div className="space-y-3 bg-stone-950/40 border border-stone-800 rounded-lg p-3">
              <span className="text-xs font-semibold text-stone-300 block">
                {isAr ? 'بيانات العميل' : 'Customer Details'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-stone-500 absolute start-3 top-3" />
                  <input
                    type="text"
                    value={customer.name || ''}
                    onChange={(e) => setCustomer((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder={isAr ? 'اسم العميل' : 'Customer Name'}
                    className="w-full ps-8 pe-3 py-2 text-xs bg-stone-900 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-stone-500 absolute start-3 top-3" />
                  <input
                    type="tel"
                    value={customer.phone || ''}
                    onChange={(e) => handleCustomerPhoneChange(e.target.value)}
                    placeholder={isAr ? 'رقم الهاتف' : 'Phone Number'}
                    className="w-full ps-8 pe-3 py-2 text-xs bg-stone-900 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {orderType === 'delivery' && (
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-stone-500 absolute start-3 top-3" />
                  <input
                    type="text"
                    value={customer.address || ''}
                    onChange={(e) => setCustomer((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder={isAr ? 'عنوان التوصيل (الشارع، رقم العمارة، الشقة)' : 'Delivery Address'}
                    className="w-full ps-8 pe-3 py-2 text-xs bg-stone-900 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* 6. Order Notes */}
          <div>
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder={isAr ? 'ملاحظة عامة على الفاتورة (اختياري)...' : 'General invoice note (optional)...'}
              className="w-full px-3 py-2 text-xs bg-stone-900 border border-stone-800 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* 7. Invoice Breakdown Summary */}
          <div className="p-3 bg-stone-950 rounded-lg border border-stone-800/80 space-y-1.5 text-xs text-stone-400">
            <div className="flex justify-between">
              <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
              <span className="font-mono-numbers text-stone-200">{cartSubtotal} {currency}</span>
            </div>

            {cartDiscountAmount > 0 && (
              <div className="flex justify-between text-amber-400">
                <span>{isAr ? `الخصم (${discountPercent}%):` : `Discount (${discountPercent}%):`}</span>
                <span className="font-mono-numbers">-{cartDiscountAmount} {currency}</span>
              </div>
            )}

            {settings.taxRatePercent > 0 && (
              <div className="flex justify-between">
                <span>{isAr ? `ضريبة القيمة المضافة (${settings.taxRatePercent}%):` : `VAT (${settings.taxRatePercent}%):`}</span>
                <span className="font-mono-numbers text-stone-200">{cartTaxAmount} {currency}</span>
              </div>
            )}

            {orderType === 'delivery' && (
              <div className="flex justify-between items-center">
                <span>{isAr ? 'رسوم خدمة التوصيل:' : 'Delivery Fee:'}</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Math.max(0, Number(e.target.value) || 0))}
                    className="w-14 px-1 py-0.5 text-center bg-stone-900 border border-stone-700 rounded text-amber-400 font-mono-numbers text-xs font-bold focus:outline-none focus:border-amber-500"
                  />
                  <span className="font-mono-numbers text-stone-200">{currency}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-2 border-t border-stone-800 text-sm font-bold text-white">
              <span>{isAr ? 'الإجمالي النهائي المطلوب:' : 'Grand Total:'}</span>
              <span className="text-amber-400 font-mono-numbers text-base">{cartGrandTotal} {currency}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={closeCheckoutModal}
            className="px-4 py-2.5 rounded-lg border border-stone-700 bg-stone-900 text-xs font-semibold text-stone-300 hover:text-white transition-colors"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleCompletePayment}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-sm transition-colors shadow-lg shadow-amber-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>{isAr ? 'تأكيد السداد وطباعة الفاتورة (Enter)' : 'Confirm & Print Receipt (Enter)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
