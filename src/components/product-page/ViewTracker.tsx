"use client";

import { useEffect } from "react";
import { incrementViewCount } from "@/lib/firestore/products";

// Tracks product page views and increments view count in firestore (ensures only one count per session)
export default function ViewTracker({ productId }: { productId: string }) {
    useEffect(() => {
        const viewKey = `viewed_${productId}`;
        if (sessionStorage.getItem(viewKey)) return; // Already counted this session
        sessionStorage.setItem(viewKey, "true");
        incrementViewCount(productId);
    }, [productId]);

    return null; 
}