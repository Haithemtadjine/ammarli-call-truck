import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';


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

interface Order {
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
    orderSummary?: string;
}

interface RegisteredDriver {
    name: string;
    phone: string;
    password?: string;
    truckPlate: string;
    driverType: 'Tanker' | 'Bottled';
    waterType?: string;
    capacity?: number;
    brands?: string[];
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
    status: 'accepted' | 'arrived' | 'completed';
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
    user: User;
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

    // Driver Onboarding
    registeredDriver: RegisteredDriver | null;
    registerDriver: (driver: RegisteredDriver) => void;
    loginDriver: (phone: string, password: string) => boolean;
    updateDriverLocation: (location: Location) => void;

    // Driver Active Order
    activeDriverOrder: DriverOrder | null;
    acceptDriverOrder: (order: DriverOrder) => void;
    completeDriverOrder: () => void;
    updateDriverOrderStatus: (status: DriverOrder['status']) => void;
    logoutDriver: (router: any) => void;
    logoutCustomer: (router: any) => void;

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
            stock: Array<{ size: string; qty: number; unit: string; icon: string }>;
        };
    };
    refillStock: (type: 'tanker' | 'bottled', amount: number | any) => void;

    pendingRating: boolean;
    setPendingRating: (status: boolean) => void;

    showRatingModal: boolean;
    setShowRatingModal: (val: boolean) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({

    user: { name: 'Ahmed', phone: '0555...', rating: 4.8 },
    userProfile: null,
    setUserProfile: (profile) => set({ userProfile: profile }),
    updateUserName: (newName) => set((state) => ({
        userProfile: state.userProfile ? { ...state.userProfile, name: newName } : { name: newName },
        user: { ...state.user, name: newName }
    })),

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

    // Driver Onboarding
    registeredDriver: null,
    registerDriver: (driver) => set({ registeredDriver: driver }),
    loginDriver: (phone, password) => {
        const { registeredDriver } = get();
        if (registeredDriver && registeredDriver.phone === phone && registeredDriver.password === password) {
            return true;
        }
        return false;
    },
    updateDriverLocation: (location) => set((state) => ({
        registeredDriver: state.registeredDriver ? { ...state.registeredDriver, location } : null
    })),

    // Driver Active Order
    activeDriverOrder: null,
    acceptDriverOrder: (order) => set({ activeDriverOrder: { ...order, status: 'accepted' } }),

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
        const isTanker = state.registeredDriver?.driverType === 'Tanker';
        const updatedInventory = { ...state.inventory };

        if (isTanker) {
            // Deduct from tanker (assuming 3000L standard for now or from item description)
            const qtyStr = order.items[0]?.description.match(/(\d+)L/)?.[1];
            const qty = qtyStr ? parseInt(qtyStr) : 3000;
            updatedInventory.tanker.remaining = Math.max(0, updatedInventory.tanker.remaining - qty);
        } else {
            // Deduct from bottled stock
            const itemDesc = order.items[0]?.description.toLowerCase();
            updatedInventory.bottled.stock = updatedInventory.bottled.stock.map(s => {
                if (itemDesc.includes(s.size.toLowerCase())) {
                    // Extract pack count if exists, else default 1
                    const packMatch = itemDesc.match(/(\d+)x/);
                    const packs = packMatch ? parseInt(packMatch[1]) : 1;
                    return { ...s, qty: Math.max(0, s.qty - packs) };
                }
                return s;
            });
        }

        return {
            activeDriverOrder: null,
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

    updateDriverOrderStatus: (status) => set((state) => ({
        activeDriverOrder: state.activeDriverOrder ? { ...state.activeDriverOrder, status } : null,
    })),

    logoutDriver: (router) => {
        set({
            activeDriverOrder: null,
            registeredDriver: null, // Clear driver session
        });
        router.replace('/driver-login');
    },

    logoutCustomer: (router) => {
        set({
            activeOrder: null,
            userProfile: null, // Clear customer session
        });
        router.replace('/login');
    },

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
        { day: 'FRI', amount: 3500 },   // today (Friday 14 Mar 2026)
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
            stock: [
                { size: '0.5L', qty: 50, unit: 'pk', icon: 'water-outline' },
                { size: '1.5L', qty: 30, unit: 'pk', icon: 'water' },
                { size: '5L', qty: 20, unit: 'jg', icon: 'cube-outline' },
            ]
        }
    },
    refillStock: (type, amount) => set((state) => {
        const inv = { ...state.inventory };
        if (type === 'tanker') {
            inv.tanker.remaining = Math.min(inv.tanker.total, inv.tanker.remaining + (amount || 5000));
        } else {
            // Assume amount is object { size, qty } for bottled
            inv.bottled.stock = inv.bottled.stock.map(s => 
                s.size === amount.size ? { ...s, qty: s.qty + amount.qty } : s
            );
        }
        return { inventory: inv };
    }),

    pendingRating: false,
    setPendingRating: (status) => set({ pendingRating: status }),

    showRatingModal: false,
    setShowRatingModal: (val) => set({ showRatingModal: val }),
}),
{
    name: 'ammarli-app-storage',
    storage: createJSONStorage(() => AsyncStorage),
}
)
);
