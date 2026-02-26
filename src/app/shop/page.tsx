import { Suspense } from "react";
import BreadcrumbShop from "@/components/shop-page/BreadcrumbShop";
import MobileFilters from "@/components/shop-page/filters/MobileFilters";
import Filters from "@/components/shop-page/filters";
import ProductCard from "@/components/common/ProductCard";
import { getProducts } from "@/lib/firestore/products";
import ShopSortSelect from "@/components/shop-page/ShopSortSelect";
import FilterTags from "@/components/shop-page/FilterTags";

type ShopPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  // AI results = comma-separated ranked product IDs
  const aiResultsParam =
    typeof searchParams.aiResults === "string"
      ? searchParams.aiResults
      : undefined;

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
  const processor =
    typeof searchParams.processor === "string"
      ? searchParams.processor
      : undefined;
  const storage =
    typeof searchParams.storage === "string" ? searchParams.storage : undefined;
  const sort =
    typeof searchParams.sort === "string"
      ? (searchParams.sort as "price-asc" | "price-desc" | "newest" | "sales")
      : undefined;

  const isAiResults = Boolean(aiResultsParam);

  // Fetch products
  let products;
  if (isAiResults && aiResultsParam) {
    const orderedIds = aiResultsParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    const allProducts = await getProducts();
    const productMap = new Map(allProducts.map((p) => [p.id, p]));
    products = orderedIds
      .map((id) => productMap.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  } else {
    products = await getProducts({ sortBy: sort || "newest" });
  }

  // Parse multi-select filter params
  const categories = category ? category.split(",").filter(Boolean) : [];
  const brands = brand ? brand.split(",").filter(Boolean) : [];
  const rams = ram ? ram.split(",").filter(Boolean) : [];
  const screens = screen ? screen.split(",").filter(Boolean) : [];
  const processors = processor ? processor.split(",").filter(Boolean) : [];
  const storages = storage ? storage.split(",").filter(Boolean) : [];

  // Apply filters
  if (categories.length > 0)
    products = products.filter((p) => categories.includes(p.category));
  if (brands.length > 0)
    products = products.filter((p) => brands.includes(p.brand));
  if (minPrice !== undefined)
    products = products.filter((p) => p.price >= minPrice);
  if (maxPrice !== undefined)
    products = products.filter((p) => p.price <= maxPrice);
  if (rams.length > 0)
    products = products.filter((p) =>
      rams.some((r) => p.specs.ram.startsWith(r)),
    );
  if (screens.length > 0)
    products = products.filter((p) => {
      const baseSize = Math.floor(parseFloat(p.specs.screenSize));
      return screens.some((s) => parseInt(s) === baseSize);
    });
  if (processors.length > 0)
    products = products.filter((p) =>
      processors.some((proc) =>
        p.specs.processor.toLowerCase().startsWith(proc.toLowerCase()),
      ),
    );
  if (storages.length > 0)
    products = products.filter((p) =>
      storages.some((s) => p.specs.storage.startsWith(s)),
    );

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    products = products.filter((p) => {
      return (
        p.name?.toLowerCase().includes(searchLower) ||
        p.brand?.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        Object.values(p.specs).some((spec) =>
          String(spec).toLowerCase().includes(searchLower),
        ) ||
        p.tags?.some((tag) => String(tag).toLowerCase().includes(searchLower))
      );
    });
  }

  // Apply sort for AI results (non-AI already sorted by getProducts)
  if (isAiResults && sort) {
    switch (sort) {
      case "price-asc":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        products.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case "sales":
        products.sort((a, b) => b.salesCount - a.salesCount);
        break;
    }
  }

  // Build title — only AI, search, and categories affect the heading
  const titleParts: string[] = [];
  if (isAiResults) titleParts.push("AI Recommendations");
  if (search) titleParts.push(`Results for: "${search}"`);
  if (categories.length > 0)
    titleParts.push(
      categories.map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join(", "),
    );
  const pageTitle =
    titleParts.length > 0 ? titleParts.join(" — ") : "All Laptops";

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbShop />
        <div className="flex md:space-x-5 items-start">
          <div className="hidden md:block min-w-[295px] max-w-[295px] border border-black/10 rounded-[20px] px-5 md:px-6 py-5 space-y-5 md:space-y-6">
            <Suspense
              fallback={
                <div className="py-4 text-sm text-black/40">
                  Loading filters...
                </div>
              }
            >
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
            <Suspense>
              <FilterTags />
            </Suspense>
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
