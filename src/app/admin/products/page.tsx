"use client";

import { useState, useEffect } from "react";
import { Product, ProductCategory } from "@/types/product.types";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/lib/firestore/products";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import ProductForm, { ProductFormData } from "@/components/admin/ProductForm";
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import SpinnerbLoader from "@/components/ui/SpinnerbLoader";
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

const BRANDS = ["Dell", "Lenovo", "HP", "ASUS", "Apple", "MSI", "Acer"];
const CATEGORIES: ProductCategory[] = [
  "gaming",
  "business",
  "ultrabook",
  "student",
  "workstation",
];

export default function AdminProducts() {
  // States
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(query));
    }

    // Brand filter
    if (brandFilter) {
      filtered = filtered.filter((p) => p.brand === brandFilter);
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    // Price range filter
    if (minPrice) {
      filtered = filtered.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((p) => p.price <= Number(maxPrice));
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchQuery, brandFilter, categoryFilter, minPrice, maxPrice]);

  // Get all products from firestore and apply filters
  async function loadProducts() {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProduct(data: ProductFormData) {
    if (editingProduct) {
      // Update existing product
      await updateProduct(editingProduct.id, data);

      // Only trigger watchers if price or discount actually changed
      const priceChanged = data.price !== editingProduct.price;
      const discountChanged =
        data.discount.percentage !== editingProduct.discount.percentage ||
        data.discount.amount !== editingProduct.discount.amount;

      if (priceChanged || discountChanged) {
        try {
          await fetch("/api/trigger-watchers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: editingProduct.id,
              productName: data.name,
              newPrice: data.price,
              newDiscount: data.discount,
            }),
          });
        } catch (e) {
          console.error("Watcher trigger failed:", e);
        }
      }
    } else {
      // Create new product
      await createProduct({
        ...data,
        rating: 4.5, //placeholder
        viewCount: 0,
        salesCount: 0,
      });
    }
    await loadProducts();
    setEditingProduct(null);
  }

  // Handlers for edit, add, delete actions
  /////////////////////////////////////////////////////////////////////////////
  function handleEditClick(product: Product) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  function handleAddClick() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function handleDeleteClick(product: Product) {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  }

  async function handleConfirmDelete() {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await deleteProduct(productToDelete.id);

      // Delete associated image file
      if (productToDelete.images?.[0]) {
        try {
          await fetch(
            `/api/upload?url=${encodeURIComponent(productToDelete.images[0])}`,
            {
              method: "DELETE",
            },
          );
        } catch (error) {
          console.error("Failed to delete product image:", error);
        }
      }

      await loadProducts();
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setDeleting(false);
    }
  }
  /////////////////////////////////////////////////////////////////////////////

  function clearFilters() {
    setSearchQuery("");
    setBrandFilter("");
    setCategoryFilter("");
    setMinPrice("");
    setMaxPrice("");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <SpinnerbLoader className="w-10 border-2 border-gray-300 border-r-gray-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Manage Products</h3>
        <Button onClick={handleAddClick} className="flex items-center gap-2">
          <FiPlus />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-[#F0F0F0] p-4 rounded-lg space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white"
          />
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white"
          >
            <option value="">All Brands</option>
            {BRANDS.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white"
          />

          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white"
          />
        </div>

        {/* Clear Filters */}
        {(searchQuery ||
          brandFilter ||
          categoryFilter ||
          minPrice ||
          maxPrice) && (
          <button
            onClick={clearFilters}
            className="text-sm text-black/60 hover:text-black underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <p className="text-sm text-black/60">
        Showing{" "}
        {filteredProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–
        {Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} of{" "}
        {filteredProducts.length} products
      </p>

      {/* Products Table */}
      <div className="border border-black/10 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>On Sale</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-black/60 py-8"
                >
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts
                .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                .map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.brand}</TableCell>
                    <TableCell>
                      {product.category.charAt(0).toUpperCase() +
                        product.category.slice(1)}
                    </TableCell>
                    <TableCell>R {product.price.toLocaleString()}</TableCell>
                    <TableCell>R {product.cost.toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          product.onSale
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.onSale ? "Yes" : "No"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(product)}
                          className="h-8 w-8 p-0"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(product)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {Math.ceil(filteredProducts.length / PAGE_SIZE) > 1 && (
        <Pagination>
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
              Math.ceil(filteredProducts.length / PAGE_SIZE),
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
                      Math.ceil(filteredProducts.length / PAGE_SIZE),
                      p + 1,
                    ),
                  );
                }}
                aria-disabled={
                  currentPage === Math.ceil(filteredProducts.length / PAGE_SIZE)
                }
                className={
                  currentPage === Math.ceil(filteredProducts.length / PAGE_SIZE)
                    ? "pointer-events-none opacity-40"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Product Form Modal */}
      <ProductForm
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
        onSave={handleSaveProduct}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{productToDelete?.name}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
