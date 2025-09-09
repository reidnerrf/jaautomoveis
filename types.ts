export interface Vehicle {
  // Backend may provide MongoDB-style _id; keep both for compatibility
  _id?: string;
  id?: string;
  // UI components expect title; map from name when absent
  title?: string;
  name: string;
  price: number;
  make: string;
  model: string;
  year: number;
  km: number;
  color: string;
  gearbox: "Manual" | "Automático";
  fuel: "Gasolina" | "Etanol" | "Flex" | "Diesel" | "Elétrico" | "Híbrido";
  doors: number;
  additionalInfo?: string;
  optionals?: string[];
  images?: string[];
  views?: number;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  featured?: boolean;
  status?: "disponivel" | "vendido";
  cost?: number;
  soldAt?: string;
  soldPrice?: number;
  sellerId?: string;
  transmission?: string; // Add transmission field that's used in some components
  brand?: string; // Add brand field for compatibility
}

export interface Seller {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GoogleReview {
  id: string;
  reviewerName: string;
  comment: string;
  avatarUrl: string;
  rating: number;
  timeAgo: string;
}
