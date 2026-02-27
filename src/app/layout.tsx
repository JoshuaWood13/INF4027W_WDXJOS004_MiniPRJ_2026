import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { satoshi } from "@/styles/fonts";
import TopNavbar from "@/components/layout/Navbar/TopNavbar";
import Footer from "@/components/layout/Footer";
import HolyLoader from "holy-loader";
import Providers from "./providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "LaptopWRLD",
  description:
    "Your destination for laptops — browse, compare, and buy the best laptops in South Africa.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={satoshi.className}>
        <HolyLoader color="#868686" />
        <Providers>
          <TopNavbar />
          {children}
          <Footer />
        </Providers>
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
