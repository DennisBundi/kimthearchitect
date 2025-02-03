/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ahieansubrrmhinfib.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    domains: [
      'ahieansubrrmhhinfibb.supabase.co'  // Add your Supabase project domain
    ],
  },
  // Add other Next.js config options as needed
}

module.exports = nextConfig 