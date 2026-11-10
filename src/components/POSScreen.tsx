import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { CategoryId, BurgerItem, OrderType } from '../types';
import { ItemCardImage } from './ItemCardImage';
import { getItemImage } from '../assets/images';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Utensils,
  ShoppingBag,
  Bike,
  Sparkles,
  Sliders,
  DollarSign,
  Receipt,
  Layers,
  ArrowRight,
  Flame,
  Check,
  Edit3,
  PackagePlus,
  X,
  Coins
} from 'lucide-react';

const CATEGORIES: { id: CategoryId | 'all'; nameAr: string; nameEn: string }[] = [
  { id: 'all', nameAr: 'جميع الأصناف', nameEn: 'All Items' },
  { id: 'burgers', nameAr: 'قسم البرجر', nameEn: 'Burgers' },
  { id: 'sandwiches', nameAr: 'ساندويتشات', nameEn: 'Sandwiches' },
  { id: 'sides', nameAr: 'أصناف جانبية', nameEn: 'Sides & Fries' },
  { id: 'toast', nameAr: 'بريد / توست', nameEn: 'Toast & Bread' },
  { id: 'drinks', nameAr: 'مشروبات باردة', nameEn: 'Cold Drinks' },
  { id: 'desserts', nameAr: 'ورق عنب وحلا', nameEn: 'Specials & Sweets' },
];

