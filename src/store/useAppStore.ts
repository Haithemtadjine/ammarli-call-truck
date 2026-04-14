import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
interface User {
    name: string;
    phone: string;
    rating: number;
}

interface Location {
    lat: number;
    lng: number;
}

interface Driver {
    name: string;
    phone: string;
    truck: string;
    rating: number;
    location: Location;
}

export interface Notification {
    id: string;
    title: string;
    description: string;
    time: string;
    type: 'order' | 'promo' | 'driver' | 'schedule';
    isRead: boolean;
}

export interface Order {
    id: number;
    type: string;
    status: string;
    quantity?: string;
    price?: number;
    waterType?: string;
    locationName?: string;
    orderTime?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    bottledWaterItems?: {
        smallPacks: number;
        mediumPacks: number;
        largePacks: number;
        brand: string;
    };
    bottledWaterCart?: Record<string, { small: number, medium: number, large: number }>;
    // Human-readable order summary e.g. "Brand: Ifri | 2x 0.5L Pack, 1x 5L Jug"
    orderSummary?: string;
    driver?: Driver; // Assigned driver for this order
    schedulingInfo?: { date: string; time: string; }; // for scheduled orders
}

interface RegisteredDriver {
    name: string;        // display name (maps to fullName)
    phone: string;
    password?: string;
    truckPlate: string;
    // Category
    driverType: 'Tanker' | 'Bottled';
    // Tanker-specific
    waterType?: string;  // 'spring' | 'well' | 'construction'
    capacity?: number;
    // Bottled-specific
    brands?: string[];
    // Common
    location?: Location;
}

// Order the driver has accepted (driver-side view)
export interface DriverOrder {
    orderId: string;
    customer: { name: string; phone: string; avatarUrl?: string };
    deliveryAddress: { label: string; distance: string; lat: number; lng: number };
    driverLat: number;
    driverLng: number;
    items: Array<{ icon: string; description: string; detail: string; price: number }>;
    subtotal: number;
    deliveryFee: number;
    total: number;
    status: 'accepted' | 'driving' | 'arrived' | 'completed';
    createdAt: string;
}

// ─── Driver Financial Types ──────────────────────────────────────────────────
export interface DriverTransaction {
    id: string;
    customerName: string;
    date: string;   // e.g. "Oct 24, 2023 · 14:30"
    amount: number; // in DA
}

export interface PastTrip {
    id: string;
    date: string;        // e.g. 'OCT 24, 2023'
    time: string;        // e.g. '10:30 AM'
    orderSummary: string; // e.g. '3000L Spring Water'
    customerName: string;
    deliveryType: string;  // e.g. 'Standard Delivery'
    amount: number;        // in DA
    status: 'Completed' | 'Cancelled';
    cancelReason?: string; // reason for cancellation (if Cancelled)
}

export interface WeeklyStatDay {
    day: string;    // 'MON' | 'TUE' | ...
    amount: number;
}

// Day index helper: 0=SUN,1=MON,...,6=SAT  →  map to our array index 0=MON..6=SUN
const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function buildInitialWeeklyStats(): WeeklyStatDay[] {
    return DAY_LABELS.map((day) => ({ day, amount: 0 }));
}

// Get today's index in our MON-SUN array (JS getDay(): 0=Sun,1=Mon,...6=Sat)
function todayIndexInWeek(): number {
    const jsDay = new Date().getDay(); // 0=Sun..6=Sat
    // Convert: Sun→6, Mon→0, Tue→1, ... Sat→5
    return jsDay === 0 ? 6 : jsDay - 1;
}

interface AppState {
    user: User; // Legacy
    userProfile: { name: string; phone?: string } | null;
    setUserProfile: (profile: { name: string; phone?: string }) => void;
    updateUserName: (newName: string) => void;

    activeOrder: Order | null;
    pastOrders: Order[];
    cancelOrder: () => void;
    updateOrder: (order: Order) => void;
    createOrder: (order: Order) => void;
    completeOrder: () => void;

    driver: Driver | null;
    setDriver: (driver: Driver | null) => void;

    // ── User Roles ──────────────────────────────────────────────────────────
    userRole: 'CUSTOMER' | 'DRIVER_BOTTLED' | 'DRIVER_TANKER' | null;
    setUserRole: (role: 'CUSTOMER' | 'DRIVER_BOTTLED' | 'DRIVER_TANKER' | null) => void;

