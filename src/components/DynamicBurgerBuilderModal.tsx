import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { BurgerItem, Topping } from '../types';
import { APP_IMAGES } from '../assets/images';
import { 
  X, 
  Plus, 
  Minus, 
  Check, 
  Flame, 
  Sparkles, 
  Layers, 
  UtensilsCrossed, 
  DollarSign, 
  ChevronRight 
} from 'lucide-react';

interface PattyBase {
  id: string;
  nameAr: string;
  nameEn: string;
  category: 'beef' | 'chicken';
  basePrice: number;
  calories: number;
  image: string;
}

const PATTY_BASES: PattyBase[] = [
  {
    id: 'burger-beef-classic',
    nameAr: 'برجر لحم كلاسيك',
    nameEn: 'Classic Beef Burger',
    category: 'beef',
    basePrice: 10,
    calories: 524,
    image: APP_IMAGES.heroBurger,
  },
  {
    id: 'burger-chicken-classic',
    nameAr: 'برجر دجاج كلاسيك',
    nameEn: 'Classic Chicken Burger',
    category: 'chicken',
    basePrice: 10,
    calories: 424,
    image: APP_IMAGES.crispyChicken,
  },
  {
    id: 'burger-beef-stuffed-cheese',
    nameAr: 'برجر لحم محشي جبن',
    nameEn: 'Cheese-Stuffed Beef',
    category: 'beef',
    basePrice: 15,
    calories: 412,
    image: APP_IMAGES.heroBurger,
  },
  {
    id: 'burger-team-beef',
    nameAr: 'برجر تيم لحم (توقيع المحل)',
    nameEn: 'Burger Team Beef Signature',
    category: 'beef',
    basePrice: 18,
    calories: 566,
    image: APP_IMAGES.avocadoBacon,
  },
];

const PATTY_SIZES = [
  { id: 'single', nameAr: 'شريحة واحدة (سينجل)', nameEn: 'Single Patty', extraPrice: 0 },
  { id: 'double', nameAr: 'شريحتين (دبل +5 ريال)', nameEn: 'Double Patty (+5 SAR)', extraPrice: 5 },
  { id: 'triple', nameAr: '3 شرائح مونستر (+10 ريال)', nameEn: 'Triple Monster (+10 SAR)', extraPrice: 10 },
];

const BUN_STYLES = [
  { id: 'regular', nameAr: 'خبز برجر سمسم كلاسيك', nameEn: 'Classic Sesame Bun', extraPrice: 0 },
  { id: 'brioche', nameAr: 'خبز بريوش طري فاخر', nameEn: 'Golden Brioche Bun', extraPrice: 1 },
  { id: 'lettuce', nameAr: 'لفائف خس دايت (بدون خبز)', nameEn: 'Lettuce Wrap (Keto)', extraPrice: 0 },
];

const CHEESE_OPTIONS = [
  { id: 'cheddar', nameAr: 'جبن شيدر إضافي ذائب', nameEn: 'Extra Melted Cheddar', price: 2 },
  { id: 'mozzarella', nameAr: 'جبنة موزاريلا مطاطية', nameEn: 'Gooey Mozzarella', price: 2 },
  { id: 'cheese-cup', nameAr: 'كوب جبن سائل للتغميس', nameEn: 'Liquid Cheese Dipping Cup', price: 3 },
];

const PREMIUM_TOPPINGS = [
  { id: 'combo-fries-pepsi', nameAr: 'إضافة بطاطس + بيبسي (كومبو)', nameEn: 'Fries + Pepsi Combo', price: 6, isHighlight: true },
  { id: 'pomegranate', nameAr: 'حب رمان / دبس رمان', nameEn: 'Pomegranate Seeds/Glaze', price: 1, isHighlight: true },
  { id: 'potato-seasoning', nameAr: 'بهارات بطاطس خاصة', nameEn: 'Special Fries Seasoning', price: 2 },
  { id: 'fried-egg', nameAr: 'بيض مقلي طازج', nameEn: 'Fried Egg', price: 2 },
  { id: 'jalapenos', nameAr: 'قطع هالبينو حار', nameEn: 'Spicy Jalapeños', price: 1 },
];

