/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputFileTracingIncludes: {
      "/api/stats": ["./data/**/*"],
      "/api/research-questions": ["./data/**/*"],
      "/api/analyze": ["./data/**/*"],
      "/api/rag": ["./data/**/*"],
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Content-Security-Policy", value: "frame-ancestors *" }],
      },
    ];
  },
};

module.exports = nextConfig;
