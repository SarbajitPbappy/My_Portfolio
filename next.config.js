/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Supabase Storage (uploaded profile image)
      { protocol: 'https', hostname: '**.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
  },
  // Old CV links (emails, the July build) keep working and land on the current CV.
  async redirects() {
    return [{ source: '/Bappy_CV_Official.pdf', destination: '/cv.pdf', permanent: true }]
  },
}

module.exports = nextConfig

