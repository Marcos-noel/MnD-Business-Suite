import type { Metadata } from "next";
import { backendUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { org: string; sku: string } }) {
  try {
    const res = await fetch(
      `${backendUrl()}/api/v1/store/${params.org}/products/${params.sku}`,
      { cache: "no-store" }
    );
    if (!res.ok) return {};
    const product = await res.json();
    return {
      title: product.meta_title || product.name,
      description: product.meta_description || product.description,
      openGraph: {
        title: product.meta_title || product.name,
        description: product.meta_description || product.description,
        images: product.image_url ? [product.image_url] : []
      }
    };
  } catch {
    return {};
  }
}
