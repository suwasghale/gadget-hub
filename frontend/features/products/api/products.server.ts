import { ApiError, serverApi } from "@/lib/api/server";
import type { Product } from "../types/product";
import { mapProduct, type ProductAPI } from "./products";

/** Server components only: these call Django directly from the Next.js server. */

export async function getFeaturedProducts(): Promise<Product[]> {
  const data = await serverApi<{ count: number; results: ProductAPI[] }>("products/featured/", {
    revalidate: 120,
  });
  return data.results.map(mapProduct);
}

/** Returns null when the product does not exist (or is not available). */
export async function getProductBySlug(slug: string): Promise<ProductAPI | null> {
  try {
    return await serverApi<ProductAPI>(`products/${encodeURIComponent(slug)}/`, {
      revalidate: 120,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
