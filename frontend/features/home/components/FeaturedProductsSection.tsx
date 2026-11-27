import Link from "next/link";

import ProductGrid from "@/features/products/components/ProductGrid";
import { getFeaturedProducts } from "@/features/products/api/products.server";
import type { Product } from "@/features/products/types/product";

/** Server component: featured products straight from the Django API. */
const FeaturedProductsSection = async () => {
  let products: Product[] = [];
  let unavailable = false;
  try {
    products = await getFeaturedProducts();
  } catch {
    unavailable = true;
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Featured Laptops
          </h2>
          <p className="text-gray-600">
            Discover the perfect laptop for your needs
          </p>
        </div>
        {unavailable ? (
          <p className="text-center text-gray-600">
            Products could not be loaded right now. Please try again shortly.
          </p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-600">No products yet.</p>
        ) : (
          <>
            <ProductGrid products={products.slice(0, 8)} />
            <div className="mt-8 text-center">
              <Link href="/products" className="text-red-600 font-semibold hover:underline">
                View all products
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
