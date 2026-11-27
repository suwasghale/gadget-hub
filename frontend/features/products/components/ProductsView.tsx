"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ProductFilterSidebar, {
  type AppliedProductFilters,
} from "@/features/products/components/ProductFilterSidebar";
import ProductGrid from "@/features/products/components/ProductGrid";
import { fetchProducts, type ProductFilters } from "@/features/products/api/products";
import type { Product } from "@/features/products/types/product";

const PAGE_SIZE = 9;

function numberParam(value: string | null): number | undefined {
  if (value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Product listing driven by the URL: ?page, ?q, ?brand, ?min_price, ?max_price. */
export default function ProductsView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = useMemo<ProductFilters>(
    () => ({
      page: numberParam(searchParams.get("page")) ?? 1,
      page_size: PAGE_SIZE,
      q: searchParams.get("q") ?? undefined,
      brand: searchParams.get("brand") ?? undefined,
      min_price: numberParam(searchParams.get("min_price")),
      max_price: numberParam(searchParams.get("max_price")),
    }),
    [searchParams],
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    fetchProducts(filters)
      .then((data) => {
        if (cancelled) return;
        setProducts(data.results);
        setCount(data.count);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setProducts([]);
        setCount(0);
        setError(err.message || "Could not load products.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const page = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  function updateParams(changes: Record<string, string | number | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === undefined || value === "") params.delete(key);
      else params.set(key, String(value));
    }
    const query = params.toString();
    router.push(query ? `/products?${query}` : "/products");
  }

  function applySidebarFilters(applied: AppliedProductFilters) {
    updateParams({
      brand: applied.brands.join(",") || undefined,
      min_price: applied.minPrice,
      max_price: applied.maxPrice,
      page: undefined, // back to page 1
    });
  }

  const initialSidebar: AppliedProductFilters = {
    brands: filters.brand ? filters.brand.split(",").map((b) => b.toLowerCase()) : [],
    minPrice: filters.min_price,
    maxPrice: filters.max_price,
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">
            {filters.q ? `Results for “${filters.q}”` : "All Products"}
          </h2>
          {!loading && !error && (
            <p className="mt-2 text-gray-600">
              {count} product{count === 1 ? "" : "s"}
            </p>
          )}
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-80">
            <ProductFilterSidebar initial={initialSidebar} onApply={applySidebarFilters} />
          </aside>

          <div className="flex-1">
            {loading ? (
              <p>Loading…</p>
            ) : error ? (
              <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-red-700">
                {error}
              </p>
            ) : products.length === 0 ? (
              <p className="text-gray-600">No products match these filters.</p>
            ) : (
              <>
                <ProductGrid products={products} columns={3} />

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                      type="button"
                      className="px-3 py-1 rounded border disabled:opacity-40"
                      disabled={page <= 1}
                      onClick={() => updateParams({ page: page - 1 })}
                    >
                      Previous
                    </button>

                    <span>
                      Page {page} of {totalPages}
                    </span>

                    <button
                      type="button"
                      className="px-3 py-1 rounded border disabled:opacity-40"
                      disabled={page >= totalPages}
                      onClick={() => updateParams({ page: page + 1 })}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
