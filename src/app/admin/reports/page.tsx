"use client";

import { useState, useEffect } from "react";
import { getAllOrders } from "@/lib/firestore/orders";
import { Order } from "@/types/order.types";
import FinanceTab from "./tabs/FinanceTab";
import ProductsTab from "./tabs/ProductsTab";

type TabId = "finance" | "products" | "customer";

const TABS: { id: TabId; label: string }[] = [
  { id: "finance", label: "Finance" },
  { id: "products", label: "Products" },
  { id: "customer", label: "Customer" },
];

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState<TabId>("finance");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Reports</h3>

      {/* Tab nav */}
      <div className="flex border-b border-black/10 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-black text-black"
                : "border-transparent text-black/40 hover:text-black/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-black/40 text-sm">
          Loading report data…
        </div>
      ) : (
        <>
          {activeTab === "finance" && <FinanceTab orders={orders} />}
          {activeTab === "products" && <ProductsTab />}
          {activeTab === "customer" && (
            <p className="text-sm text-black/40">Customer report.</p>
          )}
        </>
      )}
    </div>
  );
}
