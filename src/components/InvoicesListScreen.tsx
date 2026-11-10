import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { Invoice, OrderStatus } from '../types';
import {
  ReceiptText,
  Search,
  Printer,
  Ban,
  FileSpreadsheet,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  Eye,
  Filter,
  ArrowUpDown
} from 'lucide-react';

export const InvoicesListScreen: React.FC = () => {
  const {
    language,
    settings,
    invoices,
    openReceiptModal,
    cancelInvoice,
  } = usePOS();

  const isAr = language === 'ar';
  const currency = isAr ? settings.currencySymbolAr : settings.currencySymbolEn;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      const matchesType = typeFilter === 'all' || inv.orderType === typeFilter;

      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesStatus && matchesType;

      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.dailyOrderNumber.toString().includes(q) ||
        (inv.customer?.name && inv.customer.name.toLowerCase().includes(q)) ||
        (inv.customer?.phone && inv.customer.phone.includes(q)) ||
        inv.cashierName.toLowerCase().includes(q);

      return matchesStatus && matchesType && matchesSearch;
    });
  }, [invoices, statusFilter, typeFilter, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['Invoice ID', 'Order #', 'Date', 'Type', 'Grand Total', 'Payment', 'Status', 'Cashier'];
    const rows = filteredInvoices.map((i) => [
      i.invoiceNumber,
      i.dailyOrderNumber,
      new Date(i.createdAt).toLocaleString(),
      i.orderType,
      i.grandTotal,
      i.paymentMethod,
      i.status,
      i.cashierName,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BurgerCraft_Invoices_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCancel = (invoiceId: string) => {
    const reason = window.prompt(isAr ? 'سبب إلغاء أو استرجاع الفاتورة:' : 'Reason for cancelling invoice:');
    if (reason !== null) {
      cancelInvoice(invoiceId, reason);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-61px)] overflow-hidden bg-stone-950 text-stone-100">
      {/* Top Header */}
      <div className="p-4 sm:p-5 bg-stone-900 border-b border-stone-800 space-y-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <ReceiptText className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white">
                {isAr ? 'سجل الفواتير والمبيعات' : 'Invoices & Sales Log'}
              </h1>
              <p className="text-[11px] text-stone-400">
                {isAr ? 'استعراض جميع الفواتير الصادرة وطباعة الإيصالات أو إلغاء العمليات' : 'Browse issued invoices, reprint slips, or void transactions'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold rounded-lg border border-stone-700 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isAr ? 'تصدير كملف Excel / CSV' : 'Export CSV'}</span>
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث برقم الفاتورة، رقم الطلب، هاتف العميل...' : 'Search by invoice #, customer phone...'}
              className="w-full ps-9 pe-3 py-1.5 text-xs bg-stone-950 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-stone-950 border border-stone-700 rounded-lg text-stone-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="completed">{isAr ? 'مكتملة ومستلمة' : 'Completed'}</option>
            <option value="preparing">{isAr ? 'قيد التجهيز بالمطبخ' : 'Preparing'}</option>
            <option value="ready">{isAr ? 'جاهزة للتسليم' : 'Ready'}</option>
            <option value="cancelled">{isAr ? 'ملغاة' : 'Cancelled'}</option>
          </select>

          {/* Order Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-stone-950 border border-stone-700 rounded-lg text-stone-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">{isAr ? 'جميع أنواع الطلبات' : 'All Order Types'}</option>
            <option value="dine-in">{isAr ? 'صالة (طاولات)' : 'Dine-In'}</option>
            <option value="takeaway">{isAr ? 'تيك أواي / سفري' : 'Takeaway'}</option>
            <option value="delivery">{isAr ? 'دليفري / توصيل' : 'Delivery'}</option>
          </select>
        </div>
      </div>

      {/* Invoices Table View */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {filteredInvoices.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-stone-500">
            <ReceiptText className="w-10 h-10 text-stone-600 mb-2" />
            <p className="text-sm font-semibold text-stone-300">
              {isAr ? 'لا توجد فواتير مطابقة للبحث' : 'No matching invoices found'}
            </p>
          </div>
        ) : (
          <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-950/80 border-b border-stone-800 text-stone-400 font-semibold">
                    <th className="py-3 px-4 text-start">{isAr ? 'رقم الفاتورة' : 'Invoice #'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'رقم الطلب' : 'Order #'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'الوقت والتاريخ' : 'Date & Time'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'النوع' : 'Type'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'الأصناف' : 'Items'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'طريقة الدفع' : 'Payment'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'الإجمالي' : 'Total'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                    <th className="py-3 px-4 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/80">
                  {filteredInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-stone-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 font-black text-white font-mono-numbers">
                        #{inv.dailyOrderNumber}
                      </td>
                      <td className="py-3 px-4 text-stone-400 whitespace-nowrap">
                        {new Date(inv.createdAt).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        <span className="block text-[10px] text-stone-500">
                          {new Date(inv.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-xs font-medium text-stone-300">
                          {inv.orderType === 'dine-in'
                            ? (isAr ? `صالة · ط-${inv.tableNumber || '-'}` : `Dine-In (T-${inv.tableNumber || '-'})`)
                            : inv.orderType === 'takeaway'
                            ? (isAr ? 'تيك أواي' : 'Takeaway')
                            : (isAr ? 'توصيل' : 'Delivery')}
                        </span>
                        {inv.customer?.name && (
                          <span className="block text-[10px] text-stone-500 truncate max-w-[120px]">
                            {inv.customer.name}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-[220px] truncate text-stone-300">
                          {inv.items.map((i) => `${i.quantity}x ${isAr ? i.nameAr : i.nameEn}`).join(' + ')}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs text-stone-300">
                          {inv.paymentMethod === 'cash' ? (
                            <>
                              <Banknote className="w-3.5 h-3.5 text-amber-400" />
                              <span>{isAr ? 'كاش' : 'Cash'}</span>
                            </>
                          ) : inv.paymentMethod === 'card' ? (
                            <>
                              <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                              <span>{isAr ? 'بطاقة' : 'Card'}</span>
                            </>
                          ) : (
                            <>
                              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{isAr ? 'محفظة' : 'Online'}</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white font-mono-numbers whitespace-nowrap">
                        {inv.grandTotal.toFixed(2)} {currency}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-[11px] font-bold ${
                          inv.status === 'completed'
                            ? 'text-emerald-400'
                            : inv.status === 'preparing'
                            ? 'text-amber-400'
                            : inv.status === 'ready'
                            ? 'text-blue-400'
                            : inv.status === 'cancelled'
                            ? 'text-red-400'
                            : 'text-stone-400'
                        }`}>
                          {inv.status === 'completed'
                            ? (isAr ? 'مكتملة' : 'Completed')
                            : inv.status === 'preparing'
                            ? (isAr ? 'قيد التجهيز' : 'Preparing')
                            : inv.status === 'ready'
                            ? (isAr ? 'جاهزة' : 'Ready')
                            : inv.status === 'cancelled'
                            ? (isAr ? 'ملغاة' : 'Cancelled')
                            : (isAr ? 'معلقة' : 'Pending')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openReceiptModal(inv)}
                            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
                            title={isAr ? 'عرض وطباعة الفاتورة' : 'View & Print Receipt'}
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {inv.status !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => handleCancel(inv.id)}
                              className="p-1.5 rounded-lg bg-stone-800 hover:bg-red-950/50 text-stone-400 hover:text-red-400 transition-colors"
                              title={isAr ? 'إلغاء الفاتورة / استرجاع' : 'Void / Refund'}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
