/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://54.241.114.7:5000/api/v1";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiBase}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "10.10.7.65",
        port: "5003",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "10.10.7.79",
        port: "5003",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "10.10.7.107",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "bhl-storage.s3.eu-north-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "bhl-storage.s3.eu-north-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
