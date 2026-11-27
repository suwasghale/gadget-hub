import { api } from "@/lib/api/client";
import type { PaginatedResponse, Product } from "../types/product";

/** Shape returned by Django's ProductSerializer (apps/products/api/serializers.py). */
export interface ProductAPI {
  id: number;
  sku: string | null;
  name: string;
  slug: string;
  description: string;
  brand: string | null;
  category: { id: number; name: string; slug: string } | null;
  price: string;
  old_price: string | null;
  discount_percentage: number;
  discount_amount: number | string;
  final_price: number | string;
  stock: number;
  is_available: boolean;
  warranty: string | null;
  free_shipping: boolean;
  expected_delivery: string;
  thumbnail_url: string | null;
  gallery_urls: string[];
  specifications: { key: string; value: string }[];
  reviews: ProductReviewAPI[];
  avg_rating: number;
  review_count: number;
  created_at: string;
}

export interface ProductReviewAPI {
  id: number;
  username: string;
  rating: number;
  comment: string;
  images: string[];
  is_verified_purchase: boolean;
  created_at: string;
}

export interface ProductFilters {
  page?: number;
  page_size?: number;
  brand?: string;
  min_price?: number;
  max_price?: number;
  q?: string;
  ordering?: string;
  "category__slug"?: string;
}

export const PLACEHOLDER_IMAGE = "/placeholder.svg";

const NEW_PRODUCT_DAYS = 30;

export function mapProduct(api: ProductAPI): Product {
  const current = Number(api.final_price);
  const oldPrice = api.old_price ? Number(api.old_price) : null;
  const original = oldPrice && oldPrice > current ? oldPrice : Number(api.price);

  const discount =
    original > current ? Math.round(((original - current) / original) * 100) : 0;

  const ageDays = (Date.now() - new Date(api.created_at).getTime()) / 86_400_000;

  return {
    id: api.id,
    slug: api.slug,
    name: api.name,
    brand: api.brand,
    image: api.thumbnail_url || api.gallery_urls[0] || PLACEHOLDER_IMAGE,
    currentPrice: current,
    originalPrice: original,
    discount,
    status: api.is_available && api.stock > 0 ? "in-stock" : "out-of-stock",
    isNew: ageDays <= NEW_PRODUCT_DAYS,
    freeShipping: api.free_shipping,
    rating: api.avg_rating || undefined,
    reviewCount: api.review_count || undefined,
  };
}

export function toQueryString(filters: ProductFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** Browser: paginated, filtered product list (through the /api/proxy gateway). */
export async function fetchProducts(
  filters: ProductFilters = {},
): Promise<PaginatedResponse<Product>> {
  const data = await api<PaginatedResponse<ProductAPI>>(`products/${toQueryString(filters)}`);
  return { ...data, results: data.results.map(mapProduct) };
}
