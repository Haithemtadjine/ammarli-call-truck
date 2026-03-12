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
    // Bottled Water order-specific data
    bottledWaterItems?: {
        smallPacks: number;
        mediumPacks: number;
        largePacks: number;
        brand: string;
    };
    // Human-readable order summary e.g. "Brand: Ifri | 2x 0.5L Pack, 1x 5L Jug"
    orderSummary?: string;
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
    status: 'accepted' | 'arrived' | 'completed';
    createdAt: string;
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

    pendingRating: boolean;
    setPendingRating: (status: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
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
    completeDriverOrder: () => set({ activeDriverOrder: null }),
    updateDriverOrderStatus: (status) => set((state) => ({
        activeDriverOrder: state.activeDriverOrder ? { ...state.activeDriverOrder, status } : null,
    })),

    pendingRating: false,
    setPendingRating: (status) => set({ pendingRating: status }),
}));
