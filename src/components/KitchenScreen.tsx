import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import { OrderStatus, Invoice } from '../types';
import { 
  ChefHat, 
  Clock, 
  CheckCircle, 
  Flame, 
  Utensils, 
  ShoppingBag, 
  Bike, 
  Bell, 
  RotateCcw,
  Volume2,
  VolumeX,
  AlertTriangle
} from 'lucide-react';

export const KitchenScreen: React.FC = () => {
  const {
    language,
    settings,
    invoices,
    updateOrderStatus,
    playAudioChime,
  } = usePOS();

  const isAr = language === 'ar';
  const [filter, setFilter] = useState<'active' | 'preparing' | 'ready' | 'all'>('active');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update clock every 10 seconds for elapsed time counter
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const kitchenOrders = invoices.filter((inv) => {
    if (filter === 'active') return inv.status === 'pending' || inv.status === 'preparing' || inv.status === 'ready';
    if (filter === 'preparing') return inv.status === 'preparing';
    if (filter === 'ready') return inv.status === 'ready';
    return true;
  });

  const getElapsedTimeMinutes = (isoString: string) => {
    const diff = currentTime - new Date(isoString).getTime();
    return Math.max(0, Math.floor(diff / 60000));
  };

  const getUrgencyColor = (mins: number) => {
    if (mins < 8) return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/80';
    if (mins < 15) return 'text-amber-400 bg-amber-950/40 border-amber-800/80';
    return 'text-red-400 bg-red-950/60 border-red-700 animate-pulse';
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-61px)] overflow-hidden bg-stone-950 text-stone-100">
      {/* Top Kitchen Sub-bar */}
      <div className="px-5 py-3.5 bg-stone-900 border-b border-stone-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <ChefHat className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">
              {isAr ? 'شاشة المطبخ وإعداد الطلبات (KDS)' : 'Kitchen Display System (KDS)'}
            </h1>
            <p className="text-[11px] text-stone-400">
              {isAr ? 'تحديث لحظي لطلبات الشواء والتجهيز بالمطبخ' : 'Real-time kitchen grill & packaging queue'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-950 rounded-lg border border-stone-800">
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              filter === 'active' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-white'
            }`}
          >
            {isAr ? 'النشطة الحالية' : 'Active'} ({invoices.filter((i) => i.status === 'pending' || i.status === 'preparing' || i.status === 'ready').length})
          </button>
          <button
            onClick={() => setFilter('preparing')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              filter === 'preparing' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-white'
            }`}
          >
            {isAr ? 'قيد التجهيز' : 'Preparing'} ({invoices.filter((i) => i.status === 'preparing').length})
          </button>
          <button
            onClick={() => setFilter('ready')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              filter === 'ready' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-white'
            }`}
          >
            {isAr ? 'جاهز للتسليم' : 'Ready'} ({invoices.filter((i) => i.status === 'ready').length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              filter === 'all' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-white'
            }`}
          >
            {isAr ? 'الكل' : 'All'}
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {kitchenOrders.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-stone-500">
            <CheckCircle className="w-12 h-12 text-emerald-500/40 mb-2" />
            <p className="text-sm font-semibold text-stone-300">
              {isAr ? 'لا توجد طلبات معلقة في المطبخ حالياً' : 'All orders completed! Kitchen is clear.'}
            </p>
            <p className="text-xs text-stone-500 mt-1">
              {isAr ? 'ستظهر الطلبات الجديدة هنا فور إتمامها من الكاشير' : 'New cashier tickets will appear here automatically'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {kitchenOrders.map((inv) => {
              const elapsedMins = getElapsedTimeMinutes(inv.createdAt);
              const urgencyClass = getUrgencyColor(elapsedMins);

              return (
                <div
                  key={inv.id}
                  className={`flex flex-col bg-stone-900 rounded-xl border overflow-hidden shadow-lg transition-all ${
                    inv.status === 'ready'
                      ? 'border-emerald-500/50'
                      : inv.status === 'cancelled'
                      ? 'border-stone-800 opacity-50'
                      : 'border-stone-800'
                  }`}
                >
                  {/* Ticket Header */}
                  <div className="p-3 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-amber-400 font-mono-numbers">
                        #{inv.dailyOrderNumber}
                      </span>
                      <span className="text-xs font-semibold text-stone-300">
                        {inv.orderType === 'dine-in'
                          ? (isAr ? `صالة (طاولة ${inv.tableNumber || '-'})` : `Dine-In (T-${inv.tableNumber || '-'})`)
                          : inv.orderType === 'takeaway'
                          ? (isAr ? 'سفري' : 'Takeaway')
                          : (isAr ? 'توصيل' : 'Delivery')}
                      </span>
                    </div>

                    {/* Timer badge */}
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold border ${urgencyClass}`}>
                      <Clock className="w-3 h-3" />
                      <span>{elapsedMins} {isAr ? 'دقيقة' : 'min'}</span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="p-3.5 flex-1 space-y-3 divide-y divide-stone-800/80">
                    {inv.items.map((item, idx) => (
                      <div key={idx} className={idx > 0 ? 'pt-2.5' : ''}>
                        <div className="flex items-baseline justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-extrabold text-amber-400 font-mono-numbers">
                              {item.quantity}x
                            </span>
                            <span className="text-sm font-bold text-white">
                              {isAr ? item.nameAr : item.nameEn}
                            </span>
                          </div>
                          {item.selectedSize && (
                            <span className="text-xs text-stone-400">
                              {isAr ? item.selectedSize.nameAr : item.selectedSize.nameEn}
                            </span>
                          )}
                        </div>

                        {/* Bun choice */}
                        {item.selectedBun && (
                          <div className="ps-6 text-xs text-stone-400">
                            {isAr ? 'الخبز:' : 'Bun:'} {isAr ? item.selectedBun.nameAr : item.selectedBun.nameEn}
                          </div>
                        )}

                        {/* Added Toppings */}
                        {item.selectedToppings && item.selectedToppings.length > 0 && (
                          <div className="ps-6 text-xs text-amber-400 font-medium flex flex-wrap gap-1 mt-0.5">
                            {item.selectedToppings.map((top, tIdx) => (
                              <span key={tIdx} className="bg-amber-500/10 px-1 rounded">
                                + {isAr ? top.nameAr : top.nameEn}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Exclusions (Prominent Warning) */}
                        {item.removedIngredients && item.removedIngredients.length > 0 && (
                          <div className="ps-6 text-xs text-red-400 font-bold flex flex-wrap gap-1 mt-0.5">
                            {item.removedIngredients.map((rem, rIdx) => (
                              <span key={rIdx} className="bg-red-950/60 border border-red-800 px-1.5 py-0.2 rounded">
                                ⚠️ {isAr ? rem.nameAr : rem.nameEn}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Notes */}
                        {item.notes && (
                          <div className="ps-6 text-xs text-amber-300 italic mt-0.5">
                            * {item.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* General order notes */}
                  {inv.notes && (
                    <div className="px-3 py-1.5 bg-stone-950 text-xs text-amber-400 border-t border-stone-800">
                      <strong>{isAr ? 'ملاحظة:' : 'Note:'}</strong> {inv.notes}
                    </div>
                  )}

                  {/* Ticket Footer Action Buttons */}
                  <div className="p-3 bg-stone-950/80 border-t border-stone-800 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-stone-400">
                      {isAr ? 'الحالة:' : 'Status:'}{' '}
                      <strong className={
                        inv.status === 'ready' ? 'text-emerald-400' : 'text-amber-400'
                      }>
                        {inv.status === 'pending'
                          ? (isAr ? 'طلب جديد' : 'New')
                          : inv.status === 'preparing'
                          ? (isAr ? 'قيد الشواء' : 'Grilling')
                          : inv.status === 'ready'
                          ? (isAr ? 'جاهز للتسليم' : 'Ready')
                          : inv.status === 'completed'
                          ? (isAr ? 'مكتمل ومستلم' : 'Completed')
                          : (isAr ? 'ملغي' : 'Cancelled')}
                      </strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {inv.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(inv.id, 'preparing')}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded transition-colors"
                        >
                          {isAr ? 'بدء التجهيز' : 'Start Prep'}
                        </button>
                      )}

                      {inv.status === 'preparing' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(inv.id, 'ready')}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs rounded transition-colors"
                        >
                          {isAr ? 'جاهز للتسليم ✓' : 'Mark Ready ✓'}
                        </button>
                      )}

                      {inv.status === 'ready' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(inv.id, 'completed')}
                          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs rounded transition-colors"
                        >
                          {isAr ? 'تم الاستلام' : 'Handed Out'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
