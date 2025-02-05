/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ahieansubrrmhinfibh.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/project-images/**',
      },
    ],
  },
  output: 'standalone',
  // Add other Next.js config options as needed
}

module.exports = nextConfig 