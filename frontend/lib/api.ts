/**
 * Typed client for the Glideearth backend API (Node.js/Express, Port 5000).
 *
 * All calls run server-side (Server Components), using `cache: "no-store"`
 * so the storefront always reflects the live database — this is a
 * data-driven catalog now, not static build-time content.
 */

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api/v1";

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  product_count: number;
  children: ApiCategory[];
}

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  regular_price: number;
  discount_price: number | null;
  effective_price: number;
  rating: number;
  badge: string | null;
  category_name: string;
  category_slug: string;
  primary_image_url: string | null;
  primary_image_alt: string | null;
}

export interface ApiProductImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface ApiProductDetail {
  id: string;
  name: string;
  slug: string;
  sku: string;
  short_description: string | null;
  description: string | null;
  regular_price: number;
  discount_price: number | null;
  effective_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  weight_grams: number | null;
  is_featured: boolean;
  rating: number;
  badge: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  images: ApiProductImage[];
}

/**
 * Fetch helper that talks to the Glideearth API and unwraps the standard
 * `{ success, message, data }` response envelope. Throws `ApiError` for
 * network failures, non-2xx responses, and `success: false` payloads, so
 * callers can catch a single error type and render a graceful fallback.
 */
async function apiFetch<T>(path: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });
  } catch {
    throw new ApiError(
      `Unable to reach the Glideearth API at ${API_BASE_URL}. Please confirm the backend server is running.`
    );
  }

  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await response.json()) as ApiEnvelope<T>;
  } catch {
    // Response wasn't valid JSON — `body` stays null, handled below.
  }

  if (!response.ok || !body?.success) {
    throw new ApiError(
      body?.message || `Request to "${path}" failed with status ${response.status}.`,
      response.status
    );
  }

  return body.data;
}

/** GET /categories — active storefront categories with live product counts. */
export function getCategories(): Promise<ApiCategory[]> {
  return apiFetch<ApiCategory[]>("/categories");
}

/** GET /products/featured — curated products for homepage showcases. */
export function getFeaturedProducts(limit = 4): Promise<ApiProduct[]> {
  return apiFetch<ApiProduct[]>(`/products/featured?limit=${limit}`);
}

/**
 * GET /products/:id — a single product for the Product Detail Page.
 * Accepts either a slug (preferred, SEO-friendly URLs) or a UUID.
 * Throws `ApiError` with `status: 404` when the product doesn't exist.
 */
export function getProductByIdentifier(identifier: string): Promise<ApiProductDetail> {
  return apiFetch<ApiProductDetail>(`/products/${encodeURIComponent(identifier)}`);
}
