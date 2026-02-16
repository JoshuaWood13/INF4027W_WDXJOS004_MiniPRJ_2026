import { Suspense } from "react";
import BreadcrumbShop from "@/components/shop-page/BreadcrumbShop";
import MobileFilters from "@/components/shop-page/filters/MobileFilters";
import Filters from "@/components/shop-page/filters";
import { FiSliders } from "react-icons/fi";
import ProductCard from "@/components/common/ProductCard";
import { getProducts } from "@/lib/firestore/products";
import ShopSortSelect from "@/components/shop-page/ShopSortSelect";
//import { p } from "framer-motion/client";

type ShopPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  // Extract search query + filter values from URL search params
  const search = 
    typeof searchParams.search === "string" ? searchParams.search : undefined;
  const category =
    typeof searchParams.category === "string"
      ? searchParams.category
      : undefined;
  const brand =
    typeof searchParams.brand === "string" ? searchParams.brand : undefined;
  const minPrice =
    typeof searchParams.minPrice === "string"
      ? Number(searchParams.minPrice)
      : undefined;
  const maxPrice =
    typeof searchParams.maxPrice === "string"
      ? Number(searchParams.maxPrice)
      : undefined;
  const ram =
    typeof searchParams.ram === "string" ? searchParams.ram : undefined;
  const screen =
    typeof searchParams.screen === "string" ? searchParams.screen : undefined;
  const sort =
    typeof searchParams.sort === "string"
      ? (searchParams.sort as "price-asc" | "price-desc" | "newest" | "sales")
      : undefined;

  // Fetch products from Firestore with applicable filters
  let products = await getProducts({
    category,
    brand,
    minPrice,
    maxPrice,
    sortBy: sort || "newest",
  });

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    products = products.filter((p) => {
      const nameMatch = p.name?.toLowerCase().includes(searchLower) || false;
      const brandMatch = p.brand?.toLowerCase().includes(searchLower) || false;
      const categoryMatch = p.category?.toLowerCase().includes(searchLower) || false;
      const descriptionMatch = p.description?.toLowerCase().includes(searchLower) || false;
      // Search specs
      const specsMatch = Object.values(p.specs).some((spec) =>
        String(spec).toLowerCase().includes(searchLower)
      ) || false;

      const tagsMatch = p.tags?.some((tag) =>
        String(tag).toLowerCase().includes(searchLower)
      ) || false;

      return nameMatch || brandMatch || categoryMatch || descriptionMatch || specsMatch || tagsMatch;
    });
  }

  // Apply RAM filter
  if (ram) {
    products = products.filter((p) =>
      p.specs.ram.toLowerCase().includes(ram.toLowerCase())
    );
  }

  // Apply screen size filter
  if (screen) {
    products = products.filter((p) =>
      p.specs.screenSize.includes(screen.replace('"', ""))
    );
  }

  // Build title
  const titleParts: string[] = [];
  if (search) titleParts.push(`Results for: "${search}"`);
  if (category) titleParts.push(category.charAt(0).toUpperCase() + category.slice(1));
  if (brand) titleParts.push(brand);
  const pageTitle = titleParts.length > 0 ? titleParts.join(" — ") : "All Laptops";

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbShop />
        <div className="flex md:space-x-5 items-start">
          <div className="hidden md:block min-w-[295px] max-w-[295px] border border-black/10 rounded-[20px] px-5 md:px-6 py-5 space-y-5 md:space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-black text-xl">Filters</span>
              <FiSliders className="text-2xl text-black/40" />
            </div>
            <Suspense fallback={<div className="py-4 text-sm text-black/40">Loading filters...</div>}>
              <Filters />
            </Suspense>
          </div>
          <div className="flex flex-col w-full space-y-5">
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <div className="flex items-center justify-between">
                <h1 className="font-bold text-2xl md:text-[32px]">
                  {pageTitle}
                </h1>
                <Suspense>
                  <MobileFilters />
                </Suspense>
              </div>
              <div className="flex flex-col sm:items-center sm:flex-row">
                <span className="text-sm md:text-base text-black/60 mr-3">
                  Showing {products.length}{" "}
                  {products.length === 1 ? "Product" : "Products"}
                </span>
                <Suspense>
                  <ShopSortSelect currentSort={sort} />
                </Suspense>
              </div>
            </div>
            <div className="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} data={product} />
              ))}
            </div>
            {products.length === 0 && (
              <div className="text-center py-20 text-black/40">
                <p className="text-xl mb-2">No laptops found</p>
                <p className="text-sm">
                  Try adjusting your filters or clearing them to see all
                  products.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
