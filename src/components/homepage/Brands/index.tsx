import React from "react";

const brandsData = [
  { id: "dell", name: "DELL" },
  { id: "lenovo", name: "LENOVO" },
  { id: "hp", name: "HP" },
  { id: "asus", name: "ASUS" },
  { id: "apple", name: "APPLE" },
];

const Brands = () => {
  return (
    <div className="bg-black">
      <div className="max-w-frame mx-auto flex flex-wrap items-center justify-center md:justify-between py-5 md:py-0 sm:px-4 xl:px-0 space-x-7">
        {brandsData.map((brand) => (
          <span
            key={brand.id}
            className="text-white font-bold text-xl lg:text-3xl tracking-wider my-5 md:my-11 opacity-80 hover:opacity-100 transition-opacity"
          >
            {brand.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Brands;
