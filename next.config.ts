import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  // A stray package-lock.json in $HOME makes Next infer the wrong workspace root.
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