    // Driver Accounts Database Simulation
    driverAccounts: Record<string, RegisteredDriver & { 
        earnings: number, 
        completedTrips: number, 
        pastTrips: PastTrip[], 
        walletBalance: number, 
        transactions: DriverTransaction[], 
        weeklyStats: WeeklyStatDay[] 
    }>;
    
    // Driver Onboarding & Profile
    registeredDriver: RegisteredDriver | null;
    registerDriver: (driver: RegisteredDriver) => void;
    loginDriver: (phone: string, password: string) => boolean;
    logout: () => void; // Comprehensive logout
    updateDriverLocation: (location: Location) => void;
    updateDriverProfile: (name: string, phone: string) => void;

    driverStatus: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
    setDriverStatus: (status: 'AVAILABLE' | 'BUSY' | 'OFFLINE') => void;

    // Driver Active Order
    activeDriverOrder: DriverOrder | null;
    acceptDriverOrder: (order: DriverOrder) => void;
    completeDriverOrder: () => void;
    cancelDriverOrder: (reason: string) => void;
    updateDriverOrderStatus: (status: DriverOrder['status']) => void;

    // ── Driver Financial State ──────────────────────────────────────────────
    totalEarnings: number;
    walletBalance: number;
    completedTrips: number;
    driverRating: number;
    appCommission: number;
    transactions: DriverTransaction[];
    weeklyStats: WeeklyStatDay[];
    pastTrips: PastTrip[];

    // ── Inventory Logic ─────────────────────────────────────────────────────
    inventory: {
        tanker: { remaining: number; total: number; waterType: string };
        bottled: {
            stock: Record<string, { '0.5L': number; '1.5L': number; '5L': number }>;
        };
    };
    refillStock: (type: 'tanker' | 'bottled', amount: any) => void;

    appSettings: {
        pushNotifications: boolean;
        locationServices: boolean;
        soundVibration: boolean;
        darkMode: boolean;
        language: string;
    };
    updateAppSetting: (key: keyof AppState['appSettings'], value: any) => void;

    // Global App Language State
    language: 'en' | 'ar';
    setLanguage: (lang: 'en' | 'ar') => void;

    pendingRating: boolean;
    setPendingRating: (status: boolean) => void;

    showRatingModal: boolean;
    setShowRatingModal: (val: boolean) => void;

    // ── Draft Order State (Persistence) ──────────────────────────────────
    draftOrder: {
        bottledWaterCart: Record<string, { small: number, medium: number, large: number }>;
        tankerDetails: {
            quantity: number;
            hoseLength: string;
            tankLocation: string;
            floorNumber: number;
        };
        location?: {
            latitude: number;
            longitude: number;
            address?: string;
        };
    };
    updateDraftOrder: (draft: Partial<AppState['draftOrder']>) => void;
    clearDraftOrder: () => void;

    // ── Favorites & Drafts ──────────────────────────────────────────────
    favorites: Order[];
    savedDrafts: Order[];
    addToFavorites: (order: Order) => void;
    saveToDrafts: (order: Order) => void;
    scheduleOrder: (order: Order, date: string, time: string) => void;

