import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const destinationUrl = process.env.BACKEND_URL || 'http://136.110.228.110/api';

    return [
      {
        source: '/api/:path*',
        destination: `${destinationUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;