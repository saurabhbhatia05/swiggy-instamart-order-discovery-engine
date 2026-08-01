/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow embedding in Streamlit iframe
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
