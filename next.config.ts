import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gw.alipayobjects.com',
      },
      {
        protocol: 'https',
        hostname: 'mdn.alipayobjects.com',
      },
    ],
  },
};

export default nextConfig;
