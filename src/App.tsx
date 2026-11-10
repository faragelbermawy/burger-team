import React from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Navbar } from './components/Navbar';
import { POSScreen } from './components/POSScreen';
import { KitchenScreen } from './components/KitchenScreen';
import { InvoicesListScreen } from './components/InvoicesListScreen';
import { ReportsScreen } from './components/ReportsScreen';
import { MenuManagerScreen } from './components/MenuManagerScreen';
import { CustomersScreen } from './components/CustomersScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { ItemCustomizerModal } from './components/ItemCustomizerModal';
import { DynamicBurgerBuilderModal } from './components/DynamicBurgerBuilderModal';
import { CheckoutModal } from './components/CheckoutModal';
import { ReceiptModal } from './components/ReceiptModal';
import { AuthModal } from './components/AuthModal';
import { ShiftClosingModal } from './components/ShiftClosingModal';
import { PasswordManagerModal } from './components/PasswordManagerModal';
import { OpeningCashModal } from './components/OpeningCashModal';

const MainLayout: React.FC = () => {
  const { activeView, isAuthenticated, liveSyncToast, dismissLiveSyncToast } = usePOS();

  return (
    <div className="min-h-screen flex flex-col bg-stone-950 text-stone-100 font-sans relative">
      <div className={`flex flex-col flex-1 transition-all duration-300 ${!isAuthenticated ? 'filter blur-sm pointer-events-none select-none opacity-40' : ''}`}>
        <Navbar />

        <main className="flex-1 flex flex-col overflow-hidden">
          {activeView === 'pos' && <POSScreen />}
          {activeView === 'kitchen' && <KitchenScreen />}
          {activeView === 'invoices' && <InvoicesListScreen />}
          {activeView === 'customers' && <CustomersScreen />}
          {activeView === 'reports' && <ReportsScreen />}
          {activeView === 'menu' && <MenuManagerScreen />}
          {activeView === 'settings' && <SettingsScreen />}
        </main>
      </div>

      {/* Live Sync Real-time Notification Banner */}
      {liveSyncToast && (
        <div className="fixed bottom-5 start-5 z-50 flex items-center gap-3 px-4 py-3 bg-stone-900/95 border border-emerald-500/60 text-white rounded-xl shadow-2xl backdrop-blur-md animate-fadeIn">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-emerald-400 block">⚡ تزامن فوري ومباشر (Live Sync)</span>
            <span className="text-stone-200">{liveSyncToast}</span>
          </div>
          <button
            onClick={dismissLiveSyncToast}
            className="text-stone-400 hover:text-white ms-2 text-xs p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Global Modals */}
      <ItemCustomizerModal />
      <DynamicBurgerBuilderModal />
      <CheckoutModal />
      <ReceiptModal />
      <AuthModal />
      <ShiftClosingModal />
      <PasswordManagerModal />
      <OpeningCashModal />
    </div>
  );
};

export default function App() {
  return (
    <POSProvider>
      <MainLayout />
    </POSProvider>
  );
}
