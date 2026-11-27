import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductDetails from "@/features/products/components/ProductDetails";
import { getProductBySlug } from "@/features/products/api/products.server";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) return { title: "Product not found | Gadget Hub" };
  return {
    title: `${product.name} | Gadget Hub`,
    description: product.description?.slice(0, 160) || product.name,
  };
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  return <ProductDetails product={product} />;
}
