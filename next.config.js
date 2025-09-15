/** @type {import('next').NextConfig} */
const nextConfig = {
  // External packages for server components
  serverExternalPackages: ['prisma', '@prisma/client'],
  
  // Environment-specific configuration
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  },
  
  // For shared hosting deployment
  trailingSlash: true,
  
  // Image optimization
  images: {
    unoptimized: true,
  },
  
  // Output configuration for different deployments
  ...(process.env.NODE_ENV === 'production' && process.env.DEPLOYMENT_TARGET === 'static' && {
    output: 'export',
  }),
}

module.exports = nextConfig