    // ── Notifications ───────────────────────────────────────────────────────
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'time' | 'isRead'>) => void;
    markAllNotificationsAsRead: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
            user: { name: 'Ahmed', phone: '0555...', rating: 4.8 },
            userProfile: null,
            setUserProfile: (profile) => set({ userProfile: profile }),
            updateUserName: (newName) => set((state) => ({
                userProfile: state.userProfile ? { ...state.userProfile, name: newName } : { name: newName },
                user: { ...state.user, name: newName }
            })),
            
            language: 'en',
            setLanguage: (lang) => {
                AsyncStorage.setItem('AppLanguage', lang).catch(e => console.log('Error saving lang', e));
                set({ language: lang });
            },

    activeOrder: { id: 1, type: 'Well Water', status: 'scheduled' },
    pastOrders: [],
    cancelOrder: () => set({ activeOrder: null }),
    updateOrder: (order) => set({ activeOrder: order }),
    createOrder: (order) => set({ activeOrder: order }),
    completeOrder: () => set((state) => ({
        pastOrders: state.activeOrder ? [...state.pastOrders, state.activeOrder] : state.pastOrders,
        activeOrder: null
    })),

    driver: {
        name: 'Khaled',
        phone: '0770000000',
        truck: 'Scania 15L',
        rating: 4.9,
        location: { lat: 35.55597, lng: 6.17366 }
    },
    setDriver: (driver) => set({ driver }),

    userRole: null,
    setUserRole: (role) => set({ userRole: role }),

    // Driver Accounts (Simulated DB)
    driverAccounts: {
        '0555001122': {
            name: 'Ahmed',
            phone: '0555001122',
            password: '123',
            truckPlate: '12345-123-16',
            driverType: 'Tanker',
            waterType: 'spring',
            capacity: 5000,
            location: { lat: 35.55597, lng: 6.17366 },
            earnings: 12500,
            completedTrips: 45,
            pastTrips: [],
            walletBalance: 4200,
            transactions: [],
            weeklyStats: buildInitialWeeklyStats()
        }
    },

    // Driver Onboarding
    registeredDriver: null,
    registerDriver: (driver) => {
        const role = driver.driverType === 'Tanker' ? 'DRIVER_TANKER' : 'DRIVER_BOTTLED';
        set((state) => {
            const newAccounts = { ...state.driverAccounts };
            newAccounts[driver.phone] = { 
                ...driver, 
                earnings: 0, 
                completedTrips: 0, 
                pastTrips: [],
                walletBalance: 0,
                transactions: [],
                weeklyStats: buildInitialWeeklyStats()
            };
            return {
                driverAccounts: newAccounts,
                registeredDriver: newAccounts[driver.phone],
                userRole: role,
                userProfile: { name: driver.name, phone: driver.phone },
                user: { name: driver.name, phone: driver.phone, rating: 4.9 },
                driverStatus: 'AVAILABLE',
                totalEarnings: 0,
                completedTrips: 0,
                pastTrips: [],
                walletBalance: 0,
                transactions: [],
                weeklyStats: buildInitialWeeklyStats()
            };
        });
    },
    loginDriver: (phone, password) => {
        const { driverAccounts } = get();
        const acc = driverAccounts[phone];
        if (acc && acc.password === password) {
            const role = acc.driverType === 'Tanker' ? 'DRIVER_TANKER' : 'DRIVER_BOTTLED';
            set({ 
                registeredDriver: acc,
                userRole: role,
                userProfile: { name: acc.name, phone: acc.phone },
                user: { name: acc.name, phone: acc.phone, rating: 4.9 },
                driverStatus: 'AVAILABLE',
                totalEarnings: acc.earnings || 0,
                completedTrips: acc.completedTrips || 0,
                pastTrips: acc.pastTrips || [],
                walletBalance: acc.walletBalance || 0,
                transactions: acc.transactions || [],
                weeklyStats: acc.weeklyStats || buildInitialWeeklyStats()
            });
            return true;
        }
        return false;
    },
    logout: () => set({
        user: null as any,
        userProfile: null,
        userRole: null,
        registeredDriver: null,
        driver: null,
        driverStatus: 'OFFLINE',
        activeDriverOrder: null,
        activeOrder: null,
        pastOrders: [],
        pastTrips: [],
        transactions: [],
        favorites: [],
        savedDrafts: [],
        totalEarnings: 0,
        walletBalance: 0,
        completedTrips: 0,
        draftOrder: {
            bottledWaterCart: {},
            tankerDetails: {
                quantity: 3000,
                hoseLength: 'standard',
                tankLocation: 'ground',
                floorNumber: 0,
            },
        }
    }),
    updateDriverLocation: (location) => set((state) => ({
        registeredDriver: state.registeredDriver ? { ...state.registeredDriver, location } : null
    })),
    updateDriverProfile: (name, phone) => set((state) => ({
        registeredDriver: state.registeredDriver ? { ...state.registeredDriver, name, phone } : null
    })),

    driverStatus: 'OFFLINE',
    setDriverStatus: (status) => set({ driverStatus: status }),

    // Driver Active Order
    activeDriverOrder: null,
    acceptDriverOrder: (order) => set({ 
        activeDriverOrder: { ...order, status: 'accepted' },
        driverStatus: 'BUSY'
    }),
    completeDriverOrder: () => set((state) => {
        const order = state.activeDriverOrder;
        if (!order) return { activeDriverOrder: null };

        const earnedAmount = order.subtotal;
        const commission = Math.round(earnedAmount * 0.1);

        // Build transaction record
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        }) + ' · ' + now.toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' });

        const newTransaction: DriverTransaction = {
            id: order.orderId,
            customerName: order.customer.name,
            date: dateStr,
            amount: earnedAmount,
        };

        // Build past trip record
        const dateLabel = now.toLocaleDateString('en-US', {
            month: 'short', day: '2-digit', year: 'numeric'
        }).toUpperCase(); // e.g. 'MAR 13, 2026'
        const timeLabel = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const newTrip: PastTrip = {
            id: order.orderId,
            date: dateLabel,
            time: timeLabel,
            orderSummary: order.items[0]?.description ?? 'Delivery',
            customerName: order.customer.name,
            deliveryType: 'Standard Delivery',
            amount: earnedAmount,
            status: 'Completed',
        };

        // Update weekly stats for today
        const todayIdx = todayIndexInWeek();
        const updatedWeekly = state.weeklyStats.map((stat, idx) =>
            idx === todayIdx ? { ...stat, amount: stat.amount + earnedAmount } : stat
        );

        // Update inventory if it's tanker order
        const isTanker = state.userRole === 'DRIVER_TANKER' || state.registeredDriver?.driverType === 'Tanker';
        
        // DEEP COPY inventory to ensure Zustand triggers re-renders and avoids mutable state bugs
        const updatedInventory = { 
            ...state.inventory,
            tanker: { ...state.inventory.tanker },
            bottled: { 
                ...state.inventory.bottled, 
                stock: { ...state.inventory.bottled.stock } 
            }
        };
        
        const updatedDriver = state.registeredDriver ? { ...state.registeredDriver } : null;
        let newDriverStatus = state.driverStatus;

        if (isTanker) {
            // Extract quantity handling formatting like 3,000L or 3000L
            const qtyStr = order.items[0]?.description.match(/([\d,]+)L/i)?.[1];
            const qty = qtyStr ? parseInt(qtyStr.replace(/,/g, '')) : 3000;
            
            updatedInventory.tanker.remaining = Math.max(0, updatedInventory.tanker.remaining - qty);
            if (updatedDriver && updatedDriver.capacity !== undefined) {
                updatedDriver.capacity = Math.max(0, updatedDriver.capacity - qty);
            }

            // The Auto-Offline Trigger
            const remainingCapacity = updatedDriver?.capacity ?? updatedInventory.tanker.remaining;
            if (remainingCapacity <= 0) {
                newDriverStatus = 'OFFLINE';
            }
        } else {
            // Deduct from bottled stock precisely based on Brand
            const itemDesc = order.items[0]?.description || '';
            const allBrands = ['Ifri', 'Guedila', 'Saida', 'Lalla Khedidja', 'Youkous', 'Hayat', 'Mansourah', 'Texanna', 'Toudja', 'Messerghine'];
            const foundBrand = allBrands.find(b => itemDesc.toLowerCase().includes(b.toLowerCase())) || 'Ifri';
            
            const sizeMatch = itemDesc.match(/0\.5L|1\.5L|5L/);
            const sizeKey = sizeMatch ? (sizeMatch[0] as '0.5L'|'1.5L'|'5L') : '1.5L';
            
            const packMatch = itemDesc.match(/(\d+)x/);
            const deductQty = packMatch ? parseInt(packMatch[1]) : 1;

            const brandStock = updatedInventory.bottled.stock[foundBrand] || { '0.5L': 0, '1.5L': 0, '5L': 0 };
            const currentQty = brandStock[sizeKey] || 0;
            const newQty = Math.max(0, currentQty - deductQty); // Safeguard against negatives
            
            updatedInventory.bottled.stock[foundBrand] = {
                ...brandStock,
                [sizeKey]: newQty
            };

            // Calculate overall remaining packs across all brands for the auto-offline trigger
            let totalRemainingPacks = 0;
            Object.values(updatedInventory.bottled.stock).forEach(brandObj => {
                totalRemainingPacks += brandObj['0.5L'] + brandObj['1.5L'] + brandObj['5L'];
            });

            // The Auto-Offline Trigger (The Guard)
            if (totalRemainingPacks <= 0) {
                newDriverStatus = 'OFFLINE';
            }
        }

        // Sync back to driverAccounts dictionary
        const updatedAccounts = { ...state.driverAccounts };
        if (state.userProfile?.phone && updatedAccounts[state.userProfile.phone]) {
            updatedAccounts[state.userProfile.phone] = {
                ...updatedAccounts[state.userProfile.phone],
                capacity: updatedDriver?.capacity, // Sync depleted capacity
                earnings: state.totalEarnings + earnedAmount,
                completedTrips: state.completedTrips + 1,
                pastTrips: [newTrip, ...state.pastTrips],
                walletBalance: state.walletBalance + earnedAmount,
                transactions: [newTransaction, ...state.transactions],
                weeklyStats: updatedWeekly,
                // Add an explicit saved payload for bottled inventory too
                savedInventory: updatedInventory
            } as any;
        }

        // If the driver was forced offline, keep them offline. Otherwise make AVAILABLE if they were BUSY.
        const resolvedStatus = newDriverStatus === 'OFFLINE' ? 'OFFLINE' : 'AVAILABLE';

        return {
            driverAccounts: updatedAccounts,
            registeredDriver: updatedDriver as any, 
            activeDriverOrder: null,
            driverStatus: resolvedStatus,
            totalEarnings: state.totalEarnings + earnedAmount,
            walletBalance: state.walletBalance + earnedAmount, // Add to wallet
            appCommission: state.appCommission + commission,
            completedTrips: state.completedTrips + 1,
            transactions: [newTransaction, ...state.transactions],
            weeklyStats: updatedWeekly,
            pastTrips: [newTrip, ...state.pastTrips],
            inventory: updatedInventory,
        };
    }),
    cancelDriverOrder: (reason) => set((state) => {
        const order = state.activeDriverOrder;
        if (!order) return { activeDriverOrder: null };

        const now = new Date();
        const dateLabel = now.toLocaleDateString('en-US', {
            month: 'short', day: '2-digit', year: 'numeric'
        }).toUpperCase();
        const timeLabel = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const cancelledTrip: PastTrip = {
            id: order.orderId,
            date: dateLabel,
            time: timeLabel,
            orderSummary: order.items[0]?.description ?? 'Delivery',
            customerName: order.customer.name,
            deliveryType: 'Cancelled Delivery',
            amount: 0,
            status: 'Cancelled',
            cancelReason: reason,
        };

        return {
            activeDriverOrder: null,
            driverStatus: state.driverStatus === 'OFFLINE' ? 'OFFLINE' : 'AVAILABLE',
            pastTrips: [cancelledTrip, ...state.pastTrips],
        };
    }),
    updateDriverOrderStatus: (status) => set((state) => ({
        activeDriverOrder: state.activeDriverOrder ? { ...state.activeDriverOrder, status } : null,
    })),

    // ── Driver Financial Initial State ──────────────────────────────────────
    totalEarnings: 12500,
    walletBalance: 4200, // Initial wallet balance
    completedTrips: 45,
    driverRating: 4.9,
    appCommission: 1200,
    transactions: [
        {
            id: 'tx-1',
            customerName: 'Ahmed B.',
            date: 'Oct 24, 2023 · 14:30',
            amount: 1250,
        },
        {
            id: 'tx-2',
            customerName: 'Sarah K.',
            date: 'Oct 24, 2023 · 11:15',
            amount: 850,
        },
        {
            id: 'tx-3',
            customerName: 'Meriem L.',
            date: 'Oct 23, 2023 · 16:45',
            amount: 2100,
        },
    ],
    // Today is FRI (index 4 in MON-SUN) — pre-seeded with a realistic week
    weeklyStats: [
        { day: 'MON', amount: 0 },
        { day: 'TUE', amount: 1800 },
        { day: 'WED', amount: 2200 },
        { day: 'THU', amount: 4100 },
        { day: 'FRI', amount: 3500 },
        { day: 'SAT', amount: 0 },
        { day: 'SUN', amount: 0 },
    ],

    pastTrips: [
        {
            id: 'trip-1',
            date: 'OCT 24, 2023',
            time: '10:30 AM',
            orderSummary: '3000L Spring Water',
            customerName: 'John Doe',
            deliveryType: 'Standard Delivery',
            amount: 120.00,
            status: 'Completed',
        },
        {
            id: 'trip-2',
            date: 'OCT 23, 2023',
            time: '02:15 PM',
            orderSummary: '5x 1.5L Packs',
            customerName: 'Jane Smith',
            deliveryType: 'Express Delivery',
            amount: 0.00,
            status: 'Cancelled',
        },
        {
            id: 'trip-3',
            date: 'OCT 22, 2023',
            time: '09:45 AM',
            orderSummary: '10x 5L Bottles',
            customerName: 'Robert Wilson',
            deliveryType: 'Standard Delivery',
            amount: 85.50,
            status: 'Completed',
        },
        {
            id: 'trip-4',
            date: 'OCT 21, 2023',
            time: '04:20 PM',
            orderSummary: '2000L Spring Water',
            customerName: 'Sarah Jenkins',
            deliveryType: 'Bulk Delivery',
            amount: 95.00,
            status: 'Completed',
        },
    ],

    // ── Inventory Logic ─────────────────────────────────────────────────────
    inventory: {
        tanker: { remaining: 3000, total: 5000, waterType: 'SPRING WATER' },
        bottled: {
            stock: {
                'Ifri': { '0.5L': 25, '1.5L': 15, '5L': 10 },
                'Guedila': { '0.5L': 30, '1.5L': 8, '5L': 22 },
                'Saida': { '0.5L': 12, '1.5L': 20, '5L': 5 },
                'Lalla Khedidja': { '0.5L': 40, '1.5L': 18, '5L': 3 },
                'Youkous': { '0.5L': 9, '1.5L': 25, '5L': 14 },
                'Hayat': { '0.5L': 35, '1.5L': 12, '5L': 28 },
                'Mansourah': { '0.5L': 7, '1.5L': 6, '5L': 19 },
                'Texanna': { '0.5L': 22, '1.5L': 30, '5L': 11 },
                'Toudja': { '0.5L': 16, '1.5L': 9, '5L': 24 },
                'Messerghine': { '0.5L': 4, '1.5L': 17, '5L': 8 },
            }
        }
    },
    refillStock: (type, amount: any) => set((state) => {
        const inv = state.inventory;
        if (type === 'tanker') {
            return {
                inventory: {
                    ...inv,
                    tanker: {
                        ...inv.tanker,
                        remaining: Math.min(inv.tanker.total, inv.tanker.remaining + (amount || inv.tanker.total)),
                    },
                },
            };
        } else {
            // amount is { brand, size, qty } for bottled
            const brandName = amount.brand || 'Ifri';
            const sizeKey = amount.size || '1.5L';
            const brandStock = inv.bottled.stock[brandName] || { '0.5L': 0, '1.5L': 0, '5L': 0 };
            
            return {
                inventory: {
                    ...inv,
                    bottled: {
                        ...inv.bottled,
                        stock: {
                            ...inv.bottled.stock,
                            [brandName]: {
                                ...brandStock,
                                [sizeKey]: brandStock[sizeKey as keyof typeof brandStock] + amount.qty
                            }
                        }
                    },
                },
            };
        }
    }),

    appSettings: {
        pushNotifications: true,
        locationServices: false,
        soundVibration: true,
        darkMode: false,
        language: 'English (US)',
    },
    updateAppSetting: (key, value) => set((state) => ({
        appSettings: { ...state.appSettings, [key]: value }
    })),

    pendingRating: false,
    setPendingRating: (status: boolean) => set({ pendingRating: status }),

    showRatingModal: false,
    setShowRatingModal: (val: boolean) => set({ showRatingModal: val }),

    // Draft Order Initialization
    draftOrder: {
        bottledWaterCart: {},
        tankerDetails: {
            quantity: 3000,
            hoseLength: 'standard',
            tankLocation: 'ground',
            floorNumber: 0,
        },
    },
    updateDraftOrder: (draft) => set((state) => ({
        draftOrder: { ...state.draftOrder, ...draft }
    })),
    clearDraftOrder: () => set({
        draftOrder: {
            bottledWaterCart: {},
            tankerDetails: {
                quantity: 3000,
                hoseLength: 'standard',
                tankLocation: 'ground',
                floorNumber: 0,
            },
        }
    }),

    // Favorites & Saved Drafts Implementation
    favorites: [],
    savedDrafts: [],
    addToFavorites: (order) => set((state) => ({
        favorites: [...state.favorites, order]
    })),
    saveToDrafts: (order) => set((state) => ({
        savedDrafts: [...state.savedDrafts, order]
    })),
    scheduleOrder: (order, date, time) => set((state) => {
        const scheduledOrder = {
            ...order,
            status: 'scheduled',
            schedulingInfo: { date, time }
        };
        return {
            pastOrders: [...state.pastOrders, scheduledOrder]
        };
    }),

    // ── Notifications Implementation ────────────────────────────────────────
    notifications: [
        {
            id: '1',
            title: 'Welcome to Ammarli!',
            description: 'Start ordering fresh water delivered to your doorstep today.',
            time: 'Just now',
            type: 'promo',
            isRead: false
        }
    ],

    addNotification: (noti) => {
        const id = Math.random().toString(36).substr(2, 9);
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const newNoti: Notification = {
            ...noti,
            id,
            time,
            isRead: false
        };

        set((state) => ({
            notifications: [newNoti, ...state.notifications]
        }));
    },

    markAllNotificationsAsRead: () => {
        set((state) => ({
            notifications: state.notifications.map(n => ({ ...n, isRead: true }))
        }));
    }
}));
