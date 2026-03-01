import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";

// Handle image uploads for product
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 },
      );
    }

    // Upload to Vercel Blob storage
    const blob = await put(`laptops/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 },
    );
  }
}

// Handle image deletion for product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Only delete Vercel Blob URLs
    if (imageUrl.startsWith("/images/")) {
      // Legacy functionality, kept for old image stored in public folder
      return NextResponse.json({ success: true });
    }

    await del(imageUrl);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 },
    );
  }
}
