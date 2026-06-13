// All browser requests go through the Next.js proxy (/api/v1/*) to avoid CORS.
// The proxy destination is configured in next.config.mjs rewrites.
export const baseUrl = "/api/v1";