/**
 * Single source of truth for the REST API origin (no trailing slash).
 * Set NEXT_PUBLIC_API_BASE_URL in .env.local to match Postman {{BHL_url}}.
 */
const raw =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://10.10.7.65:5007/api/v1";

export const baseUrl = raw.replace(/\/+$/, ""); 