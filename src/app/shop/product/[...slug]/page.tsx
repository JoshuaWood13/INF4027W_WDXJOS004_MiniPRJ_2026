export const dynamic = "force-dynamic";

import ProductListSec from "@/components/common/ProductListSec";
import BreadcrumbProduct from "@/components/product-page/BreadcrumbProduct";
import Header from "@/components/product-page/Header";
import Tabs from "@/components/product-page/Tabs";
import { getProductById, getProducts } from "@/lib/firestore/products";
import { notFound } from "next/navigation";
import ViewTracker from "@/components/product-page/ViewTracker";

export default async function ProductPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const productId = params.slug[0];
  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  // Fetch related products from the same category (excluding current product)
  const relatedProducts = await getProducts({
    category: product.category,
    limitCount: 5,
  });
  const filteredRelated = relatedProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <main>
      <ViewTracker productId={product.id} /> {/* Track views */}
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbProduct title={product.name} />
        <section className="mb-11">
          <Header data={product} />
        </section>
        <Tabs product={product} />
      </div>
      <div className="mb-[50px] sm:mb-20">
        <ProductListSec title="You might also like" data={filteredRelated} />
      </div>
    </main>
  );
}
