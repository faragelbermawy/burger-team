import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { CustomerProfile } from '../types';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShoppingBag, 
  Clock, 
  Phone, 
  MapPin, 
  Mail, 
  Calendar, 
  CheckCircle, 
  Receipt, 
  X,
  Printer,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export const CustomersScreen: React.FC = () => {
  const {
    language,
    settings,
    customers,
    invoices,
    selectCustomer,
    addCustomer,
    setActiveView,
    openReceiptModal,
  } = usePOS();

  const isAr = language === 'ar';
  const currency = isAr ? settings.currencySymbolAr : settings.currencySymbolEn;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<CustomerProfile | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add form fields
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;

      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q))
      );
    });
  }, [customers, searchQuery]);

  // Aggregate customer metrics
  const totalLoyalSales = customers.reduce((acc, c) => acc + c.totalSpent, 0);

  // Get customer past invoices
  const customerInvoices = useMemo(() => {
    if (!selectedProfile) return [];
    return invoices.filter(
      (inv) =>
        inv.customer?.id === selectedProfile.id ||
        (inv.customer?.phone && inv.customer.phone === selectedProfile.phone)
    );
  }, [selectedProfile, invoices]);

  const handleStartOrderForCustomer = (cust: CustomerProfile) => {
    selectCustomer(cust);
    setActiveView('pos');
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    addCustomer({
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim() || undefined,
      address: newAddress.trim() || undefined,
      notes: newNotes.trim() || undefined,
    });

    setIsAddModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewAddress('');
    setNewNotes('');
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-61px)] overflow-hidden bg-stone-950 text-stone-100">
      {/* Top Header */}
      <div className="p-4 sm:p-5 bg-stone-900 border-b border-stone-800 space-y-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white">
                {isAr ? 'دليل وسجل العملاء' : 'Customer Directory'}
              </h1>
              <p className="text-[11px] text-stone-400">
                {isAr ? 'سجل بيانات وأسماء العملاء، أرقام التواصل، وتاريخ طلباتهم السابقة' : 'Customer directory, contact numbers, and purchase history'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isAr ? 'تسجيل عميل جديد' : 'Register Customer'}</span>
          </button>
        </div>

        {/* Customer Directory Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="p-2.5 bg-stone-950/80 border border-stone-800 rounded-lg">
            <span className="text-[11px] text-stone-400 block">{isAr ? 'إجمالي العملاء المسجلين' : 'Registered Customers'}</span>
            <span className="text-base font-extrabold text-white font-mono-numbers">{customers.length}</span>
          </div>

          <div className="p-2.5 bg-stone-950/80 border border-stone-800 rounded-lg">
            <span className="text-[11px] text-stone-400 block">{isAr ? 'إجمالي مشتريات العملاء' : 'Total Customer Spend'}</span>
            <span className="text-base font-extrabold text-emerald-400 font-mono-numbers">{totalLoyalSales.toFixed(2)} {currency}</span>
          </div>

          <div className="p-2.5 bg-stone-950/80 border border-stone-800 rounded-lg">
            <span className="text-[11px] text-stone-400 block">{isAr ? 'إجمالي عدد الطلبات' : 'Total Orders'}</span>
            <span className="text-base font-extrabold text-amber-400 font-mono-numbers">
              {customers.reduce((acc, c) => acc + (c.orderCount || 0), 0)} {isAr ? 'طلب' : 'orders'}
            </span>
          </div>

          <div className="p-2.5 bg-stone-950/80 border border-stone-800 rounded-lg">
            <span className="text-[11px] text-stone-400 block">{isAr ? 'متوسط قيمة العميل' : 'Avg Customer Value'}</span>
            <span className="text-xs font-bold text-stone-200">
              {customers.length > 0 ? (totalLoyalSales / customers.length).toFixed(2) : '0'} {currency}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="pt-1">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث باسم العميل، رقم الهاتف، أو الملاحظات...' : 'Search by customer name, phone...'}
              className="w-full ps-9 pe-3 py-2 text-xs bg-stone-950 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Customers List View */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {filteredCustomers.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-stone-500">
            <Users className="w-10 h-10 text-stone-600 mb-2" />
            <p className="text-sm font-semibold text-stone-300">
              {isAr ? 'لم يتم العثور على عملاء مطابقين' : 'No matching customers found'}
            </p>
          </div>
        ) : (
          <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-950/80 border-b border-stone-800 text-stone-400 font-semibold">
                    <th className="py-3 px-4 text-start">{isAr ? 'العميل' : 'Customer'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'رقم الهاتف' : 'Phone'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'العنوان / الملاحظات' : 'Address / Notes'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'إجمالي المشتريات' : 'Total Spent'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'عدد الطلبات' : 'Orders'}</th>
                    <th className="py-3 px-4 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/80">
                  {filteredCustomers.map((cust) => {
                    return (
                      <tr key={cust.id} className="hover:bg-stone-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedProfile(cust)}
                            className="text-start hover:text-amber-400 transition-colors flex items-center gap-1.5"
                          >
                            <span>{cust.name}</span>
                            <ChevronRight className="w-3 h-3 text-stone-500" />
                          </button>
                        </td>

                        <td className="py-3 px-4 font-mono text-stone-300 whitespace-nowrap">
                          {cust.phone}
                        </td>

                        <td className="py-3 px-4 text-stone-400 max-w-[200px] truncate">
                          {cust.address || cust.notes || '-'}
                        </td>

                        <td className="py-3 px-4 font-bold text-white font-mono-numbers whitespace-nowrap">
                          {cust.totalSpent.toFixed(2)} {currency}
                        </td>

                        <td className="py-3 px-4 font-mono-numbers text-stone-300 whitespace-nowrap">
                          {cust.orderCount || 0}
                        </td>

                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedProfile(cust)}
                              className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors text-[11px] font-semibold"
                            >
                              {isAr ? 'سجل الطلبات' : 'History'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStartOrderForCustomer(cust)}
                              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors text-[11px] font-bold shadow-sm"
                            >
                              {isAr ? 'طلب جديد' : 'New Order'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Customer Profile & Order History Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl text-stone-100">
            {/* Header */}
            <div className="px-5 py-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold text-base">
                  {selectedProfile.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">{selectedProfile.name}</h2>
                  </div>
                  <p className="text-xs text-stone-400 flex items-center gap-2 mt-0.5">
                    <span>{selectedProfile.phone}</span>
                    {selectedProfile.email && <span>· {selectedProfile.email}</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProfile(null)}
                  className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Profile Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Top Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800">
                  <span className="text-xs text-stone-400 block mb-1">{isAr ? 'إجمالي الإنفاق التراكمي' : 'Lifetime Spend'}</span>
                  <div className="flex items-baseline gap-1.5 text-white">
                    <span className="text-xl font-black font-mono-numbers">{selectedProfile.totalSpent.toFixed(2)}</span>
                    <span className="text-xs font-semibold text-stone-400">{currency}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800">
                  <span className="text-xs text-stone-400 block mb-1">{isAr ? 'إجمالي الطلبات السابقة' : 'Total Orders'}</span>
                  <div className="flex items-baseline gap-1.5 text-white">
                    <span className="text-xl font-black font-mono-numbers">{customerInvoices.length || selectedProfile.orderCount || 0}</span>
                    <span className="text-xs font-semibold text-stone-400">{isAr ? 'طلبات' : 'orders'}</span>
                  </div>
                </div>
              </div>

              {/* Customer Address & Notes */}
              {(selectedProfile.address || selectedProfile.notes) && (
                <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800 text-xs space-y-1">
                  {selectedProfile.address && (
                    <div className="flex items-center gap-1.5 text-stone-300">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{selectedProfile.address}</span>
                    </div>
                  )}
                  {selectedProfile.notes && (
                    <div className="text-stone-400 italic pt-1">
                      {isAr ? 'ملاحظة:' : 'Note:'} {selectedProfile.notes}
                    </div>
                  )}
                </div>
              )}

              {/* Order History Table */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isAr ? 'سجل طلبات وفواتير العميل' : 'Customer Order History'}</span>
                </h3>

                {customerInvoices.length === 0 ? (
                  <div className="p-4 bg-stone-950 rounded-lg text-center text-xs text-stone-500">
                    {isAr ? 'لا توجد فواتير سابقة مسجلة لهذا العميل حتى الآن' : 'No previous invoices recorded for this customer yet'}
                  </div>
                ) : (
                  <div className="bg-stone-950 rounded-lg border border-stone-800 overflow-hidden">
                    <div className="divide-y divide-stone-800">
                      {customerInvoices.map((inv) => (
                        <div key={inv.id} className="p-3 flex items-center justify-between text-xs hover:bg-stone-900/50 transition-colors">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white font-mono">{inv.invoiceNumber}</span>
                              <span className="text-stone-400">#{inv.dailyOrderNumber}</span>
                              <span className="text-[10px] text-stone-500">
                                {new Date(inv.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-400 mt-0.5">
                              {inv.items.map((i) => `${i.quantity}x ${isAr ? i.nameAr : i.nameEn}`).join(', ')}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-bold text-amber-400 font-mono-numbers">
                              {inv.grandTotal.toFixed(2)} {currency}
                            </span>
                            <button
                              type="button"
                              onClick={() => openReceiptModal(inv)}
                              className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300"
                              title={isAr ? 'طباعة الفاتورة' : 'Print Invoice'}
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-950 border-t border-stone-800 flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>

              <button
                type="button"
                onClick={() => {
                  handleStartOrderForCustomer(selectedProfile);
                  setSelectedProfile(null);
                }}
                className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs shadow-lg shadow-amber-500/20"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isAr ? 'بدء طلب جديد لهذا العميل' : 'Start Order in POS'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Register New Customer */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreateCustomer}
            className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 text-stone-100"
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-white">
                  {isAr ? 'تسجيل عميل جديد بنظام الولاء' : 'Register New Customer'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  {isAr ? 'اسم العميل *' : 'Customer Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={isAr ? 'مثال: أحمد عبد الله' : 'e.g. Ahmed Abdullah'}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  {isAr ? 'رقم الهاتف (معرف الولاء) *' : 'Phone Number (Loyalty ID) *'}
                </label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white font-mono placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  {isAr ? 'البريد الإلكتروني (اختياري)' : 'Email (Optional)'}
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  {isAr ? 'العنوان الافتراضي للتوصيل (اختياري)' : 'Delivery Address (Optional)'}
                </label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder={isAr ? 'الشارع، رقم العمارة، الشقة...' : 'Street, building, apt...'}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  {isAr ? 'ملاحظات وتفضيلات العميل' : 'Customer Notes & Preferences'}
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder={isAr ? 'مثال: يفضل الأفوكادو والبيكون...' : 'Preferences...'}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>
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
                {isAr ? 'تأكيد التسجيل والبدء' : 'Register Customer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
