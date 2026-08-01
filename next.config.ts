import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Deployments can provide a stable revision; local builds remain reproducible.
  generateBuildId: async () => {
    return process.env.NEXT_BUILD_ID?.trim() || 'local';
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  // Ensure HTML pages are never cached by CDN/browser — prevents stale chunk URL errors
  async headers() {
    return [
      {
        // Apply no-cache to all HTML navigation requests
        source: '/((?!_next/static|_next/image|favicon.ico|assets).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
