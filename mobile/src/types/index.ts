// Equipment types
export interface Equipment {
  id: number;
  companyId: number;
  name: string;
  description: string | null;
  category: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  qrCode: string;
  dailyPrice: number;
  quantity: number;
  availableQuantity: number;
  features: string | null;
  imageUrl: string | null;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  createdAt: string;
  updatedAt: string;
}

// Reservation types
export interface Reservation {
  id: number;
  companyId: number;
  reservationNo: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  depositAmount: number;
  depositPaid: boolean;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
  items: ReservationItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ReservationItem {
  id: number;
  reservationId: number;
  equipmentId: number;
  equipment: Equipment;
  quantity: number;
  dailyPrice: number;
  durationDays: number;
  totalPrice: number;
}

// Auth types
export interface User {
  id: number;
  email: string;
  name: string;
  companyId: number;
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'USER';
  phone: string | null;
  avatar: string | null;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Dashboard types
export interface DashboardStats {
  overview: {
    totalEquipment: number;
    totalReservations: number;
    activeReservations: number;
    completedReservations: number;
    currentRevenue: number;
    previousRevenue: number;
    revenueChange: number;
  };
  topEquipment: Array<{
    id: number;
    name: string;
    code: string;
    category: string;
    reservationCount: number;
    totalRevenue: number;
  }>;
  upcomingReservations: Array<{
    id: number;
    reservationNo: string;
    customerName: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    itemCount: number;
  }>;
}

// Notification types
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  data: any;
  read: boolean;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// Filter types
export interface EquipmentFilters {
  search?: string;
  category?: string;
  status?: Equipment['status'];
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
}

export interface ReservationFilters {
  search?: string;
  status?: Reservation['status'];
  startDate?: string;
  endDate?: string;
}

// Form types
export interface CreateReservationForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: Date;
  endDate: Date;
  items: Array<{
    equipmentId: number;
    quantity: number;
  }>;
  notes?: string;
  depositAmount?: number;
  depositPaid?: boolean;
}

// Navigation types
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Equipment: undefined;
  Reservations: undefined;
  Profile: undefined;
};

export type EquipmentStackParamList = {
  EquipmentList: undefined;
  EquipmentDetail: { equipmentId: number };
  QRScanner: undefined;
};

export type ReservationStackParamList = {
  ReservationList: undefined;
  ReservationDetail: { reservationId: number };
  CreateReservation: undefined;
};
