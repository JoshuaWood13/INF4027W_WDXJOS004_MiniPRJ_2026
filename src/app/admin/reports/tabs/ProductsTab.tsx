"use client";

import { useEffect, useState, useMemo } from "react";
import { Product } from "@/types/product.types";
import { getProducts } from "@/lib/firestore/products";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, ResponsiveContainer } from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
  gaming: "#3b82f6",
  business: "#8b5cf6",
  ultrabook: "#10b981",
  student: "#f59e0b",
  workstation: "#ef4444",
};

const CATEGORY_LABELS: Record<string, string> = {
  gaming: "Gaming",
  business: "Business",
  ultrabook: "Ultrabook",
  student: "Student",
  workstation: "Workstation",
};

function truncate(name: string, max = 22): string {
  return name.length > max ? name.slice(0, max - 1) + "…" : name;
}

// Components
/////////////////////////////////////////////////////////////////////////////////
function KpiCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <Card className="rounded-xl border-0 bg-black shadow-none flex-1">
      <CardContent className="pt-5 pb-4 px-5">
        <p className="text-sm text-white/50 font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-white leading-tight">{value}</p>
        {subtitle && <p className="text-xs text-white/40 mt-1.5">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

// Ranked table card for top products by sales and views
function RankedTableCard({
  title,
  rows,
  metricLabel,
}: {
  title: string;
  rows: { name: string; metric: number }[];
  metricLabel: string;
}) {
  return (
    <Card className="rounded-xl border border-black/10 shadow-none flex-1 overflow-hidden">
      {/* Black header */}
      <div className="bg-black px-5 py-3.5">
        <CardTitle className="text-sm font-semibold text-white">
          {title}
        </CardTitle>
      </div>
      {/* Content */}
      <CardContent className="pt-4 px-5 pb-4">
        <div className="space-y-2.5">
          {rows.map((row, idx) => (
            <div key={row.name} className="flex items-center gap-3">
              <span className="text-xs font-bold text-black/25 w-4 shrink-0 tabular-nums">
                {idx + 1}
              </span>
              <span
                className="text-xs text-black flex-1 truncate"
                title={row.name}
              >
                {truncate(row.name)}
              </span>
              <span className="text-xs font-semibold text-black shrink-0 tabular-nums">
                {row.metric.toLocaleString()}
              </span>
              <span className="text-xs text-black/40 shrink-0">
                {metricLabel}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
/////////////////////////////////////////////////////////////////////////////////

// Informative tooltips for chart hovers
/////////////////////////////////////////////////////////////////////////////////
function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const views = payload.find((p: any) => p.dataKey === "views")?.value ?? 0;
  const purchases =
    payload.find((p: any) => p.dataKey === "purchases")?.value ?? 0;
  const conv = views > 0 ? ((purchases / views) * 100).toFixed(1) : "0.0";
  return (
    <div className="bg-white border border-black/10 rounded-lg px-3 py-2 shadow-md text-sm">
      <p className="font-semibold text-black mb-1 truncate max-w-[160px]">
        {label}
      </p>
      <p className="text-black/60">
        Views:{" "}
        <span className="font-medium text-black">{views.toLocaleString()}</span>
      </p>
      <p className="text-black/60">
        Purchases:{" "}
        <span className="font-medium text-black">
          {purchases.toLocaleString()}
        </span>
      </p>
      <p className="text-black/60">
        Conversion: <span className="font-medium text-blue-600">{conv}%</span>
      </p>
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-black/10 rounded-lg px-3 py-2 shadow-md text-sm">
      <p className="font-semibold text-black">{payload[0].name}</p>
      <p className="text-black/60">
        Revenue:{" "}
        <span className="font-medium text-black">
          {formatPrice(payload[0].value)}
        </span>
      </p>
    </div>
  );
}
/////////////////////////////////////////////////////////////////////////////////

// Products tab
export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  // Get data 
  const top5BySales = useMemo(
    () => [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 5),
    [products],
  );

  const top5ByViews = useMemo(
    () => [...products].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5),
    [products],
  );

  const totalProductsSold = useMemo(
    () => products.reduce((s, p) => s + p.salesCount, 0),
    [products],
  );

  // Calculate category revenue 
  const categoryRevenueMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      map.set(p.category, (map.get(p.category) ?? 0) + p.price * p.salesCount);
    }
    return map;
  }, [products]);

  const topCategory = useMemo(() => {
    let best = { category: "", revenue: 0 };
    categoryRevenueMap.forEach((rev, cat) => {
      if (rev > best.revenue) best = { category: cat, revenue: rev };
    });
    return best;
  }, [categoryRevenueMap]);

  const pieData = useMemo(
    () =>
      Array.from(categoryRevenueMap.entries())
        .sort(([, a], [, b]) => b - a)
        .map(([cat, revenue]) => ({
          name: CATEGORY_LABELS[cat] ?? cat,
          value: revenue,
          color: CATEGORY_COLORS[cat] ?? "#9ca3af",
        })),
    [categoryRevenueMap],
  );

  // Bar: top 5 best-selling (views vs purchases )
  const barData = useMemo(
    () =>
      top5BySales.map((p) => {
        const conv =
          p.viewCount > 0
            ? ((p.salesCount / p.viewCount) * 100).toFixed(1) + "%"
            : "0.0%";
        return {
          name: truncate(p.name, 16),
          views: p.viewCount,
          purchases: p.salesCount,
          conversion: conv,
        };
      }),
    [top5BySales],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-black/40 text-sm">
        Loading product data…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Ranked tables + KPI cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"> {/* Note: add items-start to remove spacing */}
        {/* Ranked tables */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RankedTableCard
            title="Best Selling Products"
            rows={top5BySales.map((p) => ({
              name: p.name,
              metric: p.salesCount,
            }))}
            metricLabel="sold"
          />
          <RankedTableCard
            title="Most Viewed Products"
            rows={top5ByViews.map((p) => ({
              name: p.name,
              metric: p.viewCount,
            }))}
            metricLabel="views"
          />
        </div>

        {/* KPI cards */}
        <div className="flex flex-col gap-4">
          <KpiCard
            label="Total Products Sold"
            value={totalProductsSold.toLocaleString()}
            subtitle="All time (units)"
          />
          <KpiCard
            label="Top Performing Category"
            value={
              CATEGORY_LABELS[topCategory.category] ?? topCategory.category
            }
            subtitle={formatPrice(topCategory.revenue) + " revenue"}
          />
        </div>
      </div>

      {/* Pie chart + Bar chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pie chart */}
        <Card className="rounded-xl border border-black/10 shadow-none">
          <CardContent className="pt-5 px-5 pb-4">
            <CardTitle className="text-base font-semibold mb-4">
              Sales by Category
            </CardTitle>
            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-sm text-black/30">
                No data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-black/70">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Bar chart */}
        <Card className="lg:col-span-2 rounded-xl border border-black/10 shadow-none">
          <CardContent className="pt-5 px-5 pb-4">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-base font-semibold">
                Views vs Purchases — Top 5 Products
              </CardTitle>
            </div>
            {barData.length === 0 ? (
              <div className="flex items-center justify-center h-[240px] text-sm text-black/30">
                No data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={barData}
                  margin={{ top: 20, right: 8, left: 0, bottom: 0 }}
                  barCategoryGap="25%"
                  barGap={4}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#00000066" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#00000066" }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip content={<BarTooltip />} />
                  <Legend
                    iconType="square"
                    iconSize={10}
                    formatter={(value) => (
                      <span className="text-xs text-black/70 capitalize">
                        {value}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey="views"
                    name="Views"
                    fill="#93c5fd"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="purchases"
                    name="Purchases"
                    fill="#3b82f6"
                    radius={[3, 3, 0, 0]}
                  >
                    <LabelList
                      dataKey="conversion"
                      position="top"
                      style={{ fontSize: 10, fill: "#6b7280", fontWeight: 500 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            <p className="text-xs text-black/40 mt-2 text-center">
              Conversion rate (%) shown above each product group
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
