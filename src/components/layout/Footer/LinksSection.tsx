import React from "react";
import { FooterLinks } from "./footer.types";
import Link from "next/link";
import { cn } from "@/lib/utils";

const footerLinksData: FooterLinks[] = [
  {
    id: 1,
    title: "shop",
    children: [
      {
        id: 11,
        label: "gaming laptops",
        url: "/shop?category=gaming",
      },
      {
        id: 12,
        label: "business laptops",
        url: "/shop?category=business",
      },
      {
        id: 13,
        label: "student laptops",
        url: "/shop?category=student",
      },
      {
        id: 14,
        label: "ultrabooks",
        url: "/shop?category=ultrabook",
      },
    ],
  },
  {
    id: 2,
    title: "account",
    children: [
      {
        id: 31,
        label: "my account",
        url: "/account",
      },
      {
        id: 32,
        label: "order history",
        url: "/account/orders",
      },
      {
        id: 33,
        label: "wishlist",
        url: "/account/wishlist",
      },
      {
        id: 34,
        label: "cart",
        url: "/cart",
      },
    ],
  },
  {
    id: 3,
    title: "brands",
    children: [
      {
        id: 41,
        label: "Dell",
        url: "/shop#dell",
      },
      {
        id: 42,
        label: "Lenovo",
        url: "/shop#lenovo",
      },
      {
        id: 43,
        label: "HP",
        url: "/shop#hp",
      },
      {
        id: 44,
        label: "ASUS",
        url: "/shop#asus",
      },
    ],
  },
];

const LinksSection = () => {
  return (
    <>
      {footerLinksData.map((item) => (
        <section className="flex flex-col mt-5" key={item.id}>
          <h3 className="font-medium text-sm md:text-base uppercase tracking-widest mb-6">
            {item.title}
          </h3>
          {item.children.map((link) => (
            <Link
              href={link.url}
              key={link.id}
              className={cn([
                "capitalize",
                "text-black/60 text-sm md:text-base mb-4 w-fit",
              ])}
            >
              {link.label}
            </Link>
          ))}
        </section>
      ))}
    </>
  );
};

export default LinksSection;
