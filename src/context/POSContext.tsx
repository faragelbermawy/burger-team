import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BurgerItem,
  CartItem,
  Invoice,
  OrderType,
  PaymentMethod,
  OrderStatus,
  RestaurantSettings,
  ShiftInfo,
  CustomerDetails,
  CustomerProfile,
  LoyaltyReward,
  LoyaltyTier,
  UserRole,
} from '../types';
import {
  INITIAL_MENU_ITEMS,
  DEFAULT_SETTINGS,
  INITIAL_INVOICES,
  INITIAL_SHIFT,
  INITIAL_CUSTOMERS,
  LOYALTY_REWARDS,
} from '../data/initialData';

export type AppView = 'pos' | 'kitchen' | 'invoices' | 'reports' | 'menu' | 'customers' | 'settings';

interface POSContextType {
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  items: BurgerItem[];
  cart: CartItem[];
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  customer: CustomerDetails;
  setCustomer: React.Dispatch<React.SetStateAction<CustomerDetails>>;
  discountPercent: number;
  setDiscountPercent: (pct: number) => void;
  invoices: Invoice[];
  activeShift: ShiftInfo;
  settings: RestaurantSettings;
  updateSettings: (newSettings: RestaurantSettings) => void;
  
  // Customers & Loyalty
  customers: CustomerProfile[];
  selectedCustomer: CustomerProfile | null;
  selectCustomer: (cust: CustomerProfile | null) => void;
  addCustomer: (data: { name: string; phone: string; email?: string; address?: string; notes?: string }) => CustomerProfile;
  updateCustomer: (updated: CustomerProfile) => void;
  adjustCustomerPoints: (customerId: string, pointsDelta: number, reason?: string) => void;
  loyaltyRewards: LoyaltyReward[];
  activeLoyaltyReward: LoyaltyReward | null;
  applyLoyaltyReward: (reward: LoyaltyReward) => void;
  removeLoyaltyReward: () => void;
  loyaltyDiscountAmount: number;

  // User Roles & Authentication & Passwords
  isAuthenticated: boolean;
  currentUserRole: UserRole;
  currentUserName: string;
  managerPassword: string;
  cashierPassword: string;
  updatePasswords: (newManagerPass?: string, newCashierPass?: string) => { success: boolean; message: string };
  isPasswordManagerModalOpen: boolean;
  openPasswordManagerModal: () => void;
  closePasswordManagerModal: () => void;
  isAuthModalOpen: boolean;
  authModalTargetRole: UserRole | null;
  openAuthModal: (targetRole?: UserRole) => void;
  closeAuthModal: () => void;
  authenticateUser: (role: UserRole, passwordInput: string) => { success: boolean; error?: string };
  switchUserRole: (newRole: UserRole) => void;
  logoutRole: () => void;
  logout: () => void;

  // Cart operations
  addToCart: (item: BurgerItem, customOpts?: Partial<CartItem>) => void;
  updateCartQuantity: (cartId: string, delta: number) => void;
  updateCartItemPrice: (cartId: string, newUnitPrice: number) => void;
  removeFromCart: (cartId: string) => void;
  clearCart: () => void;
  
  // Calculations
  cartSubtotal: number;
  cartDiscountAmount: number;
  cartTaxAmount: number;
  cartDeliveryFee: number;
  deliveryFee: number;
  setDeliveryFee: (fee: number) => void;
  cartServiceCharge: number;
  cartGrandTotal: number;

  // Custom Burger Builder Modal
  isCustomBuilderOpen: boolean;
  openCustomBuilder: () => void;
  closeCustomBuilder: () => void;

  // Checkout & Modals
  isCustomizerOpen: boolean;
  itemToCustomize: BurgerItem | null;
  openCustomizer: (item: BurgerItem) => void;
  closeCustomizer: () => void;

  isCheckoutModalOpen: boolean;
  openCheckoutModal: () => void;
  closeCheckoutModal: () => void;

  selectedInvoiceForPrint: Invoice | null;
  isReceiptModalOpen: boolean;
  openReceiptModal: (inv: Invoice) => void;
  closeReceiptModal: () => void;

  // End of Shift & WhatsApp Export to Manager
  isShiftClosingModalOpen: boolean;
  openShiftClosingModal: () => void;
  closeShiftClosingModal: () => void;
  generateWhatsAppShiftText: (shift: ShiftInfo, invoicesList: Invoice[]) => string;
  sendShiftToWhatsApp: (shift: ShiftInfo, invoicesList: Invoice[], customPhone?: string) => void;

  // Opening Cash Balance Management
  isOpeningCashModalOpen: boolean;
  openOpeningCashModal: () => void;
  closeOpeningCashModal: () => void;
  updateOpeningCash: (amount: number) => void;

