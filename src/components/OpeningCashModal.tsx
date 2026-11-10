import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import { 
  Coins, 
  X, 
  Check, 
  Wallet, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';

export const OpeningCashModal: React.FC = () => {
  const {
    language,
    settings,
    activeShift,
    isOpeningCashModalOpen,
    closeOpeningCashModal,
    updateOpeningCash,
    playAudioChime,
  } = usePOS();

  const isAr = language === 'ar';
  const currency = isAr ? settings.currencySymbolAr : settings.currencySymbolEn;

  const [amountInput, setAmountInput] = useState<number>(activeShift.openingCash);

  useEffect(() => {
    if (isOpeningCashModalOpen) {
      setAmountInput(activeShift.openingCash);
    }
  }, [isOpeningCashModalOpen, activeShift.openingCash]);

  if (!isOpeningCashModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOpeningCash(amountInput);
    playAudioChime();
    closeOpeningCashModal();
  };

  const PRESETS = [0, 50, 100, 150, 200, 300, 500];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl text-stone-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-stone-950 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                {isAr ? 'تعديل الرصيد الافتتاحي للشفت' : 'Edit Shift Opening Cash'}
              </h2>
              <p className="text-[11px] text-stone-400">
                {isAr ? 'عهدة الكاشير الافتتاحية في درج النقدية' : 'Initial cash float in drawer'}
              </p>
            </div>
          </div>

          <button
            onClick={closeOpeningCashModal}
            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Active Shift Details Mini-Card */}
          <div className="flex items-center justify-between p-3 bg-stone-950/70 border border-stone-800 rounded-xl text-xs">
            <div>
              <span className="text-stone-400 block text-[10px]">
                {isAr ? 'الشفت النشط' : 'Active Shift'}
              </span>
              <span className="font-mono font-bold text-amber-400">
                {activeShift.id}
              </span>
            </div>
            <div className="text-end">
              <span className="text-stone-400 block text-[10px]">
                {isAr ? 'الكاشير' : 'Cashier'}
              </span>
              <span className="font-bold text-white">
                {activeShift.cashierName}
              </span>
            </div>
          </div>

          {/* Input Field */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center justify-between">
              <span>{isAr ? 'مبلغ العهدة الافتتاحية الجديد:' : 'New Opening Cash Float:'}</span>
              <span className="text-[11px] text-amber-400 font-bold">
                {currency}
              </span>
            </label>

            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                autoFocus
                required
                value={amountInput}
                onChange={(e) => setAmountInput(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-4 py-2.5 bg-stone-950 border border-amber-500/50 rounded-xl text-white font-mono-numbers font-black text-xl text-center focus:outline-none focus:border-amber-400 shadow-inner"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-stone-400 font-semibold block">
              {isAr ? 'خيارات مبالغ شائعة:' : 'Quick Presets:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmountInput(preset)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold border transition-colors ${
                    amountInput === preset
                      ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm'
                      : 'bg-stone-800/80 hover:bg-stone-800 text-stone-300 border-stone-700/80 hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Info note */}
          <p className="text-[11px] text-stone-400 bg-stone-950/40 p-2.5 rounded-lg border border-stone-800/80">
            💡 {isAr 
              ? 'تعديل هذا الرصيد سيحدّث عهدة الدرج الافتتاحية والمطابقة في تقرير تقفيل الشفت ورسالة الواتساب للمدير فوراً.'
              : 'Updating this will adjust the opening float and drawer balance in the shift report and WhatsApp export immediately.'}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-800">
            <button
              type="button"
              onClick={closeOpeningCashModal}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl transition-colors"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-colors shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isAr ? 'حفظ وتحديث الرصيد الافتتاحي' : 'Save Opening Cash'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
