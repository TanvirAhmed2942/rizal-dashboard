/**
 * Single source of truth for the REST API origin (no trailing slash).
 * Set NEXT_PUBLIC_API_BASE_URL in .env.local to match Postman {{BHL_url}}.
 */
const raw =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://54.241.114.7:5000/api/v1";

export const baseUrl = raw.replace(/\/+$/, ""); 