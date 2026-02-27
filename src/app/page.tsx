export const dynamic = "force-dynamic";

import ProductListSec from "@/components/common/ProductListSec";
import Brands from "@/components/homepage/Brands";
import DressStyle from "@/components/homepage/DressStyle";
import Header from "@/components/homepage/Header";
import { getProducts } from "@/lib/firestore/products";

export default async function Home() {
  // Fetch featured products and top sellers from Firestore
  const [featuredProducts, topSelling] = await Promise.all([
    getProducts({ featured: true, limitCount: 4 }),
    getProducts({ sortBy: "sales", limitCount: 4 }),
  ]);

  return (
    <>
      <Header />
      <Brands />
      <main className="my-[50px] sm:my-[72px]">
        <ProductListSec
          title="FEATURED LAPTOPS"
          data={featuredProducts}
          viewAllLink="/shop?featured=true"
        />
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <hr className="h-[1px] border-t-black/10 my-10 sm:my-16" />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <ProductListSec
            title="top selling"
            data={topSelling}
            viewAllLink="/shop?sort=sales"
          />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <DressStyle />
        </div>
      </main>
    </>
  );
}
