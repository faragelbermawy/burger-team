export type CategoryId = 
  | 'burgers' 
  | 'sandwiches' 
  | 'sides' 
  | 'toast' 
  | 'drinks' 
  | 'desserts'
  | 'beef' 
  | 'chicken' 
  | 'combos';

export interface Topping {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
}

export interface BurgerItem {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: CategoryId;
  basePrice: number;
  image: string;
  calories?: number;
  inStock: boolean;
  stockCount: number;
  isPopular?: boolean;
  sizes?: {
    id: 'single' | 'double' | 'triple';
    nameAr: string;
    nameEn: string;
    extraPrice: number;
  }[];
  bunOptions?: {
    id: string;
    nameAr: string;
    nameEn: string;
  }[];
  removableIngredients?: {
    id: string;
    nameAr: string;
    nameEn: string;
  }[];
  availableToppings?: Topping[];
}

export type UserRole = 'manager' | 'cashier';

export interface UserAccount {
  role: UserRole;
  name: string;
}

export interface CartItem {
  cartId: string;
  itemId: string;
  code: string;
  nameAr: string;
  nameEn: string;
  unitPrice: number;
  originalUnitPrice?: number;
  customPriceEdited?: boolean;
  selectedSize?: {
    id: string;
    nameAr: string;
    nameEn: string;
    extraPrice: number;
  };
  selectedBun?: {
    id: string;
    nameAr: string;
    nameEn: string;
  };
  selectedToppings: Topping[];
  removedIngredients: { id: string; nameAr: string; nameEn: string }[];
  notes?: string;
  quantity: number;
  itemTotal: number;
}

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';
export type PaymentMethod = 'cash' | 'card' | 'online';
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  points: number;
  totalSpent: number;
  tier: LoyaltyTier;
  createdAt: string;
  notes?: string;
  orderCount?: number;
}

export interface LoyaltyReward {
  id: string;
  titleAr: string;
  titleEn: string;
  pointsRequired: number;
  discountAmount: number; // in currency units
  descriptionAr: string;
  descriptionEn: string;
}

export interface CustomerDetails {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  deliveryNotes?: string;
  currentPoints?: number;
  tier?: LoyaltyTier;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  dailyOrderNumber: number;
  createdAt: string; // ISO string
  orderType: OrderType;
  tableNumber?: string;
  customer?: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  loyaltyPointsEarned?: number;
  loyaltyPointsRedeemed?: number;
  loyaltyDiscountAmount?: number;
  taxPercent: number;
  taxAmount: number;
  deliveryFee: number;
  serviceCharge: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeDue: number;
  cashierName: string;
  status: OrderStatus;
  notes?: string;
  preparedAt?: string;
  completedAt?: string;
  qrPayload?: string;
}

export interface RestaurantSettings {
  nameAr: string;
  nameEn: string;
  branchAr: string;
  branchEn: string;
  addressAr: string;
  addressEn: string;
  phone: string;
  vatNumber: string;
  taxRatePercent: number;
  currency: 'EGP' | 'SAR' | 'AED' | 'USD';
  currencySymbolAr: string;
  currencySymbolEn: string;
  enableKitchenSound: boolean;
  defaultCashierName: string;
  receiptHeaderMsgAr: string;
  receiptHeaderMsgEn: string;
  receiptFooterMsgAr: string;
  receiptFooterMsgEn: string;
  wifiName?: string;
  wifiPassword?: string;
  managerWhatsAppPhone?: string;
}

export interface ShiftInfo {
  id: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  closingCashActual?: number;
  totalCashSales: number;
  totalCardSales: number;
  totalOnlineSales: number;
  totalSales: number;
  totalOrders: number;
  status: 'open' | 'closed';
}
