// Skeleton loading component for the shop page when product data is being fetched
export default function ShopLoading() {
  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />

        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-5">
          <div className="h-4 w-10 bg-black/5 rounded animate-pulse" />
          <span className="text-black/20">/</span>
          <div className="h-4 w-14 bg-black/5 rounded animate-pulse" />
        </div>

        <div className="flex md:space-x-5 items-start">
          {/* Sidebar filter skeleton */}
          <div className="hidden md:block min-w-[295px] max-w-[295px] border border-black/10 rounded-[20px] px-5 md:px-6 py-5 space-y-5 md:space-y-6">
            <div className="flex items-center justify-between">
              <div className="h-6 w-16 bg-black/5 rounded animate-pulse" />
              <div className="h-6 w-6 bg-black/5 rounded animate-pulse" />
            </div>
            <hr className="border-t-black/10" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-5 w-24 bg-black/5 rounded animate-pulse" />
                <div className="h-4 w-full bg-black/5 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-black/5 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-black/5 rounded animate-pulse" />
                <hr className="border-t-black/10" />
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex flex-col w-full space-y-5">
            {/* Title + count skeleton */}
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <div className="h-8 w-48 bg-black/5 rounded animate-pulse" />
              <div className="flex items-center gap-3 mt-3 lg:mt-0">
                <div className="h-5 w-36 bg-black/5 rounded animate-pulse" />
                <div className="h-9 w-32 bg-black/5 rounded-lg animate-pulse" />
              </div>
            </div>

            {/* Product card skeletons */}
            <div className="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col">
                  <div className="bg-[#F0EEED] rounded-[20px] aspect-square w-full animate-pulse" />
                  <div className="mt-3 space-y-2">
                    <div className="h-4 w-3/4 bg-black/5 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-black/5 rounded animate-pulse" />
                    <div className="h-5 w-24 bg-black/5 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
