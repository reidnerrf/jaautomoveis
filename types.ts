export interface Vehicle {
  id: string;
  name: string;
  price: number;
  make: string;
  model: string;
  year: number;
  km: number;
  color: string;
  gearbox: 'Manual' | 'Automático';
  fuel: 'Gasolina' | 'Etanol' | 'Flex' | 'Diesel' | 'Elétrico' | 'Híbrido';
  doors: number;
  additionalInfo: string;
  optionals: string[];
  images: string[];
  views: number;
  createdAt?: string;
}

export interface GoogleReview {
  id: string;
  reviewerName: string;
  comment: string;
  avatarUrl: string;
  rating: number;
  timeAgo: string;
}