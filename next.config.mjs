import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['recharts']
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/.git/**',
          '**/.next/**',
          '**/node_modules/**',
          'C:/DumpStack.log.tmp',
          'C:/System Volume Information/**',
          'C:/hiberfil.sys',
          'C:/pagefile.sys',
          'C:/swapfile.sys'
        ]
      };
    }
    return config;
  }
};

export default withBundleAnalyzer(nextConfig);
