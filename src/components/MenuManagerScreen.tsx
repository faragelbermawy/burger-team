import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { BurgerItem, CategoryId } from '../types';
import { getItemImage, APP_IMAGES } from '../assets/images';
import { 
  SlidersHorizontal, 
  Plus, 
  Search, 
  Edit, 
  Check, 
  X, 
  Layers, 
  AlertCircle 
} from 'lucide-react';

export const MenuManagerScreen: React.FC = () => {
  const {
    language,
    settings,
    items,
    toggleStock,
    updateMenuItem,
    addMenuItem,
  } = usePOS();

  const isAr = language === 'ar';
  const currency = isAr ? settings.currencySymbolAr : settings.currencySymbolEn;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BurgerItem | null>(null);

  // Form states for Add/Edit
  const [formNameAr, setFormNameAr] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formPrice, setFormPrice] = useState<number>(100);
  const [formCategory, setFormCategory] = useState<CategoryId>('beef');
  const [formStock, setFormStock] = useState<number>(50);
  const [formDescAr, setFormDescAr] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formCalories, setFormCalories] = useState<number>(750);

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesCategory;

    const matchesSearch =
      item.nameAr.toLowerCase().includes(q) ||
      item.nameEn.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormNameAr('');
    setFormNameEn('');
    setFormCode(`B-0${items.length + 1}`);
    setFormPrice(150);
    setFormCategory('beef');
    setFormStock(50);
    setFormDescAr('');
    setFormDescEn('');
    setFormCalories(750);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: BurgerItem) => {
    setEditingItem(item);
    setFormNameAr(item.nameAr);
    setFormNameEn(item.nameEn);
    setFormCode(item.code);
    setFormPrice(item.basePrice);
    setFormCategory(item.category);
    setFormStock(item.stockCount);
    setFormDescAr(item.descriptionAr);
    setFormDescEn(item.descriptionEn);
    setFormCalories(item.calories || 700);
    setIsAddModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameAr.trim()) return;

    if (editingItem) {
      updateMenuItem({
        ...editingItem,
        nameAr: formNameAr,
        nameEn: formNameEn || formNameAr,
        code: formCode,
        basePrice: Number(formPrice),
        category: formCategory,
        stockCount: Number(formStock),
        inStock: Number(formStock) > 0,
        descriptionAr: formDescAr,
        descriptionEn: formDescEn,
        calories: Number(formCalories),
      });
    } else {
      const newItem: BurgerItem = {
        id: `item-${Date.now()}`,
        nameAr: formNameAr,
        nameEn: formNameEn || formNameAr,
        code: formCode,
        basePrice: Number(formPrice),
        category: formCategory,
        stockCount: Number(formStock),
        inStock: Number(formStock) > 0,
        descriptionAr: formDescAr,
        descriptionEn: formDescEn,
        calories: Number(formCalories),
        image: APP_IMAGES.heroBurger,
      };
      addMenuItem(newItem);
    }
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-61px)] overflow-hidden bg-stone-950 text-stone-100">
      {/* Top Header */}
      <div className="p-4 sm:p-5 bg-stone-900 border-b border-stone-800 space-y-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white">
                {isAr ? 'إدارة قائمة الطعام والمخزون' : 'Menu & Inventory Manager'}
              </h1>
              <p className="text-[11px] text-stone-400">
                {isAr ? 'تعديل أسعار الساندوتشات، التحكم في توفر الأصناف، وإضافة عناصر جديدة' : 'Manage item prices, stock availability, and burger recipes'}
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة صنف برجر جديد' : 'Add New Item'}</span>
          </button>
        </div>

        {/* Search & Categories */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث في المنيو بالاسم أو الكود...' : 'Search menu...'}
              className="w-full ps-9 pe-3 py-1.5 text-xs bg-stone-950 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 text-xs bg-stone-950 border border-stone-700 rounded-lg text-stone-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">{isAr ? 'جميع الأقسام (38)' : 'All Categories (38)'}</option>
            <option value="burgers">{isAr ? 'قسم البرجر (11)' : 'Burgers (11)'}</option>
            <option value="sandwiches">{isAr ? 'ساندويتشات (12)' : 'Sandwiches (12)'}</option>
            <option value="sides">{isAr ? 'أصناف جانبية (7)' : 'Sides & Fries (7)'}</option>
            <option value="toast">{isAr ? 'بريد / توست (4)' : 'Toast & Bread (4)'}</option>
            <option value="drinks">{isAr ? 'مشروبات باردة (4)' : 'Drinks (4)'}</option>
            <option value="desserts">{isAr ? 'ورق عنب وحلا (2)' : 'Specials & Sweets (2)'}</option>
          </select>
        </div>
      </div>

      {/* Menu Table / Cards */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="bg-stone-950/80 border-b border-stone-800 text-stone-400 font-semibold">
                  <th className="py-3 px-4 text-start">{isAr ? 'الصورة' : 'Image'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'كود الصنف' : 'Code'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'اسم الصنف' : 'Item Name'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'القسم' : 'Category'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'السعر' : 'Price'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'المخزون المتبقي' : 'Stock'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'حالة التوفر' : 'Availability'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'تعديل' : 'Edit'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-2.5 px-4">
                      <img
                        src={getItemImage(item.category, item.code, item.image)}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-stone-950"
                      />
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-amber-400">
                      {item.code}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-white">
                      <span>{isAr ? item.nameAr : item.nameEn}</span>
                      <span className="block text-[10px] text-stone-400 font-normal">
                        {isAr ? item.nameEn : item.nameAr}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-stone-300">
                      {item.category === 'burgers' || item.category === 'beef' || item.category === 'chicken'
                        ? (isAr ? 'قسم البرجر' : 'Burgers')
                        : item.category === 'sandwiches'
                        ? (isAr ? 'ساندويتشات' : 'Sandwiches')
                        : item.category === 'sides'
                        ? (isAr ? 'أصناف جانبية' : 'Sides')
                        : item.category === 'toast'
                        ? (isAr ? 'بريد / توست' : 'Toast')
                        : item.category === 'drinks'
                        ? (isAr ? 'مشروبات باردة' : 'Drinks')
                        : (isAr ? 'ورق عنب وحلا' : 'Desserts')}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-white font-mono-numbers">
                      {item.basePrice} {currency}
                    </td>
                    <td className="py-2.5 px-4 font-mono-numbers">
                      <span className={item.stockCount < 10 ? 'text-red-400 font-bold' : 'text-stone-300'}>
                        {item.stockCount} {isAr ? 'قطعة' : 'units'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <button
                        type="button"
                        onClick={() => toggleStock(item.id)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors ${
                          item.inStock && item.stockCount > 0
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25'
                        }`}
                      >
                        {item.inStock && item.stockCount > 0
                          ? (isAr ? 'متاح للطلب ✓' : 'Available ✓')
                          : (isAr ? 'غير متاح ✕' : 'Unavailable ✕')}
                      </button>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
                        title={isAr ? 'تعديل الصنف' : 'Edit item'}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSaveItem}
            className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4 text-stone-100"
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <h3 className="text-base font-bold text-white">
                {editingItem ? (isAr ? 'تعديل صنف في المنيو' : 'Edit Item') : (isAr ? 'إضافة صنف برجر جديد' : 'Add New Item')}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  {isAr ? 'الاسم بالعربية *' : 'Name (Arabic) *'}
                </label>
                <input
                  type="text"
                  required
                  value={formNameAr}
                  onChange={(e) => setFormNameAr(e.target.value)}
                  placeholder="مثال: تريبل تشيز برجر"
                  className="w-full px-3 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  {isAr ? 'الاسم بالإنجليزية' : 'Name (English)'}
                </label>
                <input
                  type="text"
                  value={formNameEn}
                  onChange={(e) => setFormNameEn(e.target.value)}
                  placeholder="Triple Cheese Burger"
                  className="w-full px-3 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  {isAr ? 'كود الصنف' : 'Item Code'}
                </label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="B-05"
                  className="w-full px-3 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  {isAr ? 'القسم' : 'Category'}
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as CategoryId)}
                  className="w-full px-3 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-white"
                >
                  <option value="burgers">{isAr ? 'قسم البرجر' : 'Burgers'}</option>
                  <option value="sandwiches">{isAr ? 'ساندويتشات' : 'Sandwiches'}</option>
                  <option value="sides">{isAr ? 'أصناف جانبية' : 'Sides'}</option>
                  <option value="toast">{isAr ? 'بريد / توست' : 'Toast & Bread'}</option>
                  <option value="drinks">{isAr ? 'مشروبات باردة' : 'Drinks'}</option>
                  <option value="desserts">{isAr ? 'ورق عنب وحلا' : 'Specials & Sweets'}</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  {isAr ? 'السعر الأساسي' : 'Base Price'} ({currency})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-white font-mono-numbers"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  {isAr ? 'الكمية بالمخزون' : 'Stock Quantity'}
                </label>
                <input
                  type="number"
                  required
                  value={formStock}
                  onChange={(e) => setFormStock(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-white font-mono-numbers"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-300 font-semibold text-xs mb-1">
                {isAr ? 'الوصف' : 'Description'}
              </label>
              <textarea
                rows={2}
                value={formDescAr}
                onChange={(e) => setFormDescAr(e.target.value)}
                placeholder={isAr ? 'مكونات الساندوتش...' : 'Ingredients...'}
                className="w-full px-3 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-white text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
              >
                {isAr ? 'حفظ الصنف' : 'Save Item'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
