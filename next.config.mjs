/** @type {import('next').NextConfig} */

// Uploaded files are stored on the backend's own disk and referenced in the DB
// by relative path (/uploads/...). The rewrite below proxies those paths to the
// API so they resolve same-origin — that keeps plain <img src="/uploads/..">
// working and, crucially, means the stored URLs survive a domain change.
// INTERNAL_API_URL lets Coolify route this hop over the internal network.
const API_URL =
  process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const nextConfig = {
  // Produce a self-contained server build (.next/standalone) for Docker/Coolify.
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${API_URL}/uploads/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        // Legacy: images uploaded before the move to self-hosted storage.
        // Safe to drop once the migration script has rewritten every URL.
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
    ],
  },
  // Enable React Strict Mode
  reactStrictMode: true,
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
