"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "@/types/order.types";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function truncateName(name: string, max = 20): string {
  return name.length > max ? name.slice(0, max - 1) + "…" : name;
}

// Components
//////////////////////////////////////////////////////////////////////////////////////
function KpiCard({
  label,
  value,
  subtitle,
  badge,
}: {
  label: string;
  value: string;
  subtitle?: string;
  badge?: string;
}) {
  return (
    <Card className="rounded-xl border-0 bg-black shadow-none">
      <CardContent className="pt-5 pb-4 px-5">
        <p className="text-sm text-white/50 font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-white leading-tight">{value}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {subtitle && (
            <span className="text-xs text-white/40">{subtitle}</span>
          )}
          {badge && (
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-green-400/30 text-green-200">
              {badge}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
//////////////////////////////////////////////////////////////////////////////////////

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-black/10 rounded-lg px-3 py-2 shadow-md text-sm">
      <p className="font-medium text-black/60 mb-0.5">{label}</p>
      <p className="font-bold text-black">
        {payload[0].value} new customer{payload[0].value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

// Customer Tab
export default function CustomerTab({ orders }: { orders: Order[] }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  // Get user display names from firestore
  const [nameMap, setNameMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    getDocs(collection(db, "users")).then((snap) => {
      const map = new Map<string, string>();
      snap.docs.forEach((d) => {
        const data = d.data();
        map.set(d.id, data.displayName ?? data.email ?? d.id);
      });
      setNameMap(map);
    });
  }, []);

  // Get all unique customer userIds
  const customerIds = useMemo(
    () => Array.from(new Set(orders.map((o) => o.userId))),
    [orders],
  );

  const totalCustomers = customerIds.length;

  // Group orders by user
  const ordersByUser = useMemo(() => {
    const map = new Map<string, Order[]>();
    for (const o of orders) {
      if (!map.has(o.userId)) map.set(o.userId, []);
      map.get(o.userId)!.push(o);
    }
    return map;
  }, [orders]);

  // Get repeat customer % (>1 order)
  const repeatCount = useMemo(
    () =>
      Array.from(ordersByUser.values()).filter((os) => os.length > 1).length,
    [ordersByUser],
  );
  const repeatPct =
    totalCustomers > 0
      ? ((repeatCount / totalCustomers) * 100).toFixed(1)
      : "0.0";

  // Get average customer order value
  const avgCustomerValue = useMemo(() => {
    if (totalCustomers === 0) return 0;
    const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
    return Math.round(totalRevenue / totalCustomers);
  }, [orders, totalCustomers]);

  // Get new customers per month for selected year
  const newCustomersByMonth = useMemo(() => {
    // Find earliest order date per user
    const firstOrderDate = new Map<string, Date>();
    for (const o of orders) {
      const existing = firstOrderDate.get(o.userId);
      if (!existing || o.createdAt < existing) {
        firstOrderDate.set(o.userId, o.createdAt);
      }
    }

    const counts = Array(12).fill(0);
    firstOrderDate.forEach((date) => {
      if (date.getFullYear() === year) {
        counts[date.getMonth()]++;
      }
    });

    return MONTH_LABELS.map((month, idx) => ({
      month,
      count: counts[idx],
    }));
  }, [orders, year]);

  // Top 10 customers by total spend
  const topCustomers = useMemo(() => {
    const spendMap = new Map<string, number>();
    for (const o of orders) {
      spendMap.set(o.userId, (spendMap.get(o.userId) ?? 0) + o.totalAmount);
    }
    return Array.from(spendMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([uid, spend], idx) => ({
        rank: idx + 1,
        name: nameMap.get(uid) ?? uid.slice(0, 8) + "…",
        spend,
      }));
  }, [orders, nameMap]);

  // Render
  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Total Customers"
          value={totalCustomers.toLocaleString()}
          subtitle="All time"
        />
        <KpiCard
          label="Repeat Customer Rate"
          value={`${repeatPct}%`}
          subtitle="of customers returned"
        />
        <KpiCard
          label="Avg. Customer Value"
          value={formatPrice(avgCustomerValue)}
          subtitle="Mean spend per customer"
        />
      </div>

      {/* Bar chart + Top customers table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* New customers bar chart */}
        <Card className="lg:col-span-2 rounded-xl border border-black/10 shadow-none self-start">
          <CardContent className="pt-5 px-5 pb-4">
            <div className="flex items-center justify-between mb-5">
              <CardTitle className="text-base font-semibold">
                New Customers per Month
              </CardTitle>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setYear((y) => y - 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-black/60"
                  aria-label="Previous year"
                >
                  <FiChevronLeft className="text-base" />
                </button>
                <span className="text-sm font-semibold text-black min-w-[40px] text-center tabular-nums">
                  {year}
                </span>
                <button
                  onClick={() => setYear((y) => y + 1)}
                  disabled={year >= currentYear}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-black/60 disabled:opacity-25 disabled:cursor-not-allowed"
                  aria-label="Next year"
                >
                  <FiChevronRight className="text-base" />
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={newCustomersByMonth}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                barCategoryGap="35%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#00000066" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#00000066" }}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                />
                <Tooltip
                  content={<BarTooltip />}
                  cursor={{ fill: "#00000008" }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top spending customers */}
        <Card className="rounded-xl border border-black/10 shadow-none overflow-hidden">
          {/* header strip */}
          <div className="bg-black px-5 py-3.5">
            <CardTitle className="text-sm font-semibold text-white">
              Top Spending Customers
            </CardTitle>
          </div>
          <CardContent className="p-0">
            {topCustomers.length === 0 ? (
              <p className="text-sm text-black/40 px-5 py-4">No data</p>
            ) : (
              <div className="overflow-y-auto max-h-[296px]">
                {topCustomers.map(({ rank, name, spend }) => (
                  <div
                    key={rank}
                    className="flex items-center gap-3 px-5 py-2.5 border-b border-black/5 last:border-0"
                  >
                    <span className="text-xs font-bold text-black/25 w-4 shrink-0 tabular-nums">
                      {rank}
                    </span>
                    <span
                      className="text-xs text-black flex-1 truncate"
                      title={name}
                    >
                      {truncateName(name)}
                    </span>
                    <span className="text-xs font-semibold text-black shrink-0 tabular-nums">
                      {formatPrice(spend)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
