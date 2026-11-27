import { Suspense } from "react";

import ProductsView from "@/features/products/components/ProductsView";

export default function ProductsPage() {
  // ProductsView reads the URL's search params, which needs a Suspense boundary.
  return (
    <Suspense fallback={<p className="p-12 text-center">Loading…</p>}>
      <ProductsView />
    </Suspense>
  );
}
