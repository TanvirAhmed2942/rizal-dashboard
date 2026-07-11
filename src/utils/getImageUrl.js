
/**
 * Get the full image URL from a path
 * Handles:
 * - Full URLs (http:// or https://) - returns as is
 * - Relative paths - prepends baseUrl
 * - Backslashes in paths - converts to forward slashes
 * - Null/undefined - returns fallback image
 *
 * @param {string} imagePath - The image path or URL
 * @param {string} fallback - Fallback image path (default: empty string)
 * @returns {string} The full image URL
 */
export const getImageUrl = (imagePath, fallback = "") => {
  // Return fallback if no image path provided
  if (!imagePath) {
    return fallback;
  }

  // If it's already a full URL (http or https), return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // If it's a data URL (base64), return as is
  if (imagePath.startsWith("data:")) {
    return imagePath;
  }


  if (imagePath.startsWith("blob:")) {
    return imagePath;
  }

  // For relative paths:
  // 1. Convert backslashes to forward slashes (Windows paths)
  // 2. Ensure it starts with a forward slash
  let normalizedPath = imagePath.replace(/\\/g, "/");
  if (!normalizedPath.startsWith("/")) {
    normalizedPath = "/" + normalizedPath;
  }

  console.log("normalizedPath", normalizedPath);

  // Construct full URL with base URL
  const apiBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL;

  return `${apiBaseUrl}${normalizedPath}`;
};

export default getImageUrl;