const SAUCE_OPTIONS = [
  { id: 'team-sauce', nameAr: 'صوص برجر تيم الخاص', nameEn: 'Burger Team Signature Sauce', price: 2 },
  { id: 'dynamite', nameAr: 'صوص ديناميت الحار اللذيذ', nameEn: 'Spicy Dynamite Sauce', price: 2 },
  { id: 'smoky-bbq', nameAr: 'صوص باربيكيو مدخن', nameEn: 'Smoky BBQ Sauce', price: 2 },
  { id: 'garlic-mayo', nameAr: 'مايونيز بالثوم', nameEn: 'Garlic Mayo Aioli', price: 1 },
];

export const DynamicBurgerBuilderModal: React.FC = () => {
  const {
    language,
    settings,
    isCustomBuilderOpen,
    closeCustomBuilder,
    addToCart,
  } = usePOS();

  const isAr = language === 'ar';
  const currency = isAr ? settings.currencySymbolAr : settings.currencySymbolEn;

  // Selected Options
  const [selectedBase, setSelectedBase] = useState<PattyBase>(PATTY_BASES[0]);
  const [selectedSize, setSelectedSize] = useState(PATTY_SIZES[0]); // default single
  const [selectedBun, setSelectedBun] = useState(BUN_STYLES[0]);
  const [selectedCheeses, setSelectedCheeses] = useState<string[]>(['cheddar']);
  const [selectedToppings, setSelectedToppings] = useState<string[]>(['pomegranate']);
  const [selectedSauces, setSelectedSauces] = useState<string[]>(['team-sauce']);
  const [customBurgerName, setCustomBurgerName] = useState('');
  const [specialNote, setSpecialNote] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!isCustomBuilderOpen) return null;

  // Real-time Dynamic Final Price Calculation
  const basePrice = selectedBase.basePrice;
  const sizePrice = selectedSize.extraPrice;
  const bunPrice = selectedBun.extraPrice;

  const cheesePrice = selectedCheeses.reduce((acc, cId) => {
    const ch = CHEESE_OPTIONS.find((c) => c.id === cId);
    return acc + (ch ? ch.price : 0);
  }, 0);

  const toppingsPrice = selectedToppings.reduce((acc, tId) => {
    const top = PREMIUM_TOPPINGS.find((t) => t.id === tId);
    return acc + (top ? top.price : 0);
  }, 0);

  const saucesPrice = selectedSauces.reduce((acc, sId) => {
    const s = SAUCE_OPTIONS.find((sc) => sc.id === sId);
    return acc + (s ? s.price : 0);
  }, 0);

  const finalUnitPrice = basePrice + sizePrice + bunPrice + cheesePrice + toppingsPrice + saucesPrice;
  const finalTotalPrice = finalUnitPrice * quantity;

  // Toggle helpers
  const handleToggleCheese = (id: string) => {
    setSelectedCheeses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleToggleTopping = (id: string) => {
    setSelectedToppings((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleToggleSauce = (id: string) => {
    setSelectedSauces((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleConfirmAdd = () => {
    // Construct all chosen toppings as CartItem Toppings
    const allToppings: Topping[] = [
      ...selectedCheeses.map((cId) => {
        const item = CHEESE_OPTIONS.find((c) => c.id === cId)!;
        return { id: item.id, nameAr: item.nameAr, nameEn: item.nameEn, price: item.price };
      }),
      ...selectedToppings.map((tId) => {
        const item = PREMIUM_TOPPINGS.find((t) => t.id === tId)!;
        return { id: item.id, nameAr: item.nameAr, nameEn: item.nameEn, price: item.price };
      }),
      ...selectedSauces.map((sId) => {
        const item = SAUCE_OPTIONS.find((s) => s.id === sId)!;
        return { id: item.id, nameAr: item.nameAr, nameEn: item.nameEn, price: item.price };
      }),
    ];

    const syntheticItem: BurgerItem = {
      id: `custom-burger-${Date.now()}`,
      code: 'CUSTOM-B',
      nameAr: customBurgerName.trim() || `برجر مبتكر (${selectedBase.nameAr})`,
      nameEn: customBurgerName.trim() || `Custom Craft Burger (${selectedBase.nameEn})`,
      descriptionAr: `ساندوتش برجر مخصص: ${selectedSize.nameAr} في ${selectedBun.nameAr}`,
      descriptionEn: `Custom burger: ${selectedSize.nameEn} in ${selectedBun.nameEn}`,
      category: selectedBase.category,
      basePrice: selectedBase.basePrice + bunPrice,
      image: selectedToppings.includes('avocado')
        ? '/assets/images/avocado_bacon_burger_1794229258158.jpg'
        : selectedBase.image,
      inStock: true,
      stockCount: 99,
    };

    addToCart(syntheticItem, {
      selectedSize: {
        id: selectedSize.id,
        nameAr: selectedSize.nameAr,
        nameEn: selectedSize.nameEn,
        extraPrice: selectedSize.extraPrice,
      },
      selectedBun: {
        id: selectedBun.id,
        nameAr: selectedBun.nameAr,
        nameEn: selectedBun.nameEn,
      },
      selectedToppings: allToppings,
      removedIngredients: [],
      notes: specialNote.trim(),
      quantity,
    });

    closeCustomBuilder();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-4xl max-h-[94vh] flex flex-col bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl text-stone-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="px-5 py-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {isAr ? 'قائمة الطعام الديناميكية · صانع البرجر المبتكر' : 'Dynamic Burger Configurator & Live Pricing'}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-stone-950 rounded">
                  {isAr ? 'حساب فوري' : 'Live Calculator'}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {isAr ? 'اختر نوع اللحم، الأجبان، شرائح الأفوكادو، البيكون والصوصات مع تحديث السعر النهائي لحظياً' : 'Customize burger patties, fresh avocado, bacon, cheeses, and sauces with real-time pricing'}
              </p>
            </div>
          </div>

          <button
            onClick={closeCustomBuilder}
            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Builder Body: Split 2 columns on desktop */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Controls Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step 1: Base Patty */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  <span>1. {isAr ? 'اختر شريحة اللحم الأساسية' : 'Select Patty Base'}</span>
                </label>
                <span className="text-xs text-stone-400 font-mono-numbers">
                  {isAr ? 'السعر يبدأ من' : 'From'} {selectedBase.basePrice} {currency}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {PATTY_BASES.map((base) => {
                  const isSelected = selectedBase.id === base.id;
                  return (
                    <button
                      key={base.id}
                      type="button"
                      onClick={() => setSelectedBase(base)}
                      className={`flex flex-col p-3 rounded-xl border text-start transition-all relative overflow-hidden ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                          : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <span className="text-xs font-bold block">{isAr ? base.nameAr : base.nameEn}</span>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-800/80 text-[11px]">
                        <span className="text-amber-400 font-bold font-mono-numbers">{base.basePrice} {currency}</span>
                        <span className="text-stone-500 font-mono-numbers">{base.calories} kcal</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Patty Size & Quantity of Patties */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
                2. {isAr ? 'عدد قطع اللحم / الوزن (حجم البرجر)' : 'Patty Count & Size'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {PATTY_SIZES.map((size) => {
                  const isSelected = selectedSize.id === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-start transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-white'
                          : 'bg-stone-950/50 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <span className="text-xs font-medium">{isAr ? size.nameAr : size.nameEn}</span>
                      <span className="text-xs font-bold text-amber-400 font-mono-numbers">
                        {size.extraPrice === 0 ? '+0' : `+${size.extraPrice}`} {currency}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Bun Choice */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
                3. {isAr ? 'نوع الخبز المفضل' : 'Bun Style'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BUN_STYLES.map((bun) => {
                  const isSelected = selectedBun.id === bun.id;
                  return (
                    <button
                      key={bun.id}
                      type="button"
                      onClick={() => setSelectedBun(bun)}
                      className={`p-2.5 rounded-lg border text-start transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-white'
                          : 'bg-stone-950/50 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <span className="text-xs font-medium block">{isAr ? bun.nameAr : bun.nameEn}</span>
                      {bun.extraPrice > 0 && (
                        <span className="text-[10px] text-amber-400 font-mono-numbers block mt-1">
                          +{bun.extraPrice} {currency}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Cheese Selection (Multi-select) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
                  4. {isAr ? 'تشكيلة الجبن الذائب (اختر أكثر من نوع)' : 'Melted Cheeses (Multi-Select)'}
                </label>
                <span className="text-[11px] text-amber-400 font-mono-numbers">
                  {selectedCheeses.length} {isAr ? 'مختار' : 'selected'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CHEESE_OPTIONS.map((cheese) => {
                  const isChecked = selectedCheeses.includes(cheese.id);
                  return (
                    <button
                      key={cheese.id}
                      type="button"
                      onClick={() => handleToggleCheese(cheese.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                        isChecked
                          ? 'bg-amber-500/15 border-amber-500 text-white font-bold'
                          : 'bg-stone-950/50 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isChecked ? 'bg-amber-500 border-amber-500 text-stone-950' : 'border-stone-700'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs">{isAr ? cheese.nameAr : cheese.nameEn}</span>
                      </div>
                      <span className="text-xs font-mono-numbers text-amber-400">+{cheese.price} {currency}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 5: Premium Toppings (Avocado, Bacon, etc.) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
                  5. {isAr ? 'المكونات الاختيارية (الأفوكادو، البيكون، المشروم)' : 'Gourmet Toppings (Avocado, Bacon...)'}
                </label>
                <span className="text-[11px] text-amber-400 font-mono-numbers">
                  {selectedToppings.length} {isAr ? 'إضافات' : 'toppings'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PREMIUM_TOPPINGS.map((top) => {
                  const isChecked = selectedToppings.includes(top.id);
                  return (
                    <button
                      key={top.id}
                      type="button"
                      onClick={() => handleToggleTopping(top.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                        isChecked
                          ? 'bg-amber-500/15 border-amber-500 text-white font-bold'
                          : 'bg-stone-950/50 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isChecked ? 'bg-amber-500 border-amber-500 text-stone-950' : 'border-stone-700'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs">
                          {isAr ? top.nameAr : top.nameEn}
                          {top.isHighlight && (
                            <span className="ms-1 px-1 py-0.2 bg-amber-500/20 text-amber-400 text-[9px] rounded font-bold">
                              ★
                            </span>
                          )}
                        </span>
                      </div>
                      <span className="text-xs font-mono-numbers text-amber-400">+{top.price} {currency}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 6: Sauces & Dippings */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
                  6. {isAr ? 'الصلصات والصوصات المتنوعة' : 'Signature Sauces & Dippings'}
                </label>
                <span className="text-[11px] text-amber-400 font-mono-numbers">
                  {selectedSauces.length} {isAr ? 'صوصات' : 'sauces'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAUCE_OPTIONS.map((sauce) => {
                  const isChecked = selectedSauces.includes(sauce.id);
                  return (
                    <button
                      key={sauce.id}
                      type="button"
                      onClick={() => handleToggleSauce(sauce.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                        isChecked
                          ? 'bg-amber-500/15 border-amber-500 text-white font-bold'
                          : 'bg-stone-950/50 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isChecked ? 'bg-amber-500 border-amber-500 text-stone-950' : 'border-stone-700'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs">{isAr ? sauce.nameAr : sauce.nameEn}</span>
                      </div>
                      <span className="text-xs font-mono-numbers text-amber-400">+{sauce.price} {currency}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Custom Name & Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  {isAr ? 'اسم مخصص للساندوتش (اختياري)' : 'Custom Burger Name (Optional)'}
                </label>
                <input
                  type="text"
                  value={customBurgerName}
                  onChange={(e) => setCustomBurgerName(e.target.value)}
                  placeholder={isAr ? 'مثال: برجر أفوكادو فاير الخاص بي' : 'e.g. My Avocado Monster Burger'}
                  className="w-full px-3 py-1.5 text-xs bg-stone-950 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  {isAr ? 'تعليمات خاصة للمطبخ' : 'Special Kitchen Instructions'}
                </label>
                <input
                  type="text"
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                  placeholder={isAr ? 'مثال: تسوية ميديم، صوص جانبي...' : 'e.g. Medium rare, sauce on side...'}
                  className="w-full px-3 py-1.5 text-xs bg-stone-950 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Sidebar Summary & Live Price Breakdown (4 Cols) */}
          <div className="lg:col-span-4 bg-stone-950 rounded-xl border border-stone-800 p-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-stone-900 mb-3 border border-stone-800">
                <img
                  src={selectedToppings.includes('avocado')
                    ? APP_IMAGES.avocadoBacon
                    : selectedBase.image}
                  alt="Custom Burger"
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="text-sm font-bold text-white mb-2">
                {customBurgerName.trim() || (isAr ? 'ملخص تركيبة البرجر' : 'Burger Build Breakdown')}
              </h3>

              {/* Itemized price breakdown list */}
              <div className="space-y-1.5 text-xs text-stone-300 divide-y divide-stone-800/80">
                <div className="flex justify-between pt-1">
                  <span className="text-stone-400">{isAr ? 'اللحم الأساسي:' : 'Base Patty:'}</span>
                  <span className="font-mono-numbers">{basePrice} {currency}</span>
                </div>

                {sizePrice > 0 && (
                  <div className="flex justify-between pt-1 text-amber-400">
                    <span>{isAr ? selectedSize.nameAr : selectedSize.nameEn}:</span>
                    <span className="font-mono-numbers">+{sizePrice} {currency}</span>
                  </div>
                )}

                {bunPrice > 0 && (
                  <div className="flex justify-between pt-1">
                    <span className="text-stone-400">{isAr ? selectedBun.nameAr : selectedBun.nameEn}:</span>
                    <span className="font-mono-numbers">+{bunPrice} {currency}</span>
                  </div>
                )}

                {cheesePrice > 0 && (
                  <div className="flex justify-between pt-1">
                    <span className="text-stone-400">{isAr ? 'الأجبان:' : 'Cheeses:'}</span>
                    <span className="font-mono-numbers">+{cheesePrice} {currency}</span>
                  </div>
                )}

                {toppingsPrice > 0 && (
                  <div className="flex justify-between pt-1">
                    <span className="text-stone-400">{isAr ? 'الإضافات (أفوكادو/بيكون):' : 'Toppings:'}</span>
                    <span className="font-mono-numbers">+{toppingsPrice} {currency}</span>
                  </div>
                )}

                {saucesPrice > 0 && (
                  <div className="flex justify-between pt-1">
                    <span className="text-stone-400">{isAr ? 'الصلصات:' : 'Sauces:'}</span>
                    <span className="font-mono-numbers">+{saucesPrice} {currency}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Final Price & Add Action */}
            <div className="pt-3 border-t-2 border-stone-800 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-semibold text-stone-400 block">
                    {isAr ? 'السعر النهائي للقطعة:' : 'Unit Price:'}
                  </span>
                  <span className="text-lg font-black text-amber-400 font-mono-numbers">
                    {finalUnitPrice} {currency}
                  </span>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-6 h-6 rounded flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold font-mono-numbers text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Primary CTA */}
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="w-full flex items-center justify-between px-4 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-colors shadow-lg shadow-amber-500/20"
              >
                <span>{isAr ? 'إضافة البرجر للطلب' : 'Add Custom Burger'}</span>
                <span className="font-mono-numbers text-sm font-black">
                  {finalTotalPrice} {currency}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
