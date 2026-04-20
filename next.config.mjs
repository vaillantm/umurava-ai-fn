/** @type {import('next').NextConfig} */
const nextConfig = {
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

export default nextConfig;
