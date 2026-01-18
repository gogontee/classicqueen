/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'prolgmzklxddnizyhqau.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;