/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://143.110.196.243:3000',
  },
  // Configurações específicas para build estático
  distDir: 'out',
  generateBuildId: async () => {
    return 'build-' + Date.now()
  }
}

module.exports = nextConfig
