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
        url: "/shop#gaming",
      },
      {
        id: 12,
        label: "business laptops",
        url: "/shop#business",
      },
      {
        id: 13,
        label: "student laptops",
        url: "/shop#student",
      },
      {
        id: 14,
        label: "ultrabooks",
        url: "/shop#ultrabook",
      },
    ],
  },
  {
    id: 2,
    title: "help",
    children: [
      {
        id: 21,
        label: "customer support",
        url: "#",
      },
      {
        id: 22,
        label: "delivery details",
        url: "#",
      },
      {
        id: 23,
        label: "terms & conditions",
        url: "#",
      },
      {
        id: 24,
        label: "privacy policy",
        url: "#",
      },
    ],
  },
  {
    id: 3,
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
    id: 4,
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
