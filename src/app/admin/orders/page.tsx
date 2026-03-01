"use client";

import { useEffect, useState } from "react";
import { getAllOrders } from "@/lib/firestore/orders";
import { Order, OrderStatus } from "@/types/order.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FiEye } from "react-icons/fi";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

// Page size for pagination
const PAGE_SIZE = 10;

export default function AdminOrders() {
  // States
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    let filtered = [...orders];

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    // Date range filter
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter((o) => new Date(o.createdAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((o) => new Date(o.createdAt) <= end);
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, statusFilter, startDate, endDate]);

  // Get all orders from firestore
  async function loadOrders() {
    setLoading(true);
    try {
      const data = await getAllOrders();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  }

  // Triggr order details dialog
  function handleViewDetails(order: Order) {
    setViewingOrder(order);
    setDetailsOpen(true);
  }

  function clearFilters() {
    setStatusFilter("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  }

  function getPageRange(
    current: number,
    total: number,
  ): (number | "ellipsis")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
    if (current >= total - 3)
      return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
    return [
      1,
      "ellipsis",
      current - 1,
      current,
      current + 1,
      "ellipsis",
      total,
    ];
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function formatPrice(price: number): string {
    return price.toLocaleString();
  }

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Manage Orders</h3>

      {/* Filters */}
      <div className="bg-[#F0F0F0] p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-black/70">
              Order Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as OrderStatus | "")
              }
              className="w-full h-[42px] px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="complete">Complete</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-black/70">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onClick={(e) => {
                const input = e.target as HTMLInputElement;
                input.showPicker?.();
              }}
              className="w-full h-[42px] px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white cursor-pointer"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-black/70">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onClick={(e) => {
                const input = e.target as HTMLInputElement;
                input.showPicker?.();
              }}
              className="w-full h-[42px] px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white cursor-pointer"
            />
          </div>

          {/* Clear Filters */}
          <Button onClick={clearFilters} className="h-[42px]">
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-3 text-sm text-black/60">
        Showing{" "}
        {filteredOrders.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–
        {Math.min(currentPage * PAGE_SIZE, filteredOrders.length)} of{" "}
        {filteredOrders.length} orders
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-12">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-black/60">No orders found</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders
                .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                .map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{order.items.length} items</TableCell>
                    <TableCell>R{formatPrice(order.totalAmount)}</TableCell>
                    <TableCell>{order.paymentType}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          order.status === "complete"
                            ? "bg-green-100 text-green-800"
                            : order.status === "refunded"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(order)}
                      >
                        <FiEye className="mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {Math.ceil(filteredOrders.length / PAGE_SIZE) > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((p) => Math.max(1, p - 1));
                }}
                aria-disabled={currentPage === 1}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-40" : ""
                }
              />
            </PaginationItem>
            {getPageRange(
              currentPage,
              Math.ceil(filteredOrders.length / PAGE_SIZE),
            ).map((page, idx) =>
              page === "ellipsis" ? (
                <PaginationItem key={`e-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((p) =>
                    Math.min(
                      Math.ceil(filteredOrders.length / PAGE_SIZE),
                      p + 1,
                    ),
                  );
                }}
                aria-disabled={
                  currentPage === Math.ceil(filteredOrders.length / PAGE_SIZE)
                }
                className={
                  currentPage === Math.ceil(filteredOrders.length / PAGE_SIZE)
                    ? "pointer-events-none opacity-40"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-black/60">Order ID</p>
                  <p className="font-mono text-sm">{viewingOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-black/60">
                    Customer ID
                  </p>
                  <p className="font-mono text-sm">{viewingOrder.userId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-black/60">Date</p>
                  <p>{formatDate(viewingOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-black/60">Status</p>
                  <p className="capitalize">{viewingOrder.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-black/60">Payment</p>
                  <p>{viewingOrder.paymentType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-black/60">Total</p>
                  <p className="font-semibold">
                    R{formatPrice(viewingOrder.totalAmount)}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              {viewingOrder.shippingAddress && (
                <div>
                  <p className="text-sm font-medium text-black/60 mb-2">
                    Shipping Address
                  </p>
                  <div className="bg-black/5 p-3 rounded-lg">
                    <p>
                      {viewingOrder.shippingAddress.street},{" "}
                      {viewingOrder.shippingAddress.suburb}
                    </p>
                    <p>
                      {viewingOrder.shippingAddress.city},{" "}
                      {viewingOrder.shippingAddress.province}{" "}
                      {viewingOrder.shippingAddress.postalCode}
                    </p>
                  </div>
                </div>
              )}

              {/* Gift Info */}
              {viewingOrder.isGift && (
                <div>
                  <p className="text-sm font-medium text-black/60 mb-2">
                    Gift Information
                  </p>
                  <div className="bg-purple-50 p-3 rounded-lg space-y-2">
                    {viewingOrder.giftRecipientId && (
                      <p>
                        <span className="font-medium">Recipient ID:</span>{" "}
                        {viewingOrder.giftRecipientId}
                      </p>
                    )}
                    {viewingOrder.giftMessage && (
                      <p>
                        <span className="font-medium">Message:</span>{" "}
                        {viewingOrder.giftMessage}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Auto Buy Badge */}
              {viewingOrder.isAutoBuy && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    🤖 Auto-Buy Order
                  </p>
                </div>
              )}

              {/* Order Items */}
              <div>
                <p className="text-sm font-medium text-black/60 mb-2">
                  Order Items
                </p>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingOrder.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <span>{item.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>R{formatPrice(item.price)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            R{formatPrice(item.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
