import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  // React's <ViewTransition>. It is what makes a route change a transition
  // rather than a swap; every rule it drives lives in styles/motion.css.
  // Costs no runtime bytes of its own — the animation is the browser's.
  experimental: { viewTransition: true },
  // A stray package-lock.json in $HOME makes Next infer the wrong workspace root.
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