  // Actions
  processCheckout: (
    paymentMethod: PaymentMethod,
    amountPaid: number,
    orderNotes?: string
  ) => Invoice;
  updateOrderStatus: (invoiceId: string, newStatus: OrderStatus) => void;
  cancelInvoice: (invoiceId: string, reason?: string) => void;
  closeShift: (closingCashActual: number) => void;
  startNewShift: (cashierName: string, openingCash: number) => void;
  toggleStock: (itemId: string) => void;
  updateMenuItem: (updated: BurgerItem) => void;
  addMenuItem: (newItem: BurgerItem) => void;
  playAudioChime: () => void;
  liveSyncToast: string | null;
  dismissLiveSyncToast: () => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

// Web Audio API chime synthesizer for crisp order & kitchen bells
const playSoftBell = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (err) {
    console.warn('Audio feedback error', err);
  }
};

// Cross-tab broadcast channel for instant live menu sync in same browser
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('burger_pos_live_sync')
  : null;

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'ar' | 'en'>(() => {
    return (localStorage.getItem('burger_pos_lang') as 'ar' | 'en') || 'ar';
  });

  const [activeView, setActiveView] = useState<AppView>('pos');

  const [settings, setSettings] = useState<RestaurantSettings>(() => {
    const SETTINGS_VERSION = 'v4_no_wifi_compact_receipt';
    const currentVer = localStorage.getItem('burger_pos_settings_ver');
    if (currentVer !== SETTINGS_VERSION) {
      localStorage.setItem('burger_pos_settings_ver', SETTINGS_VERSION);
      const saved = localStorage.getItem('burger_pos_settings');
      let base = DEFAULT_SETTINGS;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          base = {
            ...DEFAULT_SETTINGS,
            ...parsed,
            taxRatePercent: 0,
            vatNumber: '',
            wifiName: '',
            wifiPassword: '',
            phone: '0568888102',
            managerWhatsAppPhone: '0568888102',
            receiptFooterMsgAr: 'شكراً لزيارتكم! هاتف الطلبات: 0568888102',
            receiptFooterMsgEn: 'Thank you for your visit! Orders: 0568888102',
          };
        } catch {
          base = DEFAULT_SETTINGS;
        }
      }
      localStorage.setItem('burger_pos_settings', JSON.stringify(base));
      return base;
    }

    const saved = localStorage.getItem('burger_pos_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          taxRatePercent: 0,
          wifiName: '',
          wifiPassword: '',
          managerWhatsAppPhone: '0568888102',
        };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [items, setItems] = useState<BurgerItem[]>(() => {
    const saved = localStorage.getItem('burger_pos_items');
    if (saved) {
      try {
        const parsed: BurgerItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge so initial items exist plus any user-added products
          const initialIds = new Set(INITIAL_MENU_ITEMS.map((i) => i.id));
          const userItems = parsed.filter((p: BurgerItem) => !initialIds.has(p.id));
          const initialMap = new Map(parsed.filter((p: BurgerItem) => initialIds.has(p.id)).map((p: BurgerItem) => [p.id, p]));
          const mergedInitials = INITIAL_MENU_ITEMS.map((init) => initialMap.get(init.id) || init);
          return [...userItems, ...mergedInitials];
        }
      } catch {
        return INITIAL_MENU_ITEMS;
      }
    }
    return INITIAL_MENU_ITEMS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('burger_pos_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [activeShift, setActiveShift] = useState<ShiftInfo>(() => {
    const saved = localStorage.getItem('burger_pos_shift');
    return saved ? JSON.parse(saved) : INITIAL_SHIFT;
  });

  const [customers, setCustomers] = useState<CustomerProfile[]>(() => {
    const saved = localStorage.getItem('burger_pos_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [activeLoyaltyReward, setActiveLoyaltyReward] = useState<LoyaltyReward | null>(null);

  // Current working order states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [tableNumber, setTableNumber] = useState<string>('1');
  const [customer, setCustomer] = useState<CustomerDetails>({
    name: '',
    phone: '',
    address: '',
    deliveryNotes: '',
  });
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [deliveryFee, setDeliveryFee] = useState<number>(10);

  // Modals
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [itemToCustomize, setItemToCustomize] = useState<BurgerItem | null>(null);
  const [isCustomBuilderOpen, setIsCustomBuilderOpen] = useState(false);

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);
  const [isOpeningCashModalOpen, setIsOpeningCashModalOpen] = useState(false);

  // User Roles & Passwords (defaults: manager: yamen, cashier: 12345)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('burger_pos_authenticated') === 'true';
  });
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    return (localStorage.getItem('burger_pos_user_role') as UserRole) || 'manager';
  });
  const [managerPassword, setManagerPassword] = useState<string>(() => {
    return localStorage.getItem('burger_pos_pass_manager') || 'yamen';
  });
  const [cashierPassword, setCashierPassword] = useState<string>(() => {
    return localStorage.getItem('burger_pos_pass_cashier') || '12345';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => {
    return sessionStorage.getItem('burger_pos_authenticated') !== 'true';
  });
  const [authModalTargetRole, setAuthModalTargetRole] = useState<UserRole | null>(null);
  const [isPasswordManagerModalOpen, setIsPasswordManagerModalOpen] = useState(false);

  // End of Shift Closing Modal
  const [isShiftClosingModalOpen, setIsShiftClosingModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('burger_pos_lang', language);
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
  }, [language]);

  useEffect(() => {
    localStorage.setItem('burger_pos_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('burger_pos_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('burger_pos_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('burger_pos_shift', JSON.stringify(activeShift));
  }, [activeShift]);

  useEffect(() => {
    localStorage.setItem('burger_pos_customers', JSON.stringify(customers));
  }, [customers]);

  const [liveSyncToast, setLiveSyncToast] = useState<string | null>(null);
  const dismissLiveSyncToast = () => setLiveSyncToast(null);

  useEffect(() => {
    if (liveSyncToast) {
      const timer = setTimeout(() => setLiveSyncToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [liveSyncToast]);

  // Live Multi-Device & Multi-Tab Synchronization
  useEffect(() => {
    // 1. Initial fetch from server
    fetch('/api/items')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
          localStorage.setItem('burger_pos_items', JSON.stringify(data.items));
        }
      })
      .catch(() => {});

    // 2. BroadcastChannel for instant 0ms cross-tab sync in same browser
    if (broadcastChannel) {
      broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'SYNC_ITEMS' && Array.isArray(event.data.items)) {
          setItems(event.data.items);
          localStorage.setItem('burger_pos_items', JSON.stringify(event.data.items));
          if (event.data.addedItem) {
            playSoftBell();
            setLiveSyncToast(`تمت إضافة منتج: ${event.data.addedItem.nameAr || event.data.addedItem.nameEn}`);
          }
        }
      };
    }

    // 3. Storage event listener (cross-window/tab fallback)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'burger_pos_items' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setItems(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // 4. Server-Sent Events (SSE) for instant cross-device live sync (Manager phone, Cashier screen, etc.)
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if ((data.type === 'ITEM_ADDED' || data.type === 'ITEM_UPDATED' || data.type === 'SYNC_ITEMS') && Array.isArray(data.items)) {
            setItems(data.items);
            localStorage.setItem('burger_pos_items', JSON.stringify(data.items));
            if (data.item && data.type === 'ITEM_ADDED') {
              playSoftBell();
              setLiveSyncToast(`تمت إضافة منتج جديد: ${data.item.nameAr || data.item.nameEn}`);
            }
          }
        } catch {}
      };
    } catch (err) {
      console.warn('SSE connection warning:', err);
    }

    // 5. Periodic background check every 10s as safety net
    const interval = setInterval(() => {
      fetch('/api/items')
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && Array.isArray(data.items) && data.items.length > 0) {
            setItems((prev) => {
              if (prev.length !== data.items.length || JSON.stringify(prev) !== JSON.stringify(data.items)) {
                localStorage.setItem('burger_pos_items', JSON.stringify(data.items));
                return data.items;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    }, 10000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, []);

  const playAudioChime = () => {
    if (settings.enableKitchenSound) {
      playSoftBell();
    }
  };

  const selectCustomer = (cust: CustomerProfile | null) => {
    setSelectedCustomer(cust);
    if (cust) {
      setCustomer((prev) => ({
        ...prev,
        id: cust.id,
        name: cust.name,
        phone: cust.phone,
        email: cust.email,
        address: cust.address || prev.address,
        currentPoints: cust.points,
        tier: cust.tier,
      }));
    } else {
      setActiveLoyaltyReward(null);
    }
  };

  const addCustomer = (data: { name: string; phone: string; email?: string; address?: string; notes?: string }) => {
    const newCust: CustomerProfile = {
      id: `cust-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      notes: data.notes,
      points: 50, // Welcome gift points!
      totalSpent: 0,
      tier: 'bronze',
      createdAt: new Date().toISOString(),
      orderCount: 0,
    };
    setCustomers((prev) => [newCust, ...prev]);
    selectCustomer(newCust);
    playAudioChime();
    return newCust;
  };

  const updateCustomer = (updated: CustomerProfile) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    if (selectedCustomer?.id === updated.id) {
      setSelectedCustomer(updated);
    }
  };

  const adjustCustomerPoints = (customerId: string, pointsDelta: number, reason?: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const newPts = Math.max(0, c.points + pointsDelta);
          const newTier: LoyaltyTier = newPts >= 1500 ? 'platinum' : newPts >= 800 ? 'gold' : newPts >= 300 ? 'silver' : 'bronze';
          return {
            ...c,
            points: newPts,
            tier: newTier,
            notes: (c.notes ? c.notes + ' · ' : '') + `[تعديل نقاط: ${pointsDelta > 0 ? `+${pointsDelta}` : pointsDelta} (${reason || 'يدوي'})]`,
          };
        }
        return c;
      })
    );
  };

  const applyLoyaltyReward = (reward: LoyaltyReward) => {
    if (!selectedCustomer) return;
    if (selectedCustomer.points < reward.pointsRequired) return;
    setActiveLoyaltyReward(reward);
    playAudioChime();
  };

  const removeLoyaltyReward = () => {
    setActiveLoyaltyReward(null);
  };

  const openCustomizer = (item: BurgerItem) => {
    setItemToCustomize(item);
    setIsCustomizerOpen(true);
  };

  const closeCustomizer = () => {
    setIsCustomizerOpen(false);
    setItemToCustomize(null);
  };

  const openCustomBuilder = () => {
    setIsCustomBuilderOpen(true);
  };

  const closeCustomBuilder = () => {
    setIsCustomBuilderOpen(false);
  };

  const openCheckoutModal = () => {
    if (cart.length === 0) return;
    setIsCheckoutModalOpen(true);
  };

  const closeCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
  };

  const openReceiptModal = (inv: Invoice) => {
    setSelectedInvoiceForPrint(inv);
    setIsReceiptModalOpen(true);
  };

  const closeReceiptModal = () => {
    setIsReceiptModalOpen(false);
    setSelectedInvoiceForPrint(null);
  };

  const addToCart = (item: BurgerItem, customOpts?: Partial<CartItem>) => {
    playAudioChime();
    setCart((prev) => {
      // If no custom options, see if identical standard item exists
      const isSimpleAdd = !customOpts || (
        (!customOpts.selectedToppings || customOpts.selectedToppings.length === 0) &&
        (!customOpts.removedIngredients || customOpts.removedIngredients.length === 0) &&
        !customOpts.notes &&
        (!customOpts.selectedSize || customOpts.selectedSize.id === (item.sizes ? 'double' : undefined))
      );

      if (isSimpleAdd) {
        const existingIdx = prev.findIndex(
          (ci) => ci.itemId === item.id && (!ci.selectedToppings || ci.selectedToppings.length === 0) && (!ci.notes)
        );
        if (existingIdx >= 0) {
          const updated = [...prev];
          const curr = updated[existingIdx];
          const newQty = curr.quantity + 1;
          updated[existingIdx] = {
            ...curr,
            quantity: newQty,
            itemTotal: curr.unitPrice * newQty,
          };
          return updated;
        }
      }

      // Calculate unit price based on size and extra toppings
      let calculatedUnitPrice = item.basePrice;
      if (customOpts?.selectedSize) {
        calculatedUnitPrice += customOpts.selectedSize.extraPrice;
      }
      if (customOpts?.selectedToppings) {
        const toppingsExtra = customOpts.selectedToppings.reduce((acc, t) => acc + t.price, 0);
        calculatedUnitPrice += toppingsExtra;
      }

      const quantity = customOpts?.quantity || 1;
      const newCartItem: CartItem = {
        cartId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        itemId: item.id,
        code: item.code,
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        unitPrice: calculatedUnitPrice,
        selectedSize: customOpts?.selectedSize,
        selectedBun: customOpts?.selectedBun,
        selectedToppings: customOpts?.selectedToppings || [],
        removedIngredients: customOpts?.removedIngredients || [],
        notes: customOpts?.notes || '',
        quantity,
        itemTotal: calculatedUnitPrice * quantity,
      };

      return [...prev, newCartItem];
    });
  };

  const updateCartQuantity = (cartId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((ci) => {
          if (ci.cartId === cartId) {
            const nextQty = ci.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...ci,
              quantity: nextQty,
              itemTotal: ci.unitPrice * nextQty,
            };
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const updateCartItemPrice = (cartId: string, newUnitPrice: number) => {
    setCart((prev) =>
      prev.map((ci) => {
        if (ci.cartId === cartId) {
          const validPrice = Math.max(0, Number(newUnitPrice) || 0);
          return {
            ...ci,
            originalUnitPrice: ci.originalUnitPrice ?? ci.unitPrice,
            unitPrice: validPrice,
            customPriceEdited: true,
            itemTotal: validPrice * ci.quantity,
          };
        }
        return ci;
      })
    );
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((ci) => ci.cartId !== cartId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setDeliveryFee(10);
    setActiveLoyaltyReward(null);
    setSelectedCustomer(null);
    setCustomer({ name: '', phone: '', address: '', deliveryNotes: '' });
  };

  // Calculations
  const cartSubtotal = cart.reduce((acc, ci) => acc + ci.itemTotal, 0);
  const cartDiscountAmount = Number(((cartSubtotal * discountPercent) / 100).toFixed(2));
  const loyaltyDiscountAmount = activeLoyaltyReward ? activeLoyaltyReward.discountAmount : 0;
  const afterDiscount = Math.max(0, cartSubtotal - cartDiscountAmount - loyaltyDiscountAmount);
  const cartTaxAmount = Number(((afterDiscount * settings.taxRatePercent) / 100).toFixed(2));
  const cartDeliveryFee = orderType === 'delivery' ? deliveryFee : 0;
  const cartServiceCharge = 0;
  const cartGrandTotal = Number((afterDiscount + cartTaxAmount + cartDeliveryFee + cartServiceCharge).toFixed(2));

  const processCheckout = (
    paymentMethod: PaymentMethod,
    amountPaid: number,
    orderNotes?: string
  ): Invoice => {
    const nextDailyNum = (invoices.length > 0 ? Math.max(...invoices.map((i) => i.dailyOrderNumber)) : 0) + 1;
    const invId = `INV-${new Date().getFullYear()}-${1000 + nextDailyNum}`;
    const nowIso = new Date().toISOString();

    const changeDue = Math.max(0, Number((amountPaid - cartGrandTotal).toFixed(2)));

    // Points earned: 1 point per 10 currency spent
    const pointsEarned = Math.floor(cartGrandTotal / 10);
    const pointsRedeemed = activeLoyaltyReward ? activeLoyaltyReward.pointsRequired : 0;

    // Generate ZATCA / Tax formatted payload
    const qrPayload = JSON.stringify({
      seller: settings.nameAr,
      vat: settings.vatNumber,
      time: nowIso,
      total: cartGrandTotal,
      tax: cartTaxAmount,
    });

    const newInvoice: Invoice = {
      id: invId,
      invoiceNumber: invId,
      dailyOrderNumber: nextDailyNum,
      createdAt: nowIso,
      orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      customer: selectedCustomer
        ? {
            id: selectedCustomer.id,
            name: selectedCustomer.name,
            phone: selectedCustomer.phone,
            email: selectedCustomer.email,
            address: selectedCustomer.address || customer.address,
            tier: selectedCustomer.tier,
            currentPoints: selectedCustomer.points - pointsRedeemed + pointsEarned,
          }
        : {
            id: customer.id || `cust-${Date.now()}`,
            name: customer.name?.trim() || (language === 'ar' ? 'عميل نقدي' : 'Walk-in Customer'),
            phone: customer.phone || '',
            address: customer.address || '',
            tier: 'bronze',
            currentPoints: 0,
          },
      items: [...cart],
      subtotal: cartSubtotal,
      discountPercent,
      discountAmount: cartDiscountAmount,
      loyaltyPointsEarned: pointsEarned,
      loyaltyPointsRedeemed: pointsRedeemed,
      loyaltyDiscountAmount,
      taxPercent: settings.taxRatePercent,
      taxAmount: cartTaxAmount,
      deliveryFee: cartDeliveryFee,
      serviceCharge: cartServiceCharge,
      grandTotal: cartGrandTotal,
      paymentMethod,
      amountPaid: Math.max(amountPaid, cartGrandTotal),
      changeDue,
      cashierName: settings.defaultCashierName,
      status: 'preparing',
      notes: orderNotes,
      qrPayload,
    };

    // Update customer loyalty profile if linked
    if (selectedCustomer) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === selectedCustomer.id) {
            const nextPoints = Math.max(0, c.points - pointsRedeemed + pointsEarned);
            const nextSpent = Number((c.totalSpent + cartGrandTotal).toFixed(2));
            const nextTier: LoyaltyTier = nextSpent >= 3000 ? 'platinum' : nextSpent >= 1500 ? 'gold' : nextSpent >= 600 ? 'silver' : 'bronze';
            return {
              ...c,
              points: nextPoints,
              totalSpent: nextSpent,
              tier: nextTier,
              orderCount: (c.orderCount || 0) + 1,
            };
          }
          return c;
        })
      );
    }

    // Update invoices list
    setInvoices((prev) => [newInvoice, ...prev]);

    // Update active shift sales numbers
    setActiveShift((prev) => {
      const isCash = paymentMethod === 'cash';
      const isCard = paymentMethod === 'card';
      const isOnline = paymentMethod === 'online';

      return {
        ...prev,
        totalSales: Number((prev.totalSales + cartGrandTotal).toFixed(2)),
        totalOrders: prev.totalOrders + 1,
        totalCashSales: isCash ? Number((prev.totalCashSales + cartGrandTotal).toFixed(2)) : prev.totalCashSales,
        totalCardSales: isCard ? Number((prev.totalCardSales + cartGrandTotal).toFixed(2)) : prev.totalCardSales,
        totalOnlineSales: isOnline ? Number((prev.totalOnlineSales + cartGrandTotal).toFixed(2)) : prev.totalOnlineSales,
      };
    });

    // Deduct stock
    setItems((prev) =>
      prev.map((item) => {
        const foundInCart = cart.find((ci) => ci.itemId === item.id);
        if (foundInCart) {
          const newStock = Math.max(0, item.stockCount - foundInCart.quantity);
          return {
            ...item,
            stockCount: newStock,
            inStock: newStock > 0,
          };
        }
        return item;
      })
    );

    // Play feedback chime
    playAudioChime();

    // Clear cart & selections
    clearCart();
    closeCheckoutModal();

    // Open receipt modal for printing
    openReceiptModal(newInvoice);

    return newInvoice;
  };

  const updateOrderStatus = (invoiceId: string, newStatus: OrderStatus) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            status: newStatus,
            preparedAt: newStatus === 'ready' ? new Date().toISOString() : inv.preparedAt,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : inv.completedAt,
          };
        }
        return inv;
      })
    );
    playAudioChime();
  };

  const cancelInvoice = (invoiceId: string, reason?: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            status: 'cancelled',
            notes: (inv.notes ? inv.notes + ' - ' : '') + `[ملغاة: ${reason || 'بطلب الكاشير'}]`,
          };
        }
        return inv;
      })
    );
  };

  const closeShift = (closingCashActual: number) => {
    setActiveShift((prev) => ({
      ...prev,
      closingCashActual,
      closedAt: new Date().toISOString(),
      status: 'closed',
    }));
  };

  const startNewShift = (cashierName: string, openingCash: number) => {
    const newShift: ShiftInfo = {
      id: `SHIFT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      cashierName,
      openedAt: new Date().toISOString(),
      openingCash,
      totalCashSales: 0,
      totalCardSales: 0,
      totalOnlineSales: 0,
      totalSales: 0,
      totalOrders: 0,
      status: 'open',
    };
    setActiveShift(newShift);
  };

  const toggleStock = (itemId: string) => {
    setItems((prev) => {
      const next = prev.map((item) => (item.id === itemId ? { ...item, inStock: !item.inStock } : item));
      localStorage.setItem('burger_pos_items', JSON.stringify(next));
      broadcastChannel?.postMessage({ type: 'SYNC_ITEMS', items: next });
      return next;
    });
    fetch(`/api/items/${itemId}/toggle-stock`, { method: 'POST' }).catch(() => {});
  };

  const updateMenuItem = (updated: BurgerItem) => {
    setItems((prev) => {
      const next = prev.map((item) => (item.id === updated.id ? updated : item));
      localStorage.setItem('burger_pos_items', JSON.stringify(next));
      broadcastChannel?.postMessage({ type: 'SYNC_ITEMS', items: next, updatedItem: updated });
      return next;
    });
    fetch(`/api/items/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(() => {});
  };

  const addMenuItem = (newItem: BurgerItem) => {
    setItems((prev) => {
      const next = [newItem, ...prev.filter((i) => i.id !== newItem.id)];
      localStorage.setItem('burger_pos_items', JSON.stringify(next));
      broadcastChannel?.postMessage({ type: 'SYNC_ITEMS', items: next, addedItem: newItem });
      return next;
    });
    fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    }).catch(() => {});
  };

  const updateSettings = (newSettings: RestaurantSettings) => {
    setSettings(newSettings);
  };

  const currentUserName = currentUserRole === 'manager' ? 'المدير' : 'كاشير برجر تيم';

  const openAuthModal = (targetRole?: UserRole) => {
    setAuthModalTargetRole(targetRole || null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    if (!isAuthenticated) return;
    setIsAuthModalOpen(false);
    setAuthModalTargetRole(null);
  };

  const authenticateUser = (role: UserRole, passwordInput: string): { success: boolean; error?: string } => {
    const cleanPass = passwordInput.trim();
    if (role === 'manager') {
      if (cleanPass === managerPassword) {
        setCurrentUserRole('manager');
        localStorage.setItem('burger_pos_user_role', 'manager');
        setIsAuthenticated(true);
        sessionStorage.setItem('burger_pos_authenticated', 'true');
        setIsAuthModalOpen(false);
        setAuthModalTargetRole(null);
        playAudioChime();
        return { success: true };
      } else {
        return { success: false, error: 'كلمة المرور غير صحيحة' };
      }
    } else {
      if (cleanPass === cashierPassword) {
        setCurrentUserRole('cashier');
        localStorage.setItem('burger_pos_user_role', 'cashier');
        setIsAuthenticated(true);
        sessionStorage.setItem('burger_pos_authenticated', 'true');
        setIsAuthModalOpen(false);
        setAuthModalTargetRole(null);
        if (activeView === 'reports' || activeView === 'settings') {
          setActiveView('pos');
        }
        playAudioChime();
        return { success: true };
      } else {
        return { success: false, error: 'كلمة المرور غير صحيحة' };
      }
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('burger_pos_authenticated');
    setIsAuthModalOpen(true);
    setAuthModalTargetRole('manager');
    playAudioChime();
  };

  const openPasswordManagerModal = () => {
    setIsPasswordManagerModalOpen(true);
  };

  const closePasswordManagerModal = () => {
    setIsPasswordManagerModalOpen(false);
  };

  const updatePasswords = (newManagerPass?: string, newCashierPass?: string): { success: boolean; message: string } => {
    if (newManagerPass && newManagerPass.trim().length >= 3) {
      const cleanMgr = newManagerPass.trim();
      setManagerPassword(cleanMgr);
      localStorage.setItem('burger_pos_pass_manager', cleanMgr);
    }
    if (newCashierPass && newCashierPass.trim().length >= 3) {
      const cleanCash = newCashierPass.trim();
      setCashierPassword(cleanCash);
      localStorage.setItem('burger_pos_pass_cashier', cleanCash);
    }
    playAudioChime();
    return { success: true, message: 'تم تحديث كلمات المرور بنجاح وحفظها' };
  };

  const switchUserRole = (newRole: UserRole) => {
    openAuthModal(newRole);
  };

  const logoutRole = () => {
    setCurrentUserRole('cashier');
    localStorage.setItem('burger_pos_user_role', 'cashier');
    if (activeView === 'reports' || activeView === 'settings') {
      setActiveView('pos');
    }
  };

  const openShiftClosingModal = () => {
    setIsShiftClosingModalOpen(true);
  };

  const closeShiftClosingModal = () => {
    setIsShiftClosingModalOpen(false);
  };

  const openOpeningCashModal = () => {
    setIsOpeningCashModalOpen(true);
  };

  const closeOpeningCashModal = () => {
    setIsOpeningCashModalOpen(false);
  };

  const updateOpeningCash = (amount: number) => {
    const valid = Math.max(0, Number(amount) || 0);
    setActiveShift((prev) => ({
      ...prev,
      openingCash: valid,
    }));
  };

  const generateWhatsAppShiftText = (shift: ShiftInfo, shiftInvoices: Invoice[]): string => {
    const now = new Date();
    const openDate = new Date(shift.openedAt);
    const dateFormatted = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    const openTimeFormatted = openDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const closeTimeFormatted = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const totalOrders = shiftInvoices.length;
    const totalSales = shiftInvoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
    const cashSales = shiftInvoices
      .filter((inv) => inv.paymentMethod === 'cash')
      .reduce((acc, inv) => acc + inv.grandTotal, 0);
    const cardSales = shiftInvoices
      .filter((inv) => inv.paymentMethod === 'card')
      .reduce((acc, inv) => acc + inv.grandTotal, 0);
    const onlineSales = shiftInvoices
      .filter((inv) => inv.paymentMethod === 'online')
      .reduce((acc, inv) => acc + inv.grandTotal, 0);

    const actualCash = shift.closingCashActual ?? (shift.openingCash + cashSales);
    const expectedCash = shift.openingCash + cashSales;
    const cashDiff = actualCash - expectedCash;

    let text = `🍔 *تقرير إغلاق شفت - مطعم برجر تيم* 🍔\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📅 *التاريخ:* ${dateFormatted}\n`;
    text += `⏰ *الفترة:* من ${openTimeFormatted} إلى ${closeTimeFormatted}\n`;
    text += `👤 *الكاشير المسؤول:* ${shift.cashierName}\n`;
    text += `🆔 *رقم الشفت:* ${shift.id}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📊 *ملخص الإيرادات والمبيعات:* (${settings.currencySymbolAr})\n`;
    text += `• عدد الفواتير: ${totalOrders} طلب\n`;
    text += `• إجمالي المبيعات: *${totalSales.toFixed(2)} ${settings.currencySymbolAr}*\n`;
    text += `• مبيعات كاش (نقدي): ${cashSales.toFixed(2)} ${settings.currencySymbolAr}\n`;
    text += `• مبيعات شبكة (مدى/بطاقة): ${cardSales.toFixed(2)} ${settings.currencySymbolAr}\n`;
    if (onlineSales > 0) {
      text += `• مبيعات أونلاين: ${onlineSales.toFixed(2)} ${settings.currencySymbolAr}\n`;
    }
    text += `\n💰 *حركة درج النقدية (الكاش):*\n`;
    text += `• العهدة الافتتاحية: ${shift.openingCash.toFixed(2)} ${settings.currencySymbolAr}\n`;
    text += `• الكاش الفعلي عند التقفيل: ${actualCash.toFixed(2)} ${settings.currencySymbolAr}\n`;
    text += `• الفارق: ${cashDiff === 0 ? 'مطابق تماماً (0)' : cashDiff > 0 ? `+${cashDiff.toFixed(2)} زيادة` : `${cashDiff.toFixed(2)} عجز`}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🧾 *بيان فواتير الشفت (${shiftInvoices.length} فاتورة):*\n`;

    if (shiftInvoices.length === 0) {
      text += `لا توجد فواتير مسجلة في هذا الشفت.\n`;
    } else {
      shiftInvoices.forEach((inv, index) => {
        const orderTypeLabel = inv.orderType === 'dine-in' ? `صالة (طاولة ${inv.tableNumber || '-'})` : inv.orderType === 'takeaway' ? 'سفري' : 'توصيل';
        const methodLabel = inv.paymentMethod === 'cash' ? 'كاش' : inv.paymentMethod === 'card' ? 'شبكة' : 'أونلاين';
        const customerLabel = inv.customer?.name ? ` | ${inv.customer.name}` : '';
        text += `${index + 1}. *#${inv.dailyOrderNumber}* (${inv.invoiceNumber}) | ${orderTypeLabel} | *${inv.grandTotal.toFixed(2)} ${settings.currencySymbolAr}* [${methodLabel}]${customerLabel}\n`;
      });
    }

    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📌 *ملاحظة:* تم تصدير هذا التقرير تلقائياً ومباشرة من نظام كاشير برجر تيم إلى واتساب المدير.\n`;
    return text;
  };

  const sendShiftToWhatsApp = (shift: ShiftInfo, shiftInvoices: Invoice[], customPhone?: string) => {
    const rawPhone = (customPhone || settings.managerWhatsAppPhone || settings.phone || '0568888102').replace(/[^0-9]/g, '');
    let intlPhone = rawPhone;
    if (rawPhone.startsWith('05')) {
      intlPhone = '966' + rawPhone.slice(1);
    } else if (rawPhone.startsWith('5') && rawPhone.length === 9) {
      intlPhone = '966' + rawPhone;
    }
    const message = generateWhatsAppShiftText(shift, shiftInvoices);
    const waUrl = `https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <POSContext.Provider
      value={{
        language,
        setLanguage,
        activeView,
        setActiveView,
        items,
        cart,
        orderType,
        setOrderType,
        tableNumber,
        setTableNumber,
        customer,
        setCustomer,
        discountPercent,
        setDiscountPercent,
        invoices,
        activeShift,
        settings,
        updateSettings,
        customers,
        selectedCustomer,
        selectCustomer,
        addCustomer,
        updateCustomer,
        adjustCustomerPoints,
        loyaltyRewards: LOYALTY_REWARDS,
        activeLoyaltyReward,
        applyLoyaltyReward,
        removeLoyaltyReward,
        loyaltyDiscountAmount,
        isAuthenticated,
        currentUserRole,
        currentUserName,
        managerPassword,
        cashierPassword,
        updatePasswords,
        isPasswordManagerModalOpen,
        openPasswordManagerModal,
        closePasswordManagerModal,
        isAuthModalOpen,
        authModalTargetRole,
        openAuthModal,
        closeAuthModal,
        authenticateUser,
        switchUserRole,
        logoutRole,
        logout,
        addToCart,
        updateCartQuantity,
        updateCartItemPrice,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartDiscountAmount,
        cartTaxAmount,
        cartDeliveryFee,
        deliveryFee,
        setDeliveryFee,
        cartServiceCharge,
        cartGrandTotal,
        isCustomizerOpen,
        itemToCustomize,
        openCustomizer,
        closeCustomizer,
        isCustomBuilderOpen,
        openCustomBuilder,
        closeCustomBuilder,
        isCheckoutModalOpen,
        openCheckoutModal,
        closeCheckoutModal,
        selectedInvoiceForPrint,
        isReceiptModalOpen,
        openReceiptModal,
        closeReceiptModal,
        isShiftClosingModalOpen,
        openShiftClosingModal,
        closeShiftClosingModal,
        isOpeningCashModalOpen,
        openOpeningCashModal,
        closeOpeningCashModal,
        updateOpeningCash,
        generateWhatsAppShiftText,
        sendShiftToWhatsApp,
        processCheckout,
        updateOrderStatus,
        cancelInvoice,
        closeShift,
        startNewShift,
        toggleStock,
        updateMenuItem,
        addMenuItem,
        playAudioChime,
        liveSyncToast,
        dismissLiveSyncToast,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const ctx = useContext(POSContext);
  if (!ctx) throw new Error('usePOS must be used within a POSProvider');
  return ctx;
};
