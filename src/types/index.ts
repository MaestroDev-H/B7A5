export type Role = "CUSTOMER" | "PROVIDER" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED";
export type RentalStatus = "PLACED" | "CONFIRMED" | "PAID" | "PICKED_UP" | "RETURNED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface CustomerProfile {
  id?: string;
  userId?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  emergencyContact?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProviderProfile {
  id?: string;
  userId?: string;
  businessName?: string;
  businessPhone?: string;
  businessAddress?: string;
  taxId?: string;
  bio?: string;
  logoUrl?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  phone?: string;
  avatarUrl?: string;
  customerProfile?: CustomerProfile;
  providerProfile?: ProviderProfile;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface GearItem {
  id: string;
  name: string;
  description: string;
  brand: string;
  pricePerDay: number;
  stock: number;
  isAvailable: boolean;
  images: string[];
  isDeleted: boolean;
  categoryId: string;
  category?: Category;
  providerId: string;
  provider?: User;
  createdAt: string;
  updatedAt: string;
  reviews?: Review[];
  avgRating?: number;
}

export interface RentalOrderItem {
  id: string;
  quantity: number;
  pricePerDay: number;
  rentalOrderId: string;
  gearItemId: string;
  gearItem: GearItem;
}

export interface RentalOrder {
  id: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: RentalStatus;
  customerId: string;
  customer?: User;
  items: RentalOrderItem[];
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  transactionId: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  paidAt?: string;
  rentalOrderId: string;
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  customerId: string;
  customer?: User;
  gearItemId: string;
  createdAt: string;
}
