import { aiModel } from "@/lib/firebase";
import { Product } from "@/types/product.types";

// Prompt helpers
///////////////////////////////////////////////////////////////////////////////////////////////////
// Build a compact product catalog
function buildCatalog(products: Product[]) {
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    price: p.price,
    category: p.category,
    specs: p.specs,
    tags: p.tags,
    description: p.description,
  }));
}

// Extract a JSON array of IDs from a model response string
export function extractIds(text: string): string[] {
  try {
    const match = text.match(/\[[\s\S]*?\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    }
  } catch {

  }
  return [];
}
///////////////////////////////////////////////////////////////////////////////////////////////////

// AI prompts
///////////////////////////////////////////////////////////////////////////////////////////////////
export async function runTextSearch(query: string, products: Product[]): Promise<string[]> {
  const catalog = buildCatalog(products);

  const prompt = `You are a laptop recommendation AI for LaptopWRLD, a South African online laptop store. All prices are in ZAR (South African Rand).

Here is the complete product catalog:
${JSON.stringify(catalog, null, 2)}

User query: "${query}"

Analyse the query carefully for any of the following requirements: budget/price ceiling, use case (gaming, business, student, etc.), processor preferences, RAM requirements, GPU requirements, storage preferences, screen size, brand preferences, portability, OS, and any other relevant criteria.

Return ONLY a JSON array of product IDs, ranked from most relevant to least relevant. Only include products that meaningfully match the query. If no products match at all, return an empty array.

Respond with ONLY the JSON array, no explanation. Example: ["id1", "id2", "id3"]`;

  const result = await aiModel.generateContent(prompt);
  return extractIds(result.response.text());
}


export async function runImageSearch(imageFile: File, products: Product[]): Promise<string[]> {
  const catalog = buildCatalog(products);

  // Convert image to base64
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

  const prompt = `You are a laptop recommendation AI for LaptopWRLD, a South African online laptop store.

The user has uploaded an image of a laptop (or a screenshot of a laptop listing) they like. Find the most similar products from our catalog.

Our product catalog:
${JSON.stringify(catalog, null, 2)}

Analyse the uploaded image for: form factor, build quality, target use case (gaming, ultrabook, etc.), visible branding or model cues, display size estimate, and any visible specs.

Return ONLY a JSON array of product IDs ranked from most similar to least similar. If nothing is similar, return an empty array.

Respond with ONLY the JSON array. Example: ["id1", "id2", "id3"]`;

  const result = await aiModel.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: imageFile.type as
          | "image/jpeg"
          | "image/png"
          | "image/webp"
          | "image/gif",
        data: base64,
      },
    },
  ]);

  return extractIds(result.response.text());
}


export async function generateProductSummary(product: Product): Promise<string> {
  const prompt = `You are a helpful product copywriter for LaptopWRLD, a South African laptop store. Generate a clear, engaging, and concise AI-powered summary for the following laptop. The summary should highlight the key strengths, ideal use cases, and standout features for a customer who is deciding whether to buy it. Write in 3–5 sentences, in a friendly yet professional tone. Prices are in ZAR.

Product details:
Name: ${product.name}
Brand: ${product.brand}
Category: ${product.category}
Price: R${product.price.toLocaleString()}
Description: ${product.description}

Specifications:
- Processor: ${product.specs.processor}
- RAM: ${product.specs.ram}
- Storage: ${product.specs.storage}
- GPU: ${product.specs.gpu}
- Screen: ${product.specs.screenSize} — ${product.specs.display}
- OS: ${product.specs.os}
- Weight: ${product.specs.weight}

Tags: ${product.tags.join(", ")}

Write the summary now:`;

  const result = await aiModel.generateContent(prompt);
  return result.response.text().trim();
}
///////////////////////////////////////////////////////////////////////////////////////////////////
