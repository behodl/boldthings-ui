/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Use a completely different approach with rewrites
  async rewrites() {
    return [
      {
        source: '/.well-known/nostr.json',
        destination: '/api/nostr-verification',
      },
    ];
  },
  // Keep the headers for other potential static files
  async headers() {
    return [
      {
        source: '/.well-known/nostr.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
}

export default nextConfig
