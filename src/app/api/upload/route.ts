import { NextRequest, NextResponse } from "next/server";
import { writeFile, access, unlink } from "fs/promises";
import { constants } from "fs";
import path from "path";

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

    // Read file as buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get original filename and extension
    const originalName = file.name;
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);

    // Save to public/images/laptops
    const publicDir = path.join(process.cwd(), "public", "images", "laptops");

    let filename = originalName;
    let counter = 1;
    let filePath = path.join(publicDir, filename);

    // Check for duplicates file names and increment if necessary)
    while (true) {
      try {
        await access(filePath, constants.F_OK);
        // File exists, try next number
        filename = `${nameWithoutExt}-${counter}${ext}`;
        filePath = path.join(publicDir, filename);
        counter++;
      } catch {
        break;
      }
    }

    await writeFile(filePath, buffer);

    // Return URL path
    const imageUrl = `/images/laptops/${filename}`;

    return NextResponse.json({ url: imageUrl });
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

    // Only delete files from /images/laptops/
    if (!imageUrl.startsWith("/images/laptops/")) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }

    // Extract filename from URL
    const filename = path.basename(imageUrl);
    const filePath = path.join(
      process.cwd(),
      "public",
      "images",
      "laptops",
      filename,
    );

    // Check if file exists before deleting
    try {
      await access(filePath, constants.F_OK);
      await unlink(filePath);
      return NextResponse.json({ success: true });
    } catch (error) {
      // File doesnt exist
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 },
    );
  }
}