export const POSScreen: React.FC = () => {
  const {
    language,
    settings,
    items,
    cart,
    addToCart,
    updateCartQuantity,
    updateCartItemPrice,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartGrandTotal,
    cartDiscountAmount,
    cartTaxAmount,
    cartDeliveryFee,
    deliveryFee,
    setDeliveryFee,
    orderType,
    setOrderType,
    tableNumber,
    setTableNumber,
    openCustomizer,
    openCustomBuilder,
    openCheckoutModal,
    customer,
    setCustomer,
    selectedCustomer,
    selectCustomer,
    loyaltyDiscountAmount,
    addMenuItem,
    playAudioChime,
    activeShift,
    openOpeningCashModal,
  } = usePOS();

  const isAr = language === 'ar';
  const currency = isAr ? settings.currencySymbolAr : settings.currencySymbolEn;

  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCartId, setEditingCartId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<number>(0);

  // Cashier Add New Product Modal State
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newProdNameAr, setNewProdNameAr] = useState('');
  const [newProdNameEn, setNewProdNameEn] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<CategoryId>('burgers');
  const [newProdPrice, setNewProdPrice] = useState<number>(10);
  const [newProdCalories, setNewProdCalories] = useState<number>(350);
  const [newProdDescAr, setNewProdDescAr] = useState('');
  const [newProdCode, setNewProdCode] = useState('');

  const handleOpenAddProduct = () => {
    setNewProdNameAr('');
    setNewProdNameEn('');
    setNewProdCategory(selectedCategory === 'all' ? 'burgers' : selectedCategory);
    setNewProdPrice(10);
    setNewProdCalories(350);
    setNewProdDescAr('');
    setNewProdCode(`B-${String(items.length + 1).padStart(2, '0')}`);
    setIsAddProductModalOpen(true);
  };

  const handleAddNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdNameAr.trim()) return;

    const newItem: BurgerItem = {
      id: `item-${Date.now()}`,
      code: newProdCode.trim() || `B-${String(items.length + 1).padStart(2, '0')}`,
      nameAr: newProdNameAr.trim(),
      nameEn: newProdNameEn.trim() || newProdNameAr.trim(),
      descriptionAr: newProdDescAr.trim() || (isAr ? 'صنف طازج مضاف حديثاً' : 'Freshly added menu item'),
      descriptionEn: newProdDescAr.trim() || 'Freshly added menu item',
      category: newProdCategory,
      basePrice: Math.max(0.5, Number(newProdPrice) || 10),
      image: getItemImage(newProdCategory, newProdCode),
      calories: newProdCalories ? Number(newProdCalories) : undefined,
      inStock: true,
      stockCount: 100,
    };

    addMenuItem(newItem);
    playAudioChime();
    setIsAddProductModalOpen(false);
  };

  // Filter items by category and search
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;

      const matchesSearch =
        item.nameAr.toLowerCase().includes(query) ||
        item.nameEn.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query) ||
        item.descriptionAr.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-61px)] overflow-hidden bg-stone-950 text-stone-100">
      {/* ================= LEFT / MAIN PANEL: Catalog & Filters ================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-e border-stone-800">
        {/* Top Control Bar: Search & Quick Bar */}
        <div className="p-4 bg-stone-900/60 border-b border-stone-800 space-y-3 shrink-0">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'بحث سريع عن صنف أو كود (مثال: دبل سماش، B-01)...' : 'Quick search by burger name or code...'}
                className="w-full ps-10 pe-4 py-2 text-xs bg-stone-800/80 border border-stone-700/80 rounded-lg text-white placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-stone-800 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Add New Product Quick Button for Cashier & Manager */}
            <button
              type="button"
              onClick={handleOpenAddProduct}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-all shadow-sm shrink-0 whitespace-nowrap active:scale-[0.98]"
              title={isAr ? 'إضافة منتج جديد للمنيو' : 'Add New Product to Menu'}
            >
              <PackagePlus className="w-4 h-4 stroke-[2.5]" />
              <span>{isAr ? 'إضافة منتج +' : 'Add Product +'}</span>
            </button>

            {/* Total items count indicator */}
            <span className="hidden sm:inline-block text-xs text-stone-400 whitespace-nowrap">
              {filteredItems.length} {isAr ? 'صنف متاح' : 'items'}
            </span>
          </div>

          {/* Dynamic Custom Burger Builder Banner */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  {isAr ? 'صانع البرجر الديناميكي المبتكر' : 'Dynamic Custom Burger Configurator'}
                </h3>
                <p className="text-[11px] text-stone-300">
                  {isAr ? 'اختر لحم الأنجوس، شرائح الأفوكادو، البيكون، الأجبان، والصلصات مع حساب السعر لحظياً' : 'Build custom burger with avocado, beef bacon, cheeses & sauces with live price'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openCustomBuilder}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs rounded-lg transition-colors shadow-sm shrink-0"
            >
              <span>{isAr ? 'ابتكر برجر الآن' : 'Build Burger'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Category Filter Tabs (Single-line scrolling) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const count = cat.id === 'all' ? items.length : items.filter((i) => i.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'bg-stone-800/70 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800'
                  }`}
                >
                  <span>{isAr ? cat.nameAr : cat.nameEn}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-stone-950 text-amber-400' : 'bg-stone-800 text-stone-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {filteredItems.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-stone-400">
              <Search className="w-8 h-8 text-stone-600 mb-2" />
              <p className="text-sm font-semibold">{isAr ? 'لا توجد أصناف مطابقة للبحث' : 'No matching items found'}</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="mt-3 text-xs text-amber-400 hover:underline"
              >
                {isAr ? 'عرض كل الأصناف' : 'Show all items'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredItems.map((item) => {
                const isOutOfStock = !item.inStock || item.stockCount <= 0;
                return (
                  <div
                    key={item.id}
                    className={`group relative flex flex-col bg-stone-900 border rounded-xl overflow-hidden transition-all duration-200 select-none ${
                      isOutOfStock
                        ? 'opacity-60 border-stone-800'
                        : 'border-stone-800 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5'
                    }`}
                  >
                    {/* Image Slot via ItemCardImage */}
                    <ItemCardImage
                      category={item.category}
                      code={item.code}
                      name={isAr ? item.nameAr : item.nameEn}
                      image={item.image}
                      isPopular={item.isPopular}
                    />

                    {/* Out of Stock overlay */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-stone-950/85 flex items-center justify-center p-2 text-center z-20">
                        <span className="text-xs font-bold text-red-400 bg-red-950/60 px-2 py-1 rounded border border-red-800">
                          {isAr ? 'نفد من المخزون' : 'Out of Stock'}
                        </span>
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                          {isAr ? item.nameAr : item.nameEn}
                        </h3>
                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <p className="text-[11px] text-stone-400 line-clamp-1">
                            {isAr ? item.descriptionAr : item.descriptionEn}
                          </p>
                          {item.calories !== undefined && item.calories > 0 && (
                            <span className="text-[10px] font-mono text-amber-400/90 shrink-0 font-bold bg-stone-800/60 px-1 rounded">
                              {item.calories} cal
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between gap-1.5">
                        <div>
                          <span className="text-sm sm:text-base font-extrabold text-white font-mono-numbers">
                            {item.basePrice}
                          </span>
                          <span className="text-[10px] text-stone-400 ms-1">
                            {currency}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                          {/* Customize Button if configurable */}
                          {(item.sizes || item.availableToppings) && (
                            <button
                              type="button"
                              disabled={isOutOfStock}
                              onClick={() => openCustomizer(item)}
                              title={isAr ? 'تخصيص الإضافات والمكونات' : 'Customize burger'}
                              className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors disabled:opacity-40"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Quick Add with standard defaults */}
                          <button
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => addToCart(item)}
                            title={isAr ? 'إضافة سريعة للطلب' : 'Quick add'}
                            className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold flex items-center justify-center transition-colors shadow-sm disabled:opacity-40"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ================= RIGHT PANEL: Order Ticket & Checkout ================= */}
      <div className="w-full lg:w-[380px] xl:w-[420px] h-full flex flex-col bg-stone-900 shrink-0 border-t lg:border-t-0 select-none">
        {/* Ticket Header: Order Type Selector (صالة / سفري / دليفري) */}
        <div className="p-3.5 bg-stone-950 border-b border-stone-800 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {isAr ? 'طلب الكاشير' : 'Order Ticket'}
              </span>
              <button
                type="button"
                onClick={openOpeningCashModal}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 hover:border-amber-500/50 text-[10px] text-stone-300 hover:text-amber-400 transition-colors"
                title={isAr ? 'تعديل الرصيد الافتتاحي للشفت' : 'Edit opening shift cash'}
              >
                <Coins className="w-2.5 h-2.5 text-amber-500" />
                <span className="text-stone-400">{isAr ? 'العهدة:' : 'Float:'}</span>
                <span className="font-mono font-bold text-amber-300">{activeShift.openingCash} {currency}</span>
              </button>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-stone-400 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>{isAr ? 'مسح السلة' : 'Clear'}</span>
              </button>
            )}
          </div>

          {/* Customer Name Input (Simple as requested: customer name is enough) */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-stone-900 rounded-lg border border-stone-800 text-xs">
            <span className="text-stone-400 shrink-0 text-[11px]">
              {isAr ? 'اسم العميل:' : 'Customer:'}
            </span>
            <input
              type="text"
              value={customer.name}
              onChange={(e) => setCustomer((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={isAr ? 'اكتب اسم العميل (اختياري)...' : 'Customer name (optional)...'}
              className="flex-1 bg-transparent border-0 text-white placeholder-stone-600 text-xs focus:outline-none"
            />
            {customer.name && (
              <button
                type="button"
                onClick={() => setCustomer((prev) => ({ ...prev, name: '' }))}
                className="text-stone-500 hover:text-stone-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Segmented Control for Order Type */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-stone-900 rounded-lg border border-stone-800">
            <button
              type="button"
              onClick={() => setOrderType('dine-in')}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                orderType === 'dine-in'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>{isAr ? 'صالة' : 'Dine-In'}</span>
            </button>

            <button
              type="button"
              onClick={() => setOrderType('takeaway')}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                orderType === 'takeaway'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isAr ? 'سفري' : 'Takeaway'}</span>
            </button>

            <button
              type="button"
              onClick={() => setOrderType('delivery')}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                orderType === 'delivery'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>{isAr ? 'توصيل' : 'Delivery'}</span>
            </button>
          </div>

          {/* Sub-bar based on order type (Table picker or Customer address) */}
          {orderType === 'dine-in' && (
            <div className="flex items-center justify-between bg-stone-900/80 px-2.5 py-1.5 rounded-lg border border-stone-800 text-xs">
              <span className="text-stone-400 font-medium">
                {isAr ? 'رقم الطاولة:' : 'Table Number:'}
              </span>
              <div className="flex items-center gap-1">
                {['1', '2', '3', '4', '5', '6'].map((tbl) => (
                  <button
                    key={tbl}
                    type="button"
                    onClick={() => setTableNumber(tbl)}
                    className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs font-mono-numbers transition-colors ${
                      tableNumber === tbl
                        ? 'bg-amber-500 text-stone-950'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    {tbl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {orderType === 'delivery' && (
            <div className="p-2.5 bg-stone-900/95 rounded-lg border border-stone-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-stone-300 font-bold">
                  <Bike className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'خدمة التوصيل:' : 'Delivery Fee:'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center bg-stone-950 border border-stone-700 rounded-lg overflow-hidden focus-within:border-amber-500">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(Math.max(0, Number(e.target.value) || 0))}
                      className="w-16 px-2 py-1 text-center bg-transparent text-amber-400 font-black font-mono-numbers text-xs focus:outline-none"
                    />
                    <span className="pe-2 text-[11px] font-bold text-stone-400">{currency}</span>
                  </div>
                </div>
              </div>

              {/* Quick Preset Buttons: 0 (Free), 5, 10 (Default), 15, 20 */}
              <div className="flex items-center gap-1">
                {[0, 5, 10, 15, 20].map((fee) => (
                  <button
                    key={fee}
                    type="button"
                    onClick={() => setDeliveryFee(fee)}
                    className={`flex-1 py-1 rounded text-[10px] font-mono-numbers font-bold border transition-colors ${
                      deliveryFee === fee
                        ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm'
                        : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700 hover:text-white'
                    }`}
                  >
                    {fee === 0 ? (isAr ? 'مجاني' : '0') : `${fee}`}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <input
                  type="text"
                  placeholder={isAr ? 'اسم العميل' : 'Customer Name'}
                  value={customer.name || ''}
                  onChange={(e) => setCustomer((prev) => ({ ...prev, name: e.target.value }))}
                  className="px-2 py-1 bg-stone-950 border border-stone-800 rounded text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-xs"
                />
                <input
                  type="tel"
                  placeholder={isAr ? 'رقم الهاتف' : 'Phone'}
                  value={customer.phone || ''}
                  onChange={(e) => setCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                  className="px-2 py-1 bg-stone-950 border border-stone-800 rounded text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500 space-y-2">
              <div className="w-12 h-12 rounded-full bg-stone-800/80 border border-stone-700/60 flex items-center justify-center text-stone-400">
                <Receipt className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-stone-300">
                {isAr ? 'الطلب فارغ حالياً' : 'Order is empty'}
              </p>
              <p className="text-[11px] text-stone-500 max-w-[200px]">
                {isAr ? 'اضغط على أي برجر لإضافته للطلب وإصدار الفاتورة' : 'Click on any burger to add and generate bill'}
              </p>
            </div>
          ) : (
            cart.map((cartItem) => (
              <div
                key={cartItem.cartId}
                className="p-2.5 bg-stone-950/70 border border-stone-800/90 rounded-lg space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-bold text-white">
                        {isAr ? cartItem.nameAr : cartItem.nameEn}
                      </span>
                      {cartItem.selectedSize && (
                        <span className="text-[10px] text-amber-400 font-medium">
                          ({isAr ? cartItem.selectedSize.nameAr : cartItem.selectedSize.nameEn})
                        </span>
                      )}
                    </div>

                    {/* Extras / Toppings summary */}
                    {cartItem.selectedToppings && cartItem.selectedToppings.length > 0 && (
                      <div className="text-[10px] text-stone-400 flex flex-wrap gap-1 mt-0.5">
                        {cartItem.selectedToppings.map((top, idx) => (
                          <span key={idx}>+ {isAr ? top.nameAr : top.nameEn}</span>
                        ))}
                      </div>
                    )}

                    {/* Exclusions */}
                    {cartItem.removedIngredients && cartItem.removedIngredients.length > 0 && (
                      <div className="text-[10px] text-red-400 italic">
                        {cartItem.removedIngredients.map((r) => isAr ? r.nameAr : r.nameEn).join(' · ')}
                      </div>
                    )}

                    {/* Custom note */}
                    {cartItem.notes && (
                      <div className="text-[10px] text-amber-300 italic">
                        * {cartItem.notes}
                      </div>
                    )}
                  </div>

                  {/* Item Total & Price Edit Button */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCartId(editingCartId === cartItem.cartId ? null : cartItem.cartId);
                          setEditingPriceValue(cartItem.unitPrice);
                        }}
                        title={isAr ? 'تعديل سعر المنتج للكاشير' : 'Edit item price'}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
                      >
                        <Edit3 className="w-2.5 h-2.5" />
                        <span>{isAr ? 'تعديل السعر' : 'Price'}</span>
                      </button>

                      <div className="text-end">
                        <span className="text-xs font-extrabold text-white font-mono-numbers">
                          {cartItem.itemTotal.toFixed(2)}
                        </span>
                        <span className="text-[9px] text-stone-400 ms-0.5">{currency}</span>
                      </div>
                    </div>

                    {cartItem.customPriceEdited && (
                      <span className="text-[9px] bg-amber-500/15 text-amber-300 px-1 py-0.2 rounded border border-amber-500/30 font-mono">
                        {isAr ? 'سعر خاص:' : 'Custom:'} {cartItem.unitPrice} {currency}
                      </span>
                    )}
                  </div>
                </div>

                {/* Inline Price Editor for Cashier */}
                {editingCartId === cartItem.cartId && (
                  <div className="p-2 bg-stone-900 border border-amber-500/40 rounded-lg flex items-center justify-between gap-2 animate-fadeIn text-xs">
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="text-[11px] text-stone-300 font-semibold">{isAr ? 'سعر الحبة:' : 'Unit:'}</span>
                      <input
                        type="number"
                        step="any"
                        autoFocus
                        value={editingPriceValue}
                        onChange={(e) => setEditingPriceValue(Number(e.target.value) || 0)}
                        className="w-20 px-2 py-1 bg-stone-950 border border-stone-700 rounded text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-[10px] text-stone-400">{currency}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          updateCartItemPrice(cartItem.cartId, editingPriceValue);
                          setEditingCartId(null);
                        }}
                        className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[10px] rounded transition-colors"
                      >
                        {isAr ? 'حفظ' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCartId(null)}
                        className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-400 text-[10px] rounded transition-colors"
                      >
                        {isAr ? 'إلغاء' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Quantity Controls & Delete */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-800/50">
                  <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded p-0.5">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(cartItem.cartId, -1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold font-mono-numbers text-white">
                      {cartItem.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(cartItem.cartId, 1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(cartItem.cartId)}
                    className="text-stone-500 hover:text-red-400 transition-colors p-1"
                    title={isAr ? 'حذف الصنف' : 'Delete item'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ticket Footer: Financial Calculations & Checkout Button */}
        <div className="p-3.5 bg-stone-950 border-t border-stone-800 space-y-2.5 shrink-0">
          {/* Subtotal & Breakdown */}
          <div className="space-y-1 text-xs text-stone-400">
            <div className="flex justify-between">
              <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
              <span className="font-mono-numbers text-stone-200">{cartSubtotal} {currency}</span>
            </div>
            {cartDiscountAmount > 0 && (
              <div className="flex justify-between text-amber-400">
                <span>{isAr ? 'الخصم:' : 'Discount:'}</span>
                <span className="font-mono-numbers">-{cartDiscountAmount} {currency}</span>
              </div>
            )}
            {settings.taxRatePercent > 0 && (
              <div className="flex justify-between">
                <span>{isAr ? `الضريبة (${settings.taxRatePercent}%):` : `VAT (${settings.taxRatePercent}%):`}</span>
                <span className="font-mono-numbers text-stone-200">{cartTaxAmount} {currency}</span>
              </div>
            )}
            {orderType === 'delivery' && (
              <div className="flex justify-between items-center py-0.5">
                <span className="flex items-center gap-1.5 text-stone-300">
                  <Bike className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'خدمة التوصيل:' : 'Delivery Fee:'}</span>
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Math.max(0, Number(e.target.value) || 0))}
                    className="w-14 px-1.5 py-0.5 text-center bg-stone-900 border border-stone-700 rounded text-amber-400 font-mono-numbers text-xs font-bold focus:outline-none focus:border-amber-500"
                    title={isAr ? 'تعديل سعر التوصيل' : 'Edit delivery fee'}
                  />
                  <span className="text-stone-400 text-xs">{currency}</span>
                </div>
              </div>
            )}
            <div className="flex justify-between pt-1.5 border-t border-stone-800 text-sm font-bold text-white">
              <span>{isAr ? 'الإجمالي المطلوب:' : 'Grand Total:'}</span>
              <span className="text-amber-400 font-mono-numbers text-base">{cartGrandTotal} {currency}</span>
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={openCheckoutModal}
            className="w-full flex items-center justify-between px-4 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 stroke-[2.5]" />
              <span>{isAr ? 'الدفع وإصدار الفاتورة' : 'Pay & Issue Invoice'}</span>
            </div>
            <span className="font-mono-numbers text-base font-black">
              {cartGrandTotal} {currency}
            </span>
          </button>
        </div>
      </div>

      {/* ================= MODAL: Add New Product (Cashier & Manager Permission) ================= */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl text-stone-100 flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-stone-950 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white">
                    {isAr ? 'إضافة منتج جديد للمنيو' : 'Add New Product to Menu'}
                  </h2>
                  <p className="text-[11px] text-stone-400">
                    {isAr ? 'صلاحية الكاشير لإضافة أي صنف جديد فورياً ليتوفر في شاشة البيع' : 'Instant product creation for the cashier'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddProductModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleAddNewProduct} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Arabic Name (Required) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {isAr ? 'اسم المنتج بالعربي *' : 'Product Name (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newProdNameAr}
                    onChange={(e) => setNewProdNameAr(e.target.value)}
                    placeholder={isAr ? 'مثال: برجر دبل كرانشي مخصوص...' : 'e.g. Double Crunchy Burger...'}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-950 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* English Name (Optional) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-400 mb-1">
                    {isAr ? 'اسم المنتج بالإنجليزية (اختياري)' : 'Product Name (English - Optional)'}
                  </label>
                  <input
                    type="text"
                    value={newProdNameEn}
                    onChange={(e) => setNewProdNameEn(e.target.value)}
                    placeholder={isAr ? 'Double Crunchy Burger' : 'English name'}
                    className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Selling Price (Required) */}
                <div>
                  <label className="block text-xs font-semibold text-amber-400 mb-1 flex items-center justify-between">
                    <span>{isAr ? 'سعر البيع (ريال) *' : 'Selling Price (SAR) *'}</span>
                    <span className="text-[10px] text-stone-400 font-normal">{currency}</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      required
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-stone-950 border border-amber-500/50 rounded-lg text-amber-400 font-black font-mono-numbers focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {isAr ? 'القسم / التصنيف *' : 'Category *'}
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as CategoryId)}
                    className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-700 rounded-lg text-stone-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="burgers">{isAr ? 'قسم البرجر' : 'Burgers'}</option>
                    <option value="sandwiches">{isAr ? 'ساندويتشات' : 'Sandwiches'}</option>
                    <option value="sides">{isAr ? 'أصناف جانبية' : 'Sides'}</option>
                    <option value="toast">{isAr ? 'بريد / توست' : 'Toast'}</option>
                    <option value="drinks">{isAr ? 'مشروبات باردة' : 'Drinks'}</option>
                    <option value="desserts">{isAr ? 'ورق عنب وحلا' : 'Desserts'}</option>
                  </select>
                </div>

                {/* Item Code */}
                <div>
                  <label className="block text-xs font-semibold text-stone-400 mb-1">
                    {isAr ? 'كود الصنف' : 'Item Code'}
                  </label>
                  <input
                    type="text"
                    value={newProdCode}
                    onChange={(e) => setNewProdCode(e.target.value)}
                    placeholder="B-41"
                    className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-700 rounded-lg text-white font-mono placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Calories (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-stone-400 mb-1">
                    {isAr ? 'السعرات الحرارية (Cal)' : 'Calories'}
                  </label>
                  <input
                    type="number"
                    value={newProdCalories || ''}
                    onChange={(e) => setNewProdCalories(Number(e.target.value))}
                    placeholder="350"
                    className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-700 rounded-lg text-white font-mono placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Description (Optional) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-400 mb-1">
                    {isAr ? 'وصف الصنف أو المكونات (اختياري)' : 'Description (Optional)'}
                  </label>
                  <textarea
                    rows={2}
                    value={newProdDescAr}
                    onChange={(e) => setNewProdDescAr(e.target.value)}
                    placeholder={isAr ? 'مثال: شريحة لحم مشوية طازجة مع الجبن الشيدر وصوص برجر تيم...' : 'Description...'}
                    className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 transition-colors"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>{isAr ? 'تأكيد وإضافة المنتج للمنيو الآن' : 'Save & Add to Menu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
