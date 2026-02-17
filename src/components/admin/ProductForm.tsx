"use client";

import { useState, useEffect } from "react";
import { Product, ProductCategory } from "@/types/product.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ProductFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (data: ProductFormData) => Promise<void>;
};

export type ProductFormData = {
  name: string;
  brand: string;
  price: number;
  cost: number;
  category: ProductCategory;
  specs: {
    processor: string;
    ram: string;
    storage: string;
    gpu: string;
    screenSize: string;
    display: string;
    os: string;
    weight: string;
  };
  images: string[];
  tags: string[];
  description: string;
  discount: {
    amount: number;
    percentage: number;
  };
  featured: boolean;
  onSale: boolean;
};

const CATEGORIES: ProductCategory[] = [
  "gaming",
  "business",
  "ultrabook",
  "student",
  "workstation",
];

const BRANDS = ["Dell", "Lenovo", "HP", "ASUS", "Apple", "MSI", "Acer"];

export default function ProductForm({
  open,
  onOpenChange,
  product,
  onSave,
}: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [initialData, setInitialData] = useState<string>("");
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    brand: "",
    price: 0,
    cost: 0,
    category: "student",
    specs: {
      processor: "",
      ram: "",
      storage: "",
      gpu: "",
      screenSize: "",
      display: "",
      os: "",
      weight: "",
    },
    images: [""],
    tags: [],
    description: "",
    discount: { amount: 0, percentage: 0 },
    featured: false,
    onSale: false,
  });

  // Populate form when editing
  useEffect(() => {
    if (product) {
      const data = {
        name: product.name,
        brand: product.brand,
        price: product.price,
        cost: product.cost,
        category: product.category,
        specs: product.specs,
        images: product.images.length > 0 ? product.images : [""],
        tags: product.tags,
        description: product.description,
        discount: product.discount,
        featured: product.featured,
        onSale: product.onSale,
      };
      setFormData(data);
      setInitialData(JSON.stringify(data));
      setPreviewUrl(product.images[0] || "");
      setSelectedFile(null);
    } else {
      // Reset form for new product
      setFormData({
        name: "",
        brand: "",
        price: 0,
        cost: 0,
        category: "student",
        specs: {
          processor: "",
          ram: "",
          storage: "",
          gpu: "",
          screenSize: "",
          display: "",
          os: "",
          weight: "",
        },
        images: [""],
        tags: [],
        description: "",
        discount: { amount: 0, percentage: 0 },
        featured: false,
        onSale: false,
      });
      setInitialData("");
      setPreviewUrl("");
      setSelectedFile(null);
    }
  }, [product, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      let finalData = { ...formData };

      // Upload image if a new file was selected
      if (selectedFile) {
        // Delete old image if replacing
        if (product?.images?.[0]) {
          try {
            await fetch(
              `/api/upload?url=${encodeURIComponent(product.images[0])}`,
              {
                method: "DELETE",
              },
            );
          } catch (error) {
            console.error("Failed to delete old image:", error);
          }
        }

        const uploadFormData = new FormData();
        uploadFormData.append("file", selectedFile);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();
        finalData.images = [data.url];
      }

      await onSave(finalData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K],
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function updateSpec(field: keyof ProductFormData["specs"], value: string) {
    setFormData((prev) => ({
      ...prev,
      specs: { ...prev.specs, [field]: value },
    }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Store file for upload on submit
    setSelectedFile(file);

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function hasChanges(): boolean {
    if (!product) return true; // New product
    if (selectedFile) return true; // New image selected
    return JSON.stringify(formData) !== initialData;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Basic Information</h3>

            <div>
              <label className="block text-sm font-medium mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g., ASUS ROG Strix G16"
                className="w-full px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Brand <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.brand}
                  onChange={(e) => updateField("brand", e.target.value)}
                  className="w-full px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Select Brand</option>
                  {BRANDS.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    updateField("category", e.target.value as ProductCategory)
                  }
                  className="w-full px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price (ZAR) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) =>
                    updateField(
                      "price",
                      e.target.value ? Number(e.target.value) : 0,
                    )
                  }
                  placeholder="59999"
                  className="w-full px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Cost (ZAR) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  value={formData.cost || ""}
                  onChange={(e) =>
                    updateField(
                      "cost",
                      e.target.value ? Number(e.target.value) : 0,
                    )
                  }
                  placeholder="45000"
                  className="w-full px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Specifications</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Processor <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.specs.processor}
                  onChange={(e) => updateSpec("processor", e.target.value)}
                  placeholder="Intel Core i7-13650HX"
                  className="w-full px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  RAM <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.specs.ram}
                  onChange={(e) => updateSpec("ram", e.target.value)}
                  placeholder="16GB DDR5"
                  className="w-full px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Storage <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.specs.storage}
                  onChange={(e) => updateSpec("storage", e.target.value)}
                  placeholder="512GB NVMe SSD"
                  className="w-full px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  GPU <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.specs.gpu}
                  onChange={(e) => updateSpec("gpu", e.target.value)}
                  placeholder="NVIDIA RTX 4060"
                  className="w-full px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Screen Size <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.specs.screenSize}
                  onChange={(e) => updateSpec("screenSize", e.target.value)}
                  placeholder='15.6"'
                  className="w-full px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Display <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.specs.display}
                  onChange={(e) => updateSpec("display", e.target.value)}
                  placeholder="1920x1080 IPS 144Hz"
                  className="w-full px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Operating System <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.specs.os}
                  onChange={(e) => updateSpec("os", e.target.value)}
                  placeholder="Windows 11 Home"
                  className="w-full px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Weight <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.specs.weight}
                  onChange={(e) => updateSpec("weight", e.target.value)}
                  placeholder="2.3kg"
                  className="w-full px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>

          {/* Description & Images */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Details</h3>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Product description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Product Image <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={loading}
                className="w-full px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-black file:text-white hover:file:bg-black/80 disabled:opacity-50"
              />
              {previewUrl && (
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={previewUrl}
                    alt="Product preview"
                    className="w-20 h-20 object-cover rounded border border-black/10"
                  />
                  <p className="text-xs text-black/60 break-all">
                    {selectedFile ? selectedFile.name : formData.images[0]}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags.join(", ")}
                onChange={(e) =>
                  updateField(
                    "tags",
                    e.target.value.split(",").map((t: string) => t.trim()),
                  )
                }
                placeholder="gaming, rgb, high-performance"
                className="w-full px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Discount & Flags */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Pricing & Promotion</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Discount Amount (ZAR)
                </label>
                <input
                  type="number"
                  value={formData.discount.amount}
                  onChange={(e) =>
                    updateField("discount", {
                      ...formData.discount,
                      amount: Number(e.target.value),
                    })
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Discount Percentage
                </label>
                <input
                  type="number"
                  value={formData.discount.percentage}
                  onChange={(e) =>
                    updateField("discount", {
                      ...formData.discount,
                      percentage: Number(e.target.value),
                    })
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => updateField("featured", e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Featured Product</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.onSale}
                  onChange={(e) => updateField("onSale", e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">On Sale</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !hasChanges()}>
              {loading
                ? "Saving..."
                : product
                  ? "Update Product"
                  : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
