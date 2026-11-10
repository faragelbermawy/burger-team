import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import { Topping } from '../types';
import { getItemImage } from '../assets/images';
import { X, Plus, Minus, Check, Flame } from 'lucide-react';

export const ItemCustomizerModal: React.FC = () => {
  const {
    language,
    settings,
    isCustomizerOpen,
    itemToCustomize,
    closeCustomizer,
    addToCart,
  } = usePOS();

  const isAr = language === 'ar';
  const currency = isAr ? settings.currencySymbolAr : settings.currencySymbolEn;

  const [selectedSize, setSelectedSize] = useState<{ id: string; nameAr: string; nameEn: string; extraPrice: number } | undefined>(undefined);
  const [selectedBun, setSelectedBun] = useState<{ id: string; nameAr: string; nameEn: string } | undefined>(undefined);
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [removedIngredients, setRemovedIngredients] = useState<{ id: string; nameAr: string; nameEn: string }[]>([]);
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (itemToCustomize) {
      // Default to medium/double size if available
      const defaultSize = itemToCustomize.sizes?.find((s) => s.id === 'double') || itemToCustomize.sizes?.[0];
      setSelectedSize(defaultSize);
      setSelectedBun(itemToCustomize.bunOptions?.[0]);
      setSelectedToppings([]);
      setRemovedIngredients([]);
      setNotes('');
      setQuantity(1);
    }
  }, [itemToCustomize]);

  if (!isCustomizerOpen || !itemToCustomize) return null;

  // Calculate live item price
  const basePrice = itemToCustomize.basePrice;
  const sizePrice = selectedSize ? selectedSize.extraPrice : 0;
  const toppingsPrice = selectedToppings.reduce((acc, t) => acc + t.price, 0);
  const unitPrice = basePrice + sizePrice + toppingsPrice;
  const totalPrice = unitPrice * quantity;

  const handleToggleTopping = (topping: Topping) => {
    if (selectedToppings.some((t) => t.id === topping.id)) {
      setSelectedToppings((prev) => prev.filter((t) => t.id !== topping.id));
    } else {
      setSelectedToppings((prev) => [...prev, topping]);
    }
  };

  const handleToggleRemove = (item: { id: string; nameAr: string; nameEn: string }) => {
    if (removedIngredients.some((r) => r.id === item.id)) {
      setRemovedIngredients((prev) => prev.filter((r) => r.id !== item.id));
    } else {
      setRemovedIngredients((prev) => [...prev, item]);
    }
  };

  const handleConfirm = () => {
    addToCart(itemToCustomize, {
      selectedSize,
      selectedBun,
      selectedToppings,
      removedIngredients,
      notes: notes.trim(),
      quantity,
    });
    closeCustomizer();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-xl max-h-[92vh] flex flex-col bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-2xl text-stone-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="relative h-44 sm:h-52 w-full bg-stone-950 overflow-hidden shrink-0">
          <img
            src={getItemImage(itemToCustomize.category, itemToCustomize.code, itemToCustomize.image)}
            alt={isAr ? itemToCustomize.nameAr : itemToCustomize.nameEn}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent" />
          
          <button
            onClick={closeCustomizer}
            className="absolute top-3 end-3 w-8 h-8 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-colors border border-stone-700/50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 start-4 end-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <span>{itemToCustomize.code}</span>
              <span>·</span>
              <span>{itemToCustomize.calories ? `${itemToCustomize.calories} ${isAr ? 'سعرة حرارية' : 'kcal'}` : ''}</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isAr ? itemToCustomize.nameAr : itemToCustomize.nameEn}
            </h2>
            <p className="text-xs text-stone-300 line-clamp-1 mt-0.5">
              {isAr ? itemToCustomize.descriptionAr : itemToCustomize.descriptionEn}
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 divide-y divide-stone-800/80">
          {/* 1. Size Selection */}
          {itemToCustomize.sizes && itemToCustomize.sizes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block">
                {isAr ? 'اختر الحجم / عدد قطع اللحم' : 'Choose Size / Patty Count'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {itemToCustomize.sizes.map((size) => {
                  const isSelected = selectedSize?.id === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`flex flex-col items-start p-2.5 rounded-lg border text-start transition-all ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-stone-800/60 border-stone-700 text-stone-300 hover:border-stone-600'
                      }`}
                    >
                      <span className="text-xs font-semibold">
                        {isAr ? size.nameAr : size.nameEn}
                      </span>
                      <span className="text-[11px] text-amber-400 font-mono-numbers mt-1">
                        {size.extraPrice === 0
                          ? (isAr ? 'السعر الأساسي' : 'Standard')
                          : size.extraPrice > 0
                          ? `+${size.extraPrice} ${currency}`
                          : `${size.extraPrice} ${currency}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Bun Selection */}
          {itemToCustomize.bunOptions && itemToCustomize.bunOptions.length > 0 && (
            <div className="pt-4 space-y-2">
              <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block">
                {isAr ? 'نوع الخبز' : 'Bun Choice'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {itemToCustomize.bunOptions.map((bun) => {
                  const isSelected = selectedBun?.id === bun.id;
                  return (
                    <button
                      key={bun.id}
                      type="button"
                      onClick={() => setSelectedBun(bun)}
                      className={`p-2.5 rounded-lg border text-start transition-all ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-stone-800/60 border-stone-700 text-stone-300 hover:border-stone-600'
                      }`}
                    >
                      <span className="text-xs font-semibold block">
                        {isAr ? bun.nameAr : bun.nameEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Extra Toppings & Sauces */}
          {itemToCustomize.availableToppings && itemToCustomize.availableToppings.length > 0 && (
            <div className="pt-4 space-y-2">
              <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block">
                {isAr ? 'إضافات وصوصات إضافية (اختياري)' : 'Extra Toppings & Sauces (Optional)'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {itemToCustomize.availableToppings.map((topping) => {
                  const isAdded = selectedToppings.some((t) => t.id === topping.id);
                  return (
                    <button
                      key={topping.id}
                      type="button"
                      onClick={() => handleToggleTopping(topping)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                        isAdded
                          ? 'bg-amber-500/15 border-amber-500 text-white'
                          : 'bg-stone-800/50 border-stone-700/80 text-stone-300 hover:border-stone-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isAdded ? 'bg-amber-500 border-amber-500 text-stone-950' : 'border-stone-600'
                        }`}>
                          {isAdded && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-medium">
                          {isAr ? topping.nameAr : topping.nameEn}
                        </span>
                      </div>
                      <span className="text-xs font-mono-numbers text-amber-400">
                        +{topping.price} {currency}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Remove Ingredients (بدون بصل / بدون مخلل) */}
          {itemToCustomize.removableIngredients && itemToCustomize.removableIngredients.length > 0 && (
            <div className="pt-4 space-y-2">
              <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block">
                {isAr ? 'استبعاد مكونات (تفضيلات العميل)' : 'Remove Ingredients (No ...)'}
              </label>
              <div className="flex flex-wrap gap-2">
                {itemToCustomize.removableIngredients.map((item) => {
                  const isRemoved = removedIngredients.some((r) => r.id === item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleRemove(item)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        isRemoved
                          ? 'bg-red-500/20 border-red-500 text-red-300 line-through'
                          : 'bg-stone-800/60 border-stone-700 text-stone-300 hover:border-stone-600'
                      }`}
                    >
                      {isAr ? item.nameAr : item.nameEn}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Special Kitchen Notes */}
          <div className="pt-4 space-y-2">
            <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block">
              {isAr ? 'ملاحظة خاصة للمطبخ' : 'Special Kitchen Instructions'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isAr ? 'مثال: تسوية لحم ويل دن، الصوص على جنب...' : 'e.g. Well done, sauce on side...'}
              className="w-full px-3 py-2 text-xs bg-stone-800 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Footer with Quantity & Add to Cart */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-stone-900 border border-stone-700 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-bold font-mono-numbers text-white">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-between px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-sm transition-colors shadow-lg shadow-amber-500/20"
          >
            <span>{isAr ? 'إضافة إلى الطلب' : 'Add to Order'}</span>
            <span className="font-mono-numbers text-base">
              {totalPrice} {currency}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
