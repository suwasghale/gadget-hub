export interface Product {
  id: number;
  slug?: string;
  name: string;
  brand?: string | null;
  image: string;
  currentPrice: number;
  originalPrice: number;
  discount: number;
  status: 'in-stock' | 'out-of-stock' | 'coming-soon';
  isNew?: boolean;
  freeShipping?: boolean;
  rating?: number;
  reviewCount?: number;
}


export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

