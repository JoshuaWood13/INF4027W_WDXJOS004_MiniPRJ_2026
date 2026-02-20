"use client";

import React, { useState, useMemo } from "react";
import { Order } from "@/types/order.types";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatPrice } from "@/lib/utils";
import { BsBank2 } from "react-icons/bs";
import { FiCreditCard } from "react-icons/fi";
import { TbTruckDelivery } from "react-icons/tb";

type TimeFilter = "7D" | "1M" | "3M" | "6M" | "1Y" | "All";

const TIME_FILTERS: { label: string; value: TimeFilter }[] = [
  { label: "7D", value: "7D" },
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
  { label: "6M", value: "6M" },
  { label: "1Y", value: "1Y" },
  { label: "All time", value: "All" },
];

const PAYMENT_ICON: Record<string, React.ReactNode> = {
  EFT: <BsBank2 className="text-lg" />,
  Card: <FiCreditCard className="text-lg" />,
  "Cash on Delivery": <TbTruckDelivery className="text-lg" />,
};

// Chart date helpers
/////////////////////////////////////////////////////////////////////////////////////////////////
function cutoffDate(filter: TimeFilter): Date | null {
  if (filter === "All") return null;
  const d = new Date();
  if (filter === "7D") d.setDate(d.getDate() - 7);
  else if (filter === "1M") d.setMonth(d.getMonth() - 1);
  else if (filter === "3M") d.setMonth(d.getMonth() - 3);
  else if (filter === "6M") d.setMonth(d.getMonth() - 6);
  else if (filter === "1Y") d.setFullYear(d.getFullYear() - 1);
  return d;
}

function formatDayLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
  });
}

function formatMonthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-ZA", {
    month: "short",
    year: "2-digit",
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////

function buildChartData(
  orders: Order[],
  filter: TimeFilter,
): { date: string; revenue: number }[] {
  const cutoff = cutoffDate(filter);
  const filtered = cutoff
    ? orders.filter((o) => o.createdAt >= cutoff)
    : orders;

  const useMonthly = ["3M", "6M", "1Y", "All"].includes(filter);
  const map = new Map<string, number>();

  for (const o of filtered) {
    const d = o.createdAt;
    const key = useMonthly
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      : d.toISOString().slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + o.totalAmount);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, revenue]) => ({
      date: useMonthly ? formatMonthLabel(key) : formatDayLabel(key),
      revenue,
    }));
}

function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-black/10 rounded-lg px-3 py-2 shadow-md text-sm">
      <p className="font-medium text-black/60 mb-0.5">{label}</p>
      <p className="font-bold text-black">{formatPrice(payload[0].value)}</p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  subtitle,
  badge,
}: {
  label: string;
  value: string;
  subtitle?: string;
  badge?: { label: string };
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
              {badge.label}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Finance Tab
export default function FinanceTab({ orders }: { orders: Order[] }) {
  const [chartFilter, setChartFilter] = useState<TimeFilter>("All");

  const chartData = useMemo(
    () => buildChartData(orders, chartFilter),
    [orders, chartFilter],
  );

  // KPIs
  const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const totalCost = orders.reduce((s, o) => s + (o.totalCost ?? 0), 0);
  const grossProfit = totalRevenue - totalCost;
  const profitPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // Payment type breakdown (all-time)
  const paymentMap = new Map<string, number>();
  for (const o of orders) {
    const pt = o.paymentType ?? "Unknown";
    paymentMap.set(pt, (paymentMap.get(pt) ?? 0) + o.totalAmount);
  }
  const paymentRanked = Array.from(paymentMap.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([type, amount], idx) => ({ rank: idx + 1, type, amount }));
  const maxPayment = paymentRanked[0]?.amount ?? 1;

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Total Revenue"
          value={formatPrice(totalRevenue)}
          subtitle="All time"
        />
        <KpiCard
          label="Cost of Sales"
          value={formatPrice(totalCost)}
          subtitle="All time"
        />
        <KpiCard
          label="Gross Profit"
          value={formatPrice(grossProfit)}
          subtitle="All time"
          badge={{ label: `${profitPct.toFixed(1)}% margin` }}
        />
        <KpiCard
          label="Total Orders"
          value={orders.length.toLocaleString()}
          subtitle="All time"
        />
      </div>

      {/* Chart + Payment Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <Card className="lg:col-span-2 rounded-xl border border-black/10 shadow-none">
          <CardContent className="pt-5 px-5 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <CardTitle className="text-base font-semibold">
                Total Sales Over Time
              </CardTitle>
              <div className="flex flex-wrap gap-1.5">
                {TIME_FILTERS.map((tf) => (
                  <button
                    key={tf.value}
                    onClick={() => setChartFilter(tf.value)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                      chartFilter === tf.value
                        ? "bg-black text-white"
                        : "bg-black/5 text-black/60 hover:bg-black/10"
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-[240px] text-sm text-black/30">
                No orders in this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="revenueGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#3b82f6"
                        stopOpacity={0.25}
                      />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#00000066" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tickFormatter={(v) => `R ${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: "#00000066" }}
                    tickLine={false}
                    axisLine={false}
                    width={58}
                  />
                  <Tooltip content={<RevenueTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Payment type ranking */}
        <Card className="rounded-xl border border-black/10 shadow-none">
          <CardContent className="pt-5 px-5 pb-5 h-full flex flex-col">
            <CardTitle className="text-base font-semibold mb-5">
              Sales by Payment Type
            </CardTitle>
            <div className="flex flex-col flex-1 justify-between gap-4">
              {paymentRanked.length === 0 ? (
                <p className="text-sm text-black/40">No data</p>
              ) : (
                paymentRanked.map(({ rank, type, amount }) => {
                  const icon = PAYMENT_ICON[type] ?? (
                    <FiCreditCard className="text-lg" />
                  );
                  const pct = (amount / maxPayment) * 100;
                  return (
                    <div
                      key={type}
                      className="flex-1 flex flex-col justify-center"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-black/25 w-4 shrink-0">
                            {rank}
                          </span>
                          <div className="w-9 h-9 rounded-lg bg-black/5 flex items-center justify-center text-black/60 shrink-0">
                            {icon}
                          </div>
                          <span className="text-sm font-medium text-black">
                            {type}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-black ml-2 shrink-0">
                          {formatPrice(amount)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-black/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
